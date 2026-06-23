"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  User,
  LogOut,
  Settings,
  Moon,
  Sun,
  Menu,
  ExternalLink,
  Package,
  MessageSquare,
  Store,
  TrendingUp,
  ShoppingCart,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useLogout } from "@/hooks/use-logout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { AdminSidebar } from "./sidebar";
import { LanguageSwitcher } from "@/components/layout/header/components/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n/language-context";

interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

const NOTIFICATION_ICONS: Record<string, React.ElementType> = {
  NEW_ORDER: ShoppingCart,
  NEW_VENDOR: Store,
  NEW_TICKET: MessageSquare,
  PAYMENT_RECEIVED: TrendingUp,
  PAYMENT_FAILED: AlertCircle,
  NEW_CUSTOMER: User,
  NEW_LEAD: Package,
};

function timeAgo(dateStr: string, t: (key: string, vars?: Record<string, string>) => string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t("common.time.justNow");
  if (mins < 60) return t("common.time.minutesAgo", { count: String(mins) });
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return t("common.time.hoursAgo", { count: String(hrs) });
  return t("common.time.daysAgo", { count: String(Math.floor(hrs / 24)) });
}

interface SearchResult {
  type: "order" | "customer";
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

export function AdminHeader() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isDark, setIsDark] = useState(false);
  const { logout } = useLogout({ userRole: "ADMIN" });
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  // Global search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Click outside to close search
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    try {
      const [ordersRes, customersRes] = await Promise.all([
        fetch(`/api/orders?search=${encodeURIComponent(query)}&limit=5`),
        fetch(`/api/admin/customers/search?q=${encodeURIComponent(query)}&limit=5`),
      ]);

      const results: SearchResult[] = [];

      if (ordersRes.ok) {
        const data = await ordersRes.json();
        (data.orders ?? []).forEach((o: { orderNumber: string; customerName: string; totalUSD: string }) => {
          results.push({
            type: "order",
            id: o.orderNumber,
            title: o.orderNumber,
            subtitle: `${o.customerName} — $${parseFloat(o.totalUSD).toFixed(0)}`,
            href: `/admin/orders/${o.orderNumber}`,
          });
        });
      }

      if (customersRes.ok) {
        const data = await customersRes.json();
        (data.customers ?? []).forEach((c: { id: string; name: string | null; email: string }) => {
          results.push({
            type: "customer",
            id: c.id,
            title: c.name || c.email,
            subtitle: c.email,
            href: `/admin/customers/${c.id}`,
          });
        });
      }

      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => handleSearch(value), 300);
  };

  const handleResultClick = (href: string) => {
    setShowResults(false);
    setSearchQuery("");
    router.push(href);
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      // silently ignore
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleOpen = async (value: boolean) => {
    setOpen(value);
    if (value && unreadCount > 0) {
      try {
        await fetch("/api/admin/notifications", { method: "PATCH" });
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      } catch {
        // silently ignore
      }
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("admin-theme");
    const shouldUseDark = savedTheme
      ? savedTheme === "dark"
      : document.documentElement.classList.contains("dark");

    document.documentElement.classList.toggle("dark", shouldUseDark);
    setIsDark(shouldUseDark);
  }, []);

  const toggleTheme = () => {
    const nextIsDark = !isDark;
    setIsDark(nextIsDark);
    document.documentElement.classList.toggle("dark", nextIsDark);
    localStorage.setItem("admin-theme", nextIsDark ? "dark" : "light");
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-[var(--admin-surface)] px-4 text-[var(--admin-text)] backdrop-blur lg:px-6" style={{ borderColor: "var(--admin-border)" }}>
      {/* Mobile Menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">{t("admin.header.navigationMenu")}</SheetTitle>
          <AdminSidebar mobile />
        </SheetContent>
      </Sheet>

      {/* Search */}
      <div className="hidden flex-1 md:block md:max-w-md" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("admin.header.searchPlaceholder")}
            className="pl-9"
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}

          {/* Results Dropdown */}
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-md border bg-[var(--admin-surface)] text-[var(--admin-text)] shadow-lg overflow-hidden" style={{ borderColor: "var(--admin-border)" }}>
              {searchResults.length === 0 && !isSearching ? (
                <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                  {t("admin.header.noResults")}
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {searchResults.some((r) => r.type === "order") && (
                    <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--admin-muted)] bg-[var(--admin-surface-muted)]">
                      {t("admin.nav.orders")}
                    </div>
                  )}
                  {searchResults
                    .filter((r) => r.type === "order")
                    .map((r) => (
                      <button
                        key={r.id}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[var(--admin-hover)]"
                        onClick={() => handleResultClick(r.href)}
                      >
                        <ShoppingCart className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{r.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{r.subtitle}</p>
                        </div>
                      </button>
                    ))}

                  {searchResults.some((r) => r.type === "customer") && (
                    <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--admin-muted)] bg-[var(--admin-surface-muted)]">
                      {t("admin.nav.customers")}
                    </div>
                  )}
                  {searchResults
                    .filter((r) => r.type === "customer")
                    .map((r) => (
                      <button
                        key={r.id}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[var(--admin-hover)]"
                        onClick={() => handleResultClick(r.href)}
                      >
                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{r.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{r.subtitle}</p>
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <LanguageSwitcher />

        {/* View Site */}
        <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
          <Link href="/" target="_blank">
            <ExternalLink className="mr-2 h-4 w-4" />
            {t("admin.header.viewSite")}
          </Link>
        </Button>

        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {/* Notifications */}
        <DropdownMenu open={open} onOpenChange={handleOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 justify-center rounded-full p-0 text-xs bg-blue-100 text-blue-700 border-0">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)]">
            <DropdownMenuLabel className="flex items-center justify-between">
              {t("admin.header.notifications")}
              {unreadCount > 0 && (
                <Badge variant="secondary">{t("admin.header.newCount", { count: String(unreadCount) })}</Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                {t("admin.header.noNotifications")}
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = NOTIFICATION_ICONS[n.type] ?? Bell;
                const item = (
                  <div className="flex items-start gap-3 w-full">
                    <div className={`mt-0.5 rounded-lg p-1.5 shrink-0 ${n.isRead ? "bg-gray-100 text-gray-500" : "bg-blue-100 text-blue-600"}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium leading-snug ${!n.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {timeAgo(n.createdAt, t)}
                      </p>
                    </div>
                    {!n.isRead && (
                      <span className="h-2 w-2 rounded-full bg-purple-600 shrink-0 mt-1" />
                    )}
                  </div>
                );
                return n.link ? (
                  <DropdownMenuItem key={n.id} asChild className="p-3 cursor-pointer">
                    <Link href={n.link}>{item}</Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem key={n.id} className="p-3">
                    {item}
                  </DropdownMenuItem>
                );
              })
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="justify-center">
              <Link href="/admin/notifications">{t("admin.header.viewAllNotifications")}</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-purple-600 text-white">
                  AD
                </AvatarFallback>
              </Avatar>
              <span className="hidden font-medium sm:inline">Admin</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-muted-foreground">admin@ceremoney.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/profile">
                <User className="mr-2 h-4 w-4" />
                {t("common.profile")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/settings">
                <Settings className="mr-2 h-4 w-4" />
                {t("common.settings")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              {t("common.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
