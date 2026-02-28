import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  host: "127.0.0.1",
  port: 5432,
  user: "postgres",
  password: "llcpad123",
  database: "llcpad",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Check services
  const services = await prisma.service.findMany({
    where: { sortOrder: { lt: 10 } },
    orderBy: { sortOrder: "asc" },
    include: { category: { select: { name: true, slug: true, color: true } } },
  });
  console.log("Featured services in DB:");
  services.forEach((s) =>
    console.log(
      `  ${s.sortOrder}: [${s.category?.slug} ${s.category?.color}] ${s.name} (pop:${s.isPopular})`
    )
  );

  // Check section order
  const page = await prisma.landingPage.findFirst({
    where: { slug: "home" },
    include: { blocks: true },
  });
  const block = page?.blocks.find((b) => b.type === "widget-page-sections");
  const sections = (block?.settings as any[]) || [];
  console.log("\nDB section order:");
  sections.forEach((s: any, i: number) => console.log(`  ${i}: ${s.id}`));

  // Check forge heading
  const forge = sections.find((s: any) => s.id === "section_forge_services");
  if (forge) {
    const w = forge.columns[0].widgets[0];
    console.log("\nForge heading:", JSON.stringify(w.settings.header.heading.text));
    console.log("Highlight:", JSON.stringify(w.settings.header.heading.highlightWords));
    console.log("SortBy:", w.settings.filters.sortBy);
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
