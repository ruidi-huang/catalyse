import test from "node:test";
import assert from "node:assert/strict";

import { toRunAgentErrorResponse } from "../lib/run-agent-error.ts";

test("maps current OpenAI model access failures to a clear computer-use message", () => {
  const result = toRunAgentErrorResponse("The model 'gpt-5.4' does not exist or you do not have access to it.");

  assert.deepEqual(result, {
    error: "Your current OpenAI API key does not have access to the OpenAI computer-use model required for this custom agent loop.",
    status: 500,
  });
});

test("maps screenshot format failures to a clear screenshot error", () => {
  const result = toRunAgentErrorResponse("The computer-use screenshot format was rejected.");

  assert.deepEqual(result, {
    error: "The computer-use screenshot format was rejected by the model.",
    status: 500,
  });
});

test("falls back to the generic retryable run-agent error", () => {
  const result = toRunAgentErrorResponse("Something unexpected happened.");

  assert.deepEqual(result, {
    error: "The BioRender run did not complete. Try the run again.",
    status: 500,
  });
});
