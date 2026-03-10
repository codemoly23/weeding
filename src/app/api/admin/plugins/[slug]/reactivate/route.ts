// Plugin License Re-activation API
// Allows re-activating a plugin with a new or renewed license key
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { verifyPluginLicense } from "@/lib/license-verification";

const reactivateSchema = z.object({
  licenseKey: z.string().min(10).max(50),
  agreedToTerms: z.boolean(),
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

    if (!validatedData.agreedToTerms) {
      return NextResponse.json(
        { success: false, message: "You must agree to the terms and conditions" },
        { status: 400 }
      );
    }

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

    // Get domain for license verification
    const domain = request.headers.get("host")?.split(":")[0] || "localhost";

    // Verify new license with license server
    const licenseResult = await verifyPluginLicense({
      licenseKey: validatedData.licenseKey,
      productSlug: slug,
      productVersion: plugin.version,
      domain,
    });

    if (!licenseResult.valid) {
      return NextResponse.json(
        {
          success: false,
          message: licenseResult.message || licenseResult.error || "Invalid license key",
        },
        { status: 400 }
      );
    }

    // Update plugin with new license info
    await prisma.plugin.update({
      where: { slug },
      data: {
        status: "ACTIVE",
        licenseKey: validatedData.licenseKey.toUpperCase().trim(),
        licenseToken: licenseResult.token,
        licensePublicKey: licenseResult.publicKey,
        licenseType: licenseResult.licenseType || "standard",
        licenseTier: licenseResult.tier,
        licenseVerifiedAt: new Date(),
        licenseExpiresAt: licenseResult.expiresAt
          ? new Date(licenseResult.expiresAt)
          : null,
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
