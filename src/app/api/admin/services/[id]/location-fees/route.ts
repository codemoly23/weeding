import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { checkAdminOnly, authError } from "@/lib/admin-auth";

// GET /api/admin/services/[id]/location-fees - Get all location fees for a service
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { id: serviceId } = await params;

    // Verify service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: {
        id: true,
        name: true,
        hasLocationBasedPricing: true,
        locationFeeLabel: true,
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Get all location fees for this service with location details
    const fees = await prisma.locationFee.findMany({
      where: { serviceId },
      include: {
        location: {
          select: {
            id: true,
            code: true,
            name: true,
            country: true,
            type: true,
            isPopular: true,
          },
        },
      },
      orderBy: [
        { location: { isPopular: "desc" } },
        { location: { name: "asc" } },
        { feeType: "asc" },
      ],
    });

    return NextResponse.json({
      service: {
        id: service.id,
        name: service.name,
        hasLocationBasedPricing: service.hasLocationBasedPricing,
        locationFeeLabel: service.locationFeeLabel,
      },
      fees: fees.map((fee) => ({
        id: fee.id,
        locationId: fee.locationId,
        location: fee.location,
        feeType: fee.feeType,
        label: fee.label,
        amountUSD: Number(fee.amountUSD),
        amountBDT: fee.amountBDT ? Number(fee.amountBDT) : null,
        processingTime: fee.processingTime,
        isActive: fee.isActive,
        isRequired: fee.isRequired,
        expeditedFee: fee.expeditedFee ? Number(fee.expeditedFee) : null,
        expeditedTime: fee.expeditedTime,
        notes: fee.notes,
      })),
    });
  } catch (error) {
    console.error("Error fetching location fees:", error);
    return NextResponse.json(
      { error: "Failed to fetch location fees" },
      { status: 500 }
    );
  }
}

// Validation schema for bulk upsert
const feeItemSchema = z.object({
  id: z.string().optional(), // If provided, update existing
  locationId: z.string(),
  feeType: z.enum(["FILING", "ANNUAL", "EXPEDITED", "FRANCHISE", "CUSTOM"]).default("FILING"),
  label: z.string().optional().nullable(),
  amountUSD: z.number().min(0),
  amountBDT: z.number().min(0).optional().nullable(),
  processingTime: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  isRequired: z.boolean().optional(),
  expeditedFee: z.number().min(0).optional().nullable(),
  expeditedTime: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const bulkUpsertSchema = z.object({
  fees: z.array(feeItemSchema),
  // Also allow updating service-level settings
  hasLocationBasedPricing: z.boolean().optional(),
  locationFeeLabel: z.string().optional().nullable(),
});

// POST /api/admin/services/[id]/location-fees - Bulk upsert location fees
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { id: serviceId } = await params;
    const body = await request.json();
    const data = bulkUpsertSchema.parse(body);

    // Verify service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Update service-level settings if provided
    if (
      data.hasLocationBasedPricing !== undefined ||
      data.locationFeeLabel !== undefined
    ) {
      await prisma.service.update({
        where: { id: serviceId },
        data: {
          ...(data.hasLocationBasedPricing !== undefined && {
            hasLocationBasedPricing: data.hasLocationBasedPricing,
          }),
          ...(data.locationFeeLabel !== undefined && {
            locationFeeLabel: data.locationFeeLabel,
          }),
        },
      });
    }

    // Upsert each fee
    const results = [];
    for (const fee of data.fees) {
      const result = await prisma.locationFee.upsert({
        where: {
          serviceId_locationId_feeType: {
            serviceId,
            locationId: fee.locationId,
            feeType: fee.feeType,
          },
        },
        update: {
          label: fee.label,
          amountUSD: fee.amountUSD,
          amountBDT: fee.amountBDT,
          processingTime: fee.processingTime,
          isActive: fee.isActive ?? true,
          isRequired: fee.isRequired ?? true,
          expeditedFee: fee.expeditedFee,
          expeditedTime: fee.expeditedTime,
          notes: fee.notes,
        },
        create: {
          serviceId,
          locationId: fee.locationId,
          feeType: fee.feeType,
          label: fee.label,
          amountUSD: fee.amountUSD,
          amountBDT: fee.amountBDT,
          processingTime: fee.processingTime,
          isActive: fee.isActive ?? true,
          isRequired: fee.isRequired ?? true,
          expeditedFee: fee.expeditedFee,
          expeditedTime: fee.expeditedTime,
          notes: fee.notes,
        },
      });
      results.push(result);
    }

    return NextResponse.json({
      success: true,
      count: results.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error upserting location fees:", error);
    return NextResponse.json(
      { error: "Failed to save location fees" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/services/[id]/location-fees - Delete specific fees
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { id: serviceId } = await params;
    const { searchParams } = new URL(request.url);
    const feeId = searchParams.get("feeId");
    const locationId = searchParams.get("locationId");

    if (feeId) {
      // Delete specific fee by ID
      await prisma.locationFee.delete({
        where: { id: feeId, serviceId },
      });
    } else if (locationId) {
      // Delete all fees for a location in this service
      await prisma.locationFee.deleteMany({
        where: { serviceId, locationId },
      });
    } else {
      return NextResponse.json(
        { error: "Provide feeId or locationId to delete" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting location fees:", error);
    return NextResponse.json(
      { error: "Failed to delete location fees" },
      { status: 500 }
    );
  }
}
