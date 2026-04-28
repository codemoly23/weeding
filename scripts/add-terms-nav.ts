import prisma from "../src/lib/db";

async function main() {
  const header = await prisma.headerConfig.findFirst({ where: { isActive: true } });
  if (!header) { console.error("❌ No active header config"); process.exit(1); }

  const company = await prisma.menuItem.findFirst({
    where: { headerId: header.id, label: "Company", parentId: null },
  });
  if (!company) { console.error("❌ Company menu item not found"); process.exit(1); }

  // Check if already exists
  const existing = await prisma.menuItem.findFirst({
    where: { parentId: company.id, label: "Terms of Service" },
  });
  if (existing) {
    console.log("✓ Terms of Service already exists, updating icon...");
    await prisma.menuItem.update({
      where: { id: existing.id },
      data: { icon: "ScrollText", url: "/terms", sortOrder: 4 },
    });
  } else {
    // Shift Cookies Consent to sortOrder 5
    await prisma.menuItem.updateMany({
      where: { parentId: company.id, label: "Cookies Consent" },
      data: { sortOrder: 5 },
    });

    await prisma.menuItem.create({
      data: {
        label: "Terms of Service",
        url: "/terms",
        icon: "ScrollText",
        parentId: company.id,
        headerId: header.id,
        isMegaMenu: false,
        isVisible: true,
        visibleOnMobile: true,
        sortOrder: 4,
      },
    });
    console.log("✓ Terms of Service added to Company dropdown");
  }

  console.log("\n✅ Done!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
