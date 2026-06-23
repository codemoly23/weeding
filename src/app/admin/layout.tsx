import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import "@/styles/admin-tokens.css";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-layout flex h-screen overflow-hidden">
      {/* Sidebar - hidden on mobile, shown via sheet */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main id="main-content" className="flex-1 overflow-y-auto bg-[var(--admin-bg)] p-6 lg:px-12 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
