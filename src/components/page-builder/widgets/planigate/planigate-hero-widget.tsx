"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Heart, Cake, Briefcase, GraduationCap, TreePine, PartyPopper,
  Droplet, MoreHorizontal, Search, MapPin, ArrowRight, Star,
  Mail, Users, LayoutGrid, Store, Sparkles, Globe,
} from "lucide-react";
import type { PlanigateHeroWidgetSettings, PlanigateEventTypePill } from "@/lib/page-builder/types";
import { DEFAULT_PLANIGATE_HERO_SETTINGS } from "@/lib/page-builder/defaults";
import {
  fadeUp,
  fadeIn,
  staggerContainer,
  staggerItem,
  collagePiece,
  EASE_OUT,
} from "./motion-variants";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; size?: number; strokeWidth?: number }>> = {
  Heart, Cake, Briefcase, GraduationCap, TreePine, PartyPopper,
  Droplet, MoreHorizontal, Mail, Users, LayoutGrid, Store, Sparkles, Globe,
};

function PillIcon({ name, className }: { name: string; className?: string }) {
  const Comp = ICON_MAP[name] ?? Heart;
  return <Comp className={className} />;
}

interface Props {
  settings: PlanigateHeroWidgetSettings;
}

export function PlanigateHeroWidget({ settings: raw }: Props) {
  const settings = useMemo<PlanigateHeroWidgetSettings>(() => ({
    ...DEFAULT_PLANIGATE_HERO_SETTINGS,
    ...raw,
    collageImages: { ...DEFAULT_PLANIGATE_HERO_SETTINGS.collageImages, ...(raw?.collageImages ?? {}) },
    eventPills: raw?.eventPills?.length ? raw.eventPills : DEFAULT_PLANIGATE_HERO_SETTINGS.eventPills,
    avatars: raw?.avatars?.length ? raw.avatars : DEFAULT_PLANIGATE_HERO_SETTINGS.avatars,
  }), [raw]);

  const [activePill, setActivePill] = useState<string>("");
  const [serviceQuery, setServiceQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, var(--color-planigate-bg-hero-from) 0%, var(--color-planigate-bg-hero-via) 60%, var(--color-planigate-bg-hero-to) 100%)",
      }}
    >
      {/* Subtle decorative wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 20% 20%, rgba(255,255,255,0.55) 0%, transparent 70%), radial-gradient(50% 40% at 85% 15%, rgba(232,213,180,0.45) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 pb-10 lg:pb-14">
        {/* Top: two-column hero text + collage */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-10 lg:gap-12 items-end">
          {/* LEFT: copy */}
          <motion.div
            className="pt-2 lg:pt-4"
            initial="hidden"
            animate="show"
            variants={staggerContainer}
          >
            <motion.h1
              variants={fadeUp}
              style={{
                color: "var(--color-planigate-fg)",
                fontFamily:
                  "var(--font-serif), 'Cormorant Garamond', 'Playfair Display', Georgia, serif",
                fontWeight: 500,
                fontSize: "clamp(3rem, 5.5vw, 4.5rem)",
                lineHeight: 1.0,
                letterSpacing: "-0.01em",
              }}
            >
              <span style={{ fontStyle: "normal" }}>
                {settings.headingPart1}
              </span>
              <br />
              <span
                style={{
                  fontStyle: "italic",
                  color: "var(--color-planigate-accent)",
                }}
              >
                {settings.headingPart2}
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-5 max-w-[360px] text-[14px] sm:text-[15px] leading-relaxed"
              style={{ color: "var(--color-planigate-fg-muted)" }}
            >
              {settings.subtitle}
            </motion.p>

            {/* Trust row */}
            <motion.div
              variants={fadeUp}
              className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2"
            >
              {/* Avatars */}
              <div className="flex -space-x-2">
                {settings.avatars.slice(0, 4).map((src, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.08, duration: 0.4, ease: EASE_OUT }}
                    className="relative h-8 w-8 rounded-full overflow-hidden ring-2 ring-white shadow-sm"
                  >
                    <Image src={src} alt="" fill sizes="32px" className="object-cover" />
                  </motion.div>
                ))}
              </div>

              {/* Stars */}
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0, rotate: -30 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{
                      delay: 0.7 + i * 0.06,
                      duration: 0.3,
                      ease: "backOut",
                    }}
                  >
                    <Star
                      size={13}
                      style={{
                        fill: "var(--color-planigate-star)",
                        color: "var(--color-planigate-star)",
                      }}
                    />
                  </motion.span>
                ))}
              </div>

              {/* Count */}
              <span
                className="text-[13px] font-medium"
                style={{ color: "var(--color-planigate-fg)" }}
              >
                {settings.ratingCountText}
              </span>

              {/* Gold divider + tagline */}
              <span
                className="inline-block h-3.5 w-[2px]"
                style={{ backgroundColor: "var(--color-planigate-accent-light)" }}
                aria-hidden
              />
              <span
                className="text-[13px] max-w-[200px] leading-tight"
                style={{ color: "var(--color-planigate-fg-muted)" }}
              >
                {settings.ratingDividerText}
              </span>
            </motion.div>
          </motion.div>

          {/* RIGHT: image collage */}
          <div className="relative h-[360px] sm:h-[440px] md:h-[510px] lg:h-[530px] mx-auto w-full max-w-[540px] lg:max-w-none">
            <Collage images={settings.collageImages} />
          </div>
        </div>

        {/* Search Module — sits right after the hero content, slight overlap with next section */}
        <motion.div
          className="relative mt-6 lg:mt-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7, ease: EASE_OUT }}
        >
          <SearchModule
            settings={settings}
            activePill={activePill}
            onPillChange={setActivePill}
            serviceQuery={serviceQuery}
            onServiceChange={setServiceQuery}
            locationQuery={locationQuery}
            onLocationChange={setLocationQuery}
          />
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Image collage on the right side
// ─────────────────────────────────────────────

function Collage({ images }: { images: PlanigateHeroWidgetSettings["collageImages"] }) {
  // Slow gentle float — different phases per piece
  return (
    <motion.div
      className="absolute inset-0"
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
      }}
    >
      {/* couple — left, tall portrait fills most of height */}
      <motion.div
        variants={collagePiece(-1)}
        whileHover={{ scale: 1.03, rotate: 0, transition: { duration: 0.4 } }}
        className="absolute left-0 top-0 w-[44%] h-[85%] rounded-[22px] overflow-hidden shadow-xl ring-1 ring-black/5"
      >
        <Image src={images.couple} alt="" fill sizes="(max-width: 1024px) 50vw, 340px" className="object-cover object-top" priority />
      </motion.div>

      {/* dinner — top right, wide horizontal */}
      <motion.div
        variants={collagePiece(1)}
        whileHover={{ scale: 1.03, rotate: 0, transition: { duration: 0.4 } }}
        className="absolute right-0 top-0 w-[54%] h-[46%] rounded-[22px] overflow-hidden shadow-xl ring-1 ring-black/5"
      >
        <Image src={images.dinner} alt="" fill sizes="(max-width: 1024px) 50vw, 420px" className="object-cover" />
      </motion.div>

      {/* toasting — right, bottom half, flush with right edge */}
      <motion.div
        variants={collagePiece(-1)}
        whileHover={{ scale: 1.03, rotate: 0, transition: { duration: 0.4 } }}
        className="absolute right-0 top-[48%] w-[54%] h-[44%] rounded-[22px] overflow-hidden shadow-2xl ring-1 ring-black/5"
      >
        <Image src={images.toasting} alt="" fill sizes="(max-width: 1024px) 60vw, 400px" className="object-cover" />
      </motion.div>

      {/* laptop — floating overlay, center-bottom */}
      <motion.div
        variants={collagePiece(-2)}
        whileHover={{ scale: 1.05, rotate: 0, y: -4, transition: { duration: 0.4 } }}
        animate={{ y: [0, -3, 0], transition: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
        className="absolute left-[6%] bottom-[3%] w-[48%] h-[33%] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/10 bg-white"
      >
        <Image src={images.laptop} alt="" fill sizes="(max-width: 1024px) 40vw, 370px" className="object-cover" />
      </motion.div>

      {/* phone — far right overlay */}
      <motion.div
        variants={collagePiece(8)}
        whileHover={{ scale: 1.08, rotate: 4, transition: { duration: 0.4 } }}
        animate={{ y: [0, 4, 0], transition: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 } }}
        className="absolute right-[-2%] bottom-[3%] w-[18%] h-[44%] rounded-[26px] overflow-hidden shadow-2xl ring-[3px] ring-white"
      >
        <Image src={images.phone} alt="" fill sizes="(max-width: 1024px) 20vw, 150px" className="object-cover" />
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Search Module
// ─────────────────────────────────────────────

interface SearchModuleProps {
  settings: PlanigateHeroWidgetSettings;
  activePill: string;
  onPillChange: (value: string) => void;
  serviceQuery: string;
  onServiceChange: (value: string) => void;
  locationQuery: string;
  onLocationChange: (value: string) => void;
}

function SearchModule({
  settings,
  activePill,
  onPillChange,
  serviceQuery,
  onServiceChange,
  locationQuery,
  onLocationChange,
}: SearchModuleProps) {
  const router = useRouter();

  const handleStart = () => {
    const params = new URLSearchParams();
    if (activePill) params.set("type", activePill);
    if (serviceQuery) params.set("service", serviceQuery);
    if (locationQuery) params.set("location", locationQuery);
    const qs = params.toString();
    const target = qs ? `${settings.ctaHref}?${qs}` : settings.ctaHref;
    router.push(target);
  };

  return (
    <div
      className="w-full rounded-[28px] shadow-[0_30px_60px_-20px_rgba(80,60,30,0.18)] ring-1 ring-black/[0.04] px-5 sm:px-8 pt-6 sm:pt-7 pb-5 sm:pb-6"
      style={{ background: "var(--color-planigate-surface)" }}
    >
      {/* "Vad planerar du?" + pills */}
      <div>
        <div
          className="text-[13px] font-medium"
          style={{ color: "var(--color-planigate-fg)" }}
        >
          {settings.searchHeading}
        </div>
        <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-2">
          {settings.eventPills.map((pill) => (
            <Pill
              key={pill.id}
              pill={pill}
              active={pill.value === activePill}
              onClick={() => onPillChange(pill.value)}
            />
          ))}
        </div>
      </div>

      {/* Inputs row */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
        {/* Service input */}
        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--color-planigate-fg-muted)" }}
          >
            {settings.serviceInputLabel}
          </label>
          <div className="relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2"
              size={16}
              style={{ color: "var(--color-planigate-fg-placeholder)" }}
            />
            <input
              type="text"
              value={serviceQuery}
              onChange={(e) => onServiceChange(e.target.value)}
              placeholder={settings.serviceInputPlaceholder}
              className="planigate-input w-full h-[50px] rounded-[14px] border pl-10 pr-4 text-sm focus:outline-none transition"
              style={{
                borderColor: "var(--color-planigate-border)",
                backgroundColor: "var(--color-planigate-bg-input)",
                color: "var(--color-planigate-fg)",
              }}
            />
          </div>
        </div>

        {/* Location input */}
        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--color-planigate-fg-muted)" }}
          >
            {settings.locationInputLabel}
          </label>
          <div className="relative">
            <MapPin
              className="absolute left-3.5 top-1/2 -translate-y-1/2"
              size={16}
              style={{ color: "var(--color-planigate-fg-placeholder)" }}
            />
            <input
              type="text"
              value={locationQuery}
              onChange={(e) => onLocationChange(e.target.value)}
              placeholder={settings.locationInputPlaceholder}
              className="planigate-input w-full h-[50px] rounded-[14px] border pl-10 pr-4 text-sm focus:outline-none transition"
              style={{
                borderColor: "var(--color-planigate-border)",
                backgroundColor: "var(--color-planigate-bg-input)",
                color: "var(--color-planigate-fg)",
              }}
            />
          </div>
        </div>

        {/* CTA button */}
        <div className="flex items-end">
          <motion.button
            type="button"
            onClick={handleStart}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="group relative inline-flex items-center justify-center gap-2 h-[50px] rounded-[14px] px-6 text-sm font-medium text-white w-full md:w-auto whitespace-nowrap overflow-hidden"
            style={{ backgroundColor: "var(--color-planigate-fg)" }}
          >
            {/* shimmer */}
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative">{settings.ctaText}</span>
            <ArrowRight size={16} className="relative transition-transform duration-300 group-hover:translate-x-1" />
          </motion.button>
        </div>
      </div>

      {/* Explore link */}
      <div className="mt-4 text-center">
        <Link
          href={settings.exploreLinkHref}
          className="group inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          style={{ color: "var(--color-planigate-fg-strong)" }}
        >
          <span className="relative">
            {settings.exploreLinkText}
            <span
              className="absolute left-0 -bottom-0.5 h-px w-0 transition-all duration-300 group-hover:w-full"
              style={{ backgroundColor: "var(--color-planigate-fg)" }}
            />
          </span>
          <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

function Pill({
  pill,
  active,
  onClick,
}: {
  pill: PlanigateEventTypePill;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.15 }}
      className="group flex flex-col items-center justify-center gap-1.5 h-[68px] rounded-[14px] text-[12px] font-medium transition-colors border hover:shadow-sm"
      style={{
        backgroundColor: "var(--color-planigate-surface)",
        borderColor: active
          ? "var(--color-planigate-fg)"
          : "var(--color-planigate-border)",
        color: active
          ? "var(--color-planigate-fg)"
          : "var(--color-planigate-fg-strong)",
        boxShadow: active ? "0 1px 2px 0 rgba(0,0,0,0.05)" : undefined,
      }}
    >
      <PillIcon
        name={pill.icon}
        className="size-[18px] transition-transform duration-200 group-hover:scale-110"
      />
      <span className="leading-none">{pill.label}</span>
    </motion.button>
  );
}

