import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// Helper to check admin access
async function checkAdminAccess() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }
  const allowedRoles = ["ADMIN", "SALES_AGENT", "SUPPORT_AGENT"];
  if (!allowedRoles.includes(session.user.role)) {
    return { error: "Forbidden", status: 403 };
  }
  return { session };
}

// GET - Get lead statistics
export async function GET() {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get this week's date range
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    // Get this month's date range
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // Run all queries in parallel
    const [
      totalLeads,
      byStatus,
      bySource,
      byPriority,
      todayLeads,
      weekLeads,
      monthLeads,
      unassigned,
      hotLeads,
      avgScore,
      conversionRate,
      recentLeads,
    ] = await Promise.all([
      // Total leads
      prisma.lead.count(),

      // By status
      prisma.lead.groupBy({
        by: ["status"],
        _count: { status: true },
      }),

      // By source
      prisma.lead.groupBy({
        by: ["source"],
        _count: { source: true },
      }),

      // By priority
      prisma.lead.groupBy({
        by: ["priority"],
        _count: { priority: true },
      }),

      // Today's leads
      prisma.lead.count({
        where: {
          createdAt: { gte: today, lt: tomorrow },
        },
      }),

      // This week's leads
      prisma.lead.count({
        where: {
          createdAt: { gte: weekStart },
        },
      }),

      // This month's leads
      prisma.lead.count({
        where: {
          createdAt: { gte: monthStart },
        },
      }),

      // Unassigned leads
      prisma.lead.count({
        where: {
          assignedToId: null,
          status: { notIn: ["WON", "LOST", "UNQUALIFIED"] },
        },
      }),

      // Hot leads (score >= 70)
      prisma.lead.count({
        where: {
          score: { gte: 70 },
          status: { notIn: ["WON", "LOST", "UNQUALIFIED"] },
        },
      }),

      // Average score
      prisma.lead.aggregate({
        _avg: { score: true },
      }),

      // Conversion rate (WON / total closed)
      prisma.lead.groupBy({
        by: ["status"],
        where: {
          status: { in: ["WON", "LOST"] },
        },
        _count: { status: true },
      }),

      // Recent leads (last 5)
      prisma.lead.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          status: true,
          score: true,
          createdAt: true,
        },
      }),
    ]);

    // Calculate conversion rate
    const wonCount = conversionRate.find((c) => c.status === "WON")?._count.status || 0;
    const lostCount = conversionRate.find((c) => c.status === "LOST")?._count.status || 0;
    const totalClosed = wonCount + lostCount;
    const conversionPercentage = totalClosed > 0 ? Math.round((wonCount / totalClosed) * 100) : 0;

    // Format status counts
    const statusCounts: Record<string, number> = {};
    byStatus.forEach((s) => {
      statusCounts[s.status] = s._count.status;
    });

    // Format source counts
    const sourceCounts: Record<string, number> = {};
    bySource.forEach((s) => {
      sourceCounts[s.source] = s._count.source;
    });

    // Format priority counts
    const priorityCounts: Record<string, number> = {};
    byPriority.forEach((p) => {
      priorityCounts[p.priority] = p._count.priority;
    });

    return NextResponse.json({
      overview: {
        total: totalLeads,
        today: todayLeads,
        thisWeek: weekLeads,
        thisMonth: monthLeads,
        unassigned,
        hotLeads,
        averageScore: Math.round(avgScore._avg.score || 0),
        conversionRate: conversionPercentage,
      },
      byStatus: statusCounts,
      bySource: sourceCounts,
      byPriority: priorityCounts,
      pipeline: {
        new: statusCounts.NEW || 0,
        contacted: statusCounts.CONTACTED || 0,
        qualified: statusCounts.QUALIFIED || 0,
        proposal: statusCounts.PROPOSAL || 0,
        negotiation: statusCounts.NEGOTIATION || 0,
        won: statusCounts.WON || 0,
        lost: statusCounts.LOST || 0,
      },
      recentLeads,
    });
  } catch (error) {
    console.error("Error fetching lead stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch lead statistics" },
      { status: 500 }
    );
  }
}
