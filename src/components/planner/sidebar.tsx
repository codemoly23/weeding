"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Church,
  UtensilsCrossed,
  Store,
  Globe,
  CheckSquare,
  DollarSign,
  CalendarClock,
  Armchair,
  StickyNote,
  PartyPopper,
  Settings,
  ChevronLeft,
  ChevronDown,
  Menu,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { UpgradeModal } from "./upgrade-modal";
import { usePlannerTier } from "@/hooks/use-planner-tier";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  label: string;
  children: NavItem[];
}

type NavEntry = NavItem | NavGroup;

function isGroup(entry: NavEntry): entry is NavGroup {
  return "label" in entry;
}

function getNavigation(projectId: string, t: (key: string) => string): NavEntry[] {
  const base = `/planner/${projectId}`;
  return [
    { name: t("planner.nav.overview"), href: base, icon: LayoutDashboard },
    { name: t("planner.nav.guestList"), href: `${base}/guests`, icon: Users },
    {
      label: t("planner.nav.venuesVendors"),
      children: [
        { name: t("planner.nav.ceremony"), href: `${base}/ceremony`, icon: Church },
        { name: t("planner.nav.reception"), href: `${base}/reception`, icon: UtensilsCrossed },
        { name: t("planner.nav.allVendors"), href: `${base}/vendors`, icon: Store },
      ],
    },
    {
      label: t("planner.nav.planningTools"),
      children: [
        { name: t("planner.nav.website"), href: `${base}/website`, icon: Globe },
        { name: t("planner.nav.checklist"), href: `${base}/checklist`, icon: CheckSquare },
        { name: t("planner.nav.budget"), href: `${base}/budget`, icon: DollarSign },
        { name: t("planner.nav.itinerary"), href: `${base}/itinerary`, icon: CalendarClock },
        { name: t("planner.nav.seating"), href: `${base}/seating`, icon: Armchair },
        { name: t("planner.nav.notes"), href: `${base}/notes`, icon: StickyNote },
      ],
    },
    { name: t("planner.nav.postWedding"), href: `${base}/post-wedding`, icon: PartyPopper },
    { name: t("planner.nav.settings"), href: `${base}/settings`, icon: Settings },
  ];
}

interface SidebarProps {
  projectId: string;
  projectTitle?: string;
  eventDate?: string | null;
  collapsed?: boolean;
  onToggle?: () => void;
  mobile?: boolean;
}

function SidebarInner({
  projectId,
  projectTitle,
  eventDate,
  collapsed,
  onToggle,
  mobile,
}: Required<SidebarProps>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const src = searchParams.get("src"); // "ceremony" | "reception" when coming from venue pages
  const { t } = useLanguage();
  const [closedGroups, setClosedGroups] = useState<string[]>([]);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [hiddenTabs, setHiddenTabs] = useState<string[]>([]);
  const { tier } = usePlannerTier(projectId);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`planner-hidden-tabs-${projectId}`);
      if (stored) setHiddenTabs(JSON.parse(stored));
    } catch { /* ignore */ }
  }, [projectId]);

  function tabIdFromHref(href: string): string {
    const base = `/planner/${projectId}`;
    if (href === base) return "overview";
    return href.replace(`${base}/`, "").split("/")[0];
  }

  function isTabVisible(href: string): boolean {
    const id = tabIdFromHref(href);
    if (id === "overview" || id === "settings") return true;
    return !hiddenTabs.includes(id);
  }

  const navigation = getNavigation(projectId, t);

  const isActive = (href: string) => {
    const base = `/planner/${projectId}`;
    if (href === base) return pathname === base;
    const seatingHref = `${base}/seating`;
    // When navigating from ceremony/reception "plan venue layout", keep those items highlighted
    if (src === "ceremony" && href === `${base}/ceremony` && pathname.startsWith(seatingHref)) return true;
    if (src === "reception" && href === `${base}/reception` && pathname.startsWith(seatingHref)) return true;
    if (href === seatingHref && (src === "ceremony" || src === "reception")) return false;
    return pathname.startsWith(href);
  };

  const toggleGroup = (label: string) => {
    setClosedGroups((prev) =>
      prev.includes(label)
        ? prev.filter((g) => g !== label)
        : [...prev, label]
    );
  };

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
          active
            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
            : "text-foreground/80 hover:bg-muted/50 hover:text-foreground",
          collapsed && "justify-center px-2"
        )}
        title={collapsed ? item.name : undefined}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && <span>{item.name}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        mobile && "w-64"
      )}
    >
      {/* Header — Project Title */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <Link href="/planner" className="flex items-center gap-2 min-w-0">
            <div className="min-w-0">
              <p className="truncate font-semibold text-sm text-slate-700 leading-tight">{projectTitle}</p>
              {eventDate && (
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground leading-tight mt-0.5">
                  {new Date(eventDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }).toUpperCase()}
                </p>
              )}
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
        {navigation.map((entry) => {
          if (isGroup(entry)) {
            const visibleChildren = entry.children.filter((c) => isTabVisible(c.href));
            if (visibleChildren.length === 0) return null;
            const open = !closedGroups.includes(entry.label);

            if (collapsed) {
              return (
                <div key={entry.label} className="space-y-1 pt-2">
                  {visibleChildren.map(renderNavItem)}
                </div>
              );
            }

            return (
              <Collapsible
                key={entry.label}
                open={open}
                onOpenChange={() => toggleGroup(entry.label)}
              >
                <CollapsibleTrigger asChild>
                  <button className="flex w-full items-center justify-between px-3 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground/80">
                    <span>{entry.label}</span>
                    <ChevronDown
                      className={cn(
                        "h-3 w-3 transition-transform",
                        open && "rotate-180"
                      )}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1">
                  {visibleChildren.map(renderNavItem)}
                </CollapsibleContent>
              </Collapsible>
            );
          }

          if (!isTabVisible(entry.href)) return null;
          return renderNavItem(entry);
        })}
      </nav>

      {/* Upgrade button — hidden for Elite users */}
      {tier !== "elite" && (
        <div className="border-t border-border p-2">
          <button
            onClick={() => setUpgradeOpen(true)}
            className={cn(
              "w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 bg-accent/5 text-accent hover:bg-accent/10 border border-accent/20",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? (tier === "premium" ? "Upgrade to Elite" : "Upgrade to Premium") : undefined}
          >
            <Star className="h-4 w-4 shrink-0 text-accent" />
            {!collapsed && (
              <span>{tier === "premium" ? "Upgrade to Elite" : "Upgrade to Premium"}</span>
            )}
          </button>
        </div>
      )}

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        defaultTab={tier === "premium" ? "elite" : "premium"}
      />
    </aside>
  );
}

export function PlannerSidebar(props: SidebarProps) {
  return (
    <Suspense fallback={null}>
      <SidebarInner
        projectId={props.projectId}
        projectTitle={props.projectTitle ?? "Untitled"}
        eventDate={props.eventDate ?? null}
        collapsed={props.collapsed ?? false}
        onToggle={props.onToggle ?? (() => {})}
        mobile={props.mobile ?? false}
      />
    </Suspense>
  );
}
