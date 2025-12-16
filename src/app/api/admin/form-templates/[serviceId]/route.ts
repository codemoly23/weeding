import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { checkAdminOnly, authError } from "@/lib/admin-auth";

// GET /api/admin/form-templates/[serviceId] - Get form template for a service
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

    // Check if service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { id: true, name: true, slug: true },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Get form template with all tabs and fields
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

    return NextResponse.json({
      service,
      template,
    });
  } catch (error) {
    console.error("Error fetching form template:", error);
    return NextResponse.json(
      { error: "Failed to fetch form template" },
      { status: 500 }
    );
  }
}

// POST /api/admin/form-templates/[serviceId] - Create form template for a service
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

    // Check if service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Check if template already exists
    const existingTemplate = await prisma.serviceFormTemplate.findUnique({
      where: { serviceId },
    });

    if (existingTemplate) {
      return NextResponse.json(
        { error: "Form template already exists for this service" },
        { status: 400 }
      );
    }

    // Create empty template with default first tab
    const template = await prisma.serviceFormTemplate.create({
      data: {
        serviceId,
        tabs: {
          create: {
            name: "Basic Information",
            description: "Enter your basic details",
            icon: "user",
            order: 1,
          },
        },
      },
      include: {
        tabs: {
          include: {
            fields: true,
          },
        },
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Error creating form template:", error);
    return NextResponse.json(
      { error: "Failed to create form template" },
      { status: 500 }
    );
  }
}

// Validation schema for updating template
const updateTemplateSchema = z.object({
  isActive: z.boolean().optional(),
  version: z.number().optional(),
});

// PUT /api/admin/form-templates/[serviceId] - Update form template
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
    const validatedData = updateTemplateSchema.parse(body);

    const template = await prisma.serviceFormTemplate.update({
      where: { serviceId },
      data: validatedData,
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

    return NextResponse.json(template);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating form template:", error);
    return NextResponse.json(
      { error: "Failed to update form template" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/form-templates/[serviceId] - Delete form template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { serviceId } = await params;

    // Check if template exists
    const template = await prisma.serviceFormTemplate.findUnique({
      where: { serviceId },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Form template not found" },
        { status: 404 }
      );
    }

    // Delete template (cascades to tabs and fields)
    await prisma.serviceFormTemplate.delete({
      where: { serviceId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting form template:", error);
    return NextResponse.json(
      { error: "Failed to delete form template" },
      { status: 500 }
    );
  }
}
