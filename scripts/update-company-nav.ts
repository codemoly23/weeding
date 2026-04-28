/**
 * One-time script: Replace standalone "About Us" + "Contact Us" nav items
 * with a "Company" dropdown containing 5 child links.
 *
 * Run: npx tsx scripts/update-company-nav.ts
 */

import prisma from "../src/lib/db";

async function main() {
  console.log("🔄 Updating navbar: replacing About Us / Contact Us with Company dropdown...\n");

  const header = await prisma.headerConfig.findFirst({ where: { isActive: true } });
  if (!header) {
    console.error("❌ No active header config found.");
    process.exit(1);
  }
  console.log(`✓ Found active header: ${header.id}`);

  // Remove existing standalone About / Contact items (top-level, no parent)
  const deleted = await prisma.menuItem.deleteMany({
    where: {
      headerId: header.id,
      parentId: null,
      label: { in: ["About Us", "Contact Us", "About", "Contact"] },
    },
  });
  console.log(`✓ Removed ${deleted.count} standalone item(s)`);

  // Find the highest sortOrder among remaining top-level items
  const lastItem = await prisma.menuItem.findFirst({
    where: { headerId: header.id, parentId: null },
    orderBy: { sortOrder: "desc" },
  });
  const nextOrder = (lastItem?.sortOrder ?? 0) + 1;

  // Create "Company" parent item
  const company = await prisma.menuItem.create({
    data: {
      label: "Company",
      url: "#",
      headerId: header.id,
      isMegaMenu: false,
      isVisible: true,
      visibleOnMobile: true,
      sortOrder: nextOrder,
    },
  });
  console.log(`✓ Created "Company" menu item (id: ${company.id})`);

  // Create children
  const children = [
    { label: "About",           url: "/about",         icon: "Info",         sortOrder: 0 },
    { label: "Contact",         url: "/contact",       icon: "Mail",         sortOrder: 1 },
    { label: "Privacy Policy",  url: "/privacy",       icon: "ShieldCheck",  sortOrder: 2 },
    { label: "Refund Policy",   url: "/refund-policy", icon: "RotateCcw",    sortOrder: 3 },
    { label: "Cookies Consent", url: "/cookies",       icon: "Cookie",       sortOrder: 4 },
  ];

  for (const child of children) {
    await prisma.menuItem.create({
      data: {
        ...child,
        headerId: header.id,
        parentId: company.id,
        isMegaMenu: false,
        isVisible: true,
        visibleOnMobile: true,
      },
    });
    console.log(`   ✓ Added child: ${child.label}`);
  }

  console.log("\n✅ Done! Company dropdown is now in the database.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
