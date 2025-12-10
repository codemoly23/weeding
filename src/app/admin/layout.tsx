import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar - hidden on mobile, shown via sheet */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
