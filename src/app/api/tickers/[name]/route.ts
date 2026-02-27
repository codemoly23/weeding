import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// Public GET ticker by name (for widget rendering)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const ticker = await prisma.ticker.findFirst({
      where: { name, isActive: true },
    });

    if (!ticker) {
      return NextResponse.json({ error: "Ticker not found" }, { status: 404 });
    }

    return NextResponse.json(ticker);
  } catch (error) {
    console.error("Error fetching ticker:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticker" },
      { status: 500 }
    );
  }
}
