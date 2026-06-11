/**
 * export-to-datajson.ts
 *
 * Reads current colorPalette + pages from local DB and writes them
 * into public/themes/wedding/data.json — preserving everything else
 * (services, header, footer, blog, etc.) unchanged.
 *
 * Run: npx tsx prisma/export-to-datajson.ts
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

async function main() {
  console.log("Exporting theme design to data.json...\n");

  // 1. Read existing data.json — preserve everything not being updated
  if (!fs.existsSync(DATA_JSON_PATH)) {
    console.error(`data.json not found at: ${DATA_JSON_PATH}`);
    process.exit(1);
  }
  const existing = JSON.parse(fs.readFileSync(DATA_JSON_PATH, "utf-8"));

  // 2. Export colorPalette + fontConfig from activeTheme
  const activeTheme = await prisma.activeTheme.findFirst();

  if (activeTheme?.colorPalette) {
    existing.colorPalette = activeTheme.colorPalette;
    console.log("✅ Color palette exported");
  } else {
    console.log("⚠️  No active theme found — keeping existing colorPalette");
  }

  if (activeTheme?.fontConfig) {
    existing.fontConfig = activeTheme.fontConfig;
    console.log("✅ Font config exported");
  }

  // 3. Export landing pages with blocks
  const pagesRaw = await prisma.landingPage.findMany({
    where: { isActive: true },
    include: {
      blocks: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { createdAt: "asc" },
  });

  existing.pages = pagesRaw.map((page) => ({
    slug: page.slug,
    name: page.name,
    ...(page.templateType && { templateType: page.templateType }),
    isSystem: page.isSystem,
    isTemplateActive: page.isTemplateActive,
    ...(page.metaTitle && { metaTitle: page.metaTitle }),
    ...(page.metaDescription && { metaDescription: page.metaDescription }),
    blocks: page.blocks.map((block) => ({
      type: block.type,
      ...(block.name && { name: block.name }),
      sortOrder: block.sortOrder,
      isActive: block.isActive,
      settings: block.settings,
      ...(block.hideOnMobile && { hideOnMobile: block.hideOnMobile }),
      ...(block.hideOnDesktop && { hideOnDesktop: block.hideOnDesktop }),
    })),
  }));

  console.log(`✅ ${pagesRaw.length} pages exported:`);
  pagesRaw.forEach((p) =>
    console.log(`   - /${p.slug} (${p.templateType ?? "custom"})`)
  );

  // 4. Update export timestamp
  existing.exportedAt = new Date().toISOString();

  // 5. Write back — preserve all other fields
  fs.writeFileSync(DATA_JSON_PATH, JSON.stringify(existing, null, 2), "utf-8");

  console.log(`\n✅ data.json updated successfully`);
  console.log(`   ${DATA_JSON_PATH}`);
}

main()
  .catch((e) => {
    console.error("\n❌ Export failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
