import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { checkAdminOnly, authError } from "@/lib/admin-auth";

// Validation schema for updating tab
const updateTabSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  order: z.number().optional(),
});

// GET /api/admin/form-templates/[serviceId]/tabs/[tabId] - Get single tab
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string; tabId: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { tabId } = await params;

    const tab = await prisma.formTab.findUnique({
      where: { id: tabId },
      include: {
        fields: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!tab) {
      return NextResponse.json(
        { error: "Tab not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(tab);
  } catch (error) {
    console.error("Error fetching tab:", error);
    return NextResponse.json(
      { error: "Failed to fetch tab" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/form-templates/[serviceId]/tabs/[tabId] - Update tab
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string; tabId: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { tabId } = await params;
    const body = await request.json();
    const validatedData = updateTabSchema.parse(body);

    const tab = await prisma.formTab.update({
      where: { id: tabId },
      data: validatedData,
      include: {
        fields: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(tab);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating tab:", error);
    return NextResponse.json(
      { error: "Failed to update tab" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/form-templates/[serviceId]/tabs/[tabId] - Delete tab
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string; tabId: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { tabId } = await params;

    // Check if tab exists
    const tab = await prisma.formTab.findUnique({
      where: { id: tabId },
      include: {
        template: {
          include: {
            tabs: true,
          },
        },
      },
    });

    if (!tab) {
      return NextResponse.json(
        { error: "Tab not found" },
        { status: 404 }
      );
    }

    // Don't allow deleting the last tab
    if (tab.template.tabs.length <= 1) {
      return NextResponse.json(
        { error: "Cannot delete the last tab. A form must have at least one tab." },
        { status: 400 }
      );
    }

    // Delete tab (cascades to fields)
    await prisma.formTab.delete({
      where: { id: tabId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tab:", error);
    return NextResponse.json(
      { error: "Failed to delete tab" },
      { status: 500 }
    );
  }
}
