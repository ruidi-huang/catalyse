import { z } from "zod";

export const timelineStepSchema = z.object({
  label: z.string().min(1),
  description: z.string().min(1),
});

export const frozenPlanSchema = z.object({
  companyName: z.string().min(1),
  companyUrl: z.url(),
  companySummary: z.string().min(1),
  whyBioRenderFit: z.string().min(1),
  recommendedBuyerPersona: z.string().min(1),
  recommendedDemoAngle: z.string().min(1),
  recommendedNextStep: z.string().min(1),
  figureType: z.literal("timeline"),
  title: z.string().min(1),
  timelineSteps: z.array(timelineStepSchema).min(5).max(7),
  finalBioRenderPrompt: z.string().min(1),
});

export const generatePlanBodySchema = z.object({
  companyUrl: z.string().min(1),
  useFallbackDraft: z.boolean().optional().default(false),
});

export const generatePlanRequestSchema = z.object({
  companyUrl: z.url(),
  useFallbackDraft: z.boolean(),
});

export const generatePlanResponseSchema = z.object({
  usedFallback: z.boolean(),
  plan: frozenPlanSchema,
});

export const runAgentRequestSchema = z.object({
  finalBioRenderPrompt: z.string().min(1),
});

export type FrozenPlan = z.infer<typeof frozenPlanSchema>;
export type GeneratePlanResponse = z.infer<typeof generatePlanResponseSchema>;

export function parseFrozenPlanResponse(responseText: string): FrozenPlan {
  return frozenPlanSchema.parse(JSON.parse(responseText));
}
