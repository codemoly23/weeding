/**
 * Save the current Planigate homepage design into the active theme's data.json.
 *
 * Run with: npx tsx scripts/save-planigate-to-theme.ts
 *
 * This snapshots the current DB landing pages (which include the Planigate
 * homepage seeded earlier) into the active theme folder under
 * public/themes/{themeId}/data.json. After this, the Planigate homepage
 * becomes part of the theme — re-activating or re-importing the theme will
 * restore exactly this design.
 *
 * Idempotent. Safe to re-run.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import fs from "fs/promises";
import path from "path";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Find the active theme (or fall back to "wedding")
  const activeTheme = await prisma.activeTheme.findFirst();
  const themeId = activeTheme?.themeId ?? "wedding";

  const dataPath = path.join(process.cwd(), "public", "themes", themeId, "data.json");

  // Read existing data.json (preserves header/footer/menu/services/etc)
  let themeData: Record<string, unknown> = {};
  try {
    const content = await fs.readFile(dataPath, "utf-8");
    themeData = JSON.parse(content);
  } catch {
    console.log(`No existing data.json — creating fresh one for theme "${themeId}"`);
  }

  // Read all active landing pages from DB with their blocks
  const pagesRaw = await prisma.landingPage.findMany({
    where: { isActive: true },
    include: { blocks: { orderBy: { sortOrder: "asc" } } },
  });

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

  // Update theme data — replace only the pages array, preserve everything else
  themeData.version = themeData.version ?? "1.0";
  themeData.exportedAt = new Date().toISOString();
  themeData.pages = pages;

  // Write back
  await fs.mkdir(path.dirname(dataPath), { recursive: true });
  await fs.writeFile(dataPath, JSON.stringify(themeData, null, 2), "utf-8");

  console.log(
    `Saved ${pages.length} pages to theme "${themeId}" at ${dataPath}`
  );
  const home = pages.find((p) => p.slug === "home");
  if (home) {
    console.log(`Home page has ${home.blocks.length} blocks; widget types in homepage:`);
    const widgetTypes = new Set<string>();
    for (const block of home.blocks) {
      if (block.type === "widget-page-sections" && Array.isArray(block.settings)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const section of block.settings as any[]) {
          for (const col of section.columns ?? []) {
            for (const w of col.widgets ?? []) {
              widgetTypes.add(w.type);
            }
          }
        }
      }
    }
    console.log("  -", [...widgetTypes].join(", "));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
