import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const budgetGoalSchema = z.object({
  budgetGoal: z.number().finite().min(0).max(100_000_000).default(0),
});

const categorySchema = z.object({
  name: z.string().trim().min(1).max(100),
  planned: z.number().finite().min(0).max(100_000_000).default(0),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#6366f1"),
});

// GET /api/planner/projects/[id]/budget — list categories + items
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const project = await prisma.weddingProject.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const categories = await prisma.budgetCategory.findMany({
    where: { projectId: id },
    orderBy: { order: "asc" },
    include: { items: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json({ categories, budgetGoal: project.budgetGoal ?? 0 });
}

// PATCH /api/planner/projects/[id]/budget — update budgetGoal
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const project = await prisma.weddingProject.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = budgetGoalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid budget data", details: parsed.error.issues }, { status: 400 });
  }

  await prisma.weddingProject.update({ where: { id }, data: { budgetGoal: parsed.data.budgetGoal } });
  return NextResponse.json({ budgetGoal: parsed.data.budgetGoal });
}

// POST /api/planner/projects/[id]/budget — create category
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const project = await prisma.weddingProject.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid category data", details: parsed.error.issues }, { status: 400 });
  }
  const { name, planned, color } = parsed.data;

  const count = await prisma.budgetCategory.count({ where: { projectId: id } });
  const category = await prisma.budgetCategory.create({
    data: { projectId: id, name, planned, color, order: count },
    include: { items: true },
  });

  return NextResponse.json({ category }, { status: 201 });
}
