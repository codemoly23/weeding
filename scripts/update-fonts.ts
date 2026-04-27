import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const result = await prisma.activeTheme.updateMany({
    data: {
      fontConfig: {
        headingFont: "Inter",
        bodyFont: "Inter",
        accentFont: "Inter",
      },
    },
  });
  console.log("Updated rows:", result.count);
  const theme = await prisma.activeTheme.findFirst({ select: { fontConfig: true } });
  console.log("Current fontConfig:", JSON.stringify(theme?.fontConfig));
}

main().finally(() => prisma.$disconnect().then(() => pool.end()));
