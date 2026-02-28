"use client";

import { useState, useEffect } from "react";
import type { TickerMarqueeWidgetSettings, TickerMarqueeItem } from "@/lib/page-builder/types";
import { DEFAULT_TICKER_MARQUEE_SETTINGS } from "@/lib/page-builder/defaults";
import { WidgetContainer } from "@/components/page-builder/shared/widget-container";
import { cn } from "@/lib/utils";

interface TickerMarqueeWidgetProps {
  settings: TickerMarqueeWidgetSettings;
  isPreview?: boolean;
}

export function TickerMarqueeWidget({ settings: rawSettings }: TickerMarqueeWidgetProps) {
  const settings: TickerMarqueeWidgetSettings = {
    ...DEFAULT_TICKER_MARQUEE_SETTINGS,
    ...rawSettings,
    items: rawSettings.items ?? DEFAULT_TICKER_MARQUEE_SETTINGS.items,
  };

  const [fetchedItems, setFetchedItems] = useState<TickerMarqueeItem[] | null>(null);

  useEffect(() => {
    if (!settings.tickerName) {
      setFetchedItems(null);
      return;
    }

    fetch(`/api/tickers/${encodeURIComponent(settings.tickerName)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((ticker) => {
        if (Array.isArray(ticker.items) && ticker.items.length > 0) {
          setFetchedItems(ticker.items);
        }
      })
      .catch(() => {
        setFetchedItems(null);
      });
  }, [settings.tickerName]);

  const items = fetchedItems ?? settings.items;
  const speed = settings.speed || 28;
  const textColor = settings.textColor || "rgba(250,248,244,0.5)";

  // Duplicate items for seamless infinite scroll
  const allItems = [...items, ...items];

  /** Build HTML string from item — supports new `content` field and legacy boldText+text */
  function getItemHtml(item: TickerMarqueeItem): string {
    if (item.content) return item.content;
    // Legacy fallback
    const bold = item.boldText ? `<strong>${item.boldText}</strong>` : "";
    const sep = bold && item.text ? ` ${settings.separator} ` : "";
    return `${bold}${sep}${item.text || ""}`;
  }

  function renderItem(item: TickerMarqueeItem, idx: number) {
    const html = getItemHtml(item);
    const sharedStyle = {
      padding: "0 36px",
      color: textColor,
      borderRight: "1px solid rgba(255,255,255,0.07)",
    };

    if (item.link) {
      return (
        <a
          key={`${item.id}_${idx}`}
          href={item.link}
          target={item.openInNewTab ? "_blank" : undefined}
          rel={`${item.openInNewTab ? "noopener noreferrer" : ""}${item.noFollow ? " nofollow" : ""}`.trim() || undefined}
          className={cn(
            "flex items-center gap-2.5 whitespace-nowrap font-display no-underline [&_strong]:font-bold",
            !settings.customFontSize && "text-[13px]",
            !settings.fontWeight && "font-semibold"
          )}
          style={{
            ...sharedStyle,
            ...(settings.customFontSize ? { fontSize: settings.customFontSize } : {}),
            ...(settings.fontWeight ? { fontWeight: settings.fontWeight } : {}),
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    return (
      <div
        key={`${item.id}_${idx}`}
        className={cn(
          "flex items-center gap-2.5 whitespace-nowrap font-display [&_strong]:font-bold",
          !settings.customFontSize && "text-[13px]",
          !settings.fontWeight && "font-semibold"
        )}
        style={{
          ...sharedStyle,
          ...(settings.customFontSize ? { fontSize: settings.customFontSize } : {}),
          ...(settings.fontWeight ? { fontWeight: settings.fontWeight } : {}),
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <WidgetContainer container={settings.container}>
      <div className="overflow-hidden">
        <div
          className="flex w-max"
          style={{
            animation: `ticker-marquee ${speed}s linear infinite`,
            gap: 0,
          }}
        >
          {allItems.map((item, idx) => renderItem(item, idx))}
        </div>

        <style>{`
          @keyframes ticker-marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>
    </WidgetContainer>
  );
}
