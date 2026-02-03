import { verifyPluginAccess } from "@/lib/plugin-guard";
import { redirect } from "next/navigation";
import { CannedResponsesClient } from "./canned-responses-client";

export const metadata = {
  title: "Canned Responses",
  description: "Manage pre-written response templates",
};

export default async function CannedResponsesPage() {
  // Server-side plugin access check (5-layer protection)
  const access = await verifyPluginAccess("livesupport-pro");

  if (!access.allowed) {
    redirect("/admin/settings/plugins?activate=livesupport-pro");
  }

  return (
    <CannedResponsesClient
      pluginName={access.pluginName}
      tier={access.tier}
      features={access.features}
    />
  );
}
