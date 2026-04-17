"use client";

import type { BlogPostHeroWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_BLOG_POST_HERO_SETTINGS } from "@/lib/page-builder/defaults";
import {
  SelectInput,
  NumberInput,
  ColorInput,
  ToggleSwitch,
  TextInput,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";

interface BlogPostHeroSettingsProps {
  settings: BlogPostHeroWidgetSettings;
  onChange: (settings: BlogPostHeroWidgetSettings) => void;
  activeFieldId?: string | null;
  activeTab?: "content" | "style" | "advanced";
}

export function BlogPostHeroSettingsPanel({
  settings,
  onChange,
  activeTab = "content",
}: BlogPostHeroSettingsProps) {
  const s = {
    ...DEFAULT_BLOG_POST_HERO_SETTINGS,
    ...settings,
    breadcrumb: { ...DEFAULT_BLOG_POST_HERO_SETTINGS.breadcrumb, ...settings?.breadcrumb },
    categoryPill: { ...DEFAULT_BLOG_POST_HERO_SETTINGS.categoryPill, ...settings?.categoryPill },
    title: { ...DEFAULT_BLOG_POST_HERO_SETTINGS.title, ...settings?.title },
    lead: { ...DEFAULT_BLOG_POST_HERO_SETTINGS.lead, ...settings?.lead },
    meta: { ...DEFAULT_BLOG_POST_HERO_SETTINGS.meta, ...settings?.meta },
  } as BlogPostHeroWidgetSettings;

  const updateBreadcrumb = (key: keyof BlogPostHeroWidgetSettings["breadcrumb"], value: unknown) =>
    onChange({ ...s, breadcrumb: { ...s.breadcrumb, [key]: value } });

  const updateCategoryPill = (key: keyof BlogPostHeroWidgetSettings["categoryPill"], value: unknown) =>
    onChange({ ...s, categoryPill: { ...s.categoryPill, [key]: value } });

  const updateTitle = (key: keyof BlogPostHeroWidgetSettings["title"], value: unknown) =>
    onChange({ ...s, title: { ...s.title, [key]: value } });

  const updateLead = (key: keyof BlogPostHeroWidgetSettings["lead"], value: unknown) =>
    onChange({ ...s, lead: { ...s.lead, [key]: value } });

  const updateMeta = (key: keyof BlogPostHeroWidgetSettings["meta"], value: unknown) =>
    onChange({ ...s, meta: { ...s.meta, [key]: value } });

  const renderContentTab = () => (
    <div className="space-y-3">
      <AccordionSection title="Breadcrumb" defaultOpen>
        <ToggleSwitch
          label="Show Breadcrumb"
          checked={s.breadcrumb.show}
          onChange={(v) => updateBreadcrumb("show", v)}
        />
      </AccordionSection>

      <AccordionSection title="Category Pill">
        <ToggleSwitch
          label="Show Category Pill"
          checked={s.categoryPill.show}
          onChange={(v) => updateCategoryPill("show", v)}
        />
        {s.categoryPill.show && (
          <ToggleSwitch
            label="Uppercase"
            checked={s.categoryPill.uppercase ?? true}
            onChange={(v) => updateCategoryPill("uppercase", v)}
          />
        )}
      </AccordionSection>

      <AccordionSection title="Title">
        <TextInput
          label="Accent Words (comma-separated)"
          value={s.title.accentWords ?? ""}
          onChange={(v) => updateTitle("accentWords", v)}
          placeholder="Leave empty for auto-detect"
        />
        <SelectInput
          label="Alignment"
          value={s.alignment ?? "center"}
          onChange={(v) => onChange({ ...s, alignment: v as BlogPostHeroWidgetSettings["alignment"] })}
          options={[
            { value: "left", label: "Left" },
            { value: "center", label: "Center" },
          ]}
        />
      </AccordionSection>

      <AccordionSection title="Lead Text">
        <ToggleSwitch
          label="Show Lead"
          checked={s.lead.show}
          onChange={(v) => updateLead("show", v)}
        />
        {s.lead.show && (
          <NumberInput
            label="Max Width"
            value={s.lead.maxWidth ?? 700}
            onChange={(v) => updateLead("maxWidth", v)}
            min={400}
            max={1200}
            step={20}
            unit="px"
          />
        )}
      </AccordionSection>

      <AccordionSection title="Meta">
        <ToggleSwitch
          label="Show Meta Bar"
          checked={s.meta.show}
          onChange={(v) => updateMeta("show", v)}
        />
        {s.meta.show && (
          <>
            <ToggleSwitch label="Show Author" checked={s.meta.showAuthor} onChange={(v) => updateMeta("showAuthor", v)} />
            <ToggleSwitch label="Show Date" checked={s.meta.showDate} onChange={(v) => updateMeta("showDate", v)} />
            <ToggleSwitch label="Show Reading Time" checked={s.meta.showReadingTime} onChange={(v) => updateMeta("showReadingTime", v)} />
            <ToggleSwitch label="Show Views" checked={s.meta.showViews} onChange={(v) => updateMeta("showViews", v)} />
          </>
        )}
      </AccordionSection>
    </div>
  );

  const renderStyleTab = () => (
    <div className="space-y-3">
      <AccordionSection title="Title Colors" defaultOpen>
        <ColorInput label="Title Color" value={s.title.color ?? "#ffffff"} onChange={(v) => updateTitle("color", v)} />
        <ColorInput label="Accent Color" value={s.title.accentColor ?? ""} onChange={(v) => updateTitle("accentColor", v)} />
      </AccordionSection>

      <AccordionSection title="Lead Color">
        <ColorInput label="Lead Text Color" value={s.lead.color ?? "#cbd5e1"} onChange={(v) => updateLead("color", v)} />
      </AccordionSection>

      <AccordionSection title="Category Pill Colors">
        <ColorInput label="Background" value={s.categoryPill.bgColor ?? ""} onChange={(v) => updateCategoryPill("bgColor", v)} />
        <ColorInput label="Text" value={s.categoryPill.textColor ?? ""} onChange={(v) => updateCategoryPill("textColor", v)} />
        <ColorInput label="Border" value={s.categoryPill.borderColor ?? ""} onChange={(v) => updateCategoryPill("borderColor", v)} />
      </AccordionSection>

      <AccordionSection title="Meta Colors">
        <ColorInput label="Avatar Gradient From" value={s.meta.avatarBgFrom ?? ""} onChange={(v) => updateMeta("avatarBgFrom", v)} />
        <ColorInput label="Avatar Gradient To" value={s.meta.avatarBgTo ?? ""} onChange={(v) => updateMeta("avatarBgTo", v)} />
        <ColorInput label="Name Color" value={s.meta.nameColor ?? "#ffffff"} onChange={(v) => updateMeta("nameColor", v)} />
        <ColorInput label="Role Color" value={s.meta.roleColor ?? ""} onChange={(v) => updateMeta("roleColor", v)} />
        <ColorInput label="Stat Color" value={s.meta.statColor ?? "#ffffff"} onChange={(v) => updateMeta("statColor", v)} />
        <ColorInput label="Stat Label Color" value={s.meta.statLabelColor ?? ""} onChange={(v) => updateMeta("statLabelColor", v)} />
        <ColorInput label="Icon Color" value={s.meta.iconColor ?? ""} onChange={(v) => updateMeta("iconColor", v)} />
        <ColorInput label="Divider Color" value={s.meta.dividerColor ?? ""} onChange={(v) => updateMeta("dividerColor", v)} />
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
