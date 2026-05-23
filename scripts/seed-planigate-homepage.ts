/**
 * Seed the homepage with the Planigate-style landing template.
 * Run with: npx tsx scripts/seed-planigate-homepage.ts
 *
 * Reads sections from public/themes/wedding/data.json (the saved design snapshot).
 * Idempotent: upserts the "home" landing page and replaces its widget block.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import fs from "fs";
import path from "path";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
import type { Section } from "../src/lib/page-builder/types";

const SLUG = "home";
const BLOCK_TYPE = "widget-page-sections";

function loadSectionsFromTheme(): Section[] {
  const dataPath = path.join(process.cwd(), "public", "themes", "wedding", "data.json");
  const raw = fs.readFileSync(dataPath, "utf-8");
  const themeData = JSON.parse(raw);

  const homePage = (themeData.pages as Array<{ slug: string; blocks: Array<{ type: string; settings: unknown }> }> | undefined)
    ?.find((p) => p.slug === "home");

  if (!homePage) throw new Error("No 'home' page found in data.json");

  const block = homePage.blocks.find((b) => b.type === BLOCK_TYPE);
  if (!block || !Array.isArray(block.settings) || block.settings.length === 0) {
    throw new Error("No widget-page-sections block found in home page in data.json");
  }

  return block.settings as Section[];
}

async function main() {
  const sections = loadSectionsFromTheme();

  const page = await prisma.landingPage.upsert({
    where: { slug: SLUG },
    create: {
      slug: SLUG,
      name: "Homepage (Planigate)",
      isActive: true,
      isDefault: true,
      isTemplateActive: true,
      templateType: "HOME",
      metaTitle: "Planigate — Allt för livets event på ett ställe",
      metaDescription:
        "Skapa inbjudningar, hantera gäster, bygg eventhemsidor och hitta leverantörer för bröllop, fester, företagsevent och mycket mer.",
    },
    update: {
      name: "Homepage (Planigate)",
      isActive: true,
      isTemplateActive: true,
      templateType: "HOME",
    },
  });

  await prisma.landingPageBlock.deleteMany({
    where: { landingPageId: page.id, type: BLOCK_TYPE },
  });

  await prisma.landingPageBlock.create({
    data: {
      landingPageId: page.id,
      type: BLOCK_TYPE,
      name: "Widget Page Sections",
      sortOrder: 0,
      isActive: true,
      settings: sections as unknown as object,
    },
  });

  await prisma.landingPage.updateMany({
    where: { templateType: "HOME", id: { not: page.id } },
    data: { isTemplateActive: false },
  });

  console.log(`Seeded Planigate homepage from data.json. Page id=${page.id}, sections=${sections.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
