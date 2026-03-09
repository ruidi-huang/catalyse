"use client";

import { useMemo, useState, useTransition } from "react";

import type { FrozenPlan } from "@/lib/frozen-plan";

type StatusPhase =
  | "Idle"
  | "Researching company"
  | "Generating demo plan"
  | "Running BioRender agent"
  | "Draft generated"
  | "Error";

type GeneratePlanResult = {
  usedFallback: boolean;
  plan: FrozenPlan;
};

type ErrorResponse = {
  error?: string;
  ok?: boolean;
};

const STATUS_ORDER: StatusPhase[] = [
  "Idle",
  "Researching company",
  "Generating demo plan",
  "Running BioRender agent",
  "Draft generated",
  "Error",
];

const orgoWorkspaceUrl = process.env.NEXT_PUBLIC_ORGO_COMPUTER_ID
  ? `https://www.orgo.ai/workspaces/${process.env.NEXT_PUBLIC_ORGO_COMPUTER_ID}`
  : null;

function statusIndex(status: StatusPhase) {
  return STATUS_ORDER.indexOf(status);
}

function SectionCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <section className="rounded-[24px] border border-[color:var(--line)] bg-[color:var(--panel)] p-5 shadow-[0_18px_60px_rgba(36,29,14,0.08)]">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-[color:var(--muted)]">
        {label}
      </p>
      <p className="mt-3 text-sm leading-6 text-[color:var(--ink)] sm:text-[0.96rem]">
        {value}
      </p>
    </section>
  );
}

export default function Home() {
  const [companyUrl, setCompanyUrl] = useState("https://www.modernatx.com/");
  const [planResult, setPlanResult] = useState<GeneratePlanResult | null>(null);
  const [status, setStatus] = useState<StatusPhase>("Idle");
  const [error, setError] = useState<string | null>(null);
  const [useFallbackDraft, setUseFallbackDraft] = useState(false);
  const [isGenerating, startGenerating] = useTransition();
  const [isRunning, startRunning] = useTransition();

  const canRunAgent = Boolean(planResult?.plan.finalBioRenderPrompt) && !isRunning;

  const statusMessage = useMemo(() => {
    if (status === "Idle" && planResult) {
      return "Plan ready. Open the Orgo workspace in a separate tab if needed, then run the BioRender automation when you are ready.";
    }

    return error;
  }, [error, planResult, status]);

  async function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPlanResult(null);
    setStatus("Researching company");

    startGenerating(async () => {
      try {
        setStatus("Generating demo plan");

        const response = await fetch("/api/generate-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyUrl, useFallbackDraft }),
        });

        const data = (await response.json()) as GeneratePlanResult | ErrorResponse;

        if (!response.ok || !("plan" in data)) {
          const message =
            "error" in data && typeof data.error === "string"
              ? data.error
              : "Unable to generate the BioRender draft.";

          throw new Error(message);
        }

        setPlanResult(data);
        setStatus("Idle");
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to generate the BioRender draft.",
        );
        setStatus("Error");
      }
    });
  }

  async function runAgent() {
    if (!planResult) {
      return;
    }

    setError(null);
    setStatus("Running BioRender agent");

    startRunning(async () => {
      try {
        const response = await fetch("/api/run-agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            finalBioRenderPrompt: planResult.plan.finalBioRenderPrompt,
          }),
        });

        const data = (await response.json()) as ErrorResponse;

        if (!response.ok || !data.ok) {
          throw new Error(
            typeof data.error === "string"
              ? data.error
              : "Unable to run the BioRender agent.",
          );
        }

        setStatus("Draft generated");
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to run the BioRender agent.",
        );
        setStatus("Error");
      }
    });
  }

  return (
    <main className="min-h-screen bg-[color:var(--paper)] px-4 py-6 text-[color:var(--ink)] sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <section className="rounded-[32px] border border-[color:var(--line)] bg-[color:var(--panel-strong)] p-6 shadow-[0_24px_80px_rgba(36,29,14,0.12)] sm:p-8">
          <div className="max-w-2xl">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-[color:var(--accent)]">
              Autonomous Solutions Engineer for BioRender
            </p>
            <h1 className="mt-4 font-[family:var(--font-display)] text-4xl leading-tight sm:text-5xl">
              Generate one GTM-ready timeline draft, then run one BioRender automation.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[color:var(--muted-strong)] sm:text-[0.98rem]">
              Hackathon demo only. Frozen happy path: company URL in, BioRender
              timeline draft out, then a narrow Orgo run on the live VM.
            </p>
          </div>

          <form className="mt-8 space-y-4" onSubmit={handleGenerate}>
            <label className="block">
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-[color:var(--muted)]">
                Company URL
              </span>
              <input
                className="mt-3 w-full rounded-[20px] border border-[color:var(--line)] bg-white px-4 py-3 text-sm text-[color:var(--ink)] outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
                name="companyUrl"
                onChange={(event) => setCompanyUrl(event.target.value)}
                placeholder="https://www.modernatx.com/"
                value={companyUrl}
              />
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--ink)] px-5 py-3 text-sm font-semibold text-[color:var(--paper)] transition hover:bg-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isGenerating}
                type="submit"
              >
                {isGenerating ? "Generating..." : "Generate tailored BioRender draft"}
              </button>

              {planResult ? (
                <button
                  className="inline-flex items-center justify-center rounded-full border border-[color:var(--line-strong)] px-5 py-3 text-sm font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!canRunAgent}
                  onClick={runAgent}
                  type="button"
                >
                  {isRunning ? "Running..." : "Run in BioRender"}
                </button>
              ) : null}

              {orgoWorkspaceUrl ? (
                <a
                  className="inline-flex items-center justify-center rounded-full border border-[color:var(--line-strong)] px-5 py-3 text-sm font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
                  href={orgoWorkspaceUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open Orgo Workspace
                </a>
              ) : null}
            </div>

            <label className="flex items-start gap-3 rounded-[20px] border border-[color:var(--line)] bg-[color:var(--panel)] px-4 py-3">
              <input
                checked={useFallbackDraft}
                className="mt-1 h-4 w-4 accent-[color:var(--accent)]"
                onChange={(event) => setUseFallbackDraft(event.target.checked)}
                type="checkbox"
              />
              <span>
                <span className="block text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                  Quick test mode
                </span>
                <span className="mt-1 block text-sm leading-6 text-[color:var(--muted-strong)]">
                  Skip the OpenAI call and use the built-in Moderna fallback draft.
                </span>
              </span>
            </label>
          </form>

          <section className="mt-8 rounded-[24px] border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-[color:var(--muted)]">
                  Status
                </p>
                <p className="mt-3 text-xl font-semibold text-[color:var(--ink)]">
                  {status}
                </p>
              </div>
              {planResult?.usedFallback ? (
                <span className="rounded-full border border-[color:var(--accent-soft)] bg-[color:var(--accent-faint)] px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--accent)]">
                  Moderna fallback
                </span>
              ) : null}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {STATUS_ORDER.map((phase) => {
                const current = statusIndex(status);
                const phaseIndex = statusIndex(phase);
                const isActive = phase === status;
                const isComplete =
                  current > phaseIndex && status !== "Error" && phase !== "Error";

                return (
                  <span
                    className={`rounded-full border px-3 py-1 text-[0.72rem] font-medium ${
                      isActive
                        ? "border-[color:var(--accent)] bg-[color:var(--accent-faint)] text-[color:var(--accent)]"
                        : isComplete
                          ? "border-[color:var(--line-strong)] bg-white text-[color:var(--ink)]"
                          : "border-[color:var(--line)] bg-transparent text-[color:var(--muted)]"
                    }`}
                    key={phase}
                  >
                    {phase}
                  </span>
                );
              })}
            </div>

            {statusMessage ? (
              <p className="mt-4 text-sm leading-6 text-[color:var(--muted-strong)]">
                {statusMessage}
              </p>
            ) : null}
          </section>

          {planResult ? (
            <div className="mt-8 grid gap-4">
              <SectionCard label="Company" value={planResult.plan.companyName} />
              <SectionCard label="Summary" value={planResult.plan.companySummary} />
              <SectionCard
                label="Why BioRender fit"
                value={planResult.plan.whyBioRenderFit}
              />
              <SectionCard
                label="Buyer persona"
                value={planResult.plan.recommendedBuyerPersona}
              />
              <SectionCard
                label="Demo angle"
                value={planResult.plan.recommendedDemoAngle}
              />
              <SectionCard
                label="Recommended next step"
                value={planResult.plan.recommendedNextStep}
              />

              <section className="rounded-[24px] border border-[color:var(--line)] bg-[color:var(--panel)] p-5 shadow-[0_18px_60px_rgba(36,29,14,0.08)]">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-[color:var(--muted)]">
                  Final BioRender prompt
                </p>
                <p className="mt-3 text-sm leading-6 text-[color:var(--ink)] sm:text-[0.96rem]">
                  {planResult.plan.finalBioRenderPrompt}
                </p>
              </section>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
