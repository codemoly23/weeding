import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { checkAdminOnly, authError } from "@/lib/admin-auth";

// GET /api/admin/lists/system/[key] - Get system list with items
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { key } = await params;
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId");

    const list = await prisma.systemList.findUnique({
      where: { key },
      include: {
        items: {
          where: parentId ? { parentId } : { parentId: null },
          orderBy: [
            { isPopular: "desc" },
            { order: "asc" },
            { label: "asc" },
          ],
        },
      },
    });

    if (!list) {
      return NextResponse.json(
        { error: "System list not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(list);
  } catch (error) {
    console.error("Error fetching system list:", error);
    return NextResponse.json(
      { error: "Failed to fetch system list" },
      { status: 500 }
    );
  }
}

// Validation schema for updating system list item
const updateItemSchema = z.object({
  label: z.string().min(1).optional(),
  icon: z.string().optional().nullable(),
  metadata: z.any().optional().nullable(),
  order: z.number().optional(),
  isPopular: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

// PUT /api/admin/lists/system/[key] - Update system list item (if editable)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { key } = await params;
    const body = await request.json();
    const { itemId, ...updateData } = body;
    const validatedData = updateItemSchema.parse(updateData);

    // Check if list exists and is editable
    const list = await prisma.systemList.findUnique({
      where: { key },
    });

    if (!list) {
      return NextResponse.json(
        { error: "System list not found" },
        { status: 404 }
      );
    }

    if (!list.isEditable) {
      return NextResponse.json(
        { error: "This system list is not editable" },
        { status: 403 }
      );
    }

    // Update item
    const item = await prisma.systemListItem.update({
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
    console.error("Error updating system list item:", error);
    return NextResponse.json(
      { error: "Failed to update system list item" },
      { status: 500 }
    );
  }
}
