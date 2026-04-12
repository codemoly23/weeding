import pg from "pg";

const { Client } = pg;
const client = new Client({
  connectionString: "postgresql://postgres:postgres@localhost:5432/llcpad?schema=public",
});

await client.connect();

try {
  // Task 11 — Social links
  await client.query(`
    ALTER TABLE "VendorProfile"
      ADD COLUMN IF NOT EXISTS "instagram" TEXT,
      ADD COLUMN IF NOT EXISTS "facebook"  TEXT,
      ADD COLUMN IF NOT EXISTS "pinterest" TEXT;
  `);
  console.log("✅ Social link columns added");

  // Task 12 — Response SLA
  await client.query(`
    ALTER TABLE "VendorProfile"
      ADD COLUMN IF NOT EXISTS "slaHours" INTEGER;
  `);
  console.log("✅ slaHours column added");

  // Task 10 — FAQ items
  await client.query(`
    ALTER TABLE "VendorProfile"
      ADD COLUMN IF NOT EXISTS "faqItems" JSONB NOT NULL DEFAULT '[]';
  `);
  console.log("✅ faqItems column added");

  // Task 13 — AvailabilityStatus enum
  await client.query(`
    DO $$ BEGIN
      CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'BOOKED', 'TENTATIVE');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
  console.log("✅ AvailabilityStatus enum created");

  // Task 13 — VendorAvailability table
  await client.query(`
    CREATE TABLE IF NOT EXISTS "VendorAvailability" (
      "id"        TEXT              NOT NULL PRIMARY KEY,
      "vendorId"  TEXT              NOT NULL,
      "date"      DATE              NOT NULL,
      "status"    "AvailabilityStatus" NOT NULL DEFAULT 'BOOKED',
      "note"      TEXT,
      "createdAt" TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
      CONSTRAINT "VendorAvailability_vendorId_fkey"
        FOREIGN KEY ("vendorId") REFERENCES "VendorProfile"("id") ON DELETE CASCADE,
      CONSTRAINT "VendorAvailability_vendorId_date_key"
        UNIQUE ("vendorId", "date")
    );
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS "VendorAvailability_vendorId_idx"
      ON "VendorAvailability"("vendorId");
  `);
  console.log("✅ VendorAvailability table created");

  console.log("\n🎉 Phase 5A-1 vendor features migration complete");
} catch (err) {
  console.error("Migration error:", err);
  process.exit(1);
} finally {
  await client.end();
}
