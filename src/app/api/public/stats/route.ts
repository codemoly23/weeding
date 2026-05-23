import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/public/stats
 *
 * Returns live counts for homepage stats widget.
 * Cached for 5 minutes to avoid hitting the DB on every page view.
 */
const getStats = unstable_cache(
  async () => {
    const [totalEvents, totalGuests, approvedVendors] = await Promise.all([
      prisma.weddingProject.count(),
      prisma.weddingGuest.count(),
      prisma.vendorProfile.count({
        where: { isApproved: true, isActive: true },
      }),
    ]);

    return {
      totalEvents,
      totalGuests,
      approvedVendors,
    };
  },
  ["public-stats"],
  { tags: ["public-stats"], revalidate: 300 } // 5-min cache
);

export async function GET() {
  try {
    const stats = await getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("[GET /api/public/stats]", error);
    return NextResponse.json(
      { totalEvents: 0, totalGuests: 0, approvedVendors: 0 },
      { status: 200 } // graceful fallback — return zeros, never 500
    );
  }
}
