import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { checkAdminOnly, authError } from "@/lib/admin-auth";

// Validation schema for updating custom list item
const updateItemSchema = z.object({
  value: z.string().min(1).optional(),
  label: z.string().min(1).optional(),
  metadata: z.any().optional().nullable(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/admin/lists/custom/[id]/items/[itemId] - Get single item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { itemId } = await params;

    const item = await prisma.customListItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error fetching custom list item:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom list item" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/lists/custom/[id]/items/[itemId] - Update item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { id, itemId } = await params;
    const body = await request.json();
    const validatedData = updateItemSchema.parse(body);

    // If updating value, check for duplicates
    if (validatedData.value) {
      const existingItem = await prisma.customListItem.findFirst({
        where: {
          listId: id,
          value: validatedData.value,
          NOT: { id: itemId },
        },
      });

      if (existingItem) {
        return NextResponse.json(
          { error: "An item with this value already exists" },
          { status: 400 }
        );
      }
    }

    const item = await prisma.customListItem.update({
      where: { id: itemId },
      data: validatedData,
    });

    return NextResponse.json(item);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating custom list item:", error);
    return NextResponse.json(
      { error: "Failed to update custom list item" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/lists/custom/[id]/items/[itemId] - Delete item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { itemId } = await params;

    // Check if item exists
    const item = await prisma.customListItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    // Delete item
    await prisma.customListItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting custom list item:", error);
    return NextResponse.json(
      { error: "Failed to delete custom list item" },
      { status: 500 }
    );
  }
}
