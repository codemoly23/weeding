import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/planner/projects/[id]/rsvp-questions
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

  const questions = await prisma.rsvpQuestion.findMany({
    where: { projectId: id },
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ questions });
}

// POST /api/planner/projects/[id]/rsvp-questions
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

  const { text, type, options, required, order } = await req.json();

  if (!text?.trim()) return NextResponse.json({ error: "Question text is required" }, { status: 400 });

  const validTypes = ["SHORT_TEXT", "LONG_TEXT", "SINGLE_CHOICE", "MULTIPLE_CHOICE"];
  if (type && !validTypes.includes(type)) {
    return NextResponse.json({ error: "Invalid question type" }, { status: 400 });
  }

  const choiceTypes = ["SINGLE_CHOICE", "MULTIPLE_CHOICE"];
  const resolvedType = type ?? "SHORT_TEXT";
  if (choiceTypes.includes(resolvedType)) {
    if (!Array.isArray(options) || options.length === 0 ||
        !options.every((o: unknown) => typeof o === "string" && o.trim())) {
      return NextResponse.json(
        { error: "options must be a non-empty array of strings for choice questions" },
        { status: 400 }
      );
    }
  }

  // Count existing to set default order
  const count = await prisma.rsvpQuestion.count({ where: { projectId: id } });

  const question = await prisma.rsvpQuestion.create({
    data: {
      projectId: id,
      text: text.trim(),
      type: type ?? "SHORT_TEXT",
      options: options ?? null,
      required: required ?? false,
      order: order ?? count,
    },
  });

  return NextResponse.json({ question }, { status: 201 });
}
