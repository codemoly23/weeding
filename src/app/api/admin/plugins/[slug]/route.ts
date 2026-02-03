import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { pluginLoader } from "@/lib/plugin-loader";

// Validation schema for updating a plugin
const updatePluginSchema = z.object({
  status: z.enum(["INSTALLED", "ACTIVE", "DISABLED", "ERROR"]).optional(),
  version: z.string().optional(),
  lastError: z.string().optional(),
  manifest: z.record(z.string(), z.unknown()).optional(),
  adminMenuLabel: z.string().optional(),
  adminMenuIcon: z.string().optional(),
  adminMenuPosition: z.number().optional(),
});

// GET /api/admin/plugins/[slug] - Get plugin details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const plugin = await prisma.plugin.findUnique({
      where: { slug },
      include: {
        menuItems: {
          orderBy: { sortOrder: "asc" },
        },
        settings: true,
      },
    });

    if (!plugin) {
      return NextResponse.json(
        { error: "Plugin not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ plugin });
  } catch (error) {
    console.error("Error fetching plugin:", error);
    return NextResponse.json(
      { error: "Failed to fetch plugin" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/plugins/[slug] - Update plugin (activate/deactivate/etc)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const validatedData = updatePluginSchema.parse(body);

    const existing = await prisma.plugin.findUnique({
      where: { slug },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Plugin not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = { ...validatedData };

    // Update activation timestamp if status changes to ACTIVE
    if (validatedData.status === "ACTIVE" && existing.status !== "ACTIVE") {
      updateData.lastActivatedAt = new Date();
      updateData.lastError = null;
      updateData.errorAt = null;
    }

    // Track error timestamp
    if (validatedData.status === "ERROR") {
      updateData.errorAt = new Date();
    }

    const plugin = await prisma.plugin.update({
      where: { slug },
      data: updateData,
      include: {
        menuItems: true,
        settings: true,
      },
    });

    return NextResponse.json({
      message: `Plugin ${validatedData.status === "ACTIVE" ? "activated" : validatedData.status === "DISABLED" ? "disabled" : "updated"} successfully`,
      plugin,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating plugin:", error);
    return NextResponse.json(
      { error: "Failed to update plugin" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/plugins/[slug] - Uninstall plugin
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;
    const keepFiles = searchParams.get("keepFiles") === "true";

    const existing = await prisma.plugin.findUnique({
      where: { slug },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Plugin not found" },
        { status: 404 }
      );
    }

    // Step 1: Delete plugin files (unless keepFiles=true)
    if (!keepFiles) {
      try {
        await pluginLoader.deletePluginFiles(slug);
        console.log(`Plugin files deleted for: ${slug}`);
      } catch (fileError) {
        // Log but don't fail if files don't exist
        console.warn(`Could not delete plugin files for ${slug}:`, fileError);
      }
    }

    // Step 2: Delete plugin from database (cascades to settings and menu items)
    await prisma.plugin.delete({
      where: { slug },
    });

    return NextResponse.json({
      message: "Plugin uninstalled successfully",
      filesDeleted: !keepFiles,
    });
  } catch (error) {
    console.error("Error uninstalling plugin:", error);
    return NextResponse.json(
      { error: "Failed to uninstall plugin" },
      { status: 500 }
    );
  }
}
