import "dotenv/config";
import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "5432"),
  user: process.env.DATABASE_USER || "postgres",
  password: process.env.DATABASE_PASSWORD || "llcpad123",
  database: process.env.DATABASE_NAME || "llcpad",
});

async function main() {
  const client = await pool.connect();
  try {
    const serviceId = "cmm6xl5zh00qkeouyizeiajyn"; // LLC Formation

    // Packages
    const pkgRes = await client.query(
      `SELECT name, "priceUSD", "compareAtPriceUSD", "isPopular", "processingTime", "processingIcon", "badgeText"
       FROM "Package" WHERE "serviceId" = $1 ORDER BY "sortOrder" ASC`,
      [serviceId]
    );
    console.log("=== Packages ===");
    for (const p of pkgRes.rows) {
      console.log(`  ${p.name}: $${p.priceUSD} (compare: $${p.compareAtPriceUSD}) popular:${p.isPopular} time:${p.processingTime} icon:${p.processingIcon} badge:${p.badgeText || "-"}`);
    }

    // Features with mappings
    const featRes = await client.query(
      `SELECT sf.text, sf."sortOrder", sf.description,
              json_agg(json_build_object(
                'pkg', p.name,
                'included', pfm.included,
                'type', pfm."valueType",
                'addonPrice', pfm."addonPriceUSD"
              ) ORDER BY p."sortOrder") as mappings
       FROM "ServiceFeature" sf
       JOIN "PackageFeatureMap" pfm ON pfm."featureId" = sf.id
       JOIN "Package" p ON p.id = pfm."packageId"
       WHERE sf."serviceId" = $1
       GROUP BY sf.id
       ORDER BY sf."sortOrder" ASC`,
      [serviceId]
    );
    console.log("\n=== Features ===");
    for (const f of featRes.rows) {
      const cols = f.mappings.map(m => {
        if (m.type === "ADDON") return `${m.pkg}:ADDON($${m.addonPrice})`;
        return `${m.pkg}:${m.included ? "✓" : "✗"}`;
      }).join(" | ");
      console.log(`  [${f.sortOrder}] ${f.text} ${f.description || ""}`);
      console.log(`       ${cols}`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}
main().catch(console.error);
