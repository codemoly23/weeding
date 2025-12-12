import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/services - List all active services
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categorySlug = searchParams.get("category");
    const popular = searchParams.get("popular") === "true";

    const where = {
      isActive: true,
      ...(categorySlug && {
        category: { slug: categorySlug },
      }),
      ...(popular && { isPopular: true }),
    };

    const services = await prisma.service.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        features: {
          orderBy: { sortOrder: "asc" },
          select: { id: true, text: true },
        },
        packages: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: {
            features: {
              orderBy: { sortOrder: "asc" },
              select: { text: true },
            },
            notIncluded: {
              orderBy: { sortOrder: "asc" },
              select: { text: true },
            },
          },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    // Transform the data for frontend consumption
    const transformedServices = services.map((service) => ({
      id: service.id,
      slug: service.slug,
      name: service.name,
      shortDesc: service.shortDesc,
      icon: service.icon,
      image: service.image,
      startingPrice: Number(service.startingPrice),
      isPopular: service.isPopular,
      category: service.category,
      features: service.features.map((f) => f.text),
      packages: service.packages.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: Number(p.priceUSD),
        isPopular: p.isPopular,
        features: p.features.map((f) => f.text),
        notIncluded: p.notIncluded.map((n) => n.text),
      })),
    }));

    return NextResponse.json({
      services: transformedServices,
      total: transformedServices.length,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}
