import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import crypto from "crypto";

// GET — return current share status
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await prisma.weddingProject.findFirst({
    where: { id, userId: session.user.id },
    select: { shareToken: true, shareEnabled: true },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(project);
}

// POST — toggle sharing on/off, generate token on first enable
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { enabled } = await req.json() as { enabled: boolean };

  const existing = await prisma.weddingProject.findFirst({
    where: { id, userId: session.user.id },
    select: { shareToken: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const token = existing.shareToken ?? crypto.randomBytes(16).toString("hex");

  const updated = await prisma.weddingProject.update({
    where: { id },
    data: { shareEnabled: enabled, shareToken: token },
    select: { shareToken: true, shareEnabled: true },
  });

  return NextResponse.json(updated);
}
