"use client";

import { useState, useEffect, useLayoutEffect, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useBusinessConfig } from "@/hooks/use-business-config";
import { useHeaderConfig, getMegaMenuCategories, getAllMegaMenuCategories, getMainNavigation } from "@/hooks/use-header-config";
import { useScrollTransparency } from "./hooks/useScrollTransparency";
import { useLanguage } from "@/lib/i18n/language-context";
import { resolveLocalized } from "@/lib/i18n/localized";
import { TopBar } from "./components/TopBar";
import { HeaderDefault } from "./layouts/HeaderDefault";
import { HeaderCentered } from "./layouts/HeaderCentered";
import { HeaderSplit } from "./layouts/HeaderSplit";
import { HeaderMinimal } from "./layouts/HeaderMinimal";
import { HeaderMega } from "./layouts/HeaderMega";
import type { LoggedInUser, NavigationItem, ServiceCategory } from "./types";

// SSR-safe layout effect — runs before paint on client, falls back to effect on server
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Fallback data when API fails - generic, no service-specific links
const fallbackServiceCategories: ServiceCategory[] = [];

const fallbackNavigation: NavigationItem[] = [
  { name: "Home", href: "/", hasDropdown: false },
  { name: "Services", href: "/services", hasDropdown: true },
  { name: "Pricing", href: "/pricing", hasDropdown: false },
  { name: "Blog", href: "/blog", hasDropdown: false },
  {
    name: "Company",
    href: "#",
    hasDropdown: false,
    simpleDropdown: [
      { name: "About",             href: "/about",         icon: "Info" },
      { name: "Contact",           href: "/contact",       icon: "Mail" },
      { name: "Privacy Policy",    href: "/privacy",       icon: "ShieldCheck" },
      { name: "Refund Policy",     href: "/refund-policy", icon: "RotateCcw" },
      { name: "Terms of Service",  href: "/terms",         icon: "ScrollText" },
      { name: "Cookies Consent",   href: "/cookies",       icon: "Cookie" },
    ],
  },
];

export function Header() {
  const { config: businessConfig } = useBusinessConfig();
  const { config: headerConfig, isLoading: headerLoading } = useHeaderConfig();
  const { lang } = useLanguage();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<LoggedInUser | null>(null);

  // Scroll progress: 0 (top) → 1 (100px scrolled)
  const scrollProgress = useScrollTransparency(headerConfig?.transparent ?? false, 100);

  // Process menu data from API
  const navigation = useMemo(() => {
    if (headerConfig?.menu && headerConfig.menu.length > 0) {
      return getMainNavigation(headerConfig.menu);
    }
    return fallbackNavigation;
  }, [headerConfig?.menu]);

  const serviceCategories = useMemo(() => {
    if (headerConfig?.menu && headerConfig.menu.length > 0) {
      const categories = getMegaMenuCategories(headerConfig.menu);
      if (categories.length > 0) {
        return categories;
      }
    }
    return fallbackServiceCategories;
  }, [headerConfig?.menu]);

  const allServiceCategories = useMemo(() => {
    if (headerConfig?.menu && headerConfig.menu.length > 0) {
      return getAllMegaMenuCategories(headerConfig.menu);
    }
    return {};
  }, [headerConfig?.menu]);

  // Resolve auth button text to the active language (dynamic content translation).
  // Done centrally so every layout / CTAButtons / MobileMenu gets the localized text.
  const localizedConfig = useMemo(() => {
    if (!headerConfig) return headerConfig;
    const auth = headerConfig.auth;
    return {
      ...headerConfig,
      auth: {
        ...auth,
        loginText: resolveLocalized(auth.loginText, auth.translations, "loginText", lang),
        registerText: resolveLocalized(auth.registerText, auth.translations, "registerText", lang),
      },
    };
  }, [headerConfig, lang]);

  // Synchronously pre-populate user from localStorage before first paint to avoid flicker
  useIsomorphicLayoutEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;
    try {
      const data = JSON.parse(stored) as Record<string, unknown>;
      if (data.id && data.email) setUser(data as unknown as LoggedInUser);
    } catch {
      localStorage.removeItem("user");
    }
  }, []);

  // Keep user in sync with session changes and custom storage events
  useEffect(() => {
    const checkUser = () => {
      if (session?.user) {
        setUser({
          id: session.user.id || "",
          email: session.user.email || "",
          name: session.user.name || "",
          role: (session.user as { role?: string }).role || "CUSTOMER",
        });
        return;
      }

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData.id && userData.email) {
            setUser(userData);
          }
        } catch {
          localStorage.removeItem("user");
        }
      } else {
        setUser(null);
      }
    };

    checkUser();
    window.addEventListener("storage", checkUser);
    window.addEventListener("user-auth-change", checkUser);
    return () => {
      window.removeEventListener("storage", checkUser);
      window.removeEventListener("user-auth-change", checkUser);
    };
  }, [session]);

  const handleLogout = async () => {
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("user-auth-change"));
    await signOut({ callbackUrl: "/" });
  };

  // Check if custom styling is set - use explicit white as default
  const bgColor = headerConfig?.styling?.bgColor || "#ffffff";

  // Helper to detect if a color is dark
  const isDarkColor = (hex: string): boolean => {
    const color = hex.replace("#", "");
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  };

  // Auto-detect text color if not set - white for dark bg, dark for light bg
  const isDarkBg = isDarkColor(bgColor);
  const textColor = headerConfig?.styling?.textColor || (isDarkBg ? "#ffffff" : "#0f172a");
  const hoverColor = headerConfig?.styling?.hoverColor || (isDarkBg ? "#f97316" : "#f97316");

  // Check if user has set a custom background color
  const hasCustomBgColor = !!headerConfig?.styling?.bgColor;

  // Build header style — glass effect driven by JS scroll progress (no CSS transition fighting)
  const isGlassMode = headerConfig?.transparent && !hasCustomBgColor;
  const headerStyle: React.CSSProperties = isGlassMode
    ? {
        backgroundColor: `rgba(255,255,255,${(scrollProgress * 0.85).toFixed(3)})`,
        backdropFilter: scrollProgress > 0 ? `blur(${(scrollProgress * 12).toFixed(2)}px)` : undefined,
        WebkitBackdropFilter: scrollProgress > 0 ? `blur(${(scrollProgress * 12).toFixed(2)}px)` : undefined,
        boxShadow: scrollProgress > 0.2 ? `0 1px 6px rgba(0,0,0,${(scrollProgress * 0.07).toFixed(3)})` : undefined,
        borderBottom: scrollProgress > 0.05 ? `1px solid rgba(255,255,255,${(scrollProgress * 0.35).toFixed(3)})` : undefined,
        color: textColor,
        transition: "none",
      }
    : {
        backgroundColor: bgColor,
        color: textColor,
      };

  // Static class: glass mode handles everything via inline style
  const transparentStyles = isGlassMode ? "" : "border-b";

  // Common layout props
  const layoutProps = {
    config: localizedConfig!,
    navigation,
    serviceCategories,
    allServiceCategories,
    user,
    session,
    sessionStatus: status,
    isScrolled: scrollProgress >= 1,
    businessConfig: {
      name: businessConfig.name,
      display: businessConfig.display,
      logo: businessConfig.logo,
    },
    onLogout: handleLogout,
    styling: {
      textColor: textColor,
      hoverColor: hoverColor,
    },
  };

  // Render layout based on config
  const renderLayout = () => {
    if (!headerConfig) {
      return <HeaderDefault {...layoutProps} config={{ ...layoutProps.config, layout: "DEFAULT", height: 76, cta: [], auth: { showButtons: true, loginText: "Sign In", registerText: "Get Started", registerUrl: "/register" } }} />;
    }

    switch (headerConfig.layout) {
      case "CENTERED":
        return <HeaderCentered {...layoutProps} />;
      case "SPLIT":
        return <HeaderSplit {...layoutProps} />;
      case "MINIMAL":
        return <HeaderMinimal {...layoutProps} />;
      case "MEGA":
        return <HeaderMega {...layoutProps} />;
      case "DEFAULT":
      default:
        return <HeaderDefault {...layoutProps} />;
    }
  };

  // Don't render anything until header config is loaded to prevent flash of default content
  if (headerLoading) {
    return <div style={{ height: `${headerConfig?.height ?? 64}px` }} className="w-full" aria-hidden="true" />;
  }

  return (
    <>
      {/* Top Announcement Bar */}
      {headerConfig?.topBar && (
        <TopBar
          enabled={headerConfig.topBar.enabled}
          content={headerConfig.topBar.content}
          bgColor={headerConfig.styling?.bgColor}
          textColor={headerConfig.styling?.textColor}
        />
      )}

      {/* Main Header */}
      <header
        className={cn(
          "w-full z-50",
          !isGlassMode && "transition-all duration-300",
          headerConfig?.sticky && "sticky top-0",
          transparentStyles
        )}
        style={headerStyle}
      >
        {renderLayout()}
      </header>
    </>
  );
}

// Re-export for backwards compatibility
export default Header;
