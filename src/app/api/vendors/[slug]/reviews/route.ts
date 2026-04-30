import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";

const reviewSchema = z.object({
  authorName: z.string().trim().min(1).max(100),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional().nullable(),
});

// POST /api/vendors/[slug]/reviews
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const vendor = await prisma.vendorProfile.findUnique({
    where: { slug },
    select: { id: true, isApproved: true, isActive: true },
  });

  if (!vendor || !vendor.isApproved || !vendor.isActive) {
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid review data", details: parsed.error.issues },
      { status: 400 }
    );
  }
  const { authorName, rating, comment } = parsed.data;

  await prisma.vendorReview.create({
    data: {
      vendorId: vendor.id,
      authorName,
      rating,
      comment: comment || null,
      isApproved: false,
    },
  });

  return NextResponse.json(
    { success: true, message: "Review submitted. It will appear after admin approval." },
    { status: 201 }
  );
}
