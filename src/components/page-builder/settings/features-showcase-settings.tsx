"use client";

import { Plus, Trash2, GripVertical } from "lucide-react";
import type { FeaturesShowcaseWidgetSettings, FeaturesShowcaseItem } from "@/lib/page-builder/types";
import { DEFAULT_FEATURES_SHOWCASE_SETTINGS } from "@/lib/page-builder/defaults";
import {
  TextInput,
  TextAreaInput,
  NumberInput,
  ToggleSwitch,
  SelectInput,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";
import { ImageUpload } from "@/app/admin/appearance/landing-page/components/ui/image-upload";
import { useFieldAccordion } from "@/components/page-builder/settings/use-field-accordion";
import { Button } from "@/components/ui/button";

interface FeaturesShowcaseSettingsPanelProps {
  settings: Partial<FeaturesShowcaseWidgetSettings>;
  onChange: (settings: FeaturesShowcaseWidgetSettings) => void;
  activeTab: "content" | "style" | "advanced";
  activeFieldId?: string | null;
}

export function FeaturesShowcaseSettingsPanel({
  settings: partialSettings,
  onChange,
  activeTab,
  activeFieldId,
}: FeaturesShowcaseSettingsPanelProps) {
  const { getAccordionProps } = useFieldAccordion(activeFieldId);

  const settings: FeaturesShowcaseWidgetSettings = {
    ...DEFAULT_FEATURES_SHOWCASE_SETTINGS,
    ...partialSettings,
    badge: {
      ...DEFAULT_FEATURES_SHOWCASE_SETTINGS.badge,
      ...partialSettings.badge,
    },
    items: partialSettings.items?.length
      ? partialSettings.items
      : DEFAULT_FEATURES_SHOWCASE_SETTINGS.items,
  };

  const updateField = <K extends keyof FeaturesShowcaseWidgetSettings>(
    key: K,
    value: FeaturesShowcaseWidgetSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  const updateItem = (index: number, patch: Partial<FeaturesShowcaseItem>) => {
    const next = settings.items.map((item, i) =>
      i === index ? { ...item, ...patch } : item
    );
    updateField("items", next);
  };

  const addItem = () => {
    const next: FeaturesShowcaseItem = {
      id: `feat_${Date.now()}`,
      title: "New Feature",
      image: "",
      icon: "Star",
      href: "/features",
    };
    updateField("items", [...settings.items, next]);
  };

  const removeItem = (index: number) => {
    updateField("items", settings.items.filter((_, i) => i !== index));
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
                placeholder="Powerful Features"
              />
            )}
            <TextInput
              label="Heading"
              value={settings.heading}
              onChange={(v) => updateField("heading", v)}
              placeholder="Everything You Need to Plan Amazing Events"
            />
            <TextInput
              label="Subheading"
              value={settings.subheading}
              onChange={(v) => updateField("subheading", v)}
              placeholder="From planning to execution..."
            />
          </div>
        </AccordionSection>

        {/* Feature Cards */}
        <AccordionSection title={`Feature Cards (${settings.items.length})`} defaultOpen {...getAccordionProps("items")}>
          <div className="space-y-4">
            {settings.items.map((item, i) => (
              <div
                key={item.id}
                className="rounded-lg border border-border p-3 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <GripVertical size={14} className="text-muted-foreground/50" />
                    Card {i + 1}
                  </div>
                  {settings.items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      onClick={() => removeItem(i)}
                    >
                      <Trash2 size={12} />
                    </Button>
                  )}
                </div>

                <ImageUpload
                  label="Card Image"
                  value={item.image}
                  onChange={(url) => updateItem(i, { image: url })}
                />

                <TextInput
                  label="Title"
                  value={item.title}
                  onChange={(v) => updateItem(i, { title: v })}
                  placeholder="Event Dashboard"
                />

                <TextAreaInput
                  label="Description"
                  value={item.description ?? ""}
                  onChange={(v) => updateItem(i, { description: v })}
                  placeholder="Brief description shown on card hover..."
                  rows={3}
                />

                <TextInput
                  label="Icon (Lucide name)"
                  value={item.icon}
                  onChange={(v) => updateItem(i, { icon: v })}
                  placeholder="LayoutGrid"
                />

                <TextInput
                  label="Link URL"
                  value={item.href ?? ""}
                  onChange={(v) => updateItem(i, { href: v })}
                  placeholder="/features/dashboard"
                />
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={addItem}
            >
              <Plus size={14} />
              Add Feature Card
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
                  placeholder="Explore All Features"
                />
                <TextInput
                  label="Button URL"
                  value={settings.ctaHref}
                  onChange={(v) => updateField("ctaHref", v)}
                  placeholder="/features"
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
        <AccordionSection title="Section Header" defaultOpen {...getAccordionProps("header-style")}>
          <div className="space-y-3">
            <NumberInput
              label="Heading Font Size"
              value={settings.headingFontSize ?? 46}
              onChange={(v) => updateField("headingFontSize", v)}
              min={20}
              max={96}
              step={2}
              unit="px"
            />
          </div>
        </AccordionSection>
        <AccordionSection title="Grid Layout" defaultOpen {...getAccordionProps("grid")}>
          <div className="space-y-3">
            <NumberInput
              label="Columns"
              value={settings.columns}
              onChange={(v) => updateField("columns", (v as 2 | 3))}
              min={2}
              max={3}
              step={1}
            />
            <SelectInput
              label="Card Shape"
              value={settings.cardAspectRatio ?? "1/1"}
              onChange={(v) => updateField("cardAspectRatio", v as "1/1" | "4/3" | "3/4" | "custom")}
              options={[
                { label: "Square (1:1)", value: "1/1" },
                { label: "Landscape (4:3)", value: "4/3" },
                { label: "Portrait (3:4)", value: "3/4" },
                { label: "Custom Height", value: "custom" },
              ]}
            />
            {(settings.cardAspectRatio ?? "1/1") === "custom" && (
              <NumberInput
                label="Card Height"
                value={settings.cardHeight}
                onChange={(v) => updateField("cardHeight", v)}
                min={180}
                max={480}
                step={20}
                unit="px"
              />
            )}
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
      </div>
    );
  }

  return null;
}
