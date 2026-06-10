"use client";

import { useState, useMemo, useEffect } from "react";
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

  const bgImages = useMemo(() => {
    const c = settings.collageImages;
    return [c.couple, c.dinner, c.toasting, c.laptop].filter(Boolean) as string[];
  }, [settings.collageImages]);

  const [bgIndex, setBgIndex] = useState(0);
  const [activePill, setActivePill] = useState<string>("");
  const [serviceQuery, setServiceQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  useEffect(() => {
    if (bgImages.length <= 1) return;
    const id = setInterval(() => setBgIndex((i) => (i + 1) % bgImages.length), 5500);
    return () => clearInterval(id);
  }, [bgImages.length]);

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, var(--color-planigate-bg-hero-from) 0%, var(--color-planigate-bg-hero-via) 60%, var(--color-planigate-bg-hero-to) 100%)",
      }}
    >
      {/* Background image slideshow */}
      {bgImages.map((src, i) => (
        <div
          key={i}
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: i === bgIndex ? 1 : 0,
            transition: "opacity 1.4s ease-in-out",
          }}
        >
          <Image src={src} alt="" fill sizes="100vw" className="object-cover" priority={i === 0} />
        </div>
      ))}

      {/* Cream overlay — keeps text readable */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "rgba(0, 0, 0, 0.62)" }}
      />

      {/* Subtle decorative wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 20% 20%, rgba(255,255,255,0.55) 0%, transparent 70%), radial-gradient(50% 40% at 85% 15%, rgba(232,213,180,0.45) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 pb-10 lg:pb-14">
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
                color: "#ffffff",
                fontFamily:
                  "var(--font-serif), 'Cormorant Garamond', 'Playfair Display', Georgia, serif",
                fontWeight: 500,
                fontSize: "clamp(2.75rem, 5.5vw, 4.25rem)",
                lineHeight: 1.02,
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
                  color: "#E8C97A",
                }}
              >
                {settings.headingPart2}
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-5 max-w-[360px] text-[14px] sm:text-[15px] leading-relaxed"
              style={{ color: "rgba(255,255,255,0.82)" }}
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
                style={{ color: "#ffffff" }}
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
                style={{ color: "rgba(255,255,255,0.70)" }}
              >
                {settings.ratingDividerText}
              </span>
            </motion.div>
          </motion.div>

          {/* RIGHT: image collage */}
          <div className="relative h-[320px] sm:h-[400px] md:h-[460px] lg:h-[440px] mx-auto w-full max-w-[520px] lg:max-w-none">
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
      {/* couple — top left, vertical portrait */}
      <motion.div
        variants={collagePiece(-1)}
        whileHover={{ scale: 1.03, rotate: 0, transition: { duration: 0.4 } }}
        className="absolute left-0 top-0 w-[42%] h-[72%] rounded-[22px] overflow-hidden shadow-xl ring-1 ring-black/5"
      >
        <Image src={images.couple} alt="" fill sizes="(max-width: 1024px) 50vw, 320px" className="object-cover" priority />
      </motion.div>

      {/* dinner — top right, BIG horizontal */}
      <motion.div
        variants={collagePiece(1)}
        whileHover={{ scale: 1.03, rotate: 0, transition: { duration: 0.4 } }}
        className="absolute right-0 top-0 w-[56%] h-[44%] rounded-[22px] overflow-hidden shadow-xl ring-1 ring-black/5"
      >
        <Image src={images.dinner} alt="" fill sizes="(max-width: 1024px) 50vw, 420px" className="object-cover" />
      </motion.div>

      {/* toasting — right middle, large */}
      <motion.div
        variants={collagePiece(-1)}
        whileHover={{ scale: 1.03, rotate: 0, transition: { duration: 0.4 } }}
        className="absolute right-[8%] top-[46%] w-[48%] h-[44%] rounded-[22px] overflow-hidden shadow-2xl ring-1 ring-black/5"
      >
        <Image src={images.toasting} alt="" fill sizes="(max-width: 1024px) 60vw, 380px" className="object-cover" />
      </motion.div>

      {/* laptop — overlay, center-bottom, larger */}
      <motion.div
        variants={collagePiece(-2)}
        whileHover={{ scale: 1.05, rotate: 0, y: -4, transition: { duration: 0.4 } }}
        animate={{ y: [0, -3, 0], transition: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
        className="absolute left-[10%] bottom-[8%] w-[46%] h-[30%] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/10 bg-card"
      >
        <Image src={images.laptop} alt="" fill sizes="(max-width: 1024px) 40vw, 360px" className="object-cover" />
      </motion.div>

      {/* phone — overlay, far right edge */}
      <motion.div
        variants={collagePiece(8)}
        whileHover={{ scale: 1.08, rotate: 4, transition: { duration: 0.4 } }}
        animate={{ y: [0, 4, 0], transition: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 } }}
        className="absolute right-[-2%] bottom-[8%] w-[19%] h-[38%] rounded-[26px] overflow-hidden shadow-2xl ring-[3px] ring-white"
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
  const [serviceFocused, setServiceFocused] = useState(false);
  const [locationFocused, setLocationFocused] = useState(false);

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
      className="w-full rounded-[28px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.35)] px-5 sm:px-8 pt-6 sm:pt-7 pb-5 sm:pb-6"
      style={{
        background: "rgba(255,255,255,0.15)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {/* "Vad planerar du?" + pills */}
      <div>
        <div
          className="text-[13px] font-medium"
          style={{ color: "#ffffff" }}
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
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            {settings.serviceInputLabel}
          </label>
          <div className="relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2"
              size={16}
              style={{ color: "rgba(255,255,255,0.45)" }}
            />
            <input
              type="text"
              value={serviceQuery}
              onChange={(e) => onServiceChange(e.target.value)}
              onFocus={() => setServiceFocused(true)}
              onBlur={() => setServiceFocused(false)}
              placeholder={settings.serviceInputPlaceholder}
              className="planigate-input w-full h-[50px] rounded-[14px] border pl-10 pr-4 text-sm focus:outline-none transition"
              style={{
                borderColor: serviceFocused ? "#E8C97A" : "rgba(255,255,255,0.25)",
                backgroundColor: "rgba(255,255,255,0.12)",
                color: "#ffffff",
              }}
            />
          </div>
        </div>

        {/* Location input */}
        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            {settings.locationInputLabel}
          </label>
          <div className="relative">
            <MapPin
              className="absolute left-3.5 top-1/2 -translate-y-1/2"
              size={16}
              style={{ color: "rgba(255,255,255,0.45)" }}
            />
            <input
              type="text"
              value={locationQuery}
              onChange={(e) => onLocationChange(e.target.value)}
              onFocus={() => setLocationFocused(true)}
              onBlur={() => setLocationFocused(false)}
              placeholder={settings.locationInputPlaceholder}
              className="planigate-input w-full h-[50px] rounded-[14px] border pl-10 pr-4 text-sm focus:outline-none transition"
              style={{
                borderColor: locationFocused ? "#E8C97A" : "rgba(255,255,255,0.25)",
                backgroundColor: "rgba(255,255,255,0.12)",
                color: "#ffffff",
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
          style={{ color: "rgba(255,255,255,0.90)" }}
        >
          <span className="relative">
            {settings.exploreLinkText}
            <span
              className="absolute left-0 -bottom-0.5 h-px w-0 transition-all duration-300 group-hover:w-full"
              style={{ backgroundColor: "#ffffff" }}
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
      whileHover={{ scale: 1.04, y: -2, color: "#E8C97A", borderColor: "#E8C97A" }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.15 }}
      className="group flex flex-col items-center justify-center gap-1.5 h-[68px] rounded-[14px] text-[12px] font-medium border hover:shadow-sm"
      style={{
        backgroundColor: active ? "rgba(232,201,122,0.15)" : "rgba(255,255,255,0.10)",
        borderColor: active ? "#E8C97A" : "rgba(255,255,255,0.25)",
        color: active ? "#E8C97A" : "#ffffff",
        boxShadow: active ? "0 0 0 1px rgba(232,201,122,0.3)" : undefined,
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

