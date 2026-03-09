"use client";

import type { ServiceFeaturesWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_SERVICE_FEATURES_SETTINGS, DEFAULT_WIDGET_CONTAINER } from "@/lib/page-builder/defaults";
import { ContainerStyleSection } from "@/components/page-builder/shared/container-style-section";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";
import { useFieldAccordion } from "@/components/page-builder/settings/use-field-accordion";
import {
  TextInput,
  TextAreaInput,
  SelectInput,
  NumberInput,
  ColorInput,
  ToggleSwitch,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";

interface ServiceFeaturesSettingsProps {
  settings: Partial<ServiceFeaturesWidgetSettings>;
  onChange: (settings: ServiceFeaturesWidgetSettings) => void;
  activeTab?: "content" | "style" | "advanced";
  activeFieldId?: string | null;
}

export function ServiceFeaturesWidgetSettingsPanel({
  settings: partialSettings,
  onChange,
  activeTab = "content",
  activeFieldId,
}: ServiceFeaturesSettingsProps) {
  const { getAccordionProps } = useFieldAccordion(activeFieldId);

  // Merge with defaults
  const s: ServiceFeaturesWidgetSettings = {
    ...DEFAULT_SERVICE_FEATURES_SETTINGS,
    ...partialSettings,
    header: { ...DEFAULT_SERVICE_FEATURES_SETTINGS.header, ...partialSettings?.header },
    container: { ...DEFAULT_WIDGET_CONTAINER, ...partialSettings?.container },
  };

  const updateField = <K extends keyof ServiceFeaturesWidgetSettings>(
    key: K,
    value: ServiceFeaturesWidgetSettings[K]
  ) => {
    onChange({ ...s, [key]: value });
  };

  const updateHeader = (field: string, value: unknown) => {
    onChange({
      ...s,
      header: { ...s.header, [field]: value },
    });
  };

  // Content Tab
  if (activeTab === "content") {
    return (
      <div className="space-y-3">
        {/* Header Section */}
        <AccordionSection title="Section Header" defaultOpen {...getAccordionProps("header")}>
          <ToggleSwitch
            label="Show Header"
            checked={s.header.show}
            onChange={(v) => updateHeader("show", v)}
          />
          {s.header.show && (
            <>
              <TextInput
                label="Eyebrow Text"
                value={s.header.eyebrow || ""}
                onChange={(v) => updateHeader("eyebrow", v)}
                placeholder="WHAT'S INCLUDED"
                description="Small uppercase text above heading"
              />
              <ColorInput
                label="Eyebrow Color"
                value={s.header.eyebrowColor || "#e84c1e"}
                onChange={(v) => updateHeader("eyebrowColor", v)}
              />
              <TextInput
                label="Heading"
                value={typeof s.header.heading === "string" ? s.header.heading : ""}
                onChange={(v) => updateHeader("heading", v)}
                placeholder="What's Included"
              />
              <TextAreaInput
                label="Description"
                value={typeof s.header.description === "string" ? s.header.description : ""}
                onChange={(v) => updateHeader("description", v)}
                placeholder="Everything you need..."
                rows={2}
              />
              <SelectInput
                label="Alignment"
                value={s.header.alignment}
                onChange={(v) => updateHeader("alignment", v)}
                options={[
                  { value: "left", label: "Left" },
                  { value: "center", label: "Center" },
                ]}
              />
            </>
          )}
        </AccordionSection>

        {/* Display Options */}
        <AccordionSection title="Display Options" defaultOpen {...getAccordionProps("display")}>
          <SelectInput
            label="Variant"
            value={s.variant}
            onChange={(v) => updateField("variant", v as ServiceFeaturesWidgetSettings["variant"])}
            options={[
              { value: "detailed-cards", label: "Detailed Cards (icon + desc + tag)" },
              { value: "minimal-checkmark", label: "Minimal Checkmark" },
              { value: "cards", label: "Simple Cards" },
              { value: "compact-grid", label: "Compact Grid" },
              { value: "highlighted", label: "Highlighted Badges" },
            ]}
          />
          <NumberInput
            label="Item Limit"
            value={s.itemLimit}
            onChange={(v) => updateField("itemLimit", v)}
            min={0}
            max={50}
            step={1}
            description="0 = show all features"
          />
          <ToggleSwitch
            label="Show Icons"
            checked={s.showIcons}
            onChange={(v) => updateField("showIcons", v)}
          />
          <ToggleSwitch
            label="Show Descriptions"
            checked={s.showDescriptions}
            onChange={(v) => updateField("showDescriptions", v)}
          />
          <ToggleSwitch
            label="Show Tags"
            checked={s.showTags}
            onChange={(v) => updateField("showTags", v)}
          />
        </AccordionSection>
      </div>
    );
  }

  // Style Tab
  if (activeTab === "style") {
    return (
      <div className="space-y-3">
        <AccordionSection title="Layout" defaultOpen {...getAccordionProps("layout")}>
          <SelectInput
            label="Columns"
            value={String(s.columns)}
            onChange={(v) => updateField("columns", Number(v) as 1 | 2 | 3 | 4)}
            options={[
              { value: "1", label: "1 Column" },
              { value: "2", label: "2 Columns" },
              { value: "3", label: "3 Columns" },
              { value: "4", label: "4 Columns" },
            ]}
          />
        </AccordionSection>

        {/* Icon Style - only for checkmark variants */}
        {(s.variant === "minimal-checkmark" || s.variant === "cards") && (
          <AccordionSection title="Icon Style" {...getAccordionProps("icon-style")}>
            <SelectInput
              label="Icon Style"
              value={s.iconStyle}
              onChange={(v) => updateField("iconStyle", v as ServiceFeaturesWidgetSettings["iconStyle"])}
              options={[
                { value: "check", label: "Check" },
                { value: "circle-check", label: "Circle Check" },
                { value: "badge-check", label: "Badge Check" },
              ]}
            />
            <ColorInput
              label="Icon Color"
              value={s.iconColor}
              onChange={(v) => updateField("iconColor", v)}
            />
          </AccordionSection>
        )}

        {/* Container Style */}
        <ContainerStyleSection
          container={s.container || DEFAULT_WIDGET_CONTAINER}
          onChange={(container) => onChange({ ...s, container })}
        />
      </div>
    );
  }

  // Advanced Tab
  if (activeTab === "advanced") {
    return (
      <div className="space-y-3">
        <AccordionSection title="Dynamic Placeholders" defaultOpen>
          <p className="text-xs text-muted-foreground mb-2">
            You can use these in the heading field:
          </p>
          <div className="space-y-1 text-xs">
            <div className="flex gap-2">
              <code className="font-mono text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                {"{{service.name}}"}
              </code>
              <span className="text-muted-foreground">Service title</span>
            </div>
          </div>
        </AccordionSection>
      </div>
    );
  }

  return null;
}
