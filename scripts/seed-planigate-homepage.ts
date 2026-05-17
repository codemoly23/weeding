/**
 * Seed the homepage with the Planigate-style landing template.
 * Run with: npx tsx scripts/seed-planigate-homepage.ts
 *
 * Idempotent: upserts the "home" landing page and replaces its widget block.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
import {
  DEFAULT_PLANIGATE_HERO_SETTINGS,
  DEFAULT_PLANIGATE_FEATURES_SETTINGS,
  DEFAULT_PLANIGATE_EVENT_TYPES_SETTINGS,
  DEFAULT_PLANIGATE_VENDORS_SETTINGS,
  DEFAULT_PLANIGATE_STATS_SETTINGS,
  DEFAULT_PLANIGATE_CTA_SETTINGS,
  DEFAULT_SECTION_SETTINGS,
  DEFAULT_COLUMN_SETTINGS,
} from "../src/lib/page-builder/defaults";
import type { Section, WidgetType } from "../src/lib/page-builder/types";

const SLUG = "home";
const BLOCK_TYPE = "widget-page-sections";

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function singleWidgetSection(
  order: number,
  widgetType: WidgetType,
  widgetSettings: unknown,
  options: { paddingTop?: number; paddingBottom?: number; bg?: string } = {}
): Section {
  return {
    id: makeId("sec"),
    order,
    layout: "1-col",
    columns: [
      {
        id: makeId("col"),
        widgets: [
          {
            id: makeId("w"),
            type: widgetType,
            settings: widgetSettings as Record<string, unknown>,
          },
        ],
        settings: { ...DEFAULT_COLUMN_SETTINGS },
      },
    ],
    settings: {
      ...DEFAULT_SECTION_SETTINGS,
      fullWidth: true,
      paddingTop: options.paddingTop ?? 0,
      paddingBottom: options.paddingBottom ?? 0,
      paddingLeft: 0,
      paddingRight: 0,
      maxWidth: "full",
      background: options.bg
        ? { type: "solid", color: options.bg }
        : { type: "solid", color: "transparent" },
    },
  };
}

async function main() {
  const sections: Section[] = [
    singleWidgetSection(0, "planigate-hero", DEFAULT_PLANIGATE_HERO_SETTINGS),
    singleWidgetSection(1, "planigate-features", DEFAULT_PLANIGATE_FEATURES_SETTINGS),
    singleWidgetSection(2, "planigate-event-types", DEFAULT_PLANIGATE_EVENT_TYPES_SETTINGS),
    singleWidgetSection(3, "planigate-vendors", DEFAULT_PLANIGATE_VENDORS_SETTINGS),
    singleWidgetSection(4, "planigate-stats", DEFAULT_PLANIGATE_STATS_SETTINGS),
    singleWidgetSection(5, "planigate-cta", DEFAULT_PLANIGATE_CTA_SETTINGS),
  ];

  // Upsert the landing page itself
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

  // Replace the widget block
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
      // Prisma JSON expects unknown; cast for type system
      settings: sections as unknown as object,
    },
  });

  // Also deactivate any other HOME templates so this one wins
  await prisma.landingPage.updateMany({
    where: {
      templateType: "HOME",
      id: { not: page.id },
    },
    data: { isTemplateActive: false },
  });

  console.log(`Seeded Planigate homepage. Page id=${page.id}, sections=${sections.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
