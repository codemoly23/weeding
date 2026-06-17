import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// PATCH /api/vendor/reviews/[id] — update reply for a review the vendor owns
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "VENDOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const body = await req.json();
  const reply: string | null =
    typeof body.reply === "string" && body.reply.trim().length > 0
      ? body.reply.trim()
      : null;

  const profile = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const review = await prisma.vendorReview.findFirst({
    where: { id, vendorId: profile.id },
    select: { id: true },
  });

  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  const updated = await prisma.vendorReview.update({
    where: { id },
    data: { reply },
  });

  return NextResponse.json({ review: updated });
}
