"use client";

import type { VendorListingWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_VENDOR_LISTING_SETTINGS } from "@/lib/page-builder/defaults";
import {
  TextInput,
  NumberInput,
  ToggleSwitch,
  ColorPicker,
  SelectInput,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";

interface VendorListingSettingsPanelProps {
  settings: Partial<VendorListingWidgetSettings>;
  onChange: (settings: VendorListingWidgetSettings) => void;
  activeTab: "content" | "style" | "advanced";
  activeFieldId?: string | null;
}

export function VendorListingSettingsPanel({
  settings: partialSettings,
  onChange,
  activeTab,
}: VendorListingSettingsPanelProps) {
  const settings: VendorListingWidgetSettings = {
    ...DEFAULT_VENDOR_LISTING_SETTINGS,
    ...partialSettings,
    badge: {
      ...DEFAULT_VENDOR_LISTING_SETTINGS.badge,
      ...partialSettings?.badge,
    },
    container: {
      ...DEFAULT_VENDOR_LISTING_SETTINGS.container,
      ...partialSettings?.container,
    },
  };

  const update = <K extends keyof VendorListingWidgetSettings>(
    key: K,
    value: VendorListingWidgetSettings[K]
  ) => onChange({ ...settings, [key]: value });

  const CATEGORY_OPTIONS = [
    { value: "all", label: "All Categories" },
    { value: "photography", label: "Photography" },
    { value: "catering", label: "Catering" },
    { value: "venue", label: "Venue" },
    { value: "music", label: "Music & Entertainment" },
    { value: "floristry", label: "Floristry" },
    { value: "decoration", label: "Decoration" },
    { value: "transport", label: "Transport" },
    { value: "cake", label: "Cake & Pastry" },
    { value: "makeup", label: "Hair & Makeup" },
  ];

  if (activeTab === "content") {
    return (
      <div className="space-y-4">
        <AccordionSection title="Section Header" defaultOpen>
          <div className="space-y-3">
            <ToggleSwitch
              label="Show Badge"
              checked={settings.badge.show}
              onChange={(v) => update("badge", { ...settings.badge, show: v })}
            />
            {settings.badge.show && (
              <TextInput
                label="Badge Text"
                value={settings.badge.text}
                onChange={(v) => update("badge", { ...settings.badge, text: v })}
                placeholder="Top Vendors"
              />
            )}
            <TextInput
              label="Heading"
              value={settings.title}
              onChange={(v) => update("title", v)}
              placeholder="Featured Vendors"
            />
            <TextInput
              label="Subheading"
              value={settings.subtitle}
              onChange={(v) => update("subtitle", v)}
              placeholder="Connect with verified event professionals"
            />
          </div>
        </AccordionSection>

        <AccordionSection title="Data Filter" defaultOpen>
          <div className="space-y-3">
            <SelectInput
              label="Category"
              value={settings.category || "all"}
              onChange={(v) => update("category", v === "all" ? "" : v)}
              options={CATEGORY_OPTIONS}
            />
            <NumberInput
              label="Max Vendors to Show"
              value={settings.limit}
              onChange={(v) => update("limit", v)}
              min={1}
              max={12}
            />
            <ToggleSwitch
              label="Featured Only"
              checked={settings.featuredOnly}
              onChange={(v) => update("featuredOnly", v)}
            />
            <ToggleSwitch
              label="Show View All Button"
              checked={settings.showViewAll}
              onChange={(v) => update("showViewAll", v)}
            />
            {settings.showViewAll && (
              <>
                <TextInput
                  label="Button Text"
                  value={settings.viewAllText ?? "View All Vendors"}
                  onChange={(v) => update("viewAllText", v)}
                  placeholder="View All Vendors"
                />
                <TextInput
                  label="Button Link"
                  value={settings.viewAllLink ?? "/vendors"}
                  onChange={(v) => update("viewAllLink", v)}
                  placeholder="/vendors"
                />
              </>
            )}
          </div>
        </AccordionSection>
      </div>
    );
  }

  if (activeTab === "style") {
    return (
      <div className="space-y-4">
        <AccordionSection title="Section Header" defaultOpen>
          <div className="space-y-3">
            <ColorPicker
              label="Header Text Color"
              value={settings.headerTextColor ?? "#0f172a"}
              onChange={(v) => update("headerTextColor", v)}
            />
            <NumberInput
              label="Heading Font Size"
              value={settings.headingFontSize ?? 30}
              onChange={(v) => update("headingFontSize", v)}
              min={20}
              max={96}
              step={2}
              unit="px"
            />
          </div>
        </AccordionSection>

        <AccordionSection title="Layout">
          <div className="space-y-3">
            <SelectInput
              label="Card Style"
              value={settings.cardStyle ?? "overlay"}
              onChange={(v) => update("cardStyle", v as "overlay" | "standard")}
              options={[
                { value: "overlay", label: "Overlay (image + text on top)" },
                { value: "standard", label: "Standard (text below image)" },
              ]}
            />
            <SelectInput
              label="Columns"
              value={String(settings.columns)}
              onChange={(v) => update("columns", Number(v) as 2 | 3 | 4)}
              options={[
                { value: "2", label: "2 Columns" },
                { value: "3", label: "3 Columns" },
                { value: "4", label: "4 Columns" },
              ]}
            />
          </div>
        </AccordionSection>

        <AccordionSection title="Section Background">
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Any valid CSS background value — color, gradient, etc.
            </p>
            <TextInput
              label="Background CSS"
              value={settings.sectionBg ?? ""}
              onChange={(v) => update("sectionBg", v)}
              placeholder="linear-gradient(to bottom, #f9fafb, #ffffff)"
            />
            <div className="flex gap-2 flex-wrap mt-1">
              {[
                { label: "Purple fade", value: "linear-gradient(to bottom, #faf5ff, #ffffff)" },
                { label: "White", value: "#ffffff" },
                { label: "Light gray", value: "linear-gradient(to bottom, #f9fafb, #ffffff)" },
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

        <AccordionSection title="Category Badge Colors">
          <div className="space-y-3">
            <ColorPicker
              label="Gradient Start"
              value={settings.badgeFrom ?? "#9333ea"}
              onChange={(v) => update("badgeFrom", v)}
            />
            <ColorPicker
              label="Gradient End"
              value={settings.badgeTo ?? "#ec4899"}
              onChange={(v) => update("badgeTo", v)}
            />
          </div>
        </AccordionSection>
      </div>
    );
  }

  return null;
}
