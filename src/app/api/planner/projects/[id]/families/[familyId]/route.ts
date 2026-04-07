import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// PUT /api/planner/projects/[id]/families/[familyId]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; familyId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, familyId } = await params;

  const project = await prisma.weddingProject.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const family = await prisma.guestFamily.findFirst({ where: { id: familyId, projectId: id } });
  if (!family) return NextResponse.json({ error: "Family not found" }, { status: 404 });

  const { name } = await req.json();

  const updated = await prisma.guestFamily.update({
    where: { id: familyId },
    data: { ...(name !== undefined && { name: name.trim() }) },
    include: { guests: { select: { id: true, firstName: true, lastName: true } } },
  });

  return NextResponse.json({ family: updated });
}

// DELETE /api/planner/projects/[id]/families/[familyId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; familyId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, familyId } = await params;

  const project = await prisma.weddingProject.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const family = await prisma.guestFamily.findFirst({ where: { id: familyId, projectId: id } });
  if (!family) return NextResponse.json({ error: "Family not found" }, { status: 404 });

  // Unlink all guests from this family first
  await prisma.weddingGuest.updateMany({
    where: { familyId, projectId: id },
    data: { familyId: null },
  });

  await prisma.guestFamily.delete({ where: { id: familyId } });

  return NextResponse.json({ success: true });
}
