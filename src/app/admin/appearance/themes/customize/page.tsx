"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  Loader2,
  Save,
  RotateCcw,
  ArrowLeft,
  Palette,
  Type,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColorPicker } from "@/components/ui/color-picker";
import type {
  ThemeColorPalette,
  ThemeColorValues,
  ThemeFontConfig,
} from "@/lib/theme/theme-types";
import { DEFAULT_FONT_CONFIG } from "@/lib/theme/theme-types";

// ---- Color Groups ----

interface ColorGroup {
  title: string;
  description: string;
  keys: (keyof ThemeColorValues)[];
}

const COLOR_GROUPS: ColorGroup[] = [
  {
    title: "Base",
    description: "Page background and main text color",
    keys: ["background", "foreground"],
  },
  {
    title: "Primary",
    description: "Primary buttons, links, and accents",
    keys: ["primary", "primary-foreground"],
  },
  {
    title: "Secondary",
    description: "Secondary buttons and UI elements",
    keys: ["secondary", "secondary-foreground"],
  },
  {
    title: "Muted",
    description: "Subtle backgrounds and secondary text",
    keys: ["muted", "muted-foreground"],
  },
  {
    title: "Accent",
    description: "Highlighted interactive elements",
    keys: ["accent", "accent-foreground"],
  },
  {
    title: "Card & Popover",
    description: "Cards, dropdowns, and overlay panels",
    keys: ["card", "card-foreground", "popover", "popover-foreground"],
  },
  {
    title: "Destructive",
    description: "Error states, delete actions, warnings",
    keys: ["destructive", "destructive-foreground"],
  },
  {
    title: "Borders & Input",
    description: "Form inputs, borders, and focus rings",
    keys: ["border", "input", "ring"],
  },
  {
    title: "Planigate · Backgrounds",
    description: "Homepage section, card, and hero gradient backgrounds",
    keys: [
      "planigate-bg-section",
      "planigate-bg-soft",
      "planigate-bg-card",
      "planigate-bg-hero-from",
      "planigate-bg-hero-via",
      "planigate-bg-hero-to",
      "planigate-bg-input",
      "planigate-surface",
    ],
  },
  {
    title: "Planigate · Text",
    description: "Homepage typography colors (primary, muted, placeholder, etc.)",
    keys: [
      "planigate-fg",
      "planigate-fg-hover",
      "planigate-fg-strong",
      "planigate-fg-muted",
      "planigate-fg-soft",
      "planigate-fg-placeholder",
      "planigate-fg-faint",
    ],
  },
  {
    title: "Planigate · Accent & Borders",
    description: "Gold accent (italic headline + hover), star color, dividers, borders",
    keys: [
      "planigate-accent",
      "planigate-accent-light",
      "planigate-star",
      "planigate-border",
      "planigate-border-soft",
      "planigate-border-subtle",
      "planigate-divider",
    ],
  },
];

// ---- Human-readable labels ----

const COLOR_LABELS: Record<string, string> = {
  background: "Background",
  foreground: "Foreground",
  primary: "Primary",
  "primary-foreground": "Primary Text",
  secondary: "Secondary",
  "secondary-foreground": "Secondary Text",
  muted: "Muted",
  "muted-foreground": "Muted Text",
  accent: "Accent",
  "accent-foreground": "Accent Text",
  card: "Card",
  "card-foreground": "Card Text",
  popover: "Popover",
  "popover-foreground": "Popover Text",
  destructive: "Destructive",
  "destructive-foreground": "Destructive Text",
  border: "Border",
  input: "Input Border",
  ring: "Focus Ring",
  // Planigate
  "planigate-bg-section": "Section BG",
  "planigate-bg-soft": "Soft Card BG",
  "planigate-bg-card": "CTA Card BG",
  "planigate-bg-hero-from": "Hero Gradient · Top",
  "planigate-bg-hero-via": "Hero Gradient · Middle",
  "planigate-bg-hero-to": "Hero Gradient · Bottom",
  "planigate-bg-input": "Input BG",
  "planigate-surface": "Surface (Pills/Cards)",
  "planigate-fg": "Primary Text",
  "planigate-fg-hover": "Primary Text (Hover)",
  "planigate-fg-strong": "Strong Text",
  "planigate-fg-muted": "Muted Text",
  "planigate-fg-soft": "Soft Text",
  "planigate-fg-placeholder": "Placeholder",
  "planigate-fg-faint": "Faint Text",
  "planigate-accent": "Gold Accent",
  "planigate-accent-light": "Gold Divider",
  "planigate-star": "Rating Star",
  "planigate-border": "Border",
  "planigate-border-soft": "Border (Soft)",
  "planigate-border-subtle": "Border (Subtle)",
  "planigate-divider": "Divider",
};

// ---- Google Fonts list ----

const GOOGLE_FONTS = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Nunito",
  "Raleway",
  "Ubuntu",
  "Merriweather",
  "Playfair Display",
  "Source Sans 3",
  "PT Sans",
  "Oswald",
  "Noto Sans",
  "Rubik",
  "Work Sans",
  "DM Sans",
  "Outfit",
  "Plus Jakarta Sans",
  "Manrope",
  "Space Grotesk",
  "Sora",
  "Lexend",
  "Figtree",
];

/** Accent fonts include system serif fonts + select Google decorative fonts */
const ACCENT_FONTS = [
  "Georgia",
  "Times New Roman",
  "Garamond",
  "Playfair Display",
  "Merriweather",
  "Lora",
  "Libre Baskerville",
];

// ---- Default empty palette ----

// Planigate defaults — kept in sync with globals.css. Used as the seed for
// new themes so admins see meaningful starting values in the color pickers.
const PLANIGATE_LIGHT_DEFAULTS: Partial<ThemeColorValues> = {
  "planigate-bg-section": "#EFE8DB",
  "planigate-bg-soft": "#F5EFE5",
  "planigate-bg-card": "#FAF6EE",
  "planigate-bg-hero-from": "#FBF8F3",
  "planigate-bg-hero-via": "#F5EFE5",
  "planigate-bg-hero-to": "#EFE8DB",
  "planigate-bg-input": "#FBF8F3",
  "planigate-surface": "#FFFFFF",
  "planigate-fg": "#1A1A1A",
  "planigate-fg-hover": "#2A2A2A",
  "planigate-fg-strong": "#3C3C3C",
  "planigate-fg-muted": "#5C5C5C",
  "planigate-fg-soft": "#6B6B6B",
  "planigate-fg-placeholder": "#9A9286",
  "planigate-fg-faint": "#8A8A8A",
  "planigate-accent": "#8A6F3E",
  "planigate-accent-light": "#C2A86A",
  "planigate-star": "#E4A93B",
  "planigate-border": "#E5DFD3",
  "planigate-border-soft": "#E8E0D0",
  "planigate-border-subtle": "#D6CFC0",
  "planigate-divider": "#D9D2C5",
};

const PLANIGATE_DARK_DEFAULTS: Partial<ThemeColorValues> = {
  "planigate-bg-section": "#0F172A",
  "planigate-bg-soft": "#1E293B",
  "planigate-bg-card": "#1E293B",
  "planigate-bg-hero-from": "#0F172A",
  "planigate-bg-hero-via": "#1E293B",
  "planigate-bg-hero-to": "#0F172A",
  "planigate-bg-input": "#1E293B",
  "planigate-surface": "#1E293B",
  "planigate-fg": "#F8FAFC",
  "planigate-fg-hover": "#FFFFFF",
  "planigate-fg-strong": "#E2E8F0",
  "planigate-fg-muted": "#94A3B8",
  "planigate-fg-soft": "#94A3B8",
  "planigate-fg-placeholder": "#64748B",
  "planigate-fg-faint": "#64748B",
  "planigate-accent": "#FBBF24",
  "planigate-accent-light": "#F59E0B",
  "planigate-star": "#FBBF24",
  "planigate-border": "#334155",
  "planigate-border-soft": "#334155",
  "planigate-border-subtle": "#475569",
  "planigate-divider": "#475569",
};

const EMPTY_PALETTE: ThemeColorPalette = {
  light: {
    background: "#ffffff",
    foreground: "#0f172a",
    card: "#ffffff",
    "card-foreground": "#0f172a",
    popover: "#ffffff",
    "popover-foreground": "#0f172a",
    primary: "#F97316",
    "primary-foreground": "#ffffff",
    secondary: "#0A0F1E",
    "secondary-foreground": "#ffffff",
    muted: "#F1F5F9",
    "muted-foreground": "#64748B",
    accent: "#F97316",
    "accent-foreground": "#ffffff",
    destructive: "#EF4444",
    "destructive-foreground": "#ffffff",
    border: "#E2E8F0",
    input: "#E2E8F0",
    ring: "#F97316",
    ...PLANIGATE_LIGHT_DEFAULTS,
  },
  dark: {
    background: "#0f172a",
    foreground: "#f8fafc",
    card: "#0f172a",
    "card-foreground": "#f8fafc",
    popover: "#0f172a",
    "popover-foreground": "#f8fafc",
    primary: "#F97316",
    "primary-foreground": "#ffffff",
    secondary: "#1e293b",
    "secondary-foreground": "#f8fafc",
    muted: "#1e293b",
    "muted-foreground": "#94a3b8",
    accent: "#1e293b",
    "accent-foreground": "#f8fafc",
    destructive: "#7f1d1d",
    "destructive-foreground": "#ffffff",
    border: "#1e293b",
    input: "#1e293b",
    ring: "#F97316",
    ...PLANIGATE_DARK_DEFAULTS,
  },
};

// ---- Color Section Component ----

function ColorSection({
  group,
  values,
  onChange,
}: {
  group: ColorGroup;
  values: ThemeColorValues;
  onChange: (key: keyof ThemeColorValues, value: string) => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{group.title}</CardTitle>
        <CardDescription className="text-sm">
          {group.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {group.keys.map((key) => (
            <ColorPicker
              key={key}
              label={COLOR_LABELS[key] || key}
              value={values[key] || "#000000"}
              onChange={(val) => onChange(key, val)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ---- Font Preview Component ----

function FontPreview({ fontFamily }: { fontFamily: string }) {
  return (
    <div className="rounded-lg border p-4 bg-background">
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@400;600;700&display=swap`}
      />
      <p
        style={{ fontFamily: `"${fontFamily}", sans-serif` }}
        className="text-2xl font-bold mb-2"
      >
        The quick brown fox
      </p>
      <p
        style={{ fontFamily: `"${fontFamily}", sans-serif` }}
        className="text-base"
      >
        jumps over the lazy dog. 0123456789
      </p>
    </div>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function ThemeCustomizePage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [themeName, setThemeName] = useState("");
  const [colorPalette, setColorPalette] =
    useState<ThemeColorPalette>(EMPTY_PALETTE);
  const [originalColorPalette, setOriginalColorPalette] =
    useState<ThemeColorPalette | null>(null);
  const [fontConfig, setFontConfig] =
    useState<ThemeFontConfig>(DEFAULT_FONT_CONFIG);
  const [initialState, setInitialState] = useState<{
    colorPalette: ThemeColorPalette;
    fontConfig: ThemeFontConfig;
  } | null>(null);
  const [noTheme, setNoTheme] = useState(false);

  // Track if there are unsaved changes
  const hasChanges =
    initialState !== null &&
    JSON.stringify({ colorPalette, fontConfig }) !==
      JSON.stringify(initialState);

  // Fetch current theme customization
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/themes/customize");
        if (res.status === 404) {
          setNoTheme(true);
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();

        // Merge fetched palette with EMPTY_PALETTE so any new keys (e.g. Planigate)
        // get their default values even on older themes saved before the key existed.
        const fetchedPalette = data.colorPalette;
        const palette: ThemeColorPalette = fetchedPalette
          ? {
              light: { ...EMPTY_PALETTE.light, ...fetchedPalette.light },
              dark: { ...EMPTY_PALETTE.dark, ...fetchedPalette.dark },
            }
          : EMPTY_PALETTE;
        const fonts = data.fontConfig || DEFAULT_FONT_CONFIG;

        setThemeName(data.themeName || "");
        setColorPalette(palette);
        setOriginalColorPalette(
          data.originalColorPalette
            ? {
                light: { ...EMPTY_PALETTE.light, ...data.originalColorPalette.light },
                dark: { ...EMPTY_PALETTE.dark, ...data.originalColorPalette.dark },
              }
            : palette
        );
        setFontConfig(fonts);
        setInitialState({ colorPalette: palette, fontConfig: fonts });
      } catch {
        toast.error(t("admin.themeCustomizer.loadFailed"));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Update a single color value
  const updateColor = useCallback(
    (mode: "light" | "dark", key: keyof ThemeColorValues, value: string) => {
      setColorPalette((prev) => ({
        ...prev,
        [mode]: { ...prev[mode], [key]: value },
      }));
    },
    []
  );

  // Save customization
  async function handleSave() {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/themes/customize", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ colorPalette, fontConfig }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }

      setInitialState({ colorPalette, fontConfig });
      toast.success(t("admin.themeCustomizer.saveSuccess"));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("admin.themeCustomizer.saveFailed")
      );
    } finally {
      setSaving(false);
    }
  }

  // Reset colors to original theme palette
  function handleResetColors() {
    if (!originalColorPalette) return;
    setColorPalette(originalColorPalette);
    toast.info(t("admin.themeCustomizer.resetColorsInfo"));
  }

  // Reset fonts to defaults
  function handleResetFonts() {
    setFontConfig(DEFAULT_FONT_CONFIG);
    toast.info(t("admin.themeCustomizer.resetFontsInfo"));
  }

  // ---- Loading State ----
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t("admin.themeCustomizer.title")}</h1>
          <p className="text-muted-foreground">{t("admin.themeCustomizer.loading")}</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // ---- No Active Theme ----
  if (noTheme) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t("admin.themeCustomizer.title")}</h1>
          <p className="text-muted-foreground">
            {t("admin.themeCustomizer.noThemeDesc")}
          </p>
        </div>
        <div className="text-center py-16">
          <Palette className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
          <p className="text-lg font-medium text-muted-foreground mb-4">
            {t("admin.themeCustomizer.noThemeTitle")}
          </p>
          <Button asChild>
            <Link href="/admin/appearance/themes">{t("admin.themeCustomizer.goToGallery")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/appearance/themes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t("admin.themeCustomizer.title")}</h1>
            <p className="text-muted-foreground text-sm">
              {t("admin.themeCustomizer.subtitle", { name: themeName })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetColors}
            disabled={saving || !originalColorPalette}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {t("admin.themeCustomizer.resetColors")}
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || !hasChanges}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Main Tabs: Colors / Fonts */}
      <Tabs defaultValue="colors" className="space-y-6">
        <TabsList>
          <TabsTrigger value="colors" className="gap-2">
            <Palette className="h-4 w-4" />
            {t("admin.themeCustomizer.colors")}
          </TabsTrigger>
          <TabsTrigger value="fonts" className="gap-2">
            <Type className="h-4 w-4" />
            {t("admin.themeCustomizer.fonts")}
          </TabsTrigger>
        </TabsList>

        {/* ---- Colors Tab ---- */}
        <TabsContent value="colors" className="space-y-6">
          {/* Light / Dark mode sub-tabs */}
          <Tabs defaultValue="light" className="space-y-4">
            <TabsList>
              <TabsTrigger value="light" className="gap-2">
                <Sun className="h-4 w-4" />
                {t("admin.themeCustomizer.lightMode")}
              </TabsTrigger>
              <TabsTrigger value="dark" className="gap-2">
                <Moon className="h-4 w-4" />
                {t("admin.themeCustomizer.darkMode")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="light" className="space-y-4">
              {COLOR_GROUPS.map((group) => (
                <ColorSection
                  key={group.title}
                  group={group}
                  values={colorPalette.light}
                  onChange={(key, value) => updateColor("light", key, value)}
                />
              ))}
            </TabsContent>

            <TabsContent value="dark" className="space-y-4">
              {COLOR_GROUPS.map((group) => (
                <ColorSection
                  key={group.title}
                  group={group}
                  values={colorPalette.dark}
                  onChange={(key, value) => updateColor("dark", key, value)}
                />
              ))}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ---- Fonts Tab ---- */}
        <TabsContent value="fonts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                {t("admin.themeCustomizer.typography")}
              </CardTitle>
              <CardDescription>
                {t("admin.themeCustomizer.typographyDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Heading Font */}
                <div className="space-y-3">
                  <Label>{t("admin.themeCustomizer.headingFont")}</Label>
                  <Select
                    value={fontConfig.headingFont}
                    onValueChange={(val) =>
                      setFontConfig((prev) => ({ ...prev, headingFont: val }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select heading font" />
                    </SelectTrigger>
                    <SelectContent>
                      {GOOGLE_FONTS.map((font) => (
                        <SelectItem key={font} value={font}>
                          {font}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FontPreview fontFamily={fontConfig.headingFont} />
                </div>

                {/* Body Font */}
                <div className="space-y-3">
                  <Label>{t("admin.themeCustomizer.bodyFont")}</Label>
                  <Select
                    value={fontConfig.bodyFont}
                    onValueChange={(val) =>
                      setFontConfig((prev) => ({ ...prev, bodyFont: val }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select body font" />
                    </SelectTrigger>
                    <SelectContent>
                      {GOOGLE_FONTS.map((font) => (
                        <SelectItem key={font} value={font}>
                          {font}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FontPreview fontFamily={fontConfig.bodyFont} />
                </div>
              </div>

              {/* Accent / Decorative Font */}
              <div className="space-y-3">
                <Label>{t("admin.themeCustomizer.accentFont")}</Label>
                <p className="text-xs text-muted-foreground">
                  {t("admin.themeCustomizer.accentFontHint")}
                </p>
                <Select
                  value={fontConfig.accentFont || "Inter"}
                  onValueChange={(val) =>
                    setFontConfig((prev) => ({ ...prev, accentFont: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select accent font" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCENT_FONTS.map((font) => (
                      <SelectItem key={font} value={font}>
                        {font}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FontPreview fontFamily={fontConfig.accentFont || "Inter"} />
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFonts}
                  disabled={saving}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {t("admin.themeCustomizer.resetFonts")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
