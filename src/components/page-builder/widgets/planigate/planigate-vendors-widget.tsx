"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import type { PlanigateVendorsWidgetSettings, PlanigateVendorCard } from "@/lib/page-builder/types";
import { DEFAULT_PLANIGATE_VENDORS_SETTINGS } from "@/lib/page-builder/defaults";
import { fadeUp, staggerContainer, staggerItem, viewportOnce } from "./motion-variants";

// Shape of the public /api/vendors response we care about
interface ApiVendor {
  id: string;
  slug: string;
  businessName: string;
  category: string;
  city: string | null;
  country: string | null;
  coverPhoto: string | null;
  photos: string[];
  avgRating: number | null;
  reviewCount: number;
  isFeatured: boolean;
}

function formatCategoryAndCity(category: string, city: string | null): string {
  // VendorCategory enum is uppercase (e.g. "PHOTOGRAPHY"). Convert to title case.
  const pretty = category
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return city ? `${pretty} · ${city}` : pretty;
}

function apiToCard(v: ApiVendor): PlanigateVendorCard {
  return {
    id: v.id,
    image: v.coverPhoto ?? v.photos[0] ?? "",
    name: v.businessName,
    category: formatCategoryAndCity(v.category, v.city),
    rating: v.avgRating ?? 0,
    reviewCount: v.reviewCount,
    slug: v.slug,
  };
}

interface Props {
  settings: PlanigateVendorsWidgetSettings;
}

export function PlanigateVendorsWidget({ settings: raw }: Props) {
  const settings = useMemo<PlanigateVendorsWidgetSettings>(() => ({
    heading: raw?.heading ?? DEFAULT_PLANIGATE_VENDORS_SETTINGS.heading,
    viewAllText: raw?.viewAllText ?? DEFAULT_PLANIGATE_VENDORS_SETTINGS.viewAllText,
    viewAllHref: raw?.viewAllHref ?? DEFAULT_PLANIGATE_VENDORS_SETTINGS.viewAllHref,
    dataSource: raw?.dataSource ?? DEFAULT_PLANIGATE_VENDORS_SETTINGS.dataSource ?? "manual",
    onlyFeatured: raw?.onlyFeatured ?? DEFAULT_PLANIGATE_VENDORS_SETTINGS.onlyFeatured ?? false,
    limit: raw?.limit ?? DEFAULT_PLANIGATE_VENDORS_SETTINGS.limit ?? 5,
    items: raw?.items?.length ? raw.items : DEFAULT_PLANIGATE_VENDORS_SETTINGS.items,
  }), [raw]);

  // Live vendors when dataSource === "auto"
  const [liveVendors, setLiveVendors] = useState<PlanigateVendorCard[] | null>(null);

  useEffect(() => {
    if (settings.dataSource !== "auto") return;
    let cancelled = false;
    const params = new URLSearchParams();
    if (settings.onlyFeatured) params.set("featured", "true");
    fetch(`/api/vendors?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { vendors?: ApiVendor[] } | null) => {
        if (cancelled || !data?.vendors) return;
        const mapped = data.vendors
          .filter((v) => {
            const img = v.coverPhoto ?? v.photos[0];
            // Need a valid HTTP(S) URL — next/image can't reliably handle
            // base64/data: URLs at the size we use, so skip those vendors and
            // fall back to manual demo cards.
            return !!img && (img.startsWith("http://") || img.startsWith("https://"));
          })
          .slice(0, settings.limit)
          .map(apiToCard);
        // If API returned no usable vendors, keep showing the manual items as fallback
        if (mapped.length > 0) setLiveVendors(mapped);
      })
      .catch(() => {
        // silent: widget keeps showing the manual items
      });
    return () => {
      cancelled = true;
    };
  }, [settings.dataSource, settings.onlyFeatured, settings.limit]);

  const displayItems = liveVendors ?? settings.items;

  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollRight = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * 0.7, behavior: "smooth" });
  };

  return (
    <section
      className="relative"
      style={{ background: "var(--color-planigate-bg-section)" }}
    >
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 pt-12 pb-12">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={fadeUp}
          className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2"
        >
          <h2
            className="font-semibold tracking-tight"
            style={{
              fontSize: "clamp(1.25rem, 2.4vw, 1.625rem)",
              color: "var(--color-planigate-fg)",
            }}
          >
            {settings.heading}
          </h2>
          <Link
            href={settings.viewAllHref}
            className="group inline-flex items-center gap-1 text-sm font-medium transition-colors"
            style={{ color: "var(--color-planigate-fg)" }}
          >
            <span className="relative">
              {settings.viewAllText}
              <span
                className="absolute left-0 -bottom-0.5 h-px w-0 transition-all duration-300 group-hover:w-full"
                style={{ backgroundColor: "var(--color-planigate-accent)" }}
              />
            </span>
            <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </motion.div>

        <div className="relative mt-6">
          <motion.div
            ref={scrollRef}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            variants={staggerContainer}
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {displayItems.map((item) => (
              <VendorCard key={item.id} item={item} />
            ))}
          </motion.div>

          <motion.button
            type="button"
            onClick={scrollRight}
            aria-label="Scroll right"
            whileHover={{ scale: 1.1, x: 2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="hidden lg:flex absolute right-[-12px] top-1/2 -translate-y-1/2 z-10 h-11 w-11 items-center justify-center rounded-full shadow-lg ring-1 ring-black/[0.05]"
            style={{
              backgroundColor: "var(--color-planigate-surface)",
              color: "var(--color-planigate-fg)",
            }}
          >
            <ArrowRight size={18} />
          </motion.button>
        </div>
      </div>
    </section>
  );
}

function VendorCard({ item }: { item: PlanigateVendorCard }) {
  const href = item.slug ? `/vendors/${item.slug}` : "/vendors";
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="shrink-0 snap-start w-[210px] sm:w-[230px] group"
    >
      <Link href={href} className="block cursor-pointer">
        <div className="relative h-[130px] w-full overflow-hidden rounded-2xl ring-1 ring-black/5 transition-shadow duration-300 group-hover:shadow-lg">
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="240px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
        <div className="mt-3 space-y-1 px-1">
          <div
            className="text-[14px] font-semibold leading-tight truncate transition-colors duration-300 group-hover:[color:var(--color-planigate-accent)]"
            style={{ color: "var(--color-planigate-fg)" }}
          >
            {item.name}
          </div>
          <div
            className="text-[12px] truncate"
            style={{ color: "var(--color-planigate-fg-muted)" }}
          >
            {item.category}
          </div>
          <div
            className="flex items-center gap-1 text-[12px]"
            style={{ color: "var(--color-planigate-fg-strong)" }}
          >
            <Star
              size={12}
              className="transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12"
              style={{
                fill: "var(--color-planigate-star)",
                color: "var(--color-planigate-star)",
              }}
            />
            <span className="font-medium">{item.rating.toFixed(1)}</span>
            <span style={{ color: "var(--color-planigate-fg-faint)" }}>
              ({item.reviewCount})
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
