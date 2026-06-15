import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import {
  createSubscriptionCheckout,
  getOrCreateStripeCustomer,
  upgradeSubscription,
  getPlannerPriceId,
  type PlannerTier,
} from "@/lib/stripe";

// POST /api/billing/checkout
// Body: { tier: "premium" | "elite", returnTo?: string }
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const tier = (body.tier as PlannerTier) ?? "premium";
    const returnTo = typeof body.returnTo === "string" ? body.returnTo : undefined;

    if (!["premium", "elite"].includes(tier)) {
      return NextResponse.json({ error: "Invalid plan tier" }, { status: 400 });
    }

    // Resolve price ID from DB settings (falls back to env vars)
    let priceId: string;
    try {
      priceId = await getPlannerPriceId(tier as "premium" | "elite");
    } catch {
      return NextResponse.json(
        { error: "Stripe is not configured. Go to Admin → Settings → Payments to set up Stripe." },
        { status: 503 }
      );
    }

    if (!priceId) {
      return NextResponse.json(
        {
          error: `${tier === "premium" ? "Premium" : "Elite"} plan Price ID is not set. Add it in Admin → Settings → Payments → Subscription Price IDs.`,
        },
        { status: 503 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, name: true, stripeCustomerId: true, stripeSubscriptionId: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const returnParam = returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : "";

    // If user already has an active subscription, upgrade it inline — no new checkout needed
    if (user.stripeSubscriptionId) {
      try {
        await upgradeSubscription({
          subscriptionId: user.stripeSubscriptionId,
          newPriceId: priceId,
        });
        await prisma.user.update({
          where: { id: session.user.id },
          data: { plannerTier: tier, plannerStatus: "active" },
        });
        return NextResponse.json({
          url: `${appUrl}/planner/billing?upgraded=1${returnParam}`,
        });
      } catch (e) {
        // Subscription may be cancelled in Stripe — fall through to new checkout
        console.error("Inline subscription upgrade failed:", e instanceof Error ? e.message : e);
      }
    }

    // Get or create Stripe customer and persist the ID
    const customerId = await getOrCreateStripeCustomer({
      email: user.email,
      name: user.name ?? undefined,
      existingCustomerId: user.stripeCustomerId,
    });

    if (!user.stripeCustomerId) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const checkoutSession = await createSubscriptionCheckout({
      priceId,
      customerId,
      metadata: {
        userId: session.user.id,
        plannerTier: tier,
      },
      successUrl: `${appUrl}/planner/billing?success=1&session_id={CHECKOUT_SESSION_ID}${returnParam}`,
      cancelUrl: `${appUrl}/planner/billing?cancelled=1${returnParam}`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (e) {
    // Catch all unhandled Stripe API errors (invalid key, invalid price ID, network, etc.)
    const message = e instanceof Error ? e.message : "An unexpected error occurred";
    console.error("Billing checkout error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
