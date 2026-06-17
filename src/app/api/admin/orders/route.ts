import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { generateOrderNumber } from "@/lib/order-utils";
import { createAdminNotification } from "@/lib/admin-notifications";

const ADMIN_ROLES = new Set(["ADMIN", "SALES_AGENT", "SUPPORT_AGENT"]);

const itemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  priceUSD: z.number().min(0, "Price must be 0 or more"),
  quantity: z.number().int().min(1).default(1),
});

const schema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Valid email is required"),
  customerPhone: z.string().optional(),
  customerCountry: z.string().optional(),
  userId: z.string().optional(),
  status: z.enum(["PENDING", "PROCESSING", "IN_PROGRESS", "WAITING_FOR_INFO", "COMPLETED", "CANCELLED", "REFUNDED"]).default("PENDING"),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).default("PENDING"),
  currency: z.string().default("USD"),
  note: z.string().optional(),
  items: z.array(itemSchema).min(1, "At least one item is required"),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !ADMIN_ROLES.has(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return NextResponse.json({ error: firstError.message }, { status: 400 });
  }

  const data = parsed.data;
  const subtotal = data.items.reduce((sum, item) => sum + item.priceUSD * item.quantity, 0);
  const orderNumber = await generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: data.userId ?? session.user.id,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      customerCountry: data.customerCountry,
      status: data.status,
      paymentStatus: data.paymentStatus,
      currency: data.currency,
      subtotalUSD: subtotal,
      totalUSD: subtotal,
      items: {
        create: data.items.map((item) => ({
          name: item.name,
          description: item.description,
          priceUSD: item.priceUSD,
          quantity: item.quantity,
        })),
      },
      ...(data.note
        ? {
            notes: {
              create: [{ content: data.note, isInternal: true, authorId: session.user.id }],
            },
          }
        : {}),
    },
  });

  await createAdminNotification({
    type: "NEW_ORDER",
    title: "New Order Created",
    message: `Order ${orderNumber} created manually by admin for ${data.customerName}.`,
    link: `/admin/orders/${order.id}`,
  });

  return NextResponse.json({ success: true, orderId: order.id, orderNumber });
}
