"use client";

import type { BlogPostAuthorCardWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_BLOG_POST_AUTHOR_CARD_SETTINGS } from "@/lib/page-builder/defaults";
import {
  SelectInput,
  NumberInput,
  ColorInput,
  ToggleSwitch,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";

interface BlogPostAuthorCardSettingsProps {
  settings: BlogPostAuthorCardWidgetSettings;
  onChange: (settings: BlogPostAuthorCardWidgetSettings) => void;
  activeFieldId?: string | null;
  activeTab?: "content" | "style" | "advanced";
}

export function BlogPostAuthorCardSettingsPanel({
  settings,
  onChange,
  activeTab = "content",
}: BlogPostAuthorCardSettingsProps) {
  const s = { ...DEFAULT_BLOG_POST_AUTHOR_CARD_SETTINGS, ...settings } as BlogPostAuthorCardWidgetSettings;

  const renderContentTab = () => (
    <div className="space-y-3">
      <AccordionSection title="Display" defaultOpen>
        <SelectInput
          label="Layout"
          value={s.layout ?? "horizontal"}
          onChange={(v) => onChange({ ...s, layout: v as BlogPostAuthorCardWidgetSettings["layout"] })}
          options={[
            { value: "horizontal", label: "Horizontal" },
            { value: "vertical", label: "Vertical" },
          ]}
        />
        <ToggleSwitch label="Show Avatar" checked={s.showAvatar} onChange={(v) => onChange({ ...s, showAvatar: v })} />
        {s.showAvatar && (
          <NumberInput
            label="Avatar Size"
            value={s.avatarSize ?? 80}
            onChange={(v) => onChange({ ...s, avatarSize: v })}
            min={48}
            max={160}
            step={8}
            unit="px"
          />
        )}
        <ToggleSwitch label="Show Role" checked={s.showRole} onChange={(v) => onChange({ ...s, showRole: v })} />
        <ToggleSwitch label="Show Bio" checked={s.showBio} onChange={(v) => onChange({ ...s, showBio: v })} />
        <ToggleSwitch label="Show Social Links" checked={s.showSocial} onChange={(v) => onChange({ ...s, showSocial: v })} />
      </AccordionSection>
    </div>
  );

  const renderStyleTab = () => (
    <div className="space-y-3">
      <AccordionSection title="Card" defaultOpen>
        <ColorInput label="Card Background" value={s.cardBg ?? ""} onChange={(v) => onChange({ ...s, cardBg: v })} />
        <ColorInput label="Card Border" value={s.cardBorderColor ?? ""} onChange={(v) => onChange({ ...s, cardBorderColor: v })} />
        <NumberInput
          label="Border Radius"
          value={s.cardBorderRadius ?? 16}
          onChange={(v) => onChange({ ...s, cardBorderRadius: v })}
          min={0}
          max={32}
          step={2}
          unit="px"
        />
        <NumberInput
          label="Padding"
          value={s.cardPadding ?? 32}
          onChange={(v) => onChange({ ...s, cardPadding: v })}
          min={8}
          max={64}
          step={4}
          unit="px"
        />
      </AccordionSection>
      <AccordionSection title="Avatar Colors">
        <ColorInput label="Gradient From" value={s.avatarBgFrom ?? ""} onChange={(v) => onChange({ ...s, avatarBgFrom: v })} />
        <ColorInput label="Gradient To" value={s.avatarBgTo ?? ""} onChange={(v) => onChange({ ...s, avatarBgTo: v })} />
      </AccordionSection>
      <AccordionSection title="Text Colors">
        <ColorInput label="Name Color" value={s.nameColor ?? ""} onChange={(v) => onChange({ ...s, nameColor: v })} />
        <ColorInput label="Role Color" value={s.roleColor ?? ""} onChange={(v) => onChange({ ...s, roleColor: v })} />
        <ColorInput label="Bio Color" value={s.bioColor ?? "#475569"} onChange={(v) => onChange({ ...s, bioColor: v })} />
      </AccordionSection>
      <AccordionSection title="Social Icon Colors">
        <ColorInput label="Icon Color" value={s.socialIconColor ?? ""} onChange={(v) => onChange({ ...s, socialIconColor: v })} />
        <ColorInput label="Hover Color" value={s.socialHoverColor ?? ""} onChange={(v) => onChange({ ...s, socialHoverColor: v })} />
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
