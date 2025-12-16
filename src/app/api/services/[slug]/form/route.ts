import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/services/[slug]/form - Get form template for public use
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Find service by slug
    const service = await prisma.service.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        formTemplate: {
          where: { isActive: true },
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
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    if (!service.isActive) {
      return NextResponse.json(
        { error: "Service is not active" },
        { status: 404 }
      );
    }

    // If no template exists, return null (frontend will use fallback)
    if (!service.formTemplate) {
      return NextResponse.json({
        service: {
          id: service.id,
          name: service.name,
          slug: service.slug,
        },
        template: null,
      });
    }

    // Transform for frontend use
    const template = {
      id: service.formTemplate.id,
      version: service.formTemplate.version,
      tabs: service.formTemplate.tabs.map((tab) => ({
        id: tab.id,
        name: tab.name,
        description: tab.description,
        icon: tab.icon,
        order: tab.order,
        fields: tab.fields.map((field) => ({
          id: field.id,
          name: field.name,
          label: field.label,
          type: field.type.toLowerCase(),
          placeholder: field.placeholder,
          helpText: field.helpText,
          width: field.width.toLowerCase(),
          required: field.required,
          validation: field.validation,
          options: field.options,
          dataSourceType: field.dataSourceType?.toLowerCase(),
          dataSourceKey: field.dataSourceKey,
          dependsOn: field.dependsOn,
          conditionalLogic: field.conditionalLogic,
          accept: field.accept,
          maxSize: field.maxSize,
          defaultValue: field.defaultValue,
        })),
      })),
    };

    return NextResponse.json({
      service: {
        id: service.id,
        name: service.name,
        slug: service.slug,
      },
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
