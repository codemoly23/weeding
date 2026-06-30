/**
 * One-time backfill: populate the `translations` JSON column on header/footer models
 * for existing rows, using the legacy English→Swedish dictionaries.
 *
 * Why: dynamic content used to be auto-translated at render time by hardcoded
 * string→Swedish dictionaries (FOOTER_TEXT_TRANSLATIONS / NAV_DIRECT_LABELS / a few
 * NAV_LABEL_KEYS pairs). Now that content carries explicit per-locale `translations`,
 * this script writes those Swedish values into the DB so the migrated fields keep their
 * translation without depending on the dictionary.
 *
 * Safe to re-run: it only ADDS a locale value when missing; it never overwrites an
 * existing explicit translation, and never touches the base (English) field.
 *
 *   npx tsx prisma/backfill-translations.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// English → Swedish pairs gathered from the legacy render-time dictionaries.
const EN_SV: Record<string, string> = {
  // FOOTER_TEXT_TRANSLATIONS
  "The all-in-one platform for stress-free event planning. Plan, manage, and celebrate life's special moments with confidence.":
    "Allt-i-ett-plattformen för stressfri eventplanering. Planera, hantera och fira livets speciella stunder med trygghet.",
  "For Planners": "För planerare",
  "For Vendors": "För leverantörer",
  "Event Types": "Eventtyper",
  "Support": "Support",
  "Event Dashboard": "Eventpanel",
  "Guest Management": "Gästhantering",
  "Budget Tracker": "Budgetverktyg",
  "Checklist": "Checklista",
  "Invitations": "Inbjudningar",
  "List Business": "Lista företag",
  "Dashboard": "Kontrollpanel",
  "Pricing": "Priser",
  "Success Stories": "Framgångshistorier",
  "Resources": "Resurser",
  "Weddings": "Bröllop",
  "Birthdays": "Födelsedagar",
  "Corporate": "Företagsevent",
  "Baby Showers": "Babyshowers",
  "Conferences": "Konferenser",
  "Help Center": "Hjälpcenter",
  "Contact Us": "Kontakta oss",
  "FAQs": "Vanliga frågor",
  "Blog": "Blogg",
  "Community": "Community",
  "Privacy Policy": "Integritetspolicy",
  "Terms of Service": "Användarvillkor",
  "Cookie Policy": "Cookiepolicy",
  "Accessibility": "Tillgänglighet",
  "Top Rated": "Topprankad",
  "Secure": "Säker",
  "Fast": "Snabb",
  "Disclaimer": "Ansvarsfriskrivning",
  "Services": "Tjänster",
  "Company": "Företag",
  "Legal": "Juridiskt",
  "Popular states": "Populära områden",
  // NAV_DIRECT_LABELS
  "Refund Policy": "Återbetalningspolicy",
  "Cookies Consent": "Cookie-samtycke",
  "Popular": "Populärt",
  "Start Planning Free": "Börja planera gratis",
  "Seating Chart Editor": "Bordplaceringsverktyg",
  "Need help? Get free consultation": "Behöver du hjälp? Få gratis rådgivning",
  // NAV_LABEL_KEYS derivable pairs (English label ↔ Swedish alias for same i18n key)
  "Planning Tools": "Planeringsverktyg",
  "Venues": "Lokaler",
  "Vendors": "Leverantörer",
  "Wedding Website": "Bröllopswebbplats",
};

// Normalized lookup (whitespace-collapsed, lowercased) for resilient matching.
const NORM_MAP = new Map<string, string>();
for (const [en, sv] of Object.entries(EN_SV)) {
  NORM_MAP.set(en.replace(/\s+/g, " ").trim().toLowerCase(), sv);
}

function swedishFor(value: string | null | undefined): string | null {
  if (!value) return null;
  return NORM_MAP.get(value.replace(/\s+/g, " ").trim().toLowerCase()) ?? null;
}

type LocalizedText = Record<string, string>;
type TranslationsMap = Record<string, LocalizedText>;

function asMap(raw: unknown): TranslationsMap {
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      const p = JSON.parse(raw);
      return p && typeof p === "object" ? (p as TranslationsMap) : {};
    } catch {
      return {};
    }
  }
  if (typeof raw === "object") return raw as TranslationsMap;
  return {};
}

/**
 * Merge Swedish (and English base) for the given fields into a translations map.
 * Returns the new map, or null if nothing changed.
 */
function buildTranslations(
  existing: unknown,
  fields: { field: string; value: string | null | undefined }[],
): TranslationsMap | null {
  const map = asMap(existing);
  let changed = false;

  for (const { field, value } of fields) {
    const sv = swedishFor(value);
    if (!sv) continue;
    const entry = map[field] ?? {};
    if (entry.sv) continue; // never overwrite an existing explicit translation
    map[field] = { ...entry, en: value as string, sv };
    changed = true;
  }

  return changed ? map : null;
}

async function main() {
  console.log("🌐 Backfilling translations from legacy dictionaries...\n");
  let updated = 0;

  // HeaderConfig: loginText, registerText
  for (const h of await prisma.headerConfig.findMany()) {
    const next = buildTranslations(h.translations, [
      { field: "loginText", value: h.loginText },
      { field: "registerText", value: h.registerText },
    ]);
    if (next) {
      await prisma.headerConfig.update({ where: { id: h.id }, data: { translations: next } });
      updated++;
      console.log(`  ✓ HeaderConfig ${h.id}`);
    }
  }

  // MenuItem: label (header nav + footer links)
  for (const m of await prisma.menuItem.findMany()) {
    const next = buildTranslations(m.translations, [{ field: "label", value: m.label }]);
    if (next) {
      await prisma.menuItem.update({ where: { id: m.id }, data: { translations: next } });
      updated++;
      console.log(`  ✓ MenuItem "${m.label}"`);
    }
  }

  // FooterConfig: copyrightText, disclaimerText
  for (const f of await prisma.footerConfig.findMany()) {
    const next = buildTranslations(f.translations, [
      { field: "copyrightText", value: f.copyrightText },
      { field: "disclaimerText", value: f.disclaimerText },
    ]);
    if (next) {
      await prisma.footerConfig.update({ where: { id: f.id }, data: { translations: next } });
      updated++;
      console.log(`  ✓ FooterConfig ${f.id}`);
    }
  }

  // FooterWidget: title
  for (const w of await prisma.footerWidget.findMany()) {
    const next = buildTranslations(w.translations, [{ field: "title", value: w.title }]);
    if (next) {
      await prisma.footerWidget.update({ where: { id: w.id }, data: { translations: next } });
      updated++;
      console.log(`  ✓ FooterWidget "${w.title}"`);
    }
  }

  console.log(`\n✅ Backfill complete. Records updated: ${updated}\n`);
}

main()
  .catch((e) => {
    console.error("❌ Backfill failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
