import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const TYPE_MAP: Record<string, string> = {
  "planigate-hero": "event-search-hero",
  "planigate-features": "features-showcase",
  "planigate-event-types": "event-gallery-grid",
  "planigate-vendors": "vendor-listing",
  "planigate-stats": "stats-section",
  "planigate-cta": "cta-banner",
};

function migrateWidgetTypes(sections: any[]): { sections: any[]; changed: number } {
  let changed = 0;
  const updated = sections.map((section: any) => ({
    ...section,
    columns: (section.columns ?? []).map((col: any) => ({
      ...col,
      widgets: (col.widgets ?? []).map((widget: any) => {
        const newType = TYPE_MAP[widget.type];
        if (newType) {
          changed++;
          return { ...widget, type: newType };
        }
        return widget;
      }),
    })),
  }));
  return { sections: updated, changed };
}

async function main() {
  const blocks = await prisma.landingPageBlock.findMany({
    where: { type: "widget-page-sections" },
  });

  console.log(`Found ${blocks.length} widget-page-sections block(s)`);

  let totalChanged = 0;
  for (const block of blocks) {
    const sections = Array.isArray(block.settings) ? (block.settings as any[]) : [];
    const { sections: updated, changed } = migrateWidgetTypes(sections);

    if (changed > 0) {
      await prisma.landingPageBlock.update({
        where: { id: block.id },
        data: { settings: updated as any },
      });
      console.log(`  Block ${block.id}: replaced ${changed} widget type(s)`);
      totalChanged += changed;
    }
  }

  console.log(`Done. Total widgets updated: ${totalChanged}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
