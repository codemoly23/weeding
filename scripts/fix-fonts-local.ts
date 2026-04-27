import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "5432"),
  user: process.env.DATABASE_USER || "postgres",
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME || "ceremoney",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Connecting to:", process.env.DATABASE_HOST || "localhost", "/", process.env.DATABASE_NAME || "ceremoney");
  const count = await prisma.activeTheme.count();
  console.log("ActiveTheme rows:", count);

  if (count > 0) {
    const result = await prisma.activeTheme.updateMany({
      data: {
        fontConfig: {
          headingFont: "Inter",
          bodyFont: "Inter",
          accentFont: "Inter",
        },
      },
    });
    console.log("Updated:", result.count, "rows");
  }

  const theme = await prisma.activeTheme.findFirst({ select: { fontConfig: true } });
  console.log("fontConfig now:", JSON.stringify(theme?.fontConfig));
}

main().catch(console.error).finally(() => prisma.$disconnect().then(() => pool.end()));
