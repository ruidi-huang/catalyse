"use client";

import { useState, useTransition } from "react";

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

const orgoWorkspaceUrl = process.env.NEXT_PUBLIC_ORGO_COMPUTER_ID
  ? `https://www.orgo.ai/workspaces/${process.env.NEXT_PUBLIC_ORGO_COMPUTER_ID}`
  : null;

function StatusLine({ status, error }: { status: StatusPhase; error: string | null }) {
  if (status === "Idle" && !error) return null;
  if (status === "Error" && error) {
    return (
      <p className="mt-3 flex items-center gap-2 text-xs text-[var(--danger)]">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--danger)]" />
        {error}
      </p>
    );
  }
  if (status === "Draft generated") {
    return (
      <p className="mt-3 flex items-center gap-2 text-xs text-[var(--accent)]">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
        Timeline draft created in BioRender
      </p>
    );
  }
  return (
    <p className="mt-3 flex items-center gap-2 text-xs text-[var(--text-muted)]">
      <span className="animate-pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
      {status}...
    </p>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      className="text-[0.65rem] uppercase tracking-widest text-[var(--text-muted)] transition hover:text-[var(--accent)]"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      type="button"
    >
      {copied ? "Copied" : "Copy"}
    </button>
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
    if (!planResult) return;

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

  const plan = planResult?.plan;

  return (
    <main className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        {/* ── Header ── */}
        <header className="mb-10">
          <h1 className="font-[family-name:var(--font-display)] text-5xl tracking-tight text-[var(--text)] sm:text-6xl">
            Catalyse
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Company URL <span className="text-[var(--text-dim)]">&rarr;</span> BioRender timeline draft
          </p>
        </header>

        {/* ── Input ── */}
        <form onSubmit={handleGenerate}>
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--text-dim)] outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-soft)]"
              name="companyUrl"
              onChange={(event) => setCompanyUrl(event.target.value)}
              placeholder="https://www.modernatx.com/"
              value={companyUrl}
            />
            <button
              className="whitespace-nowrap rounded-lg bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isGenerating}
              type="submit"
            >
              {isGenerating ? "Generating..." : "Generate"}
            </button>
          </div>

          <div className="mt-3 flex items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-[var(--text-dim)]">
              <input
                checked={useFallbackDraft}
                className="h-3 w-3 accent-[var(--accent)]"
                onChange={(event) => setUseFallbackDraft(event.target.checked)}
                type="checkbox"
              />
              Quick test
            </label>

            {planResult?.usedFallback && (
              <span className="rounded-full border border-[var(--border-strong)] px-2 py-0.5 text-[0.6rem] uppercase tracking-widest text-[var(--text-muted)]">
                Fallback
              </span>
            )}
          </div>

          <StatusLine status={status} error={error} />
        </form>

        {/* ── Results ── */}
        {plan && (
          <ResultsPanel
            plan={plan}
            canRunAgent={canRunAgent}
            isRunning={isRunning}
            onRunAgent={runAgent}
          />
        )}
      </div>
    </main>
  );
}

type ResultsTab = "prompt" | "research" | "timeline";

function ResultsPanel({
  plan,
  canRunAgent,
  isRunning,
  onRunAgent,
}: {
  plan: FrozenPlan;
  canRunAgent: boolean;
  isRunning: boolean;
  onRunAgent: () => void;
}) {
  const [tab, setTab] = useState<ResultsTab>("prompt");

  const tabs: { key: ResultsTab; label: string }[] = [
    { key: "prompt", label: "Prompt" },
    { key: "research", label: "Research" },
    { key: "timeline", label: "Timeline" },
  ];

  return (
    <div className="animate-fade-up mt-10">
      {/* Action bar + tabs */}
      <div className="flex items-center justify-between border-b border-[var(--border)]">
        <div className="flex gap-0">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`px-4 py-2.5 text-xs font-medium transition ${
                tab === t.key
                  ? "border-b-2 border-[var(--accent)] text-[var(--accent)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
              onClick={() => setTab(t.key)}
              type="button"
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {orgoWorkspaceUrl && (
            <a
              className="px-3 py-1.5 text-xs text-[var(--text-muted)] transition hover:text-[var(--accent)]"
              href={orgoWorkspaceUrl}
              rel="noreferrer"
              target="_blank"
            >
              Open Workspace
            </a>
          )}
          <button
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!canRunAgent}
            onClick={onRunAgent}
            type="button"
          >
            {isRunning ? "Running..." : "Run in BioRender"}
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="pt-6">
        {tab === "prompt" && (
          <div className="rounded-xl border border-[var(--accent-soft)] bg-[var(--accent-glow)] p-6">
            <div className="flex items-center justify-between">
              <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-[var(--accent)]">
                BioRender Prompt
              </p>
              <CopyButton text={plan.finalBioRenderPrompt} />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[var(--text)]">
              {plan.finalBioRenderPrompt}
            </p>
          </div>
        )}

        {tab === "research" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="text-lg font-medium text-[var(--text)]">{plan.companyName}</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                {plan.companySummary}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoBlock label="BioRender Fit" value={plan.whyBioRenderFit} />
              <InfoBlock label="Buyer Persona" value={plan.recommendedBuyerPersona} />
              <InfoBlock label="Demo Angle" value={plan.recommendedDemoAngle} />
              <InfoBlock label="Next Step" value={plan.recommendedNextStep} />
            </div>
          </div>
        )}

        {tab === "timeline" && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
              {plan.title}
            </p>
            <ol className="mt-5 space-y-4">
              {plan.timelineSteps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="mt-px font-semibold text-[var(--accent)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <span className="font-medium text-[var(--text)]">{step.label}</span>
                    <span className="text-[var(--text-muted)]"> &mdash; {step.description}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="text-[0.6rem] font-semibold uppercase tracking-widest text-[var(--text-dim)]">
        {label}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">{value}</p>
    </div>
  );
}
