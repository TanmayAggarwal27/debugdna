// ============================================================
// DebugDNA — POST /api/analyze
// Called internally after a CRASH is detected in /api/ingest.
// Fetches the session, runs Module C's causal graph + Gemini,
// and saves the analysis back to the session.
//
// Graceful fallback: if Module C files aren't built yet,
// returns a placeholder analysis so this route never crashes.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Session from "@/models/Session";
import type { Analysis } from "@/types";

// ── POST handler ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { sessionId } = body;

        if (!sessionId) {
            return NextResponse.json(
                { success: false, error: "Missing required field: sessionId" },
                { status: 400 }
            );
        }

        // 1. Connect to MongoDB and fetch the full session
        await connectToDatabase();
        const session = await Session.findOne({ sessionId });

        if (!session) {
            return NextResponse.json(
                { success: false, error: `Session not found: ${sessionId}` },
                { status: 404 }
            );
        }

        // 2. Attempt to run Module C logic (causal graph + Gemini)
        let analysis: Analysis;

        try {
            // Dynamic imports so this file doesn't hard-fail if Module C isn't ready
            // @ts-ignore — Module C file, built by Tanmay. Gracefully caught below.
            const { buildCausalGraph } = await import("@/lib/causalGraph");
            // @ts-ignore — Module C file, built by Tanmay. Gracefully caught below.
            const { analyzeWithGemini } = await import("@/lib/gemini");

            const causalGraph = buildCausalGraph(session.events);
            analysis = await analyzeWithGemini(causalGraph, session.events);
        } catch (moduleError) {
            // Module C hasn't been built yet — return a placeholder analysis
            console.warn(
                "[analyze] Module C not available yet, using placeholder analysis.",
                moduleError
            );

            analysis = {
                story:
                    "Analysis is not yet available. The causal graph and Gemini modules have not been integrated yet.",
                rootCause: "Pending Module C integration.",
                fix: "// Module C will provide the code fix once integrated.",
                test: "// Module C will provide the unit test once integrated.",
                affectedFunction: "unknown",
            };
        }

        // 3. Save the analysis back to the session
        session.analysis = analysis;
        session.status = "analyzed";
        await session.save();

        return NextResponse.json(
            { success: true, analysis },
            { status: 200 }
        );
    } catch (error) {
        console.error("[analyze] Error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
