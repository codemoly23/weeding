import { verifyPluginAccess } from "@/lib/plugin-guard";
import { redirect } from "next/navigation";
import { TicketsPageClient } from "./tickets-client";

export const metadata = {
  title: "Support Tickets",
  description: "Manage customer support tickets",
};

export default async function TicketsPage() {
  // Server-side plugin access check (5-layer protection)
  const access = await verifyPluginAccess("livesupport-pro");

  if (!access.allowed) {
    // Plugin not active - redirect to plugins settings
    redirect("/admin/settings/plugins?activate=livesupport-pro");
  }

  return (
    <TicketsPageClient
      pluginName={access.pluginName}
      tier={access.tier}
      features={access.features}
      needsRefresh={access.needsRefresh}
    />
  );
}
