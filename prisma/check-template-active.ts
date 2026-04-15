import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const pages = await prisma.landingPage.findMany({
    select: { slug: true, templateType: true, isTemplateActive: true, isActive: true },
    orderBy: { createdAt: "asc" },
  });
  for (const p of pages) {
    const bound = p.isTemplateActive ? "✅ isTemplateActive:true" : "❌ isTemplateActive:false";
    console.log(`[${p.templateType ?? "CUSTOM"}] /${p.slug} | ${bound} | isActive:${p.isActive}`);
  }
}

main().catch(console.error).finally(async () => { await prisma.$disconnect(); await pool.end(); });
