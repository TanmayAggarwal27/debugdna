// ============================================================
// DebugDNA — GET /api/sessions
// Two behaviors:
//   GET /api/sessions          → list all sessions (summary only)
//   GET /api/sessions?sessionId=xxx → full single session detail
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Session from "@/models/Session";

// ── GET handler ──────────────────────────────────────────────
export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        const { searchParams } = request.nextUrl;
        const sessionId = searchParams.get("sessionId");

        // ── Single session detail ────────────────────────────────
        if (sessionId) {
            const session = await Session.findOne({ sessionId }).lean();

            if (!session) {
                return NextResponse.json(
                    { success: false, error: `Session not found: ${sessionId}` },
                    { status: 404 }
                );
            }

            return NextResponse.json(session, { status: 200 });
        }

        // ── List all sessions (summary projection) ──────────────
        const sessions = await Session.find({})
            .sort({ createdAt: -1 })
            .limit(50)
            .select("sessionId status crashedAt createdAt")
            .lean();

        return NextResponse.json(sessions, { status: 200 });
    } catch (error) {
        console.error("[sessions] Error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
