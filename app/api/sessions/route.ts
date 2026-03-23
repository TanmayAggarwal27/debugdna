import { NextResponse } from "next/server";

const mockSessions = [
  {
    id: "sess_x9u82ndk1",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    status: "analyzed",
    appName: "payments-service",
    errorType: "NullPointerException",
  },
  {
    id: "sess_p39jdnc8x",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    status: "pending",
    appName: "auth-gateway",
    errorType: "TimeoutError",
  },
  {
    id: "sess_y83ncfm92",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    status: "analyzed",
    appName: "user-dashboard",
    errorType: "TypeError",
  },
];

export async function GET() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  return NextResponse.json(mockSessions);
}
