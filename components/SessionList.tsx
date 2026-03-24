"use client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink, Clock, Bug, Server, AlertCircle } from "lucide-react";

export interface SessionData {
  id: string;
  timestamp: string;
  status: "analyzed" | "pending";
  appName: string;
  errorType: string;
}

export default function SessionList({ sessions }: { sessions: SessionData[] }) {
  const router = useRouter();

  return (
    <div className="border border-border/60 rounded-xl bg-card/50 backdrop-blur-sm text-card-foreground shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
            <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              Session ID
            </TableHead>
            <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Time</span>
            </TableHead>
            <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5"><Bug className="w-3.5 h-3.5" /> Error</span>
            </TableHead>
            <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5"><Server className="w-3.5 h-3.5" /> App</span>
            </TableHead>
            <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              Status
            </TableHead>
            <TableHead className="text-right text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session, i) => (
            <TableRow
              key={session.id}
              className="cursor-pointer hover:bg-primary/5 transition-colors duration-200 border-b border-border/30 last:border-0 group"
              onClick={() => router.push(`/session/${session.id}`)}
            >
              <TableCell className="font-mono text-sm text-primary/80 group-hover:text-primary transition-colors">
                {session.id}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground" suppressHydrationWarning>
                {formatDistanceToNow(new Date(session.timestamp), { addSuffix: true })}
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1.5 font-mono text-destructive text-xs bg-destructive/10 px-2.5 py-1 rounded-md border border-destructive/20">
                  <AlertCircle className="w-3 h-3" />
                  {session.errorType}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">{session.appName}</span>
              </TableCell>
              <TableCell>
                <Badge
                  variant={session.status === "analyzed" ? "default" : "secondary"}
                  className={
                    session.status === "analyzed"
                      ? "bg-primary/15 text-primary border border-primary/30 hover:bg-primary/20"
                      : "bg-amber-400/10 text-amber-400 border border-amber-400/30 hover:bg-amber-400/15"
                  }
                >
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${session.status === "analyzed" ? "bg-primary" : "bg-amber-400 animate-pulse"}`} />
                  {session.status === "analyzed" ? "Analyzed" : "Pending"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/session/${session.id}`);
                  }}
                >
                  View
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {sessions.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <Bug className="w-8 h-8 text-muted-foreground/50" />
                  <p className="font-medium">No crash sessions found</p>
                  <p className="text-sm">Sessions will appear here when errors are captured.</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
