import prisma from "./src/lib/db";

const REPLACEMENTS: Record<string, string> = {
  '"/planner"': '"/planner/create?type=wedding"',
};

// More specific: replace /planner in event type items only
// We'll do a smarter replacement by parsing and updating href fields

async function main() {
  const blocks = await prisma.landingPageBlock.findMany({
    where: { type: "widget-page-sections" },
  });

  let updated = 0;
  for (const block of blocks) {
    let raw = JSON.stringify(block.settings);

    // Only update event type items that have /planner as href
    // These items have labels like Bröllop, Födelsedag, etc.
    const labelToType: Record<string, string> = {
      "Bröllop": "wedding",
      "Födelsedag": "birthday",
      "Företagsevent": "corporate",
      "Julbord": "christmas",
      "Student": "graduation",
      "Dop": "baptism",
      // English versions too
      "Wedding": "wedding",
      "Birthday": "birthday",
      "Corporate event": "corporate",
      "Christmas dinner": "christmas",
      "Graduation": "graduation",
      "Baptism": "baptism",
      "Party": "party",
    };

    const parsed = JSON.parse(raw);
    let changed = false;

    function traverse(obj: unknown): void {
      if (Array.isArray(obj)) {
        obj.forEach(traverse);
      } else if (obj && typeof obj === "object") {
        const o = obj as Record<string, unknown>;
        // Check if this looks like an event type item
        if (typeof o.label === "string" && typeof o.href === "string") {
          const type = labelToType[o.label];
          if (type && (o.href === "/planner" || String(o.href).startsWith("/events/"))) {
            o.href = `/planner/create?type=${type}`;
            changed = true;
          }
        }
        Object.values(o).forEach(traverse);
      }
    }

    traverse(parsed);

    if (changed) {
      await prisma.landingPageBlock.update({
        where: { id: block.id },
        data: { settings: parsed },
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
