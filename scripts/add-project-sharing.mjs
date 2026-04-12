// Migration: add shareToken + shareEnabled to WeddingProject
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { Client } = require("pg");

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

await client.query(`
  ALTER TABLE "WeddingProject" ADD COLUMN IF NOT EXISTS "shareToken" TEXT;
  ALTER TABLE "WeddingProject" ADD COLUMN IF NOT EXISTS "shareEnabled" BOOLEAN NOT NULL DEFAULT false;
  CREATE UNIQUE INDEX IF NOT EXISTS "WeddingProject_shareToken_key" ON "WeddingProject"("shareToken");
`);

await client.end();
console.log("✅ shareToken + shareEnabled added to WeddingProject");
