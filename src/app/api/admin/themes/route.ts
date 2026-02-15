import { NextResponse } from "next/server";
import { checkAdminOnly, authError } from "@/lib/admin-auth";
import prisma from "@/lib/db";
import fs from "fs/promises";
import path from "path";
import type { ThemeMeta, ThemeListItem } from "@/lib/theme/theme-types";

// GET /api/admin/themes - List available themes
export async function GET() {
  const auth = await checkAdminOnly();
  if (auth.error) return authError(auth);

  try {
    const themesDir = path.join(process.cwd(), "public", "themes");

    // Check if themes directory exists
    let themeFolders: string[] = [];
    try {
      const entries = await fs.readdir(themesDir, { withFileTypes: true });
      themeFolders = entries
        .filter((e) => e.isDirectory())
        .map((e) => e.name);
    } catch {
      // Directory doesn't exist yet - return empty
      return NextResponse.json({ themes: [] });
    }

    // Get active theme
    const activeTheme = await prisma.activeTheme.findFirst();

    // Read meta.json from each theme folder
    const themes: ThemeListItem[] = [];
    for (const folder of themeFolders) {
      try {
        const metaPath = path.join(themesDir, folder, "meta.json");
        const metaContent = await fs.readFile(metaPath, "utf-8");
        const meta: ThemeMeta = JSON.parse(metaContent);
        themes.push({
          id: folder,
          meta,
          isActive: activeTheme?.themeId === folder,
        });
      } catch {
        // Skip folders without valid meta.json
        continue;
      }
    }

    return NextResponse.json({ themes });
  } catch (error) {
    console.error("[GET /api/admin/themes]", error);
    return NextResponse.json(
      { error: "Failed to list themes" },
      { status: 500 }
    );
  }
}
