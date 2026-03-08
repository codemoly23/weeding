// ============================================
// SERVICE CHECKLIST CARD WIDGET
// Dark card with feature checklist and stats
// Used as standalone widget in hero section (paired with service-hero in "2-1" layout)
// ============================================

"use client";

import { Check } from "lucide-react";
import {
  useOptionalServiceContext,
} from "@/lib/page-builder/contexts/service-context";
import type { ServiceChecklistCardWidgetSettings } from "@/lib/page-builder/types";
import { WidgetContainer } from "@/components/page-builder/shared/widget-container";

// ============================================
// TAG COLORS
// ============================================

const TAG_STYLES: Record<string, { bg: string; color: string }> = {
  included: { bg: "rgba(74,222,128,0.15)", color: "#4ade80" },
  free: { bg: "rgba(251,191,36,0.15)", color: "#fbbf24" },
  addon: { bg: "rgba(251,146,60,0.15)", color: "#fb923c" },
  premium: { bg: "rgba(168,85,247,0.15)", color: "#a855f7" },
  custom: { bg: "rgba(255,255,255,0.1)", color: "rgba(250,248,244,0.6)" },
};

// ============================================
// DEFAULT SETTINGS
// ============================================

const DEFAULTS: ServiceChecklistCardWidgetSettings = {
  cardTitle: "What You Get",
  autoItems: true,
  manualItems: [],
  scrollable: false,
  maxHeight: 320,
  itemLimit: 5,
  showStats: true,
  stats: [
    { value: "1,200+", label: "Clients Served" },
    { value: "30+", label: "Countries" },
    { value: "4.9\u2605", label: "Rating" },
  ],
  backgroundColor: "#1b3a2d",
  accentColor: "#e84c1e",
  borderRadius: 20,
  shadow: "0 24px 64px rgba(27,58,45,0.22)",
};

// ============================================
// WIDGET COMPONENT
// ============================================

interface ServiceChecklistCardWidgetProps {
  settings: Partial<ServiceChecklistCardWidgetSettings>;
  isPreview?: boolean;
}

export function ServiceChecklistCardWidget({
  settings: partialSettings,
  isPreview = false,
}: ServiceChecklistCardWidgetProps) {
  const settings: ServiceChecklistCardWidgetSettings = {
    ...DEFAULTS,
    ...partialSettings,
  };

  const serviceContext = useOptionalServiceContext();

  // Determine checklist items
  const allItems = settings.autoItems
    ? (serviceContext?.service?.features || []).map((f) => ({
        text: typeof f === "string" ? f : f.text || String(f),
        tag: f.tag || "Included",
        tagType: (f.tagType || "included") as keyof typeof TAG_STYLES,
      }))
    : (settings.manualItems || []);

  // Apply scroll/limit logic
  const displayItems = settings.scrollable
    ? allItems
    : allItems.slice(0, settings.itemLimit || 5);

  const stats = settings.stats || [];

  // No service context and auto mode — show placeholder
  if (!serviceContext && settings.autoItems) {
    return (
      <WidgetContainer container={settings.container}>
        <ChecklistCardShell settings={settings}>
          {PLACEHOLDER_ITEMS.map((item, i) => (
            <ChecklistItem key={i} text={item.text} tag={item.tag} tagType={item.tagType} />
          ))}
          {settings.showStats && stats.length > 0 && <StatsRow stats={stats} />}
        </ChecklistCardShell>
        {isPreview && (
          <p className="mt-2 text-xs text-muted-foreground text-center">
            Preview — features load from service data
          </p>
        )}
      </WidgetContainer>
    );
  }

  // No items at all — hide
  if (displayItems.length === 0 && !isPreview) return null;

  return (
    <WidgetContainer container={settings.container}>
      <ChecklistCardShell settings={settings}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginBottom: settings.showStats && stats.length > 0 ? "24px" : 0,
            ...(settings.scrollable
              ? {
                  overflowY: "auto",
                  maxHeight: `${settings.maxHeight}px`,
                }
              : {}),
          }}
        >
          {displayItems.map((item, i) => (
            <ChecklistItem key={i} text={item.text} tag={item.tag} tagType={item.tagType} />
          ))}
        </div>
        {settings.showStats && stats.length > 0 && <StatsRow stats={stats} />}
      </ChecklistCardShell>
    </WidgetContainer>
  );
}

// ============================================
// CARD SHELL
// ============================================

function ChecklistCardShell({
  settings,
  children,
}: {
  settings: ServiceChecklistCardWidgetSettings;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: settings.backgroundColor,
        borderRadius: `${settings.borderRadius}px`,
        padding: "32px",
        color: "#faf8f4",
        position: "relative",
        overflow: "hidden",
        boxShadow: settings.shadow,
      }}
    >
      {/* Accent top line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: `linear-gradient(90deg, ${settings.accentColor}, ${adjustColor(settings.accentColor, 30)}, transparent)`,
        }}
      />

      {/* Card Title */}
      <div
        style={{
          fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
          fontSize: "11px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "1.4px",
          color: "rgba(250,248,244,0.4)",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Check style={{ width: "13px", height: "13px", opacity: 0.45 }} />
        {settings.cardTitle}
      </div>

      {children}
    </div>
  );
}

// ============================================
// CHECKLIST ITEM
// ============================================

function ChecklistItem({
  text,
  tag,
  tagType,
}: {
  text: string;
  tag: string;
  tagType: string;
}) {
  const tagStyle = TAG_STYLES[tagType] || TAG_STYLES.custom;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 14px",
        borderRadius: "10px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
        transition: "background 0.2s",
      }}
    >
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "8px",
          background: "#059669",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Check style={{ width: "14px", height: "14px", color: "#fff" }} />
      </div>
      <span
        style={{
          fontSize: "13px",
          fontWeight: 600,
          color: "#faf8f4",
          flex: 1,
          lineHeight: 1.4,
        }}
      >
        {text}
      </span>
      {tag && (
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: "100px",
            whiteSpace: "nowrap",
            background: tagStyle.bg,
            color: tagStyle.color,
          }}
        >
          {tag}
        </span>
      )}
    </div>
  );
}

// ============================================
// STATS ROW
// ============================================

function StatsRow({ stats }: { stats: Array<{ value: string; label: string }> }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: "20px",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {stats.map((stat, i) => (
        <div key={i} style={{ textAlign: "center" }}>
          <strong
            style={{
              fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
              fontSize: "20px",
              fontWeight: 800,
              color: "#ff6a3d",
              display: "block",
              letterSpacing: "-0.02em",
            }}
          >
            {stat.value}
          </strong>
          <span
            style={{
              fontSize: "10px",
              color: "rgba(250,248,244,0.4)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              fontWeight: 600,
            }}
          >
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================
// HELPERS
// ============================================

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, ((num >> 16) & 255) + amount);
  const g = Math.min(255, ((num >> 8) & 255) + amount);
  const b = Math.min(255, (num & 255) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// ============================================
// PLACEHOLDER DATA
// ============================================

const PLACEHOLDER_ITEMS = [
  { text: "Articles of Organization", tag: "Included", tagType: "included" },
  { text: "Operating Agreement", tag: "Free ($79 value)", tagType: "free" },
  { text: "State Filing & Processing", tag: "Included", tagType: "included" },
  { text: "Compliance Checklist", tag: "Included", tagType: "included" },
  { text: "Digital Document Delivery", tag: "Included", tagType: "included" },
];
