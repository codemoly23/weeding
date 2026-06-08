/**
 * fix-button-colors.ts — update activeTheme primary color to charcoal
 * Run: npx tsx prisma/fix-button-colors.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🎨 Updating activeTheme primary color to charcoal...\n");

  const active = await prisma.activeTheme.findFirst();
  if (!active) {
    console.log("⚠ No activeTheme found in DB.");
    return;
  }

  const palette = active.colorPalette as Record<string, Record<string, string>>;

  const updated = {
    light: {
      ...palette.light,
      primary: "#1A1A1A",
      "primary-foreground": "#ffffff",
      ring: "#8A6F3E",
    },
    dark: {
      ...palette.dark,
      primary: "#2A2A2A",
      "primary-foreground": "#ffffff",
      ring: "#8A6F3E",
    },
  };

  await prisma.activeTheme.update({
    where: { id: active.id },
    data: {
      colorPalette: updated as any,
      originalColorPalette: updated as any,
    },
  });

  console.log("✅ primary (light): #1A1A1A");
  console.log("✅ primary (dark):  #2A2A2A");
  console.log("✅ ring:            #8A6F3E");
  console.log("\n🎉 Done! Restart dev server to see changes.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
