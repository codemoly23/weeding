import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { Prisma, RsvpQuestionType } from "@prisma/client";

function validateQuestionOptions(type: string, options: unknown) {
  if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
    return Array.isArray(options) &&
      options.length > 0 &&
      options.length <= 50 &&
      options.every((o) => typeof o === "string" && o.trim().length > 0 && o.trim().length <= 100);
  }

  return options === undefined || options === null || Array.isArray(options);
}

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

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { text, type, options, required, order } = body as {
    text?: unknown;
    type?: unknown;
    options?: unknown;
    required?: unknown;
    order?: unknown;
  };

  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "Question text is required" }, { status: 400 });
  }

  const validTypes = Object.values(RsvpQuestionType);
  if (type !== undefined && (typeof type !== "string" || !validTypes.includes(type as RsvpQuestionType))) {
    return NextResponse.json({ error: "Invalid question type" }, { status: 400 });
  }

  const resolvedType = typeof type === "string" ? type as RsvpQuestionType : RsvpQuestionType.SHORT_TEXT;
  if (!validateQuestionOptions(resolvedType, options)) {
    return NextResponse.json(
      { error: "options must be a non-empty array of strings for choice questions" },
      { status: 400 }
    );
  }

  if (required !== undefined && typeof required !== "boolean") {
    return NextResponse.json({ error: "required must be a boolean" }, { status: 400 });
  }

  if (order !== undefined && (typeof order !== "number" || !Number.isInteger(order) || order < 0)) {
    return NextResponse.json({ error: "order must be a non-negative integer" }, { status: 400 });
  }
  const normalizedOptions = Array.isArray(options)
    ? options.map((o) => String(o).trim())
    : Prisma.JsonNull;

  // Count existing to set default order
  const count = await prisma.rsvpQuestion.count({ where: { projectId: id } });

  const question = await prisma.rsvpQuestion.create({
    data: {
      projectId: id,
      text: text.trim(),
      type: resolvedType,
      options: normalizedOptions,
      required: typeof required === "boolean" ? required : false,
      order: typeof order === "number" ? order : count,
    },
  });

  return NextResponse.json({ question }, { status: 201 });
}
