import { NextRequest, NextResponse } from "next/server";
import { checkAdminOnly, authError } from "@/lib/admin-auth";
import fs from "fs/promises";
import path from "path";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

/**
 * POST /api/admin/themes/save-pages
 * Body: { themeId: string }
 *
 * Saves the current active DB landing pages into the theme's data.json file.
 * This permanently binds the current page designs to the theme — even after a
 * full data reset, re-activating the theme will restore them exactly as saved.
 */
export async function POST(request: NextRequest) {
  const auth = await checkAdminOnly();
  if (auth.error) return authError(auth);

  try {
    const body = await request.json();
    const { themeId } = body as { themeId: string };

    if (!themeId || typeof themeId !== "string") {
      return NextResponse.json({ error: "themeId is required" }, { status: 400 });
    }

    const dataPath = path.join(process.cwd(), "public", "themes", themeId, "data.json");

    // Read existing data.json
    let themeData: Record<string, unknown>;
    try {
      const content = await fs.readFile(dataPath, "utf-8");
      themeData = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: `Theme "${themeId}" not found or data.json missing` },
        { status: 404 }
      );
    }

    // Read all active pages from DB with their blocks
    const pagesRaw = await prisma.landingPage.findMany({
      where: { isActive: true },
      include: { blocks: { orderBy: { sortOrder: "asc" } } },
    });

    // Convert to ThemePage format (mirrors theme-exporter.ts logic)
    const pages = pagesRaw.map((page) => ({
      slug: page.slug,
      name: page.name,
      ...(page.templateType ? { templateType: page.templateType } : {}),
      isSystem: page.isSystem,
      isTemplateActive: page.isTemplateActive,
      ...(page.metaTitle ? { metaTitle: page.metaTitle } : {}),
      ...(page.metaDescription ? { metaDescription: page.metaDescription } : {}),
      blocks: page.blocks.map((block) => ({
        type: block.type,
        ...(block.name ? { name: block.name } : {}),
        sortOrder: block.sortOrder,
        isActive: block.isActive,
        settings: block.settings as Record<string, unknown>,
        ...(block.hideOnMobile ? { hideOnMobile: block.hideOnMobile } : {}),
        ...(block.hideOnDesktop ? { hideOnDesktop: block.hideOnDesktop } : {}),
      })),
    }));

    // Update pages in data.json (replace entirely)
    themeData.pages = pages;
    themeData.exportedAt = new Date().toISOString();

    // Write back to disk
    await fs.writeFile(dataPath, JSON.stringify(themeData, null, 2), "utf-8");

    // Also sync ActiveTheme.widgetDefaults from the current page sections
    // so layout reads (e.g. top-utility-bar) always reflect the latest design
    const widgetDefaults: Record<string, unknown> = {};
    for (const page of pagesRaw) {
      for (const block of page.blocks) {
        if (!Array.isArray(block.settings)) continue;
        for (const section of block.settings as Array<{
          columns?: Array<{ widgets?: Array<{ type: string; settings?: Record<string, unknown> }> }>;
        }>) {
          for (const col of section.columns ?? []) {
            for (const widget of col.widgets ?? []) {
              if (widget.type && widget.settings && !widgetDefaults[widget.type]) {
                widgetDefaults[widget.type] = widget.settings;
              }
            }
          }
        }
      }
    }

    await prisma.activeTheme.updateMany({
      where: { themeId },
      data: { widgetDefaults: widgetDefaults as Prisma.InputJsonValue },
    });

    // Revalidate public site so changes are immediately visible
    revalidatePath("/", "layout");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      message: `Saved ${pages.length} page(s) to "${themeId}" theme`,
      pageCount: pages.length,
      savedPages: pages.map((p) => ({
        slug: p.slug,
        templateType: p.templateType,
        isTemplateActive: p.isTemplateActive,
      })),
    });
  } catch (error) {
    console.error("[POST /api/admin/themes/save-pages]", error);
    return NextResponse.json(
      { error: "Failed to save pages to theme", details: String(error) },
      { status: 500 }
    );
  }
}
