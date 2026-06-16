import { CannedResponsesClient } from "./canned-responses-client";

export const metadata = {
  title: "Canned Responses",
  description: "Manage pre-written response templates",
};

export default async function CannedResponsesPage() {
  return (
    <CannedResponsesClient
      pluginName="Support"
      tier={null}
      features={["chat", "analytics", "ai-responses"]}
    />
  );
}
