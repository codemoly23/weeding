"use client";

import type { PlanigateCtaWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_PLANIGATE_CTA_SETTINGS } from "@/lib/page-builder/defaults";
import {
  TextInput,
  TextAreaInput,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";
import { ImageUpload } from "@/app/admin/appearance/landing-page/components/ui/image-upload";
import { useFieldAccordion } from "@/components/page-builder/settings/use-field-accordion";

interface Props {
  settings: Partial<PlanigateCtaWidgetSettings>;
  onChange: (settings: PlanigateCtaWidgetSettings) => void;
  activeTab: "content" | "style" | "advanced";
  activeFieldId?: string | null;
}

export function PlanigateCtaSettingsPanel({
  settings: partial,
  onChange,
  activeTab,
  activeFieldId,
}: Props) {
  const { getAccordionProps } = useFieldAccordion(activeFieldId);

  const settings: PlanigateCtaWidgetSettings = {
    ...DEFAULT_PLANIGATE_CTA_SETTINGS,
    ...partial,
  };

  const update = <K extends keyof PlanigateCtaWidgetSettings>(
    key: K,
    value: PlanigateCtaWidgetSettings[K]
  ) => onChange({ ...settings, [key]: value });

  if (activeTab === "content") {
    return (
      <div className="space-y-3">
        <AccordionSection title="Text" defaultOpen {...getAccordionProps("text")}>
          <div className="space-y-3">
            <TextAreaInput
              label="Heading"
              value={settings.heading}
              onChange={(v) => update("heading", v)}
              rows={2}
            />
            <TextInput
              label="Subtitle"
              value={settings.subtitle}
              onChange={(v) => update("subtitle", v)}
            />
          </div>
        </AccordionSection>

        <AccordionSection title="Buttons" {...getAccordionProps("buttons")}>
          <div className="space-y-3">
            <TextInput
              label="Primary button text"
              value={settings.primaryButtonText}
              onChange={(v) => update("primaryButtonText", v)}
            />
            <TextInput
              label="Primary button link"
              value={settings.primaryButtonHref}
              onChange={(v) => update("primaryButtonHref", v)}
            />
            <TextInput
              label="Secondary button text"
              value={settings.secondaryButtonText}
              onChange={(v) => update("secondaryButtonText", v)}
            />
            <TextInput
              label="Secondary button link"
              value={settings.secondaryButtonHref}
              onChange={(v) => update("secondaryButtonHref", v)}
            />
          </div>
        </AccordionSection>

        <AccordionSection title="Image" {...getAccordionProps("image")}>
          <ImageUpload
            label="Right-side image"
            value={settings.backgroundImage}
            onChange={(url) => update("backgroundImage", url)}
          />
        </AccordionSection>
      </div>
    );
  }

  return null;
}
