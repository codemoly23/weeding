import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkAdminOnly } from "@/lib/admin-auth";

// GET — subscriber stats
export async function GET() {
  const auth = await checkAdminOnly();
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const [totalSubscribers, totalUnsubscribed, last30Days, topCountries] = await Promise.all([
    prisma.lead.count({ where: { newsletterSubscribed: true } }),
    prisma.lead.count({ where: { newsletterSubscribed: false, newsletterUnsubAt: { not: null } } }),
    prisma.lead.count({
      where: {
        newsletterSubscribed: true,
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.lead.groupBy({
      by: ["country"],
      where: { newsletterSubscribed: true, country: { not: null } },
      _count: true,
      orderBy: { _count: { country: "desc" } },
      take: 5,
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      totalSubscribers,
      totalUnsubscribed,
      newLast30Days: last30Days,
      topCountries: topCountries.map((c) => ({
        country: c.country,
        count: c._count,
      })),
    },
  });
}
