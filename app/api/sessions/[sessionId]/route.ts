// ============================================================
// DebugDNA — GET /api/sessions/[sessionId]
// Returns full session detail with events and analysis
// Falls back to mock data if MongoDB is not available
// ============================================================

import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  try {
    // Try MongoDB first
    const { connectToDatabase } = await import("@/lib/mongodb");
    const SessionModel = (await import("@/models/Session")).default;
    await connectToDatabase();

    const session = await SessionModel.findOne({ sessionId }).lean();
    if (!session) {
      return NextResponse.json(
        { success: false, error: `Session not found: ${sessionId}` },
        { status: 404 }
      );
    }

    // Map to the format frontend expects
    const mapped = {
      id: (session as Record<string, unknown>).sessionId,
      status: (session as Record<string, unknown>).status,
      events: ((session as Record<string, unknown>).events as Array<Record<string, unknown>> || []).map(
        (e: Record<string, unknown>, i: number) => ({
          id: String(i + 1),
          type: e.type,
          message:
            e.type === "CRASH"
              ? e.error || "Crash"
              : e.type === "api_call"
              ? `${e.method || "GET"} ${e.endpoint || "unknown"} → ${e.status || "?"}`
              : e.type === "state_change"
              ? `${e.fn || "unknown"}(${e.args ? JSON.stringify(e.args) : ""})`
              : e.type === "user_action"
              ? String(e.value || "User action")
              : String(e.error || e.value || "Event"),
          timestamp: new Date(
            new Date((session as Record<string, unknown>).createdAt as string).getTime() + (e.t as number)
          ).toISOString(),
        })
      ),
      narrative: (session as Record<string, unknown>).analysis
        ? {
            story: ((session as Record<string, unknown>).analysis as Record<string, unknown>).story,
            rootCause: ((session as Record<string, unknown>).analysis as Record<string, unknown>).rootCause,
          }
        : null,
      fix: (session as Record<string, unknown>).analysis
        ? {
            code: ((session as Record<string, unknown>).analysis as Record<string, unknown>).fix,
            unitTest: ((session as Record<string, unknown>).analysis as Record<string, unknown>).test,
          }
        : null,
    };

    return NextResponse.json(mapped, { status: 200 });
  } catch {
    // MongoDB not available — fallback to mock data
    console.log("[sessions/detail] MongoDB not available, using mock data");
    return getMockSession(sessionId);
  }
}

function getMockSession(sessionId: string) {
  const isPending = sessionId.includes("pend");

  if (isPending) {
    return NextResponse.json({
      id: sessionId,
      status: "pending",
      events: [
        {
          id: "1",
          type: "user_action",
          message: "User clicked 'Submit Payment'",
          timestamp: new Date(Date.now() - 5000).toISOString(),
        },
        {
          id: "2",
          type: "api_call",
          message: "POST /api/payments → 200 OK",
          timestamp: new Date(Date.now() - 4000).toISOString(),
        },
        {
          id: "3",
          type: "state_change",
          message: "PaymentForm.state updated: { loading: true }",
          timestamp: new Date(Date.now() - 3500).toISOString(),
        },
      ],
      narrative: null,
      fix: null,
    });
  }

  return NextResponse.json({
    id: sessionId,
    status: "analyzed",
    events: [
      {
        id: "1",
        type: "user_action",
        message: "User navigated to /checkout",
        timestamp: new Date(Date.now() - 8000).toISOString(),
      },
      {
        id: "2",
        type: "api_call",
        message: "GET /api/user/profile → 200 OK (avatar: null)",
        timestamp: new Date(Date.now() - 7000).toISOString(),
      },
      {
        id: "3",
        type: "state_change",
        message: "UserContext.setProfile(data) — avatar field is null",
        timestamp: new Date(Date.now() - 6500).toISOString(),
      },
      {
        id: "4",
        type: "user_action",
        message: "User clicked 'Submit Payment'",
        timestamp: new Date(Date.now() - 5000).toISOString(),
      },
      {
        id: "5",
        type: "api_call",
        message: "POST /api/payments → 200 OK",
        timestamp: new Date(Date.now() - 4000).toISOString(),
      },
      {
        id: "6",
        type: "CRASH",
        message:
          "TypeError: Cannot read properties of null (reading 'src') at PaymentProcessor.renderReceipt (PaymentProcessor.tsx:42)",
        timestamp: new Date(Date.now() - 3000).toISOString(),
      },
    ],
    narrative: {
      story:
        "The user navigated to the checkout page and submitted a payment. The application fetched the user profile via GET /api/user/profile, which returned avatar: null. The PaymentProcessor.renderReceipt() function attempted to access user.avatar.src to render a receipt header, but no null check guard was in place.",
      rootCause:
        "PaymentProcessor.renderReceipt() accesses user.avatar.src without checking whether avatar is null. The /api/user/profile endpoint returns null for users without a profile picture.",
    },
    fix: {
      code: `// Before (crashes when avatar is null)
const avatarUrl = user.avatar.src;

// After (safe with fallback)
const avatarUrl = user.avatar?.src ?? '/default-avatar.png';`,
      unitTest: `describe('PaymentProcessor', () => {
  it('should render receipt without crashing when avatar is null', () => {
    const user = { id: 1, name: 'Test User', avatar: null };
    const { container } = render(<PaymentProcessor user={user} />);
    expect(container).toBeTruthy();
  });

  it('should use default avatar when user has no avatar', () => {
    const user = { id: 1, name: 'Test User', avatar: null };
    const { getByAltText } = render(<PaymentProcessor user={user} />);
    expect(getByAltText('User avatar').src).toContain('default-avatar');
  });
});`,
    },
  });
}
