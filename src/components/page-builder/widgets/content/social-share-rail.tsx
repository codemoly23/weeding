"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Twitter, Linkedin, Facebook, Link2, MessageCircle } from "lucide-react";
import type { SocialShareRailWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_SOCIAL_SHARE_RAIL_SETTINGS } from "@/lib/page-builder/defaults";
import { WidgetContainer } from "@/components/page-builder/shared/widget-container";
import { useBlogPostContext } from "@/components/page-builder/context/blog-post-context";

interface Props {
  settings: SocialShareRailWidgetSettings;
}

const platformConfig = {
  twitter: { Icon: Twitter, label: "Twitter", url: (u: string, t: string) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
  linkedin: { Icon: Linkedin, label: "LinkedIn", url: (u: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}` },
  facebook: { Icon: Facebook, label: "Facebook", url: (u: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
  whatsapp: { Icon: MessageCircle, label: "WhatsApp", url: (u: string, t: string) => `https://wa.me/?text=${encodeURIComponent(t + " " + u)}` },
  copy: { Icon: Link2, label: "Copy Link", url: () => "" },
} as const;

export function SocialShareRailWidget({ settings: rawSettings }: Props) {
  const post = useBlogPostContext();
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const s = useMemo<SocialShareRailWidgetSettings>(
    () => ({ ...DEFAULT_SOCIAL_SHARE_RAIL_SETTINGS, ...rawSettings }),
    [rawSettings]
  );

  const url = typeof window !== "undefined" ? window.location.href : "";
  const title = post?.title || "";

  const handleClick = async (e: React.MouseEvent, platform: string) => {
    if (platform === "copy") {
      e.preventDefault();
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {}
    }
  };

  return (
    <WidgetContainer container={s.container}>
      <div
        className={cn(s.sticky && "lg:sticky")}
        style={{ top: s.sticky ? s.stickyTop : undefined }}
      >
        {s.showLabel && (
          <h4
            className="font-display font-semibold text-[12px] uppercase mb-4"
            style={{ color: s.labelColor, letterSpacing: "0.1em" }}
          >
            {s.label}
          </h4>
        )}

        <div className={cn("flex", s.layout === "vertical" ? "flex-col gap-2.5" : "flex-row flex-wrap gap-2.5")}>
          {s.platforms.map((p) => {
            const cfg = platformConfig[p];
            if (!cfg) return null;
            const { Icon, label } = cfg;
            const isHovered = hoveredKey === p;
            const href = p === "copy" ? "#" : (cfg.url as (u: string, t: string) => string)(url, title);

            return (
              <a
                key={p}
                href={href}
                target={p === "copy" ? undefined : "_blank"}
                rel={p === "copy" ? undefined : "noopener noreferrer"}
                onClick={(e) => handleClick(e, p)}
                onMouseEnter={() => setHoveredKey(p)}
                onMouseLeave={() => setHoveredKey(null)}
                className="inline-flex items-center gap-2.5 rounded-lg font-display font-medium text-[13px] transition-all duration-200"
                style={{
                  background: isHovered ? s.buttonHoverBgColor : s.buttonBgColor,
                  color: isHovered ? s.buttonHoverTextColor : s.buttonTextColor,
                  border: `1px solid ${isHovered ? s.buttonHoverBgColor : s.buttonBorderColor}`,
                  padding: "10px 14px",
                }}
              >
                <Icon style={{ width: s.iconSize, height: s.iconSize }} />
                <span>{p === "copy" && copied ? "Copied!" : label}</span>
              </a>
            );
          })}
        </div>

        {s.showCounter && s.counterValue && (
          <div className="mt-5 pt-4 border-t" style={{ borderColor: s.buttonBorderColor }}>
            <div className="font-display font-bold text-[24px]" style={{ color: "var(--color-primary, #f97316)" }}>
              {s.counterValue}
            </div>
            <div className="text-[11px] uppercase tracking-wider" style={{ color: s.labelColor }}>
              {s.counterLabel}
            </div>
          </div>
        )}
      </div>
    </WidgetContainer>
  );
}
