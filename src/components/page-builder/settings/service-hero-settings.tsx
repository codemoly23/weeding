"use client";

import { useCallback } from "react";
import type { ServiceHeroWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_SERVICE_HERO_SETTINGS, DEFAULT_WIDGET_CONTAINER } from "@/lib/page-builder/defaults";
import { ContainerStyleSection } from "@/components/page-builder/shared/container-style-section";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";
import { useFieldAccordion } from "@/components/page-builder/settings/use-field-accordion";
import {
  TextInput,
  TextAreaInput,
  LinkInput,
  ToggleSwitch,
  SelectInput,
  ColorInput,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { ButtonStyleEditor } from "@/components/admin/button-style-editor";
import type { ButtonCustomStyle } from "@/lib/header-footer/types";

interface ServiceHeroWidgetSettingsProps {
  settings: ServiceHeroWidgetSettings;
  onChange: (settings: ServiceHeroWidgetSettings) => void;
  activeTab?: "content" | "style" | "advanced";
  activeFieldId?: string | null;
}

export function ServiceHeroWidgetSettingsPanel({
  settings,
  onChange,
  activeTab = "content",
  activeFieldId,
}: ServiceHeroWidgetSettingsProps) {
  const { getAccordionProps } = useFieldAccordion(activeFieldId);
  // Merge with defaults (deep merge for nested button objects)
  const s: ServiceHeroWidgetSettings = {
    ...DEFAULT_SERVICE_HERO_SETTINGS,
    ...settings,
    primaryButton: { ...DEFAULT_SERVICE_HERO_SETTINGS.primaryButton, ...settings?.primaryButton },
    secondaryButton: { ...DEFAULT_SERVICE_HERO_SETTINGS.secondaryButton, ...settings?.secondaryButton },
    container: { ...DEFAULT_WIDGET_CONTAINER, ...settings?.container },
  };

  const updateField = useCallback(
    <K extends keyof ServiceHeroWidgetSettings>(
      key: K,
      value: ServiceHeroWidgetSettings[K]
    ) => {
      onChange({
        ...s,
        [key]: value,
      });
    },
    [s, onChange]
  );

  const updateNested = useCallback(
    <K extends keyof ServiceHeroWidgetSettings>(
      parentKey: K,
      childKey: string,
      value: unknown
    ) => {
      const parent = s[parentKey];
      if (typeof parent === "object" && parent !== null) {
        onChange({
          ...s,
          [parentKey]: { ...(parent as Record<string, unknown>), [childKey]: value },
        });
      }
    },
    [s, onChange]
  );

  // Content Tab
  const renderContentTab = () => (
    <div className="space-y-3">
      {/* Title Section */}
      <AccordionSection title="Title" defaultOpen {...getAccordionProps("title")}>
        <SelectInput
          label="Title Source"
          value={s.titleSource}
          onChange={(v) => updateField("titleSource", v as "auto" | "custom")}
          options={[
            { value: "auto", label: "Auto from Service" },
            { value: "custom", label: "Custom Text" },
          ]}
        />
        {s.titleSource === "custom" && (
          <TextInput
            label="Custom Title"
            value={s.customTitle || ""}
            onChange={(v) => updateField("customTitle", v)}
            placeholder="Enter custom title..."
          />
        )}
        <TextInput
          label="Highlight Phrase"
          value={s.titleHighlightWord || ""}
          onChange={(v) => updateField("titleHighlightWord", v)}
          placeholder="US LLC"
          description="Text colored in forest green"
        />
        <TextInput
          label="Underline Phrase"
          value={s.titleUnderlineWord || ""}
          onChange={(v) => updateField("titleUnderlineWord", v)}
          placeholder="Anywhere."
          description="Text with coral underline accent"
        />
      </AccordionSection>

      {/* Subtitle Section */}
      <AccordionSection title="Subtitle" {...getAccordionProps("subtitle")}>
        <SelectInput
          label="Subtitle Source"
          value={s.subtitleSource}
          onChange={(v) => updateField("subtitleSource", v as "auto" | "custom")}
          options={[
            { value: "auto", label: "Auto from Service" },
            { value: "custom", label: "Custom Text" },
          ]}
        />
        {s.subtitleSource === "custom" && (
          <TextAreaInput
            label="Custom Subtitle"
            value={s.customSubtitle || ""}
            onChange={(v) => updateField("customSubtitle", v)}
            placeholder="Enter custom subtitle..."
            rows={3}
          />
        )}
      </AccordionSection>

      {/* Price Badge Section */}
      <AccordionSection title="Price Badge" {...getAccordionProps("price-badge")}>
        <ToggleSwitch
          label="Show Price Badge"
          checked={s.showPriceBadge}
          onChange={(checked) => updateField("showPriceBadge", checked)}
        />
        {s.showPriceBadge && (
          <TextInput
            label="Badge Text"
            value={s.priceBadgeText}
            onChange={(v) => updateField("priceBadgeText", v)}
            placeholder="From ${{service.startingPrice}}"
            description="Use {{service.startingPrice}} for dynamic price"
          />
        )}
      </AccordionSection>

      {/* Primary Button Section */}
      <AccordionSection title="Primary Button" {...getAccordionProps("primary-button")}>
        <ToggleSwitch
          label="Show Primary Button"
          checked={s.primaryButton.show}
          onChange={(checked) => updateNested("primaryButton", "show", checked)}
        />
        {s.primaryButton.show && (
          <>
            <TextInput
              label="Button Text"
              value={s.primaryButton.text}
              onChange={(v) => updateNested("primaryButton", "text", v)}
              placeholder="Get Started — ${{service.startingPrice}} + State Fee"
            />
            <LinkInput
              label="Link URL"
              value={s.primaryButton.link}
              onChange={(v) => updateNested("primaryButton", "link", v)}
              placeholder="/checkout/{{service.slug}}"
              openInNewTab={s.primaryButton.openInNewTab}
              onOpenInNewTabChange={(v) => updateNested("primaryButton", "openInNewTab", v)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use {"{{service.slug}}"} for dynamic service slug
            </p>
            <TextInput
              label="Badge Text (optional)"
              value={s.primaryButton.badge || ""}
              onChange={(v) => updateNested("primaryButton", "badge", v)}
              placeholder="From $199"
            />
            <div className="mt-4 pt-4 border-t">
              <ButtonStyleEditor
                style={(s.primaryButton.style as ButtonCustomStyle) || {}}
                onChange={(style: ButtonCustomStyle) => updateNested("primaryButton", "style", style)}
                buttonText={s.primaryButton.text || "Button"}
                showPreview={true}
                showPresets={true}
                compact={true}
              />
            </div>
          </>
        )}
      </AccordionSection>

      {/* Secondary Button Section */}
      <AccordionSection title="Secondary Button" {...getAccordionProps("secondary-button")}>
        <ToggleSwitch
          label="Show Secondary Button"
          checked={s.secondaryButton.show}
          onChange={(checked) => updateNested("secondaryButton", "show", checked)}
        />
        {s.secondaryButton.show && (
          <>
            <TextInput
              label="Button Text"
              value={s.secondaryButton.text}
              onChange={(v) => updateNested("secondaryButton", "text", v)}
              placeholder="Book Free Consultation"
            />
            <LinkInput
              label="Link URL"
              value={s.secondaryButton.link}
              onChange={(v) => updateNested("secondaryButton", "link", v)}
              placeholder="/contact"
              openInNewTab={s.secondaryButton.openInNewTab}
              onOpenInNewTabChange={(v) => updateNested("secondaryButton", "openInNewTab", v)}
            />
            <TextInput
              label="Badge Text (optional)"
              value={s.secondaryButton.badge || ""}
              onChange={(v) => updateNested("secondaryButton", "badge", v)}
              placeholder=""
            />
            <div className="mt-4 pt-4 border-t">
              <ButtonStyleEditor
                style={(s.secondaryButton.style as ButtonCustomStyle) || {}}
                onChange={(style: ButtonCustomStyle) => updateNested("secondaryButton", "style", style)}
                buttonText={s.secondaryButton.text || "Button"}
                showPreview={true}
                showPresets={true}
                compact={true}
              />
            </div>
          </>
        )}
      </AccordionSection>
    </div>
  );

  // Style Tab
  const renderStyleTab = () => (
    <div className="space-y-3">
      {/* Alignment */}
      <SelectInput
        label="Text Alignment"
        value={s.textAlignment}
        onChange={(v) => updateField("textAlignment", v as "left" | "center" | "right")}
        options={[
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
          { value: "right", label: "Right" },
        ]}
      />

      {/* Title Size */}
      <SelectInput
        label="Title Size"
        value={s.titleSize}
        onChange={(v) => updateField("titleSize", v as "default" | "large" | "xl")}
        options={[
          { value: "default", label: "Default" },
          { value: "large", label: "Large" },
          { value: "xl", label: "Extra Large" },
        ]}
      />

      {/* Spacing */}
      <SelectInput
        label="Vertical Spacing"
        value={s.spacing}
        onChange={(v) => updateField("spacing", v as "sm" | "md" | "lg" | "xl")}
        options={[
          { value: "sm", label: "Small" },
          { value: "md", label: "Medium" },
          { value: "lg", label: "Large" },
          { value: "xl", label: "Extra Large" },
        ]}
      />

      {/* Container Style */}
      <ContainerStyleSection
        container={s.container || DEFAULT_WIDGET_CONTAINER}
        onChange={(container) => onChange({ ...s, container })}
      />

      {/* Background */}
      <AccordionSection title="Background">
        <SelectInput
          label="Background Type"
          value={s.backgroundType}
          onChange={(v) => updateField("backgroundType", v as "none" | "solid" | "gradient" | "image")}
          options={[
            { value: "none", label: "None" },
            { value: "solid", label: "Solid Color" },
            { value: "gradient", label: "Gradient" },
            { value: "image", label: "Image" },
          ]}
        />

        {s.backgroundType === "solid" && (
          <ColorInput
            label="Background Color"
            value={s.backgroundColor || "#f8fafc"}
            onChange={(v) => updateField("backgroundColor", v)}
          />
        )}

        {s.backgroundType === "gradient" && (
          <TextInput
            label="Gradient Classes"
            value={s.backgroundGradient || ""}
            onChange={(v) => updateField("backgroundGradient", v)}
            placeholder="bg-gradient-to-b from-orange-50 to-white"
            description="Tailwind gradient classes"
          />
        )}

        {s.backgroundType === "image" && (
          <TextInput
            label="Background Image URL"
            value={s.backgroundImage || ""}
            onChange={(v) => updateField("backgroundImage", v)}
            placeholder="/images/hero-bg.jpg"
          />
        )}
      </AccordionSection>
    </div>
  );

  // Advanced Tab
  const renderAdvancedTab = () => (
    <div className="space-y-3">
      {/* Dynamic Placeholders Info */}
      <AccordionSection title="Dynamic Placeholders" defaultOpen>
        <p className="text-xs text-muted-foreground mb-3">
          You can use these placeholders in text fields:
        </p>
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2">
            <span
              className="font-mono text-orange-600 whitespace-nowrap"
              style={{ backgroundColor: "#fff7ed", padding: "2px 6px", borderRadius: "4px" }}
            >
              {`{{service.name}}`}
            </span>
            <span className="text-muted-foreground">- Service title</span>
          </div>
          <div className="flex items-start gap-2">
            <span
              className="font-mono text-orange-600 whitespace-nowrap"
              style={{ backgroundColor: "#fff7ed", padding: "2px 6px", borderRadius: "4px" }}
            >
              {`{{service.slug}}`}
            </span>
            <span className="text-muted-foreground">- Service URL slug</span>
          </div>
          <div className="flex items-start gap-2">
            <span
              className="font-mono text-orange-600 whitespace-nowrap"
              style={{ backgroundColor: "#fff7ed", padding: "2px 6px", borderRadius: "4px" }}
            >
              {`{{service.startingPrice}}`}
            </span>
            <span className="text-muted-foreground">- Starting price</span>
          </div>
          <div className="flex items-start gap-2">
            <span
              className="font-mono text-orange-600 whitespace-nowrap"
              style={{ backgroundColor: "#fff7ed", padding: "2px 6px", borderRadius: "4px" }}
            >
              {`{{service.shortDesc}}`}
            </span>
            <span className="text-muted-foreground">- Short description</span>
          </div>
          <div className="flex items-start gap-2">
            <span
              className="font-mono text-orange-600 whitespace-nowrap"
              style={{ backgroundColor: "#fff7ed", padding: "2px 6px", borderRadius: "4px" }}
            >
              {`{{service.processingTime}}`}
            </span>
            <span className="text-muted-foreground">- Processing time</span>
          </div>
        </div>
      </AccordionSection>
      {/* Note: Spacing section is provided by the common widget builder panel */}
    </div>
  );

  return (
    <>
      {activeTab === "content" && renderContentTab()}
      {activeTab === "style" && renderStyleTab()}
      {activeTab === "advanced" && renderAdvancedTab()}
    </>
  );
}
