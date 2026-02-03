/**
 * Plugin Token Refresh API
 *
 * POST /api/admin/plugins/refresh-tokens - Run token refresh job
 * GET  /api/admin/plugins/refresh-tokens - Get token status for all plugins
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  runTokenRefreshJob,
  checkPluginTokenStatus,
} from "@/lib/token-refresh-job";
import prisma from "@/lib/db";

// Run the token refresh job
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check for optional pluginSlug in query
    const { searchParams } = new URL(request.url);
    const pluginSlug = searchParams.get("plugin");

    if (pluginSlug) {
      // Refresh single plugin
      const { forceRefreshPluginToken } = await import(
        "@/lib/token-refresh-job"
      );
      const result = await forceRefreshPluginToken(pluginSlug);

      return NextResponse.json({
        success: result.status === "REFRESHED",
        result,
      });
    }

    // Run full refresh job
    const jobResult = await runTokenRefreshJob();

    return NextResponse.json(jobResult);
  } catch (error) {
    console.error("[API] Token refresh failed:", error);
    return NextResponse.json(
      { error: "Token refresh failed" },
      { status: 500 }
    );
  }
}

// Get token status for all plugins
export async function GET() {
  try {
    // Verify admin authentication
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all licensed plugins
    const plugins = await prisma.plugin.findMany({
      where: {
        requiresLicense: true,
        status: "ACTIVE",
      },
      select: {
        slug: true,
        name: true,
        licenseToken: true,
        licenseVerifiedAt: true,
        licenseExpiresAt: true,
      },
    });

    // Check status for each plugin
    const statuses = await Promise.all(
      plugins.map(async (plugin) => {
        const status = await checkPluginTokenStatus(plugin.slug);
        return {
          slug: plugin.slug,
          name: plugin.name,
          hasToken: !!plugin.licenseToken,
          lastVerified: plugin.licenseVerifiedAt,
          expiresAt: status.expiresAt || plugin.licenseExpiresAt,
          daysUntilExpiry: status.daysUntilExpiry,
          needsRefresh: status.needsRefresh,
          error: status.error,
        };
      })
    );

    return NextResponse.json({
      plugins: statuses,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("[API] Token status check failed:", error);
    return NextResponse.json(
      { error: "Status check failed" },
      { status: 500 }
    );
  }
}
