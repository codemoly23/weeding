import { config } from "dotenv";
config(); // Load environment variables

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "5432"),
  user: process.env.DATABASE_USER || "postgres",
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME || "ceremoney",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// All widget types from Prisma schema
type FooterWidgetType =
  | "BRAND"
  | "LINKS"
  | "CONTACT"
  | "SOCIAL"
  | "TEXT"
  | "RECENT_POSTS"
  | "SERVICES"
  | "STATES"
  | "CUSTOM_HTML"
  | "APP_DOWNLOAD"
  | "PAYMENT_METHODS"
  | "AWARDS"
  | "MAP"
  | "WORKING_HOURS"
  | "LANGUAGE_SELECT"
  | "THEME_TOGGLE"
  | "FEATURED_PRODUCT"
  | "TESTIMONIAL"
  | "COUNTDOWN"
  | "CTA_BANNER";

interface PresetMenuItem {
  label: string;
  url: string;
  target?: string;
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

const FOOTER_JSON_FIELDS = new Set(["bgGradient", "translations", "responsiveColumns", "bottomLinks", "trustBadges"]);

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

function normalizePresetWidget(value: unknown): PresetWidget | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;

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
        target: typeof data.target === "string" ? data.target : "_self",
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
    type: source.type as FooterWidgetType,
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

async function applyEnterpriseDarkPreset() {
  console.log("🎨 Applying Enterprise Dark preset to active footer...");

  // Get the Enterprise Dark preset
  const preset = await prisma.footerPreset.findFirst({
    where: { name: "Enterprise Dark", isBuiltIn: true },
  });

  if (!preset) {
    console.error("❌ Enterprise Dark preset not found! Run seed-footer-presets.ts first.");
    return;
  }

  // Get the active footer
  const footer = await prisma.footerConfig.findFirst({
    where: { isActive: true },
    include: { widgets: true },
  });

  if (!footer) {
    console.error("❌ No active footer found!");
    return;
  }

  console.log(`  Found preset: ${preset.name}`);
  console.log(`  Found footer: ${footer.name} (${footer.id})`);

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

  // Prepare data for update - allow-list known footer fields only
  const updateData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(configToApply)) {
    if (!FOOTER_CONFIG_KEYS.has(key)) continue;
    if (value === undefined) continue;
    if (FOOTER_JSON_FIELDS.has(key)) {
      updateData[key] = value ? JSON.stringify(value) : value;
    } else {
      updateData[key] = value;
    }
  }

  updateData.presetId = preset.id;

  if (presetBottomLinks) {
    updateData.bottomLinks = JSON.stringify(presetBottomLinks);
  }
  if (presetBgGradient) {
    updateData.bgGradient = JSON.stringify(presetBgGradient);
  }

  // Update footer with preset config
  await prisma.footerConfig.update({
    where: { id: footer.id },
    data: updateData,
  });
  console.log("  ✓ Footer config updated");

  // Replace widgets from preset
  if (presetWidgets.length > 0) {
    // Delete existing widgets and their menu items
    const existingWidgets = await prisma.footerWidget.findMany({
      where: { footerId: footer.id },
      select: { id: true },
    });

    for (const widget of existingWidgets) {
      await prisma.menuItem.deleteMany({
        where: { footerWidgetId: widget.id },
      });
    }

    await prisma.footerWidget.deleteMany({
      where: { footerId: footer.id },
    });
    console.log("  ✓ Old widgets deleted");

    // Create new widgets from preset
    for (const widgetData of presetWidgets) {
      const { menuItems, content, translations, ...widgetFields } = widgetData;

      const newWidget = await prisma.footerWidget.create({
        data: {
          footerId: footer.id,
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

      // Create menu items if provided
      if (menuItems && Array.isArray(menuItems)) {
        for (let i = 0; i < menuItems.length; i++) {
          const item = menuItems[i];
          await prisma.menuItem.create({
            data: {
              footerWidgetId: newWidget.id,
              label: item.label,
              url: item.url,
              target: (item.target as "_self" | "_blank") || "_self",
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
    console.log(`  ✓ Created ${presetWidgets.length} widgets from preset`);
  }

  // Increment preset usage count
  await prisma.footerPreset.update({
    where: { id: preset.id },
    data: {
      usageCount: { increment: 1 },
    },
  });

  console.log("✅ Enterprise Dark preset applied successfully!");
}

// Run
applyEnterpriseDarkPreset()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
