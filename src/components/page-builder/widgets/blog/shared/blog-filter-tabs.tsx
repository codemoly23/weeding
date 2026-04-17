"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface BlogFilterTabsProps {
  categories: { id: string; name: string; slug: string }[];
  activeCategory: string | null; // null = "All"
  onCategoryChange: (slug: string | null) => void;
  style: "pills" | "underline" | "buttons";
  showAll: boolean;
  allText: string;
  // Theming (optional — defaults to original blue scheme)
  activeBg?: string;
  activeColor?: string;
  activeBorder?: string;
  inactiveBg?: string;
  inactiveColor?: string;
  inactiveBorder?: string;
  hoverBorder?: string;
}

export function BlogFilterTabs({
  categories,
  activeCategory,
  onCategoryChange,
  style,
  showAll,
  allText,
  activeBg = "#1b3a2d",
  activeColor = "#ffffff",
  activeBorder = "#1b3a2d",
  inactiveBg = "#ffffff",
  inactiveColor = "#64748b",
  inactiveBorder = "#e2e8f0",
  hoverBorder = "#f97316",
}: BlogFilterTabsProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (categories.length === 0) return null;

  const tabs = showAll
    ? [{ id: "__all__", slug: "", name: allText || "All" }, ...categories]
    : categories;

  return (
    <div
      className={cn(
        "mb-8 flex flex-wrap justify-center",
        style === "underline" ? "gap-0 border-b border-slate-200" : "gap-2.5"
      )}
    >
      {tabs.map((tab) => {
        const isActive =
          tab.slug === "" ? activeCategory === null : activeCategory === tab.slug;
        const isHovered = hoveredId === tab.id;

        const inlineStyle: React.CSSProperties = {};
        if (style === "pills" || style === "buttons") {
          inlineStyle.background = isActive ? activeBg : inactiveBg;
          inlineStyle.color = isActive ? activeColor : inactiveColor;
          inlineStyle.borderColor = isActive
            ? activeBorder
            : isHovered
              ? hoverBorder
              : inactiveBorder;
          inlineStyle.borderWidth = "1px";
          inlineStyle.borderStyle = "solid";
        } else if (style === "underline") {
          inlineStyle.color = isActive ? activeBg : inactiveColor;
          inlineStyle.borderBottomColor = isActive ? activeBg : "transparent";
        }

        return (
          <button
            key={tab.id}
            onClick={() => onCategoryChange(tab.slug === "" ? null : tab.slug)}
            onMouseEnter={() => setHoveredId(tab.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={cn(
              "font-display font-medium text-[14px] transition-all duration-200 cursor-pointer",
              style === "pills" && "rounded-full px-[22px] py-[10px]",
              style === "buttons" && "rounded-lg px-4 py-1.5",
              style === "underline" && "border-b-2 px-4 py-2.5 -mb-px"
            )}
            style={inlineStyle}
          >
            {tab.name}
          </button>
        );
      })}
    </div>
  );
}
