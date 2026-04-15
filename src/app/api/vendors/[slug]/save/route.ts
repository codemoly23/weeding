import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// POST /api/vendors/[slug]/save — toggle save/unsave
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Login required to save vendors" }, { status: 401 });
  }

  const { slug } = await params;

  const vendor = await prisma.vendorProfile.findUnique({
    where: { slug },
    select: { id: true, isApproved: true, isActive: true },
  });

  if (!vendor || !vendor.isApproved || !vendor.isActive) {
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  }

  const existing = await prisma.savedVendor.findUnique({
    where: { userId_vendorId: { userId: session.user.id, vendorId: vendor.id } },
  });

  if (existing) {
    await prisma.savedVendor.delete({ where: { id: existing.id } });
    return NextResponse.json({ saved: false });
  } else {
    await prisma.savedVendor.create({
      data: { userId: session.user.id, vendorId: vendor.id },
    });
    return NextResponse.json({ saved: true });
  }
}

// GET /api/vendors/[slug]/save — check if saved
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ saved: false });
  }

  const { slug } = await params;

  const vendor = await prisma.vendorProfile.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!vendor) return NextResponse.json({ saved: false });

  const saved = await prisma.savedVendor.findUnique({
    where: { userId_vendorId: { userId: session.user.id, vendorId: vendor.id } },
  });

  return NextResponse.json({ saved: !!saved });
}
