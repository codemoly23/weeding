import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkAdminAccess, authError } from "@/lib/admin-auth";
import { SearchOptionType } from "@prisma/client";

// GET /api/admin/search-options?type=PLACE|SERVICE|LOCATION
export async function GET(request: NextRequest) {
  const accessCheck = await checkAdminAccess();
  if ("error" in accessCheck) return authError(accessCheck);

  const type = request.nextUrl.searchParams.get("type")?.toUpperCase() as SearchOptionType | null;

  const options = await prisma.searchOption.findMany({
    where: type && Object.values(SearchOptionType).includes(type) ? { type } : {},
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      type: true,
      icon: true,
      group: true,
      sortOrder: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(options);
}

// POST /api/admin/search-options
export async function POST(request: NextRequest) {
  const accessCheck = await checkAdminAccess();
  if ("error" in accessCheck) return authError(accessCheck);

  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const type = typeof body.type === "string" ? body.type.toUpperCase() : "";

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!Object.values(SearchOptionType).includes(type as SearchOptionType)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const icon = typeof body.icon === "string" ? body.icon.trim() : undefined;
  const group = typeof body.group === "string" ? body.group.trim() || null : null;

  const option = await prisma.searchOption.upsert({
    where: { name_type: { name, type: type as SearchOptionType } },
    update: { isActive: true, ...(icon !== undefined && { icon }), ...(group !== null && { group }) },
    create: { name, type: type as SearchOptionType, icon: icon || null, group, sortOrder: body.sortOrder ?? 0 },
  });

  return NextResponse.json(option, { status: 201 });
}
