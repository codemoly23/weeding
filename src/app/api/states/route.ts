import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

/**
 * @deprecated This route is maintained for backward compatibility.
 * New code should use /api/locations instead.
 *
 * GET /api/states - Returns US states from the Location table
 * Transforms Location records into the old {code, name, fee} format
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search")?.toLowerCase() || "";
  const cursor = parseInt(searchParams.get("cursor") || "0");
  const limit = parseInt(searchParams.get("limit") || "10");
  const serviceId = searchParams.get("serviceId") || undefined;

  try {
    // Build where clause for US states
    const where: Record<string, unknown> = {
      country: "US",
      type: "STATE",
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    const [locations, total] = await Promise.all([
      prisma.location.findMany({
        where,
        include: serviceId
          ? {
              fees: {
                where: { serviceId, feeType: "FILING", isActive: true },
                select: { amountUSD: true },
                take: 1,
              },
            }
          : undefined,
        orderBy: [{ isPopular: "desc" }, { name: "asc" }],
        skip: cursor,
        take: limit,
      }),
      prisma.location.count({ where }),
    ]);

    const hasMore = cursor + limit < total;
    const nextCursor = hasMore ? cursor + limit : null;

    // Transform to old format: { code: "WY", name: "Wyoming", fee: 100 }
    const states = locations.map((loc) => {
      // Extract short code: "US-WY" -> "WY"
      const shortCode = loc.code.startsWith("US-") ? loc.code.slice(3) : loc.code;
      const fee =
        serviceId && "fees" in loc && Array.isArray(loc.fees) && loc.fees.length > 0
          ? Number(loc.fees[0].amountUSD)
          : 0;

      return {
        code: shortCode,
        name: loc.name,
        fee,
      };
    });

    return NextResponse.json({
      states,
      nextCursor,
      hasMore,
      total,
    });
  } catch {
    // Fallback: if Location table doesn't exist yet, return empty
    return NextResponse.json({
      states: [],
      nextCursor: null,
      hasMore: false,
      total: 0,
    });
  }
}
