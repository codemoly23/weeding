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

    // Helper: safely parse JSON fields that may be string or already-parsed object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const safeJson = (v: any) => {
      if (!v) return undefined;
      if (typeof v === "string") { try { return JSON.parse(v); } catch { return undefined; } }
      return v;
    };

    // Read active header config + menu items
    const headerRaw = await prisma.headerConfig.findFirst({
      where: { isActive: true },
      include: {
        menuItems: {
          where: { parentId: null },
          orderBy: { sortOrder: "asc" },
          include: {
            children: {
              orderBy: { sortOrder: "asc" },
              include: {
                children: { orderBy: { sortOrder: "asc" } },
              },
            },
          },
        },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serializeMenuItem = (item: any): Record<string, unknown> => ({
      label: item.label,
      url: item.url ?? undefined,
      sortOrder: item.sortOrder,
      isVisible: item.isVisible,
      visibleOnMobile: item.visibleOnMobile,
      ...(item.isMegaMenu ? { isMegaMenu: true } : {}),
      ...(item.megaMenuColumns ? { megaMenuColumns: item.megaMenuColumns } : {}),
      ...(item.icon ? { icon: item.icon } : {}),
      ...(item.badge ? { badge: item.badge } : {}),
      ...(item.categoryName ? { categoryName: item.categoryName } : {}),
      ...(item.categoryIcon ? { categoryIcon: item.categoryIcon } : {}),
      ...(item.categoryDesc ? { categoryDesc: item.categoryDesc } : {}),
      ...(item.megaMenuContent ? { megaMenuContent: item.megaMenuContent } : {}),
      ...(item.children?.length ? { children: item.children.map(serializeMenuItem) } : {}),
    });

    if (headerRaw) {
      themeData.headerConfig = {
        name: headerRaw.name,
        layout: headerRaw.layout,
        sticky: headerRaw.sticky,
        transparent: headerRaw.transparent,
        topBarEnabled: headerRaw.topBarEnabled,
        logoPosition: headerRaw.logoPosition,
        logoMaxHeight: headerRaw.logoMaxHeight,
        showAuthButtons: headerRaw.showAuthButtons,
        loginText: headerRaw.loginText,
        registerText: headerRaw.registerText,
        registerUrl: headerRaw.registerUrl,
        searchEnabled: headerRaw.searchEnabled,
        mobileBreakpoint: headerRaw.mobileBreakpoint,
        height: headerRaw.height,
        ...(headerRaw.ctaButtons ? { ctaButtons: safeJson(headerRaw.ctaButtons) } : {}),
        ...(headerRaw.bgColor ? { bgColor: headerRaw.bgColor } : {}),
        ...(headerRaw.textColor ? { textColor: headerRaw.textColor } : {}),
        ...(headerRaw.hoverColor ? { hoverColor: headerRaw.hoverColor } : {}),
        ...(headerRaw.accentColor ? { accentColor: headerRaw.accentColor } : {}),
      };
      themeData.menuItems = headerRaw.menuItems.map(serializeMenuItem);
    }

    // Read active footer config + widgets
    const footerRaw = await prisma.footerConfig.findFirst({
      where: { isActive: true },
      include: {
        widgets: {
          orderBy: { sortOrder: "asc" },
          include: {
            menuItems: { orderBy: { sortOrder: "asc" } },
          },
        },
      },
    });

    if (footerRaw) {
      themeData.footerConfig = {
        layout:           footerRaw.layout,
        columns:          footerRaw.columns,
        // Background
        bgType:           footerRaw.bgType,
        bgColor:          footerRaw.bgColor ?? undefined,
        bgGradient:       safeJson(footerRaw.bgGradient),
        bgPattern:        footerRaw.bgPattern ?? undefined,
        bgPatternColor:   footerRaw.bgPatternColor ?? undefined,
        bgPatternOpacity: footerRaw.bgPatternOpacity ?? undefined,
        bgImage:          footerRaw.bgImage ?? undefined,
        bgImageOverlay:   footerRaw.bgImageOverlay ?? undefined,
        // Colors
        textColor:        footerRaw.textColor ?? undefined,
        headingColor:     footerRaw.headingColor ?? undefined,
        linkColor:        footerRaw.linkColor ?? undefined,
        linkHoverColor:   footerRaw.linkHoverColor ?? undefined,
        accentColor:      footerRaw.accentColor ?? undefined,
        borderColor:      footerRaw.borderColor ?? undefined,
        dividerColor:     footerRaw.dividerColor ?? undefined,
        dividerStyle:     footerRaw.dividerStyle,
        // Typography
        headingSize:      footerRaw.headingSize,
        headingWeight:    footerRaw.headingWeight,
        headingStyle:     footerRaw.headingStyle,
        // Social
        showSocialLinks:  footerRaw.showSocialLinks,
        socialPosition:   footerRaw.socialPosition,
        socialShape:      footerRaw.socialShape,
        socialSize:       footerRaw.socialSize,
        socialColorMode:  footerRaw.socialColorMode,
        socialHoverEffect: footerRaw.socialHoverEffect,
        socialBgStyle:    footerRaw.socialBgStyle,
        // Links
        linkPrefix:       footerRaw.linkPrefix,
        linkHoverEffect:  footerRaw.linkHoverEffect,
        // Trust badges
        showTrustBadges:  footerRaw.showTrustBadges,
        trustBadges:      safeJson(footerRaw.trustBadges),
        // Bottom bar
        bottomBarEnabled: footerRaw.bottomBarEnabled,
        bottomBarLayout:  footerRaw.bottomBarLayout,
        copyrightText:    footerRaw.copyrightText ?? undefined,
        showDisclaimer:   footerRaw.showDisclaimer,
        disclaimerText:   footerRaw.disclaimerText ?? undefined,
        bottomLinks:      safeJson(footerRaw.bottomLinks),
        // Border & effects
        topBorderStyle:   footerRaw.topBorderStyle,
        topBorderHeight:  footerRaw.topBorderHeight,
        topBorderColor:   footerRaw.topBorderColor ?? undefined,
        shadow:           footerRaw.shadow,
        // Spacing & container
        paddingTop:       footerRaw.paddingTop,
        paddingBottom:    footerRaw.paddingBottom,
        containerWidth:   footerRaw.containerWidth,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      themeData.footerWidgets = footerRaw.widgets.map((w: any) => ({
        type:        w.type,
        title:       w.title ?? undefined,
        showTitle:   w.showTitle,
        headingIcon: w.headingIcon ?? undefined,
        column:      w.column,
        sortOrder:   w.sortOrder,
        content:     safeJson(w.content) ?? undefined,
        links: w.menuItems.map((mi: { label: string; url: string | null; sortOrder: number }) => ({
          label:     mi.label,
          url:       mi.url ?? "",
          sortOrder: mi.sortOrder,
        })),
      }));
    }

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
      message: `Saved ${pages.length} page(s), header, and footer to "${themeId}" theme`,
      pageCount: pages.length,
      headerSaved: !!headerRaw,
      footerSaved: !!footerRaw,
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
