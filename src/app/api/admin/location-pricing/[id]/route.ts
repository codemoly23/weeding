import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { checkAdminOnly, authError } from "@/lib/admin-auth";

// GET /api/admin/location-pricing/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { id } = await params;

    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        fees: {
          include: {
            service: { select: { id: true, name: true, slug: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...location,
      fees: location.fees.map((fee) => ({
        ...fee,
        amountUSD: Number(fee.amountUSD),
        amountBDT: fee.amountBDT ? Number(fee.amountBDT) : null,
        expeditedFee: fee.expeditedFee ? Number(fee.expeditedFee) : null,
      })),
    });
  } catch (error) {
    console.error("Error fetching location:", error);
    return NextResponse.json(
      { error: "Failed to fetch location" },
      { status: 500 }
    );
  }
}

const updateLocationSchema = z.object({
  name: z.string().min(1).optional(),
  country: z.string().min(2).optional(),
  type: z.enum(["STATE", "PROVINCE", "COUNTRY", "TERRITORY"]).optional(),
  isPopular: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
});

// PUT /api/admin/location-pricing/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { id } = await params;
    const body = await request.json();
    const data = updateLocationSchema.parse(body);

    const existing = await prisma.location.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    const location = await prisma.location.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.country !== undefined && { country: data.country.toUpperCase() }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.isPopular !== undefined && { isPopular: data.isPopular }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle }),
        ...(data.metaDescription !== undefined && { metaDescription: data.metaDescription }),
        ...(data.content !== undefined && { content: data.content }),
      },
    });

    return NextResponse.json(location);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating location:", error);
    return NextResponse.json(
      { error: "Failed to update location" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/location-pricing/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { id } = await params;

    const existing = await prisma.location.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    await prisma.location.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting location:", error);
    return NextResponse.json(
      { error: "Failed to delete location" },
      { status: 500 }
    );
  }
}
