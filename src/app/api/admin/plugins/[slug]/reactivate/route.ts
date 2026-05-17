// Plugin License Re-activation API
// Allows re-activating a plugin with a new or renewed license key
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";

const reactivateSchema = z.object({
  licenseKey: z.string().max(50).optional(),
  agreedToTerms: z.boolean().optional(),
});

// POST /api/admin/plugins/[slug]/reactivate - Re-activate with new license key
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const validatedData = reactivateSchema.parse(body);

    // Check if plugin exists
    const plugin = await prisma.plugin.findUnique({
      where: { slug },
    });

    if (!plugin) {
      return NextResponse.json(
        { success: false, message: "Plugin not found" },
        { status: 404 }
      );
    }

    // Update plugin locally.
    await prisma.plugin.update({
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
    });

    return NextResponse.json({
      success: true,
      message: `${plugin.name} license has been updated successfully!`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Plugin re-activation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to re-activate plugin" },
      { status: 500 }
    );
  }
}
