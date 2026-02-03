import { verifyPluginAccess } from "@/lib/plugin-guard";
import { redirect } from "next/navigation";
import { SupportSettingsClient } from "./settings-client";

export const metadata = {
  title: "Support Settings",
  description: "Configure support system settings",
};

export default async function SettingsPage() {
  // Server-side plugin access check (5-layer protection)
  const access = await verifyPluginAccess("livesupport-pro");

  if (!access.allowed) {
    redirect("/admin/settings/plugins?activate=livesupport-pro");
  }

  return (
    <SupportSettingsClient
      pluginName={access.pluginName}
      tier={access.tier}
      features={access.features}
    />
  );
}
