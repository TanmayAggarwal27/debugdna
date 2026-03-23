import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "../components/ui/card";
import { Copy, Terminal } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-4">
      <div className="max-w-3xl w-full flex flex-col items-center space-y-12 text-center">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white drop-shadow-sm">
            Your app crashed. <br />
            <span className="text-primary mt-2 block">We explain why.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            DebugDNA captures application errors intuitively, traces root causes down to specific lines of code, and automatically generates the fix.
          </p>
        </div>

        <Card className="w-full max-w-xl p-4 bg-muted/30 border-muted-foreground/30 backdrop-blur-sm self-center">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground font-medium px-1">
              <Terminal className="w-4 h-4" />
              <span>Install SDK</span>
            </div>
            <div className="flex items-center justify-between bg-black/40 rounded-md p-3 font-mono text-sm border border-black/50 group hover:border-primary/50 transition-colors">
              <span className="text-gray-300">npm install @debugdna/sdk</span>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10" disabled>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        <Link href="/dashboard">
          <Button size="lg" className="h-14 px-8 text-lg font-semibold rounded-full shadow-lg hover:shadow-primary/20 transition-all hover:-translate-y-1">
            View Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
