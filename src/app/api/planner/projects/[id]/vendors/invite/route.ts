import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

// GET /api/planner/projects/[id]/vendors/invite — list active invite tokens
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const project = await prisma.weddingProject.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });
  if (!project)
    return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const tokens = await prisma.vendorInviteToken.findMany({
    where: { projectId: id, revokedAt: null },
    orderBy: { createdAt: "desc" },
    select: { id: true, token: true, expiresAt: true, usedAt: true, createdAt: true },
  });

  return NextResponse.json({ tokens });
}

// POST /api/planner/projects/[id]/vendors/invite — generate a new invite token (30-day expiry)
export async function POST(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const project = await prisma.weddingProject.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });
  if (!project)
    return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const token = randomBytes(20).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const invite = await prisma.vendorInviteToken.create({
    data: { projectId: id, token, expiresAt },
    select: { id: true, token: true, expiresAt: true, createdAt: true },
  });

  return NextResponse.json({ invite }, { status: 201 });
}
