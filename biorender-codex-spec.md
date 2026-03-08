# BioRender Enterprise Demo Agent - Codex Build Spec

## What this is

A hackathon demo app.

The only goal is to show one believable end-to-end magic trick:

- user enters a target company URL
- app researches the company
- app infers one relevant BioRender use case
- app generates one BioRender-ready prompt
- app shows a live Orgo VM in the app
- app triggers a narrow computer-use flow in BioRender
- BioRender creates a first draft

This is **not** a production product.
This is **not** a full GTM engine.
This is **not** a BioRender replacement.

## The product sentence

An autonomous solutions engineer for BioRender enterprise sales that takes a target company, infers the most relevant BioRender use case, and uses a live computer-use agent to generate a tailored first draft in BioRender for human review.

## Demo success criteria

The demo is successful if a viewer can see, in one run:

1. a company URL entered
2. a short company summary generated
3. a selected BioRender use case
4. a generated BioRender prompt
5. a live Orgo VM embedded in the app
6. the agent open BioRender and use the AI drafting tool
7. a first draft appear in BioRender

## Scope rules

- Optimize for **one happy path only**.
- Reliability on one path matters more than generality.
- One language only: **TypeScript**.
- Everything can live inside one Next.js app if that keeps things simpler.
- No database.
- No auth.
- No queues.
- No CRM integrations.
- No multi-user support.
- No arbitrary BioRender editing.
- No attempt to make the agent fully general.
- Human review at the end is acceptable and should be explicit.

## Main prioritization

The demo should show **visible autonomy**, not backend cleverness.

The wow factor is:

- account in
- tailored prompt out
- live computer-use on screen
- BioRender first draft appears

Do not overbuild the research layer.
Do not overbuild the automation layer.
Do not chase polish before the happy path works.

## Figure type decision

Use **Timeline** as the default happy path.

Reason:

- BioRender publicly supports AI drafting for protocol, timeline, and flowchart.
- Flowchart is newer and riskier.
- Timeline is easier to keep legible for enterprise demos.
- Timeline is easier to explain to judges and BioRender staff.

Fallback:

- If Timeline is unreliable in manual testing, switch to **Protocol**.
- Do not support multiple figure types in the UI in the first pass.

## Recommended target account

Use one target account with a clear scientific communication workflow.
Examples:

- biotech company
- pharma company
- diagnostics company
- CRO / research organization

The system only needs to work on one or two realistic account types.
Do not try to generalize broadly.

## Stack

Keep the stack minimal and uniform.

### App

- Next.js App Router
- TypeScript
- Tailwind CSS
- Next.js Route Handlers for backend endpoints
- npm

### Packages

- `orgo`
- `orgo-vnc`
- `zod`
- one LLM SDK only: `openai`

### Do not add

- Prisma
- Supabase
- LangChain
- Zustand / Redux
- tRPC
- socket frameworks unless absolutely needed
- any second backend language or service unless blocked

## Why one language

Use **TypeScript only** unless there is a hard blocker.

Reason:

- simpler for Codex
- simpler local setup
- fewer environment mismatch issues
- easier to keep all logic in one repo
- easier to ship one demo app fast

## Versioning strategy

Do **not** guess semver numbers manually.
Use the official install commands and let the lockfile capture the actual stable versions installed today.

## Bootstrap commands

Used the official Next.js generator.

```bash
npx create-next-app@latest biorender-ai --typescript --tailwind --eslint --app --use-npm
```

## Node requirement

Use Node.js >= 20.9.

## Environment variables

Create `.env.local` with placeholders like:

```bash
ORGO_API_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_ORGO_COMPUTER_HOST=
NEXT_PUBLIC_ORGO_COMPUTER_PASSWORD=
BIORENDER_EMAIL=
BIORENDER_PASSWORD=
```

Notes:

- if using an already logged-in Orgo computer, BioRender login can be manual
- if attaching to an existing Orgo computer, host/password come from that computer

## Single-page app layout

The app should be a single page with these sections:

1. Company URL input
2. Generate Demo button
3. Company summary panel
4. Selected use case panel
5. Generated BioRender prompt panel
6. Live Orgo VM panel
7. Action log / progress panel

## Golden path

1. user enters a company URL
2. app calls a route to research the company
3. route returns:
   - company name
   - company type
   - short summary
   - likely audience
   - recommended BioRender use case
   - figure type (`timeline` by default)
   - BioRender prompt
4. app displays the summary and prompt
5. app attaches to an Orgo computer or starts one
6. app shows the embedded live VM
7. app triggers a narrow Orgo task:
   - open browser if needed
   - open BioRender Canvas
   - click AI button
   - choose Timeline generation
   - paste the generated prompt
   - click generate
8. live VM shows the steps
9. first draft appears in BioRender
10. app shows success state

## Very important automation limits

The Orgo/BioRender automation should **not** try to:

- browse BioRender generally
- deep edit the layout
- replace icons manually
- drag many objects around
- perform arbitrary polishing
- support multiple branching retries
- generalize beyond the exact golden path

This is a controlled demo, not a general-purpose agent.

## Company research output contract

The research step should be small and structured.

Use this TypeScript shape:

```ts
export type AccountResearch = {
  companyName: string;
  companyType: string;
  summary: string;
  audience: string;
  recommendedUseCase: string;
  figureType: "timeline" | "protocol";
  biorenderPrompt: string;
};
```

## Research behavior

- fetch homepage HTML or visible page text from the target URL
- extract only enough context to infer one BioRender-relevant use case
- avoid long reports
- prefer deterministic structured output over creativity

## Prompt generation behavior

The BioRender prompt should be rigid and short.

It should include:

- title
- purpose
- audience
- 5 to 7 steps max
- instruction to create a simple editable first draft
- enterprise-demo orientation

### Example prompt shape

```text
Create a timeline figure for [Company Name].
Audience: enterprise buyer / solutions engineer demo.
Purpose: show a relevant BioRender workflow this company could use.
Include these stages:
1. ...
2. ...
3. ...
4. ...
5. ...
Keep the result simple, editable, and presentation-ready.
```

## App structure suggestion

Use a very simple structure.

```text
app/
  page.tsx
  api/
    research/route.ts
    run-demo/route.ts
components/
  company-form.tsx
  summary-panel.tsx
  prompt-panel.tsx
  vm-panel.tsx
  action-log.tsx
lib/
  account-research.ts
  prompt-generator.ts
  orgo.ts
  types.ts
```

## Route responsibilities

### `POST /api/research`

Input:

```json
{ "companyUrl": "https://example.com" }
```

Output:
`AccountResearch`

This route should:

- fetch the company site
- extract visible text
- call the LLM once
- return structured JSON

### `POST /api/run-demo`

Input:

```json
{
  "companyUrl": "https://example.com",
  "research": { ...AccountResearch }
}
```

Output can be simple, for example:

```json
{
  "ok": true,
  "computerUrl": "...",
  "message": "Demo task started"
}
```

This route should:

- connect to Orgo
- run the narrow automation task on the VM
- report simple status / errors

## Orgo guidance

Assume Orgo is the visible execution layer.

Use it for:

- hosting the virtual computer
- showing the live VM in the app
- running the narrow BioRender task

Keep the Orgo logic small.

### Ideal Orgo flow

- connect to a preconfigured computer or template
- ensure browser is open
- open BioRender
- run a single natural-language task or a very small deterministic sequence
- do not attempt many autonomous corrections

### Manual fallback allowed

If the agent is flaky, it is acceptable for the demo to:

- reuse a pre-logged-in VM
- reuse a pre-open BioRender tab
- use a fixed prompt template
- rely on one manual refresh or one manual resume step

## Preferred provider

Default to **OpenAI** first if that is the easiest route for the Orgo demo today.
If Anthropic is more stable with your Orgo setup in practice, switch once and do not support both.

## UI state model

Keep the UI state tiny.
For example:

```ts
type DemoStatus =
  | "idle"
  | "researching"
  | "research-complete"
  | "launching-vm"
  | "running-agent"
  | "done"
  | "error";
```

## What Codex should optimize for

- fastest path to one working happy path
- readable code
- low dependency count
- clear logging
- easy manual testing
- easy fallback if live agent fails

## What Codex should not optimize for

- perfect abstractions
- production architecture
- generic frameworks
- perfect typing everywhere if it slows progress
- beautiful design before the flow works
- extensibility

## Acceptance checklist

The app is ready when:

- it boots locally
- a company URL can be entered
- research output appears
- a BioRender prompt appears
- an Orgo VM is visible in the app
- the run-demo action triggers visible steps in the VM
- BioRender produces a first draft on the happy path

## Nice-to-have only if time remains

- a final screenshot capture button
- a canned example URL button
- a mock research mode for safer rehearsals
- lightweight transcript of agent actions

## Critical fallback plan

Codex should leave room for fallback paths.

If live automation fails during demo, you should still be able to show:

- the company research output
- the generated BioRender prompt
- a visible Orgo VM
- a pre-recorded or previously completed happy path

## Manual tasks for the human operator in parallel

While Codex builds, the human operator should:

1. choose the target company
2. manually test Timeline generation in BioRender
3. confirm the exact click path and waits
4. prepare an Orgo computer that is already logged into BioRender if possible
5. capture a backup video or screenshots
6. craft one gold-standard prompt manually as fallback

## Notes for implementation

- Keep all logic in one repo.
- Keep all secrets in env vars.
- Prefer server-side route handlers for API key usage.
- Use the Orgo React embed component for the VM if convenient.
- Do not chase pixel-perfect design.
- Demo reliability beats elegance.

## First to do now

```bash
npx create-next-app@latest
```

has already been ran and cleaned up boilerplate.

Then:

1. create `.env.local`
2. wire a minimal single-page UI
3. build `/api/research`
4. get Orgo VM embedding working
5. build `/api/run-demo`
6. test the happy path on one target company only

Let the user know anything they need to do on t
