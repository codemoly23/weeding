import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkAdminAccess, authError } from "@/lib/admin-auth";

const FOOTER_WIDGET_TYPES = [
  "BRAND",
  "LINKS",
  "CONTACT",
  "SOCIAL",
  "TEXT",
  "RECENT_POSTS",
  "SERVICES",
  "STATES",
  "CUSTOM_HTML",
  "APP_DOWNLOAD",
  "PAYMENT_METHODS",
  "AWARDS",
  "MAP",
  "WORKING_HOURS",
  "LANGUAGE_SELECT",
  "THEME_TOGGLE",
  "FEATURED_PRODUCT",
  "TESTIMONIAL",
  "COUNTDOWN",
  "CTA_BANNER",
  "BUTTON",
  "NEWSLETTER",
] as const;

const MENU_ITEM_TARGETS = ["_self", "_blank"] as const;

type FooterWidgetType = (typeof FOOTER_WIDGET_TYPES)[number];
type MenuItemTarget = (typeof MENU_ITEM_TARGETS)[number];

interface PresetMenuItem {
  label: string;
  url: string;
  target: MenuItemTarget;
  icon?: string;
  translations?: Record<string, unknown> | null;
}

interface PresetWidget {
  type: FooterWidgetType;
  title: string;
  showTitle: boolean;
  column: number;
  sortOrder: number;
  content?: Record<string, unknown>;
  menuItems?: PresetMenuItem[];
  translations?: Record<string, unknown> | null;
}

const FOOTER_JSON_FIELDS = new Set([
  "bgGradient",
  "trustBadges",
  "bottomLinks",
  "translations",
  "responsiveColumns",
]);

const FOOTER_CONFIG_KEYS = new Set([
  "name",
  "isActive",
  "layout",
  "columns",
  "linkPrefix",
  "showSocialLinks",
  "socialPosition",
  "showContactInfo",
  "contactPosition",
  "bottomBarEnabled",
  "bottomBarLayout",
  "copyrightText",
  "showDisclaimer",
  "disclaimerText",
  "showTrustBadges",
  "bgColor",
  "textColor",
  "accentColor",
  "borderColor",
  "paddingTop",
  "paddingBottom",
  "bgType",
  "bgImage",
  "bgImageOverlay",
  "bgPattern",
  "bgPatternColor",
  "bgPatternOpacity",
  "bodyFont",
  "headingColor",
  "headingFont",
  "headingSize",
  "headingWeight",
  "headingStyle",
  "linkColor",
  "linkHoverColor",
  "linkHoverEffect",
  "topBorderStyle",
  "topBorderHeight",
  "topBorderColor",
  "topBorderGradientFrom",
  "topBorderGradientTo",
  "enableAnimations",
  "entranceAnimation",
  "animationDuration",
  "socialShape",
  "socialSize",
  "socialColorMode",
  "socialHoverEffect",
  "socialBgStyle",
  "dividerStyle",
  "dividerColor",
  "shadow",
  "borderRadius",
  "containerWidth",
  "containerStyle",
  "cornerRadiusBL",
  "cornerRadiusBR",
  "cornerRadiusTL",
  "cornerRadiusTR",
  "sectionOrder",
  "brandRevealEnabled",
  "brandRevealText",
  "brandRevealColor",
  "brandRevealOpacity",
  "customCSS",
  "customJS",
  "responsiveColumns",
  "translations",
]);

function parsePresetJson(value: unknown, fallback: unknown = null): unknown {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return value;
}

function parseFooterWidgetType(value: unknown): FooterWidgetType | null {
  if (typeof value !== "string") return null;
  return FOOTER_WIDGET_TYPES.includes(value as FooterWidgetType)
    ? (value as FooterWidgetType)
    : null;
}

function parseMenuItemTarget(value: unknown): MenuItemTarget {
  if (
    typeof value === "string" &&
    MENU_ITEM_TARGETS.includes(value as MenuItemTarget)
  ) {
    return value as MenuItemTarget;
  }
  return "_self";
}

function normalizePresetWidget(value: unknown): PresetWidget | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;
  const normalizedType = parseFooterWidgetType(source.type);

  if (!normalizedType) {
    return null;
  }

  const rawMenuItems = Array.isArray(source.menuItems) ? source.menuItems : [];
  const menuItems = rawMenuItems
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const data = item as Record<string, unknown>;
      const rawTranslations = parsePresetJson(data.translations);
      const translations =
        rawTranslations && typeof rawTranslations === "object"
          ? (rawTranslations as Record<string, unknown>)
          : undefined;

      return {
        label: typeof data.label === "string" ? data.label : "",
        url: typeof data.url === "string" ? data.url : "/",
        target: parseMenuItemTarget(data.target),
        icon: typeof data.icon === "string" ? data.icon : undefined,
        ...(translations ? { translations } : {}),
      };
    })
    .filter((item): item is PresetMenuItem => item !== null);

  const rawTranslations = parsePresetJson(source.translations);
  const translations =
    rawTranslations && typeof rawTranslations === "object"
      ? (rawTranslations as Record<string, unknown>)
      : undefined;

  return {
    type: normalizedType,
    title: typeof source.title === "string" ? source.title : "",
    showTitle: source.showTitle !== false,
    column: typeof source.column === "number" ? source.column : 1,
    sortOrder: typeof source.sortOrder === "number" ? source.sortOrder : 0,
    content:
      source.content && typeof source.content === "object"
        ? (source.content as Record<string, unknown>)
        : undefined,
    ...(translations ? { translations } : {}),
    ...(menuItems.length > 0 ? { menuItems } : {}),
  };
}

// POST - Apply a preset to a footer
export async function POST(request: Request) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const body = await request.json();
    const { footerId, presetId, preserveWidgets = false } = body;

    if (!footerId || !presetId) {
      return NextResponse.json(
        { error: "Footer ID and Preset ID are required" },
        { status: 400 }
      );
    }

    // Get the preset
    const preset = await prisma.footerPreset.findUnique({
      where: { id: presetId },
    });

    if (!preset) {
      return NextResponse.json(
        { error: "Preset not found" },
        { status: 404 }
      );
    }

    // Get the footer
    const footer = await prisma.footerConfig.findUnique({
      where: { id: footerId },
      include: { widgets: true },
    });

    if (!footer) {
      return NextResponse.json(
        { error: "Footer not found" },
        { status: 404 }
      );
    }

    // Extract config from preset
    const presetConfig = preset.config as Record<string, unknown>;

    const rawPresetWidgets = parsePresetJson(presetConfig.widgets, []);
    const presetWidgets = Array.isArray(rawPresetWidgets)
      ? rawPresetWidgets.map(normalizePresetWidget).filter((widget): widget is PresetWidget => widget !== null)
      : [];

    const presetBottomLinks = parsePresetJson(presetConfig.bottomLinks, null);
    const presetBgGradient = parsePresetJson(presetConfig.bgGradient, null);

    const {
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      colorPalette: _colorPalette,
      widgets: _presetWidgets,
      ...configToApply
    } = presetConfig;

    // Prepare data for update - handle JSON fields properly and ignore invalid keys
    const updateData: Record<string, unknown> = {
      presetId: presetId,
    };

    for (const [key, value] of Object.entries(configToApply)) {
      if (!FOOTER_CONFIG_KEYS.has(key)) continue;
      if (value === undefined) continue;
      if (FOOTER_JSON_FIELDS.has(key)) {
        updateData[key] = value ? JSON.stringify(value) : value;
      } else {
        updateData[key] = value;
      }
    }

    // Handle JSON fields - stringify if they're objects
    if (presetBottomLinks) {
      updateData.bottomLinks = JSON.stringify(presetBottomLinks);
    }
    if (presetBgGradient) {
      updateData.bgGradient = JSON.stringify(presetBgGradient);
    }

    // Update footer with preset config
    await prisma.footerConfig.update({
      where: { id: footerId },
      data: updateData,
    });

    // If not preserving widgets and preset has widgets, replace them
    if (!preserveWidgets && presetWidgets.length > 0) {
      // Delete existing widgets and their menu items
      const existingWidgets = await prisma.footerWidget.findMany({
        where: { footerId },
        select: { id: true },
      });

      for (const widget of existingWidgets) {
        await prisma.menuItem.deleteMany({
          where: { footerWidgetId: widget.id },
        });
      }

      await prisma.footerWidget.deleteMany({
        where: { footerId },
      });

      // Create new widgets from preset
      for (const widgetData of presetWidgets) {
        const { menuItems, content, translations, ...widgetFields } = widgetData;

        const newWidget = await prisma.footerWidget.create({
          data: {
            footerId,
            type: widgetFields.type,
            title: widgetFields.title || null,
            showTitle: widgetFields.showTitle ?? true,
            column: widgetFields.column || 1,
            sortOrder: widgetFields.sortOrder || 0,
            ...(translations
              ? { translations: JSON.parse(JSON.stringify(translations)) }
              : {}),
            content: content ? JSON.parse(JSON.stringify(content)) : undefined,
          },
        });

        // Create menu items (links) if provided
        if (menuItems && Array.isArray(menuItems)) {
          for (let i = 0; i < menuItems.length; i++) {
            const item = menuItems[i];
            await prisma.menuItem.create({
              data: {
                footerWidgetId: newWidget.id,
                label: item.label,
                url: item.url,
                target: parseMenuItemTarget(item.target),
                icon: item.icon || null,
                sortOrder: i,
                isVisible: true,
                ...(item.translations
                  ? { translations: JSON.parse(JSON.stringify(item.translations)) }
                  : {}),
              },
            });
          }
        }
      }
    }

    // Increment preset usage count
    await prisma.footerPreset.update({
      where: { id: presetId },
      data: {
        usageCount: { increment: 1 },
      },
    });

    // Fetch the updated footer with widgets
    const result = await prisma.footerConfig.findUnique({
      where: { id: footerId },
      include: {
        widgets: {
          orderBy: [{ column: "asc" }, { sortOrder: "asc" }],
          include: {
            menuItems: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      footer: result,
      message: `Preset "${preset.name}" applied successfully`,
    });
  } catch (error) {
    console.error("Error applying footer preset:", error);
    return NextResponse.json(
      { error: "Failed to apply preset" },
      { status: 500 }
    );
  }
}
