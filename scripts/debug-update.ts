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
  const svc = await prisma.service.findFirst({
    where: { slug: "llc-formation" },
    select: { name: true, slug: true, sortOrder: true, isPopular: true },
  });
  console.log("Before:", JSON.stringify(svc));

  const result = await prisma.service.updateMany({
    where: { slug: "llc-formation" },
    data: { sortOrder: 1, isPopular: true },
  });
  console.log("Update result:", JSON.stringify(result));

  const after = await prisma.service.findFirst({
    where: { slug: "llc-formation" },
    select: { name: true, sortOrder: true, isPopular: true },
  });
  console.log("After:", JSON.stringify(after));

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
