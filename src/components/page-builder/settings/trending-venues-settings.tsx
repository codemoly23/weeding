"use client";

import { Plus, Trash2, GripVertical } from "lucide-react";
import type { TrendingVenuesWidgetSettings, TrendingVenueItem, VenueBadgeColor } from "@/lib/page-builder/types";
import { DEFAULT_TRENDING_VENUES_SETTINGS } from "@/lib/page-builder/defaults";
import {
  TextInput,
  NumberInput,
  ToggleSwitch,
  SelectInput,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";
import { ImageUpload } from "@/app/admin/appearance/landing-page/components/ui/image-upload";
import { useFieldAccordion } from "@/components/page-builder/settings/use-field-accordion";
import { Button } from "@/components/ui/button";

interface TrendingVenuesSettingsPanelProps {
  settings: Partial<TrendingVenuesWidgetSettings>;
  onChange: (settings: TrendingVenuesWidgetSettings) => void;
  activeTab: "content" | "style" | "advanced";
  activeFieldId?: string | null;
}

const BADGE_COLOR_OPTIONS = [
  { value: "none", label: "None" },
  { value: "purple", label: "Purple (Popular)" },
  { value: "orange", label: "Orange (Featured)" },
  { value: "green", label: "Green (New)" },
];

export function TrendingVenuesSettingsPanel({
  settings: partialSettings,
  onChange,
  activeTab,
  activeFieldId,
}: TrendingVenuesSettingsPanelProps) {
  const { getAccordionProps } = useFieldAccordion(activeFieldId);

  const settings: TrendingVenuesWidgetSettings = {
    ...DEFAULT_TRENDING_VENUES_SETTINGS,
    ...partialSettings,
    badge: {
      ...DEFAULT_TRENDING_VENUES_SETTINGS.badge,
      ...partialSettings.badge,
    },
    venues: partialSettings.venues?.length
      ? partialSettings.venues
      : DEFAULT_TRENDING_VENUES_SETTINGS.venues,
  };

  const updateField = <K extends keyof TrendingVenuesWidgetSettings>(
    key: K,
    value: TrendingVenuesWidgetSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  const updateVenue = (index: number, patch: Partial<TrendingVenueItem>) => {
    const next = settings.venues.map((v, i) =>
      i === index ? { ...v, ...patch } : v
    );
    updateField("venues", next);
  };

  const addVenue = () => {
    const next: TrendingVenueItem = {
      id: `venue_${Date.now()}`,
      image: "",
      badge: { text: "Popular", color: "purple" },
      name: "New Venue",
      location: "City, State",
      rating: 4.5,
      reviewCount: 10,
      tags: ["100 guests"],
      price: 3000,
      priceUnit: "/day",
      href: "/venues/new-venue",
    };
    updateField("venues", [...settings.venues, next]);
  };

  const removeVenue = (index: number) => {
    updateField("venues", settings.venues.filter((_, i) => i !== index));
  };

  // ── Content Tab ───────────────────────────────────────────────────────────
  if (activeTab === "content") {
    return (
      <div className="space-y-4">

        {/* Section Header */}
        <AccordionSection title="Section Header" defaultOpen {...getAccordionProps("header")}>
          <div className="space-y-3">
            <ToggleSwitch
              label="Show Badge"
              checked={settings.badge.show}
              onChange={(v) => updateField("badge", { ...settings.badge, show: v })}
            />
            {settings.badge.show && (
              <TextInput
                label="Badge Text"
                value={settings.badge.text}
                onChange={(v) => updateField("badge", { ...settings.badge, text: v })}
                placeholder="Handpicked for You"
              />
            )}
            <TextInput
              label="Heading"
              value={settings.heading}
              onChange={(v) => updateField("heading", v)}
              placeholder="Trending Venues"
            />
            <TextInput
              label="Subheading"
              value={settings.subheading}
              onChange={(v) => updateField("subheading", v)}
              placeholder="Discover the most sought-after event spaces..."
            />
          </div>
        </AccordionSection>

        {/* Venue Cards */}
        <AccordionSection title={`Venue Cards (${settings.venues.length})`} defaultOpen {...getAccordionProps("venues")}>
          <div className="space-y-4">
            {settings.venues.map((venue, i) => (
              <div
                key={venue.id}
                className="rounded-lg border border-border p-3 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <GripVertical size={14} className="text-muted-foreground/50" />
                    Venue {i + 1}
                  </div>
                  {settings.venues.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      onClick={() => removeVenue(i)}
                    >
                      <Trash2 size={12} />
                    </Button>
                  )}
                </div>

                <ImageUpload
                  label="Image"
                  value={venue.image}
                  onChange={(url) => updateVenue(i, { image: url })}
                />

                <TextInput
                  label="Venue Name"
                  value={venue.name}
                  onChange={(v) => updateVenue(i, { name: v })}
                  placeholder="Historic Mansion"
                />

                <TextInput
                  label="Location"
                  value={venue.location}
                  onChange={(v) => updateVenue(i, { location: v })}
                  placeholder="Charleston, SC"
                />

                <div className="grid grid-cols-2 gap-2">
                  <NumberInput
                    label="Rating"
                    value={venue.rating}
                    onChange={(v) => updateVenue(i, { rating: Math.min(5, Math.max(0, v)) })}
                    min={0}
                    max={5}
                    step={0.1}
                  />
                  <NumberInput
                    label="Reviews"
                    value={venue.reviewCount}
                    onChange={(v) => updateVenue(i, { reviewCount: v })}
                    min={0}
                    step={1}
                  />
                </div>

                <TextInput
                  label="Tags (comma separated)"
                  value={venue.tags.join(", ")}
                  onChange={(v) =>
                    updateVenue(i, {
                      tags: v.split(",").map((t) => t.trim()).filter(Boolean),
                    })
                  }
                  placeholder="180 guests, Historic"
                />

                <div className="grid grid-cols-2 gap-2">
                  <NumberInput
                    label="Price"
                    value={venue.price}
                    onChange={(v) => updateVenue(i, { price: v })}
                    min={0}
                    step={100}
                  />
                  <TextInput
                    label="Unit"
                    value={venue.priceUnit}
                    onChange={(v) => updateVenue(i, { priceUnit: v })}
                    placeholder="/day"
                  />
                </div>

                <SelectInput
                  label="Badge Color"
                  value={venue.badge.color}
                  options={BADGE_COLOR_OPTIONS}
                  onChange={(v) =>
                    updateVenue(i, { badge: { ...venue.badge, color: v as VenueBadgeColor } })
                  }
                />

                {venue.badge.color !== "none" && (
                  <TextInput
                    label="Badge Text"
                    value={venue.badge.text}
                    onChange={(v) => updateVenue(i, { badge: { ...venue.badge, text: v } })}
                    placeholder="Popular"
                  />
                )}

                <TextInput
                  label="Link URL"
                  value={venue.href ?? ""}
                  onChange={(v) => updateVenue(i, { href: v })}
                  placeholder="/venues/historic-mansion"
                />
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={addVenue}
            >
              <Plus size={14} />
              Add Venue Card
            </Button>
          </div>
        </AccordionSection>

        {/* CTA */}
        <AccordionSection title="CTA Button" {...getAccordionProps("cta")}>
          <div className="space-y-3">
            <ToggleSwitch
              label="Show CTA Button"
              checked={settings.showCta}
              onChange={(v) => updateField("showCta", v)}
            />
            {settings.showCta && (
              <>
                <TextInput
                  label="Button Text"
                  value={settings.ctaText}
                  onChange={(v) => updateField("ctaText", v)}
                  placeholder="View All Venues"
                />
                <TextInput
                  label="Button URL"
                  value={settings.ctaHref}
                  onChange={(v) => updateField("ctaHref", v)}
                  placeholder="/venues"
                />
              </>
            )}
          </div>
        </AccordionSection>

      </div>
    );
  }

  // ── Style Tab ─────────────────────────────────────────────────────────────
  if (activeTab === "style") {
    return (
      <div className="space-y-4">
        <AccordionSection title="View Mode" defaultOpen {...getAccordionProps("viewMode")}>
          <div className="space-y-3">
            <SelectInput
              label="View Mode"
              value={settings.viewMode ?? "grid"}
              options={[
                { value: "grid", label: "Grid" },
                { value: "marquee", label: "Marquee (Auto-scroll)" },
              ]}
              onChange={(v) => updateField("viewMode", v as "grid" | "marquee")}
            />
          </div>
        </AccordionSection>
        {(settings.viewMode ?? "grid") === "grid" && (
          <AccordionSection title="Grid Layout" defaultOpen {...getAccordionProps("grid")}>
            <div className="space-y-3">
              <NumberInput
                label="Columns"
                value={settings.columns}
                onChange={(v) => updateField("columns", (v as 2 | 3 | 4))}
                min={2}
                max={4}
                step={1}
              />
              <NumberInput
                label="Gap"
                value={settings.gap}
                onChange={(v) => updateField("gap", v)}
                min={0}
                max={48}
                step={4}
                unit="px"
              />
            </div>
          </AccordionSection>
        )}
      </div>
    );
  }

  return null;
}
