import { AnalyticsDashboardClient } from "./analytics-client";

export const metadata = {
  title: "Support Analytics",
  description: "View support performance metrics and insights",
};

export default async function AnalyticsPage() {
  return (
    <AnalyticsDashboardClient
      pluginName="Support"
      tier={null}
      features={["chat", "analytics", "ai-responses"]}
      hasAnalyticsFeature={true}
    />
  );
}
