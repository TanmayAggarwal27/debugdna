// ============================================================
// DebugDNA — POST /api/ingest
// Receives events from the browser SDK and stores them in MongoDB.
// If a CRASH event is detected, triggers analysis in the background.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Session from "@/models/Session";
import type { IngestPayload, Event } from "@/types";

// ── CORS helper ──────────────────────────────────────────────
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

// ── OPTIONS (preflight) ──────────────────────────────────────
export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// ── POST handler ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
    try {
        // 1. Parse the incoming payload
        const body = (await request.json()) as IngestPayload;
        const { sessionId, projectId, events } = body;

        if (!sessionId || !projectId || !Array.isArray(events)) {
            return NextResponse.json(
                { success: false, error: "Missing required fields: sessionId, projectId, events[]" },
                { status: 400, headers: corsHeaders }
            );
        }

        // 2. Connect to MongoDB
        await connectToDatabase();

        // 3. Find existing session or create a new one
        let session = await Session.findOne({ sessionId });

        if (!session) {
            session = new Session({
                sessionId,
                projectId,
                status: "pending",
                events: [],
                analysis: null,
                crashedAt: null,
            });
        }

        // 4. Append events — deduplicate by checking timestamp `t`
        const existingTimestamps = new Set(
            session.events.map((e: Event) => e.t)
        );

        const newEvents = events.filter(
            (e: Event) => !existingTimestamps.has(e.t)
        );

        if (newEvents.length > 0) {
            session.events.push(...newEvents);
        }

        // 5. Check if any incoming event is a CRASH
        const hasCrash = events.some((e: Event) => e.type === "CRASH");

        if (hasCrash && !session.crashedAt) {
            const crashEvent = events.find((e: Event) => e.type === "CRASH");
            // Use the crash event's timestamp offset + session creation time,
            // or just use now as a sensible fallback
            session.crashedAt = new Date();

            // Save before triggering analysis so the analyze route can read it
            await session.save();

            // 6. Fire-and-forget: trigger analysis in the background
            const baseUrl =
                process.env.NEXT_PUBLIC_BASE_URL ||
                `${request.nextUrl.protocol}//${request.nextUrl.host}`;

            // We don't await — the SDK gets a fast response
            fetch(`${baseUrl}/api/analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId }),
            }).catch((err) => {
                console.error("[ingest] Failed to trigger /api/analyze:", err);
            });
        } else {
            await session.save();
        }

        return NextResponse.json(
            { success: true },
            { status: 200, headers: corsHeaders }
        );
    } catch (error) {
        console.error("[ingest] Error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}
