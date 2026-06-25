/**
 * Fix: add Swedish translations for loginText, registerText, and CTA button text
 * that were missed by the initial backfill (values not in legacy dictionary).
 *
 *   npx tsx prisma/fix-auth-translations.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function asMap(raw: unknown): Record<string, unknown> {
  if (!raw) return {};
  if (typeof raw === "string") { try { return JSON.parse(raw) as Record<string, unknown>; } catch { return {}; } }
  if (typeof raw === "object") return raw as Record<string, unknown>;
  return {};
}

const AUTH_SV: Record<string, string> = {
  "sign in":              "Logga in",
  "log in":               "Logga in",
  "login":                "Logga in",
  "start free":           "Börja gratis",
  "get started":          "Kom igång",
  "get started free":     "Kom igång gratis",
  "start planning free":  "Börja planera gratis",
  "try for free":         "Prova gratis",
};

function svFor(en: string | null | undefined): string | null {
  if (!en) return null;
  return AUTH_SV[en.trim().toLowerCase()] ?? null;
}

async function main() {
  console.log("🔧 Fixing auth/CTA button translations...\n");
  let updated = 0;

  const headers = await prisma.headerConfig.findMany();
  for (const h of headers) {
    const trans = asMap(h.translations);
    let changed = false;

    // loginText
    const loginSv = svFor(h.loginText);
    if (loginSv && !(trans.loginText as Record<string, string> | undefined)?.sv) {
      trans.loginText = { en: h.loginText, sv: loginSv };
      changed = true;
      console.log(`  loginText: "${h.loginText}" → sv="${loginSv}"`);
    }

    // registerText
    const registerSv = svFor(h.registerText);
    if (registerSv && !(trans.registerText as Record<string, string> | undefined)?.sv) {
      trans.registerText = { en: h.registerText, sv: registerSv };
      changed = true;
      console.log(`  registerText: "${h.registerText}" → sv="${registerSv}"`);
    }

    // ctaButtons — patch translations inside the JSON array
    const rawButtons = h.ctaButtons;
    let buttons: Array<Record<string, unknown>> = [];
    if (Array.isArray(rawButtons)) {
      buttons = rawButtons as Array<Record<string, unknown>>;
    } else if (typeof rawButtons === "string") {
      try { buttons = JSON.parse(rawButtons); } catch { buttons = []; }
    }
    let buttonPatched = false;
    const patchedButtons = buttons.map((btn) => {
      const text = btn.text as string | undefined;
      if (!text) return btn;
      const btnTrans = asMap(btn.translations ?? {});
      const textEntry = btnTrans.text as Record<string, string> | undefined;
      if (textEntry?.sv) return btn; // already has SV
      const sv = svFor(text);
      if (!sv) return btn;
      console.log(`  CTA button: "${text}" → sv="${sv}"`);
      buttonPatched = true;
      return { ...btn, translations: { ...btnTrans, text: { en: text, sv } } };
    });

    if (changed || buttonPatched) {
      await prisma.headerConfig.update({
        where: { id: h.id },
        data: {
          translations: trans,
          ...(buttonPatched ? { ctaButtons: patchedButtons } : {}),
        },
      });
      updated++;
      console.log(`  ✓ HeaderConfig ${h.id} updated\n`);
    }
  }

  if (updated === 0) console.log("  (nothing to update — already patched)");
  console.log(`\n✅ Done. Records updated: ${updated}`);
}

main()
  .catch((e) => { console.error("❌ Failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
