import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const theme = await prisma.activeTheme.findFirst();
  console.log("=== ActiveTheme ===");
  if (theme) {
    console.log("themeId:", theme.themeId);
    console.log("themeName:", theme.themeName);
    console.log("hasColorPalette:", !!theme.colorPalette);
    console.log("hasFontConfig:", !!theme.fontConfig);
    console.log("hasWidgetDefaults:", !!theme.widgetDefaults);
  } else {
    console.log("NO active theme in DB");
  }

  const pages = await prisma.landingPage.findMany({
    include: { blocks: { orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "asc" },
  });
  console.log("\n=== LandingPages in DB:", pages.length, "===");
  for (const p of pages) {
    console.log(`  [${p.templateType ?? "CUSTOM"}] /${p.slug} — ${p.blocks.length} blocks — active:${p.isActive}`);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
