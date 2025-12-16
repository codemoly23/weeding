"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WidgetPosition {
  position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  horizontalOffset: number;
  verticalOffset: number;
  buttonSize: "small" | "medium" | "large";
}

const BUTTON_HEIGHTS = {
  small: 48,
  medium: 56,
  large: 64,
};

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [widgetSettings, setWidgetSettings] = useState<WidgetPosition | null>(null);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    // Fetch widget settings to position scroll-to-top above chat widget
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/widget-settings");
        if (response.ok) {
          const data = await response.json();
          setWidgetSettings({
            position: data.position || "bottom-right",
            horizontalOffset: data.horizontalOffset ?? 24,
            verticalOffset: data.verticalOffset ?? 24,
            buttonSize: data.buttonSize || "medium",
          });
        }
      } catch {
        // Use defaults on error
      }
    };

    fetchSettings();

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Calculate position style based on chat widget settings
  const getPositionStyle = (): React.CSSProperties => {
    const pos = widgetSettings?.position || "bottom-right";
    const hOffset = widgetSettings?.horizontalOffset ?? 24;
    const vOffset = widgetSettings?.verticalOffset ?? 24;
    const buttonHeight = BUTTON_HEIGHTS[widgetSettings?.buttonSize || "medium"];

    // Position scroll-to-top above the chat button
    const scrollButtonOffset = vOffset + buttonHeight + 16; // button + gap

    const style: React.CSSProperties = {};

    // Only show above chat widget when it's at bottom
    if (pos.includes("bottom")) {
      style.bottom = `${scrollButtonOffset}px`;
    } else {
      // If chat is at top, put scroll-to-top at default bottom position
      style.bottom = "24px";
    }

    // Match horizontal position with chat widget
    if (pos.includes("right")) {
      style.right = `${hOffset}px`;
    } else {
      style.left = `${hOffset}px`;
    }

    return style;
  };

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      style={getPositionStyle()}
      className={cn(
        "fixed z-40 h-10 w-10 rounded-full shadow-lg transition-all duration-300",
        "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground",
        "border border-border",
        "hover:scale-110 active:scale-95",
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-16 opacity-0 pointer-events-none"
      )}
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-4 w-4" />
    </Button>
  );
}
