import prisma from "./src/lib/db";

const EVENT_SLUGS = ["wedding", "birthday", "corporate", "christmas", "graduation", "baptism", "party"];

async function main() {
  const blocks = await prisma.landingPageBlock.findMany({
    where: { type: "widget-page-sections" },
  });

  let updated = 0;
  for (const block of blocks) {
    let raw = JSON.stringify(block.settings);
    let changed = false;

    for (const slug of EVENT_SLUGS) {
      const from = `/events/${slug}`;
      if (raw.includes(from)) {
        raw = raw.split(from).join("/planner");
        changed = true;
      }
    }

    if (changed) {
      await prisma.landingPageBlock.update({
        where: { id: block.id },
        data: { settings: JSON.parse(raw) },
      });
      updated++;
      console.log("Updated block:", block.id);
    }
  }
  console.log("Total blocks updated:", updated);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
