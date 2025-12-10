import Stripe from "stripe";

// Create a lazy-loaded stripe instance to avoid build-time errors
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-11-17.clover",
      typescript: true,
    });
  }
  return stripeInstance;
}

interface LineItem {
  price_data: {
    currency: string;
    product_data: {
      name: string;
      description?: string;
    };
    unit_amount: number;
  };
  quantity: number;
}

export async function createCheckoutSession({
  lineItems,
  customerEmail,
  metadata,
  successUrl,
  cancelUrl,
}: {
  lineItems: LineItem[];
  customerEmail?: string;
  metadata?: Record<string, string>;
  successUrl?: string;
  cancelUrl?: string;
}) {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/checkout?cancelled=true`,
    customer_email: customerEmail,
    metadata: metadata || {},
  });

  return session;
}

export async function getCheckoutSession(sessionId: string) {
  const stripe = getStripe();
  return stripe.checkout.sessions.retrieve(sessionId);
}

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
