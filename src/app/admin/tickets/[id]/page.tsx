import { verifyPluginAccess } from "@/lib/plugin-guard";
import { redirect } from "next/navigation";
import { TicketDetailClient } from "./ticket-detail-client";

export const metadata = {
  title: "Ticket Details",
  description: "View and manage support ticket",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TicketDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Server-side plugin access check (5-layer protection)
  const access = await verifyPluginAccess("livesupport-pro");

  if (!access.allowed) {
    // Plugin not active - redirect to plugins settings
    redirect("/admin/settings/plugins?activate=livesupport-pro");
  }

  return (
    <TicketDetailClient
      ticketId={id}
      pluginName={access.pluginName}
      tier={access.tier}
      features={access.features}
    />
  );
}
