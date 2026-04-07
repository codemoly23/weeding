import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// POST /api/planner/projects/[id]/guests/bulk
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const project = await prisma.weddingProject.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { guestIds, action, tableNumber, familyId } = body as {
    guestIds: string[];
    action: "assign_table" | "assign_family" | "delete" | "mark_attending" | "mark_not_attending" | "mark_pending";
    tableNumber?: number;
    familyId?: string;
  };

  if (!Array.isArray(guestIds) || guestIds.length === 0) {
    return NextResponse.json({ error: "guestIds must be a non-empty array" }, { status: 400 });
  }

  // Verify all guests belong to this project
  const where = { id: { in: guestIds }, projectId: id };

  switch (action) {
    case "assign_table":
      if (tableNumber === undefined) return NextResponse.json({ error: "tableNumber required" }, { status: 400 });
      await prisma.weddingGuest.updateMany({ where, data: { tableNumber: Number(tableNumber) } });
      break;

    case "assign_family":
      if (!familyId) return NextResponse.json({ error: "familyId required" }, { status: 400 });
      // Verify family belongs to project
      const family = await prisma.guestFamily.findFirst({ where: { id: familyId, projectId: id } });
      if (!family) return NextResponse.json({ error: "Family not found" }, { status: 404 });
      await prisma.weddingGuest.updateMany({ where, data: { familyId } });
      break;

    case "delete":
      await prisma.weddingGuest.deleteMany({ where });
      break;

    case "mark_attending":
      await prisma.weddingGuest.updateMany({ where, data: { rsvpStatus: "ATTENDING" } });
      break;

    case "mark_not_attending":
      await prisma.weddingGuest.updateMany({ where, data: { rsvpStatus: "NOT_ATTENDING" } });
      break;

    case "mark_pending":
      await prisma.weddingGuest.updateMany({ where, data: { rsvpStatus: "PENDING" } });
      break;

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  return NextResponse.json({ success: true, affected: guestIds.length });
}
