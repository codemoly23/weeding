import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { LeadStatus, LeadPriority } from "@prisma/client";

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

const bulkActionSchema = z.object({
  leadIds: z.array(z.string()).min(1, "At least one lead required"),
  action: z.enum(["updateStatus", "updatePriority", "assignTo", "delete"]),
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST", "UNQUALIFIED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  assignedToId: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }
    const { session } = accessCheck;

    const body = await request.json();
    const data = bulkActionSchema.parse(body);
    const { leadIds, action } = data;

    // Verify leads exist
    const existingLeads = await prisma.lead.findMany({
      where: { id: { in: leadIds } },
      select: { id: true, status: true, priority: true },
    });

    if (existingLeads.length === 0) {
      return NextResponse.json(
        { error: "No matching leads found" },
        { status: 404 }
      );
    }

    const validIds = existingLeads.map((l) => l.id);

    const result = await prisma.$transaction(async (tx) => {
      switch (action) {
        case "updateStatus": {
          if (!data.status) {
            throw new Error("Status is required for updateStatus action");
          }
          const updated = await tx.lead.updateMany({
            where: { id: { in: validIds } },
            data: {
              status: data.status as LeadStatus,
              lastActivityAt: new Date(),
            },
          });

          await tx.leadActivity.createMany({
            data: validIds.map((id) => ({
              leadId: id,
              type: "status_change",
              description: `Bulk status update to ${data.status}`,
              performedById: session.user.id,
              metadata: { bulkAction: true, newStatus: data.status },
            })),
          });

          return { action: "updateStatus", count: updated.count };
        }

        case "updatePriority": {
          if (!data.priority) {
            throw new Error("Priority is required for updatePriority action");
          }
          const updated = await tx.lead.updateMany({
            where: { id: { in: validIds } },
            data: {
              priority: data.priority as LeadPriority,
              lastActivityAt: new Date(),
            },
          });

          await tx.leadActivity.createMany({
            data: validIds.map((id) => ({
              leadId: id,
              type: "priority_change",
              description: `Bulk priority update to ${data.priority}`,
              performedById: session.user.id,
              metadata: { bulkAction: true, newPriority: data.priority },
            })),
          });

          return { action: "updatePriority", count: updated.count };
        }

        case "assignTo": {
          if (data.assignedToId === undefined) {
            throw new Error("assignedToId is required for assignTo action");
          }

          const updated = await tx.lead.updateMany({
            where: { id: { in: validIds } },
            data: {
              assignedToId: data.assignedToId,
              assignedAt: data.assignedToId ? new Date() : null,
              lastActivityAt: new Date(),
            },
          });

          let assigneeName = "Unassigned";
          if (data.assignedToId) {
            const assignee = await tx.user.findUnique({
              where: { id: data.assignedToId },
              select: { name: true },
            });
            assigneeName = assignee?.name || "Unknown";
          }

          await tx.leadActivity.createMany({
            data: validIds.map((id) => ({
              leadId: id,
              type: "assignment_change",
              description: data.assignedToId
                ? `Bulk assigned to ${assigneeName}`
                : "Bulk assignment removed",
              performedById: session.user.id,
              metadata: { bulkAction: true, assignedToId: data.assignedToId },
            })),
          });

          return { action: "assignTo", count: updated.count };
        }

        case "delete": {
          // Only admins can bulk delete
          if (session.user.role !== "ADMIN") {
            throw new Error("Only admins can bulk delete leads");
          }

          const deleted = await tx.lead.deleteMany({
            where: { id: { in: validIds } },
          });

          return { action: "delete", count: deleted.count };
        }

        default:
          throw new Error("Invalid action");
      }
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : "Failed to perform bulk action";

    if (message === "Only admins can bulk delete leads") {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    console.error("Error performing bulk action:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
