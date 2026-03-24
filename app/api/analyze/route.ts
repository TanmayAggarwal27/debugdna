// ============================================================
// DebugDNA — POST /api/analyze
// Called internally after a CRASH is detected in /api/ingest.
// Fetches the session, runs causal graph + Gemini analysis,
// and saves results back to the session.
// ============================================================

import { NextRequest, NextResponse } from "next/server";

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
    const { connectToDatabase } = await import("@/lib/mongodb");
    const SessionModel = (await import("@/models/Session")).default;
    await connectToDatabase();

    const session = await SessionModel.findOne({ sessionId });

    if (!session) {
      return NextResponse.json(
        { success: false, error: `Session not found: ${sessionId}` },
        { status: 404 }
      );
    }

    // 2. Run causal graph + Gemini analysis
    let analysis;

    try {
      const { buildCausalGraph } = await import("@/lib/causalGraph");
      const { analyzeWithGemini } = await import("@/lib/gemini");

      const causalGraph = buildCausalGraph(session.events);
      if (!causalGraph) {
        throw new Error(
          "No CRASH event found in session — cannot build causal graph."
        );
      }
      analysis = await analyzeWithGemini(causalGraph, session.events);
    } catch (moduleError) {
      console.warn(
        "[analyze] Module C analysis failed, using placeholder.",
        moduleError
      );

      analysis = {
        story:
          "Analysis is not yet available. The causal graph and Gemini modules encountered an error.",
        rootCause: "Pending analysis — check Module C integration.",
        fix: "// Fix will be provided once analysis completes.",
        test: "// Test will be provided once analysis completes.",
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
