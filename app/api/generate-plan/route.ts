import OpenAI from "openai";
import { NextResponse } from "next/server";

import { MODERNA_FALLBACK_PLAN } from "@/app/fallback-plan";
import {
  generatePlanBodySchema,
  generatePlanResponseSchema,
  frozenPlanSchema,
} from "@/lib/frozen-plan";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PLAN_TIMEOUT_MS = 30_000;

const SYSTEM_PROMPT = `You are generating a hackathon demo payload for a BioRender solutions engineering workflow.

Return strict JSON only. Do not wrap the JSON in markdown. Do not include commentary.

The JSON must match this exact shape:
{
  "companyName": string,
  "companyUrl": string,
  "companySummary": string,
  "whyBioRenderFit": string,
  "recommendedBuyerPersona": string,
  "recommendedDemoAngle": string,
  "recommendedNextStep": string,
  "figureType": "timeline",
  "title": string,
  "timelineSteps": [
    {
      "label": string,
      "description": string
    }
  ],
  "finalBioRenderPrompt": string
}

Rules:
- Use the provided company URL.
- Use web search if needed.
- Optimize for a BioRender GTM and solutions engineering demo.
- Always set figureType to "timeline".
- Produce 5 to 7 timeline steps.
- Keep all claims grounded in public information and likely workflows.
- Avoid proprietary or unverifiable claims.
- Make the finalBioRenderPrompt directly usable in BioRender's AI Timeline tool.
- Keep the output concise, presentation-friendly, and demo-ready.`;

function normalizeCompanyUrl(input: unknown): string {
  if (typeof input !== "string" || input.trim().length === 0) {
    throw new Error("Please enter a company URL.");
  }

  const url = new URL(input.trim());
  url.hash = "";

  return url.toString();
}

async function generatePlan(companyUrl: string) {
  const response = await openai.responses.create(
    {
      model: "gpt-5.4",
      tools: [{ type: "web_search" }],
      instructions: SYSTEM_PROMPT,
      input: `Research this company URL and return the frozen BioRender timeline payload as strict JSON only: ${companyUrl}`,
    },
    {
      signal: AbortSignal.timeout(PLAN_TIMEOUT_MS),
    },
  );

  return frozenPlanSchema.parse(JSON.parse(response.output_text));
}

export async function POST(request: Request) {
  let companyUrl: string;
  let useFallbackDraft = false;

  try {
    const body = generatePlanBodySchema.parse(await request.json());
    companyUrl = normalizeCompanyUrl(body.companyUrl);
    useFallbackDraft = body.useFallbackDraft;
  } catch {
    return NextResponse.json(
      { error: "Please enter a valid company URL." },
      { status: 400 },
    );
  }

  if (useFallbackDraft) {
    return NextResponse.json(
      generatePlanResponseSchema.parse({
        usedFallback: true,
        plan: MODERNA_FALLBACK_PLAN,
      }),
    );
  }

  try {
    const plan = await generatePlan(companyUrl);

    return NextResponse.json(
      generatePlanResponseSchema.parse({
        usedFallback: false,
        plan,
      }),
    );
  } catch (error) {
    console.error("generate-plan fallback", error);

    return NextResponse.json(
      generatePlanResponseSchema.parse({
        usedFallback: true,
        plan: MODERNA_FALLBACK_PLAN,
      }),
    );
  }
}
