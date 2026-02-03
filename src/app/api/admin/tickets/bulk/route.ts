import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requirePluginAccess } from "@/lib/plugin-guard";
import { z } from "zod";

// POST - Bulk actions on tickets
const bulkActionSchema = z.object({
  ticketIds: z.array(z.string()).min(1, "At least one ticket ID is required"),
  action: z.enum(["updateStatus", "updatePriority", "assign", "delete"]),
  status: z.enum(["OPEN", "IN_PROGRESS", "WAITING_FOR_CUSTOMER", "WAITING_FOR_AGENT", "RESOLVED", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  assignedToId: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Plugin access check
    await requirePluginAccess("livesupport-pro");

    const body = await request.json();
    const data = bulkActionSchema.parse(body);

    let updatedCount = 0;
    let deletedCount = 0;

    switch (data.action) {
      case "updateStatus":
        if (!data.status) {
          return NextResponse.json(
            { error: "Status is required for updateStatus action" },
            { status: 400 }
          );
        }

        const statusUpdate = await prisma.supportTicket.updateMany({
          where: {
            id: { in: data.ticketIds },
          },
          data: {
            status: data.status,
            ...(data.status === "RESOLVED" || data.status === "CLOSED"
              ? { resolvedAt: new Date() }
              : {}),
          },
        });
        updatedCount = statusUpdate.count;
        break;

      case "updatePriority":
        if (!data.priority) {
          return NextResponse.json(
            { error: "Priority is required for updatePriority action" },
            { status: 400 }
          );
        }

        const priorityUpdate = await prisma.supportTicket.updateMany({
          where: {
            id: { in: data.ticketIds },
          },
          data: {
            priority: data.priority,
          },
        });
        updatedCount = priorityUpdate.count;
        break;

      case "assign":
        const assignUpdate = await prisma.supportTicket.updateMany({
          where: {
            id: { in: data.ticketIds },
          },
          data: {
            assignedToId: data.assignedToId,
          },
        });
        updatedCount = assignUpdate.count;
        break;

      case "delete":
        const deleteResult = await prisma.supportTicket.deleteMany({
          where: {
            id: { in: data.ticketIds },
          },
        });
        deletedCount = deleteResult.count;
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message:
        data.action === "delete"
          ? `Deleted ${deletedCount} ticket(s)`
          : `Updated ${updatedCount} ticket(s)`,
      count: data.action === "delete" ? deletedCount : updatedCount,
    });
  } catch (error) {
    // Check if it's a plugin access error
    if ((error as { status?: number }).status === 403) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 403 }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error performing bulk action:", error);
    return NextResponse.json(
      { error: "Failed to perform bulk action" },
      { status: 500 }
    );
  }
}
