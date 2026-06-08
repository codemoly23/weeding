"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Sparkles, Users, Store, Globe, Star, Heart, Calendar, Award, MapPin,
} from "lucide-react";
import type { PlanigateStatsWidgetSettings, PlanigateStatItem } from "@/lib/page-builder/types";
import { DEFAULT_PLANIGATE_STATS_SETTINGS } from "@/lib/page-builder/defaults";
import { staggerContainer, staggerItem, viewportOnce } from "./motion-variants";

const ICONS: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  Sparkles, Users, Store, Globe, Star, Heart, Calendar, Award, MapPin,
};

function Icon({ name, className }: { name: string; className?: string }) {
  const Comp = ICONS[name] ?? Sparkles;
  return <Comp className={className} />;
}

interface Props {
  settings: PlanigateStatsWidgetSettings;
}

interface LiveStats {
  totalEvents: number;
  totalGuests: number;
  approvedVendors: number;
}

export function PlanigateStatsWidget({ settings: raw }: Props) {
  const items: PlanigateStatItem[] = useMemo(
    () => (raw?.items?.length ? raw.items : DEFAULT_PLANIGATE_STATS_SETTINGS.items),
    [raw]
  );

  // Fetch live stats only when at least one item references a dataKey
  const needsLive = items.some((it) => !!it.dataKey);
  const [live, setLive] = useState<LiveStats | null>(null);

  useEffect(() => {
    if (!needsLive) return;
    let cancelled = false;
    fetch("/api/public/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: LiveStats | null) => {
        if (!cancelled && data) setLive(data);
      })
      .catch(() => {
        // silent: widget falls back to the static `number` text
      });
    return () => {
      cancelled = true;
    };
  }, [needsLive]);

  return (
    <section
      className="relative"
      style={{ background: "var(--color-planigate-bg-section)" }}
    >
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={staggerContainer}
          className="rounded-2xl border px-6 py-6"
          style={{
            backgroundColor: "var(--color-planigate-bg-soft)",
            borderColor: "color-mix(in srgb, var(--color-planigate-border) 60%, transparent)",
          }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-6">
            {items.map((item) => (
              <StatBlock key={item.id} item={item} live={live} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Parse a number from the string ("12 000+" → 12000) — used for the counter.
function parseNumeric(text: string): number | null {
  const match = text.replace(/\s/g, "").match(/(\d+)/);
  if (!match) return null;
  return parseInt(match[1], 10);
}

function StatBlock({
  item,
  live,
}: {
  item: PlanigateStatItem;
  live: LiveStats | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  // Resolve target: prefer live data when dataKey set + fetched; else parse the static `number`.
  const liveValue = item.dataKey && live ? live[item.dataKey] : null;
  const staticTarget = parseNumeric(item.number);
  const target = liveValue ?? staticTarget;

  // Display template — keep the suffix from `item.number` (e.g. "+") around the live number.
  const buildDisplay = (value: number) => {
    const formatted = value.toLocaleString("sv-SE");
    if (item.dataKey && live) {
      // For live data, build "12 000+" if original ended with "+"; else just the number.
      const hadPlus = /\+\s*$/.test(item.number);
      return hadPlus ? `${formatted}+` : formatted;
    }
    // For static numbers, replace the digit portion in the original string.
    return item.number.replace(/\d[\d\s]*/, formatted);
  };

  const [displayed, setDisplayed] = useState<string>(
    target !== null ? "0" : item.number
  );

  // Count-up animation when in view (re-runs once if live data arrives later).
  useEffect(() => {
    if (!inView || target === null) {
      // No animation needed for static label-only items (e.g. "Sverige & Skandinavien")
      if (target === null) setDisplayed(item.number);
      return;
    }
    const duration = 1500;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const value = Math.round(eased * target);
      setDisplayed(buildDisplay(value));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, target]);

  return (
    <motion.div
      ref={ref}
      variants={staggerItem}
      className="group flex items-center gap-3"
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-300 group-hover:scale-110"
        style={{
          backgroundColor: "var(--color-planigate-surface)",
          borderColor: "var(--color-planigate-border)",
          color: "var(--color-planigate-accent)",
        }}
      >
        <Icon
          name={item.icon}
          className="size-4 transition-transform duration-300 group-hover:rotate-12"
        />
      </div>
      <div className="min-w-0">
        <div
          className="text-[15px] font-semibold leading-tight truncate tabular-nums"
          style={{ color: "var(--color-planigate-fg)" }}
        >
          {displayed}
        </div>
        <div
          className="text-[12px] truncate"
          style={{ color: "var(--color-planigate-fg-muted)" }}
        >
          {item.label}
        </div>
      </div>
    </motion.div>
  );
}
