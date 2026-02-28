import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as fs from "fs";

const pool = new Pool({
  host: "127.0.0.1",
  port: 5432,
  user: "postgres",
  password: "llcpad123",
  database: "llcpad",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Fix horizontal alignment for all homepage sections.
 * Reference HTML uses: .container { max-width: 1160px; padding: 0 28px; }
 * We apply 28px section-level horizontal padding consistently.
 */
async function main() {
  const HORIZONTAL_PAD = 28;

  // Sections to fix and their column-level padding to remove
  const fixMap: Record<string, boolean> = {
    section_hero_forge: true,
    section_stats: true,
    section_all_services: true,
  };

  function fixSections(sections: any[]) {
    for (const s of sections) {
      if (!fixMap[s.id]) continue;

      // Set consistent section-level horizontal padding
      s.settings.paddingLeft = HORIZONTAL_PAD;
      s.settings.paddingRight = HORIZONTAL_PAD;

      // Remove column-level horizontal padding to avoid double-padding
      for (const col of s.columns || []) {
        if (col.settings) {
          if (col.settings.paddingLeft) {
            console.log(`  Removing col paddingLeft ${col.settings.paddingLeft} from ${s.id}`);
            delete col.settings.paddingLeft;
          }
          if (col.settings.paddingRight) {
            console.log(`  Removing col paddingRight ${col.settings.paddingRight} from ${s.id}`);
            delete col.settings.paddingRight;
          }
        }
      }

      console.log(`  ${s.id}: paddingL/R = ${HORIZONTAL_PAD}px`);
    }
  }

  // 1. Fix theme data.json
  const themePath = "public/themes/legal/data.json";
  const themeData = JSON.parse(fs.readFileSync(themePath, "utf8"));
  const homePage = themeData.pages.find((p: any) => p.slug === "home");
  const block = homePage.blocks.find(
    (b: any) => b.type === "widget-page-sections"
  );

  console.log("Fixing theme data.json...");
  fixSections(block.settings);
  fs.writeFileSync(themePath, JSON.stringify(themeData, null, 2), "utf8");
  console.log("Theme updated.\n");

  // 2. Fix live DB
  const page = await prisma.landingPage.findFirst({
    where: { slug: "home" },
    include: { blocks: true },
  });

  if (!page) {
    console.error("Home page not found in DB");
    await prisma.$disconnect();
    await pool.end();
    return;
  }

  const pageBlock = page.blocks.find(
    (b) => b.type === "widget-page-sections"
  );
  if (!pageBlock) {
    console.error("Widget block not found in DB");
    await prisma.$disconnect();
    await pool.end();
    return;
  }

  const dbSections = (pageBlock.settings as any[]) || [];
  console.log("Fixing DB...");
  fixSections(dbSections);

  await prisma.landingPageBlock.update({
    where: { id: pageBlock.id },
    data: { settings: dbSections as any },
  });

  console.log("DB updated.\n");

  // Verify
  console.log("Final alignment check:");
  for (const s of dbSections) {
    if (fixMap[s.id]) {
      const colPadL = s.columns?.[0]?.settings?.paddingLeft || 0;
      const effective = (s.settings.paddingLeft || 0) + colPadL;
      console.log(`  ${s.id}: section=${s.settings.paddingLeft}px + col=${colPadL}px = ${effective}px`);
    }
  }

  await prisma.$disconnect();
  await pool.end();
  console.log("\nDone!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
