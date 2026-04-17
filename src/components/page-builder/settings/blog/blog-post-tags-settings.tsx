"use client";

import type { BlogPostTagsWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_BLOG_POST_TAGS_SETTINGS } from "@/lib/page-builder/defaults";
import {
  SelectInput,
  NumberInput,
  ColorInput,
  ToggleSwitch,
  TextInput,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";

interface BlogPostTagsSettingsProps {
  settings: BlogPostTagsWidgetSettings;
  onChange: (settings: BlogPostTagsWidgetSettings) => void;
  activeFieldId?: string | null;
  activeTab?: "content" | "style" | "advanced";
}

export function BlogPostTagsSettingsPanel({
  settings,
  onChange,
  activeTab = "content",
}: BlogPostTagsSettingsProps) {
  const s = { ...DEFAULT_BLOG_POST_TAGS_SETTINGS, ...settings } as BlogPostTagsWidgetSettings;

  const renderContentTab = () => (
    <div className="space-y-3">
      <AccordionSection title="Tags" defaultOpen>
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
            placeholder="Tagged in"
          />
        )}
        <TextInput
          label="Link Prefix"
          value={s.linkPrefix ?? "/blog/tag/"}
          onChange={(v) => onChange({ ...s, linkPrefix: v })}
          placeholder="/blog/tag/"
        />
        <SelectInput
          label="Alignment"
          value={s.alignment ?? "left"}
          onChange={(v) => onChange({ ...s, alignment: v as BlogPostTagsWidgetSettings["alignment"] })}
          options={[
            { value: "left", label: "Left" },
            { value: "center", label: "Center" },
          ]}
        />
      </AccordionSection>
    </div>
  );

  const renderStyleTab = () => (
    <div className="space-y-3">
      <AccordionSection title="Tag Style" defaultOpen>
        <SelectInput
          label="Pill Style"
          value={s.pillStyle ?? "rounded"}
          onChange={(v) => onChange({ ...s, pillStyle: v as BlogPostTagsWidgetSettings["pillStyle"] })}
          options={[
            { value: "rounded", label: "Rounded (Pill)" },
            { value: "square", label: "Square" },
          ]}
        />
        <NumberInput
          label="Font Size"
          value={s.fontSize ?? 13}
          onChange={(v) => onChange({ ...s, fontSize: v })}
          min={10}
          max={18}
          step={1}
          unit="px"
        />
        <ToggleSwitch
          label="Uppercase"
          checked={s.uppercase ?? false}
          onChange={(v) => onChange({ ...s, uppercase: v })}
        />
      </AccordionSection>
      <AccordionSection title="Colors">
        <ColorInput label="Tag Background" value={s.tagBgColor ?? ""} onChange={(v) => onChange({ ...s, tagBgColor: v })} />
        <ColorInput label="Tag Text" value={s.tagTextColor ?? ""} onChange={(v) => onChange({ ...s, tagTextColor: v })} />
        <ColorInput label="Tag Border" value={s.tagBorderColor ?? ""} onChange={(v) => onChange({ ...s, tagBorderColor: v })} />
        <ColorInput label="Hover Background" value={s.tagHoverBgColor ?? ""} onChange={(v) => onChange({ ...s, tagHoverBgColor: v })} />
        <ColorInput label="Hover Text" value={s.tagHoverTextColor ?? ""} onChange={(v) => onChange({ ...s, tagHoverTextColor: v })} />
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
