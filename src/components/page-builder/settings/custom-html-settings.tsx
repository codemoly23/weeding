"use client";

import type { CustomHtmlWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_CUSTOM_HTML_SETTINGS, DEFAULT_WIDGET_CONTAINER } from "@/lib/page-builder/defaults";
import { ContainerStyleSection } from "@/components/page-builder/shared/container-style-section";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";
import { useFieldAccordion } from "@/components/page-builder/settings/use-field-accordion";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CustomHtmlWidgetSettingsPanelProps {
  settings: Partial<CustomHtmlWidgetSettings>;
  onChange: (settings: CustomHtmlWidgetSettings) => void;
  activeTab: "content" | "style" | "advanced";
  activeFieldId?: string | null;
}

export function CustomHtmlWidgetSettingsPanel({
  settings: partialSettings,
  onChange,
  activeTab,
  activeFieldId,
}: CustomHtmlWidgetSettingsPanelProps) {
  const { getAccordionProps } = useFieldAccordion(activeFieldId);
  const settings: CustomHtmlWidgetSettings = {
    ...DEFAULT_CUSTOM_HTML_SETTINGS,
    ...partialSettings,
    container: { ...DEFAULT_WIDGET_CONTAINER, ...partialSettings?.container },
  };

  const updateField = <K extends keyof CustomHtmlWidgetSettings>(
    key: K,
    value: CustomHtmlWidgetSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  // Content Tab
  if (activeTab === "content") {
    return (
      <div className="space-y-4">
        <AccordionSection title="HTML" defaultOpen {...getAccordionProps("html")}>
          <div className="space-y-2">
            <Label htmlFor="custom-html-content">HTML Content</Label>
            <Textarea
              id="custom-html-content"
              value={settings.html}
              onChange={(e) => updateField("html", e.target.value)}
              placeholder="<div class='my-component'>&#10;  <h2>Hello World</h2>&#10;</div>"
              rows={12}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Script tags and event handlers are automatically removed for security.
            </p>
          </div>
        </AccordionSection>

        <AccordionSection title="CSS" defaultOpen {...getAccordionProps("css")}>
          <div className="space-y-2">
            <Label htmlFor="custom-html-css">CSS Styles</Label>
            <Textarea
              id="custom-html-css"
              value={settings.css}
              onChange={(e) => updateField("css", e.target.value)}
              placeholder=".my-component {&#10;  padding: 20px;&#10;  background: #1b3a2d;&#10;  border-radius: 12px;&#10;}"
              rows={10}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              CSS is automatically scoped to this widget.
            </p>
          </div>
        </AccordionSection>
      </div>
    );
  }

  // Style Tab
  if (activeTab === "style") {
    return (
      <div className="space-y-4">
        <ContainerStyleSection
          container={settings.container || DEFAULT_WIDGET_CONTAINER}
          onChange={(container) => onChange({ ...settings, container })}
        />
      </div>
    );
  }

  // Advanced Tab - handled by common spacing
  return null;
}
