"use client";

import { Plus, Trash2, GripVertical } from "lucide-react";
import type { EventCategoriesGridWidgetSettings, EventCategoryItem } from "@/lib/page-builder/types";
import { DEFAULT_EVENT_CATEGORIES_GRID_SETTINGS } from "@/lib/page-builder/defaults";
import {
  TextInput,
  NumberInput,
  ToggleSwitch,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";
import { ImageUpload } from "@/app/admin/appearance/landing-page/components/ui/image-upload";
import { useFieldAccordion } from "@/components/page-builder/settings/use-field-accordion";
import { Button } from "@/components/ui/button";

interface EventCategoriesGridSettingsPanelProps {
  settings: Partial<EventCategoriesGridWidgetSettings>;
  onChange: (settings: EventCategoriesGridWidgetSettings) => void;
  activeTab: "content" | "style" | "advanced";
  activeFieldId?: string | null;
}

export function EventCategoriesGridSettingsPanel({
  settings: partialSettings,
  onChange,
  activeTab,
  activeFieldId,
}: EventCategoriesGridSettingsPanelProps) {
  const { getAccordionProps } = useFieldAccordion(activeFieldId);

  const settings: EventCategoriesGridWidgetSettings = {
    ...DEFAULT_EVENT_CATEGORIES_GRID_SETTINGS,
    ...partialSettings,
    badge: {
      ...DEFAULT_EVENT_CATEGORIES_GRID_SETTINGS.badge,
      ...partialSettings.badge,
    },
    categories:
      partialSettings.categories?.length
        ? partialSettings.categories
        : DEFAULT_EVENT_CATEGORIES_GRID_SETTINGS.categories,
  };

  const updateField = <K extends keyof EventCategoriesGridWidgetSettings>(
    key: K,
    value: EventCategoriesGridWidgetSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  const updateCategory = (index: number, patch: Partial<EventCategoryItem>) => {
    const next = settings.categories.map((cat, i) =>
      i === index ? { ...cat, ...patch } : cat
    );
    updateField("categories", next);
  };

  const addCategory = () => {
    const next: EventCategoryItem = {
      id: `cat_${Date.now()}`,
      image: "",
      title: "New Category",
      subtitle: "Description here",
      href: "/planner/new",
    };
    updateField("categories", [...settings.categories, next]);
  };

  const removeCategory = (index: number) => {
    updateField("categories", settings.categories.filter((_, i) => i !== index));
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
                placeholder="Event Categories"
              />
            )}
            <TextInput
              label="Title"
              value={settings.title}
              onChange={(v) => updateField("title", v)}
              placeholder="Popular Event Types"
            />
            <TextInput
              label="Subtitle"
              value={settings.subtitle}
              onChange={(v) => updateField("subtitle", v)}
              placeholder="Find the perfect planning resources..."
            />
          </div>
        </AccordionSection>

        {/* Category Cards */}
        <AccordionSection title={`Category Cards (${settings.categories.length})`} defaultOpen {...getAccordionProps("categories")}>
          <div className="space-y-4">
            {settings.categories.map((cat, i) => (
              <div
                key={cat.id}
                className="rounded-lg border border-border p-3 space-y-3"
              >
                {/* Card header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <GripVertical size={14} className="text-muted-foreground/50" />
                    Card {i + 1}
                  </div>
                  {settings.categories.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      onClick={() => removeCategory(i)}
                    >
                      <Trash2 size={12} />
                    </Button>
                  )}
                </div>

                {/* Image */}
                <ImageUpload
                  label="Card Image"
                  value={cat.image}
                  onChange={(url) => updateCategory(i, { image: url })}
                />

                {/* Title */}
                <TextInput
                  label="Title"
                  value={cat.title}
                  onChange={(v) => updateCategory(i, { title: v })}
                  placeholder="Weddings"
                />

                {/* Subtitle */}
                <TextInput
                  label="Subtitle"
                  value={cat.subtitle}
                  onChange={(v) => updateCategory(i, { subtitle: v })}
                  placeholder="Plan your dream wedding"
                />

                {/* Link */}
                <TextInput
                  label="Link URL"
                  value={cat.href}
                  onChange={(v) => updateCategory(i, { href: v })}
                  placeholder="/planner/new?type=wedding"
                />
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={addCategory}
            >
              <Plus size={14} />
              Add Category Card
            </Button>
          </div>
        </AccordionSection>

      </div>
    );
  }

  // ── Style Tab ─────────────────────────────────────────────────────────────
  if (activeTab === "style") {
    return (
      <div className="space-y-4">
        <AccordionSection title="Grid Layout" defaultOpen {...getAccordionProps("grid")}>
          <div className="space-y-3">
            <NumberInput
              label="Card Height"
              value={settings.cardHeight}
              onChange={(v) => updateField("cardHeight", v)}
              min={180}
              max={500}
              step={20}
              unit="px"
            />
            <NumberInput
              label="Min Card Width"
              value={settings.minCardWidth}
              onChange={(v) => updateField("minCardWidth", v)}
              min={180}
              max={500}
              step={20}
              unit="px"
              description="Cards auto-fit in grid based on this minimum width"
            />
            <NumberInput
              label="Gap"
              value={settings.gap}
              onChange={(v) => updateField("gap", v)}
              min={0}
              max={64}
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
