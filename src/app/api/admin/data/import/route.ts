import { NextRequest, NextResponse } from "next/server";
import { checkAdminOnly, authError } from "@/lib/admin-auth";
import type { ThemeData } from "@/lib/theme/theme-types";
import { importThemeData } from "@/lib/theme/theme-importer";

// POST /api/admin/data/import - Import data from uploaded JSON file
export async function POST(request: NextRequest) {
  const auth = await checkAdminOnly();
  if (auth.error) return authError(auth);

  try {
    const body = await request.json();
    const { data, confirmation } = body as {
      data: ThemeData;
      confirmation: string;
    };

    if (confirmation !== "CONFIRM") {
      return NextResponse.json(
        { error: 'Type "CONFIRM" to proceed with import' },
        { status: 400 }
      );
    }

    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    // Basic validation
    if (!data.version || !data.settings) {
      return NextResponse.json(
        { error: "Invalid theme data: missing version or settings" },
        { status: 400 }
      );
    }

    const result = await importThemeData(data, { source: "file" });

    return NextResponse.json({
      ...result,
      message: "Data imported successfully",
    });
  } catch (error) {
    console.error("[POST /api/admin/data/import]", error);
    return NextResponse.json(
      { error: "Failed to import data" },
      { status: 500 }
    );
  }
}

// POST /api/admin/data/import/validate - Validate data without importing
export async function PUT(request: NextRequest) {
  const auth = await checkAdminOnly();
  if (auth.error) return authError(auth);

  try {
    const body = await request.json();
    const data = body.data as ThemeData;

    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    // Return preview of what would be imported
    const preview = {
      valid: true,
      version: data.version || "unknown",
      exportedAt: data.exportedAt || "unknown",
      counts: {
        settings: Object.keys(data.settings || {}).length,
        serviceCategories: data.serviceCategories?.length || 0,
        services: data.services?.length || 0,
        pages: data.pages?.length || 0,
        blogCategories: data.blogCategories?.length || 0,
        blogs: data.blogs?.length || 0,
        faqs: data.faqs?.length || 0,
        testimonials: data.testimonials?.length || 0,
        legalPages: data.legalPages?.length || 0,
        formTemplates: data.formTemplates?.length || 0,
      },
      hasColorPalette: !!data.colorPalette,
      hasWidgetPresets: !!data.widgetPresets,
    };

    return NextResponse.json(preview);
  } catch (error) {
    console.error("[PUT /api/admin/data/import]", error);
    return NextResponse.json(
      { error: "Failed to validate data" },
      { status: 500 }
    );
  }
}
