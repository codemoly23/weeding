"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  FileText,
  MessageSquare,
  Tag,
  MapPin,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Receipt,
  UserCog,
  Palette,
  Puzzle,
  Target,
  Paintbrush,
  Database,
  CalendarHeart,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { useBusinessConfig } from "@/hooks/use-business-config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  title: string;
  labelKey?: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  children?: { title: string; labelKey?: string; href: string; external?: boolean }[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    labelKey: "admin.nav.dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Orders",
    labelKey: "admin.nav.orders",
    href: "/admin/orders",
    icon: Package,
  },
  {
    title: "Customers",
    labelKey: "admin.nav.customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    title: "Content",
    labelKey: "admin.nav.content",
    icon: FileText,
    children: [
      { title: "Blog", labelKey: "admin.nav.blog", href: "/admin/content/blog" },
      { title: "Blog Categories", labelKey: "admin.nav.blogCategories", href: "/admin/content/blog-categories" },
      { title: "Testimonials", labelKey: "admin.nav.testimonials", href: "/admin/content/testimonials" },
      { title: "FAQs", labelKey: "admin.nav.faqs", href: "/admin/content/faq" },
      { title: "Ticker", labelKey: "admin.nav.ticker", href: "/admin/content/ticker" },
      { title: "Legal Pages", labelKey: "admin.nav.legalPages", href: "/admin/content/legal" },
    ],
  },
  {
    title: "Service Location",
    labelKey: "admin.nav.serviceLocation",
    href: "/admin/service-locations",
    icon: MapPin,
  },
  {
    title: "Venues",
    labelKey: "admin.nav.venues",
    href: "/admin/venues",
    icon: Building2,
  },
  {
    title: "Users",
    labelKey: "admin.nav.users",
    href: "/admin/users",
    icon: UserCog,
  },
  {
    title: "Wedding Projects",
    labelKey: "admin.nav.weddingProjects",
    icon: CalendarHeart,
    children: [
      { title: "All Projects", labelKey: "admin.nav.allProjects", href: "/admin/planner" },
      { title: "Manage Vendors", labelKey: "admin.nav.manageVendors", href: "/admin/vendors" },
      { title: "Vendor Reviews", labelKey: "admin.nav.vendorReviews", href: "/admin/vendors/reviews" },
      { title: "View All Vendors", labelKey: "admin.nav.viewAllVendors", href: "/vendors", external: true },
    ],
  },
  {
    title: "Tickets",
    labelKey: "admin.nav.tickets",
    href: "/admin/tickets",
    icon: MessageSquare,
  },
  {
    title: "Appearance",
    labelKey: "admin.nav.appearance",
    icon: Palette,
    children: [
      { title: "Page Builder", labelKey: "admin.nav.pageBuilder", href: "/admin/appearance/pages" },
      { title: "Header Builder", labelKey: "admin.nav.headerBuilder", href: "/admin/appearance/header" },
      { title: "Menu Builder", labelKey: "admin.nav.menuBuilder", href: "/admin/appearance/header/menu" },
      { title: "Footer Builder", labelKey: "admin.nav.footerBuilder", href: "/admin/appearance/footer" },
      { title: "Theme Gallery", labelKey: "admin.nav.themeGallery", href: "/admin/appearance/themes" },
      { title: "Website Templates", href: "/admin/appearance/wedding-templates" },
    ],
  },
  {
    title: "Settings",
    labelKey: "admin.nav.settings",
    icon: Settings,
    children: [
      { title: "General", labelKey: "admin.nav.general", href: "/admin/settings" },
      { title: "Media Storage", labelKey: "admin.nav.mediaStorage", href: "/admin/settings/media-storage" },
      { title: "Payments", labelKey: "admin.nav.payments", href: "/admin/settings/payments" },
      { title: "Email", labelKey: "admin.nav.email", href: "/admin/settings/email" },
      { title: "Plugins", labelKey: "admin.nav.plugins", href: "/admin/settings/plugins" },
      { title: "Data Management", labelKey: "admin.nav.dataManagement", href: "/admin/settings/data" },
      { title: "Profile", labelKey: "admin.nav.profile", href: "/admin/profile" },
    ],
  },
];

// Plugin menu item interface
interface PluginMenuItem {
  id: string;
  label: string;
  path: string;
  icon: string | null;
  parentLabel: string | null;
  sortOrder: number;
}

interface PluginWithMenuItems {
  id: string;
  slug: string;
  name: string;
  adminMenuLabel: string | null;
  adminMenuIcon: string | null;
  adminMenuPosition: number | null;
  menuItems: PluginMenuItem[];
}

// Icon mapping for dynamic plugin icons
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  FileText,
  MessageSquare,
  Tag,
  MapPin,
  Receipt,
  UserCog,
  Palette,
  Puzzle,
  Target,
  Paintbrush,
  Database,
  CalendarHeart,
  Building2,
};

export function AdminSidebar({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { config } = useBusinessConfig();
  const [mounted, setMounted] = useState(false); // Prevent transition flash on initial load
  const [collapsed, setCollapsed] = useState(false); // Expanded by default
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [closedItems, setClosedItems] = useState<string[]>([]); // Track manually closed items
  const [pluginMenuItems, setPluginMenuItems] = useState<NavItem[]>([]);

  // Page builder pages always start collapsed for maximum workspace
  const isPageBuilder = pathname === "/admin/appearance/landing-page" ||
                        pathname?.startsWith("/admin/appearance/pages/");

  // Fetch active plugins with menu items
  useEffect(() => {
    async function fetchPlugins() {
      try {
        const res = await fetch("/api/admin/plugins?status=ACTIVE&includeMenuItems=true");
        if (res.ok) {
          const data = await res.json();
          const plugins: PluginWithMenuItems[] = data.plugins || [];

          // Convert plugins to NavItems
          const items: NavItem[] = plugins
            .filter((plugin) => plugin.menuItems.length > 0)
            .map((plugin) => {
              const IconComponent = plugin.adminMenuIcon
                ? iconMap[plugin.adminMenuIcon] || Puzzle
                : Puzzle;

              return {
                title: plugin.adminMenuLabel || plugin.name,
                icon: IconComponent,
                children: plugin.menuItems.map((item) => ({
                  title: item.label,
                  href: item.path,
                })),
              };
            });

          setPluginMenuItems(items);
        }
      } catch (error) {
        console.error("Error fetching plugin menu items:", error);
      }
    }

    fetchPlugins();
  }, []);

  useEffect(() => {
    if (mobile) {
      setCollapsed(false);
    } else if (isPageBuilder) {
      setCollapsed(true);
    } else {
      const saved = localStorage.getItem("admin-sidebar-collapsed");
      setCollapsed(saved === "true");
    }
    setMounted(true);
  }, [isPageBuilder, mobile]);

  // Combine static nav items with plugin menu items
  // Insert plugin items before Appearance and Settings (last 2 items)
  const allNavItems = [...navItems.slice(0, -2), ...pluginMenuItems, ...navItems.slice(-2)];
  const labelFor = (item: { title: string; labelKey?: string }) => item.labelKey ? t(item.labelKey) : item.title;

  const handleCollapsedChange = (value: boolean) => {
    setCollapsed(value);
    // Only save preference for non-page-builder pages
    if (!isPageBuilder) {
      localStorage.setItem("admin-sidebar-collapsed", String(value));
    }
  };

  const toggleItem = (title: string) => {
    // If item is in closedItems, remove it (opening)
    if (closedItems.includes(title)) {
      setClosedItems((prev) => prev.filter((item) => item !== title));
      setOpenItems((prev) => [...prev, title]);
    } else if (openItems.includes(title)) {
      // If in openItems, close it
      setOpenItems((prev) => prev.filter((item) => item !== title));
      setClosedItems((prev) => [...prev, title]);
    } else {
      // If not in either, check if child is active
      // If child is active, add to closedItems to close it
      // Otherwise add to openItems to open it
      const navItem = [...navItems, ...pluginMenuItems].find((i) => i.title === title);
      if (navItem?.children && isChildActive(navItem.children)) {
        setClosedItems((prev) => [...prev, title]);
      } else {
        setOpenItems((prev) => [...prev, title]);
      }
    }
  };

  // Determine the single best-matching href across all nav items (top-level + children).
  // The deepest (longest) href that prefixes the current path wins, so a detail page
  // like /admin/orders/123 highlights "Orders" without double-highlighting overlapping
  // siblings (e.g. /admin/vendors vs /admin/vendors/reviews).
  const allHrefs: string[] = [];
  allNavItems.forEach((item) => {
    if (item.href) allHrefs.push(item.href);
    item.children?.forEach((child) => allHrefs.push(child.href));
  });
  const activeHref = allHrefs
    .filter((href) => pathname === href || pathname.startsWith(href + "/"))
    .sort((a, b) => b.length - a.length)[0];

  const isActive = (href: string) => href === activeHref;

  const isChildActive = (children: { href: string }[]) => {
    return children.some((child) => isActive(child.href));
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex h-screen flex-col border-r bg-[var(--admin-surface)] text-[var(--admin-text)]",
          mounted && "transition-all duration-300", // Only animate after initial load
          collapsed ? "w-16" : "w-64"
        )}
        style={{ borderColor: "var(--admin-border)" }}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4" style={{ borderColor: "var(--admin-border)" }}>
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-2">
              {config.logo.url && (
                <Image
                  src={config.logo.url}
                  alt={config.name}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-lg object-contain"
                />
              )}
              <span className="font-bold">{config.name} Admin</span>
            </Link>
          )}
          {!mobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCollapsedChange(!collapsed)}
              className={cn(collapsed && "mx-auto")}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-2">
          {allNavItems.map((item) => {
            const Icon = item.icon;

            if (item.children) {
              const isOpen = (openItems.includes(item.title) || isChildActive(item.children)) && !closedItems.includes(item.title);

              if (collapsed) {
                return (
                  <Tooltip key={item.title}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-center text-[var(--admin-muted)] hover:bg-[var(--admin-hover)] hover:text-[var(--admin-text)]",
                          isChildActive(item.children) && "bg-[var(--admin-active-bg)] text-[var(--admin-active-text)]"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="flex flex-col gap-1">
                      <p className="font-medium">{labelFor(item)}</p>
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          target={child.external ? "_blank" : undefined}
                          rel={child.external ? "noopener noreferrer" : undefined}
                          className={cn(
                            "text-sm hover:text-[var(--admin-active-text)]",
                            isActive(child.href) && "text-[var(--admin-active-text)]"
                          )}
                        >
                          {labelFor(child)}
                        </Link>
                      ))}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Collapsible
                  key={item.title}
                  open={isOpen}
                  onOpenChange={() => toggleItem(item.title)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-between text-[var(--admin-muted)] hover:bg-[var(--admin-hover)] hover:text-[var(--admin-text)]",
                        isChildActive(item.children) && "bg-[var(--admin-active-bg)] text-[var(--admin-active-text)]"
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        {labelFor(item)}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isOpen && "rotate-180"
                        )}
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 pl-9 pt-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        target={child.external ? "_blank" : undefined}
                        rel={child.external ? "noopener noreferrer" : undefined}
                        onClick={() => { if (!child.external) onNavigate?.(); }}
                        className={cn(
                          "block rounded-md px-3 py-2 text-sm text-[var(--admin-muted)] hover:bg-[var(--admin-hover)] hover:text-[var(--admin-text)]",
                          isActive(child.href) &&
                            "bg-[var(--admin-active-bg)] font-medium text-[var(--admin-active-text)]"
                        )}
                      >
                        {labelFor(child)}
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              );
            }

            if (collapsed) {
              return (
                <Tooltip key={item.title}>
                  <TooltipTrigger asChild>
                    <Link href={item.href!}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "relative w-full justify-center text-[var(--admin-muted)] hover:bg-[var(--admin-hover)] hover:text-[var(--admin-text)]",
                          isActive(item.href!) && "bg-[var(--admin-active-bg)] text-[var(--admin-active-text)]"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {item.badge && (
                          <Badge className="absolute -right-1 -top-1 h-5 w-5 justify-center rounded-full p-0 text-xs bg-blue-100 text-blue-700 border-0">
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{labelFor(item)}</TooltipContent>
                </Tooltip>
              );
            }

            return (
              <Link key={item.title} href={item.href!} onClick={() => onNavigate?.()}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 text-[var(--admin-muted)] hover:bg-[var(--admin-hover)] hover:text-[var(--admin-text)]",
                    isActive(item.href!) && "bg-[var(--admin-active-bg)] text-[var(--admin-active-text)]"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {labelFor(item)}
                  {item.badge && (
                    <Badge className="ml-auto bg-blue-100 text-blue-700 border-0">{item.badge}</Badge>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="border-t p-4" style={{ borderColor: "var(--admin-border)" }}>
            <p className="text-xs text-[var(--admin-muted)]">
              {config.name} Admin v1.0
            </p>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}
