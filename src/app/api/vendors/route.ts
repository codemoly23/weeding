import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { activePlanWhereClause } from "@/lib/vendor-plan";

// GET /api/vendors?category=PHOTOGRAPHY&city=Stockholm&q=name&minPrice=500&maxPrice=5000&minRating=4&page=1
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") as string | null;
  const city = searchParams.get("city");
  const q = searchParams.get("q");
  const featured = searchParams.get("featured") === "true";
  const minPrice = searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")!) : null;
  const maxPrice = searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : null;
  const minRating = searchParams.get("minRating") ? parseFloat(searchParams.get("minRating")!) : null;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = 12;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    isApproved: true,
    isActive: true,
    ...activePlanWhereClause(),
  };

  if (category) where.category = category;
  if (city) where.city = { contains: city, mode: "insensitive" };
  if (featured) where.isFeatured = true;
  if (minPrice !== null || maxPrice !== null) {
    where.startingPrice = {
      ...(minPrice !== null && { gte: minPrice }),
      ...(maxPrice !== null && { lte: maxPrice }),
    };
  }
  if (q) {
    where.OR = [
      { businessName: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
    ];
  }

  const [vendors, total] = await Promise.all([
    prisma.vendorProfile.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      skip,
      take: limit,
      select: {
        id: true,
        slug: true,
        businessName: true,
        category: true,
        tagline: true,
        city: true,
        country: true,
        lat: true,
        lng: true,
        photos: true,
        startingPrice: true,
        currency: true,
        isFeatured: true,
        slaHours: true,
        _count: { select: { reviews: { where: { isApproved: true } } } },
      },
    }),
    prisma.vendorProfile.count({ where }),
  ]);

  const vendorIds = vendors.map((v) => v.id);
  const ratings =
    vendorIds.length > 0
      ? await prisma.vendorReview.groupBy({
          by: ["vendorId"],
          where: { vendorId: { in: vendorIds }, isApproved: true },
          _avg: { rating: true },
        })
      : [];

  const ratingMap = new Map(ratings.map((r) => [r.vendorId, r._avg.rating]));

  let result = vendors.map((v) => ({
    ...v,
    reviewCount: v._count.reviews,
    avgRating: ratingMap.get(v.id) ?? null,
    coverPhoto: v.photos[0] ?? null,
  }));

  // Post-filter by minRating (can't do in Prisma groupBy easily)
  if (minRating !== null) {
    result = result.filter((v) => v.avgRating !== null && v.avgRating >= minRating);
  }

  return NextResponse.json({
    vendors: result,
    total: minRating !== null ? result.length : total,
    page,
    totalPages: Math.ceil((minRating !== null ? result.length : total) / limit),
  });
}
