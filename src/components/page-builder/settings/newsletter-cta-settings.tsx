"use client";

import { useCallback } from "react";
import type { NewsletterCtaWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_NEWSLETTER_CTA_SETTINGS, DEFAULT_WIDGET_CONTAINER } from "@/lib/page-builder/defaults";
import { ContainerStyleSection } from "@/components/page-builder/shared/container-style-section";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";
import { useFieldAccordion } from "./use-field-accordion";
import {
  TextInput,
  TextAreaInput,
  ToggleSwitch,
  SelectInput,
  ColorInput,
  NumberInput,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";

interface Props {
  settings: NewsletterCtaWidgetSettings;
  onChange: (settings: NewsletterCtaWidgetSettings) => void;
  activeTab?: "content" | "style" | "advanced";
  activeFieldId?: string | null;
}

export function NewsletterCtaSettingsPanel({
  settings,
  onChange,
  activeTab = "content",
  activeFieldId,
}: Props) {
  const { getAccordionProps } = useFieldAccordion(activeFieldId);

  const s: NewsletterCtaWidgetSettings = {
    ...DEFAULT_NEWSLETTER_CTA_SETTINGS,
    ...settings,
    badge: { ...DEFAULT_NEWSLETTER_CTA_SETTINGS.badge, ...settings?.badge },
    title: { ...DEFAULT_NEWSLETTER_CTA_SETTINGS.title, ...settings?.title },
    subtitle: { ...DEFAULT_NEWSLETTER_CTA_SETTINGS.subtitle, ...settings?.subtitle },
    form: { ...DEFAULT_NEWSLETTER_CTA_SETTINGS.form, ...settings?.form },
    disclaimer: {
      ...DEFAULT_NEWSLETTER_CTA_SETTINGS.disclaimer,
      ...settings?.disclaimer,
    },
    background: {
      ...DEFAULT_NEWSLETTER_CTA_SETTINGS.background,
      ...settings?.background,
    },
    container: { ...DEFAULT_WIDGET_CONTAINER, ...settings?.container },
  };

  const updateNested = useCallback(
    <K extends keyof NewsletterCtaWidgetSettings>(
      parentKey: K,
      childKey: string,
      value: unknown
    ) => {
      const parent = s[parentKey];
      if (typeof parent === "object" && parent !== null) {
        onChange({ ...s, [parentKey]: { ...parent, [childKey]: value } });
      }
    },
    [s, onChange]
  );

  if (activeTab === "advanced") {
    return (
      <div className="space-y-3">
        <ContainerStyleSection
          container={s.container || DEFAULT_WIDGET_CONTAINER}
          onChange={(container) => onChange({ ...s, container })}
        />
      </div>
    );
  }

  if (activeTab === "style") {
    return (
      <div className="space-y-3">
        <SelectInput
          label="Alignment"
          value={s.alignment}
          onChange={(v) => onChange({ ...s, alignment: v as "left" | "center" | "right" })}
          options={[
            { value: "left", label: "Left" },
            { value: "center", label: "Center" },
            { value: "right", label: "Right" },
          ]}
        />

        <AccordionSection title="Background">
          <ColorInput
            label="Background Color"
            value={s.background?.color || "#0f172a"}
            onChange={(v) => updateNested("background", "color", v)}
          />
        </AccordionSection>

        <AccordionSection title="Title Style">
          <SelectInput
            label="Size"
            value={s.title.size || "2xl"}
            onChange={(v) => updateNested("title", "size", v)}
            options={[
              { value: "lg", label: "Large" },
              { value: "xl", label: "Extra Large" },
              { value: "2xl", label: "Display" },
              { value: "3xl", label: "Mega" },
            ]}
          />
          <ColorInput
            label="Color (Line 1)"
            value={s.title.color || "#ffffff"}
            onChange={(v) => updateNested("title", "color", v)}
          />
          <ColorInput
            label="Accent Color (Line 2)"
            value={s.title.line2Color || "#f97316"}
            onChange={(v) => updateNested("title", "line2Color", v)}
          />
        </AccordionSection>

        <AccordionSection title="Form Style">
          <ColorInput
            label="Input Background"
            value={s.form.inputBgColor || "#ffffff"}
            onChange={(v) => updateNested("form", "inputBgColor", v)}
          />
          <ColorInput
            label="Input Text"
            value={s.form.inputTextColor || "#0f172a"}
            onChange={(v) => updateNested("form", "inputTextColor", v)}
          />
          <ColorInput
            label="Button Background"
            value={s.form.buttonBgColor || "#f97316"}
            onChange={(v) => updateNested("form", "buttonBgColor", v)}
          />
          <ColorInput
            label="Button Text"
            value={s.form.buttonTextColor || "#ffffff"}
            onChange={(v) => updateNested("form", "buttonTextColor", v)}
          />
          <NumberInput
            label="Border Radius (px)"
            value={s.form.borderRadius ?? 12}
            onChange={(v) => updateNested("form", "borderRadius", v)}
            min={0}
            max={40}
          />
          <SelectInput
            label="Layout"
            value={s.form.layout || "inline"}
            onChange={(v) => updateNested("form", "layout", v)}
            options={[
              { value: "inline", label: "Inline (input + button)" },
              { value: "stacked", label: "Stacked" },
            ]}
          />
        </AccordionSection>

        <AccordionSection title="Badge Style">
          <ColorInput
            label="Background"
            value={s.badge.bgColor || "rgba(249,115,22,0.15)"}
            onChange={(v) => updateNested("badge", "bgColor", v)}
          />
          <ColorInput
            label="Text"
            value={s.badge.textColor || "#fb923c"}
            onChange={(v) => updateNested("badge", "textColor", v)}
          />
          <ColorInput
            label="Border"
            value={s.badge.borderColor || "rgba(249,115,22,0.4)"}
            onChange={(v) => updateNested("badge", "borderColor", v)}
          />
        </AccordionSection>
      </div>
    );
  }

  // Content tab (default)
  return (
    <div className="space-y-3">
      <AccordionSection title="Badge" {...getAccordionProps("badge")}>
        <ToggleSwitch
          label="Show Badge"
          checked={s.badge.show}
          onChange={(v) => updateNested("badge", "show", v)}
        />
        {s.badge.show && (
          <>
            <TextInput
              label="Icon (Lucide name or emoji)"
              value={s.badge.icon || ""}
              onChange={(v) => updateNested("badge", "icon", v)}
              placeholder="✉ or Mail"
            />
            <TextInput
              label="Text"
              value={s.badge.text}
              onChange={(v) => updateNested("badge", "text", v)}
              placeholder="Weekly Insights"
            />
          </>
        )}
      </AccordionSection>

      <AccordionSection title="Title" {...getAccordionProps("title")}>
        <TextInput
          label="Line 1 (Primary)"
          value={s.title.line1}
          onChange={(v) => updateNested("title", "line1", v)}
          placeholder="Get expert tips"
        />
        <TextInput
          label="Line 2 (Accent)"
          value={s.title.line2}
          onChange={(v) => updateNested("title", "line2", v)}
          placeholder="in your inbox"
        />
      </AccordionSection>

      <AccordionSection title="Subtitle" {...getAccordionProps("subtitle")}>
        <ToggleSwitch
          label="Show Subtitle"
          checked={s.subtitle.show}
          onChange={(v) => updateNested("subtitle", "show", v)}
        />
        {s.subtitle.show && (
          <TextAreaInput
            label="Text"
            value={s.subtitle.text}
            onChange={(v) => updateNested("subtitle", "text", v)}
            rows={3}
          />
        )}
      </AccordionSection>

      <AccordionSection title="Form" {...getAccordionProps("form")}>
        <TextInput
          label="Input Placeholder"
          value={s.form.placeholder}
          onChange={(v) => updateNested("form", "placeholder", v)}
        />
        <TextInput
          label="Button Text"
          value={s.form.buttonText}
          onChange={(v) => updateNested("form", "buttonText", v)}
        />
        <TextInput
          label="Success Message"
          value={s.successMessage}
          onChange={(v) => onChange({ ...s, successMessage: v })}
        />
        <TextInput
          label="Error Message"
          value={s.errorMessage}
          onChange={(v) => onChange({ ...s, errorMessage: v })}
        />
      </AccordionSection>

      <AccordionSection title="Disclaimer" {...getAccordionProps("disclaimer")}>
        <ToggleSwitch
          label="Show Disclaimer"
          checked={s.disclaimer.show}
          onChange={(v) => updateNested("disclaimer", "show", v)}
        />
        {s.disclaimer.show && (
          <TextInput
            label="Text"
            value={s.disclaimer.text}
            onChange={(v) => updateNested("disclaimer", "text", v)}
            placeholder="No spam. Unsubscribe anytime."
          />
        )}
      </AccordionSection>
    </div>
  );
}
