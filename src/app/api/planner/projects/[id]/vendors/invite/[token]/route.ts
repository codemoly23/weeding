import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

type Params = { params: Promise<{ id: string; token: string }> };

// DELETE /api/planner/projects/[id]/vendors/invite/[token] — revoke an invite token
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, token } = await params;

  const project = await prisma.weddingProject.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });
  if (!project)
    return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const invite = await prisma.vendorInviteToken.findFirst({
    where: { projectId: id, token, revokedAt: null },
    select: { id: true },
  });
  if (!invite)
    return NextResponse.json({ error: "Token not found" }, { status: 404 });

  await prisma.vendorInviteToken.update({
    where: { id: invite.id },
    data: { revokedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
