"use client";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Copy, Check, Brain, AlertTriangle, Code2, TestTube } from "lucide-react";
import { useState } from "react";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute right-3 top-3 p-1.5 bg-white/5 hover:bg-white/10 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 border border-white/10"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-primary" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
      )}
    </button>
  );
}

export function NarrativeCard({
  narrative,
}: {
  narrative: { story: string; rootCause: string };
}) {
  if (!narrative) return null;

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/60 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary" />
          </div>
          AI Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider flex items-center gap-1.5">
            What happened
          </h3>
          <p className="text-sm leading-relaxed text-foreground/90">{narrative.story}</p>
        </div>
        <div className="bg-destructive/5 p-4 rounded-lg border border-destructive/20">
          <h3 className="font-semibold text-destructive uppercase text-xs tracking-wider flex items-center gap-1.5 mb-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Root Cause
          </h3>
          <p className="text-sm font-medium text-foreground/90 leading-relaxed">
            {narrative.rootCause}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function FixCard({
  fix,
}: {
  fix: { code: string; unitTest: string };
}) {
  if (!fix) return null;

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/60 h-full overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Code2 className="w-4 h-4 text-blue-400" />
          </div>
          Suggested Fix
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider mb-2 flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5" />
            Code Changes
          </h3>
          <div className="bg-[#0d1117] p-4 rounded-lg border border-white/5 text-sm font-mono overflow-auto relative group">
            <CopyButton text={fix.code} />
            <pre className="text-green-400 whitespace-pre-wrap">
              <code>{fix.code}</code>
            </pre>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider mb-2 flex items-center gap-1.5">
            <TestTube className="w-3.5 h-3.5" />
            Unit Test
          </h3>
          <div className="bg-[#0d1117] p-4 rounded-lg border border-white/5 text-sm font-mono overflow-auto relative group">
            <CopyButton text={fix.unitTest} />
            <pre className="text-cyan-400 whitespace-pre-wrap">
              <code>{fix.unitTest}</code>
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
