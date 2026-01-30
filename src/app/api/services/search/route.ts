import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/services/search - Searchable paginated endpoint for service selector
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search")?.toLowerCase() || "";
    const cursor = parseInt(searchParams.get("cursor") || "0");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Build where clause
    const where = {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { slug: { contains: search, mode: "insensitive" as const } },
          { shortDesc: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    // Get total count for hasMore calculation
    const total = await prisma.service.count({ where });

    // Fetch paginated services
    const services = await prisma.service.findMany({
      where,
      skip: cursor,
      take: limit,
      orderBy: [{ isPopular: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        slug: true,
        name: true,
        shortDesc: true,
        icon: true,
        isPopular: true,
      },
    });

    const hasMore = cursor + limit < total;
    const nextCursor = hasMore ? cursor + limit : null;

    return NextResponse.json({
      services,
      nextCursor,
      hasMore,
      total,
    });
  } catch (error) {
    console.error("Error searching services:", error);
    return NextResponse.json(
      { error: "Failed to search services" },
      { status: 500 }
    );
  }
}
