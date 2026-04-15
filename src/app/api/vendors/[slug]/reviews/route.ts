import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

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
  const { authorName, rating, comment } = body;

  if (!authorName || typeof authorName !== "string" || !authorName.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const ratingNum = Number(rating);
  if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }

  await prisma.vendorReview.create({
    data: {
      vendorId: vendor.id,
      authorName: authorName.trim(),
      rating: ratingNum,
      comment: comment ? String(comment).trim() || null : null,
      isApproved: false,
    },
  });

  return NextResponse.json(
    { success: true, message: "Review submitted. It will appear after admin approval." },
    { status: 201 }
  );
}
