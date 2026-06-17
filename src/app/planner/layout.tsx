import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";


export const metadata = {
  title: "My Event Projects | Ceremoney Event Planner",
};

export default async function PlannerRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user?.role === "VENDOR") redirect("/vendor/dashboard");

  return <SessionProvider>{children}</SessionProvider>;
}
