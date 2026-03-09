import test from "node:test";
import assert from "node:assert/strict";

import {
  actionToLogLabel,
  buildComputerCallOutput,
  COMPUTER_USE_MODEL,
  COMPUTER_USE_TOOL,
  getWaitDurationSeconds,
  normalizeKeypress,
  scrollAmountFromPixels,
} from "../lib/run-agent-loop.ts";

test("normalizes multi-key shortcuts for Orgo", () => {
  assert.equal(normalizeKeypress(["CTRL", "SHIFT", "T"]), "ctrl+shift+t");
  assert.equal(normalizeKeypress(["ENTER"]), "Enter");
});

test("converts scroll pixels into Orgo scroll amount", () => {
  assert.equal(scrollAmountFromPixels(25), 1);
  assert.equal(scrollAmountFromPixels(240), 2);
  assert.equal(scrollAmountFromPixels(-390), 3);
});

test("builds a PNG computer_call_output item with acknowledged safety checks", () => {
  const item = buildComputerCallOutput({
    acknowledgedSafetyCheckIds: ["safe_123"],
    callId: "call_123",
    screenshotBase64: "iVBORw0KGgoAAAANSUhEUgAAAAUA",
  });

  assert.deepEqual(item, {
    acknowledged_safety_checks: [{ id: "safe_123" }],
    call_id: "call_123",
    output: {
      detail: "original",
      image_url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA",
      type: "computer_screenshot",
    },
    type: "computer_call_output",
  });
});

test("creates readable action labels for logging", () => {
  assert.equal(actionToLogLabel({ type: "click", x: 10, y: 20, button: "left" }), "click(10,20)");
  assert.equal(actionToLogLabel({ type: "type", text: "hello" }), 'type("hello")');
});

test("uses the current GA OpenAI computer-use model and tool shape", () => {
  assert.equal(COMPUTER_USE_MODEL, "gpt-5.4");
  assert.deepEqual(COMPUTER_USE_TOOL, { type: "computer" });
});

test("uses a safe local wait fallback when the model does not specify a duration", () => {
  assert.equal(getWaitDurationSeconds({ type: "wait" }), 1);
  assert.equal(getWaitDurationSeconds({ type: "wait", seconds: 3 }), 3);
  assert.equal(getWaitDurationSeconds({ type: "wait", seconds: 0 }), 1);
});
