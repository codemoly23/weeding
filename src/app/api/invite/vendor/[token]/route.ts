import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

type Params = { params: Promise<{ token: string }> };

// GET /api/invite/vendor/[token] — public; validate token and return project context
export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params;

  const invite = await prisma.vendorInviteToken.findUnique({
    where: { token },
    select: {
      id: true,
      expiresAt: true,
      revokedAt: true,
      usedAt: true,
      project: {
        select: {
          title: true,
          brideName: true,
          groomName: true,
          eventDate: true,
          eventType: true,
        },
      },
    },
  });

  if (!invite)
    return NextResponse.json({ error: "Invalid invite link" }, { status: 404 });

  if (invite.revokedAt)
    return NextResponse.json({ error: "This invite link has been revoked" }, { status: 410 });

  if (invite.expiresAt < new Date())
    return NextResponse.json({ error: "This invite link has expired" }, { status: 410 });

  if (invite.usedAt)
    return NextResponse.json({ error: "This invite link has already been used" }, { status: 410 });

  return NextResponse.json({
    valid: true,
    project: invite.project,
    expiresAt: invite.expiresAt,
  });
}
