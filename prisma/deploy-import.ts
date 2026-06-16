/**
 * deploy-import.ts
 *
 * Reads public/themes/wedding/data.json and upserts into DB:
 *   - activeTheme  (colors + fonts + widget defaults)
 *   - landingPage  (upsert by slug — never deletes)
 *   - landingPageBlock (replace per page only)
 *
 * Does NOT touch: services, packages, blog, vendors, testimonials,
 * legal pages, header, footer, settings, or any other data.
 *
 * Run: npx tsx prisma/deploy-import.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import fs from "fs";
import path from "path";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DATA_JSON_PATH = path.join(
  process.cwd(),
  "public",
  "themes",
  "wedding",
  "data.json"
);

const THEME_AWARE_WIDGETS = new Set([
  "hero-content",
  "stats-section",
  "service-list",
  "process-steps",
  "faq-accordion",
  "pricing-table",
]);

function extractWidgetDefaults(pages: any[]): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  for (const page of pages ?? []) {
    for (const block of page.blocks ?? []) {
      if (!Array.isArray(block.settings)) continue;
      for (const section of block.settings as any[]) {
        for (const col of section.columns ?? []) {
          for (const widget of col.widgets ?? []) {
            if (widget.type && widget.settings && !defaults[widget.type]) {
              const existingColors = widget.settings.colors;
              defaults[widget.type] =
                THEME_AWARE_WIDGETS.has(widget.type) &&
                existingColors?.useTheme !== false
                  ? {
                      ...widget.settings,
                      colors: { ...(existingColors ?? {}), useTheme: true },
                    }
                  : widget.settings;
            }
          }
        }
      }
    }
  }
  return defaults;
}

async function main() {
  console.log("Importing theme design from data.json...\n");

  // 1. Read data.json
  if (!fs.existsSync(DATA_JSON_PATH)) {
    console.error(`data.json not found: ${DATA_JSON_PATH}`);
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(DATA_JSON_PATH, "utf-8"));

  // 2. Upsert activeTheme — colors + fonts + widget defaults
  if (data.colorPalette) {
    const widgetDefaults = extractWidgetDefaults(data.pages ?? []);
    await prisma.activeTheme.upsert({
      where: { themeId: "wedding" },
      update: {
        colorPalette: data.colorPalette,
        ...(data.fontConfig && { fontConfig: data.fontConfig }),
        widgetDefaults: widgetDefaults as any,
      },
      create: {
        themeId: "wedding",
        themeName: "Wedding & Ceremony Planning",
        colorPalette: data.colorPalette,
        originalColorPalette: data.colorPalette,
        ...(data.fontConfig && { fontConfig: data.fontConfig }),
        widgetDefaults: widgetDefaults as any,
      },
    });
    console.log("✅ Active theme upserted (colors + fonts + widget defaults)");
  } else {
    console.log("⚠️  No colorPalette in data.json — skipping theme update");
  }

  // 3. Upsert each page + replace its blocks
  const pages: any[] = data.pages ?? [];
  if (pages.length === 0) {
    console.log("⚠️  No pages found in data.json");
  }

  // Deactivate any stale pages that share a templateType with our pages but have a different slug.
  // Without this, getActiveTemplate("HOME") would find the old page first via findFirst().
  const importedSlugs = pages.map((p) => p.slug);
  const templateTypes = pages
    .filter((p) => p.templateType)
    .map((p) => p.templateType as string);

  if (templateTypes.length > 0) {
    const staleResult = await prisma.landingPage.updateMany({
      where: {
        templateType: { in: templateTypes },
        slug: { notIn: importedSlugs },
        isTemplateActive: true,
      },
      data: { isTemplateActive: false },
    });
    if (staleResult.count > 0) {
      console.log(
        `✅ Deactivated ${staleResult.count} stale template page(s) (old slugs replaced)`
      );
    }
  }

  let pageCount = 0;
  let blockCount = 0;

  for (const page of pages) {
    // Upsert page by slug (unique key)
    const upserted = await prisma.landingPage.upsert({
      where: { slug: page.slug },
      update: {
        name: page.name,
        isActive: true,
        isSystem: page.isSystem ?? false,
        templateType: page.templateType ?? null,
        isTemplateActive: page.isTemplateActive ?? false,
        metaTitle: page.metaTitle ?? null,
        metaDescription: page.metaDescription ?? null,
      },
      create: {
        slug: page.slug,
        name: page.name,
        isActive: true,
        isSystem: page.isSystem ?? false,
        templateType: page.templateType ?? null,
        isTemplateActive: page.isTemplateActive ?? false,
        metaTitle: page.metaTitle ?? null,
        metaDescription: page.metaDescription ?? null,
      },
    });

    // Replace blocks for this page only
    await prisma.landingPageBlock.deleteMany({
      where: { landingPageId: upserted.id },
    });

    const blocks: any[] = page.blocks ?? [];
    for (const block of blocks) {
      await prisma.landingPageBlock.create({
        data: {
          landingPageId: upserted.id,
          type: block.type,
          name: block.name ?? null,
          sortOrder: block.sortOrder ?? 0,
          isActive: block.isActive ?? true,
          settings: block.settings ?? [],
          hideOnMobile: block.hideOnMobile ?? false,
          hideOnDesktop: block.hideOnDesktop ?? false,
        },
      });
      blockCount++;
    }

    pageCount++;
    console.log(
      `✅ /${page.slug} (${page.templateType ?? "custom"}) — ${blocks.length} blocks`
    );
  }

  console.log(`\n✅ Import complete`);
  console.log(`   Pages:  ${pageCount}`);
  console.log(`   Blocks: ${blockCount}`);
}

main()
  .catch((e) => {
    console.error("\n❌ Import failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
