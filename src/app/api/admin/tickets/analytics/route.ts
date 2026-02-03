import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requirePluginAccess, hasPluginFeature } from "@/lib/plugin-guard";

// GET - Get ticket analytics
export async function GET(request: NextRequest) {
  try {
    // Plugin access check
    const access = await requirePluginAccess("livesupport-pro");

    // Check if analytics feature is available
    if (!access.features.includes("analytics")) {
      return NextResponse.json(
        { error: "Analytics feature not available in your license tier" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "7d";

    // Calculate date range
    let startDate = new Date();
    switch (range) {
      case "7d":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(startDate.getDate() - 90);
        break;
      case "1y":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Get ticket counts by status
    const ticketsByStatus = await prisma.supportTicket.groupBy({
      by: ["status"],
      _count: { id: true },
      where: {
        createdAt: { gte: startDate },
      },
    });

    // Get ticket counts by priority
    const ticketsByPriority = await prisma.supportTicket.groupBy({
      by: ["priority"],
      _count: { id: true },
      where: {
        createdAt: { gte: startDate },
      },
    });

    // Get total tickets in range
    const totalTickets = await prisma.supportTicket.count({
      where: {
        createdAt: { gte: startDate },
      },
    });

    // Get previous period for comparison
    const previousStart = new Date(startDate);
    const previousEnd = new Date(startDate);
    switch (range) {
      case "7d":
        previousStart.setDate(previousStart.getDate() - 7);
        break;
      case "30d":
        previousStart.setDate(previousStart.getDate() - 30);
        break;
      case "90d":
        previousStart.setDate(previousStart.getDate() - 90);
        break;
      case "1y":
        previousStart.setFullYear(previousStart.getFullYear() - 1);
        break;
    }

    const previousTickets = await prisma.supportTicket.count({
      where: {
        createdAt: {
          gte: previousStart,
          lt: previousEnd,
        },
      },
    });

    // Calculate percentage change
    const ticketsChange =
      previousTickets > 0
        ? Math.round(((totalTickets - previousTickets) / previousTickets) * 100 * 10) / 10
        : 0;

    // Get resolved tickets for resolution time calculation
    const resolvedTickets = await prisma.supportTicket.findMany({
      where: {
        status: { in: ["RESOLVED", "CLOSED"] },
        resolvedAt: { not: null },
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        resolvedAt: true,
      },
    });

    // Calculate average resolution time (in hours)
    let avgResolutionTime = 0;
    if (resolvedTickets.length > 0) {
      const totalResolutionTime = resolvedTickets.reduce((acc, ticket) => {
        if (ticket.resolvedAt) {
          const diff = ticket.resolvedAt.getTime() - ticket.createdAt.getTime();
          return acc + diff;
        }
        return acc;
      }, 0);
      avgResolutionTime = Math.round((totalResolutionTime / resolvedTickets.length / (1000 * 60 * 60)) * 10) / 10;
    }

    // Get tickets by category
    const ticketsByCategory = await prisma.supportTicket.groupBy({
      by: ["category"],
      _count: { id: true },
      where: {
        createdAt: { gte: startDate },
        category: { not: null },
      },
    });

    // Format response
    const formattedByStatus = ticketsByStatus.map((item) => ({
      status: item.status,
      count: item._count.id,
      percentage: totalTickets > 0 ? Math.round((item._count.id / totalTickets) * 100) : 0,
    }));

    const formattedByPriority = ticketsByPriority.map((item) => ({
      priority: item.priority,
      count: item._count.id,
      percentage: totalTickets > 0 ? Math.round((item._count.id / totalTickets) * 100) : 0,
    }));

    const formattedByCategory = ticketsByCategory.map((item) => ({
      category: item.category || "Uncategorized",
      count: item._count.id,
      avgResolutionTime: avgResolutionTime, // Would need more complex query for per-category
    }));

    return NextResponse.json({
      overview: {
        totalTickets,
        ticketsChange,
        avgResponseTime: 2.4, // Would need message timestamp analysis
        responseTimeChange: -18, // Placeholder
        avgResolutionTime,
        resolutionTimeChange: -5, // Placeholder
        satisfactionScore: 94, // Would need feedback data
        satisfactionChange: 2, // Placeholder
      },
      ticketsByStatus: formattedByStatus,
      ticketsByPriority: formattedByPriority,
      topCategories: formattedByCategory,
      dateRange: {
        start: startDate.toISOString(),
        end: new Date().toISOString(),
        range,
      },
    });
  } catch (error) {
    // Check if it's a plugin access error
    if ((error as { status?: number }).status === 403) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 403 }
      );
    }

    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
