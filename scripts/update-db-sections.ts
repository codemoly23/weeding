import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as fs from "fs";

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
  // Read theme data.json for source of truth
  const themeData = JSON.parse(
    fs.readFileSync("public/themes/legal/data.json", "utf8")
  );

  // 1. Update category colors
  console.log("Updating category colors...");
  for (const cat of themeData.serviceCategories) {
    if (cat.color) {
      await prisma.serviceCategory.updateMany({
        where: { slug: cat.slug },
        data: { color: cat.color },
      });
      console.log(`  ${cat.slug} → ${cat.color}`);
    }
  }

  // 2. Update service names and sortOrders
  console.log("\nUpdating services...");
  for (const svc of themeData.services) {
    await prisma.service.updateMany({
      where: { slug: svc.slug },
      data: {
        name: svc.name,
        isPopular: svc.isPopular,
        sortOrder: svc.sortOrder,
      },
    });
    console.log(
      `  ${svc.slug} → ${svc.name} (pop:${svc.isPopular} sort:${svc.sortOrder})`
    );
  }

  // 3. Update homepage sections (order + forge widget settings)
  console.log("\nUpdating homepage sections...");
  const page = await prisma.landingPage.findFirst({
    where: { slug: "home" },
    include: { blocks: true },
  });

  if (!page) {
    console.error("Home page not found in DB!");
    return;
  }

  const block = page.blocks.find((b) => b.type === "widget-page-sections");
  if (!block) {
    console.error("Widget block not found in DB!");
    return;
  }

  // Get the section order from theme data
  const homePage = themeData.pages.find((p: any) => p.slug === "home");
  const themeBlock = homePage.blocks.find(
    (b: any) => b.type === "widget-page-sections"
  );
  const themeSections = themeBlock.settings;

  // Replace DB sections with theme sections
  await prisma.landingPageBlock.update({
    where: { id: block.id },
    data: { settings: themeSections as any },
  });

  console.log("Section order updated:");
  themeSections.forEach((s: any, i: number) =>
    console.log(`  ${i}: ${s.id}`)
  );

  // Verify forge section
  const forge = themeSections.find(
    (s: any) => s.id === "section_forge_services"
  );
  const widget = forge.columns[0].widgets[0];
  console.log("\nForge heading:", JSON.stringify(widget.settings.header.heading.text));
  console.log("Forge highlightWords:", JSON.stringify(widget.settings.header.heading.highlightWords));
  console.log("Forge sortBy:", widget.settings.filters.sortBy);

  await prisma.$disconnect();
  await pool.end();
  console.log("\nDone! DB updated.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
