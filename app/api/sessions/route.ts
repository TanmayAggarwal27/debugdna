// ============================================================
// DebugDNA — GET /api/sessions
// Returns all sessions or a single session if sessionId query param is provided
// Falls back to mock data if MongoDB is not available
// ============================================================

import { NextRequest, NextResponse } from "next/server";

// ── Mock data fallback ───────────────────────────────────────
const mockSessions = [
  {
    id: "sess_x9u82ndk1",
    sessionId: "sess_x9u82ndk1",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    status: "analyzed",
    appName: "payments-service",
    errorType: "NullPointerException",
    crashedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: "sess_p39jdnc8x",
    sessionId: "sess_p39jdnc8x",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    status: "pending",
    appName: "auth-gateway",
    errorType: "TimeoutError",
    crashedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: "sess_y83ncfm92",
    sessionId: "sess_y83ncfm92",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    status: "analyzed",
    appName: "user-dashboard",
    errorType: "TypeError",
    crashedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 125).toISOString(),
  },
  {
    id: "sess_k47mzq12w",
    sessionId: "sess_k47mzq12w",
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    status: "analyzed",
    appName: "notification-svc",
    errorType: "ReferenceError",
    crashedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 245).toISOString(),
  },
  {
    id: "sess_a12bpend1",
    sessionId: "sess_a12bpend1",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    status: "pending",
    appName: "search-engine",
    errorType: "SyntaxError",
    crashedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
];

// ── GET handler ──────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    // Try to connect to MongoDB first
    const { connectToDatabase } = await import("@/lib/mongodb");
    const SessionModel = (await import("@/models/Session")).default;
    await connectToDatabase();

    const { searchParams } = request.nextUrl;
    const sessionId = searchParams.get("sessionId");

    if (sessionId) {
      const session = await SessionModel.findOne({ sessionId }).lean();
      if (!session) {
        return NextResponse.json(
          { success: false, error: `Session not found: ${sessionId}` },
          { status: 404 }
        );
      }
      return NextResponse.json(session, { status: 200 });
    }

    const sessions = await SessionModel.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .select("sessionId status crashedAt createdAt")
      .lean();

    // Map MongoDB sessions to the format the frontend expects
    const mapped = sessions.map((s: Record<string, unknown>) => ({
      id: s.sessionId,
      sessionId: s.sessionId,
      timestamp: s.crashedAt || s.createdAt,
      status: s.status,
      appName: (s as Record<string, unknown>).projectId || "unknown",
      errorType: "Error",
      crashedAt: s.crashedAt,
      createdAt: s.createdAt,
    }));

    return NextResponse.json(mapped, { status: 200 });
  } catch {
    // MongoDB not available — fallback to mock data
    console.log("[sessions] MongoDB not available, using mock data");
    return NextResponse.json(mockSessions, { status: 200 });
  }
}
