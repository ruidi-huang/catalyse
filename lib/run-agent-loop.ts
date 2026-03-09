import OpenAI from "openai";
import type { Responses } from "openai/resources/responses/responses";
import { Computer } from "orgo";

const COMPUTER_USE_MODEL = "gpt-5.4";
const COMPUTER_USE_TOOL = { type: "computer" } as const;
const MAX_AGENT_ITERATIONS = 24;
const RUN_AGENT_TIMEOUT_MS = 120_000;

type ComputerAction = NonNullable<Responses.ResponseComputerToolCall["action"]>;

type RunAgentLoopArgs = {
  computerId: string;
  finalBioRenderPrompt: string;
  canvasUrl: string;
  openAiApiKey: string;
  orgoApiKey: string;
};

type ComputerCallOutput = {
  acknowledged_safety_checks?: Array<{ id: string }>;
  call_id: string;
  output: {
    detail: "original";
    image_url: string;
    type: "computer_screenshot";
  };
  type: "computer_call_output";
};

function getActionList(
  item: Responses.ResponseComputerToolCall,
): ComputerAction[] {
  if (item.actions?.length) {
    return item.actions;
  }

  return item.action ? [item.action] : [];
}

function buildInstruction(finalBioRenderPrompt: string, canvasUrl: string) {
  return `You are already inside a logged-in BioRender session on an Ubuntu desktop. Complete only this narrow workflow:

1. Focus the already-open BioRender canvas tab or page for ${canvasUrl}.
2. Click the AI button.
3. Choose Timeline, if not see then scroll down when cursor is in the area of AI panel.
4. Paste this prompt exactly:
${finalBioRenderPrompt}
5. Click Generate.
6. Wait until the generated timeline appears on the canvas.
7. Stop immediately once the timeline is visible.

Hard constraints:
- Do not log in.
- Do not open unrelated pages.
- Do not edit the generated result after it appears.
- Stay on the existing BioRender happy path only.
- Keep actions minimal and direct.`;
}

export function normalizeKeypress(keys: string[]) {
  if (keys.length === 1) {
    return normalizeSingleKey(keys[0] ?? "");
  }

  return keys.map((key) => normalizeComboKey(key)).join("+");
}

function normalizeSingleKey(key: string) {
  const upperKey = key.toUpperCase();

  switch (upperKey) {
    case "ENTER":
      return "Enter";
    case "TAB":
      return "Tab";
    case "ESC":
    case "ESCAPE":
      return "Escape";
    case "BACKSPACE":
      return "Backspace";
    case "DELETE":
      return "Delete";
    case "SPACE":
      return "Space";
    case "ARROWUP":
      return "ArrowUp";
    case "ARROWDOWN":
      return "ArrowDown";
    case "ARROWLEFT":
      return "ArrowLeft";
    case "ARROWRIGHT":
      return "ArrowRight";
    default:
      return key.length === 1 ? key : key.toLowerCase();
  }
}

function normalizeComboKey(key: string) {
  const upperKey = key.toUpperCase();

  switch (upperKey) {
    case "CTRL":
    case "CONTROL":
      return "ctrl";
    case "SHIFT":
      return "shift";
    case "ALT":
      return "alt";
    case "CMD":
    case "COMMAND":
    case "META":
      return "meta";
    default:
      return normalizeSingleKey(key).toLowerCase();
  }
}

export function scrollAmountFromPixels(distance: number) {
  return Math.max(1, Math.round(Math.abs(distance) / 120));
}

export function getWaitDurationSeconds(
  action: ComputerAction & { type: "wait" },
) {
  return typeof action.seconds === "number" && action.seconds > 0
    ? action.seconds
    : 1;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function buildComputerCallOutput(args: {
  acknowledgedSafetyCheckIds: string[];
  callId: string;
  screenshotBase64: string;
}): ComputerCallOutput {
  return {
    ...(args.acknowledgedSafetyCheckIds.length
      ? {
          acknowledged_safety_checks: args.acknowledgedSafetyCheckIds.map(
            (id) => ({
              id,
            }),
          ),
        }
      : {}),
    call_id: args.callId,
    output: {
      detail: "original",
      image_url: `data:image/png;base64,${args.screenshotBase64}`,
      type: "computer_screenshot",
    },
    type: "computer_call_output",
  };
}

export function actionToLogLabel(action: ComputerAction) {
  switch (action.type) {
    case "click":
      return `click(${action.x},${action.y})`;
    case "double_click":
      return `double_click(${action.x},${action.y})`;
    case "type":
      return `type("${action.text.slice(0, 40)}")`;
    case "keypress":
      return `keypress(${action.keys.join("+")})`;
    case "scroll":
      return `scroll(${action.scroll_x},${action.scroll_y})`;
    case "drag":
      return `drag(${action.path.length})`;
    case "move":
      return `move(${action.x},${action.y})`;
    case "screenshot":
      return "screenshot";
    case "wait":
      return "wait";
    default:
      return "unknown";
  }
}

async function executeAction(computer: Computer, action: ComputerAction) {
  switch (action.type) {
    case "click":
      if (action.button === "right") {
        await computer.rightClick(action.x, action.y);
      } else {
        await computer.leftClick(action.x, action.y);
      }
      return;
    case "double_click":
      await computer.doubleClick(action.x, action.y);
      return;
    case "drag": {
      const start = action.path[0];
      const end = action.path[action.path.length - 1];

      if (!start || !end) {
        return;
      }

      await computer.drag(start.x, start.y, end.x, end.y);
      return;
    }
    case "keypress":
      await computer.key(normalizeKeypress(action.keys));
      return;
    case "move":
      return;
    case "scroll": {
      const dominantDistance =
        Math.abs(action.scroll_y) >= Math.abs(action.scroll_x)
          ? action.scroll_y
          : action.scroll_x;
      const direction = dominantDistance >= 0 ? "down" : "up";
      await computer.scroll(
        direction,
        scrollAmountFromPixels(dominantDistance),
      );
      return;
    }
    case "type":
      await computer.type(action.text);
      return;
    case "wait":
      await sleep(getWaitDurationSeconds(action) * 1000);
      return;
    case "screenshot":
      return;
    default:
      throw new Error(
        `Unsupported computer action: ${(action as { type: string }).type}`,
      );
  }
}

function getComputerCalls(response: OpenAI.Responses.Response) {
  return response.output.filter(
    (item): item is Responses.ResponseComputerToolCall =>
      item.type === "computer_call",
  );
}

async function continueComputerCall(args: {
  client: OpenAI;
  computer: Computer;
  response: OpenAI.Responses.Response;
}) {
  const computerCalls = getComputerCalls(args.response);

  if (computerCalls.length === 0) {
    return null;
  }

  const outputs: ComputerCallOutput[] = [];

  for (const computerCall of computerCalls) {
    const actions = getActionList(computerCall);

    for (const action of actions) {
      console.log("[run-agent] action", actionToLogLabel(action));
      await executeAction(args.computer, action);
    }

    const screenshotBase64 = await args.computer.screenshotBase64();
    outputs.push(
      buildComputerCallOutput({
        acknowledgedSafetyCheckIds: (
          computerCall.pending_safety_checks ?? []
        ).map((check) => check.id),
        callId: computerCall.call_id,
        screenshotBase64,
      }),
    );
  }

  return args.client.responses.create({
    model: COMPUTER_USE_MODEL,
    previous_response_id: args.response.id,
    input: outputs,
    tools: [COMPUTER_USE_TOOL],
  });
}

export async function runAgentLoop(args: RunAgentLoopArgs) {
  const client = new OpenAI({ apiKey: args.openAiApiKey });
  const computer = await Computer.create({
    apiKey: args.orgoApiKey,
    computerId: args.computerId,
    verbose: false,
  });

  const firstResponse = await client.responses.create({
    model: COMPUTER_USE_MODEL,
    input: buildInstruction(args.finalBioRenderPrompt, args.canvasUrl),
    reasoning: { effort: "medium" },
    tools: [COMPUTER_USE_TOOL],
    truncation: "auto",
  });

  let currentResponse: OpenAI.Responses.Response | null = firstResponse;
  let iterations = 0;

  while (currentResponse && iterations < MAX_AGENT_ITERATIONS) {
    iterations += 1;
    console.log(
      "[run-agent] iteration",
      iterations,
      currentResponse.output_text || "",
    );

    currentResponse = await continueComputerCall({
      client,
      computer,
      response: currentResponse,
    });
  }

  if (iterations >= MAX_AGENT_ITERATIONS) {
    throw new Error("OpenAI computer-use loop exceeded the iteration limit.");
  }

  return { ok: true, timeoutMs: RUN_AGENT_TIMEOUT_MS };
}

export { COMPUTER_USE_MODEL, COMPUTER_USE_TOOL, RUN_AGENT_TIMEOUT_MS };
