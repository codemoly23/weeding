import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PluginWidgetLoader } from "@/components/plugins/plugin-widget-loader";
import { TrackingScripts } from "@/components/tracking/tracking-scripts";
import { getTrackingSettings } from "@/lib/tracking";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const trackingConfig = await getTrackingSettings();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>{children}</main>
      <Footer />
      {/* Plugin widgets are loaded dynamically based on active plugins */}
      <PluginWidgetLoader position="body-end" />
      {trackingConfig && <TrackingScripts config={trackingConfig} />}
    </div>
  );
}
