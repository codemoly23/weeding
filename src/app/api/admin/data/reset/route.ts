import { NextRequest, NextResponse } from "next/server";
import { checkAdminOnly, authError } from "@/lib/admin-auth";
import { resetAllData } from "@/lib/theme/theme-reset";

// POST /api/admin/data/reset - Factory reset all content data
export async function POST(request: NextRequest) {
  const auth = await checkAdminOnly();
  if (auth.error) return authError(auth);

  try {
    const body = await request.json();
    const { confirmation, adminEmail } = body as { confirmation: string; adminEmail?: string };

    if (confirmation !== "RESET") {
      return NextResponse.json(
        { error: 'Type "RESET" to confirm factory reset' },
        { status: 400 }
      );
    }

    // Require admin email re-entry as second confirmation factor
    if (!adminEmail || adminEmail.trim().toLowerCase() !== auth.session?.user?.email?.toLowerCase()) {
      return NextResponse.json(
        { error: "Admin email confirmation required" },
        { status: 403 }
      );
    }

    const result = await resetAllData(confirmation);

    return NextResponse.json({
      ...result,
      message:
        "All content data has been reset. System pages have been recreated.",
    });
  } catch (error) {
    console.error("[POST /api/admin/data/reset]", error);
    return NextResponse.json(
      { error: "Failed to reset data" },
      { status: 500 }
    );
  }
}
