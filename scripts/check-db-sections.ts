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
  const page = await prisma.landingPage.findFirst({
    where: { slug: "home" },
    include: { blocks: true },
  });
  if (!page) {
    console.log("No home page found");
    return;
  }
  const block = page.blocks.find((b) => b.type === "widget-page-sections");
  if (!block) {
    console.log("No widget-page-sections block found");
    return;
  }
  const sections = (block.settings as any[]) || [];
  console.log(`DB homepage sections (${sections.length}):`);
  sections.forEach((s: any, i: number) => {
    const widgets: string[] = [];
    (s.columns || []).forEach((col: any) => {
      (col.widgets || []).forEach((w: any) => widgets.push(w.type));
    });
    const bg = s.background?.color || "";
    console.log(
      `  ${i}: [${(s.id || "").substring(0, 25)}] widgets: ${widgets.join(", ")}${bg ? " bg:" + bg : ""}`
    );
  });

  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
