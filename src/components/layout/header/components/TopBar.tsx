"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTopBarDismiss } from "../hooks/useTopBarDismiss";
import type { TopBarProps } from "../types";
import type { GradientDirection, AnnouncementItem, TopBarLink, AnimationEffect, AnimationMode } from "@/lib/header-footer/types";
import { cn } from "@/lib/utils";

// Convert gradient direction to CSS
function getGradientCSS(direction?: GradientDirection): string {
  switch (direction) {
    case "to-r": return "to right";
    case "to-l": return "to left";
    case "to-t": return "to top";
    case "to-b": return "to bottom";
    case "to-tr": return "to top right";
    case "to-tl": return "to top left";
    case "to-br": return "to bottom right";
    case "to-bl": return "to bottom left";
    default: return "to right";
  }
}

export function TopBar({ enabled, content, bgColor, textColor }: TopBarProps) {
  const { isDismissed, dismiss } = useTopBarDismiss();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);

  // Build announcements array - support both legacy single text and new multiple announcements
  const announcements: AnnouncementItem[] = (() => {
    if (content?.announcements && content.announcements.length > 0) {
      return content.announcements.filter(a => a.isActive !== false);
    }
    // Legacy support: convert single text to announcement
    if (content?.text) {
      return [{
        id: "legacy-1",
        text: content.text,
        links: content.links,
        isActive: true,
      }];
    }
    return [];
  })();

  const currentAnnouncement = announcements[currentIndex];
  const hasMultiple = announcements.length > 1;

  // Unified Animation System - with legacy fallback
  const getAnimationMode = (): AnimationMode => {
    // New unified system takes priority
    if (content?.animationMode) {
      return content.animationMode;
    }
    // Legacy fallback
    if (content?.enableLoopAnimation) {
      return "loop";
    }
    if (content?.entranceAnimation && content.entranceAnimation !== "none") {
      return "once";
    }
    // Default: loop for multiple announcements, once for single
    return hasMultiple ? "loop" : "once";
  };

  const getAnimationEffect = (): AnimationEffect => {
    // New unified system takes priority
    if (content?.animationEffect) {
      return content.animationEffect;
    }
    // Legacy fallback
    if (content?.loopEffect) {
      return content.loopEffect;
    }
    if (content?.entranceAnimation === "fade-in") {
      return "fade";
    }
    // Default
    return "slide-down";
  };

  const getAnimationInterval = (): number => {
    // New unified system takes priority
    if (content?.animationInterval !== undefined) {
      return content.animationInterval;
    }
    // Legacy fallback
    if (content?.loopInterval !== undefined) {
      return content.loopInterval;
    }
    // Default: 5s for multiple, 15s for single
    return hasMultiple ? 5 : 15;
  };

  const animationMode = getAnimationMode();
  const animationEffect = getAnimationEffect();
  const animationInterval = getAnimationInterval();

  // Handle entrance animation (plays on first load)
  useEffect(() => {
    if (enabled && !isDismissed && announcements.length > 0 && animationMode !== "none") {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 100);
      return () => clearTimeout(timer);
    } else if (animationMode === "none") {
      // No animation - show immediately
      setIsVisible(true);
      setIsAnimating(true);
    }
  }, [enabled, isDismissed, announcements.length, animationMode]);

  // Handle loop animation / rotation
  const animateTransition = useCallback(() => {
    setIsTransitioning(true);

    // After fade out, change content
    setTimeout(() => {
      if (hasMultiple) {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
      }
      setHasPlayedOnce(true);
      // Fade back in
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 300);
  }, [hasMultiple, announcements.length]);

  useEffect(() => {
    // Only run loop if mode is "loop" and visible
    if (animationMode !== "loop" || !isVisible || isDismissed) return;

    const interval = setInterval(() => {
      animateTransition();
    }, animationInterval * 1000);

    return () => clearInterval(interval);
  }, [animationMode, isVisible, isDismissed, animationInterval, animateTransition]);

  // For "once" mode with multiple announcements - still rotate but stop after one cycle
  useEffect(() => {
    if (animationMode !== "once" || !isVisible || isDismissed || !hasMultiple || hasPlayedOnce) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => {
          const next = (prev + 1) % announcements.length;
          if (next === 0) {
            setHasPlayedOnce(true);
          }
          return next;
        });
        setTimeout(() => setIsTransitioning(false), 50);
      }, 300);
    }, animationInterval * 1000);

    return () => clearInterval(interval);
  }, [animationMode, isVisible, isDismissed, hasMultiple, hasPlayedOnce, animationInterval, announcements.length]);

  if (!enabled || isDismissed || announcements.length === 0) {
    return null;
  }

  // Get style from content or use fallback props
  const style = content?.style;
  const dismissible = content?.dismissible !== false;

  // Calculate background
  const getBackground = () => {
    if (style?.useGradient && style.gradientFrom && style.gradientTo) {
      return `linear-gradient(${getGradientCSS(style.gradientDirection)}, ${style.gradientFrom}, ${style.gradientTo})`;
    }
    return style?.bgColor || bgColor || "hsl(var(--primary))";
  };

  // Get link styles
  const getLinkStyle = () => {
    const linkStyle = style?.linkStyle || "underline";
    return {
      color: style?.linkColor || "inherit",
      fontWeight: linkStyle === "bold" ? "bold" : "normal",
      textDecoration: linkStyle === "underline" ? "underline" : "none",
    };
  };

  // Entrance animation classes (for the bar itself)
  const getEntranceAnimationClass = () => {
    if (animationMode === "none") return "opacity-100";
    if (!isAnimating) return "opacity-0";

    switch (animationEffect) {
      case "slide-down":
        return isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-full";
      case "slide-up":
        return isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-full";
      case "fade":
        return isVisible ? "opacity-100" : "opacity-0";
      case "pulse":
        return isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95";
      default:
        return "opacity-100";
    }
  };

  // Content transition animation classes (for text rotation)
  const getContentAnimationClass = () => {
    if (!isTransitioning) return "opacity-100 translate-y-0 scale-100";

    switch (animationEffect) {
      case "fade":
        return "opacity-0";
      case "slide-up":
        return "opacity-0 -translate-y-2";
      case "slide-down":
        return "opacity-0 translate-y-2";
      case "pulse":
        return "opacity-50 scale-95";
      default:
        return "opacity-0";
    }
  };

  const renderLinks = (links?: TopBarLink[]) => {
    if (!links || links.length === 0) return null;

    return (
      <div className="flex items-center gap-3">
        {links.map((link, index) => {
          const linkStyleObj = getLinkStyle();
          return (
            <Link
              key={index}
              href={link.url}
              target={link.target || "_self"}
              className={cn(
                "transition-opacity hover:opacity-80",
                style?.linkStyle === "button" && "px-3 py-1 rounded bg-white/20 hover:bg-white/30"
              )}
              style={style?.linkStyle !== "button" ? linkStyleObj : { color: linkStyleObj.color }}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-center gap-4 px-4 py-2 text-sm transition-all duration-300",
        getEntranceAnimationClass()
      )}
      style={{
        background: getBackground(),
        color: style?.textColor || textColor || "hsl(var(--primary-foreground))",
        borderBottom: style?.borderBottom ? `1px solid ${style.borderColor || "rgba(255,255,255,0.2)"}` : undefined,
      }}
    >
      {/* Announcement Content with Animation */}
      <div
        className={cn(
          "flex items-center justify-center gap-4 transition-all duration-300",
          getContentAnimationClass()
        )}
      >
        <span>{currentAnnouncement?.text}</span>
        {renderLinks(currentAnnouncement?.links)}
      </div>

      {/* Pagination Dots for Multiple Announcements */}
      {hasMultiple && (
        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-1">
          {announcements.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setCurrentIndex(idx);
                  setTimeout(() => setIsTransitioning(false), 50);
                }, 300);
              }}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all",
                idx === currentIndex ? "bg-white" : "bg-white/40 hover:bg-white/60"
              )}
              aria-label={`Go to announcement ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Dismiss Button */}
      {dismissible && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 hover:bg-white/20"
          onClick={dismiss}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>
      )}
    </div>
  );
}
