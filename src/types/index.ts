// ============================================================
// DebugDNA — Shared TypeScript Types
// Used across Module A (Frontend), Module B (Backend), Module C (AI)
// ============================================================

/**
 * A single captured event from the browser SDK.
 * Embedded as a sub-document inside a Session.
 */
export interface Event {
  /** Timestamp offset in milliseconds from session start */
  t: number;

  /** The kind of event captured */
  type: "api_call" | "user_action" | "state_change" | "console_error" | "CRASH";

  /** For api_call — the URL that was fetched */
  endpoint?: string;

  /** For api_call — HTTP method (GET, POST, etc.) */
  method?: string;

  /** For api_call — HTTP response status code */
  status?: number;

  /** Captured return value, state snapshot, or response body (first 500 chars) */
  value?: unknown;

  /** For state_change — the function name involved */
  fn?: string;

  /** For state_change — function arguments */
  args?: unknown[];

  /** For CRASH / console_error — the error message */
  error?: string;

  /** For CRASH — the raw stack trace */
  stack?: string;
}

/**
 * AI-generated analysis returned by Gemini.
 */
export interface Analysis {
  /** 2-3 sentence plain English explanation of what happened */
  story: string;

  /** One sentence root cause */
  rootCause: string;

  /** Minimal code fix (before/after snippet) */
  fix: string;

  /** Jest unit test that would have caught this bug */
  test: string;

  /** Name of the function / component where the crash occurred */
  affectedFunction: string;
}

/**
 * A recorded browser session with all its events and optional analysis.
 */
export interface Session {
  sessionId: string;
  projectId: string;
  status: "pending" | "analyzed";
  createdAt: Date;
  crashedAt: Date | null;
  events: Event[];
  analysis: Analysis | null;
}

/**
 * The causal graph produced by Module C's buildCausalGraph().
 */
export interface CausalGraph {
  originEvent: Event;
  crashEvent: Event;
  chainLength: number;
  timeDelta: number;
  affectedFunction: string;
  summary: string;
}

/**
 * Payload sent by the browser SDK to POST /api/ingest.
 */
export interface IngestPayload {
  sessionId: string;
  projectId: string;
  events: Event[];
}
