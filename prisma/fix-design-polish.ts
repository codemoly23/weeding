/**
 * Fix Design Polish — targeted DB update
 * Updates: business name, header CTA/hover color, footer background + accent colors
 * Run: npx tsx prisma/fix-design-polish.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function fixDesignPolish() {
  console.log("🎨 Applying design polish fixes...\n");

  // ── 1. Business name ──────────────────────────────────────────────
  await prisma.setting.upsert({
    where:  { key: "business.name" },
    update: { value: "Ceremoney" },
    create: { key: "business.name", value: "Ceremoney", type: "text" },
  });
  console.log("✓ business.name → Ceremoney");

  // ── 2. Header: CTA button color + hover color ─────────────────────
  const header = await prisma.headerConfig.findFirst({ where: { isActive: true } });
  if (header) {
    await prisma.headerConfig.update({
      where: { id: header.id },
      data: {
        hoverColor: "#8A6F3E",
        ctaButtons: JSON.stringify([
          {
            text: "Start Planning Free",
            url: "/register",
            style: { bgColor: "#1A1A1A", textColor: "#ffffff", borderWidth: 0, hoverEffect: "darken", borderRadius: 8 },
          },
        ]),
      },
    });
    console.log("✓ Header CTA → #1A1A1A (dark ink)");
    console.log("✓ Header hover color → #8A6F3E (warm gold)");
  } else {
    console.log("⚠  No active header config found — skipping header update");
  }

  // ── 3. Footer: warm charcoal bg + gold accent, remove purple glow ──
  const footer = await prisma.footerConfig.findFirst({ where: { isActive: true } });
  if (footer) {
    await prisma.footerConfig.update({
      where: { id: footer.id },
      data: {
        bgType: "gradient",
        bgGradient: JSON.stringify({
          type:   "linear",
          colors: [
            { color: "#1C1410", position: 0 },
            { color: "#110D0A", position: 100 },
          ],
          angle: 180,
        }),
        customCSS:      "",
        textColor:      "#C8BFB0",
        headingColor:   "#ffffff",
        linkColor:      "rgba(255, 255, 255, 0.85)",
        linkHoverColor: "#C2A86A",
        accentColor:    "#8A6F3E",
        borderColor:    "#3C2A1E",
        dividerColor:   "rgba(255,255,255,0.10)",
        topBorderColor: "#3C2A1E",
      },
    });
    console.log("✓ Footer bg → warm charcoal #1C1410 → #110D0A");
    console.log("✓ Footer accent → warm gold #8A6F3E");
    console.log("✓ Footer purple glow CSS removed");
  } else {
    console.log("⚠  No active footer config found — skipping footer update");
  }

  console.log("\n✅ Design polish complete! Refresh localhost:3000 to see changes.\n");
}

fixDesignPolish()
  .catch((e) => {
    console.error("❌ Fix failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
