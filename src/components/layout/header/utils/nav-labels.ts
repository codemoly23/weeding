import { normalizeTranslations } from "@/lib/i18n/localized";

type TranslateFn = (key: string, params?: Record<string, string>) => string;

const NAV_LABEL_KEYS: Record<string, string> = {
  Home: "nav.home",
  Services: "nav.services",
  Pricing: "nav.pricing",
  About: "nav.about",
  "About Us": "nav.about",
  Blog: "nav.blog",
  Contact: "nav.contact",
  "Contact Us": "nav.contact",
  Features: "nav.features",
  "Planning Tools": "nav.planningTools",
  Planeringsverktyg: "nav.planningTools",
  Venues: "nav.venues",
  Lokaler: "nav.venues",
  Vendors: "nav.vendors",
  Leverantörer: "nav.vendors",
  "Wedding Website": "nav.weddingWebsite",
  Bröllopswebbplats: "nav.weddingWebsite",
  Company: "nav.company",
  Företag: "nav.company",
};

const NAV_DIRECT_LABELS: Array<{ en: string; sv: string; aliases?: string[] }> = [
  { en: "Privacy Policy", sv: "Integritetspolicy" },
  { en: "Refund Policy", sv: "Återbetalningspolicy" },
  { en: "Terms of Service", sv: "Användarvillkor" },
  { en: "Cookies Consent", sv: "Cookie-samtycke" },
  { en: "Popular", sv: "Populärt" },
  { en: "Start Planning Free", sv: "Börja planera gratis" },
  { en: "Seating Chart Editor", sv: "Bordplaceringsverktyg" },
  { en: "Need help? Get free consultation", sv: "Behöver du hjälp? Få gratis rådgivning" },
];

function normalizeLabel(label: string): string {
  return label.replace(/\s+/g, " ").trim().toLowerCase();
}

export function getNavLabel(
  label: string | null | undefined,
  t: TranslateFn,
  lang: string,
  translations?: unknown,
  field: string = "label",
): string {
  if (!label) return "";

  // Explicit per-locale translation (from the DB) wins over the legacy dictionary.
  if (translations) {
    const entry = normalizeTranslations(translations)[field] as Record<string, string> | undefined;
    const explicit = entry?.[lang];
    if (explicit) return explicit;
  }

  const key = NAV_LABEL_KEYS[label];
  if (key) return t(key);

  if (lang !== "en" && lang !== "sv") return label;

  const normalized = normalizeLabel(label);
  const direct = NAV_DIRECT_LABELS.find((item) =>
    [item.en, item.sv, ...(item.aliases || [])].some((candidate) => normalizeLabel(candidate) === normalized)
  );

  if (!direct) return label;
  return lang === "sv" ? direct.sv : direct.en;
}
