import "dotenv/config";
import pg from "pg";
import crypto from "crypto";
const { Pool } = pg;

const pool = new Pool({
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "5432"),
  user: process.env.DATABASE_USER || "postgres",
  password: process.env.DATABASE_PASSWORD || "llcpad123",
  database: process.env.DATABASE_NAME || "llcpad",
});

function cuid() {
  return "c" + crypto.randomBytes(12).toString("hex").slice(0, 24);
}

// Will be looked up dynamically by slug
let SERVICE_ID;

// All 50 US states + DC with filing fees and annual fees
// Sources: Secretary of State websites (approximate 2024-2025 rates)
// Verified for 2026 from Secretary of State websites + LLC University
const US_STATES = [
  { code: "US-AL", name: "Alabama", filing: 200, annual: 0, annualNote: "No annual report (BPT exempt if <$100)" },
  { code: "US-AK", name: "Alaska", filing: 250, annual: 100, annualNote: "Biennial report" },
  { code: "US-AZ", name: "Arizona", filing: 50, annual: 0, annualNote: "No annual report for LLCs" },
  { code: "US-AR", name: "Arkansas", filing: 45, annual: 150 },
  { code: "US-CA", name: "California", filing: 70, annual: 800, annualNote: "$800 franchise tax (FTB)" },
  { code: "US-CO", name: "Colorado", filing: 50, annual: 25 },
  { code: "US-CT", name: "Connecticut", filing: 120, annual: 80 },
  { code: "US-DE", name: "Delaware", filing: 110, annual: 300, annualNote: "$300 annual LLC tax" },
  { code: "US-DC", name: "District of Columbia", filing: 99, annual: 300, annualNote: "Biennial report" },
  { code: "US-FL", name: "Florida", filing: 125, annual: 138, annualNote: "$138.75 annual report" },
  { code: "US-GA", name: "Georgia", filing: 110, annual: 60 },
  { code: "US-HI", name: "Hawaii", filing: 50, annual: 15 },
  { code: "US-ID", name: "Idaho", filing: 100, annual: 0, annualNote: "No annual report for LLCs" },
  { code: "US-IL", name: "Illinois", filing: 150, annual: 75 },
  { code: "US-IN", name: "Indiana", filing: 95, annual: 32, annualNote: "Biennial report" },
  { code: "US-IA", name: "Iowa", filing: 50, annual: 30, annualNote: "Biennial report (online)" },
  { code: "US-KS", name: "Kansas", filing: 160, annual: 50, annualNote: "Biennial report (online)" },
  { code: "US-KY", name: "Kentucky", filing: 40, annual: 15 },
  { code: "US-LA", name: "Louisiana", filing: 100, annual: 30 },
  { code: "US-ME", name: "Maine", filing: 175, annual: 85 },
  { code: "US-MD", name: "Maryland", filing: 100, annual: 300, annualNote: "Annual report (SDAT)" },
  { code: "US-MA", name: "Massachusetts", filing: 500, annual: 500 },
  { code: "US-MI", name: "Michigan", filing: 50, annual: 25 },
  { code: "US-MN", name: "Minnesota", filing: 155, annual: 0, annualNote: "No annual report for LLCs" },
  { code: "US-MS", name: "Mississippi", filing: 50, annual: 0, annualNote: "No annual report for LLCs" },
  { code: "US-MO", name: "Missouri", filing: 50, annual: 0, annualNote: "No annual report for LLCs" },
  { code: "US-MT", name: "Montana", filing: 35, annual: 20 },
  { code: "US-NE", name: "Nebraska", filing: 100, annual: 13, annualNote: "Biennial report" },
  { code: "US-NV", name: "Nevada", filing: 425, annual: 350, annualNote: "$150 report + $200 business license" },
  { code: "US-NH", name: "New Hampshire", filing: 100, annual: 100 },
  { code: "US-NJ", name: "New Jersey", filing: 125, annual: 75 },
  { code: "US-NM", name: "New Mexico", filing: 50, annual: 0, annualNote: "No annual report for LLCs" },
  { code: "US-NY", name: "New York", filing: 200, annual: 9, annualNote: "Biennial filing" },
  { code: "US-NC", name: "North Carolina", filing: 125, annual: 200 },
  { code: "US-ND", name: "North Dakota", filing: 135, annual: 50 },
  { code: "US-OH", name: "Ohio", filing: 99, annual: 0, annualNote: "No annual report for LLCs" },
  { code: "US-OK", name: "Oklahoma", filing: 100, annual: 25 },
  { code: "US-OR", name: "Oregon", filing: 100, annual: 100 },
  { code: "US-PA", name: "Pennsylvania", filing: 125, annual: 7, annualNote: "New annual report (2025+)" },
  { code: "US-RI", name: "Rhode Island", filing: 150, annual: 50 },
  { code: "US-SC", name: "South Carolina", filing: 110, annual: 0, annualNote: "No annual report for LLCs" },
  { code: "US-SD", name: "South Dakota", filing: 150, annual: 55 },
  { code: "US-TN", name: "Tennessee", filing: 300, annual: 300, annualNote: "$300 for 1-6 members" },
  { code: "US-TX", name: "Texas", filing: 300, annual: 0, annualNote: "No fee (franchise tax $0 for most LLCs)" },
  { code: "US-UT", name: "Utah", filing: 59, annual: 18 },
  { code: "US-VT", name: "Vermont", filing: 155, annual: 45 },
  { code: "US-VA", name: "Virginia", filing: 100, annual: 50 },
  { code: "US-WA", name: "Washington", filing: 180, annual: 70 },
  { code: "US-WV", name: "West Virginia", filing: 100, annual: 25 },
  { code: "US-WI", name: "Wisconsin", filing: 130, annual: 25 },
  { code: "US-WY", name: "Wyoming", filing: 100, annual: 60 },
];

// Popular states for LLC formation (shown first in dropdowns)
const POPULAR_STATES = ["US-WY", "US-DE", "US-NM", "US-FL", "US-TX", "US-NV"];

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // =========================================================================
    // 0. Look up LLC Formation service by slug
    // =========================================================================
    const svcRes = await client.query(`SELECT id FROM "Service" WHERE slug = 'llc-formation'`);
    if (svcRes.rows.length === 0) {
      console.error("LLC Formation service not found!");
      return;
    }
    SERVICE_ID = svcRes.rows[0].id;
    console.log("=== LLC Formation service ID:", SERVICE_ID, "===");

    // =========================================================================
    // 1. Enable location-based pricing on LLC Formation service
    // =========================================================================
    console.log("=== Enabling location-based pricing ===");
    await client.query(
      `UPDATE "Service" SET "hasLocationBasedPricing" = true, "locationFeeLabel" = 'State Filing Fee' WHERE id = $1`,
      [SERVICE_ID]
    );
    console.log("  Set hasLocationBasedPricing=true, locationFeeLabel='State Filing Fee'");

    // =========================================================================
    // 2. Upsert all US state Location records
    // =========================================================================
    console.log("\n=== Upserting US state locations ===");
    const locationIdMap = {};

    for (let i = 0; i < US_STATES.length; i++) {
      const state = US_STATES[i];
      const isPopular = POPULAR_STATES.includes(state.code);

      // Check if location exists
      const existing = await client.query(
        `SELECT id FROM "Location" WHERE code = $1`,
        [state.code]
      );

      let locId;
      if (existing.rows.length > 0) {
        locId = existing.rows[0].id;
        // Update existing
        await client.query(
          `UPDATE "Location" SET name = $1, country = 'US', type = 'STATE', "isPopular" = $2, "isActive" = true, "sortOrder" = $3 WHERE id = $4`,
          [state.name, isPopular, i, locId]
        );
      } else {
        locId = cuid();
        await client.query(
          `INSERT INTO "Location" (id, code, name, country, type, "isPopular", "isActive", "sortOrder", "updatedAt")
           VALUES ($1, $2, $3, 'US', 'STATE', $4, true, $5, NOW())`,
          [locId, state.code, state.name, isPopular, i]
        );
      }
      locationIdMap[state.code] = locId;
    }
    console.log(`  Upserted ${US_STATES.length} locations`);

    // =========================================================================
    // 3. Delete existing location fees for this service (clean slate)
    // =========================================================================
    const delFees = await client.query(
      `DELETE FROM "LocationFee" WHERE "serviceId" = $1`,
      [SERVICE_ID]
    );
    console.log(`  Deleted ${delFees.rowCount} old location fees`);

    // =========================================================================
    // 4. Insert filing fees + annual fees for all states
    // =========================================================================
    console.log("\n=== Inserting location fees ===");
    let feeCount = 0;

    for (const state of US_STATES) {
      const locId = locationIdMap[state.code];

      // Filing fee (always present)
      await client.query(
        `INSERT INTO "LocationFee" (id, "serviceId", "locationId", "feeType", label, "amountUSD", "isActive", "isRequired", "updatedAt")
         VALUES ($1, $2, $3, 'FILING', $4, $5, true, true, NOW())`,
        [cuid(), SERVICE_ID, locId, `${state.name} Filing Fee`, state.filing]
      );
      feeCount++;

      // Annual fee (only if > 0)
      if (state.annual > 0) {
        await client.query(
          `INSERT INTO "LocationFee" (id, "serviceId", "locationId", "feeType", label, "amountUSD", "isActive", "isRequired", notes, "updatedAt")
           VALUES ($1, $2, $3, 'ANNUAL', $4, $5, true, false, $6, NOW())`,
          [cuid(), SERVICE_ID, locId, `${state.name} Annual Fee`, state.annual, state.annualNote || null]
        );
        feeCount++;
      } else if (state.annualNote) {
        // Insert $0 annual fee with note
        await client.query(
          `INSERT INTO "LocationFee" (id, "serviceId", "locationId", "feeType", label, "amountUSD", "isActive", "isRequired", notes, "updatedAt")
           VALUES ($1, $2, $3, 'ANNUAL', $4, 0, true, false, $5, NOW())`,
          [cuid(), SERVICE_ID, locId, `${state.name} Annual Fee`, state.annualNote]
        );
        feeCount++;
      }
    }
    console.log(`  Inserted ${feeCount} location fees`);

    await client.query("COMMIT");
    console.log("\n=== Done! Location pricing updated ===");

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error, rolled back:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
