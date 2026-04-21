"use client";

import type { CtaBannerWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_CTA_BANNER_SETTINGS } from "@/lib/page-builder/defaults";
import {
  TextInput,
  NumberInput,
  ToggleSwitch,
  ColorInput,
  SelectInput,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";
import { useFieldAccordion } from "@/components/page-builder/settings/use-field-accordion";

interface CtaBannerSettingsPanelProps {
  settings: Partial<CtaBannerWidgetSettings>;
  onChange: (settings: CtaBannerWidgetSettings) => void;
  activeTab: "content" | "style" | "advanced";
  activeFieldId?: string | null;
}

export function CtaBannerSettingsPanel({
  settings: partialSettings,
  onChange,
  activeTab,
  activeFieldId,
}: CtaBannerSettingsPanelProps) {
  const { getAccordionProps } = useFieldAccordion(activeFieldId);

  const settings: CtaBannerWidgetSettings = {
    ...DEFAULT_CTA_BANNER_SETTINGS,
    ...partialSettings,
    primaryButton: {
      ...DEFAULT_CTA_BANNER_SETTINGS.primaryButton,
      ...partialSettings.primaryButton,
    },
    secondaryButton: {
      ...DEFAULT_CTA_BANNER_SETTINGS.secondaryButton,
      ...partialSettings.secondaryButton,
    },
    trustBadges: {
      ...DEFAULT_CTA_BANNER_SETTINGS.trustBadges,
      ...partialSettings.trustBadges,
    },
  };

  const update = <K extends keyof CtaBannerWidgetSettings>(
    key: K,
    value: CtaBannerWidgetSettings[K]
  ) => onChange({ ...settings, [key]: value });

  if (activeTab === "content") {
    return (
      <div className="space-y-3">
        <AccordionSection title="Text" defaultOpen {...getAccordionProps("text")}>
          <div className="space-y-3">
            <TextInput
              label="Title"
              value={settings.title}
              onChange={(v) => update("title", v)}
            />
            <TextInput
              label="Subtitle"
              value={settings.subtitle}
              onChange={(v) => update("subtitle", v)}
            />
          </div>
        </AccordionSection>

        <AccordionSection title="Primary Button" {...getAccordionProps("primary-button")}>
          <div className="space-y-3">
            <ToggleSwitch
              label="Show"
              value={settings.primaryButton.show}
              onChange={(v) => update("primaryButton", { ...settings.primaryButton, show: v })}
            />
            <TextInput
              label="Label"
              value={settings.primaryButton.label}
              onChange={(v) => update("primaryButton", { ...settings.primaryButton, label: v })}
            />
            <TextInput
              label="Link (href)"
              value={settings.primaryButton.href}
              onChange={(v) => update("primaryButton", { ...settings.primaryButton, href: v })}
            />
            <TextInput
              label="Icon (Lucide name)"
              value={settings.primaryButton.icon}
              onChange={(v) => update("primaryButton", { ...settings.primaryButton, icon: v })}
            />
          </div>
        </AccordionSection>

        <AccordionSection title="Secondary Button" {...getAccordionProps("secondary-button")}>
          <div className="space-y-3">
            <ToggleSwitch
              label="Show"
              value={settings.secondaryButton.show}
              onChange={(v) => update("secondaryButton", { ...settings.secondaryButton, show: v })}
            />
            <TextInput
              label="Label"
              value={settings.secondaryButton.label}
              onChange={(v) => update("secondaryButton", { ...settings.secondaryButton, label: v })}
            />
            <TextInput
              label="Link (href)"
              value={settings.secondaryButton.href}
              onChange={(v) => update("secondaryButton", { ...settings.secondaryButton, href: v })}
            />
            <TextInput
              label="Icon (Lucide name)"
              value={settings.secondaryButton.icon}
              onChange={(v) => update("secondaryButton", { ...settings.secondaryButton, icon: v })}
            />
          </div>
        </AccordionSection>

        <AccordionSection title="Trust Badges" {...getAccordionProps("trust-badges")}>
          <div className="space-y-3">
            <ToggleSwitch
              label="Show Trust Badges"
              checked={settings.trustBadges.show}
              onChange={(v) => update("trustBadges", { ...settings.trustBadges, show: v })}
            />
            {settings.trustBadges.show && (
              <TextInput
                label="Items (comma separated)"
                value={settings.trustBadges.items.join(", ")}
                onChange={(v) =>
                  update("trustBadges", {
                    ...settings.trustBadges,
                    items: v.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="Free forever plan, No credit card required, Cancel anytime"
              />
            )}
          </div>
        </AccordionSection>
      </div>
    );
  }

  if (activeTab === "style") {
    return (
      <div className="space-y-3">
        <AccordionSection title="Variant" defaultOpen>
          <div className="space-y-3">
            <SelectInput
              label="Color Variant"
              value={settings.variant ?? "dark"}
              options={[
                { value: "dark", label: "Dark — white text on colored card" },
                { value: "light", label: "Light — dark text on light card" },
              ]}
              onChange={(v) => update("variant", v as "dark" | "light")}
            />
            <p className="text-xs text-muted-foreground">
              Use <strong>Light</strong> when card colors are white/gray. Use <strong>Dark</strong> for colored gradient cards.
            </p>
          </div>
        </AccordionSection>

        <AccordionSection title="Section Background" defaultOpen>
          <div className="space-y-3">
            <ColorInput
              label="Bg From"
              value={settings.sectionBgFrom}
              onChange={(v) => update("sectionBgFrom", v)}
            />
            <ColorInput
              label="Bg To"
              value={settings.sectionBgTo}
              onChange={(v) => update("sectionBgTo", v)}
            />
          </div>
        </AccordionSection>

        <AccordionSection title="Card Gradient">
          <div className="space-y-3">
            <ColorInput
              label="From"
              value={settings.cardGradientFrom}
              onChange={(v) => update("cardGradientFrom", v)}
            />
            <ColorInput
              label="To"
              value={settings.cardGradientTo}
              onChange={(v) => update("cardGradientTo", v)}
            />
            <NumberInput
              label="Angle"
              value={settings.cardGradientAngle}
              onChange={(v) => update("cardGradientAngle", v)}
              min={0}
              max={360}
              step={5}
              unit="°"
            />
          </div>
        </AccordionSection>

        <AccordionSection title="Card Shape">
          <div className="space-y-3">
            <NumberInput
              label="Border Radius"
              value={settings.cardBorderRadius}
              onChange={(v) => update("cardBorderRadius", v)}
              min={0}
              max={64}
              unit="px"
            />
            <NumberInput
              label="Padding Vertical"
              value={settings.cardPaddingV}
              onChange={(v) => update("cardPaddingV", v)}
              min={16}
              max={128}
              unit="px"
            />
            <NumberInput
              label="Padding Horizontal"
              value={settings.cardPaddingH}
              onChange={(v) => update("cardPaddingH", v)}
              min={16}
              max={128}
              unit="px"
            />
            <ToggleSwitch
              label="Show Pattern Overlay"
              value={settings.showPattern}
              onChange={(v) => update("showPattern", v)}
            />
          </div>
        </AccordionSection>
      </div>
    );
  }

  return null;
}
