import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { checkAdminOnly, authError } from "@/lib/admin-auth";

// Validation schema for creating/updating custom list items
const itemSchema = z.object({
  value: z.string().min(1, "Value is required"),
  label: z.string().min(1, "Label is required"),
  metadata: z.any().optional().nullable(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
});

const reorderSchema = z.object({
  itemIds: z.array(z.string()),
});

// GET /api/admin/lists/custom/[id]/items - Get all items in a custom list
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

    const items = await prisma.customListItem.findMany({
      where: { listId: id },
      orderBy: [
        { order: "asc" },
        { label: "asc" },
      ],
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching custom list items:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom list items" },
      { status: 500 }
    );
  }
}

// POST /api/admin/lists/custom/[id]/items - Create new item
export async function POST(
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
    const validatedData = itemSchema.parse(body);

    // Check if list exists
    const list = await prisma.customList.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { order: "desc" },
          take: 1,
        },
      },
    });

    if (!list) {
      return NextResponse.json(
        { error: "Custom list not found" },
        { status: 404 }
      );
    }

    // Check if value already exists
    const existingItem = await prisma.customListItem.findFirst({
      where: {
        listId: id,
        value: validatedData.value,
      },
    });

    if (existingItem) {
      return NextResponse.json(
        { error: "An item with this value already exists" },
        { status: 400 }
      );
    }

    // Calculate next order
    const nextOrder = validatedData.order ?? (list.items[0]?.order ?? 0) + 1;

    const item = await prisma.customListItem.create({
      data: {
        listId: id,
        value: validatedData.value,
        label: validatedData.label,
        metadata: validatedData.metadata,
        order: nextOrder,
        isActive: validatedData.isActive ?? true,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating custom list item:", error);
    return NextResponse.json(
      { error: "Failed to create custom list item" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/lists/custom/[id]/items - Reorder items
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
    const { itemIds } = reorderSchema.parse(body);

    // Update order for each item
    await prisma.$transaction(
      itemIds.map((itemId, index) =>
        prisma.customListItem.update({
          where: { id: itemId },
          data: { order: index + 1 },
        })
      )
    );

    // Fetch updated items
    const items = await prisma.customListItem.findMany({
      where: { listId: id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(items);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error reordering custom list items:", error);
    return NextResponse.json(
      { error: "Failed to reorder custom list items" },
      { status: 500 }
    );
  }
}
