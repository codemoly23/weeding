import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { checkAdminOnly, authError } from "@/lib/admin-auth";

// Validation schema for updating custom list
const updateListSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
});

// GET /api/admin/lists/custom/[id] - Get custom list with items
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

    const list = await prisma.customList.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: [
            { order: "asc" },
            { label: "asc" },
          ],
        },
      },
    });

    if (!list) {
      return NextResponse.json(
        { error: "Custom list not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(list);
  } catch (error) {
    console.error("Error fetching custom list:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom list" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/lists/custom/[id] - Update custom list
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
    const validatedData = updateListSchema.parse(body);

    const list = await prisma.customList.update({
      where: { id },
      data: validatedData,
      include: {
        items: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(list);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating custom list:", error);
    return NextResponse.json(
      { error: "Failed to update custom list" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/lists/custom/[id] - Delete custom list
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

    // Check if list is used by any form fields
    const usedByFields = await prisma.formField.findFirst({
      where: {
        dataSourceType: "CUSTOM_LIST",
        dataSourceKey: id,
      },
    });

    if (usedByFields) {
      return NextResponse.json(
        { error: "Cannot delete list that is being used by form fields" },
        { status: 400 }
      );
    }

    // Delete list (cascades to items)
    await prisma.customList.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting custom list:", error);
    return NextResponse.json(
      { error: "Failed to delete custom list" },
      { status: 500 }
    );
  }
}
