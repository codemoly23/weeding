import { NextRequest, NextResponse } from "next/server";
import { checkAdminOnly } from "@/lib/admin-auth";
import { getSetting, setSetting } from "@/lib/settings";
import { NEWSLETTER_SETTINGS } from "@/lib/newsletter/settings";

// GET — get newsletter settings
export async function GET() {
  const auth = await checkAdminOnly();
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const keys = Object.values(NEWSLETTER_SETTINGS);
  const settings: Record<string, string | null> = {};

  for (const key of keys) {
    settings[key] = await getSetting(key);
  }

  return NextResponse.json({ success: true, data: settings });
}

// POST — update newsletter settings
export async function POST(request: NextRequest) {
  const auth = await checkAdminOnly();
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const validKeys = Object.values(NEWSLETTER_SETTINGS) as string[];

    for (const [key, value] of Object.entries(body)) {
      if (validKeys.includes(key) && typeof value === "string") {
        await setSetting(key, value);
      }
    }

    return NextResponse.json({ success: true, message: "Settings saved" });
  } catch (error) {
    console.error("Save newsletter settings error:", error);
    return NextResponse.json({ success: false, error: "Failed to save settings" }, { status: 500 });
  }
}
