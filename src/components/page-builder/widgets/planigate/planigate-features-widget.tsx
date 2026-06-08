"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mail, Users, LayoutGrid, Store, ArrowRight,
  Heart, Cake, Briefcase, GraduationCap, TreePine, PartyPopper,
  Droplet, Sparkles, Globe, Calendar, Clock, Settings, Bell,
} from "lucide-react";
import type { PlanigateFeaturesWidgetSettings, PlanigateFeatureItem } from "@/lib/page-builder/types";
import { DEFAULT_PLANIGATE_FEATURES_SETTINGS } from "@/lib/page-builder/defaults";
import { staggerContainer, staggerItem, viewportOnce } from "./motion-variants";

const ICONS: Record<string, React.ComponentType<{ className?: string; size?: number; strokeWidth?: number }>> = {
  Mail, Users, LayoutGrid, Store, Heart, Cake, Briefcase, GraduationCap,
  TreePine, PartyPopper, Droplet, Sparkles, Globe, Calendar, Clock, Settings, Bell,
};

function Icon({ name, className }: { name: string; className?: string }) {
  const Comp = ICONS[name] ?? Sparkles;
  return <Comp className={className} />;
}

interface Props {
  settings: PlanigateFeaturesWidgetSettings;
}

export function PlanigateFeaturesWidget({ settings: raw }: Props) {
  const items: PlanigateFeatureItem[] = useMemo(() => {
    if (raw?.items?.length) return raw.items;
    return DEFAULT_PLANIGATE_FEATURES_SETTINGS.items;
  }, [raw]);

  return (
    <section
      className="relative"
      style={{ background: "var(--color-planigate-bg-section)" }}
    >
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 pb-10">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={staggerContainer}
        >
          {items.map((item) => (
            <FeatureCard key={item.id} item={item} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FeatureCard({ item }: { item: PlanigateFeatureItem }) {
  return (
    <motion.div variants={staggerItem}>
      <Link
        href={item.href}
        className="group relative flex flex-row items-start gap-4 rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full"
        style={{
          backgroundColor: "var(--color-planigate-surface)",
          borderColor: "var(--color-planigate-border)",
        }}
      >
        {/* gradient halo on hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(60% 50% at 0% 50%, color-mix(in srgb, var(--color-planigate-accent) 14%, transparent) 0%, transparent 100%)",
          }}
        />

        {/* Icon on the LEFT */}
        <div
          className="relative shrink-0 flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-6deg]"
          style={{ backgroundColor: item.iconBgColor }}
        >
          <Icon name={item.icon} className="size-[18px]" />
        </div>

        {/* Content on the RIGHT */}
        <div
          className="relative flex flex-col gap-1 min-w-0"
          style={{ color: "var(--color-planigate-fg-strong)" }}
        >
          <div
            className="text-[15px] font-semibold leading-tight"
            style={{ color: "var(--color-planigate-fg)" }}
          >
            {item.title}
          </div>
          <p
            className="text-[13px] leading-relaxed"
            style={{ color: "var(--color-planigate-fg-muted)" }}
          >
            {item.description}
          </p>
          <div
            className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium transition-colors"
            style={{ color: "var(--color-planigate-fg)" }}
          >
            <span className="relative">
              {item.linkText}
              <span
                className="absolute left-0 -bottom-0.5 h-px w-0 transition-all duration-300 group-hover:w-full"
                style={{ backgroundColor: "var(--color-planigate-accent)" }}
              />
            </span>
            <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
