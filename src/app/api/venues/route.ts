import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const revalidate = 60;

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category");

  const venues = await prisma.venue.findMany({
    where: {
      isActive: true,
      ...(category ? { category } : {}),
    },
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      type: true,
      location: true,
      price: true,
      priceUnit: true,
      badge: true,
      badgeColor: true,
      tags: true,
      image: true,
      rating: true,
      reviewCount: true,
      isFeatured: true,
    },
  });

  return NextResponse.json({ venues });
}
