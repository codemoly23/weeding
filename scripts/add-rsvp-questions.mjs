import pg from "pg";

const { Client } = pg;
const client = new Client({
  connectionString: "postgresql://postgres:postgres@localhost:5432/llcpad?schema=public",
});

await client.connect();

try {
  // Task 10 — GDPR consent on WeddingGuest
  await client.query(`
    ALTER TABLE "WeddingGuest"
      ADD COLUMN IF NOT EXISTS "gdprConsentAt" TIMESTAMPTZ;
  `);
  console.log("✅ WeddingGuest.gdprConsentAt added");

  // Task 9 — RsvpQuestionType enum
  await client.query(`
    DO $$ BEGIN
      CREATE TYPE "RsvpQuestionType" AS ENUM (
        'SHORT_TEXT', 'LONG_TEXT', 'SINGLE_CHOICE', 'MULTIPLE_CHOICE'
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
  console.log("✅ RsvpQuestionType enum created");

  // Task 9 — RsvpQuestion table
  await client.query(`
    CREATE TABLE IF NOT EXISTS "RsvpQuestion" (
      "id"        TEXT        NOT NULL PRIMARY KEY,
      "projectId" TEXT        NOT NULL,
      "text"      TEXT        NOT NULL,
      "type"      "RsvpQuestionType" NOT NULL DEFAULT 'SHORT_TEXT',
      "options"   JSONB,
      "required"  BOOLEAN     NOT NULL DEFAULT FALSE,
      "order"     INTEGER     NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT "RsvpQuestion_projectId_fkey"
        FOREIGN KEY ("projectId") REFERENCES "WeddingProject"("id") ON DELETE CASCADE
    );
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS "RsvpQuestion_projectId_idx"
      ON "RsvpQuestion"("projectId");
  `);
  console.log("✅ RsvpQuestion table created");

  // Task 9 — RsvpAnswer table
  await client.query(`
    CREATE TABLE IF NOT EXISTS "RsvpAnswer" (
      "id"         TEXT        NOT NULL PRIMARY KEY,
      "guestId"    TEXT        NOT NULL,
      "questionId" TEXT        NOT NULL,
      "answer"     TEXT        NOT NULL,
      "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT "RsvpAnswer_guestId_fkey"
        FOREIGN KEY ("guestId") REFERENCES "WeddingGuest"("id") ON DELETE CASCADE,
      CONSTRAINT "RsvpAnswer_questionId_fkey"
        FOREIGN KEY ("questionId") REFERENCES "RsvpQuestion"("id") ON DELETE CASCADE,
      CONSTRAINT "RsvpAnswer_guestId_questionId_key"
        UNIQUE ("guestId", "questionId")
    );
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS "RsvpAnswer_questionId_idx"
      ON "RsvpAnswer"("questionId");
  `);
  console.log("✅ RsvpAnswer table created");

  console.log("\n🎉 Phase 2B migration complete");
} catch (err) {
  console.error("Migration error:", err);
  process.exit(1);
} finally {
  await client.end();
}
