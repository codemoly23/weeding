"use client";

import { useMemo, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { PlanigateEventTypesWidgetSettings, PlanigateEventTypeCard } from "@/lib/page-builder/types";
import { DEFAULT_PLANIGATE_EVENT_TYPES_SETTINGS } from "@/lib/page-builder/defaults";
import { fadeUp, staggerContainer, staggerItem, viewportOnce } from "./motion-variants";

interface ApiCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
}

interface Props {
  settings: PlanigateEventTypesWidgetSettings;
}

export function PlanigateEventTypesWidget({ settings: raw }: Props) {
  const settings = useMemo<PlanigateEventTypesWidgetSettings>(() => ({
    heading: raw?.heading ?? DEFAULT_PLANIGATE_EVENT_TYPES_SETTINGS.heading,
    dataSource: raw?.dataSource ?? DEFAULT_PLANIGATE_EVENT_TYPES_SETTINGS.dataSource ?? "manual",
    items: raw?.items?.length ? raw.items : DEFAULT_PLANIGATE_EVENT_TYPES_SETTINGS.items,
  }), [raw]);

  // Live categories overlay (auto mode)
  const [liveItems, setLiveItems] = useState<PlanigateEventTypeCard[] | null>(null);

  useEffect(() => {
    if (settings.dataSource !== "auto") return;
    let cancelled = false;
    fetch("/api/services/categories")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { categories?: ApiCategory[] } | null) => {
        if (cancelled || !data?.categories?.length) return;
        // Map DB categories to cards. Reuse images from manual items by index as fallback
        // since ServiceCategory does not currently carry an image field.
        const manualItems = settings.items;
        const mapped: PlanigateEventTypeCard[] = data.categories.map(
          (cat, i): PlanigateEventTypeCard => ({
            id: cat.id,
            label: cat.name,
            image: manualItems[i]?.image ?? manualItems[0]?.image ?? "",
            href: `/events/${cat.slug}`,
          })
        );
        setLiveItems(mapped);
      })
      .catch(() => {
        // silent: keep manual items
      });
    return () => {
      cancelled = true;
    };
  }, [settings.dataSource, settings.items]);

  const displayItems = liveItems ?? settings.items;

  return (
    <section
      className="relative"
      style={{ background: "var(--color-planigate-bg-section)" }}
    >
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 pt-8 pb-10">
        <motion.h2
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={fadeUp}
          className="text-center font-semibold tracking-tight"
          style={{
            fontSize: "clamp(1.5rem, 3vw, 2rem)",
            color: "var(--color-planigate-fg)",
          }}
        >
          {settings.heading}
        </motion.h2>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={staggerContainer}
          className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
        >
          {displayItems.map((item) => (
            <EventCard key={item.id} item={item} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function EventCard({ item }: { item: PlanigateEventTypeCard }) {
  return (
    <motion.div variants={staggerItem}>
      <Link
        href={item.href}
        className="relative block w-full aspect-[3/4] rounded-2xl overflow-hidden group ring-1 ring-black/5 transition-shadow duration-300 hover:shadow-xl"
      >
        <Image
          src={item.image}
          alt={item.label}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent transition-opacity duration-300 group-hover:from-black/70" />
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <div className="text-[15px] font-semibold tracking-tight transition-transform duration-300 group-hover:translate-y-[-2px]">
            {item.label}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[12px] text-white/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            Utforska
            <ArrowRight size={12} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
