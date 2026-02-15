import prisma from "@/lib/db";
import type { ThemeColorPalette } from "./theme-types";

/**
 * Reads the active theme's color palette from the database.
 * Returns null if no theme is active or no custom palette is set.
 */
async function getActiveColorPalette(): Promise<ThemeColorPalette | null> {
  try {
    const activeTheme = await prisma.activeTheme.findFirst();
    if (!activeTheme?.colorPalette) return null;
    return activeTheme.colorPalette as unknown as ThemeColorPalette;
  } catch {
    // Table may not exist yet during initial setup
    return null;
  }
}

/**
 * Generates CSS variable overrides from a color palette.
 * These override the Tailwind v4 @theme variables defined in globals.css.
 */
function generateColorCSS(palette: ThemeColorPalette): string {
  const lightVars = Object.entries(palette.light)
    .map(([key, value]) => `  --color-${key}: ${value};`)
    .join("\n");

  const darkVars = Object.entries(palette.dark)
    .map(([key, value]) => `  --color-${key}: ${value};`)
    .join("\n");

  return `:root {\n${lightVars}\n}\n\n.dark {\n${darkVars}\n}`;
}

/**
 * Server component that injects theme color CSS variables into the page.
 * Place this in the root layout, inside <head> or at the top of <body>.
 *
 * If no active theme is set, renders nothing (falls back to globals.css defaults).
 */
export async function ThemeColorProvider() {
  const palette = await getActiveColorPalette();

  if (!palette) return null;

  return (
    <style
      dangerouslySetInnerHTML={{ __html: generateColorCSS(palette) }}
      data-theme-colors=""
    />
  );
}
