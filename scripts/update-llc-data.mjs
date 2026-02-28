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
let SERVICE_ID, PKG_ESSENTIAL, PKG_STANDARD, PKG_PREMIUM;

// The 15 core features + 3 addon features we need
// Format: { text, tooltip, description (for "worth $X"), sortOrder, mappings: { essential, standard, premium } }
// Mapping values: true = BOOLEAN included, false = BOOLEAN not included, "ADDON:price" = addon
const FEATURES = [
  {
    text: "LLC Formation in your chosen state",
    tooltip: "We prepare and file Articles of Organization with the Secretary of State in your chosen state.",
    description: null,
    sort: 0,
    essential: true, standard: true, premium: true,
  },
  {
    text: "Operating Agreement",
    tooltip: "Defines ownership structure, member responsibilities, and profit distribution for your LLC.",
    description: "worth $79",
    sort: 1,
    essential: true, standard: true, premium: true,
  },
  {
    text: "Registered Agent for One Year",
    tooltip: "Legally required in every US state. Your registered agent receives legal and government documents on your behalf.",
    description: "worth $99",
    sort: 2,
    essential: true, standard: true, premium: true,
  },
  {
    text: "Business Address & Mail Forwarding (1 yr)",
    tooltip: "A real US street address for your LLC. We scan and forward your business mail digitally.",
    description: null,
    sort: 3,
    essential: true, standard: true, premium: true,
  },
  {
    text: "Employer Identification Number (EIN)",
    tooltip: "Your LLC's federal Tax ID number from the IRS. Required for banking, taxes, and hiring.",
    description: "worth $99",
    sort: 4,
    essential: true, standard: true, premium: true,
  },
  {
    text: "Annual Compliance Guidance",
    tooltip: "We guide you through yearly requirements — annual reports, franchise taxes, and filing deadlines.",
    description: null,
    sort: 5,
    essential: true, standard: true, premium: true,
  },
  {
    text: "BOI FinCEN Report",
    tooltip: "FinCEN Beneficial Ownership Information report — mandatory for most LLCs since 2024. $500/day penalty for non-filing.",
    description: "$49",
    sort: 6,
    essential: false, standard: true, premium: true,
  },
  {
    text: "Business Bank Account Opening (Fintech)",
    tooltip: "Open a Mercury or Relay business bank account — no SSN required, 100% remote. Includes setup assistance.",
    description: null,
    sort: 7,
    essential: false, standard: true, premium: true,
  },
  {
    text: "Stripe Account Setup",
    tooltip: "Set up Stripe merchant account for accepting online payments. We handle the application and verification.",
    description: null,
    sort: 8,
    essential: false, standard: true, premium: true,
  },
  {
    text: "Business Debit Card",
    tooltip: "Business debit card through your Fintech bank account — manage expenses and track spending.",
    description: null,
    sort: 9,
    essential: false, standard: true, premium: true,
  },
  {
    text: "Basic Tax Consultation",
    tooltip: "One-on-one consultation on tax obligations, estimated tax payments, and filing requirements for your LLC.",
    description: "$149",
    sort: 10,
    essential: false, standard: true, premium: true,
  },
  {
    text: "ITIN (Individual Taxpayer ID)",
    tooltip: "Individual Taxpayer Identification Number from the IRS — required for non-US residents who need to file taxes.",
    description: null,
    sort: 11,
    essential: false, standard: false, premium: true,
  },
  {
    text: "PayPal Business Account Setup",
    tooltip: "Open and verify a PayPal Business account for receiving payments and sending invoices worldwide.",
    description: null,
    sort: 12,
    essential: false, standard: false, premium: true,
  },
  {
    text: "Form 5472 + Pro Forma 1120",
    tooltip: "Annual IRS filing for foreign-owned single-member LLCs. $25,000 penalty for late or non-filing.",
    description: null,
    sort: 13,
    essential: false, standard: false, premium: true,
  },
  {
    text: "Priority Support & Business Consultation",
    tooltip: "Dedicated account manager with priority response. Includes business strategy consultation for your US venture.",
    description: null,
    sort: 14,
    essential: false, standard: false, premium: true,
  },
  // ADD-ON features
  {
    text: "Expedited Filing (3-day)",
    tooltip: "Rush processing — your LLC formation is prioritized and filed within 3 business days.",
    description: null,
    sort: 15,
    // Essential & Standard: ADDON $99, Premium: included (BOOLEAN true)
    essential: "ADDON:99", standard: "ADDON:99", premium: true,
  },
  {
    text: "Annual Report Service",
    tooltip: "We file your LLC's annual report with the state on time, every year. Never miss a deadline.",
    description: null,
    sort: 16,
    essential: "ADDON:60", standard: "ADDON:60", premium: "ADDON:60",
  },
  {
    text: "Amazon Seller Setup",
    tooltip: "Complete Amazon Seller Central account setup — including brand registry, listing optimization, and compliance.",
    description: null,
    sort: 17,
    essential: "ADDON:249", standard: "ADDON:249", premium: "ADDON:249",
  },
];

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // =========================================================================
    // 0. LOOK UP SERVICE + PACKAGES BY SLUG (dynamic IDs)
    // =========================================================================
    const svcRes = await client.query(`SELECT id FROM "Service" WHERE slug = 'llc-formation'`);
    if (svcRes.rows.length === 0) { console.error("LLC Formation service not found!"); return; }
    SERVICE_ID = svcRes.rows[0].id;
    console.log("Service ID:", SERVICE_ID);

    const pkgRes = await client.query(
      `SELECT id, name, "sortOrder" FROM "Package" WHERE "serviceId" = $1 ORDER BY "sortOrder"`,
      [SERVICE_ID]
    );
    if (pkgRes.rows.length < 3) { console.error("Expected 3 packages, found", pkgRes.rows.length); return; }
    PKG_ESSENTIAL = pkgRes.rows[0].id;
    PKG_STANDARD = pkgRes.rows[1].id;
    PKG_PREMIUM = pkgRes.rows[2].id;
    console.log("Packages:", pkgRes.rows.map(p => `${p.name}=${p.id}`).join(", "));

    // =========================================================================
    // 1. UPDATE PACKAGES
    // =========================================================================
    console.log("\n=== Updating packages ===");

    // Essential (was "Basic"): $149, compareAt $250
    await client.query(
      `UPDATE "Package" SET
        name = 'Essential',
        "priceUSD" = 149.00,
        "compareAtPriceUSD" = 250.00,
        "isPopular" = false,
        "processingTime" = '~3 weeks',
        "processingIcon" = 'clock',
        "badgeText" = NULL,
        "sortOrder" = 0
       WHERE id = $1`,
      [PKG_ESSENTIAL]
    );
    console.log("  Essential: $149 (was $250)");

    // Standard: $299, compareAt $499
    await client.query(
      `UPDATE "Package" SET
        name = 'Professional',
        "priceUSD" = 299.00,
        "compareAtPriceUSD" = 499.00,
        "isPopular" = true,
        "processingTime" = '~3 weeks',
        "processingIcon" = 'clock',
        "badgeText" = 'Most Popular',
        "sortOrder" = 1
       WHERE id = $1`,
      [PKG_STANDARD]
    );
    console.log("  Professional: $299 (was $499)");

    // Premium: $650, compareAt $899
    await client.query(
      `UPDATE "Package" SET
        name = 'Complete',
        "priceUSD" = 650.00,
        "compareAtPriceUSD" = 899.00,
        "isPopular" = false,
        "processingTime" = '~3 days',
        "processingIcon" = 'zap',
        "badgeText" = NULL,
        "sortOrder" = 2
       WHERE id = $1`,
      [PKG_PREMIUM]
    );
    console.log("  Complete: $650 (was $899)");

    // =========================================================================
    // 2. DELETE EXISTING FEATURES + MAPPINGS (clean slate)
    // =========================================================================
    console.log("\n=== Replacing features ===");

    // Delete mappings first (FK constraint)
    const delMaps = await client.query(
      `DELETE FROM "PackageFeatureMap" WHERE "featureId" IN (
        SELECT id FROM "ServiceFeature" WHERE "serviceId" = $1
      )`,
      [SERVICE_ID]
    );
    console.log(`  Deleted ${delMaps.rowCount} old mappings`);

    const delFeats = await client.query(
      `DELETE FROM "ServiceFeature" WHERE "serviceId" = $1`,
      [SERVICE_ID]
    );
    console.log(`  Deleted ${delFeats.rowCount} old features`);

    // =========================================================================
    // 3. INSERT NEW FEATURES + MAPPINGS
    // =========================================================================
    console.log("\n=== Inserting new features ===");

    for (const feat of FEATURES) {
      const featId = cuid();

      await client.query(
        `INSERT INTO "ServiceFeature" (id, "serviceId", text, tooltip, description, "sortOrder", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [featId, SERVICE_ID, feat.text, feat.tooltip, feat.description, feat.sort]
      );

      // Create mappings for each package
      const pkgMap = [
        { pkgId: PKG_ESSENTIAL, val: feat.essential },
        { pkgId: PKG_STANDARD, val: feat.standard },
        { pkgId: PKG_PREMIUM, val: feat.premium },
      ];

      for (const { pkgId, val } of pkgMap) {
        const mapId = cuid();
        let included = false;
        let valueType = "BOOLEAN";
        let addonPrice = null;
        let customValue = null;

        if (val === true) {
          included = true;
          valueType = "BOOLEAN";
        } else if (val === false) {
          included = false;
          valueType = "BOOLEAN";
        } else if (typeof val === "string" && val.startsWith("ADDON:")) {
          included = false;
          valueType = "ADDON";
          addonPrice = parseFloat(val.split(":")[1]);
          customValue = `+$${Math.floor(addonPrice)}`;
          if (feat.text.includes("Annual Report")) customValue += "/yr";
        }

        await client.query(
          `INSERT INTO "PackageFeatureMap" (id, "packageId", "featureId", included, "valueType", "addonPriceUSD", "customValue")
           VALUES ($1, $2, $3, $4, $5::"FeatureValueType", $6, $7)`,
          [mapId, pkgId, featId, included, valueType, addonPrice, customValue]
        );
      }

      const isAddon = typeof feat.essential === "string" || typeof feat.standard === "string" || typeof feat.premium === "string";
      console.log(`  [${feat.sort}] ${feat.text} ${isAddon ? "(ADDON)" : ""}`);
    }

    await client.query("COMMIT");
    console.log("\n=== Done! All data updated successfully ===");

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error, rolled back:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
