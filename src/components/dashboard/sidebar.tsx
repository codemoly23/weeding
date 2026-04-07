"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  User,
  LogOut,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Menu,
  CalendarHeart,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { useBusinessConfig } from "@/hooks/use-business-config";
import { useLogout } from "@/hooks/use-logout";
import { getAllLocalProjects } from "@/lib/planner-storage";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  mobile?: boolean;
}

interface Project {
  id: string;
  title: string;
  isLocal?: boolean;
}

export function DashboardSidebar({
  collapsed = false,
  onToggle,
  mobile = false,
}: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { config } = useBusinessConfig();
  const { logout } = useLogout({ userRole: "CUSTOMER" });
  const firstLetter = (config.logo.text || config.name.charAt(0)).toUpperCase();

  const [projectsOpen, setProjectsOpen] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Fetch DB projects
    async function fetchProjects() {
      try {
        const res = await fetch("/api/planner/projects");
        if (res.ok) {
          const data = await res.json();
          const dbProjects: Project[] = (data.projects ?? []).map((p: { id: string; title: string }) => ({
            id: p.id,
            title: p.title || "Untitled",
          }));
          // Merge with local projects
          const localProjects: Project[] = getAllLocalProjects().map((p) => ({
            id: p.id,
            title: p.title || "Untitled",
            isLocal: true,
          }));
          setProjects([...dbProjects, ...localProjects]);
        }
      } catch {
        // If not authenticated, only show local
        const localProjects: Project[] = getAllLocalProjects().map((p) => ({
          id: p.id,
          title: p.title || "Untitled",
          isLocal: true,
        }));
        setProjects(localProjects);
      }
    }
    fetchProjects();
  }, []);

  const topNav = [
    { name: t("dash.overview"), href: "/dashboard", icon: LayoutDashboard },
    { name: t("common.profile"), href: "/dashboard/profile", icon: User },
  ];

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        mobile && "w-64"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="font-bold text-primary-foreground">{firstLetter}</span>
            </div>
            <span className="font-bold">{config.name}</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="mx-auto">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="font-bold text-primary-foreground">{firstLetter}</span>
            </div>
          </Link>
        )}
        {!mobile && onToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn("shrink-0", collapsed && "mx-auto")}
          >
            {collapsed ? (
              <Menu className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {/* Top nav items */}
        {topNav.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}

        {/* Wedding Projects section */}
        <div className="pt-1">
          {collapsed ? (
            <Link
              href="/planner"
              className={cn(
                "flex items-center justify-center rounded-lg px-2 py-2 text-sm font-medium transition-colors",
                pathname.startsWith("/planner")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              title={t("dash.weddingProjects")}
            >
              <CalendarHeart className="h-5 w-5 shrink-0" />
            </Link>
          ) : (
            <>
              {/* Section header */}
              <button
                onClick={() => setProjectsOpen((o) => !o)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <CalendarHeart className="h-5 w-5 shrink-0" />
                <span className="flex-1 text-left">{t("dash.weddingProjects")}</span>
                {projectsOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {/* Project list */}
              {projectsOpen && (
                <div className="ml-4 mt-0.5 space-y-0.5 border-l border-border pl-3">
                  {projects.map((project) => {
                    const href = `/planner/${project.id}`;
                    const isActive = pathname.startsWith(href);
                    return (
                      <Link
                        key={project.id}
                        href={href}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <span className="truncate">{project.title}</span>
                        {project.isLocal && (
                          <span className="ml-auto shrink-0 rounded text-[10px] text-amber-500">●</span>
                        )}
                      </Link>
                    );
                  })}

                  {/* Create new */}
                  <Link
                    href="/planner/create"
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Plus className="h-3.5 w-3.5 shrink-0" />
                    <span>New project</span>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </nav>

      {/* Footer — Sign Out */}
      <div className="border-t p-2">
        <button
          onClick={logout}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? t("common.signOut") : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>{t("common.signOut")}</span>}
        </button>
      </div>
    </aside>
  );
}
