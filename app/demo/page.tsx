"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import Link from "next/link";
import {
  Zap,
  Play,
  AlertTriangle,
  ArrowLeft,
  Check,
  Loader2,
  Terminal,
  Bug,
  Radio,
} from "lucide-react";

export default function DemoPage() {
  const [status, setStatus] = useState<
    "idle" | "initializing" | "recording" | "crashing" | "sent" | "error"
  >("idle");
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const runDemo = async () => {
    setStatus("initializing");
    setLogs([]);

    // Step 1: Initialize the SDK
    addLog("🔧 Initializing DebugDNA SDK...");
    await sleep(500);

    const sessionId = crypto.randomUUID();
    const projectId = "debugdna-demo";
    const sessionStart = Date.now();

    addLog(`📋 Session ID: ${sessionId}`);
    addLog(`📦 Project ID: ${projectId}`);
    setStatus("recording");

    // Step 2: Simulate user actions
    addLog("👆 User navigated to /checkout");
    await sleep(800);

    // Step 3: Simulate API call that returns avatar: null
    addLog("🌐 GET /api/user/profile → 200 OK");
    await sleep(600);

    const mockEvents = [
      {
        t: 0,
        type: "user_action" as const,
        value: "User navigated to /checkout",
      },
      {
        t: 120,
        type: "api_call" as const,
        endpoint: "/api/user/profile",
        method: "GET",
        status: 200,
        value: { id: 1, name: "Test User", avatar: null },
      },
      {
        t: 350,
        type: "state_change" as const,
        fn: "UserContext.setProfile",
        args: [{ id: 1, name: "Test User", avatar: null }],
        value: { avatar: null },
      },
      {
        t: 870,
        type: "user_action" as const,
        value: "User clicked 'Submit Payment'",
      },
      {
        t: 1240,
        type: "api_call" as const,
        endpoint: "/api/payments",
        method: "POST",
        status: 200,
        value: { success: true },
      },
    ];

    addLog("🔄 State change: UserContext.setProfile({avatar: null})");
    await sleep(500);

    addLog("👆 User clicked 'Submit Payment'");
    await sleep(500);

    addLog("🌐 POST /api/payments → 200 OK");
    await sleep(400);

    // Step 4: Trigger the crash
    setStatus("crashing");
    addLog("💥 CRASH: TypeError: Cannot read properties of null (reading 'src')");
    addLog("   at PaymentProcessor.renderReceipt (PaymentProcessor.tsx:42)");
    await sleep(300);

    // Add crash event
    const crashEvent = {
      t: Date.now() - sessionStart,
      type: "CRASH" as const,
      error: "TypeError: Cannot read properties of null (reading 'src')",
      stack:
        "TypeError: Cannot read properties of null (reading 'src')\n    at PaymentProcessor.renderReceipt (PaymentProcessor.tsx:42)\n    at PaymentForm.onSubmit (PaymentForm.tsx:18)",
    };

    const allEvents = [...mockEvents, crashEvent];

    // Step 5: Send to ingest API
    addLog("📡 Flushing events to /api/ingest...");

    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          projectId,
          events: allEvents,
        }),
      });

      const data = await res.json();

      if (data.success) {
        addLog("✅ Events ingested successfully!");
        addLog("🧠 AI analysis triggered in background...");
        addLog(`🔗 View session at /session/${sessionId} (or check the Dashboard)`);
        setStatus("sent");
      } else {
        addLog(`❌ Ingest failed: ${data.error}`);
        setStatus("error");
      }
    } catch (err) {
      addLog(`❌ Network error: ${err}`);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute inset-0 radial-glow pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="max-w-4xl mx-auto px-6 md:px-12 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 hover:bg-primary/10 hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">
                Live Demo
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Simulate a crash and watch DebugDNA analyze it
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 py-10 space-y-8">
        {/* Demo explanation */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/60">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Bug className="w-5 h-5 text-primary" />
              Demo Scenario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              This demo simulates a common crash scenario: a user with no
              avatar triggers a <code className="text-destructive bg-destructive/10 px-1.5 py-0.5 rounded text-xs">
              TypeError</code> when the app tries to access{" "}
              <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">user.avatar.src</code>.
            </p>
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
              <div className="space-y-1.5">
                <p>
                  <span className="font-medium text-foreground">1.</span> SDK
                  captures user actions and API calls
                </p>
                <p>
                  <span className="font-medium text-foreground">2.</span> App
                  crashes with a{" "}
                  <span className="text-destructive">NullPointerException</span>
                </p>
                <p>
                  <span className="font-medium text-foreground">3.</span> Events
                  are flushed to <span className="text-primary">/api/ingest</span>
                </p>
                <p>
                  <span className="font-medium text-foreground">4.</span> Causal
                  graph + Gemini AI generate the analysis
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Run button */}
        <div className="flex justify-center">
          <Button
            onClick={runDemo}
            disabled={status === "initializing" || status === "recording" || status === "crashing"}
            size="lg"
            className="h-14 px-10 text-lg font-semibold rounded-full gap-3 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1"
          >
            {status === "idle" && (
              <>
                <Play className="w-5 h-5" /> Run Demo Crash
              </>
            )}
            {(status === "initializing" ||
              status === "recording" ||
              status === "crashing") && (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Running...
              </>
            )}
            {status === "sent" && (
              <>
                <Check className="w-5 h-5" /> Done — Run Again
              </>
            )}
            {status === "error" && (
              <>
                <AlertTriangle className="w-5 h-5" /> Failed — Retry
              </>
            )}
          </Button>
        </div>

        {/* Log output */}
        {logs.length > 0 && (
          <Card className="bg-[#0d1117] border-border/60 overflow-hidden">
            <CardHeader className="pb-2 border-b border-border/30">
              <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                <Terminal className="w-4 h-4" />
                SDK Event Log
                {(status === "initializing" ||
                  status === "recording" ||
                  status === "crashing") && (
                  <Radio className="w-3 h-3 text-destructive animate-pulse ml-auto" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="font-mono text-sm space-y-1 max-h-[400px] overflow-auto">
                {logs.map((log, i) => (
                  <div
                    key={i}
                    className={`leading-relaxed ${
                      log.includes("CRASH")
                        ? "text-destructive font-semibold"
                        : log.includes("✅")
                        ? "text-primary"
                        : log.includes("❌")
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Link to dashboard after success */}
        {status === "sent" && (
          <div className="flex justify-center animate-fade-in-up">
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 border-primary/30 hover:bg-primary/10"
              >
                <Zap className="w-4 h-4 text-primary" />
                View in Dashboard
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
