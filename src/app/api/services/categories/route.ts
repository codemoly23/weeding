import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/services/categories - List all active categories with their services
export async function GET() {
  try {
    const categories = await prisma.serviceCategory.findMany({
      where: { isActive: true },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            slug: true,
            name: true,
            shortDesc: true,
            icon: true,
            startingPrice: true,
            isPopular: true,
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    // Transform the data for frontend consumption
    const transformedCategories = categories.map((category) => ({
      id: category.id,
      slug: category.slug,
      name: category.name,
      description: category.description,
      icon: category.icon,
      services: category.services.map((s) => ({
        id: s.id,
        slug: s.slug,
        name: s.name,
        shortDesc: s.shortDesc,
        icon: s.icon,
        startingPrice: Number(s.startingPrice),
        isPopular: s.isPopular,
      })),
    }));

    return NextResponse.json({
      categories: transformedCategories,
      total: transformedCategories.length,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
