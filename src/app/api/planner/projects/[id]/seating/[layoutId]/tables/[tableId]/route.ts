import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { applyTableGuestIds, normalizeGuestIds, syncLayoutGuestTableNumbers } from "@/lib/seating-sync";

// PUT /api/planner/projects/[id]/seating/[layoutId]/tables/[tableId]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; layoutId: string; tableId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, layoutId, tableId } = await params;
  const project = await prisma.weddingProject.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existingTable = await prisma.seatingTable.findFirst({
    where: { id: tableId, layoutId, projectId: id },
    select: { id: true },
  });
  if (!existingTable) return NextResponse.json({ error: "Table not found" }, { status: 404 });

  const body = await req.json();
  const { name, type, x, y, seats, rotation, color, guestIds } = body;

  const table = await prisma.$transaction(async (tx) => {
    await tx.seatingTable.update({
      where: { id: tableId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(type !== undefined && { type }),
        ...(x !== undefined && { x: Number(x) }),
        ...(y !== undefined && { y: Number(y) }),
        ...(seats !== undefined && { seats: Number(seats) }),
        ...(rotation !== undefined && { rotation: Number(rotation) }),
        ...(color !== undefined && { color }),
      },
    });

    if (guestIds !== undefined) {
      await applyTableGuestIds(tx, id, layoutId, tableId, normalizeGuestIds(guestIds));
    }

    return tx.seatingTable.findUniqueOrThrow({ where: { id: tableId } });
  });

  return NextResponse.json({ table });
}

// DELETE /api/planner/projects/[id]/seating/[layoutId]/tables/[tableId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; tableId: string; layoutId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, layoutId, tableId } = await params;
  const project = await prisma.weddingProject.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existingTable = await prisma.seatingTable.findFirst({
    where: { id: tableId, layoutId, projectId: id },
    select: { id: true },
  });
  if (!existingTable) return NextResponse.json({ error: "Table not found" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    await tx.seatingTable.delete({ where: { id: tableId } });
    await syncLayoutGuestTableNumbers(tx, id, layoutId);
  });
  return NextResponse.json({ success: true });
}
