import { verifyPluginAccess } from "@/lib/plugin-guard";
import { redirect } from "next/navigation";
import { AnalyticsDashboardClient } from "./analytics-client";

export const metadata = {
  title: "Support Analytics",
  description: "View support performance metrics and insights",
};

export default async function AnalyticsPage() {
  // Server-side plugin access check (5-layer protection)
  const access = await verifyPluginAccess("livesupport-pro");

  if (!access.allowed) {
    redirect("/admin/settings/plugins?activate=livesupport-pro");
  }

  // Check if analytics feature is enabled in license tier
  const hasAnalyticsFeature = access.features.includes("analytics");

  return (
    <AnalyticsDashboardClient
      pluginName={access.pluginName}
      tier={access.tier}
      features={access.features}
      hasAnalyticsFeature={hasAnalyticsFeature}
    />
  );
}
