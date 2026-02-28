import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";

const updatePackageSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  priceUSD: z.number().min(0).optional(),
  priceBDT: z.number().optional().nullable(),
  compareAtPriceUSD: z.number().optional().nullable(),
  isPopular: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
  features: z.array(z.string()).optional(),
  notIncluded: z.array(z.string()).optional(),
});

// GET /api/admin/packages/[id] - Get single package
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const pkg = await prisma.package.findUnique({
      where: { id },
      include: {
        features: { orderBy: { sortOrder: "asc" } },
        notIncluded: { orderBy: { sortOrder: "asc" } },
        service: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!pkg) {
      return NextResponse.json(
        { error: "Package not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      priceUSD: Number(pkg.priceUSD),
      priceBDT: pkg.priceBDT ? Number(pkg.priceBDT) : null,
      isPopular: pkg.isPopular,
      isActive: pkg.isActive,
      sortOrder: pkg.sortOrder,
      service: pkg.service,
      features: pkg.features.map((f) => ({ id: f.id, text: f.text })),
      notIncluded: pkg.notIncluded.map((n) => ({ id: n.id, text: n.text })),
    });
  } catch (error) {
    console.error("Error fetching package:", error);
    return NextResponse.json(
      { error: "Failed to fetch package" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/packages/[id] - Update package
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { features, notIncluded, ...packageData } = updatePackageSchema.parse(body);

    // Check if package exists
    const existingPackage = await prisma.package.findUnique({
      where: { id },
    });

    if (!existingPackage) {
      return NextResponse.json(
        { error: "Package not found" },
        { status: 404 }
      );
    }

    // Update features if provided
    if (features !== undefined) {
      await prisma.packageFeature.deleteMany({ where: { packageId: id } });
      await prisma.packageFeature.createMany({
        data: features.map((text, index) => ({
          packageId: id,
          text,
          sortOrder: index,
        })),
      });
    }

    // Update notIncluded if provided
    if (notIncluded !== undefined) {
      await prisma.packageNotIncluded.deleteMany({ where: { packageId: id } });
      await prisma.packageNotIncluded.createMany({
        data: notIncluded.map((text, index) => ({
          packageId: id,
          text,
          sortOrder: index,
        })),
      });
    }

    const pkg = await prisma.package.update({
      where: { id },
      data: packageData,
      include: {
        features: { orderBy: { sortOrder: "asc" } },
        notIncluded: { orderBy: { sortOrder: "asc" } },
      },
    });

    return NextResponse.json(pkg);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating package:", error);
    return NextResponse.json(
      { error: "Failed to update package" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/packages/[id] - Delete package
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if package exists and has orders
    const pkg = await prisma.package.findUnique({
      where: { id },
      include: { orderItems: { take: 1 } },
    });

    if (!pkg) {
      return NextResponse.json(
        { error: "Package not found" },
        { status: 404 }
      );
    }

    if (pkg.orderItems.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete package with existing orders. Deactivate it instead." },
        { status: 400 }
      );
    }

    await prisma.package.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting package:", error);
    return NextResponse.json(
      { error: "Failed to delete package" },
      { status: 500 }
    );
  }
}
