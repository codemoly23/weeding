"use client";

import type { BlogPostTocWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_BLOG_POST_TOC_SETTINGS } from "@/lib/page-builder/defaults";
import {
  NumberInput,
  ColorInput,
  ToggleSwitch,
  TextInput,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface BlogPostTocSettingsProps {
  settings: BlogPostTocWidgetSettings;
  onChange: (settings: BlogPostTocWidgetSettings) => void;
  activeFieldId?: string | null;
  activeTab?: "content" | "style" | "advanced";
}

export function BlogPostTocSettingsPanel({
  settings,
  onChange,
  activeTab = "content",
}: BlogPostTocSettingsProps) {
  const s = { ...DEFAULT_BLOG_POST_TOC_SETTINGS, ...settings } as BlogPostTocWidgetSettings;

  const toggleHeadingLevel = (level: 2 | 3 | 4) => {
    const current = s.headingLevels;
    const next = current.includes(level)
      ? current.filter((l) => l !== level)
      : [...current, level].sort() as Array<2 | 3 | 4>;
    onChange({ ...s, headingLevels: next });
  };

  const renderContentTab = () => (
    <div className="space-y-3">
      <AccordionSection title="TOC Options" defaultOpen>
        <TextInput
          label="Title"
          value={s.title}
          onChange={(v) => onChange({ ...s, title: v })}
          placeholder="On This Page"
        />
        <ToggleSwitch
          label="Show Title"
          checked={s.showTitle}
          onChange={(v) => onChange({ ...s, showTitle: v })}
        />
        <ToggleSwitch
          label="Enable Scroll Spy"
          checked={s.scrollSpy}
          onChange={(v) => onChange({ ...s, scrollSpy: v })}
        />

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Heading Levels</Label>
          <div className="space-y-2 rounded-md border p-2">
            {([2, 3, 4] as Array<2 | 3 | 4>).map((level) => (
              <div key={level} className="flex items-center gap-2">
                <Checkbox
                  id={`toc-h${level}`}
                  checked={s.headingLevels.includes(level)}
                  onCheckedChange={() => toggleHeadingLevel(level)}
                />
                <label htmlFor={`toc-h${level}`} className="text-sm cursor-pointer flex-1">
                  H{level} headings
                </label>
              </div>
            ))}
          </div>
        </div>
      </AccordionSection>
    </div>
  );

  const renderStyleTab = () => (
    <div className="space-y-3">
      <AccordionSection title="Colors" defaultOpen>
        <ColorInput label="Title Color" value={s.titleColor ?? ""} onChange={(v) => onChange({ ...s, titleColor: v })} />
        <ColorInput label="Item Color" value={s.itemColor ?? ""} onChange={(v) => onChange({ ...s, itemColor: v })} />
        <ColorInput label="Item Hover Color" value={s.itemHoverColor ?? ""} onChange={(v) => onChange({ ...s, itemHoverColor: v })} />
        <ColorInput label="Active Color" value={s.activeColor ?? ""} onChange={(v) => onChange({ ...s, activeColor: v })} />
        <ColorInput label="Active Background" value={s.activeBgColor ?? ""} onChange={(v) => onChange({ ...s, activeBgColor: v })} />
        <ColorInput label="Border Color" value={s.borderColor ?? ""} onChange={(v) => onChange({ ...s, borderColor: v })} />
      </AccordionSection>
      <AccordionSection title="Spacing">
        <NumberInput
          label="Font Size"
          value={s.fontSize ?? 14}
          onChange={(v) => onChange({ ...s, fontSize: v })}
          min={10}
          max={18}
          step={1}
          unit="px"
        />
        <NumberInput
          label="Item Spacing"
          value={s.itemSpacing ?? 12}
          onChange={(v) => onChange({ ...s, itemSpacing: v })}
          min={4}
          max={32}
          step={2}
          unit="px"
        />
      </AccordionSection>
    </div>
  );

  const renderAdvancedTab = () => (
    <div className="space-y-3">
      <AccordionSection title="Sticky" defaultOpen>
        <ToggleSwitch
          label="Sticky TOC"
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
