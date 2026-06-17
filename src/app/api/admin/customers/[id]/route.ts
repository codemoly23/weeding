import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allowed = ["ADMIN", "SUPER_ADMIN", "SUPPORT_AGENT", "SALES_AGENT"];
  if (!allowed.includes(session.user.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const customer = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      country: true,
      isActive: true,
      createdAt: true,
      orders: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          totalUSD: true,
          createdAt: true,
          items: { take: 1, select: { name: true } },
        },
      },
      customerTickets: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          ticketNumber: true,
          subject: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });

  if (!customer || customer.id === session.user.id) {
    // allow any admin to view any customer
  }
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const paidOrders = customer.orders.filter((o) => o.paymentStatus === "PAID");
  const totalSpent = paidOrders.reduce((sum, o) => sum + Number(o.totalUSD), 0);

  return NextResponse.json({
    customer: {
      id: customer.id,
      name: customer.name || customer.email,
      email: customer.email,
      phone: customer.phone,
      country: customer.country,
      isActive: customer.isActive,
      joinedAt: customer.createdAt.toISOString(),
      stats: {
        totalOrders: customer.orders.length,
        totalSpent,
        avgOrderValue: customer.orders.length > 0 ? Math.round(totalSpent / customer.orders.length) : 0,
      },
      orders: customer.orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        service: o.items[0]?.name || "Order",
        status: o.status,
        paymentStatus: o.paymentStatus,
        amount: Number(o.totalUSD),
        date: o.createdAt.toISOString(),
      })),
      tickets: customer.customerTickets.map((t) => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        subject: t.subject,
        status: t.status,
        date: t.createdAt.toISOString(),
      })),
    },
  });
}
