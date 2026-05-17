import { SupportSettingsClient } from "./settings-client";

export const metadata = {
  title: "Support Settings",
  description: "Configure support system settings",
};

export default async function SettingsPage() {
  return (
    <SupportSettingsClient
      pluginName="Support"
      tier={null}
      features={["chat", "analytics", "ai-responses"]}
    />
  );
}
