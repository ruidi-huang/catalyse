# BioRender Agent Demo - Frozen Codex Spec

## Goal
Build a hackathon demo web app called **Autonomous Solutions Engineer for BioRender**.

The app takes **one company URL** as input, uses **one OpenAI Responses API call** with **web search** to research the company and generate a tailored **BioRender timeline draft prompt**, then shows a live **Orgo VM** where a computer-use agent performs the narrow BioRender flow:

1. Open an already-open BioRender draft page URL
2. Click the AI button
3. Choose **Timeline**
4. Paste the generated prompt
5. Click Generate
6. Stop

The demo succeeds when **a generated timeline appears in BioRender** and the app shows a **human-friendly GTM research summary** plus the **final BioRender prompt**.

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

---

## Tech Stack

- **Next.js** app already initialized
- **TypeScript only**
- **App Router**
- **Tailwind CSS**
- **OpenAI Node SDK**
- **Orgo SDK**
- **orgo-vnc** for live VM embed
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
App displays embedded Orgo VM and triggers the narrow computer-use prompt.

### Step 7
Agent performs only the BioRender generation path and stops.

### Step 8
User sees the generated timeline draft in BioRender.

---

## Strict Scope Boundaries

### What the app must do
- Accept company URL input
- Generate one tailored GTM summary and one BioRender prompt
- Show embedded Orgo VM
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

> Give the system a target biotech company URL. It researches the company, determines the most relevant BioRender enterprise use case, generates a tailored timeline prompt, and uses a live computer-use agent in an Orgo VM to create a first draft directly inside BioRender for human review.

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

The app must support embedding a live Orgo VM in the page.

Assume the VM is already provisioned and available.
Assume the human has already logged into BioRender manually.
Assume a specific BioRender draft page is already open.

### Required env vars
- `OPENAI_API_KEY`
- `ORGO_API_KEY`
- `NEXT_PUBLIC_ORGO_COMPUTER_ID`
- `NEXT_PUBLIC_BIORENDER_CANVAS_URL`

If helpful, also support:
- `NEXT_PUBLIC_ORGO_TOKEN` or equivalent embed token mechanism if Orgo requires it

Do not implement Orgo infra provisioning in this app unless trivial.
Assume an existing Orgo computer/session is provided.

---

## Orgo Agent Behavior

The Orgo prompt must be extremely narrow.

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

---

## UI Requirements

Single-page layout.

### Left side
- Company URL input
- Primary CTA button
- Progress / status area
- Human-friendly research output cards:
  - Company
  - Summary
  - Why BioRender fit
  - Buyer persona
  - Demo angle
  - Recommended next step
  - Final BioRender prompt

### Right side
- Embedded live Orgo VM

### Status phases
Use a simple status indicator with these stages:
- Idle
- Researching company
- Generating demo plan
- Connecting to VM
- Running BioRender agent
- Draft generated
- Error

---

## API / Route Design

Keep it minimal.

### Suggested routes
- `POST /api/generate-plan`
  - input: `{ companyUrl: string }`
  - output: structured schema above

- `POST /api/run-agent`
  - input: `{ finalBioRenderPrompt: string }`
  - triggers the narrow Orgo computer-use prompt
  - returns success / failure

You may combine these if simpler, but keeping them separate is preferred.

---

## Validation Rules

- Reject empty input
- Normalize and validate URL format
- If the model output fails schema validation, show a friendly error
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
