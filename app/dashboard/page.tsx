import SessionList from "@/components/SessionList";
import AutoRefresh from "@/components/AutoRefresh";
import { headers } from "next/headers";

export default async function DashboardPage() {
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  
  // Use simple caching bypass for polling fetching effect
  const res = await fetch(`${protocol}://${host}/api/sessions`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to fetch sessions");
  }
  const sessions = await res.json();
  
  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12">
      <AutoRefresh interval={10000} />
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crash Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and unblock application crashes in real-time.
          </p>
        </div>
        <SessionList sessions={sessions} />
      </div>
    </div>
  );
}
