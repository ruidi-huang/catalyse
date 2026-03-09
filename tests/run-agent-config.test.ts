import test from "node:test";
import assert from "node:assert/strict";

import { getRunAgentConfig } from "../lib/run-agent-config.ts";

test("reads separate OpenAI and Orgo API keys for the run-agent flow", () => {
  const config = getRunAgentConfig({
    OPENAI_API_KEY: "openai-key",
    ORGO_API_KEY: "orgo-key",
    NEXT_PUBLIC_ORGO_COMPUTER_ID: "computer-id",
    NEXT_PUBLIC_BIORENDER_CANVAS_URL: "https://app.biorender.com/canvas/demo",
  });

  assert.deepEqual(config, {
    canvasUrl: "https://app.biorender.com/canvas/demo",
    computerId: "computer-id",
    openAiApiKey: "openai-key",
    orgoApiKey: "orgo-key",
  });
});

test("uses the default canvas description when no canvas url env var is set", () => {
  const config = getRunAgentConfig({
    OPENAI_API_KEY: "openai-key",
    ORGO_API_KEY: "orgo-key",
    NEXT_PUBLIC_ORGO_COMPUTER_ID: "computer-id",
  });

  assert.equal(config.canvasUrl, "the current BioRender canvas");
});

test("throws if either the OpenAI or Orgo credential is missing", () => {
  assert.throws(
    () =>
      getRunAgentConfig({
        ORGO_API_KEY: "orgo-key",
        NEXT_PUBLIC_ORGO_COMPUTER_ID: "computer-id",
      }),
    /OPENAI_API_KEY/,
  );

  assert.throws(
    () =>
      getRunAgentConfig({
        OPENAI_API_KEY: "openai-key",
        NEXT_PUBLIC_ORGO_COMPUTER_ID: "computer-id",
      }),
    /ORGO_API_KEY/,
  );
});
