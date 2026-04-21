import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { SearchOptionType } from "@prisma/client";

// GET /api/search-options?type=PLACE|SERVICE|LOCATION
export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type")?.toUpperCase() as SearchOptionType | null;

  const where = {
    isActive: true,
    ...(type && Object.values(SearchOptionType).includes(type) ? { type } : {}),
  };

  const options = await prisma.searchOption.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, type: true, icon: true, group: true },
  });

  return NextResponse.json(options);
}
