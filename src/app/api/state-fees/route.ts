import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/state-fees - Get all state fees (public)
// Query params:
//   - popular: only return popular states if true
//   - code: get specific state by code
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const popularOnly = searchParams.get("popular") === "true";
    const stateCode = searchParams.get("code");

    // If specific state requested
    if (stateCode) {
      const stateFee = await prisma.stateFee.findUnique({
        where: { stateCode: stateCode.toUpperCase() },
      });

      if (!stateFee) {
        return NextResponse.json(
          { error: "State not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        stateCode: stateFee.stateCode,
        stateName: stateFee.stateName,
        llcFee: Number(stateFee.llcFee),
        annualFee: stateFee.annualFee ? Number(stateFee.annualFee) : null,
        processingTime: stateFee.processingTime,
        isPopular: stateFee.isPopular,
      });
    }

    // Get all state fees
    const stateFees = await prisma.stateFee.findMany({
      where: popularOnly ? { isPopular: true } : undefined,
      orderBy: [
        { isPopular: "desc" },
        { stateName: "asc" },
      ],
      select: {
        stateCode: true,
        stateName: true,
        llcFee: true,
        annualFee: true,
        processingTime: true,
        isPopular: true,
      },
    });

    return NextResponse.json({
      stateFees: stateFees.map((fee) => ({
        stateCode: fee.stateCode,
        stateName: fee.stateName,
        llcFee: Number(fee.llcFee),
        annualFee: fee.annualFee ? Number(fee.annualFee) : null,
        processingTime: fee.processingTime,
        isPopular: fee.isPopular,
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
