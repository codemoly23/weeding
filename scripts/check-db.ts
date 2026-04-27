import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("DATABASE_URL:", process.env.DATABASE_URL?.substring(0, 40) + "...");
  const count = await prisma.activeTheme.count();
  console.log("ActiveTheme count:", count);
  const all = await prisma.activeTheme.findMany({ select: { themeId: true, themeName: true, fontConfig: true } });
  console.log("All themes:", JSON.stringify(all, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect().then(() => pool.end()));
