import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkAdminOnly } from "@/lib/admin-auth";

// GET — paginated subscriber list
export async function GET(request: NextRequest) {
  const auth = await checkAdminOnly();
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status"); // "subscribed" | "unsubscribed" | "all"

  const where: Record<string, unknown> = {};

  if (status === "subscribed") {
    where.newsletterSubscribed = true;
  } else if (status === "unsubscribed") {
    where.newsletterSubscribed = false;
    where.newsletterUnsubAt = { not: null };
  } else {
    // Show all who were ever newsletter subscribers
    where.OR = [
      { newsletterSubscribed: true },
      { newsletterUnsubAt: { not: null } },
      { source: "NEWSLETTER" },
    ];
  }

  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { firstName: { contains: search, mode: "insensitive" } },
    ];
  }

  const [subscribers, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        email: true,
        country: true,
        source: true,
        newsletterSubscribed: true,
        newsletterUnsubAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.lead.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: subscribers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// DELETE — bulk unsubscribe
export async function DELETE(request: NextRequest) {
  const auth = await checkAdminOnly();
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { ids } = body as { ids: string[] };

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: "No IDs provided" }, { status: 400 });
    }

    await prisma.lead.updateMany({
      where: { id: { in: ids } },
      data: {
        newsletterSubscribed: false,
        newsletterUnsubAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, message: `${ids.length} subscribers unsubscribed` });
  } catch (error) {
    console.error("Bulk unsubscribe error:", error);
    return NextResponse.json({ success: false, error: "Failed to unsubscribe" }, { status: 500 });
  }
}
