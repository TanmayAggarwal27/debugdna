import SessionList from "../../components/SessionList";
import AutoRefresh from "../../components/AutoRefresh";
import { headers } from "next/headers";
import { Activity, Zap, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Dashboard — DebugDNA",
  description: "Monitor and debug application crashes in real-time with AI-powered analysis.",
};

export default async function DashboardPage() {
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/sessions`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to fetch sessions");
  }
  const sessions = await res.json();

  const analyzedCount = sessions.filter((s: { status: string }) => s.status === "analyzed").length;
  const pendingCount = sessions.filter((s: { status: string }) => s.status === "pending").length;

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute inset-0 radial-glow pointer-events-none" />
      
      <AutoRefresh interval={10000} />

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight">DebugDNA</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-muted-foreground">Live</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-8 space-y-8">
        {/* Title section */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Crash Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor and debug application crashes in real-time.
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard
            icon={<Activity className="w-5 h-5 text-primary" />}
            label="Total Sessions"
            value={sessions.length}
            accent="primary"
          />
          <StatsCard
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            label="Analyzed"
            value={analyzedCount}
            accent="emerald"
          />
          <StatsCard
            icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
            label="Pending"
            value={pendingCount}
            accent="amber"
          />
        </div>

        {/* Sessions table */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-primary rounded-full" />
            Recent Crash Sessions
          </h2>
          <SessionList sessions={sessions} />
        </div>
      </main>
    </div>
  );
}

function StatsCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: string;
}) {
  const accentBg =
    accent === "primary"
      ? "bg-primary/10 border-primary/20"
      : accent === "emerald"
      ? "bg-emerald-400/10 border-emerald-400/20"
      : "bg-amber-400/10 border-amber-400/20";

  return (
    <div className={`flex items-center gap-4 p-5 rounded-xl border ${accentBg} transition-all hover:scale-[1.02]`}>
      <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
