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
  // Get the 8 services that the forge widget will display (sortBy: sort-order, limit 8)
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    take: 8,
    include: {
      category: { select: { name: true, slug: true, color: true } },
      packages: { select: { priceUSD: true, name: true }, orderBy: { sortOrder: "asc" as const }, take: 1 },
    },
  });

  console.log("=== LIVE DB: Top 8 services (sort-order) ===");
  services.forEach((s, i) => {
    const pkg = s.packages[0];
    console.log(`${i + 1}: ${s.name}`);
    console.log(`   Category: ${s.category?.name} (${s.category?.slug})`);
    console.log(`   Sort: ${s.sortOrder}, Popular: ${s.isPopular}`);
    console.log(`   Price: $${pkg?.priceUSD || "N/A"}`);
    console.log(`   Badge: ${(s as any).badge || "none"}`);
    console.log("");
  });

  // Screenshot reference
  const ref = [
    { name: "LLC Formation", cat: "Formation & Legal", badge: "Most Popular" },
    { name: "EIN for Non-US Residents", cat: "Formation & Legal", badge: "" },
    {
      name: "Amazon Account Reinstatement",
      cat: "E-Commerce",
      badge: "Emergency",
    },
    {
      name: "Amazon Seller Account Setup",
      cat: "E-Commerce",
      badge: "High Demand",
    },
    {
      name: "TikTok Shop US Setup",
      cat: "E-Commerce",
      badge: "Blue Ocean 2026",
    },
    {
      name: "Form 5472 Filing",
      cat: "Compliance",
      badge: "$25K Penalty Risk",
    },
    { name: "US Business Bank Account", cat: "Finance", badge: "" },
    {
      name: "USPTO Trademark Registration",
      cat: "Legal Protection",
      badge: "",
    },
  ];

  console.log("\n=== COMPARISON ===");
  ref.forEach((r, i) => {
    const db = services[i];
    const nameMatch = db?.name === r.name ? "OK" : "MISMATCH";
    console.log(`${i + 1}: ${nameMatch}`);
    console.log(
      `   Screenshot: ${r.name} [${r.cat}] badge:${r.badge || "none"}`
    );
    console.log(
      `   Live DB:    ${db?.name || "MISSING"} [${db?.category?.name || "?"}] badge:${(db as any)?.badge || "none"}`
    );
  });

  // Also check category display names
  console.log("\n=== CATEGORY NAMES ===");
  const cats = await prisma.serviceCategory.findMany({
    orderBy: { sortOrder: "asc" },
    select: { name: true, slug: true, color: true },
  });
  cats.forEach((c) =>
    console.log(`  ${c.slug}: "${c.name}" color:${c.color}`)
  );

  // Check if Service model has badge field
  console.log("\n=== SERVICE SCHEMA CHECK ===");
  const sampleService = await prisma.service.findFirst({
    select: {
      name: true,
      slug: true,
      isPopular: true,
      sortOrder: true,
      shortDescription: true,
    },
    where: { slug: "llc-formation" },
  });
  console.log("Sample (llc-formation):", JSON.stringify(sampleService, null, 2));

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
