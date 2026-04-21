import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkAdminAccess, authError } from "@/lib/admin-auth";

// PUT /api/admin/search-options/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const accessCheck = await checkAdminAccess();
  if ("error" in accessCheck) return authError(accessCheck);

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const icon = typeof body.icon === "string" ? body.icon.trim() || null : undefined;
  const group = typeof body.group === "string" ? body.group.trim() || null : undefined;

  const option = await prisma.searchOption.update({
    where: { id },
    data: {
      ...(icon !== undefined && { icon }),
      ...(group !== undefined && { group }),
    },
  });
  return NextResponse.json(option);
}

// DELETE /api/admin/search-options/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const accessCheck = await checkAdminAccess();
  if ("error" in accessCheck) return authError(accessCheck);

  const { id } = await params;
  await prisma.searchOption.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
