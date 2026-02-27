import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET all tickers
export async function GET() {
  try {
    const tickers = await prisma.ticker.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tickers);
  } catch (error) {
    console.error("Error fetching tickers:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickers" },
      { status: 500 }
    );
  }
}

// POST create new ticker
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const ticker = await prisma.ticker.create({
      data: {
        name: body.name,
        isActive: body.isActive ?? true,
        items: body.items || [],
        speed: body.speed ?? 28,
        separator: body.separator ?? "·",
      },
    });

    return NextResponse.json(ticker, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "A ticker with this name already exists" },
        { status: 409 }
      );
    }
    console.error("Error creating ticker:", error);
    return NextResponse.json(
      { error: "Failed to create ticker" },
      { status: 500 }
    );
  }
}
