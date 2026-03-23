"use client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

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
    <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead>Session ID</TableHead>
            <TableHead>Time of Crash</TableHead>
            <TableHead>Error Type</TableHead>
            <TableHead>App</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session.id} className="cursor-default hover:bg-muted/30">
              <TableCell className="font-mono text-sm">{session.id}</TableCell>
              <TableCell suppressHydrationWarning>
                {formatDistanceToNow(new Date(session.timestamp), { addSuffix: true })}
              </TableCell>
              <TableCell>
                <span className="font-mono text-destructive text-sm bg-destructive/10 px-2 py-1 rounded">
                  {session.errorType}
                </span>
              </TableCell>
              <TableCell>{session.appName}</TableCell>
              <TableCell>
                <Badge variant={session.status === "analyzed" ? "default" : "secondary"} className={session.status === "analyzed" ? "bg-primary text-primary-foreground" : ""}>
                  {session.status === "analyzed" ? "Analyzed" : "Pending"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" onClick={() => router.push(`/session/${session.id}`)}>
                  View Detail
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {sessions.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                No crash sessions found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
