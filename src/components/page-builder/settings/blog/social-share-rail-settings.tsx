"use client";

import type { SocialShareRailWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_SOCIAL_SHARE_RAIL_SETTINGS } from "@/lib/page-builder/defaults";
import {
  SelectInput,
  NumberInput,
  ColorInput,
  ToggleSwitch,
  TextInput,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface SocialShareRailSettingsProps {
  settings: SocialShareRailWidgetSettings;
  onChange: (settings: SocialShareRailWidgetSettings) => void;
  activeFieldId?: string | null;
  activeTab?: "content" | "style" | "advanced";
}

type Platform = "twitter" | "linkedin" | "facebook" | "whatsapp" | "copy";

const ALL_PLATFORMS: Array<{ value: Platform; label: string }> = [
  { value: "twitter", label: "Twitter / X" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "facebook", label: "Facebook" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "copy", label: "Copy Link" },
];

export function SocialShareRailSettingsPanel({
  settings,
  onChange,
  activeTab = "content",
}: SocialShareRailSettingsProps) {
  const s = { ...DEFAULT_SOCIAL_SHARE_RAIL_SETTINGS, ...settings } as SocialShareRailWidgetSettings;

  const togglePlatform = (platform: Platform) => {
    const current = s.platforms;
    const next = current.includes(platform)
      ? current.filter((p) => p !== platform)
      : [...current, platform];
    onChange({ ...s, platforms: next });
  };

  const renderContentTab = () => (
    <div className="space-y-3">
      <AccordionSection title="Share Options" defaultOpen>
        <ToggleSwitch
          label="Show Label"
          checked={s.showLabel}
          onChange={(v) => onChange({ ...s, showLabel: v })}
        />
        {s.showLabel && (
          <TextInput
            label="Label Text"
            value={s.label}
            onChange={(v) => onChange({ ...s, label: v })}
            placeholder="SHARE"
          />
        )}
        <SelectInput
          label="Layout"
          value={s.layout}
          onChange={(v) => onChange({ ...s, layout: v as SocialShareRailWidgetSettings["layout"] })}
          options={[
            { value: "vertical", label: "Vertical" },
            { value: "horizontal", label: "Horizontal" },
          ]}
        />
      </AccordionSection>

      <AccordionSection title="Platforms">
        <div className="space-y-2 rounded-md border p-2">
          {ALL_PLATFORMS.map(({ value, label }) => (
            <div key={value} className="flex items-center gap-2">
              <Checkbox
                id={`share-${value}`}
                checked={s.platforms.includes(value)}
                onCheckedChange={() => togglePlatform(value)}
              />
              <label htmlFor={`share-${value}`} className="text-sm cursor-pointer flex-1">
                {label}
              </label>
            </div>
          ))}
        </div>
      </AccordionSection>

      <AccordionSection title="Share Counter">
        <ToggleSwitch
          label="Show Counter"
          checked={s.showCounter}
          onChange={(v) => onChange({ ...s, showCounter: v })}
        />
        {s.showCounter && (
          <>
            <TextInput
              label="Counter Value"
              value={s.counterValue ?? ""}
              onChange={(v) => onChange({ ...s, counterValue: v })}
              placeholder="1.2K"
            />
            <TextInput
              label="Counter Label"
              value={s.counterLabel ?? ""}
              onChange={(v) => onChange({ ...s, counterLabel: v })}
              placeholder="SHARES"
            />
          </>
        )}
      </AccordionSection>
    </div>
  );

  const renderStyleTab = () => (
    <div className="space-y-3">
      <AccordionSection title="Button Style" defaultOpen>
        <SelectInput
          label="Style"
          value={s.buttonStyle}
          onChange={(v) => onChange({ ...s, buttonStyle: v as SocialShareRailWidgetSettings["buttonStyle"] })}
          options={[
            { value: "outline", label: "Outline" },
            { value: "filled", label: "Filled" },
            { value: "minimal", label: "Minimal" },
          ]}
        />
        <NumberInput
          label="Icon Size"
          value={s.iconSize ?? 16}
          onChange={(v) => onChange({ ...s, iconSize: v })}
          min={12}
          max={28}
          step={2}
          unit="px"
        />
      </AccordionSection>
      <AccordionSection title="Colors">
        <ColorInput label="Button Background" value={s.buttonBgColor ?? ""} onChange={(v) => onChange({ ...s, buttonBgColor: v })} />
        <ColorInput label="Button Text" value={s.buttonTextColor ?? ""} onChange={(v) => onChange({ ...s, buttonTextColor: v })} />
        <ColorInput label="Button Border" value={s.buttonBorderColor ?? ""} onChange={(v) => onChange({ ...s, buttonBorderColor: v })} />
        <ColorInput label="Hover Background" value={s.buttonHoverBgColor ?? ""} onChange={(v) => onChange({ ...s, buttonHoverBgColor: v })} />
        <ColorInput label="Hover Text" value={s.buttonHoverTextColor ?? ""} onChange={(v) => onChange({ ...s, buttonHoverTextColor: v })} />
        <ColorInput label="Label Color" value={s.labelColor ?? ""} onChange={(v) => onChange({ ...s, labelColor: v })} />
      </AccordionSection>
    </div>
  );

  const renderAdvancedTab = () => (
    <div className="space-y-3">
      <AccordionSection title="Sticky" defaultOpen>
        <ToggleSwitch
          label="Sticky Rail"
          checked={s.sticky}
          onChange={(v) => onChange({ ...s, sticky: v })}
        />
        {s.sticky && (
          <NumberInput
            label="Sticky Offset (from top)"
            value={s.stickyTop ?? 100}
            onChange={(v) => onChange({ ...s, stickyTop: v })}
            min={0}
            max={300}
            step={4}
            unit="px"
          />
        )}
      </AccordionSection>
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
