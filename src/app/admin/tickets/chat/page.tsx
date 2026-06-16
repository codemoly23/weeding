import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LiveChatDashboardClient } from "./live-chat-client";

export const metadata = {
  title: "Live Chat Dashboard",
  description: "Real-time customer chat support",
};

export default async function LiveChatPage() {
  // Get current user session
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <LiveChatDashboardClient
      pluginName="Support"
      tier={null}
      features={["chat", "analytics", "ai-responses"]}
      hasChatFeature={true}
      currentUser={{
        id: session.user.id,
        name: session.user.name || "Agent",
        role: session.user.role || "ADMIN",
      }}
    />
  );
}
