import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allowed = ["ADMIN", "SUPER_ADMIN", "SUPPORT_AGENT", "SALES_AGENT"];
  if (!allowed.includes(session.user.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = 20;
  const search = searchParams.get("q")?.trim() || "";

  const where = {
    role: "CUSTOMER" as const,
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [customers, total, totalRevenue] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        country: true,
        isActive: true,
        createdAt: true,
        _count: { select: { orders: true } },
        orders: {
          select: { totalUSD: true, paymentStatus: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.user.count({ where }),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { totalUSD: true },
    }),
  ]);

  const rows = customers.map((c) => {
    const paidOrders = c.orders.filter((o) => o.paymentStatus === "PAID");
    const totalSpent = paidOrders.reduce((sum, o) => sum + Number(o.totalUSD), 0);
    return {
      id: c.id,
      name: c.name || c.email,
      email: c.email,
      phone: c.phone,
      country: c.country,
      isActive: c.isActive,
      orders: c._count.orders,
      totalSpent,
      joinedAt: c.createdAt.toISOString(),
      lastOrderAt: c.orders[0]?.createdAt?.toISOString() ?? null,
    };
  });

  return NextResponse.json({
    customers: rows,
    total,
    pages: Math.ceil(total / limit),
    totalRevenue: Number(totalRevenue._sum.totalUSD ?? 0),
  });
}
