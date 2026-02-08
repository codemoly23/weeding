import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const limit = parseInt(searchParams.get("limit") || "4");

  if (!slug) {
    return NextResponse.json({ services: [] });
  }

  try {
    // Get the current service to find its category
    const currentService = await prisma.service.findUnique({
      where: { slug },
      select: { id: true, categoryId: true },
    });

    if (!currentService) {
      return NextResponse.json({ services: [] });
    }

    // Find related services: same category first, then popular
    const services = await prisma.service.findMany({
      where: {
        isActive: true,
        id: { not: currentService.id },
        ...(currentService.categoryId
          ? { categoryId: currentService.categoryId }
          : {}),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        shortDesc: true,
        icon: true,
        startingPrice: true,
        category: { select: { name: true, slug: true } },
      },
      orderBy: [{ isPopular: "desc" }, { sortOrder: "asc" }],
      take: limit,
    });

    // If not enough from same category, fill with popular services
    if (services.length < limit && currentService.categoryId) {
      const moreServices = await prisma.service.findMany({
        where: {
          isActive: true,
          id: {
            notIn: [currentService.id, ...services.map((s) => s.id)],
          },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          shortDesc: true,
          icon: true,
          startingPrice: true,
          category: { select: { name: true, slug: true } },
        },
        orderBy: [{ isPopular: "desc" }, { sortOrder: "asc" }],
        take: limit - services.length,
      });
      services.push(...moreServices);
    }

    // Convert Decimal to number
    const serialized = services.map((s) => ({
      ...s,
      startingPrice: Number(s.startingPrice),
    }));

    return NextResponse.json({ services: serialized });
  } catch (error) {
    console.error("Error fetching related services:", error);
    return NextResponse.json(
      { error: "Failed to fetch related services" },
      { status: 500 }
    );
  }
}
