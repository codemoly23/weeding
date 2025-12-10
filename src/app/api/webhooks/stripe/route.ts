import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { constructWebhookEvent } from "@/lib/stripe";
import Stripe from "stripe";

// Disable body parsing, we need raw body for webhook verification
export const runtime = "nodejs";

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  // Extract metadata
  const metadata = session.metadata;

  if (!metadata) {
    console.error("No metadata found in session");
    return;
  }

  const orderData = {
    stripeSessionId: session.id,
    stripePaymentIntentId: session.payment_intent as string,
    customerEmail: session.customer_email,
    customerName: metadata.customerName,
    customerPhone: metadata.customerPhone,
    customerCountry: metadata.customerCountry,
    serviceId: metadata.serviceId,
    packageId: metadata.packageId,
    stateCode: metadata.stateCode,
    llcName: metadata.llcName,
    llcActivity: metadata.llcActivity,
    members: metadata.members ? JSON.parse(metadata.members) : [],
    amountTotal: session.amount_total ? session.amount_total / 100 : 0,
    currency: session.currency,
    paymentStatus: session.payment_status,
    status: "processing",
  };

  console.log("Order created:", orderData);

  // In production:
  // 1. Create order in database using Prisma
  // 2. Send confirmation email to customer
  // 3. Create activity log entry
  // 4. Notify admin team

  // Example Prisma code (uncomment when database is ready):
  /*
  import { prisma } from "@/lib/prisma";

  const order = await prisma.order.create({
    data: {
      stripeSessionId: orderData.stripeSessionId,
      stripePaymentIntentId: orderData.stripePaymentIntentId,
      status: "PROCESSING",
      paymentStatus: "PAID",
      total: orderData.amountTotal,
      user: {
        connectOrCreate: {
          where: { email: orderData.customerEmail },
          create: {
            email: orderData.customerEmail,
            name: orderData.customerName,
            phone: orderData.customerPhone,
            country: orderData.customerCountry,
          },
        },
      },
      items: {
        create: {
          serviceId: orderData.serviceId,
          packageId: orderData.packageId,
          stateCode: orderData.stateCode,
          llcName: orderData.llcName,
          llcActivity: orderData.llcActivity,
          price: orderData.amountTotal,
        },
      },
    },
  });
  */
}

async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
) {
  console.log("Payment succeeded:", paymentIntent.id);

  // Update order payment status in database
  // Send payment confirmation email
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log("Payment failed:", paymentIntent.id);

  // Update order status in database
  // Send payment failure notification to customer
  // Alert admin team
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      console.error("No Stripe signature found");
      return NextResponse.json(
        { error: "No signature" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = constructWebhookEvent(body, signature);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(paymentIntent);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        // Handle subscription events for recurring services
        console.log("Subscription event:", event.type);
        break;
      }

      case "invoice.paid":
      case "invoice.payment_failed": {
        // Handle invoice events
        console.log("Invoice event:", event.type);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
