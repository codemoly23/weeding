import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe";
import prisma from "@/lib/db";

export const config = { api: { bodyParser: false } };

// POST /api/billing/webhook — Stripe webhook handler
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event;
  try {
    event = await constructWebhookEvent(rawBody, signature);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as {
          metadata?: { userId?: string; plannerTier?: string };
          customer?: string;
          subscription?: string;
        };
        const userId = session.metadata?.userId;
        const tier = session.metadata?.plannerTier as "premium" | "elite" | undefined;

        if (userId && tier) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              plannerTier: tier,
              plannerStatus: "active",
              stripeCustomerId: session.customer as string ?? undefined,
              stripeSubscriptionId: session.subscription as string ?? undefined,
            },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as {
          id: string;
          status: string;
          current_period_end: number;
          metadata?: { plannerTier?: string };
        };
        const tier = sub.metadata?.plannerTier as "premium" | "elite" | undefined;

        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: sub.id },
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              plannerStatus: sub.status,
              plannerPeriodEnd: new Date(sub.current_period_end * 1000),
              ...(tier ? { plannerTier: tier } : {}),
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as { id: string };

        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: sub.id },
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              plannerTier: "basic",
              plannerStatus: "canceled",
              stripeSubscriptionId: null,
              plannerPeriodEnd: null,
            },
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as { subscription?: string };
        if (invoice.subscription) {
          const user = await prisma.user.findFirst({
            where: { stripeSubscriptionId: invoice.subscription as string },
          });
          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: { plannerStatus: "past_due" },
            });
          }
        }
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
