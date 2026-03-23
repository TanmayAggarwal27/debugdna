import { Event, CausalGraph } from "@/types";

function extractBadValue(errorMessage: string): "null" | "undefined" | "" {
  const lowerMsg = errorMessage.toLowerCase();
  
  // Try to find what exactly caused the crash
  if (lowerMsg.includes("null") || lowerMsg.includes("of null")) {
    return "null";
  }
  if (lowerMsg.includes("undefined") || lowerMsg.includes("of undefined")) {
    return "undefined";
  }
  return "";
}

function searchForBadValue(value: any, badValue: "null" | "undefined"): boolean {
  if (badValue === "null" && value === null) return true;
  if (badValue === "undefined" && value === undefined) return true;
  
  if (value && typeof value === "object") {
    for (const key in value) {
      if (badValue === "null" && value[key] === null) return true;
      if (badValue === "undefined" && value[key] === undefined) return true;
    }
  }
  return false;
}

export function buildCausalGraph(events: Event[]): CausalGraph | null {
  const crashEvent = events.find((e) => e.type === "CRASH");
  if (!crashEvent) return null;

  const errorMessage = crashEvent.error || "";
  const badValue = extractBadValue(errorMessage);

  let originEvent: Event | undefined;

  // Walk backwards to find where this null/undefined value came from
  if (badValue) {
    for (let i = events.indexOf(crashEvent) - 1; i >= 0; i--) {
      const e = events[i];
      if (e.type === "api_call" || e.type === "state_change") {
        if (searchForBadValue(e.value, badValue)) {
          originEvent = e;
          break;
        }
      }
    }
  }

  // Fallbacks if origin wasn't found based on value
  if (!originEvent && events.length > 0) {
    originEvent = events[0]; // just grab the start of session
  } else if (!originEvent) {
    originEvent = crashEvent;
  }

  const originIndex = events.indexOf(originEvent);
  const crashIndex = events.indexOf(crashEvent);
  const chainLength = Math.max(0, crashIndex - originIndex);
  const timeDelta = crashEvent.t - originEvent.t;

  let affectedFunction = "unknown function";
  if (crashEvent.stack) {
    const stackLines = crashEvent.stack.split("\n");
    for (const line of stackLines) {
      if (line.includes("at ") && !line.includes("node_modules") && !line.includes("react-dom")) {
        const match = line.match(/at\s+([^\s]+)/);
        if (match && match[1]) {
          affectedFunction = match[1];
          break;
        }
      }
    }
  }

  const originSource = originEvent.type === 'api_call' 
    ? (originEvent.endpoint || "API") 
    : (originEvent.fn || originEvent.type);

  const summary = `${badValue ? badValue : 'Bad'} value from ${originSource} at t=${originEvent.t}ms reached ${affectedFunction} at t=${crashEvent.t}ms`;

  return {
    originEvent,
    crashEvent,
    chainLength,
    timeDelta,
    affectedFunction,
    summary,
  };
}
