import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/admin/themes/widget-defaults
// Returns the active theme's widget defaults for use in the page builder
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const activeTheme = await prisma.activeTheme.findFirst({
    select: { widgetDefaults: true, themeId: true },
  });

  if (!activeTheme?.widgetDefaults) {
    return NextResponse.json({ widgetDefaults: {} });
  }

  return NextResponse.json({
    themeId: activeTheme.themeId,
    widgetDefaults: activeTheme.widgetDefaults,
  });
}
