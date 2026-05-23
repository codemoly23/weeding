import "dotenv/config";
import prisma from "../src/lib/db";

const urlMap: Record<string, string> = {
  "/ideas/themes":    "/vendors?category=DECORATIONS",
  "/ideas/flowers":   "/vendors?category=FLOWERS",
  "/ideas/tables":    "/vendors?category=DECORATIONS",
  "/ideas/ceremony":  "/vendors?category=DECORATIONS",
  "/ideas/reception": "/vendors?category=DECORATIONS",
  "/ideas/favors":    "/vendors",
  "/ideas/photos":    "/vendors?category=PHOTOGRAPHY",
  "/ideas/honeymoon": "/vendors",
};

async function main() {
  for (const [oldUrl, newUrl] of Object.entries(urlMap)) {
    const result = await prisma.menuItem.updateMany({
      where: { url: oldUrl },
      data: { url: newUrl },
    });
    console.log(`${oldUrl} → ${newUrl}  (${result.count} updated)`);
  }
  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
