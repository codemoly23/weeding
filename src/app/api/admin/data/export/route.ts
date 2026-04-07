import { NextResponse } from "next/server";
import { checkAdminOnly, authError } from "@/lib/admin-auth";
import { exportThemeData } from "@/lib/theme/theme-exporter";

// POST /api/admin/data/export - Export all site data as JSON
export async function POST() {
  const auth = await checkAdminOnly();
  if (auth.error) return authError(auth);

  try {
    const data = await exportThemeData();

    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `ceremoney-export-${dateStr}.json`;

    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[POST /api/admin/data/export]", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
