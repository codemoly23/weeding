import { TicketsPageClient } from "./tickets-client";

export const metadata = {
  title: "Support Tickets",
  description: "Manage customer support tickets",
};

export default async function TicketsPage() {
  return (
    <TicketsPageClient
      pluginName="Support"
      tier={null}
      features={["chat", "analytics", "ai-responses"]}
    />
  );
}
