"use client";

import { cn } from "@/lib/utils";
import type { HeroBackgroundSettings } from "@/lib/landing-blocks/types";

interface HeroBackgroundProps {
  settings: HeroBackgroundSettings;
  children: React.ReactNode;
  className?: string;
}

export function HeroBackground({ settings, children, className }: HeroBackgroundProps) {
  const getBackgroundStyle = (): React.CSSProperties => {
    switch (settings.type) {
      case "solid":
        return { backgroundColor: settings.color || "#0A0F1E" };
      case "gradient":
        return {
          background: `linear-gradient(${settings.gradientAngle || 135}deg, ${settings.gradientFrom || "#0A0F1E"}, ${settings.gradientTo || "#1a1a2e"})`,
        };
      case "image":
        return {
          backgroundImage: `url(${settings.imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        };
      default:
        return { backgroundColor: "#0A0F1E" };
    }
  };

  return (
    <section
      className={cn("relative overflow-hidden", className)}
      style={getBackgroundStyle()}
    >
      {/* Video Background — z-0 so it sits above section bg but below overlays */}
      {settings.type === "video" && settings.videoUrl && (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover z-0"
        >
          <source src={settings.videoUrl} type="video/mp4" />
        </video>
      )}

      {/* Pattern Overlay — z-[1] so it renders above video/image bg */}
      {settings.pattern && (
        <div className="absolute inset-0 z-[1]">
          {settings.pattern.type === "grid" && (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(to right, ${settings.pattern.color} 1px, transparent 1px), linear-gradient(to bottom, ${settings.pattern.color} 1px, transparent 1px)`,
                backgroundSize: "60px 60px",
                opacity: settings.pattern.opacity,
              }}
            />
          )}
          {settings.pattern.type === "dots" && (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(${settings.pattern.color} 1px, transparent 1px)`,
                backgroundSize: "20px 20px",
                opacity: settings.pattern.opacity,
              }}
            />
          )}
        </div>
      )}

      {/* Color Overlay — z-[2] so it sits above pattern and video */}
      {settings.overlay?.enabled && (
        <div
          className="absolute inset-0 z-[2]"
          style={{
            backgroundColor: settings.overlay.color,
            opacity: settings.overlay.opacity,
          }}
        />
      )}

      {/* Content — z-[3] so it's always above all background layers */}
      <div className="relative z-[3]">
        {children}
      </div>
    </section>
  );
}
