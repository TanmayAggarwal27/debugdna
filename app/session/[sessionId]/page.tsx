import EventTimeline from "../../../components/EventTimeline";
import { NarrativeCard, FixCard } from "../../../components/AnalysisCards";
import AutoRefresh from "../../../components/AutoRefresh";
import { headers } from "next/headers";
import { Loader2, ArrowLeft, Zap, Clock, Hash, Server } from "lucide-react";
import Link from "next/link";
import { Button } from "../../../components/ui/button";

export async function generateMetadata({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  return {
    title: `Session ${sessionId} — DebugDNA`,
    description: `Detailed crash analysis for session ${sessionId}`,
  };
}

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";

  const res = await fetch(
    `${protocol}://${host}/api/sessions/${sessionId}`,
    { cache: "no-store", headers: { "Content-Type": "application/json" } }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch session detail");
  }

  const session = await res.json();
  const isPending = session.status === "pending";

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

      {isPending && <AutoRefresh interval={3000} />}

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">Session Details</h1>
              <p className="text-xs font-mono text-muted-foreground mt-0.5">{sessionId}</p>
            </div>
          </div>
          <div className="ml-auto">
            {isPending ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-sm text-amber-400">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Analyzing...
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-sm text-primary">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Analyzed
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[calc(100vh-180px)]">
          {/* Left Panel — Timeline */}
          <div className="lg:col-span-1 h-full min-h-[500px]">
            <EventTimeline events={session.events || []} />
          </div>

          {/* Right Panel — Analysis */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {isPending ? (
              <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-border/60 rounded-xl bg-card/30 backdrop-blur-sm min-h-[400px]">
                <div className="relative">
                  <div className="absolute inset-0 w-16 h-16 rounded-full bg-primary/20 animate-ping" />
                  <Loader2 className="h-16 w-16 animate-spin text-primary relative" />
                </div>
                <h3 className="text-xl font-semibold mt-6">Analyzing Crash...</h3>
                <p className="text-muted-foreground mt-2 max-w-md text-center text-sm leading-relaxed">
                  DebugDNA&apos;s AI is processing the event timeline and stack traces
                  to identify the root cause and generate a fix.
                </p>
                <div className="flex items-center gap-4 mt-6 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Building causal graph
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5" /> Analyzing with Gemini
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5" /> Generating fix
                  </span>
                </div>
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
      </main>
    </div>
  );
}
