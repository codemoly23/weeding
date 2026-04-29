import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/planner/projects/[id]/guests
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const project = await prisma.weddingProject.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const guests = await prisma.weddingGuest.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "asc" },
    take: 1000,
  });

  return NextResponse.json({ guests });
}

// POST /api/planner/projects/[id]/guests
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
  const {
    firstName, lastName, title, side, relation, email, phone, dietary, tableNumber, notes,
    hasPlusOne, plusOneName, plusOneMeal, isChiefGuest, familyId,
    invitationCode, invitationSent, invitationSentAt,
  } = body;

  const guest = await prisma.weddingGuest.create({
    data: {
      projectId: id,
      firstName: firstName?.trim() || "",
      lastName: lastName?.trim() || null,
      title: title?.trim() || null,
      side: side || "BRIDE",
      relation: relation || "OTHER",
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      dietary: dietary?.trim() || null,
      tableNumber: tableNumber ? Number(tableNumber) : null,
      notes: notes?.trim() || null,
      hasPlusOne: hasPlusOne ?? false,
      plusOneName: plusOneName?.trim() || null,
      plusOneMeal: plusOneMeal?.trim() || null,
      isChiefGuest: isChiefGuest ?? false,
      familyId: familyId || null,
      invitationCode: invitationCode?.trim() || null,
      invitationSent: invitationSent ?? false,
      invitationSentAt: invitationSentAt ? new Date(invitationSentAt) : null,
    },
  });

  return NextResponse.json({ guest }, { status: 201 });
}
