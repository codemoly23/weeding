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

  return (
    <TicketDetailClient
      ticketId={id}
      pluginName="Support"
      tier={null}
      features={["chat", "analytics", "ai-responses"]}
    />
  );
}
