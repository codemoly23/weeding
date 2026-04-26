"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

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
    <button
      onClick={scrollToTop}
      style={{
        ...getPositionStyle(),
        position: "fixed",
        zIndex: 40,
        width: 52,
        height: 52,
        borderRadius: "50%",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #a855f7, #ec4899)",
        boxShadow: "0 4px 20px rgba(168,85,247,0.45)",
        transition: "transform 0.3s ease, opacity 0.3s ease, box-shadow 0.2s ease",
        transform: isVisible ? "translateY(0)" : "translateY(64px)",
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 28px rgba(168,85,247,0.6)";
        (e.currentTarget as HTMLButtonElement).style.transform = isVisible ? "translateY(-2px)" : "translateY(64px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(168,85,247,0.45)";
        (e.currentTarget as HTMLButtonElement).style.transform = isVisible ? "translateY(0)" : "translateY(64px)";
      }}
      aria-label="Scroll to top"
    >
      <ChevronUp style={{ width: 22, height: 22, color: "#ffffff", strokeWidth: 2.5 }} />
    </button>
  );
}
