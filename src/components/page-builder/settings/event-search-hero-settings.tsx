"use client";

import type { EventSearchHeroWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_EVENT_SEARCH_HERO_SETTINGS } from "@/lib/page-builder/defaults";
import {
  TextInput,
  NumberInput,
  ToggleSwitch,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";
import { ImageUpload } from "@/app/admin/appearance/landing-page/components/ui/image-upload";
import { useFieldAccordion } from "@/components/page-builder/settings/use-field-accordion";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface EventSearchHeroSettingsPanelProps {
  settings: Partial<EventSearchHeroWidgetSettings>;
  onChange: (settings: EventSearchHeroWidgetSettings) => void;
  activeTab: "content" | "style" | "advanced";
  activeFieldId?: string | null;
}

export function EventSearchHeroSettingsPanel({
  settings: partialSettings,
  onChange,
  activeTab,
  activeFieldId,
}: EventSearchHeroSettingsPanelProps) {
  const { getAccordionProps } = useFieldAccordion(activeFieldId);

  const settings: EventSearchHeroWidgetSettings = {
    ...DEFAULT_EVENT_SEARCH_HERO_SETTINGS,
    ...partialSettings,
    backgroundImages:
      partialSettings.backgroundImages?.length
        ? partialSettings.backgroundImages
        : DEFAULT_EVENT_SEARCH_HERO_SETTINGS.backgroundImages,
    eventTypes:
      partialSettings.eventTypes?.length
        ? partialSettings.eventTypes
        : DEFAULT_EVENT_SEARCH_HERO_SETTINGS.eventTypes,
  };

  const updateField = <K extends keyof EventSearchHeroWidgetSettings>(
    key: K,
    value: EventSearchHeroWidgetSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  // ── Content Tab ────────────────────────────────────────────────────────────
  if (activeTab === "content") {
    return (
      <div className="space-y-4">

        {/* Hero Text */}
        <AccordionSection title="Hero Text" defaultOpen {...getAccordionProps("text")}>
          <div className="space-y-3">
            <TextInput
              label="Title"
              value={settings.title}
              onChange={(v) => updateField("title", v)}
              placeholder="Plan Your Perfect Event"
            />
            <TextInput
              label="Subtitle"
              value={settings.subtitle}
              onChange={(v) => updateField("subtitle", v)}
              placeholder="Discover amazing venues..."
            />
          </div>
        </AccordionSection>

        {/* Background Images */}
        <AccordionSection title="Background Images" defaultOpen {...getAccordionProps("images")}>
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Images auto-rotate with a cross-fade transition. Recommended: 1920×1080px.
            </p>

            {settings.backgroundImages.map((src, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    Image {i + 1}
                  </span>
                  {settings.backgroundImages.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      onClick={() => {
                        const next = settings.backgroundImages.filter((_, idx) => idx !== i);
                        updateField("backgroundImages", next);
                      }}
                    >
                      <Trash2 size={12} />
                    </Button>
                  )}
                </div>
                <ImageUpload
                  value={src}
                  onChange={(url) => {
                    const next = [...settings.backgroundImages];
                    next[i] = url;
                    updateField("backgroundImages", next);
                  }}
                />
              </div>
            ))}

            {settings.backgroundImages.length < 5 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() =>
                  updateField("backgroundImages", [...settings.backgroundImages, ""])
                }
              >
                <Plus size={14} />
                Add Image
              </Button>
            )}

            <NumberInput
              label="Autoplay Interval"
              value={settings.autoplayInterval}
              onChange={(v) => updateField("autoplayInterval", v)}
              min={2000}
              max={15000}
              step={500}
              unit="ms"
            />
          </div>
        </AccordionSection>

        {/* Search Form Fields */}
        <AccordionSection title="Search Form" defaultOpen {...getAccordionProps("search")}>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Options for each field are managed in{" "}
              <strong>Admin → Search Options</strong>.
            </p>
            <ToggleSwitch
              label="Show Place Field"
              checked={settings.showEventTypeField}
              onChange={(v) => updateField("showEventTypeField", v)}
            />
            {settings.showEventTypeField && (
              <TextInput
                label="Place Dropdown Label"
                value={settings.eventTypeLabel}
                onChange={(v) => updateField("eventTypeLabel", v)}
              />
            )}

            <ToggleSwitch
              label="Show Service Field"
              checked={settings.showLocationField}
              onChange={(v) => updateField("showLocationField", v)}
            />
            {settings.showLocationField && (
              <TextInput
                label="Service Dropdown Label"
                value={settings.locationLabel}
                onChange={(v) => updateField("locationLabel", v)}
              />
            )}

            <ToggleSwitch
              label="Show Location Field"
              checked={settings.showDateField}
              onChange={(v) => updateField("showDateField", v)}
            />
            {settings.showDateField && (
              <TextInput
                label="Location Dropdown Label"
                value={settings.dateLabel}
                onChange={(v) => updateField("dateLabel", v)}
              />
            )}
          </div>
        </AccordionSection>

        {/* Search Button */}
        <AccordionSection title="Search Button" {...getAccordionProps("button")}>
          <div className="space-y-3">
            <TextInput
              label="Button Label"
              value={settings.searchButtonLabel}
              onChange={(v) => updateField("searchButtonLabel", v)}
              placeholder="Search Events"
            />
            <TextInput
              label="Search Results URL"
              value={settings.searchButtonHref}
              onChange={(v) => updateField("searchButtonHref", v)}
              placeholder="/vendors"
            />
          </div>
        </AccordionSection>

      </div>
    );
  }

  // ── Style Tab ─────────────────────────────────────────────────────────────
  if (activeTab === "style") {
    return (
      <div className="space-y-4">
        <AccordionSection title="Overlay" defaultOpen {...getAccordionProps("overlay")}>
          <div className="space-y-3">
            <NumberInput
              label="Overlay Opacity (Top)"
              value={Math.round(settings.overlayOpacityTop * 100)}
              onChange={(v) => updateField("overlayOpacityTop", v / 100)}
              min={0}
              max={90}
              step={5}
              unit="%"
            />
            <NumberInput
              label="Overlay Opacity (Bottom)"
              value={Math.round(settings.overlayOpacityBottom * 100)}
              onChange={(v) => updateField("overlayOpacityBottom", v / 100)}
              min={0}
              max={90}
              step={5}
              unit="%"
            />
          </div>
        </AccordionSection>
      </div>
    );
  }

  return null;
}
