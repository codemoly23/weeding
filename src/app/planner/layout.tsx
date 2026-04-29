import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "My Event Projects | Ceremoney Event Planner",
};

const ADMIN_ROLES = ["ADMIN", "SUPPORT_AGENT", "SALES_AGENT", "CONTENT_MANAGER"];

export default async function PlannerRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user?.role) {
    const role = session.user.role as string;
    if (ADMIN_ROLES.includes(role)) redirect("/admin");
    if (role === "VENDOR") redirect("/vendor/dashboard");
  }

  return <SessionProvider>{children}</SessionProvider>;
}
