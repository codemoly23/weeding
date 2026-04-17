"use client";

import { useMemo, useState, useCallback } from "react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import type { NewsletterCtaWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_NEWSLETTER_CTA_SETTINGS } from "@/lib/page-builder/defaults";
import { WidgetContainer } from "@/components/page-builder/shared/widget-container";

interface NewsletterCtaWidgetProps {
  settings: NewsletterCtaWidgetSettings;
  isPreview?: boolean;
}

function getLucideIcon(name?: string) {
  if (!name) return null;
  // If it's an emoji or single non-letter char, render as text
  if (!/^[A-Za-z]/.test(name)) return null;
  const icons = LucideIcons as unknown as Record<
    string,
    React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  >;
  if (icons[name]) return icons[name];
  const pascal = name
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
  return icons[pascal] || null;
}

export function NewsletterCtaWidget({
  settings: rawSettings,
  isPreview = false,
}: NewsletterCtaWidgetProps) {
  const s: NewsletterCtaWidgetSettings = useMemo(
    () => ({
      ...DEFAULT_NEWSLETTER_CTA_SETTINGS,
      ...rawSettings,
      badge: { ...DEFAULT_NEWSLETTER_CTA_SETTINGS.badge, ...rawSettings?.badge },
      title: { ...DEFAULT_NEWSLETTER_CTA_SETTINGS.title, ...rawSettings?.title },
      subtitle: { ...DEFAULT_NEWSLETTER_CTA_SETTINGS.subtitle, ...rawSettings?.subtitle },
      form: { ...DEFAULT_NEWSLETTER_CTA_SETTINGS.form, ...rawSettings?.form },
      disclaimer: {
        ...DEFAULT_NEWSLETTER_CTA_SETTINGS.disclaimer,
        ...rawSettings?.disclaimer,
      },
      background: {
        ...DEFAULT_NEWSLETTER_CTA_SETTINGS.background,
        ...rawSettings?.background,
      },
    }),
    [rawSettings]
  );

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState<string>("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (isPreview) return;
      if (!email.trim()) return;

      setStatus("loading");
      setMessage("");

      try {
        const res = await fetch("/api/newsletter/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.error || data?.message || "Subscription failed");
        }
        setStatus("success");
        setMessage(s.successMessage);
        setEmail("");
      } catch (err) {
        setStatus("error");
        setMessage(
          err instanceof Error && err.message ? err.message : s.errorMessage
        );
      }
    },
    [email, isPreview, s.successMessage, s.errorMessage]
  );

  const BadgeIcon = getLucideIcon(s.badge.icon);
  const alignClass =
    s.alignment === "center"
      ? "items-center text-center"
      : s.alignment === "right"
        ? "items-end text-right"
        : "items-start text-left";

  const titleSizeClass =
    s.title.size === "3xl"
      ? "text-4xl sm:text-5xl lg:text-6xl"
      : s.title.size === "2xl"
        ? "text-3xl sm:text-4xl lg:text-5xl"
        : s.title.size === "xl"
          ? "text-3xl sm:text-4xl"
          : "text-2xl sm:text-3xl";

  return (
    <WidgetContainer container={s.container}>
      <div
        className={cn("w-full flex flex-col", alignClass)}
        style={{
          background: s.background?.color,
          padding: s.background?.color ? "48px 24px" : undefined,
          borderRadius: s.background?.color ? 16 : undefined,
        }}
      >
        {/* Badge */}
        {s.badge.show && (
          <div
            className="inline-flex items-center gap-2 font-medium text-[13px] border rounded-full font-display"
            style={{
              padding: "6px 14px",
              backgroundColor: s.badge.bgColor,
              color: s.badge.textColor,
              borderColor: s.badge.borderColor,
              marginBottom: 16,
            }}
          >
            {BadgeIcon ? (
              <BadgeIcon className="h-4 w-4" />
            ) : s.badge.icon ? (
              <span>{s.badge.icon}</span>
            ) : null}
            <span>{s.badge.text}</span>
          </div>
        )}

        {/* Title (2-color) */}
        <h2
          className={cn("font-bold leading-tight font-display", titleSizeClass)}
          style={{
            color: s.title.color || "#ffffff",
            fontWeight: s.title.fontWeight || 700,
            marginBottom: 12,
          }}
        >
          {s.title.line1}{" "}
          <span style={{ color: s.title.line2Color || "#f97316" }}>
            {s.title.line2}
          </span>
        </h2>

        {/* Subtitle */}
        {s.subtitle.show && s.subtitle.text && (
          <p
            className="text-base sm:text-lg"
            style={{
              color: s.subtitle.color || "#cbd5e1",
              maxWidth: s.subtitle.maxWidth ? `${s.subtitle.maxWidth}px` : undefined,
              marginBottom: 24,
            }}
          >
            {s.subtitle.text}
          </p>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className={cn(
            "w-full flex gap-2",
            s.form.layout === "stacked" ? "flex-col" : "flex-col sm:flex-row"
          )}
          style={{ maxWidth: 520 }}
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={s.form.placeholder}
            disabled={status === "loading"}
            className="flex-1 px-4 py-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-orange-500/30"
            style={{
              background: s.form.inputBgColor || "#ffffff",
              color: s.form.inputTextColor || "#0f172a",
              border: `1px solid ${s.form.inputBorderColor || "transparent"}`,
              borderRadius: s.form.borderRadius ?? 12,
            }}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="font-display font-semibold text-sm px-6 py-3 transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{
              background: s.form.buttonBgColor || "#f97316",
              color: s.form.buttonTextColor || "#ffffff",
              borderRadius: s.form.borderRadius ?? 12,
              whiteSpace: "nowrap",
            }}
          >
            {status === "loading" ? "Subscribing..." : s.form.buttonText}
          </button>
        </form>

        {/* Status message */}
        {status !== "idle" && message && (
          <p
            className="mt-3 text-sm"
            style={{
              color:
                status === "success"
                  ? "#22c55e"
                  : status === "error"
                    ? "#ef4444"
                    : undefined,
            }}
          >
            {message}
          </p>
        )}

        {/* Disclaimer */}
        {s.disclaimer.show && s.disclaimer.text && (
          <p
            className="mt-3 text-xs"
            style={{ color: s.disclaimer.color || "#94a3b8" }}
          >
            {s.disclaimer.text}
          </p>
        )}
      </div>
    </WidgetContainer>
  );
}
