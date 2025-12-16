import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { checkAdminOnly, authError } from "@/lib/admin-auth";

// GET /api/admin/state-fees - Get all state fees
export async function GET(request: NextRequest) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const stateFees = await prisma.stateFee.findMany({
      orderBy: [
        { isPopular: "desc" },
        { stateName: "asc" },
      ],
    });

    return NextResponse.json({
      stateFees: stateFees.map((fee) => ({
        id: fee.id,
        stateCode: fee.stateCode,
        stateName: fee.stateName,
        llcFee: Number(fee.llcFee),
        annualFee: fee.annualFee ? Number(fee.annualFee) : null,
        processingTime: fee.processingTime,
        isPopular: fee.isPopular,
        metaTitle: fee.metaTitle,
        metaDescription: fee.metaDescription,
        content: fee.content,
      })),
    });
  } catch (error) {
    console.error("Error fetching state fees:", error);
    return NextResponse.json(
      { error: "Failed to fetch state fees" },
      { status: 500 }
    );
  }
}

// Validation schema for creating state fee
const createStateFeeSchema = z.object({
  stateCode: z.string().length(2, "State code must be 2 characters"),
  stateName: z.string().min(1, "State name is required"),
  llcFee: z.number().min(0, "LLC fee must be positive"),
  annualFee: z.number().min(0).optional().nullable(),
  processingTime: z.string().optional().nullable(),
  isPopular: z.boolean().optional(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
});

// POST /api/admin/state-fees - Create new state fee
export async function POST(request: NextRequest) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const body = await request.json();
    const validatedData = createStateFeeSchema.parse(body);

    // Check if state already exists
    const existing = await prisma.stateFee.findUnique({
      where: { stateCode: validatedData.stateCode.toUpperCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "State fee already exists for this state" },
        { status: 400 }
      );
    }

    const stateFee = await prisma.stateFee.create({
      data: {
        stateCode: validatedData.stateCode.toUpperCase(),
        stateName: validatedData.stateName,
        llcFee: validatedData.llcFee,
        annualFee: validatedData.annualFee,
        processingTime: validatedData.processingTime,
        isPopular: validatedData.isPopular ?? false,
        metaTitle: validatedData.metaTitle,
        metaDescription: validatedData.metaDescription,
        content: validatedData.content,
      },
    });

    return NextResponse.json({
      ...stateFee,
      llcFee: Number(stateFee.llcFee),
      annualFee: stateFee.annualFee ? Number(stateFee.annualFee) : null,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating state fee:", error);
    return NextResponse.json(
      { error: "Failed to create state fee" },
      { status: 500 }
    );
  }
}
