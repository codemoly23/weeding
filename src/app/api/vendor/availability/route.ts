import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

async function getVendor(userId: string) {
  return prisma.vendorProfile.findUnique({ where: { userId } });
}

// GET /api/vendor/availability?month=2026-05
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const vendor = await getVendor(session.user.id);
  if (!vendor) return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // "YYYY-MM"

  const where: Record<string, unknown> = { vendorId: vendor.id };
  if (month) {
    const [y, m] = month.split("-").map(Number);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0);
    where.date = { gte: start, lte: end };
  }

  const entries = await prisma.vendorAvailability.findMany({
    where,
    orderBy: { date: "asc" },
  });

  return NextResponse.json({ availability: entries });
}

// POST /api/vendor/availability — set/update a date
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const vendor = await getVendor(session.user.id);
  if (!vendor) return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });

  const { date, status, note } = await req.json();
  if (!date) return NextResponse.json({ error: "date required (YYYY-MM-DD)" }, { status: 400 });

  const validStatuses = ["AVAILABLE", "BOOKED", "TENTATIVE"];
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const entry = await prisma.vendorAvailability.upsert({
    where: { vendorId_date: { vendorId: vendor.id, date: new Date(date) } },
    create: { vendorId: vendor.id, date: new Date(date), status: status ?? "BOOKED", note: note ?? null },
    update: { status: status ?? "BOOKED", note: note ?? null },
  });

  return NextResponse.json({ entry });
}

// DELETE /api/vendor/availability — remove a date entry
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const vendor = await getVendor(session.user.id);
  if (!vendor) return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });

  const { date } = await req.json();
  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });

  await prisma.vendorAvailability.deleteMany({
    where: { vendorId: vendor.id, date: new Date(date) },
  });

  return NextResponse.json({ success: true });
}
