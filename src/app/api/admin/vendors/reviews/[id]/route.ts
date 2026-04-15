import { NextRequest, NextResponse } from "next/server";
import { checkAdminAccess, authError } from "@/lib/admin-auth";
import prisma from "@/lib/db";

// PUT /api/admin/vendors/reviews/[id] — approve or reject
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminAccess();
  if (auth.error) return authError(auth);

  const { id } = await params;
  const body = await req.json();
  const { isApproved, reply } = body;

  const review = await prisma.vendorReview.update({
    where: { id },
    data: {
      ...(isApproved !== undefined && { isApproved: Boolean(isApproved) }),
      ...(reply !== undefined && { reply: reply ? String(reply).trim() : null }),
      updatedAt: new Date(),
    },
  });

  return NextResponse.json({ review });
}

// DELETE /api/admin/vendors/reviews/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminAccess();
  if (auth.error) return authError(auth);

  const { id } = await params;
  await prisma.vendorReview.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
