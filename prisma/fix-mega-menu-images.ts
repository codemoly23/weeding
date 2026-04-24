/**
 * fix-mega-menu-images.ts
 *
 * Updates megaMenuContent for Registry, Wedding Website, and Dresses
 * mega menu items with correct image paths from /public/designers/.
 *
 * Run: npx tsx prisma/fix-mega-menu-images.ts
 */

import prisma from "../src/lib/db";

async function main() {
  console.log("🖼️  Fixing mega menu images...\n");

  // Find the active header
  const header = await prisma.headerConfig.findFirst({ where: { isActive: true } });
  if (!header) {
    console.error("❌ No active header found");
    process.exit(1);
  }
  console.log(`✓ Found header: ${header.name} (${header.id})`);

  // ── Registry ──────────────────────────────────────────────────────────────
  const registryItem = await prisma.menuItem.findFirst({
    where: { headerId: header.id, label: "Registry" },
  });

  if (registryItem) {
    await prisma.menuItem.update({
      where: { id: registryItem.id },
      data: {
        megaMenuContent: {
          type: "featured-gallery",
          sectionHeader: "Build your wedding registry",
          topLinks: [
            { name: "Start a registry", href: "/registry/create" },
            { name: "Find a registry", href: "/registry/search" },
          ],
          gallery: {
            title: "POPULAR REGISTRIES",
            aspectRatio: "square",
            items: [
              { name: "Amazon",         imageUrl: "/designers/1777004751803-amazon.png",  href: "/registry/amazon" },
              { name: "Crate & Barrel", imageUrl: "/designers/1777004759059-crearte.png", href: "/registry/crate-barrel" },
              { name: "Target",         imageUrl: "/designers/1777004763644-tar.png",     href: "/registry/target" },
              { name: "Traveler's Joy", imageUrl: "/designers/1777004769186-travel.png",  href: "/registry/travelers-joy" },
            ],
          },
          footerLink: { text: "See all registry options", href: "/registry" },
        },
      },
    });
    console.log("✓ Registry megaMenuContent updated");
  } else {
    console.log("⚠ Registry menu item not found — skipping");
  }

  // ── Wedding Website ────────────────────────────────────────────────────────
  const weddingWebsiteItem = await prisma.menuItem.findFirst({
    where: { headerId: header.id, label: "Wedding Website" },
  });

  if (weddingWebsiteItem) {
    await prisma.menuItem.update({
      where: { id: weddingWebsiteItem.id },
      data: {
        megaMenuContent: {
          type: "featured-gallery",
          sectionHeader: "Set up your website in minutes",
          topLinks: [
            { name: "Create your wedding website", href: "/wedding-website/create" },
            { name: "Find a couple website",        href: "/wedding-website/search" },
          ],
          gallery: {
            title: "CHOOSE YOUR DESIGN",
            aspectRatio: "portrait",
            items: [
              { name: "Minimal Leaves",    imageUrl: "/designers/1777006588323-ww1.png", href: "/wedding-website/themes/minimal-leaves" },
              { name: "Painted Desert",    imageUrl: "/designers/1777006595094-ww2.png", href: "/wedding-website/themes/painted-desert" },
              { name: "Classic Garden",    imageUrl: "/designers/1777006599600-ww3.png", href: "/wedding-website/themes/classic-garden" },
              { name: "Formal Ampersand", imageUrl: "/designers/1777006603262-ww4.png", href: "/wedding-website/themes/formal-ampersand" },
            ],
          },
          footerLink: { text: "See all website designs", href: "/wedding-website/themes" },
        },
      },
    });
    console.log("✓ Wedding Website megaMenuContent updated");
  } else {
    console.log("⚠ Wedding Website menu item not found — skipping");
  }

  // ── Dresses ───────────────────────────────────────────────────────────────
  const dressesItem = await prisma.menuItem.findFirst({
    where: { headerId: header.id, label: "Dresses" },
  });

  if (dressesItem) {
    await prisma.menuItem.update({
      where: { id: dressesItem.id },
      data: {
        megaMenuContent: {
          type: "featured-gallery",
          sectionHeader: "Find your dream dress",
          topLinks: [
            { name: "Browse all dresses", href: "/dresses" },
            { name: "Designer collections", href: "/dresses/designers" },
          ],
          gallery: {
            title: "FEATURED DESIGNERS",
            aspectRatio: "portrait",
            items: [
              { name: "Featured Designer 1", imageUrl: "/designers/1777004155592-dre1.png", href: "/dresses/designers/1" },
              { name: "Featured Designer 2", imageUrl: "/designers/1777004214636-dre2.png", href: "/dresses/designers/2" },
            ],
          },
          footerLink: { text: "See all designers", href: "/dresses/designers" },
        },
      },
    });
    console.log("✓ Dresses megaMenuContent updated");
  } else {
    console.log("⚠ Dresses menu item not found — skipping");
  }

  console.log("\n🎉 Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
