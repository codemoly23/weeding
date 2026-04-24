/**
 * fix-dresses-menu.ts
 *
 * Updates Dresses mega menu item with featured designers.
 * Run: npx tsx prisma/fix-dresses-menu.ts
 */

import prisma from "../src/lib/db";

async function main() {
  console.log("👗  Fixing Dresses mega menu...\n");

  const header = await prisma.headerConfig.findFirst({ where: { isActive: true } });
  if (!header) {
    console.error("❌ No active header found");
    process.exit(1);
  }
  console.log(`✓ Found header: ${header.name} (${header.id})`);

  const dressesItem = await prisma.menuItem.findFirst({
    where: { headerId: header.id, label: "Dresses" },
  });

  if (!dressesItem) {
    console.log("⚠ Dresses menu item not found — skipping");
    return;
  }

  // Check if already correctly configured (has 5 named designers)
  const existing = dressesItem.megaMenuContent as any;
  if (
    existing?.gallery?.items?.length === 5 &&
    existing?.gallery?.items?.[0]?.name === "Essense of Australia"
  ) {
    console.log("✓ Dresses already configured correctly — skipping");
    return;
  }

  await prisma.menuItem.update({
    where: { id: dressesItem.id },
    data: {
      megaMenuContent: {
        type: "featured-gallery",
        sectionHeader: "The latest in bridal fashion",
        topLinks: [
          { name: "Browse all dresses", href: "/dresses" },
          { name: "Designer collections", href: "/dresses/designers" },
        ],
        gallery: {
          title: "FEATURED DESIGNERS",
          aspectRatio: "portrait",
          items: [
            { name: "Essense of Australia",       imageUrl: "/designers/1777004155592-dre1.png", href: "/dresses/essense-of-australia" },
            { name: "Martina Liana Luxe",          imageUrl: "/designers/1777004214636-dre2.png", href: "/dresses/martina-liana-luxe" },
            { name: "Le Blanc by Casablanca Bridal", imageUrl: "/designers/1777004155592-dre1.png", href: "/dresses/le-blanc-casablanca" },
            { name: "Martina Liana",               imageUrl: "/designers/1777004214636-dre2.png", href: "/dresses/martina-liana" },
            { name: "Justin Alexander",            imageUrl: "/designers/1777004155592-dre1.png", href: "/dresses/justin-alexander" },
          ],
        },
        footerLink: { text: "See all designers", href: "/dresses/designers" },
      },
    },
  });

  console.log("✓ Dresses megaMenuContent updated with 5 featured designers");
  console.log("\n🎉 Done!");
  console.log("\n⚠️  Note: dre1.png and dre2.png are reused for all 5 designers.");
  console.log("   Upload unique images via Admin → Appearance → Header → Dresses → 🖼️");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
