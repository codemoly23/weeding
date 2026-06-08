"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { PlanigateCtaWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_PLANIGATE_CTA_SETTINGS } from "@/lib/page-builder/defaults";
import { fadeUp, viewportOnce, EASE_OUT } from "./motion-variants";

interface Props {
  settings: PlanigateCtaWidgetSettings;
}

export function PlanigateCtaWidget({ settings: raw }: Props) {
  const settings = useMemo<PlanigateCtaWidgetSettings>(() => ({
    ...DEFAULT_PLANIGATE_CTA_SETTINGS,
    ...raw,
  }), [raw]);

  return (
    <section
      className="relative"
      style={{ background: "var(--color-planigate-bg-section)" }}
    >
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.7, ease: EASE_OUT }}
          className="group relative overflow-hidden rounded-[28px] border transition-shadow duration-500 hover:shadow-[0_25px_50px_-15px_rgba(80,60,30,0.12)]"
          style={{
            backgroundColor: "var(--color-planigate-bg-card)",
            borderColor: "color-mix(in srgb, var(--color-planigate-border-soft) 70%, transparent)",
          }}
        >
          <div className="relative grid grid-cols-1 lg:grid-cols-[1.25fr_1fr_1.15fr] gap-0 items-stretch min-h-[200px]">
            {/* Left: heading + subtitle */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              variants={fadeUp}
              className="px-6 sm:px-10 py-10 lg:py-9 flex flex-col justify-center"
            >
              <h2
                className="max-w-[380px]"
                style={{
                  color: "var(--color-planigate-fg)",
                  fontFamily:
                    "var(--font-serif), 'Cormorant Garamond', 'Playfair Display', Georgia, serif",
                  fontWeight: 500,
                  fontSize: "clamp(1.625rem, 2.6vw, 2rem)",
                  lineHeight: 1.15,
                  letterSpacing: "-0.005em",
                }}
              >
                {settings.heading}
              </h2>
              <p
                className="mt-3 text-[13px] sm:text-[14px] max-w-[380px]"
                style={{ color: "var(--color-planigate-fg-soft)" }}
              >
                {settings.subtitle}
              </p>
            </motion.div>

            {/* Center: primary button + secondary text link */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              variants={fadeUp}
              className="px-6 sm:px-4 pb-10 lg:py-9 flex flex-col items-center justify-center gap-3.5"
            >
              <motion.div
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href={settings.primaryButtonHref}
                  className="group/btn relative inline-flex items-center justify-center gap-2 h-[48px] rounded-[14px] px-7 text-sm font-medium text-white overflow-hidden whitespace-nowrap"
                  style={{ backgroundColor: "var(--color-planigate-fg)" }}
                >
                  {/* shimmer */}
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                  <span className="relative">{settings.primaryButtonText}</span>
                </Link>
              </motion.div>

              <Link
                href={settings.secondaryButtonHref}
                className="group/link inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors whitespace-nowrap"
                style={{ color: "var(--color-planigate-fg-strong)" }}
              >
                <span className="relative">
                  {settings.secondaryButtonText}
                  <span
                    className="absolute left-0 -bottom-0.5 h-px w-0 transition-all duration-300 group-hover/link:w-full"
                    style={{ backgroundColor: "var(--color-planigate-fg)" }}
                  />
                </span>
                <ArrowRight size={14} className="transition-transform duration-300 group-hover/link:translate-x-0.5" />
              </Link>
            </motion.div>

            {/* Right: image with soft left-edge fade into the card */}
            <div className="relative h-[200px] lg:h-auto min-h-[200px] overflow-hidden">
              <Image
                src={settings.backgroundImage}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 480px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              {/* Left-edge fade: card background blends INTO the image */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 w-[45%]"
                style={{
                  background:
                    "linear-gradient(to right, var(--color-planigate-bg-card) 0%, color-mix(in srgb, var(--color-planigate-bg-card) 60%, transparent) 35%, transparent 100%)",
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
