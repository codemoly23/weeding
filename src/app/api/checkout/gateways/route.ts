import { NextResponse } from "next/server";
import { getStripeConfig, getPayPalConfig } from "@/lib/payment-settings";
import { logger } from "@/lib/logger";

interface GatewayConfig {
  enabled: boolean;
  mode: string;
  clientId?: string;
  publicKey?: string;
}

// GET /api/checkout/gateways - Get enabled payment gateways
export async function GET() {
  try {
    // Build response
    const gateways: string[] = [];
    const response: {
      gateways: string[];
      stripe?: GatewayConfig;
      paypal?: GatewayConfig;
    } = { gateways: [] };

    // Check Stripe
    try {
      const stripeConfig = await getStripeConfig();
      if (stripeConfig?.enabled && stripeConfig.publishableKey) {
        gateways.push("stripe");
        response.stripe = {
          enabled: true,
          mode: stripeConfig.mode,
          publicKey: stripeConfig.publishableKey,
        };
      }
    } catch (err) {
      logger.warn("Stripe gateway config unavailable", { error: String(err) });
    }

    // Check PayPal
    try {
      const paypalConfig = await getPayPalConfig();
      if (paypalConfig?.enabled && paypalConfig.clientId) {
        gateways.push("paypal");
        response.paypal = {
          enabled: true,
          mode: paypalConfig.mode,
          clientId: paypalConfig.clientId,
        };
      }
    } catch (err) {
      logger.warn("PayPal gateway config unavailable", { error: String(err) });
    }

    response.gateways = gateways;

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching gateways:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment gateways", gateways: [] },
      { status: 500 }
    );
  }
}
