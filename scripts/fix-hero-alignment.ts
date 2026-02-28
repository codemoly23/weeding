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
 * Fix hero section alignment.
 *
 * Problem: Hero's customCSS has `padding-inline: 28px` on the .mx-auto container,
 * which doubles up with the section-level paddingLeft/Right: 28px.
 * Also has `max-width: 1160px` overriding the consistent maxWidth: "xl" (1280px).
 *
 * Fix: Remove padding-inline and max-width from customCSS, keep only the
 * grid-template-columns override for the asymmetric hero layout.
 */
async function main() {
  const HERO_ID = "section_hero_forge";

  // New customCSS: only keep the grid-template-columns override
  const fixedCSS = `@media (min-width: 1024px) { & .grid { grid-template-columns: 1fr 420px; } }`;

  function fixHeroCSS(sections: any[]) {
    const hero = sections.find((s: any) => s.id === HERO_ID);
    if (!hero) {
      console.log("Hero section not found!");
      return false;
    }

    console.log("Old customCSS:", hero.settings.customCSS);
    hero.settings.customCSS = fixedCSS;
    console.log("New customCSS:", hero.settings.customCSS);
    return true;
  }

  // 1. Fix theme data.json
  const themePath = "public/themes/legal/data.json";
  const themeData = JSON.parse(fs.readFileSync(themePath, "utf8"));
  const homePage = themeData.pages.find((p: any) => p.slug === "home");
  const block = homePage.blocks.find(
    (b: any) => b.type === "widget-page-sections"
  );

  console.log("Fixing theme data.json...");
  if (fixHeroCSS(block.settings)) {
    fs.writeFileSync(themePath, JSON.stringify(themeData, null, 2), "utf8");
    console.log("Theme updated.\n");
  }

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
  if (fixHeroCSS(dbSections)) {
    await prisma.landingPageBlock.update({
      where: { id: pageBlock.id },
      data: { settings: dbSections as any },
    });
    console.log("DB updated.\n");
  }

  // Verify all sections alignment
  console.log("Alignment verification:");
  for (const s of dbSections) {
    if (["section_hero_forge", "section_stats", "section_all_services"].includes(s.id)) {
      const css = s.settings.customCSS || "(none)";
      const hasPaddingInline = css.includes("padding-inline");
      const hasMaxWidth = css.includes("max-width");
      console.log(`  ${s.id}:`);
      console.log(`    paddingL/R: ${s.settings.paddingLeft}/${s.settings.paddingRight}`);
      console.log(`    maxWidth: ${s.settings.maxWidth}`);
      console.log(`    customCSS has padding-inline: ${hasPaddingInline}`);
      console.log(`    customCSS has max-width override: ${hasMaxWidth}`);
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
