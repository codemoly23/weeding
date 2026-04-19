import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

const DEFAULT_CITIES = [
  "Stockholm", "Göteborg", "Malmö", "Uppsala", "Västerås",
  "Örebro", "Linköping", "Helsingborg", "Jönköping", "Norrköping",
];

// POST /api/admin/vendors/seed-cities
// Body: { cities?: string[] }
// Assigns cities to vendors that have no city set (round-robin).
export async function POST(req: NextRequest) {
  const session = await auth();
  const role = session?.user?.role as string | undefined;
  if (role !== "ADMIN" && role !== "CONTENT_MANAGER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const cities: string[] =
    Array.isArray(body.cities) && body.cities.length > 0
      ? body.cities.filter((c: unknown) => typeof c === "string" && c.trim())
      : DEFAULT_CITIES;

  const vendors = await prisma.vendorProfile.findMany({
    where: { OR: [{ city: null }, { city: "" }] },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });

  if (vendors.length === 0) {
    return NextResponse.json({ updated: 0 });
  }

  await Promise.all(
    vendors.map((v, i) =>
      prisma.vendorProfile.update({
        where: { id: v.id },
        data: { city: cities[i % cities.length] },
      })
    )
  );

  return NextResponse.json({ updated: vendors.length });
}
