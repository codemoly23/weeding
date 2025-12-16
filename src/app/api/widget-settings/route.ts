import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// Public API - no auth required
// Returns only the widget-specific settings needed for display

const WIDGET_SETTINGS_PREFIX = "support.widget.";

// Default widget settings
const defaultWidgetSettings = {
  enabled: true,
  position: "bottom-right",
  buttonSize: "medium",
  horizontalOffset: 24,
  verticalOffset: 24,
  primaryColor: "#2563eb",
  textColor: "#ffffff",
  welcomeMessage: "Hi! How can we help you today?",
  offlineMessage: "We're currently offline. Leave a message and we'll get back to you.",
  awayMessage: "We're not available right now, but leave a message and we'll get back to you soon!",
  showAgentPhoto: true,
  showUnreadBadge: true,
  soundNotifications: true,
  autoOpen: false,
};

export async function GET() {
  try {
    // Get widget settings from database
    const dbSettings = await prisma.setting.findMany({
      where: {
        key: { startsWith: WIDGET_SETTINGS_PREFIX },
      },
    });

    // Start with defaults
    const settings = { ...defaultWidgetSettings };

    // Override with database values
    for (const setting of dbSettings) {
      const key = setting.key.replace(WIDGET_SETTINGS_PREFIX, "");
      let value: unknown = setting.value;

      // Parse JSON/boolean values
      try {
        value = JSON.parse(setting.value);
      } catch {
        if (setting.value === "true") value = true;
        else if (setting.value === "false") value = false;
      }

      (settings as Record<string, unknown>)[key] = value;
    }

    // Cache for 1 minute (can be increased in production)
    return NextResponse.json(settings, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error fetching widget settings:", error);
    // Return defaults on error
    return NextResponse.json(defaultWidgetSettings);
  }
}
