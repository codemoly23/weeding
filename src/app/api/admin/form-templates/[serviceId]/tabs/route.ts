import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { checkAdminOnly, authError } from "@/lib/admin-auth";

// Validation schema for creating/updating tabs
const tabSchema = z.object({
  name: z.string().min(1, "Tab name is required"),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  order: z.number().optional(),
});

const reorderSchema = z.object({
  tabIds: z.array(z.string()),
});

// GET /api/admin/form-templates/[serviceId]/tabs - Get all tabs
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { serviceId } = await params;

    const template = await prisma.serviceFormTemplate.findUnique({
      where: { serviceId },
      include: {
        tabs: {
          orderBy: { order: "asc" },
          include: {
            fields: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Form template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(template.tabs);
  } catch (error) {
    console.error("Error fetching tabs:", error);
    return NextResponse.json(
      { error: "Failed to fetch tabs" },
      { status: 500 }
    );
  }
}

// POST /api/admin/form-templates/[serviceId]/tabs - Create new tab
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { serviceId } = await params;
    const body = await request.json();
    const validatedData = tabSchema.parse(body);

    // Find template
    const template = await prisma.serviceFormTemplate.findUnique({
      where: { serviceId },
      include: {
        tabs: {
          orderBy: { order: "desc" },
          take: 1,
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Form template not found" },
        { status: 404 }
      );
    }

    // Calculate next order
    const nextOrder = validatedData.order ?? (template.tabs[0]?.order ?? 0) + 1;

    const tab = await prisma.formTab.create({
      data: {
        templateId: template.id,
        name: validatedData.name,
        description: validatedData.description,
        icon: validatedData.icon,
        order: nextOrder,
      },
      include: {
        fields: true,
      },
    });

    return NextResponse.json(tab, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating tab:", error);
    return NextResponse.json(
      { error: "Failed to create tab" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/form-templates/[serviceId]/tabs - Reorder tabs
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { serviceId } = await params;
    const body = await request.json();
    const { tabIds } = reorderSchema.parse(body);

    // Find template
    const template = await prisma.serviceFormTemplate.findUnique({
      where: { serviceId },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Form template not found" },
        { status: 404 }
      );
    }

    // Update order for each tab
    await prisma.$transaction(
      tabIds.map((tabId, index) =>
        prisma.formTab.update({
          where: { id: tabId },
          data: { order: index + 1 },
        })
      )
    );

    // Fetch updated tabs
    const tabs = await prisma.formTab.findMany({
      where: { templateId: template.id },
      orderBy: { order: "asc" },
      include: {
        fields: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(tabs);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error reordering tabs:", error);
    return NextResponse.json(
      { error: "Failed to reorder tabs" },
      { status: 500 }
    );
  }
}
