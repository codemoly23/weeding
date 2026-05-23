import "dotenv/config";
import prisma from "../src/lib/db";

async function main() {
  // Find all venue submenu items (urls starting with /venues/)
  const venueItems = await prisma.menuItem.findMany({
    where: {
      url: { startsWith: "/venues/" },
    },
  });

  console.log(`Found ${venueItems.length} venue submenu items to update`);

  // Update all to /vendors?category=VENUE
  const result = await prisma.menuItem.updateMany({
    where: {
      url: { startsWith: "/venues/" },
    },
    data: {
      url: "/vendors?category=VENUE",
    },
  });

  console.log(`Updated ${result.count} venue submenu items → /vendors?category=VENUE`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
