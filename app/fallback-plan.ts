import type { FrozenPlan } from "../lib/frozen-plan";

export const MODERNA_FALLBACK_PLAN: FrozenPlan = {
  companyName: "Moderna",
  companyUrl: "https://www.modernatx.com/",
  companySummary:
    "Moderna is a biotechnology company focused on developing medicines using its mRNA platform. Its public story is centered on turning programmable mRNA science into a repeatable drug development engine across multiple therapeutic areas, including oncology.",
  whyBioRenderFit:
    "BioRender is a strong fit because Moderna needs clear scientific communication across research, platform, clinical, and leadership contexts. A concise visual timeline helps translate complex mRNA development workflows into a format that internal teams and external stakeholders can understand quickly.",
  recommendedBuyerPersona:
    "Scientific communications lead, translational biology lead, platform strategy lead, or an enterprise champion responsible for communicating complex R&D workflows to cross-functional teams.",
  recommendedDemoAngle:
    "Show how BioRender can turn a complex mRNA oncology workflow into a leadership-ready timeline that is easy to understand, edit, and reuse across presentations and internal planning discussions.",
  recommendedNextStep:
    "Use this generated timeline as a first-pass account-specific demo artifact, review it with a human seller or solutions engineer, then refine it live for the prospect’s exact team, audience, and scientific focus.",
  figureType: "timeline" as const,
  title: "High-Level mRNA Oncology Development Timeline",
  timelineSteps: [
    {
      label: "Platform Research",
      description:
        "Define the therapeutic concept and align the program with Moderna's broader mRNA platform strategy.",
    },
    {
      label: "Target Selection",
      description:
        "Select the oncology target and establish the biological rationale for an mRNA-based approach.",
    },
    {
      label: "Sequence Design",
      description:
        "Design and optimize the mRNA construct for the intended therapeutic objective.",
    },
    {
      label: "Preclinical Validation",
      description:
        "Evaluate the construct in preclinical studies to assess expression, activity, and early development feasibility.",
    },
    {
      label: "Manufacturing & Quality Review",
      description:
        "Prepare the program for scale-up by aligning process development, quality review, and readiness planning.",
    },
    {
      label: "Clinical Study Launch",
      description:
        "Advance the program into a clinical study with a clear cross-functional development timeline.",
    },
    {
      label: "Follow-up Analysis",
      description:
        "Review study outcomes and feed insights back into future platform and program decisions.",
    },
  ],
  finalBioRenderPrompt:
    "Create a timeline for a biotech leadership audience showing a high-level mRNA oncology development workflow. Include these stages: platform research, target selection, sequence design, preclinical validation, manufacturing and quality review, clinical study launch, and follow-up analysis. Keep it clear, presentation-ready, and easy to edit.",
};
