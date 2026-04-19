export const dynamic = "force-dynamic";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PluginWidgetLoader } from "@/components/plugins/plugin-widget-loader";
import { TrackingScripts } from "@/components/tracking/tracking-scripts";
import { getTrackingSettings } from "@/lib/tracking";
import { getHomeTemplate } from "@/lib/templates/get-template";
import { TopUtilityBarWidget } from "@/components/page-builder/widgets/layout";
import type { Section, TopUtilityBarWidgetSettings } from "@/lib/page-builder/types";

function extractUtilityBarSettings(sections: Section[]): TopUtilityBarWidgetSettings | null {
  for (const section of sections) {
    if (section.settings.isVisible === false) continue;
    for (const column of section.columns) {
      for (const widget of column.widgets) {
        if (widget.type === "top-utility-bar") {
          return widget.settings as TopUtilityBarWidgetSettings;
        }
      }
    }
  }
  return null;
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [trackingConfig, template] = await Promise.all([
    getTrackingSettings(),
    getHomeTemplate(),
  ]);

  const utilityBarSettings = template ? extractUtilityBarSettings(template.sections) : null;

  return (
    <div className="min-h-screen bg-background">
      {utilityBarSettings && <TopUtilityBarWidget settings={utilityBarSettings} />}
      <Header />
      <main>{children}</main>
      <Footer />
      {/* Plugin widgets are loaded dynamically based on active plugins */}
      <PluginWidgetLoader position="body-end" />
      {trackingConfig && <TrackingScripts config={trackingConfig} />}
    </div>
  );
}
