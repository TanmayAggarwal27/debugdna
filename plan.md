# DebugDNA — Vibe Coding Plan

> AI-powered tool that converts production crash stack traces into plain English root cause narratives, complete with a code fix and a unit test.

---

## Project Overview

**What it does:**
A lightweight JavaScript SDK records every API call, user action, and state change inside a web app. When the app crashes, a causal graph engine reconstructs the exact sequence of events that caused the failure. This event chain is sent to the Gemini API which returns a plain English story, root cause, code fix, and unit test.

**One line pitch:**
Every monitoring tool tells you WHERE your app broke. DebugDNA tells you WHY and hands you the fix.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v4 | SHADCN components for ui
| Database | MongoDB Atlas (via Mongoose) |
| AI | Google Gemini API (gemini-2.0-flash) |
| SDK | Vanilla JavaScript (no dependencies) |
| Auth | None for MVP |
| Deployment | Vercel |

> IMPORTANT: Always use the latest stable versions of all dependencies. Before writing any install command or import, check the official docs for the latest API syntax. Do not use deprecated methods.
> - Next.js docs: https://nextjs.org/docs
> - Mongoose docs: https://mongoosejs.com/docs
> - Gemini API docs: https://ai.google.dev/gemini-api/docs
> - Tailwind CSS v4 docs: https://tailwindcss.com/docs

---

## Folder Structure

```
debugdna/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                      # Dashboard home
│   ├── dashboard/
│   │   └── page.tsx                  # Main error list view
│   ├── session/
│   │   └── [sessionId]/
│   │       └── page.tsx              # Single session detail view
│   └── api/
│       ├── ingest/
│       │   └── route.ts              # Receives events from SDK
│       ├── analyze/
│       │   └── route.ts              # Triggers Gemini analysis
│       └── sessions/
│           └── route.ts              # Fetches sessions from MongoDB
├── components/
│   ├── EventTimeline.tsx             # Visual timeline of events
│   ├── NarrativeCard.tsx             # Displays AI explanation
│   ├── FixCard.tsx                   # Displays code fix + test
│   ├── SessionList.tsx               # List of all crash sessions
│   └── StatusBadge.tsx               # analyzed / pending badge
├── lib/
│   ├── mongodb.ts                    # MongoDB connection utility
│   ├── gemini.ts                     # Gemini API client setup
│   └── causalGraph.ts               # Core causal graph logic
├── models/
│   ├── Session.ts                    # Mongoose Session schema
│   └── Event.ts                     # Mongoose Event schema
├── sdk/
│   └── debugdna-sdk.js              # The injectable JS SDK
├── types/
│   └── index.ts                     # Shared TypeScript types
└── public/
    └── sdk/
        └── debugdna.min.js          # Minified SDK for embedding
```

---

## Data Models

### Session (MongoDB)
```typescript
{
  sessionId: string,         // unique ID per browser session
  projectId: string,         // identifies which app sent events
  status: "pending" | "analyzed",
  createdAt: Date,
  crashedAt: Date,
  events: Event[],           // ordered array of all captured events
  analysis: {
    story: string,           // plain English narrative
    rootCause: string,       // one sentence root cause
    fix: string,             // code fix snippet
    test: string,            // unit test snippet
    affectedFunction: string
  } | null
}
```

### Event (embedded in Session)
```typescript
{
  t: number,                 // timestamp offset in ms from session start
  type: "api_call" | "user_action" | "state_change" | "console_error" | "CRASH",
  endpoint?: string,         // for api_call
  method?: string,
  status?: number,
  value?: any,               // captured return value or state
  fn?: string,               // function name for state_change
  args?: any[],
  error?: string,            // error message for CRASH
  stack?: string             // raw stack trace for CRASH
}
```

---

## Module Breakdown

---

## MODULE A — Frontend (UI + Dashboard)

**Owner:** Member 1
**Stack:** Next.js 15 App Router, Tailwind CSS v4, TypeScript, shadcn

### What to build

Build the complete user-facing dashboard. This is what developers see when they open DebugDNA after a crash has been recorded and analyzed.
NOTE: YOU ARE FREE TO USE SHADCN COMPONETS FOR CONSISTENCY OF COMPONENTS
### Pages to build

**1. Home page (`app/page.tsx`)**
- Big centered headline: "Your app crashed. We explain why."
- A code snippet showing how to install the SDK (just a copy-paste box)
- A button: "View Dashboard" linking to `/dashboard`
- Dark background `#0D1117`, accent color `#00C896`

**2. Dashboard page (`app/dashboard/page.tsx`)**
- Fetches all sessions from `/api/sessions`
- Renders a `<SessionList />` component
- Each session row shows: sessionId, time of crash, status badge (analyzed/pending), button to view detail
- Auto-refreshes every 10 seconds using `setInterval` + `router.refresh()`

**3. Session detail page (`app/session/[sessionId]/page.tsx`)**
- Fetches single session data
- Left panel: `<EventTimeline />` — vertical scrollable list of all events with timestamps, color coded by type (api_call = blue, CRASH = red, user_action = gray)
- Right panel top: `<NarrativeCard />` — shows the AI-generated story and root cause
- Right panel bottom: `<FixCard />` — shows the code fix and unit test with syntax highlighting
- If status is "pending", show a loading spinner and poll every 3 seconds until analyzed

### Components to build

**`<EventTimeline />`**
- Takes an array of events as props
- Renders a vertical timeline
- Each event is a row with: time offset (e.g. `+870ms`), event type badge, description
- CRASH event should be visually distinct — red background, larger text

**`<NarrativeCard />`**
- Takes `story: string` and `rootCause: string` as props
- Story displayed as normal paragraph text
- Root cause displayed in a highlighted box with a warning icon

**`<FixCard />`**
- Takes `fix: string` and `test: string` as props
- Render both as code blocks with a copy-to-clipboard button
- Use a dark code block style (bg `#161B22`, text white, keywords in mint)

**`<SessionList />`**
- Takes array of sessions as props
- Table layout: Session ID | Crashed At | Status | Action
- Clicking a row navigates to `/session/[sessionId]`

**`<StatusBadge />`**
- Takes `status: "pending" | "analyzed"` as props
- Green pill for analyzed, gray pill for pending

### Design rules
- Background: `#0D1117`
- Card surfaces: `#161B22`
- Primary accent: `#00C896`
- Error accent: `#FF5533`
- Text primary: `#FFFFFF`
- Text muted: `#8B949E`
- Border color: `#30363D`
- Font: Inter or system font via Tailwind
- All cards should have `border border-[#30363D] rounded-xl`
- No gradients, no shadows, keep it flat and clean

### API calls this module makes
- `GET /api/sessions` — fetch all sessions
- `GET /api/sessions?sessionId=xxx` — fetch one session

---

## MODULE B — Backend (API Routes + Database)

**Owner:** Member 2
**Stack:** Next.js 15 API Routes, MongoDB Atlas, Mongoose

### What to build

Build all the server-side API routes and the MongoDB integration. This module is the bridge between the SDK, the database, and the AI module.

### Setup first

**MongoDB connection (`lib/mongodb.ts`)**
```typescript
// Use the latest Mongoose connection pattern
// Connection string stored in .env.local as MONGODB_URI
// Use a singleton pattern to avoid multiple connections in Next.js dev mode
// Reference latest Mongoose docs: https://mongoosejs.com/docs/connections.html
```

**Environment variables needed in `.env.local`:**
```
MONGODB_URI=your_mongodb_atlas_connection_string
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SDK_PROJECT_ID=demo-project
```

### Mongoose Models to build

**`models/Session.ts`**
- Define the full Session schema as described in the Data Models section above
- Use `mongoose.models.Session || mongoose.model('Session', SessionSchema)` pattern to avoid model recompilation errors in Next.js
- Add an index on `sessionId` for fast lookup
- Add an index on `createdAt` for sorting

**`models/Event.ts`**
- This is embedded inside Session as a sub-document schema, not a standalone collection
- Define it as a Mongoose Schema and import it into Session

### API Routes to build

**`POST /api/ingest` (`app/api/ingest/route.ts`)**

This is called by the SDK running in the user's browser.

What it receives:
```json
{
  "sessionId": "abc123",
  "projectId": "demo-project",
  "events": [ ...array of Event objects... ]
}
```

What it does:
1. Connects to MongoDB
2. Finds existing session by sessionId OR creates a new one
3. Appends the incoming events to the session's events array (avoid duplicates by checking timestamps)
4. If any event has `type: "CRASH"`, update `crashedAt` and trigger analysis by calling `POST /api/analyze` internally using `fetch`
5. Returns `{ success: true }`

Important: This route will be called from a browser SDK so it needs CORS headers. Add these response headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```
Also handle `OPTIONS` preflight requests.

**`POST /api/analyze` (`app/api/analyze/route.ts`)**

This is called internally after a crash is detected. This route is owned by MODULE B for the HTTP handler but calls into MODULE C for the actual logic.

What it receives:
```json
{ "sessionId": "abc123" }
```

What it does:
1. Fetch the full session from MongoDB by sessionId
2. Call `buildCausalGraph(session.events)` from `lib/causalGraph.ts` (MODULE C)
3. Call `analyzeWithGemini(causalGraph, session.events)` from `lib/gemini.ts` (MODULE C)
4. Save the returned analysis object back to the session in MongoDB
5. Update session status to "analyzed"
6. Return `{ success: true, analysis }`

**`GET /api/sessions` (`app/api/sessions/route.ts`)**

Two behaviors based on query params:

- `GET /api/sessions` — returns all sessions sorted by `createdAt` descending, limited to 50, only returns fields: `sessionId, status, crashedAt, createdAt` (not full events array — too large)
- `GET /api/sessions?sessionId=xxx` — returns the full single session including all events and analysis

---

## MODULE C — Core Logic (Causal Graph + Gemini AI)

**Owner:** Member 3 (Main Logic)
**Stack:** TypeScript, Google Gemini API SDK

### What to build

This is the brain of DebugDNA. Two parts:

1. The causal graph builder that figures out WHAT caused the crash
2. The Gemini AI integration that turns that graph into a human story

Plus the JavaScript SDK that runs inside the user's app.

---

### Part 1: The JavaScript SDK (`sdk/debugdna-sdk.js`)

This is a plain JavaScript file with zero dependencies that developers drop into their app.

**What it must do:**

```javascript
// INITIALIZATION
// DebugDNA.init({ projectId: 'xxx', endpoint: 'https://your-app.com/api/ingest' })
// Generates a unique sessionId for this browser session (use crypto.randomUUID())
// Stores sessionId in sessionStorage

// EVENT RECORDING
// Maintains an internal events array: []
// Pushes a new event object to the array on every capture

// MONKEY-PATCH fetch
// Wrap the global fetch function
// Before every fetch: record { type: 'api_call', endpoint, method, t: Date.now() - sessionStart }
// After every fetch: update the event with { status: response.status, value: responseBody (first 500 chars) }

// CAPTURE DOM EVENTS
// Listen on document for: click, input, change
// Record { type: 'user_action', element: event.target.tagName, t: ... }

// CAPTURE CONSOLE ERRORS
// Wrap console.error
// Record { type: 'console_error', value: args.join(' '), t: ... }

// CAPTURE UNCAUGHT ERRORS
// window.addEventListener('error', ...)
// window.addEventListener('unhandledrejection', ...)
// On any uncaught error: record { type: 'CRASH', error: message, stack: stack, t: ... }
// Immediately flush all events to the ingest endpoint using navigator.sendBeacon (non-blocking)
// navigator.sendBeacon falls back to fetch if not available

// FLUSHING
// Send events to endpoint every 30 seconds as a heartbeat even if no crash
// Always flush on CRASH event immediately
// Flush payload: { sessionId, projectId, events: [...] }
```

**Usage (what devs put in their app):**
```html
<script src="/sdk/debugdna.min.js"></script>
<script>
  DebugDNA.init({ projectId: 'my-app', endpoint: '/api/ingest' })
</script>
```

---

### Part 2: Causal Graph Builder (`lib/causalGraph.ts`)

This is pure TypeScript logic — no external dependencies needed.

**Export one function:**
```typescript
export function buildCausalGraph(events: Event[]): CausalGraph
```

**What it must do:**

```
INPUT: Array of Event objects ordered by timestamp

STEP 1 — Find the CRASH event
  - Find the event with type === "CRASH"
  - Extract the error message and stack trace
  - Note its timestamp

STEP 2 — Find the root value
  - Parse the error message to extract what was null/undefined
  - Example: "Cannot read properties of null (reading 'src')" → looking for null
  - Example: "undefined is not a function" → looking for undefined

STEP 3 — Trace backwards
  - Walk backwards through events from the crash timestamp
  - Find the most recent api_call or state_change whose value === null or undefined
  - That event is the "origin" — where the bad value came from

STEP 4 — Build the graph
  - originEvent: the event where the null/bad value first appeared
  - crashEvent: the CRASH event
  - chainLength: number of events between origin and crash
  - timeDelta: ms between origin and crash
  - affectedFunction: extract from crash stack trace (first user function, not React internals)

STEP 5 — Return a CausalGraph object
{
  originEvent,
  crashEvent,
  chainLength,
  timeDelta,
  affectedFunction,
  summary: string  // one sentence like "null value from /api/profile at t=120ms reached resizeImage() at t=890ms"
}
```

**Edge cases to handle:**
- No CRASH event found → return null
- No clear origin found → set originEvent to the first event in the array
- Stack trace is minified/empty → set affectedFunction to "unknown function"

---

### Part 3: Gemini AI Integration (`lib/gemini.ts`)

> IMPORTANT: Use the latest Google Gemini API. Install `@google/genai` (the newest SDK). Check https://ai.google.dev/gemini-api/docs for the latest initialization and generation syntax. Do NOT use the old `@google/generative-ai` package.

**Setup:**
```typescript
// Import from @google/genai
// Initialize with GEMINI_API_KEY from process.env
// Use model: "gemini-2.0-flash"
```

**Export one function:**
```typescript
export async function analyzeWithGemini(
  causalGraph: CausalGraph,
  events: Event[]
): Promise<Analysis>
```

**The prompt to send Gemini (construct this dynamically):**

```
You are a senior software engineer analyzing a production crash.

Here is the causal chain summary:
${causalGraph.summary}

Here is the origin event where the problem started:
${JSON.stringify(causalGraph.originEvent, null, 2)}

Here is the crash event:
${JSON.stringify(causalGraph.crashEvent, null, 2)}

Here is the full event sequence (${events.length} events):
${JSON.stringify(events, null, 2)}

Your job is to return a JSON object with exactly these fields:
{
  "story": "A 2-3 sentence plain English explanation of what happened and why, written for a developer. Mention the specific endpoint, function, or value involved. Be specific, not generic.",
  "rootCause": "One sentence identifying the exact root cause. Example: resizeImage() has no null guard and assumes user.avatar always exists.",
  "fix": "The minimal code fix as a code snippet. Show before and after. Use JavaScript/TypeScript.",
  "test": "A unit test using Jest syntax that would have caught this bug.",
  "affectedFunction": "The name of the function or component where the crash occurred"
}

Return ONLY valid JSON. No markdown, no explanation, no backticks. Just the raw JSON object.
```

**Parse the response:**
```typescript
// Gemini returns a text response
// Parse it as JSON
// If parsing fails, return a fallback analysis object with a generic message
// Never throw — always return something
```

**Return type:**
```typescript
type Analysis = {
  story: string
  rootCause: string
  fix: string
  test: string
  affectedFunction: string
}
```

---

## Demo Setup (All 3 members do this together at the end)

Build a demo app at `app/demo/page.tsx` that has a button which deliberately triggers a crash:

```javascript
// Demo scenario: User with no avatar triggers a crash
const user = { id: 1, name: "Test User", avatar: null }

// This will crash because avatar is null
const resized = user.avatar.src  // TypeError: Cannot read properties of null

// The SDK should capture the fetch to /api/mock-profile that returned avatar: null
// Then capture this crash
// Then send to /api/ingest
// Then Gemini explains it
```

This is what you demo live on stage.

---

## Integration Checklist (follow this order)

```
[ ] MODULE B: Set up MongoDB connection (lib/mongodb.ts)
[ ] MODULE B: Create Mongoose models (Session + Event)
[ ] MODULE C: Build the SDK (sdk/debugdna-sdk.js)
[ ] MODULE B: Build POST /api/ingest route
[ ] MODULE C: Build causal graph logic (lib/causalGraph.ts)
[ ] MODULE C: Build Gemini integration (lib/gemini.ts)
[ ] MODULE B: Build POST /api/analyze route (calls MODULE C functions)
[ ] MODULE B: Build GET /api/sessions route
[ ] MODULE A: Build SessionList + StatusBadge components
[ ] MODULE A: Build Dashboard page
[ ] MODULE A: Build EventTimeline component
[ ] MODULE A: Build NarrativeCard + FixCard components
[ ] MODULE A: Build Session detail page
[ ] ALL: Wire up demo page and test end to end
```

---

## Environment Setup

Create `.env.local` in the project root:

```
MONGODB_URI=mongodb+srv://...
GEMINI_API_KEY=AIza...
NEXT_PUBLIC_PROJECT_ID=debugdna-demo
```

Install dependencies:

```bash
npx create-next-app@latest debugdna --typescript --tailwind --app
cd debugdna
npm install mongoose @google/genai
```

---

## Important Rules for All Modules

1. Always check the official documentation for the latest API syntax before writing any code. Do not rely on training data for API signatures — they may be outdated.
2. Use TypeScript strictly. No `any` types unless absolutely necessary.
3. Every API route must handle errors with try/catch and return appropriate HTTP status codes.
4. MongoDB connection must use the singleton pattern to avoid connection pool issues in Next.js.
5. The Gemini response must always be wrapped in try/catch. If JSON parsing fails, return a safe fallback object instead of crashing.
6. The SDK must never throw errors or break the host application. Wrap everything in try/catch.
7. All three modules share the types defined in `types/index.ts`. Define them once, import everywhere.