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
  // Read the theme data to get the correct sortOrder/isPopular values
  const themeData = JSON.parse(
    fs.readFileSync("public/themes/legal/data.json", "utf8")
  );

  console.log("=== Updating services from theme data ===\n");

  for (const svc of themeData.services) {
    const result = await prisma.service.updateMany({
      where: { slug: svc.slug },
      data: {
        name: svc.name,
        isPopular: Boolean(svc.isPopular),
        sortOrder: Number(svc.sortOrder) || 0,
      },
    });
    if (svc.sortOrder < 100) {
      console.log(
        `  ${svc.slug}: updated ${result.count} row(s) → sort:${svc.sortOrder} pop:${svc.isPopular} name:"${svc.name}"`
      );
    }
  }

  // Verify
  console.log("\n=== Verification: Top 8 services (sort-order) ===\n");
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    take: 8,
    include: {
      category: { select: { name: true, slug: true, color: true } },
    },
  });

  services.forEach((s, i) => {
    console.log(
      `  ${i + 1}: ${s.name} [${s.category?.name}] sort:${s.sortOrder} pop:${s.isPopular}`
    );
  });

  // Reference comparison
  const ref = [
    "LLC Formation",
    "EIN for Non-US Residents",
    "Amazon Account Reinstatement",
    "Amazon Seller Account Setup",
    "TikTok Shop US Setup",
    "Form 5472 Filing",
    "US Business Bank Account",
    "USPTO Trademark Registration",
  ];

  console.log("\n=== Match check ===\n");
  let allMatch = true;
  ref.forEach((name, i) => {
    const match = services[i]?.name === name;
    if (!match) allMatch = false;
    console.log(
      `  ${match ? "OK" : "MISMATCH"}: expected "${name}" got "${services[i]?.name}"`
    );
  });
  console.log(`\n${allMatch ? "ALL MATCH!" : "SOME MISMATCHES - check above"}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
