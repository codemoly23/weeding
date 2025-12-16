import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { checkAdminOnly, authError } from "@/lib/admin-auth";

// GET /api/admin/state-fees/[id] - Get single state fee
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

    const stateFee = await prisma.stateFee.findUnique({
      where: { id },
    });

    if (!stateFee) {
      return NextResponse.json(
        { error: "State fee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...stateFee,
      llcFee: Number(stateFee.llcFee),
      annualFee: stateFee.annualFee ? Number(stateFee.annualFee) : null,
    });
  } catch (error) {
    console.error("Error fetching state fee:", error);
    return NextResponse.json(
      { error: "Failed to fetch state fee" },
      { status: 500 }
    );
  }
}

// Validation schema for updating state fee
const updateStateFeeSchema = z.object({
  stateName: z.string().min(1).optional(),
  llcFee: z.number().min(0).optional(),
  annualFee: z.number().min(0).optional().nullable(),
  processingTime: z.string().optional().nullable(),
  isPopular: z.boolean().optional(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
});

// PUT /api/admin/state-fees/[id] - Update state fee
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
    const validatedData = updateStateFeeSchema.parse(body);

    // Check if state fee exists
    const existing = await prisma.stateFee.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "State fee not found" },
        { status: 404 }
      );
    }

    const stateFee = await prisma.stateFee.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json({
      ...stateFee,
      llcFee: Number(stateFee.llcFee),
      annualFee: stateFee.annualFee ? Number(stateFee.annualFee) : null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating state fee:", error);
    return NextResponse.json(
      { error: "Failed to update state fee" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/state-fees/[id] - Delete state fee
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

    // Check if state fee exists
    const existing = await prisma.stateFee.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "State fee not found" },
        { status: 404 }
      );
    }

    await prisma.stateFee.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting state fee:", error);
    return NextResponse.json(
      { error: "Failed to delete state fee" },
      { status: 500 }
    );
  }
}
