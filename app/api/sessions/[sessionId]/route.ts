import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  
  await new Promise(r => setTimeout(r, 800)); // Simulate delay

  // Simulated session data
  const isPending = sessionId.includes("pend"); // Mock condition
  
  if (isPending) {
    return NextResponse.json({
      id: sessionId,
      status: "pending",
      events: [
        { id: "1", type: "user_action", message: "User clicked 'Submit Payment'", timestamp: new Date(Date.now() - 5000).toISOString() },
        { id: "2", type: "api_call", message: "POST /api/payments", timestamp: new Date(Date.now() - 4000).toISOString() },
      ],
      narrative: null,
      fix: null,
    });
  }

  return NextResponse.json({
    id: sessionId,
    status: "analyzed",
    events: [
      { id: "1", type: "user_action", message: "User clicked 'Submit Payment'", timestamp: new Date(Date.now() - 5000).toISOString() },
      { id: "2", type: "api_call", message: "POST /api/payments", timestamp: new Date(Date.now() - 4000).toISOString() },
      { id: "3", type: "CRASH", message: "NullPointerException in PaymentProcessor.java:42", timestamp: new Date(Date.now() - 3000).toISOString() },
    ],
    narrative: {
      story: "The user attempted to submit a payment without a valid payment method selected. The application hit an unhandled null object when trying to access `user.paymentMethod.id`.",
      rootCause: "Missing null check for user.paymentMethod before accessing its properties."
    },
    fix: {
      code: `// Before
String methodId = user.paymentMethod.id;

// After
if (user.paymentMethod == null) {
  throw new ValidationException("Payment method is required");
}
String methodId = user.paymentMethod.id;`,
      unitTest: `@Test(expected = ValidationException.class)\npublic void testMissingPaymentMethod() {\n  User user = new User();\n  paymentProcessor.process(user);\n}`
    }
  });
}
