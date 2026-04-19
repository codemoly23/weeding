import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/db";
import { activePlanWhereClause } from "@/lib/vendor-plan";

// Maps common country names/aliases to ISO 3166-1 alpha-2 codes
const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  sweden: "SE",
  sverige: "SE",
  "united kingdom": "GB",
  "uk": "GB",
  "england": "GB",
  norway: "NO",
  norge: "NO",
  denmark: "DK",
  danmark: "DK",
  finland: "FI",
  suomi: "FI",
  germany: "DE",
  deutschland: "DE",
  france: "FR",
  netherlands: "NL",
  spain: "ES",
  italy: "IT",
  "united states": "US",
  usa: "US",
};

// GET /api/vendors?category=PHOTOGRAPHY&city=Stockholm&q=name&minPrice=500&maxPrice=5000&minRating=4&page=1
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") as string | null;
  const city = searchParams.get("city");
  const q = searchParams.get("q");
  const date = searchParams.get("date");
  const featured = searchParams.get("featured") === "true";
  const minPrice = searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")!) : null;
  const maxPrice = searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : null;
  const minRating = searchParams.get("minRating") ? parseFloat(searchParams.get("minRating")!) : null;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = 12;
  const skip = (page - 1) * limit;

  // Build AND conditions explicitly to avoid OR/city conflict from activePlanWhereClause spread
  const AND: Prisma.VendorProfileWhereInput[] = [
    { isApproved: true },
    { isActive: true },
    activePlanWhereClause(),
  ];

  if (category) AND.push({ category: category as Prisma.EnumVendorCategoryFilter });
  if (city) {
    const countryCode = COUNTRY_NAME_TO_CODE[city.trim().toLowerCase()];
    AND.push({
      OR: [
        { city: { contains: city, mode: "insensitive" } },
        ...(countryCode ? [{ country: countryCode }] : [{ country: { contains: city, mode: "insensitive" } }]),
      ],
    });
  }
  if (featured) AND.push({ isFeatured: true });
  if (minPrice !== null || maxPrice !== null) {
    AND.push({
      startingPrice: {
        ...(minPrice !== null && { gte: minPrice }),
        ...(maxPrice !== null && { lte: maxPrice }),
      },
    });
  }
  if (q) {
    AND.push({
      OR: [
        { businessName: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
      ],
    });
  }
  // Exclude vendors that are BOOKED on the selected date
  if (date) {
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
      AND.push({
        NOT: {
          availability: {
            some: { date: parsedDate, status: "BOOKED" },
          },
        },
      });
    }
  }

  const where: Prisma.VendorProfileWhereInput = { AND };

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
        maxPrice: true,
        currency: true,
        isFeatured: true,
        isVerified: true,
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
