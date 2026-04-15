import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// GET /api/user/saved-vendors
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const saved = await prisma.savedVendor.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      vendor: {
        select: {
          id: true,
          slug: true,
          businessName: true,
          category: true,
          tagline: true,
          city: true,
          country: true,
          photos: true,
          startingPrice: true,
          maxPrice: true,
          currency: true,
          isFeatured: true,
          isVerified: true,
          _count: { select: { reviews: { where: { isApproved: true } } } },
          reviews: { where: { isApproved: true }, select: { rating: true } },
        },
      },
    },
  });

  const vendors = saved.map(({ vendor }) => {
    const { reviews, ...rest } = vendor;
    const avgRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;
    return { ...rest, avgRating };
  });

  return NextResponse.json({ vendors });
}
