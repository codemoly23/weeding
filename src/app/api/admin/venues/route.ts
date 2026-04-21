import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkAdminAccess, authError } from "@/lib/admin-auth";

// GET /api/admin/venues?category=wedding|party|specialty
export async function GET(request: NextRequest) {
  const accessCheck = await checkAdminAccess();
  if ("error" in accessCheck) return authError(accessCheck);

  const category = request.nextUrl.searchParams.get("category");

  const venues = await prisma.venue.findMany({
    where: category ? { category } : {},
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(venues);
}

// POST /api/admin/venues
export async function POST(request: NextRequest) {
  const accessCheck = await checkAdminAccess();
  if ("error" in accessCheck) return authError(accessCheck);

  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const category = typeof body.category === "string" ? body.category.trim() : "";
  const type = typeof body.type === "string" ? body.type.trim() : "";

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!category) return NextResponse.json({ error: "Category is required" }, { status: 400 });
  if (!type) return NextResponse.json({ error: "Type is required" }, { status: 400 });

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") + "-" + Date.now();

  const venue = await prisma.venue.create({
    data: {
      name,
      slug,
      category,
      type,
      location: typeof body.location === "string" ? body.location.trim() || null : null,
      city: typeof body.city === "string" ? body.city.trim() || null : null,
      rating: typeof body.rating === "number" ? body.rating : 0,
      reviewCount: typeof body.reviewCount === "number" ? body.reviewCount : 0,
      price: typeof body.price === "number" ? body.price : null,
      priceUnit: typeof body.priceUnit === "string" ? body.priceUnit.trim() || "/day" : "/day",
      image: typeof body.image === "string" ? body.image.trim() || null : null,
      badge: typeof body.badge === "string" ? body.badge.trim() || null : null,
      badgeColor: typeof body.badgeColor === "string" ? body.badgeColor.trim() || null : null,
      tags: Array.isArray(body.tags) ? body.tags.filter((t: unknown) => typeof t === "string") : [],
      href: typeof body.href === "string" ? body.href.trim() || null : null,
      description: typeof body.description === "string" ? body.description.trim() || null : null,
      isFeatured: typeof body.isFeatured === "boolean" ? body.isFeatured : false,
      isActive: typeof body.isActive === "boolean" ? body.isActive : true,
      sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : 0,
    },
  });

  return NextResponse.json(venue, { status: 201 });
}
