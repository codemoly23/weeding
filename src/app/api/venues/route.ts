import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/venues?category=wedding|party|specialty&featured=true
export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category");
  const featured = request.nextUrl.searchParams.get("featured");

  const venues = await prisma.venue.findMany({
    where: {
      isActive: true,
      ...(category && { category }),
      ...(featured === "true" && { isFeatured: true }),
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(venues);
}
