import { NextRequest, NextResponse } from "next/server";
import { checkAdminAccess, authError } from "@/lib/admin-auth";
import prisma from "@/lib/db";

// GET /api/admin/vendors/reviews?status=all|pending|approved&page=1
export async function GET(req: NextRequest) {
  const auth = await checkAdminAccess();
  if (auth.error) return authError(auth);

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "all";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = 20;

  const where =
    status === "pending"
      ? { isApproved: false }
      : status === "approved"
      ? { isApproved: true }
      : {};

  const [reviews, total, pendingCount, approvedCount] = await Promise.all([
    prisma.vendorReview.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        vendor: {
          select: { id: true, slug: true, businessName: true, category: true },
        },
      },
    }),
    prisma.vendorReview.count({ where }),
    prisma.vendorReview.count({ where: { isApproved: false } }),
    prisma.vendorReview.count({ where: { isApproved: true } }),
  ]);

  return NextResponse.json({
    reviews,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    stats: { pending: pendingCount, approved: approvedCount },
  });
}
