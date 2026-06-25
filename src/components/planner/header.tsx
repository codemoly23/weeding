"use client";

import Link from "next/link";
import { Menu, Search, Plus, LogOut, User, FolderOpen, LogIn, Store } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/use-logout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLanguage } from "@/lib/i18n/language-context";
import { LanguageSwitcher } from "@/components/layout/header/components/LanguageSwitcher";
import { DashboardThemeToggle } from "@/components/theme/dashboard-theme-toggle";

interface PlannerHeaderProps {
  onMenuClick?: () => void;
  projectId?: string;
  isDark?: boolean;
  onThemeToggle?: () => void;
}

export function PlannerHeader({
  onMenuClick,
  projectId,
  isDark = false,
  onThemeToggle,
}: PlannerHeaderProps) {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const isLoggedIn = !!session?.user?.id;

  const loginUrl = projectId?.startsWith("local-")
    ? `/login?callbackUrl=${encodeURIComponent(`/planner/sync?from=${projectId}`)}`
    : projectId
    ? `/login?callbackUrl=${encodeURIComponent(`/planner/${projectId}`)}`
    : "/login";

  const userName = session?.user?.name || "";
  const userEmail = session?.user?.email || "";
  const userInitials = userName
    ? userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const { logout } = useLogout({ userRole: "CUSTOMER" });

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden text-foreground/80" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden md:block">
          <Link href="/vendors">
            <button className="flex items-center gap-2 w-64 px-4 py-2 rounded-full border border-border bg-muted/50 text-sm text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-colors text-left">
              <Search className="h-4 w-4 shrink-0" />
              <span>Find vendor or venue</span>
              <Store className="h-4 w-4 ml-auto shrink-0 text-muted-foreground/40" />
            </button>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        {onThemeToggle && (
          <DashboardThemeToggle isDark={isDark} onToggle={onThemeToggle} />
        )}

        <Link href="/planner">
          <Button variant="ghost" size="sm" className="gap-2 text-foreground/80 hover:text-foreground hover:bg-muted/50">
            <FolderOpen className="h-4 w-4" />
            <span className="hidden sm:inline">{t("planner.header.myProjects")}</span>
          </Button>
        </Link>

        <Link href="/planner/create">
          <Button variant="ghost" size="icon" className="text-foreground/80 hover:text-foreground hover:bg-muted/50">
            <Plus className="h-5 w-5" />
          </Button>
        </Link>

        {!isLoggedIn && (
          <Link href={loginUrl}>
            <Button size="sm" className="gap-1.5 border-0 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">{t("common.signIn")}</span>
            </Button>
          </Link>
        )}

        {isLoggedIn && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2 hover:bg-muted/50">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium md:inline-block text-foreground">{userName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{userName}</span>
                  <span className="text-xs font-normal text-muted-foreground">{userEmail}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/planner" className="flex cursor-pointer items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  {t("planner.header.myProjects")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="flex cursor-pointer items-center gap-2">
                  <User className="h-4 w-4" />
                  {t("planner.header.profileSettings")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                {t("common.signOut")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
