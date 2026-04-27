/**
 * Add "About Us" and "Contact Us" nav items to the active header.
 * Safe to run on an existing DB — does not delete any existing data.
 */

import prisma from "../src/lib/db";

async function addAboutContactNav() {
  const header = await prisma.headerConfig.findFirst({ where: { isActive: true } });

  if (!header) {
    console.error("❌ No active header config found. Run seed-header-footer.ts first.");
    process.exit(1);
  }

  const maxSort = await prisma.menuItem.aggregate({
    where: { headerId: header.id, parentId: null },
    _max: { sortOrder: true },
  });
  const nextSort = (maxSort._max.sortOrder ?? -1) + 1;

  const newItems = [
    { label: "About Us",   url: "/about",   sortOrder: nextSort },
    { label: "Contact Us", url: "/contact", sortOrder: nextSort + 1 },
  ];

  for (const item of newItems) {
    const existing = await prisma.menuItem.findFirst({
      where: { headerId: header.id, label: item.label, parentId: null },
    });

    if (existing) {
      console.log(`   ⚠️  "${item.label}" already exists — skipping`);
      continue;
    }

    await prisma.menuItem.create({
      data: {
        ...item,
        headerId: header.id,
        isMegaMenu: false,
        isVisible: true,
        visibleOnMobile: true,
      },
    });
    console.log(`   ✓ Added: ${item.label} → ${item.url}`);
  }

  console.log("✅ Done.");
}

addAboutContactNav()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  });
