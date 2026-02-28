import "dotenv/config";
import pg from "pg";
import fs from "fs";
const { Pool } = pg;

const pool = new Pool({
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "5432"),
  user: process.env.DATABASE_USER || "postgres",
  password: process.env.DATABASE_PASSWORD || "llcpad123",
  database: process.env.DATABASE_NAME || "llcpad",
});

async function main() {
  // Export locations
  const locs = await pool.query(
    `SELECT code, name, country, type, "isPopular", "sortOrder" FROM "Location" WHERE "isActive" = true ORDER BY "sortOrder"`
  );
  const locations = locs.rows.map((l) => {
    const obj = { code: l.code, name: l.name, country: l.country, type: l.type, sortOrder: l.sortOrder };
    if (l.isPopular) obj.isPopular = true;
    return obj;
  });

  // Export location fees
  const fees = await pool.query(
    `SELECT s.slug as slug, l.code as code, lf."feeType" as type, lf."amountUSD" as amt, lf.label
     FROM "LocationFee" lf
     JOIN "Service" s ON s.id = lf."serviceId"
     JOIN "Location" l ON l.id = lf."locationId"
     ORDER BY l.code, lf."feeType"`
  );
  const locationFees = fees.rows.map((f) => {
    const obj = { serviceSlug: f.slug, locationCode: f.code, feeType: f.type, amountUSD: Number(f.amt) };
    if (f.label) obj.label = f.label;
    return obj;
  });

  // Update data.json
  const data = JSON.parse(fs.readFileSync("public/themes/legal/data.json", "utf8"));
  data.locations = locations;
  data.locationFees = locationFees;
  fs.writeFileSync("public/themes/legal/data.json", JSON.stringify(data, null, 2));

  console.log("Exported", locations.length, "locations and", locationFees.length, "fees to data.json");
  await pool.end();
}

main().catch(console.error);
