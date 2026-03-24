import Link from "next/link";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Copy, Terminal, ArrowRight, Zap, Shield, Brain, Activity } from "lucide-react";

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute inset-0 radial-glow pointer-events-none" />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-[15%] w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-32 right-[10%] w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-float delay-300 pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <span className="text-lg font-bold tracking-tight">DebugDNA</span>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="gap-2 border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all">
            Dashboard <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-20">
        <div className="max-w-4xl w-full flex flex-col items-center space-y-14 text-center">
          {/* Badge */}
          <div className="animate-fade-in-up opacity-0">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-sm text-primary font-medium">
              <Activity className="w-3.5 h-3.5" />
              AI-Powered Crash Intelligence
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-6 animate-fade-in-up opacity-0 delay-100">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05]">
              Your app crashed.
              <br />
              <span className="bg-gradient-to-r from-primary via-emerald-400 to-teal-300 bg-clip-text text-transparent animate-gradient-shift">
                We explain why.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              DebugDNA captures application errors, traces root causes down to 
              specific lines of code, and automatically generates the fix — 
              powered by AI.
            </p>
          </div>

          {/* SDK Install Card */}
          <div className="w-full max-w-xl animate-fade-in-up opacity-0 delay-200">
            <Card className="p-4 glass animate-pulse-glow">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground font-medium px-1">
                  <Terminal className="w-4 h-4 text-primary" />
                  <span>Quick Start</span>
                </div>
                <div className="flex items-center justify-between bg-black/50 rounded-lg p-3.5 font-mono text-sm border border-white/5 group hover:border-primary/30 transition-all duration-300">
                  <span className="text-gray-300">
                    <span className="text-muted-foreground select-none">$ </span>npm install @debugdna/sdk
                  </span>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-primary hover:bg-primary/10 transition-colors" disabled>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* CTA Button */}
          <div className="animate-fade-in-up opacity-0 delay-300">
            <Link href="/dashboard">
              <Button 
                size="lg" 
                className="h-14 px-10 text-lg font-semibold rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:brightness-110 transition-all duration-300 hover:-translate-y-1 gap-2"
              >
                View Dashboard
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* Feature Pills */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl pt-8 animate-fade-in-up opacity-0 delay-400">
            <FeatureCard
              icon={<Brain className="w-5 h-5 text-primary" />}
              title="AI Root Cause"
              description="Gemini analyzes crash traces and explains what went wrong in plain English"
            />
            <FeatureCard
              icon={<Zap className="w-5 h-5 text-amber-400" />}
              title="Auto-Fix"
              description="Get the exact code fix and a unit test that would have prevented the bug"
            />
            <FeatureCard
              icon={<Shield className="w-5 h-5 text-blue-400" />}
              title="Zero Config"
              description="Drop in the SDK — it captures errors, API calls, and user actions automatically"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center text-sm text-muted-foreground py-6 border-t border-border/30">
        Built with Next.js, Gemini AI & MongoDB
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group flex flex-col items-center text-center p-6 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm hover:border-primary/30 hover:bg-card/60 transition-all duration-300">
      <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-semibold text-sm mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
