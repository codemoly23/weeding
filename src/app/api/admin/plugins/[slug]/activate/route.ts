// Plugin License Activation API
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";

// Schema for pre-installed plugin activation (Option A)
const activatePreinstalledSchema = z.object({
  licenseKey: z.string().max(50).optional(),
  agreedToTerms: z.boolean().optional(),
});

// POST /api/admin/plugins/[slug]/activate - Activate pre-installed plugin with license
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    console.log("[Plugin Activate] Request:", { slug, body });

    const validatedData = activatePreinstalledSchema.parse(body);

    console.log("[Plugin Activate] Validated data:", validatedData);

    // Check if plugin exists and is in INSTALLED status
    const plugin = await prisma.plugin.findUnique({
      where: { slug },
      include: {
        menuItems: true,
        settings: true,
      },
    });

    if (!plugin) {
      return NextResponse.json(
        { success: false, message: "Plugin not found" },
        { status: 404 }
      );
    }

    if (plugin.status === "ACTIVE") {
      return NextResponse.json(
        { success: false, message: "Plugin is already active" },
        { status: 400 }
      );
    }

    // Update plugin and activate locally.
    const updatedPlugin = await prisma.plugin.update({
      where: { slug },
      data: {
        status: "ACTIVE",
        licenseKey: validatedData.licenseKey?.toUpperCase().trim() || null,
        licenseToken: null,
        licensePublicKey: null,
        licenseType: null,
        licenseTier: null,
        licenseVerifiedAt: null,
        licenseExpiresAt: null,
        lastActivatedAt: new Date(),
        lastError: null,
      },
      include: {
        menuItems: true,
        settings: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${plugin.name} has been activated successfully!`,
      plugin: {
        id: updatedPlugin.id,
        slug: updatedPlugin.slug,
        name: updatedPlugin.name,
        version: updatedPlugin.version,
        status: updatedPlugin.status,
        licenseType: updatedPlugin.licenseType,
        licenseTier: updatedPlugin.licenseTier,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Plugin activation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to activate plugin" },
      { status: 500 }
    );
  }
}

// PUT - Toggle plugin status (enable/disable already activated plugin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const existing = await prisma.plugin.findUnique({
      where: { slug },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Plugin not found" },
        { status: 404 }
      );
    }

    const newStatus = existing.status === "ACTIVE" ? "DISABLED" : "ACTIVE";

    const plugin = await prisma.plugin.update({
      where: { slug },
      data: {
        status: newStatus,
        ...(newStatus === "ACTIVE" && { lastActivatedAt: new Date() }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `${plugin.name} has been ${newStatus === "ACTIVE" ? "enabled" : "disabled"}!`,
      plugin,
    });
  } catch (error) {
    console.error("Plugin toggle error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update plugin status" },
      { status: 500 }
    );
  }
}
