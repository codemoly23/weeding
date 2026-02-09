import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/locations - Get locations (public)
// Query params:
//   - search: filter by name or code
//   - serviceId: get locations with fees for a specific service
//   - country: filter by country code (e.g., "US")
//   - type: filter by location type (STATE, PROVINCE, COUNTRY, TERRITORY)
//   - popular: only popular locations
//   - cursor: pagination offset (default: 0)
//   - limit: items per page (default: 10)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const serviceId = searchParams.get("serviceId");
    const country = searchParams.get("country");
    const type = searchParams.get("type");
    const popularOnly = searchParams.get("popular") === "true";
    const cursor = parseInt(searchParams.get("cursor") || "0");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Build where clause
    const where: Record<string, unknown> = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    if (country) {
      where.country = country.toUpperCase();
    }

    if (type) {
      where.type = type.toUpperCase();
    }

    if (popularOnly) {
      where.isPopular = true;
    }

    // If serviceId provided, only return locations that have fees for that service
    if (serviceId) {
      where.fees = {
        some: {
          serviceId,
          isActive: true,
        },
      };
    }

    // Count total for pagination
    const total = await prisma.location.count({ where });

    // Fetch locations
    const locations = await prisma.location.findMany({
      where,
      orderBy: [
        { isPopular: "desc" },
        { sortOrder: "asc" },
        { name: "asc" },
      ],
      skip: cursor,
      take: limit,
      select: {
        id: true,
        code: true,
        name: true,
        country: true,
        type: true,
        isPopular: true,
        // Include fee for the specific service if requested
        ...(serviceId
          ? {
              fees: {
                where: {
                  serviceId,
                  feeType: "FILING",
                  isActive: true,
                },
                select: {
                  amountUSD: true,
                  label: true,
                  processingTime: true,
                },
                take: 1,
              },
            }
          : {}),
      },
    });

    const hasMore = cursor + limit < total;
    const nextCursor = hasMore ? cursor + limit : null;

    return NextResponse.json({
      locations: locations.map((loc) => {
        const fee =
          serviceId && "fees" in loc && Array.isArray(loc.fees) && loc.fees[0]
            ? Number((loc.fees[0] as { amountUSD: unknown }).amountUSD)
            : undefined;

        return {
          id: loc.id,
          code: loc.code,
          name: loc.name,
          country: loc.country,
          type: loc.type,
          isPopular: loc.isPopular,
          ...(fee !== undefined ? { fee } : {}),
        };
      }),
      nextCursor,
      hasMore,
      total,
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}
