// ── Localized dynamic content helpers ───────────────────────────────────────────
//
// Dynamic (DB-stored) content is translated via a per-record `translations` JSON
// column shaped as:
//
//   { [fieldName]: { en: "...", sv: "..." } }
//
// The original scalar field (e.g. FooterConfig.copyrightText) stays as the default /
// fallback value. `resolveLocalized` picks the right per-locale value at render time,
// falling back to English, then to the base value. This keeps the system N-language
// ready (adding a locale needs no migration) and fully backward compatible.

import { LANGUAGES, type LangCode } from "./language-context";

export const DEFAULT_LANG: LangCode = LANGUAGES[0].code;

/** Per-field translation map, e.g. `{ en: "Sign In", sv: "Logga in" }`. */
export type LocalizedText = Partial<Record<LangCode, string>>;

/** A record's full `translations` column: `{ fieldName: { en, sv } }`. */
export type TranslationsMap = Record<string, LocalizedText>;

/**
 * Normalize a raw `translations` value into a plain object.
 *
 * JSON columns in this codebase are sometimes stored via `JSON.stringify(...)`, so a
 * value may arrive as either an object (normal Prisma Json) or a JSON string. Both are
 * handled here; anything else yields an empty map.
 */
export function normalizeTranslations(translations: unknown): TranslationsMap {
  if (!translations) return {};
  if (typeof translations === "string") {
    try {
      const parsed = JSON.parse(translations);
      return parsed && typeof parsed === "object" ? (parsed as TranslationsMap) : {};
    } catch {
      return {};
    }
  }
  if (typeof translations === "object") return translations as TranslationsMap;
  return {};
}

/** Replace `{key}` placeholders with the matching `vars` values. */
export function interpolate(str: string, vars?: Record<string, string>): string {
  if (!vars) return str;
  let out = str;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(`{${k}}`, v);
  }
  return out;
}

/**
 * Resolve the localized value of a single field.
 *
 * Priority: translations[field][lang] → translations[field][en] → base → "".
 * Optional `vars` interpolates `{placeholder}` tokens (e.g. `{year}`, `{name}`).
 */
export function resolveLocalized(
  base: string | null | undefined,
  translations: unknown,
  field: string,
  lang: string,
  vars?: Record<string, string>,
): string {
  const entry = normalizeTranslations(translations)[field];
  const raw =
    (entry && (entry[lang as LangCode] || entry[DEFAULT_LANG])) || base || "";
  return interpolate(raw, vars);
}

/** Read a single field's `LocalizedText` map (e.g. to seed an admin editor). */
export function getLocalizedField(
  translations: unknown,
  field: string,
): LocalizedText {
  return normalizeTranslations(translations)[field] ?? {};
}

/**
 * Merge a single field's `LocalizedText` map back into a full translations map,
 * dropping empty/whitespace-only locale values to keep stored JSON lean.
 */
export function setLocalizedField(
  translations: unknown,
  field: string,
  value: LocalizedText,
): TranslationsMap {
  const map = { ...normalizeTranslations(translations) };
  const cleaned: LocalizedText = {};
  for (const lang of LANGUAGES) {
    const v = value[lang.code]?.trim();
    if (v) cleaned[lang.code] = v;
  }
  if (Object.keys(cleaned).length === 0) {
    delete map[field];
  } else {
    map[field] = cleaned;
  }
  return map;
}
