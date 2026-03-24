"use client";
import { ScrollArea } from "./ui/scroll-area";
import { format } from "date-fns";
import { AlertTriangle, Globe, MousePointer2, ChevronRight } from "lucide-react";

export interface EventLog {
  id: string;
  type: "api_call" | "CRASH" | "user_action" | "state_change" | "console_error";
  message: string;
  timestamp: string;
}

const eventConfig: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode; label: string }> = {
  CRASH: {
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    label: "CRASH",
  },
  api_call: {
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/30",
    icon: <Globe className="w-3.5 h-3.5" />,
    label: "API",
  },
  user_action: {
    color: "text-muted-foreground",
    bg: "bg-muted/50",
    border: "border-border/50",
    icon: <MousePointer2 className="w-3.5 h-3.5" />,
    label: "USER",
  },
  state_change: {
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/30",
    icon: <ChevronRight className="w-3.5 h-3.5" />,
    label: "STATE",
  },
  console_error: {
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/30",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    label: "ERROR",
  },
};

export default function EventTimeline({ events }: { events: EventLog[] }) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="flex flex-col h-full bg-card/50 backdrop-blur-sm rounded-xl border border-border/60 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border/50 bg-muted/20">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <span className="w-1 h-5 bg-primary rounded-full" />
          Event Timeline
          <span className="ml-auto text-xs text-muted-foreground font-normal px-2 py-0.5 rounded-full bg-muted/50">
            {sortedEvents.length} events
          </span>
        </h2>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-1">
          {sortedEvents.map((evt, idx) => {
            const config = eventConfig[evt.type] || eventConfig.user_action;
            const isCrash = evt.type === "CRASH";

            return (
              <div key={evt.id} className="relative pl-7 group">
                {/* Timeline line */}
                {idx !== sortedEvents.length - 1 && (
                  <div
                    className={`absolute left-[9px] top-7 bottom-0 w-[1.5px] ${
                      isCrash ? "bg-destructive/40" : "bg-border/60"
                    }`}
                  />
                )}

                {/* Timeline dot */}
                <div
                  className={`absolute left-0 top-2 w-[19px] h-[19px] rounded-full border-2 border-background flex items-center justify-center ${
                    isCrash
                      ? "bg-destructive shadow-[0_0_12px_rgba(255,85,51,0.4)]"
                      : evt.type === "api_call"
                      ? "bg-blue-500"
                      : evt.type === "state_change"
                      ? "bg-purple-400"
                      : "bg-muted-foreground/50"
                  }`}
                />

                {/* Event content */}
                <div
                  className={`py-3 px-3 rounded-lg transition-colors duration-200 ${
                    isCrash
                      ? "bg-destructive/5 border border-destructive/20 mb-2"
                      : "hover:bg-muted/20"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-medium text-foreground/80">
                      {format(new Date(evt.timestamp), "HH:mm:ss.SSS")}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${config.color} ${config.bg} border ${config.border}`}
                    >
                      {config.icon}
                      {config.label}
                    </span>
                  </div>
                  <p
                    className={`text-sm mt-1.5 break-words leading-relaxed ${
                      isCrash ? "font-semibold text-destructive" : "text-foreground/80"
                    }`}
                  >
                    {evt.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
