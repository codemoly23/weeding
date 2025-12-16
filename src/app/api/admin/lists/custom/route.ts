import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { checkAdminOnly, authError } from "@/lib/admin-auth";

// Validation schema for creating custom list
const createListSchema = z.object({
  key: z.string().min(1).regex(/^[a-z_]+$/, "Key must be lowercase with underscores only"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
});

// GET /api/admin/lists/custom - Get all custom lists
export async function GET(request: NextRequest) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const lists = await prisma.customList.findMany({
      include: {
        _count: {
          select: { items: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(
      lists.map((list) => ({
        ...list,
        itemCount: list._count.items,
      }))
    );
  } catch (error) {
    console.error("Error fetching custom lists:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom lists" },
      { status: 500 }
    );
  }
}

// POST /api/admin/lists/custom - Create custom list
export async function POST(request: NextRequest) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const body = await request.json();
    const validatedData = createListSchema.parse(body);

    // Check if key already exists
    const existing = await prisma.customList.findUnique({
      where: { key: validatedData.key },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A list with this key already exists" },
        { status: 400 }
      );
    }

    const list = await prisma.customList.create({
      data: validatedData,
      include: {
        items: true,
      },
    });

    return NextResponse.json(list, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating custom list:", error);
    return NextResponse.json(
      { error: "Failed to create custom list" },
      { status: 500 }
    );
  }
}
