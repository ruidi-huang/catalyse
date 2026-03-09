import test from "node:test";
import assert from "node:assert/strict";

import { MODERNA_FALLBACK_PLAN } from "../app/fallback-plan.ts";
import {
  frozenPlanSchema,
  generatePlanBodySchema,
  parseFrozenPlanResponse,
} from "../lib/frozen-plan.ts";

test("validates the Moderna fallback payload", () => {
  const parsed = frozenPlanSchema.parse(MODERNA_FALLBACK_PLAN);

  assert.equal(parsed.companyName, "Moderna");
  assert.equal(parsed.figureType, "timeline");
  assert.equal(parsed.timelineSteps.length, 7);
});

test("rejects payloads with the wrong figure type", () => {
  assert.throws(() => {
    frozenPlanSchema.parse({
      ...MODERNA_FALLBACK_PLAN,
      figureType: "pathway",
    });
  });
});

test("rejects payloads with too few timeline steps", () => {
  assert.throws(() => {
    frozenPlanSchema.parse({
      ...MODERNA_FALLBACK_PLAN,
      timelineSteps: MODERNA_FALLBACK_PLAN.timelineSteps.slice(0, 4),
    });
  });
});

test("parses strict JSON text into the frozen payload shape", () => {
  const parsed = parseFrozenPlanResponse(JSON.stringify(MODERNA_FALLBACK_PLAN));

  assert.equal(parsed.title, MODERNA_FALLBACK_PLAN.title);
  assert.equal(parsed.timelineSteps[0]?.label, "Platform Research");
});

test("accepts the quick-test fallback toggle on generate-plan input", () => {
  const parsed = generatePlanBodySchema.parse({
    companyUrl: "https://www.modernatx.com/",
    useFallbackDraft: true,
  });

  assert.equal(parsed.companyUrl, "https://www.modernatx.com/");
  assert.equal(parsed.useFallbackDraft, true);
});
