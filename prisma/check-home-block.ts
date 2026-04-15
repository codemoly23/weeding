import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const home = await prisma.landingPage.findFirst({
    where: { templateType: "HOME" },
    include: { blocks: true },
  });

  const block = home?.blocks[0];
  if (!block) { console.log("No home block found"); return; }

  console.log("Block type:", block.type);
  const settings = block.settings as any;
  const sections = Array.isArray(settings) ? settings : [];
  console.log("Total sections:", sections.length);

  sections.forEach((s: any, i: number) => {
    const widgets = s.columns?.flatMap((c: any) => c.widgets ?? []) ?? [];
    const widgetTypes = widgets.map((w: any) => w.type).join(", ");
    console.log(`  Section ${i + 1} — widgets: ${widgetTypes || "(none)"}`);
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
