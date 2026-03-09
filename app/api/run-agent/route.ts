import { NextResponse } from "next/server";

import { runAgentRequestSchema } from "@/lib/frozen-plan";
import { getRunAgentConfig } from "@/lib/run-agent-config";
import { toRunAgentErrorResponse } from "@/lib/run-agent-error";
import { runAgentLoop, RUN_AGENT_TIMEOUT_MS } from "@/lib/run-agent-loop";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { finalBioRenderPrompt } = runAgentRequestSchema.parse(body);
    const { canvasUrl, computerId, openAiApiKey, orgoApiKey } = getRunAgentConfig(process.env);

    await Promise.race([
      runAgentLoop({
        computerId,
        finalBioRenderPrompt,
        canvasUrl,
        openAiApiKey,
        orgoApiKey,
      }),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error("OpenAI computer-use loop timed out.")), RUN_AGENT_TIMEOUT_MS);
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("run-agent failed", error);

    const message =
      error instanceof Error ? error.message : "The BioRender run did not complete.";
    const mappedError = toRunAgentErrorResponse(message);

    return NextResponse.json(
      {
        ok: false,
        error: mappedError.error,
      },
      { status: mappedError.status },
    );
  }
}
