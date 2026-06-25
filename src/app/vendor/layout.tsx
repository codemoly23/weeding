"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  User,
  MessageSquare,
  Star,
  Settings,
  LogOut,
  Menu,
  X,
  Store,
  ChevronRight,
  CreditCard,
  Inbox,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { LanguageSwitcher } from "@/components/layout/header/components/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n/language-context";
import { DashboardThemeToggle } from "@/components/theme/dashboard-theme-toggle";
import { useDashboardTheme } from "@/hooks/use-dashboard-theme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const NAV_ITEMS = [
  { href: "/vendor/dashboard", labelKey: "common.dashboard", icon: LayoutDashboard },
  { href: "/vendor/profile", labelKey: "vendor.nav.myProfile", icon: User },
  { href: "/vendor/messages", labelKey: "vendor.nav.messages", icon: Inbox, badge: true },
  { href: "/vendor/inquiries", labelKey: "vendor.nav.inquiries", icon: MessageSquare },
  { href: "/vendor/reviews", labelKey: "vendor.nav.reviews", icon: Star },
  { href: "/vendor/billing", labelKey: "vendor.nav.planBilling", icon: CreditCard },
  { href: "/vendor/settings", labelKey: "common.settings", icon: Settings },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const { isDark, toggleTheme } = useDashboardTheme("vendor-theme");

  // Fetch vendor profile (business name) once on mount
  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "VENDOR") return;
    fetch("/api/vendor/profile")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.profile?.businessName) setBusinessName(d.profile.businessName); })
      .catch(() => {});
  }, [status, session?.user?.role]);

  const fetchUnread = useCallback(async () => {
    if (status !== "authenticated" || session?.user?.role !== "VENDOR") return;
    try {
      const res = await fetch("/api/vendor/conversations/unread-count");
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count ?? 0);
      }
    } catch {
      // silently ignore
    }
  }, [status, session?.user?.role]);

  // Fetch unread message count every 30s
  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "VENDOR") return;
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  // Don't apply layout to register page
  if (pathname === "/vendor/register") {
    return <>{children}</>;
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className={`vendor-layout min-h-screen bg-background flex ${isDark ? "theme-dark" : ""}`}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-card border-r border-primary/10 z-30 flex flex-col transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-primary/10">
          <Link href="/vendor/dashboard" className="flex items-center">
            <span className="font-semibold text-foreground text-sm">{t("vendor.portal")}</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded text-muted-foreground/70 hover:text-foreground/80"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Business name */}
        {(businessName || session?.user?.name) && (
          <div className="px-5 py-3 border-b border-primary/10">
            <p className="text-xs text-muted-foreground/70 uppercase tracking-wide font-medium">{t("vendor.loggedInAs")}</p>
            <p className="text-sm font-medium text-foreground truncate mt-0.5">
              {businessName || session?.user?.name}
            </p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ href, labelKey, icon: Icon, badge }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            const showBadge = badge && unreadCount > 0 && !active;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${active
                    ? "bg-primary/5 text-primary"
                    : "text-foreground/80 hover:bg-muted/30 hover:text-foreground"
                  }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {t(labelKey)}
                {showBadge && (
                  <span className="ml-auto bg-primary text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
                {active && !showBadge && <ChevronRight className="w-3.5 h-3.5 ml-auto text-primary/60" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-primary/10 space-y-0.5">
          <Link
            href="/vendors"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-colors"
          >
            <Store className="w-4 h-4 shrink-0" />
            {t("vendor.viewPublicListing")}
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-[var(--color-error-bg)] hover:text-[var(--color-error-text)] transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {t("common.signOut")}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 bg-card border-b border-primary/10 px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-foreground text-sm lg:hidden">{t("vendor.portal")}</span>

          <div className="ml-auto flex items-center gap-3">
            <LanguageSwitcher />
            <DashboardThemeToggle isDark={isDark} onToggle={toggleTheme} />
            {unreadCount > 0 && (
              <Link href="/vendor/messages">
                <span className="bg-primary text-white text-xs font-bold rounded-full px-2 py-0.5">
                  {t("admin.header.newCount", { count: String(unreadCount) })}
                </span>
              </Link>
            )}

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/40 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {(businessName || session?.user?.name || "V")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium text-foreground max-w-[120px] truncate">
                    {businessName || session?.user?.name || t("vendor.portal")}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium truncate">
                      {businessName || session?.user?.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {session?.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/vendor/profile">
                    <User className="mr-2 h-4 w-4" />
                    {t("common.profile")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/vendor/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    {t("common.settings")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("common.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main id="main-content" className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
