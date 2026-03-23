"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

export interface EventLog {
  id: string;
  type: "api_call" | "CRASH" | "user_action";
  message: string;
  timestamp: string;
}

export default function EventTimeline({ events }: { events: EventLog[] }) {
  // Sort events chronologically just in case
  const sortedEvents = [...events].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/30">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          Event Timeline
        </h2>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {sortedEvents.map((evt, idx) => {
            const isCrash = evt.type === "CRASH";
            const isApi = evt.type === "api_call";
            
            return (
              <div key={evt.id} className="relative pl-6">
                {/* Timeline Line */}
                {idx !== sortedEvents.length - 1 && (
                  <div className="absolute left-[7px] top-6 bottom-[-24px] w-[2px] bg-border" />
                )}
                {/* Timeline Dot */}
                <div 
                  className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-background shadow-sm ${
                    isCrash ? "bg-destructive" : isApi ? "bg-blue-500" : "bg-gray-400"
                  }`} 
                />
                
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                    <span className="font-medium text-foreground">
                      {format(new Date(evt.timestamp), "HH:mm:ss.SSS")}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                      isCrash ? "bg-destructive/10 text-destructive" : isApi ? "bg-blue-500/10 text-blue-500" : "bg-gray-500/10 text-gray-500"
                    }`}>
                      {evt.type}
                    </span>
                  </div>
                  <p className="text-sm font-medium mt-1 break-words">
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
