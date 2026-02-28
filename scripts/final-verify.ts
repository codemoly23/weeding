import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  host: "127.0.0.1",
  port: 5432,
  user: "postgres",
  password: "llcpad123",
  database: "llcpad",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Verify services
  console.log("=== 1. SERVICES (Top 8 by sort-order) ===");
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    take: 8,
    include: {
      category: { select: { name: true, slug: true, color: true } },
    },
  });
  services.forEach((s, i) => {
    console.log(
      `  ${i + 1}. ${s.name} | cat: ${s.category?.name} (${s.category?.color}) | sort:${s.sortOrder} | pop:${s.isPopular}`
    );
  });

  // 2. Verify sections
  console.log("\n=== 2. SECTION ORDER ===");
  const page = await prisma.landingPage.findFirst({
    where: { slug: "home" },
    include: { blocks: true },
  });
  const block = page?.blocks.find((b) => b.type === "widget-page-sections");
  const sections = (block?.settings as any[]) || [];
  sections.forEach((s: any, i: number) => console.log(`  ${i}: ${s.id}`));

  // 3. Verify forge widget settings
  console.log("\n=== 3. FORGE WIDGET CONFIG ===");
  const forge = sections.find((s: any) => s.id === "section_forge_services");
  if (forge) {
    const w = forge.columns[0].widgets[0];
    console.log("  heading:", JSON.stringify(w.settings.header.heading.text));
    console.log(
      "  highlightWords:",
      JSON.stringify(w.settings.header.heading.highlightWords)
    );
    console.log("  cardStyle:", w.settings.cardStyle);
    console.log("  sortBy:", w.settings.filters.sortBy);
    console.log("  limit:", w.settings.filters.limit);
    console.log("  gridSpans:", JSON.stringify(w.settings.forge?.gridSpans));
  }

  // 4. Verify category colors
  console.log("\n=== 4. CATEGORY COLORS ===");
  const cats = await prisma.serviceCategory.findMany({
    orderBy: { sortOrder: "asc" },
  });
  cats.forEach((c) => console.log(`  ${c.slug}: ${c.color} (${c.name})`));

  console.log("\n=== DONE ===");
  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
