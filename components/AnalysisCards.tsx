"use client";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Copy } from "lucide-react";

export function NarrativeCard({ narrative }: { narrative: { story: string; rootCause: string } }) {
  if (!narrative) return null;

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-xl">AI Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">What happened</h3>
          <p className="mt-1 text-sm">{narrative.story}</p>
        </div>
        <div className="bg-destructive/10 p-3 rounded-md border border-destructive/20">
          <h3 className="font-semibold text-destructive uppercase text-xs tracking-wider">Root Cause</h3>
          <p className="mt-1 text-sm font-medium">{narrative.rootCause}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function FixCard({ fix }: { fix: { code: string; unitTest: string } }) {
  if (!fix) return null;

  return (
    <Card className="bg-card h-full">
      <CardHeader>
        <CardTitle className="text-xl">Suggested Fix</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider mb-2">Code Changes</h3>
          <div className="bg-[#0d1117] p-4 rounded-md border text-sm font-mono overflow-auto relative group">
            <button className="absolute right-2 top-2 p-1 bg-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              <Copy className="h-4 w-4 text-white" />
            </button>
            <pre className="text-green-400">
              <code>{fix.code}</code>
            </pre>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider mb-2">Unit Test</h3>
          <div className="bg-[#0d1117] p-4 rounded-md border text-sm font-mono overflow-auto relative group">
            <button className="absolute right-2 top-2 p-1 bg-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              <Copy className="h-4 w-4 text-white" />
            </button>
            <pre className="text-cyan-400">
              <code>{fix.unitTest}</code>
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
