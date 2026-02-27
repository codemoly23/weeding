import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET single ticker
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ticker = await prisma.ticker.findUnique({
      where: { id },
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

// PUT update ticker
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const ticker = await prisma.ticker.update({
      where: { id },
      data: {
        name: body.name,
        isActive: body.isActive,
        items: body.items,
        speed: body.speed,
        separator: body.separator,
      },
    });

    return NextResponse.json(ticker);
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "A ticker with this name already exists" },
        { status: 409 }
      );
    }
    console.error("Error updating ticker:", error);
    return NextResponse.json(
      { error: "Failed to update ticker" },
      { status: 500 }
    );
  }
}

// DELETE ticker
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.ticker.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting ticker:", error);
    return NextResponse.json(
      { error: "Failed to delete ticker" },
      { status: 500 }
    );
  }
}
