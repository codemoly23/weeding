"use client";

import type { BreadcrumbWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_BREADCRUMB_SETTINGS } from "@/lib/page-builder/defaults";
import {
  SelectInput,
  NumberInput,
  ColorInput,
  ToggleSwitch,
  TextInput,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";

interface BreadcrumbSettingsProps {
  settings: BreadcrumbWidgetSettings;
  onChange: (settings: BreadcrumbWidgetSettings) => void;
  activeFieldId?: string | null;
  activeTab?: "content" | "style" | "advanced";
}

export function BreadcrumbWidgetSettingsPanel({
  settings,
  onChange,
  activeTab = "content",
}: BreadcrumbSettingsProps) {
  const s = { ...DEFAULT_BREADCRUMB_SETTINGS, ...settings } as BreadcrumbWidgetSettings;

  const renderContentTab = () => (
    <div className="space-y-3">
      <AccordionSection title="Breadcrumb" defaultOpen>
        <SelectInput
          label="Separator"
          value={s.separator}
          onChange={(v) => onChange({ ...s, separator: v as BreadcrumbWidgetSettings["separator"] })}
          options={[
            { value: "chevron", label: "Chevron ›" },
            { value: "slash", label: "Slash /" },
            { value: "arrow", label: "Arrow →" },
            { value: "dot", label: "Dot ·" },
          ]}
        />
        <TextInput
          label="Home Label"
          value={s.homeLabel}
          onChange={(v) => onChange({ ...s, homeLabel: v })}
          placeholder="Home"
        />
        <TextInput
          label="Home URL"
          value={s.homeUrl}
          onChange={(v) => onChange({ ...s, homeUrl: v })}
          placeholder="/"
        />
        <ToggleSwitch
          label="Show Current Page"
          checked={s.showCurrent}
          onChange={(v) => onChange({ ...s, showCurrent: v })}
        />
      </AccordionSection>
    </div>
  );

  const renderStyleTab = () => (
    <div className="space-y-3">
      <AccordionSection title="Colors" defaultOpen>
        <ColorInput
          label="Link Color"
          value={s.color ?? ""}
          onChange={(v) => onChange({ ...s, color: v })}
        />
        <ColorInput
          label="Hover Color"
          value={s.hoverColor ?? ""}
          onChange={(v) => onChange({ ...s, hoverColor: v })}
        />
        <ColorInput
          label="Current Page Color"
          value={s.currentColor ?? ""}
          onChange={(v) => onChange({ ...s, currentColor: v })}
        />
        <ColorInput
          label="Separator Color"
          value={s.separatorColor ?? ""}
          onChange={(v) => onChange({ ...s, separatorColor: v })}
        />
      </AccordionSection>
      <AccordionSection title="Typography">
        <NumberInput
          label="Font Size"
          value={s.fontSize ?? 13}
          onChange={(v) => onChange({ ...s, fontSize: v })}
          min={10}
          max={20}
          step={1}
          unit="px"
        />
        <ToggleSwitch
          label="Uppercase"
          checked={s.uppercase ?? false}
          onChange={(v) => onChange({ ...s, uppercase: v })}
        />
        <SelectInput
          label="Alignment"
          value={s.alignment ?? "left"}
          onChange={(v) => onChange({ ...s, alignment: v as BreadcrumbWidgetSettings["alignment"] })}
          options={[
            { value: "left", label: "Left" },
            { value: "center", label: "Center" },
            { value: "right", label: "Right" },
          ]}
        />
      </AccordionSection>
    </div>
  );

  const renderAdvancedTab = () => null;

  return (
    <>
      {activeTab === "content" && renderContentTab()}
      {activeTab === "style" && renderStyleTab()}
      {activeTab === "advanced" && renderAdvancedTab()}
    </>
  );
}
