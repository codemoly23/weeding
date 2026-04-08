"use client";

import { Plus, Trash2 } from "lucide-react";
import type { EventGalleryGridWidgetSettings, EventGalleryGridItem } from "@/lib/page-builder/types";
import { DEFAULT_EVENT_GALLERY_GRID_SETTINGS } from "@/lib/page-builder/defaults";
import {
  TextInput,
  NumberInput,
  ToggleSwitch,
  ColorPicker,
  SelectInput,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";
import { ImageUpload } from "@/app/admin/appearance/landing-page/components/ui/image-upload";
import { useFieldAccordion } from "@/components/page-builder/settings/use-field-accordion";
import { Button } from "@/components/ui/button";

interface EventGalleryGridSettingsPanelProps {
  settings: Partial<EventGalleryGridWidgetSettings>;
  onChange: (settings: EventGalleryGridWidgetSettings) => void;
  activeTab: "content" | "style" | "advanced";
  activeFieldId?: string | null;
}

function newItem(): EventGalleryGridItem {
  return {
    id: Date.now().toString(),
    title: "New Event",
    type: "Event",
    image: "",
    date: "",
    location: "",
    views: 0,
    href: "/planner/new",
  };
}

export function EventGalleryGridSettingsPanel({
  settings: partialSettings,
  onChange,
  activeTab,
  activeFieldId,
}: EventGalleryGridSettingsPanelProps) {
  const { getAccordionProps } = useFieldAccordion(activeFieldId);

  const settings: EventGalleryGridWidgetSettings = {
    ...DEFAULT_EVENT_GALLERY_GRID_SETTINGS,
    ...partialSettings,
    badge: {
      ...DEFAULT_EVENT_GALLERY_GRID_SETTINGS.badge,
      ...partialSettings?.badge,
    },
    items:
      partialSettings?.items?.length
        ? partialSettings.items
        : DEFAULT_EVENT_GALLERY_GRID_SETTINGS.items,
  };

  const update = <K extends keyof EventGalleryGridWidgetSettings>(
    key: K,
    value: EventGalleryGridWidgetSettings[K]
  ) => onChange({ ...settings, [key]: value });

  const updateItem = (index: number, patch: Partial<EventGalleryGridItem>) => {
    const next = settings.items.map((item, i) =>
      i === index ? { ...item, ...patch } : item
    );
    update("items", next);
  };

  const removeItem = (index: number) => {
    update("items", settings.items.filter((_, i) => i !== index));
  };

  const addItem = () => {
    update("items", [...settings.items, newItem()]);
  };

  // ── Content Tab ─────────────────────────────────────────────────────────────
  if (activeTab === "content") {
    return (
      <div className="space-y-4">

        {/* Section Header */}
        <AccordionSection title="Section Header" defaultOpen {...getAccordionProps("header")}>
          <div className="space-y-3">
            <ToggleSwitch
              label="Show Badge"
              checked={settings.badge.show}
              onChange={(v) => update("badge", { ...settings.badge, show: v })}
            />
            {settings.badge.show && (
              <>
                <TextInput
                  label="Badge Icon (Lucide name)"
                  value={settings.badge.icon}
                  onChange={(v) => update("badge", { ...settings.badge, icon: v })}
                  placeholder="Camera"
                />
                <TextInput
                  label="Badge Text"
                  value={settings.badge.text}
                  onChange={(v) => update("badge", { ...settings.badge, text: v })}
                  placeholder="Real Event Inspiration"
                />
              </>
            )}
            <TextInput
              label="Section Title"
              value={settings.title}
              onChange={(v) => update("title", v)}
              placeholder="Get Inspired by Real Events"
            />
            <TextInput
              label="Section Subtitle"
              value={settings.subtitle}
              onChange={(v) => update("subtitle", v)}
              placeholder="Explore stunning celebrations..."
            />
          </div>
        </AccordionSection>

        {/* Events / Items */}
        <AccordionSection
          title={`Events (${settings.items.length})`}
          defaultOpen
          {...getAccordionProps("items")}
        >
          <div className="space-y-3">
            {settings.items.map((item, index) => (
              <AccordionSection
                key={item.id}
                title={item.title || `Event ${index + 1}`}
                {...getAccordionProps(`item-${item.id}`)}
                action={
                  settings.items.length > 1
                    ? { label: "Remove", icon: Trash2, onClick: () => removeItem(index) }
                    : undefined
                }
              >
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Event Image</p>
                    <ImageUpload
                      value={item.image}
                      onChange={(url) => updateItem(index, { image: url })}
                    />
                  </div>
                  <TextInput
                    label="Event Title"
                    value={item.title}
                    onChange={(v) => updateItem(index, { title: v })}
                    placeholder="Emma & James Wedding"
                  />
                  <TextInput
                    label="Category (badge)"
                    value={item.type}
                    onChange={(v) => updateItem(index, { type: v })}
                    placeholder="Wedding"
                  />
                  <TextInput
                    label="Date"
                    value={item.date}
                    onChange={(v) => updateItem(index, { date: v })}
                    placeholder="June 20, 2026"
                  />
                  <TextInput
                    label="Location"
                    value={item.location}
                    onChange={(v) => updateItem(index, { location: v })}
                    placeholder="Miami, FL"
                  />
                  <NumberInput
                    label="Views"
                    value={item.views}
                    onChange={(v) => updateItem(index, { views: v })}
                    min={0}
                    step={1}
                  />
                  <TextInput
                    label="Link (Plan Similar href)"
                    value={item.href}
                    onChange={(v) => updateItem(index, { href: v })}
                    placeholder="/planner/new"
                  />
                </div>
              </AccordionSection>
            ))}

            {settings.items.length < 12 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={addItem}
              >
                <Plus size={14} />
                Add Event Card
              </Button>
            )}
          </div>
        </AccordionSection>

        {/* "Plan Similar" Button */}
        <AccordionSection title="Plan Similar Button" {...getAccordionProps("plan-similar")}>
          <div className="space-y-3">
            <TextInput
              label="Button Label"
              value={settings.planSimilarLabel}
              onChange={(v) => update("planSimilarLabel", v)}
              placeholder="Plan Similar"
            />
            <TextInput
              label="Override Link (leave blank to use each card's link)"
              value={settings.planSimilarHref}
              onChange={(v) => update("planSimilarHref", v)}
              placeholder="/planner/new"
            />
          </div>
        </AccordionSection>

        {/* CTA Button */}
        <AccordionSection title="View More Button" {...getAccordionProps("cta")}>
          <div className="space-y-3">
            <ToggleSwitch
              label="Show Button"
              checked={settings.showCta}
              onChange={(v) => update("showCta", v)}
            />
            {settings.showCta && (
              <>
                <TextInput
                  label="Button Label"
                  value={settings.ctaLabel}
                  onChange={(v) => update("ctaLabel", v)}
                  placeholder="View More Events"
                />
                <TextInput
                  label="Button Link"
                  value={settings.ctaHref}
                  onChange={(v) => update("ctaHref", v)}
                  placeholder="/events"
                />
              </>
            )}
          </div>
        </AccordionSection>

      </div>
    );
  }

  // ── Style Tab ──────────────────────────────────────────────────────────────
  if (activeTab === "style") {
    return (
      <div className="space-y-4">

        {/* Layout */}
        <AccordionSection title="Layout" defaultOpen {...getAccordionProps("layout")}>
          <div className="space-y-3">
            <SelectInput
              label="Columns"
              value={String(settings.columns)}
              onChange={(v) => update("columns", Number(v) as 2 | 3 | 4)}
              options={[
                { value: "2", label: "2 Columns" },
                { value: "3", label: "3 Columns (default)" },
                { value: "4", label: "4 Columns" },
              ]}
            />
          </div>
        </AccordionSection>

        {/* Section Background */}
        <AccordionSection title="Section Background" {...getAccordionProps("sectionBg")}>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Any valid CSS background value — color, gradient, etc.
            </p>
            <TextInput
              label="Background CSS"
              value={settings.sectionBg}
              onChange={(v) => update("sectionBg", v)}
              placeholder="linear-gradient(to bottom, #faf5ff, #ffffff)"
            />
            <div className="flex gap-2 flex-wrap mt-1">
              {[
                { label: "Purple fade", value: "linear-gradient(to bottom, #faf5ff, #ffffff)" },
                { label: "White", value: "#ffffff" },
                { label: "Light gray", value: "linear-gradient(to bottom, #ffffff, #f9fafb)" },
              ].map((preset) => (
                <button
                  key={preset.label}
                  className="text-xs px-2 py-1 rounded border border-input bg-background hover:bg-accent transition-colors"
                  onClick={() => update("sectionBg", preset.value)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </AccordionSection>

        {/* Card Category Badge Colors */}
        <AccordionSection title="Card Category Badge" {...getAccordionProps("cardBadge")}>
          <div className="space-y-3">
            <ColorPicker
              label="Gradient Start"
              value={settings.cardBadgeFrom}
              onChange={(v) => update("cardBadgeFrom", v)}
            />
            <ColorPicker
              label="Gradient End"
              value={settings.cardBadgeTo}
              onChange={(v) => update("cardBadgeTo", v)}
            />
          </div>
        </AccordionSection>

        {/* CTA Button Colors */}
        {settings.showCta && (
          <AccordionSection title="View More Button Colors" {...getAccordionProps("ctaColors")}>
            <div className="space-y-3">
              <ColorPicker
                label="Gradient Start"
                value={settings.ctaGradientFrom}
                onChange={(v) => update("ctaGradientFrom", v)}
              />
              <ColorPicker
                label="Gradient End"
                value={settings.ctaGradientTo}
                onChange={(v) => update("ctaGradientTo", v)}
              />
            </div>
          </AccordionSection>
        )}

      </div>
    );
  }

  return null;
}
