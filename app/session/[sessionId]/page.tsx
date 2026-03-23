import EventTimeline from "@/components/EventTimeline";
import { NarrativeCard, FixCard } from "@/components/AnalysisCards";
import AutoRefresh from "@/components/AutoRefresh";
import { headers } from "next/headers";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SessionDetailPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/sessions/${sessionId}`, { cache: "no-store", headers: { "Content-Type": "application/json" } });
  if (!res.ok) {
    throw new Error("Failed to fetch session detail");
  }

  const session = await res.json();
  const isPending = session.status === "pending";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-6 md:p-12">
      {isPending && <AutoRefresh interval={3000} />}
      
      <div className="flex items-center space-x-4 mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Session Details</h1>
          <p className="text-sm font-mono text-muted-foreground mt-1">{sessionId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 h-[calc(100vh-200px)] min-h-[600px]">
        {/* Left Panel */}
        <div className="lg:col-span-1 h-full">
          <EventTimeline events={session.events || []} />
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-2 flex flex-col gap-6 h-full">
          {isPending ? (
            <div className="flex-1 flex flex-col items-center justify-center border rounded-xl bg-card border-dashed">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-xl font-medium">Analyzing Crash...</h3>
              <p className="text-muted-foreground mt-2 max-w-md text-center">
                DebugDNA's AI is processing the event timeline and stack traces to identify the root cause and generate a fix.
              </p>
            </div>
          ) : (
            <>
              <NarrativeCard narrative={session.narrative} />
              <div className="flex-1 min-h-0">
                <FixCard fix={session.fix} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
