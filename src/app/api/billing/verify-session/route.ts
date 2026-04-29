import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import Stripe from "stripe";
import { getStripeConfig } from "@/lib/payment-settings";

// POST /api/billing/verify-session
// Body: { sessionId: string }
// Verifies a Stripe checkout session and updates the DB — webhook fallback.
// Returns { tier } so the billing page can display the correct plan immediately.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const sessionId = body.sessionId as string | undefined;
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  const config = await getStripeConfig();
  if (!config?.secretKey) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const stripe = new Stripe(config.secretKey, {
    apiVersion: "2025-11-17.clover",
    typescript: true,
  });

  let checkoutSession: Stripe.Checkout.Session;
  try {
    checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
  }

  // Verify this session belongs to the logged-in user
  const metaUserId = checkoutSession.metadata?.userId;
  if (metaUserId && metaUserId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const tier = checkoutSession.metadata?.plannerTier as "premium" | "elite" | undefined;
  if (!tier || !["premium", "elite"].includes(tier)) {
    return NextResponse.json({ error: "No valid tier in session" }, { status: 400 });
  }

  // Only update DB if payment is confirmed (idempotent — safe to call even if webhook already ran)
  if (checkoutSession.payment_status === "paid") {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        plannerTier: tier,
        plannerStatus: "active",
        stripeCustomerId: checkoutSession.customer as string,
        stripeSubscriptionId: checkoutSession.subscription as string,
      },
    });
  }

  return NextResponse.json({ tier });
}
