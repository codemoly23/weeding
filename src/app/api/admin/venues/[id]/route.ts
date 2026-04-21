import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkAdminAccess, authError } from "@/lib/admin-auth";

// PUT /api/admin/venues/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const accessCheck = await checkAdminAccess();
  if ("error" in accessCheck) return authError(accessCheck);

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const data: Record<string, unknown> = {};
  if (typeof body.name === "string") data.name = body.name.trim();
  if (typeof body.category === "string") data.category = body.category.trim();
  if (typeof body.type === "string") data.type = body.type.trim();
  if (typeof body.location === "string") data.location = body.location.trim() || null;
  if (typeof body.city === "string") data.city = body.city.trim() || null;
  if (typeof body.rating === "number") data.rating = body.rating;
  if (typeof body.reviewCount === "number") data.reviewCount = body.reviewCount;
  if (typeof body.price === "number" || body.price === null) data.price = body.price;
  if (typeof body.priceUnit === "string") data.priceUnit = body.priceUnit.trim() || "/day";
  if (typeof body.image === "string") data.image = body.image.trim() || null;
  if (typeof body.badge === "string") data.badge = body.badge.trim() || null;
  if (typeof body.badgeColor === "string") data.badgeColor = body.badgeColor.trim() || null;
  if (Array.isArray(body.tags)) data.tags = body.tags.filter((t: unknown) => typeof t === "string");
  if (typeof body.href === "string") data.href = body.href.trim() || null;
  if (typeof body.description === "string") data.description = body.description.trim() || null;
  if (typeof body.isFeatured === "boolean") data.isFeatured = body.isFeatured;
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;
  if (typeof body.sortOrder === "number") data.sortOrder = body.sortOrder;

  const venue = await prisma.venue.update({ where: { id }, data });
  return NextResponse.json(venue);
}

// DELETE /api/admin/venues/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const accessCheck = await checkAdminAccess();
  if ("error" in accessCheck) return authError(accessCheck);

  const { id } = await params;
  await prisma.venue.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
