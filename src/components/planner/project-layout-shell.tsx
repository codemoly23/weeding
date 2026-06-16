"use client";

import { useState, useEffect } from "react";
import { PlannerSidebar } from "@/components/planner/sidebar";
import { PlannerHeader } from "@/components/planner/header";
import { AnonymousBanner } from "@/components/planner/anonymous-banner";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { getLocalProject } from "@/lib/planner-storage";
import { PlannerProvider } from "@/lib/planner-context";

export function PlannerProjectLayoutShell({
  children,
  projectId,
}: {
  children: React.ReactNode;
  projectId: string;
}) {
  const isLocal = projectId.startsWith("local-");

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState("Untitled");
  const [eventDate, setEventDate] = useState<string | null>(null);
  const [initialBride, setInitialBride] = useState("");
  const [initialGroom, setInitialGroom] = useState("");

  useEffect(() => {
    if (!projectId) return;

    if (isLocal) {
      const project = getLocalProject(projectId);
      const title = project?.title || "Untitled";
      setProjectTitle(title);
      setEventDate(project?.eventDate ?? null);
      setInitialBride(project?.brideName || "");
      setInitialGroom(project?.groomName || "");
      document.title = `${title} | Wedding Planner`;
      return;
    }

    async function fetchProject() {
      try {
        const res = await fetch(`/api/planner/projects/${projectId}`);
        if (res.ok) {
          const data = await res.json();
          const title = data.project?.title || "Untitled";
          setProjectTitle(title);
          setEventDate(data.project?.eventDate ?? null);
          setInitialBride(data.project?.brideName || "");
          setInitialGroom(data.project?.groomName || "");
          document.title = `${title} | Wedding Planner`;
        }
      } catch {}
    }
    fetchProject();
  }, [projectId, isLocal]);

  return (
    <PlannerProvider initialBrideName={initialBride} initialGroomName={initialGroom}>
      <div className="flex h-screen flex-col overflow-hidden bg-background">
        <AnonymousBanner projectId={projectId} />

        <div className="flex flex-1 overflow-hidden">
          <div className="hidden lg:block">
            <PlannerSidebar
              projectId={projectId}
              projectTitle={projectTitle}
              eventDate={eventDate}
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          </div>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">Planner Menu</SheetTitle>
              <PlannerSidebar
                projectId={projectId}
                projectTitle={projectTitle}
                eventDate={eventDate}
                mobile
                onToggle={() => setMobileMenuOpen(false)}
              />
            </SheetContent>
          </Sheet>

          <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
            <PlannerHeader onMenuClick={() => setMobileMenuOpen(true)} projectId={projectId} />
            <main id="main-content" className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6">{children}</main>
          </div>
        </div>
      </div>
    </PlannerProvider>
  );
}
