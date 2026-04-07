import { NextResponse } from "next/server";
import { getBusinessConfig } from "@/lib/business-settings";

// GET /api/business-config - Get public business configuration
export async function GET() {
  try {
    const config = await getBusinessConfig();
    return NextResponse.json(config, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error fetching business config:", error);
    // Return default config on error
    return NextResponse.json({
      name: "Ceremoney",
      tagline: "Your Wedding & Event Planning Partner",
      description: "Empowering couples and event planners to create unforgettable celebrations.",
      display: { showLogo: true, showName: true },
      logo: { url: "", darkUrl: "", text: "C" },
      favicon: "",
      currency: "USD",
      contact: { email: "contact@ceremoney.com", phone: "", supportEmail: "support@ceremoney.com" },
      address: { line1: "", line2: "", city: "", state: "", zip: "", country: "US", full: "" },
      social: { facebook: "", twitter: "", linkedin: "", instagram: "", youtube: "", tiktok: "" },
    });
  }
}
