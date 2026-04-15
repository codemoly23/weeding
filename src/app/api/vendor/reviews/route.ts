import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// GET /api/vendor/reviews — returns all reviews for the logged-in vendor (including pending)
export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "VENDOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const profile = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const reviews = await prisma.vendorReview.findMany({
    where: { vendorId: profile.id },
    orderBy: { createdAt: "desc" },
  });

  const approved = reviews.filter((r) => r.isApproved);
  const avgRating =
    approved.length > 0
      ? approved.reduce((sum, r) => sum + r.rating, 0) / approved.length
      : null;

  return NextResponse.json({ reviews, avgRating, total: reviews.length });
}
