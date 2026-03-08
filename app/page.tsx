const panels = [
  {
    title: "Company Summary",
    description: "Research output will land here once the happy path is wired.",
  },
  {
    title: "Selected Use Case",
    description: "Pin the BioRender story you want the demo to tell.",
  },
  {
    title: "BioRender Prompt",
    description: "Keep the generated prompt visible, short, and easy to copy.",
  },
  {
    title: "Live Orgo VM",
    description: "Reserve this surface for the embedded VM and visible autonomy.",
  },
  {
    title: "Action Log",
    description: "Show the narrow agent steps so the demo feels trustworthy.",
  },
] as const;

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-10 text-neutral-950 sm:px-10 lg:px-14">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,255,255,0.55))] p-8 shadow-[0_20px_80px_rgba(0,0,0,0.06)] backdrop-blur md:p-10">
          <div className="mb-8 flex items-center justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
              BioRender hackathon shell
            </p>
            <div className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-3 py-1 text-xs text-[var(--muted)]">
              single happy path
            </div>
          </div>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)]">
            <div className="space-y-5">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
                Clean start for the BioRender enterprise demo.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
                The starter boilerplate is gone. This shell is ready for one
                believable flow: company in, research out, prompt generated,
                live VM on screen, draft appears.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--panel)] p-5">
              <p className="mb-3 text-sm font-medium text-[var(--muted)]">
                Company URL
              </p>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
                <input
                  aria-label="Company URL"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
                  placeholder="https://target-company.com"
                  type="url"
                />
              </div>
              <button
                className="mt-4 w-full rounded-full bg-neutral-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                type="button"
              >
                Generate Demo
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          {panels.map((panel) => (
            <article
              key={panel.title}
              className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] backdrop-blur"
            >
              <div className="mb-10 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold tracking-[-0.03em]">
                    {panel.title}
                  </h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                    {panel.description}
                  </p>
                </div>
                <span className="rounded-full border border-[var(--border)] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
                  empty
                </span>
              </div>
              <div className="min-h-40 rounded-[1.25rem] border border-dashed border-[var(--border)] bg-[var(--panel-strong)]" />
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
