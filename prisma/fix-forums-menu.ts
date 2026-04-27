/**
 * fix-forums-menu.ts
 *
 * Deletes all child menu items under the Forums top-level menu item.
 * Forums mega menu is controlled by megaMenuContent JSON, not DB children.
 *
 * Run: npx tsx prisma/fix-forums-menu.ts
 */

import prisma from "../src/lib/db";

async function main() {
  const forumsItem = await prisma.menuItem.findFirst({
    where: { label: "Forums", parentId: null },
    include: { children: { include: { children: true } } },
  });

  if (!forumsItem) {
    console.log("Forums menu item not found.");
    return;
  }

  console.log(`Found Forums item: ${forumsItem.id}`);

  const grandchildIds = forumsItem.children.flatMap((c) => c.children.map((gc) => gc.id));
  const childIds = forumsItem.children.map((c) => c.id);

  if (grandchildIds.length > 0) {
    await prisma.menuItem.deleteMany({ where: { id: { in: grandchildIds } } });
    console.log(`Deleted ${grandchildIds.length} grandchild items.`);
  }

  if (childIds.length > 0) {
    await prisma.menuItem.deleteMany({ where: { id: { in: childIds } } });
    console.log(`Deleted ${childIds.length} child items.`);
  }

  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
