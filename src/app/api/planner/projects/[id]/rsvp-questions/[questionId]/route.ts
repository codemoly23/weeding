import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// PUT /api/planner/projects/[id]/rsvp-questions/[questionId]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, questionId } = await params;

  const project = await prisma.weddingProject.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const question = await prisma.rsvpQuestion.findFirst({
    where: { id: questionId, projectId: id },
  });
  if (!question) return NextResponse.json({ error: "Question not found" }, { status: 404 });

  const { text, type, options, required, order } = await req.json();

  const validTypes = ["SHORT_TEXT", "LONG_TEXT", "SINGLE_CHOICE", "MULTIPLE_CHOICE"];
  if (type && !validTypes.includes(type)) {
    return NextResponse.json({ error: "Invalid question type" }, { status: 400 });
  }

  const updated = await prisma.rsvpQuestion.update({
    where: { id: questionId },
    data: {
      ...(text !== undefined && { text: text.trim() }),
      ...(type !== undefined && { type }),
      ...(options !== undefined && { options }),
      ...(required !== undefined && { required }),
      ...(order !== undefined && { order }),
    },
  });

  return NextResponse.json({ question: updated });
}

// DELETE /api/planner/projects/[id]/rsvp-questions/[questionId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, questionId } = await params;

  const project = await prisma.weddingProject.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const question = await prisma.rsvpQuestion.findFirst({
    where: { id: questionId, projectId: id },
  });
  if (!question) return NextResponse.json({ error: "Question not found" }, { status: 404 });

  await prisma.rsvpQuestion.delete({ where: { id: questionId } });

  return NextResponse.json({ success: true });
}
