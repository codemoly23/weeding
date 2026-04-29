import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/vendor-cities — public, returns all cities
export async function GET() {
  const cities = await prisma.vendorCity.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, country: true },
    take: 100,
  });
  return NextResponse.json(cities);
}

// POST /api/vendor-cities — admin only, add a city
export async function POST(req: NextRequest) {
  const session = await auth();
  const role = session?.user?.role as string | undefined;
  if (role !== "ADMIN" && role !== "CONTENT_MANAGER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "City name required" }, { status: 400 });

  const city = await prisma.vendorCity.upsert({
    where: { name },
    update: {},
    create: { name, country: body.country || "SE" },
  });
  return NextResponse.json(city);
}

// DELETE /api/vendor-cities — admin only, remove a city by name
export async function DELETE(req: NextRequest) {
  const session = await auth();
  const role = session?.user?.role as string | undefined;
  if (role !== "ADMIN" && role !== "CONTENT_MANAGER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "City name required" }, { status: 400 });

  await prisma.vendorCity.deleteMany({ where: { name } });
  return NextResponse.json({ ok: true });
}
