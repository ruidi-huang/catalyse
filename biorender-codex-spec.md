# BioRender Agent Demo - Frozen Codex Spec

## Goal

Build a hackathon demo web app called **Autonomous Solutions Engineer for BioRender**.

The app takes **one company URL** as input, uses **one OpenAI Responses API call** with **web search** to research the company and generate a tailored **BioRender timeline draft prompt**, then triggers a narrow Orgo-backed computer-use flow against an already-open BioRender session:

1. Open an already-open BioRender draft page URL
2. Click the AI button
3. Choose **Timeline**
4. Paste the generated prompt
5. Click Generate
6. Stop

The demo succeeds when **a generated timeline appears in BioRender** and the app shows a **human-friendly GTM research summary** plus the **final BioRender prompt**.

Implementation note for future context:
- the app no longer embeds the live Orgo VM in-page
- the Orgo workspace is opened separately in another tab/window for the demo
- reason: Orgo added an origin firewall that only allowed websocket traffic from `www.orgo.ai`, which blocked local/demo-domain VNC embedding, and this was out of app scope to fix during the hackathon

This is a **demo-only** build. Optimize for **one happy path**.

---

## Frozen Product Decisions

- **Input type:** company URL only
- **Primary demo company:** `https://www.modernatx.com/`
- **BioRender artifact type:** Timeline only
- **OpenAI model:** `gpt-5.4`
- **OpenAI API:** Responses API with built-in `web_search`
- **Output mode:** one structured response rendered as human-friendly cards in the UI
- **Agent infra:** Orgo only for the BioRender UI step
- **Research:** one OpenAI call only, no separate scraping pipeline, no deep research, no multi-step agent research
- **BioRender login:** handled manually by the human before demo
- **BioRender start state:** a specific BioRender draft page URL is already open and logged in
- **No backend database**
- **No auth**
- **No queues**
- **No deployment work unless time remains**
- **Fallback behavior:** if the research call fails or returns invalid output, return a hardcoded Moderna fallback draft and keep the UI usable

---

## Tech Stack

- **Next.js** app already initialized
- **TypeScript only**
- **App Router**
- **Tailwind CSS**
- **OpenAI Node SDK**
- **Orgo SDK**
- **Zod** for schema validation

Do not introduce Python, a database, or extra infra.

---

## User Flow

### Step 1

User lands on a single-page app and pastes a company URL.

### Step 2

User clicks one button: **Generate tailored BioRender draft**.

### Step 3

Server runs one OpenAI Responses API call with:

- model: `gpt-5.4`
- tools: `web_search`
- structured output schema

### Step 4

App receives a structured output object containing:

- company summary
- why BioRender is relevant
- recommended buyer persona
- recommended demo angle
- recommended next GTM step
- chosen figure type (`timeline` only)
- title
- timeline steps
- final BioRender prompt

### Step 5

App displays the human-friendly research summary immediately.

### Step 6

App shows the generated prompt and provides an **Open Orgo Workspace** path for the live demo view, while the server triggers the narrow computer-use run separately.

### Step 7

Agent performs only the BioRender generation path and stops.

### Step 8

User sees the generated timeline draft in BioRender.

---

## Strict Scope Boundaries

### What the app must do

- Accept company URL input
- Generate one tailored GTM summary and one BioRender prompt
- Trigger one narrow BioRender automation path
- Show live progress states

### What the app must NOT do

- No multi-company queueing
- No CRM integration
- No outbound email generation
- No data persistence
- No multiple figure types
- No figure editing after generation
- No generalized browser automation
- No retry loops beyond a single simple error state
- No account login automation
- No broad agent orchestration framework
- No JSON shown directly to user

---

## Demo Narrative

The demo is:

> Give the system a target biotech company URL. It researches the company, determines the most relevant BioRender enterprise use case, generates a tailored timeline prompt, and uses a narrow Orgo-backed computer-use flow to create a first draft directly inside BioRender for human review.

This is a **sales-engineering copilot demo**, not a full product.

---

## Golden Path Company

Optimize the happy path for **Moderna**.

### Why Moderna

- obvious biotech/pharma target
- clear public scientific platform narrative
- clear pipeline / clinical-program context
- easy to justify a BioRender timeline artifact

### Default recommended demo angle

A leadership-friendly timeline for **Moderna’s individualized mRNA oncology program workflow** / **mRNA therapeutic development workflow**.

Do not hardcode the prompt text in the UI, but it is acceptable to optimize prompts and logic around this target account.

---

## Structured Output Schema

The OpenAI response must conform to this exact schema.

```ts
{
  companyName: string;
  companyUrl: string;
  companySummary: string;
  whyBioRenderFit: string;
  recommendedBuyerPersona: string;
  recommendedDemoAngle: string;
  recommendedNextStep: string;
  figureType: "timeline";
  title: string;
  timelineSteps: Array<{
    label: string;
    description: string;
  }>;
  finalBioRenderPrompt: string;
}
```

The UI should render this as readable cards/sections, not raw JSON.

---

## OpenAI Prompt Requirements

The model call must:

- use the provided company URL
- use web search tool if needed
- infer a plausible BioRender enterprise demo use case
- always output `figureType = "timeline"`
- produce **5 to 7** timeline steps
- make the result presentation-friendly for BioRender GTM / solutions engineers
- avoid hallucinated proprietary claims
- stay grounded in public information and likely workflows
- write a BioRender-ready prompt that is concise and usable directly in the BioRender AI Timeline tool

The final prompt should be formatted as natural language instructions suitable for BioRender AI.

---

## Orgo Integration Requirements

The app must trigger one narrow Orgo-backed BioRender run from the server.

Assume the VM is already provisioned and available.
Assume the human has already logged into BioRender manually.
Assume a specific BioRender draft page is already open.

Implementation note for future context:
- in-page VNC embed was removed from the demo UI
- reason: Orgo websocket access was blocked by an origin firewall outside this repo
- practical demo workaround: open the Orgo workspace separately beside the app

### Required env vars

- `OPENAI_API_KEY`
- `ORGO_API_KEY`
- `NEXT_PUBLIC_ORGO_COMPUTER_ID`
- `NEXT_PUBLIC_BIORENDER_CANVAS_URL`

Do not implement Orgo infra provisioning in this app unless trivial.
Assume an existing Orgo computer/session is provided.

---

## Orgo Agent Behavior

The automation must be extremely narrow.

The computer-use agent should do only this:

1. Ensure the browser tab is on the already-open BioRender canvas page
2. Click the AI button
3. Select the **Timeline** generation tool
4. Paste the provided `finalBioRenderPrompt`
5. Click Generate
6. Wait until the generated timeline appears
7. Stop

Do not attempt visual cleanup.
Do not drag objects.
Do not replace icons.
Do not do post-generation edits.

Implementation note for future context:
- do not use `computer.prompt(...)` for this demo path
- use OpenAI Responses API computer-use with `gpt-5.4` plus Orgo low-level computer actions
- reason: the hosted Orgo `computer.prompt(...)` path hit an upstream screenshot MIME bug where PNG bytes were labeled as JPEG for Anthropic, causing the run to fail outside app control

---

## UI Requirements

Single-page layout.

The current hackathon UI is a single full-width column with:

- Company URL input
- Primary CTA button
- Optional quick-test toggle that uses the hardcoded Moderna fallback draft
- Progress / status area
- Human-friendly research output cards:
  - Company
  - Summary
  - Why BioRender fit
  - Buyer persona
  - Demo angle
  - Recommended next step
  - Final BioRender prompt
- Run button
- Open Orgo Workspace button

### Status phases

Use a simple status indicator with these stages:

- Idle
- Researching company
- Generating demo plan
- Running BioRender agent
- Draft generated
- Error

---

## API / Route Design

Keep it minimal.

### Suggested routes

- `POST /api/generate-plan`
  - input: `{ companyUrl: string }`
  - output: `{ usedFallback: boolean, plan: structured schema above }`
  - implementation note: this uses `client.responses.create(...)`, parses returned text as JSON manually, validates with Zod, and falls back to the hardcoded Moderna payload on failure

- `POST /api/run-agent`
  - input: `{ finalBioRenderPrompt: string }`
  - triggers the narrow OpenAI + Orgo computer-use loop
  - returns success / failure

You may combine these if simpler, but keeping them separate is preferred.

---

## Validation Rules

- Reject empty input
- Normalize and validate URL format
- If the model output fails schema validation, return the hardcoded Moderna fallback payload
- If Orgo run fails, show a retry button
- Never expose stack traces in UI

---

## UX Rules

- Optimize for clarity, not beauty
- Keep copy concise
- Minimize controls
- No dark patterns, no fancy animations
- Use plain English labels
- Make the final prompt easy to copy

---

## Reliability Rules

- Happy path first
- Hardcode where useful
- Keep waits conservative for BioRender generation
- Add a simple timeout for agent step completion
- Preserve the generated plan in frontend state so user can retry the Orgo run without re-calling OpenAI if needed

---

## What Codex Should NOT Decide

All of the following are already decided:

- company input is URL only
- artifact type is timeline only
- OpenAI model is `gpt-5.4`
- use Responses API with web search
- BioRender login is manual
- Orgo is used only for BioRender UI interaction
- no database
- no auth
- no multiple figure types
- no generalized agent framework
- demo optimized for Moderna happy path

Codex should not introduce alternatives unless absolutely required by an implementation constraint.

---

## Nice-to-Have Only If Trivial

- Copy button for final BioRender prompt
- Screenshot capture after draft generation
- A mock/demo mode toggle for local testing

Ignore all other enhancements.

---

## Definition of Done

The build is done when:

1. User enters `https://www.modernatx.com/`
2. App generates a readable GTM summary and BioRender timeline prompt
3. Embedded Orgo VM is visible
4. Agent runs the narrow BioRender timeline generation flow
5. A generated timeline appears in BioRender

Anything beyond that is optional.

submission to hackathon (done):
name: Catalyse

What problem are you solving?
Enterprise adoption of scientific tools is still bottlenecked by manual demo creation.
At BioRender, enterprise accounts are a small share of customers but a large share of revenue. Winning those accounts still requires manual, account-by-account work: researching the company, finding the right use case, and building a tailored first draft by hand. That slows growth in the highest-value segment and slows the adoption of better scientific communication tools inside enterprise teams, which means scientists and scientific stakeholders keep spending time on repetitive communication work instead of higher-value research.

What did you build?
I built a fleet of AI solutions engineers that turns enterprise demo creation from a manual services workflow into a scalable product workflow.
Given a company URL, it researches the account, selects the most relevant BioRender use case, and generates a tailored first draft directly in BioRender. The result is that teams can create many customized first drafts in parallel, focus human effort on final review and high-value conversations, and spend less time on repetitive prep and more time helping scientists communicate work that matters.
