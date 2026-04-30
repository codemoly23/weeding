import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createCheckoutSession } from "@/lib/stripe";
import { prisma } from "@/lib/db";

const paySchema = z.object({
  gateway: z.enum(["stripe", "paypal"]),
});

// POST /api/orders/[id]/pay — Create payment session for an existing order
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderIdentifier } = await params;
    const body = await request.json();
    const { gateway } = paySchema.parse(body);

    // Find order by orderNumber or id
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: orderIdentifier },
          { id: orderIdentifier },
        ],
      },
      include: {
        items: {
          include: {
            service: true,
            package: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Don't allow payment for already paid orders
    if (order.paymentStatus === "PAID") {
      return NextResponse.json(
        { error: "Order is already paid" },
        { status: 400 }
      );
    }

    if (gateway === "stripe") {
      // Build line items from order items
      const lineItems = order.items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            description: item.description || undefined,
          },
          unit_amount: Math.round(Number(item.priceUSD) * 100),
        },
        quantity: Number.isInteger(item.quantity) && item.quantity > 0 ? item.quantity : 1,
      }));

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

      const session = await createCheckoutSession({
        lineItems,
        customerEmail: order.customerEmail || undefined,
        metadata: {
          orderId: order.orderNumber,
        },
        successUrl: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&orderId=${order.orderNumber}`,
        cancelUrl: `${appUrl}/checkout/success?orderId=${order.orderNumber}`,
      });

      return NextResponse.json({
        url: session.url,
        sessionId: session.id,
      });
    }

    // For PayPal, return order info (frontend PayPalButton handles the flow)
    return NextResponse.json({
      orderNumber: order.orderNumber,
      amount: Number(order.totalUSD),
      currency: order.currency || "USD",
    });
  } catch (error) {
    console.error("Pay route error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create payment session" },
      { status: 500 }
    );
  }
}
