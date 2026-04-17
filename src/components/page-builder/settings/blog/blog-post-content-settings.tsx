"use client";

import type { BlogPostContentWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_BLOG_POST_CONTENT_SETTINGS } from "@/lib/page-builder/defaults";
import {
  SelectInput,
  NumberInput,
  ColorInput,
  ToggleSwitch,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";

interface BlogPostContentSettingsProps {
  settings: BlogPostContentWidgetSettings;
  onChange: (settings: BlogPostContentWidgetSettings) => void;
  activeFieldId?: string | null;
  activeTab?: "content" | "style" | "advanced";
}

export function BlogPostContentSettingsPanel({
  settings,
  onChange,
  activeTab = "content",
}: BlogPostContentSettingsProps) {
  const s = {
    ...DEFAULT_BLOG_POST_CONTENT_SETTINGS,
    ...settings,
    coverImage: { ...DEFAULT_BLOG_POST_CONTENT_SETTINGS.coverImage, ...settings?.coverImage },
    prose: { ...DEFAULT_BLOG_POST_CONTENT_SETTINGS.prose, ...settings?.prose },
  } as BlogPostContentWidgetSettings;

  const updateCoverImage = (key: keyof BlogPostContentWidgetSettings["coverImage"], value: unknown) =>
    onChange({ ...s, coverImage: { ...s.coverImage, [key]: value } });

  const updateProse = (key: keyof BlogPostContentWidgetSettings["prose"], value: unknown) =>
    onChange({ ...s, prose: { ...s.prose, [key]: value } });

  const renderContentTab = () => (
    <div className="space-y-3">
      <AccordionSection title="Cover Image" defaultOpen>
        <ToggleSwitch
          label="Show Cover Image"
          checked={s.coverImage.show}
          onChange={(v) => updateCoverImage("show", v)}
        />
        {s.coverImage.show && (
          <>
            <SelectInput
              label="Aspect Ratio"
              value={s.coverImage.aspectRatio ?? "16:9"}
              onChange={(v) => updateCoverImage("aspectRatio", v)}
              options={[
                { value: "16:9", label: "16:9" },
                { value: "21:9", label: "21:9 (Cinematic)" },
                { value: "4:3", label: "4:3" },
              ]}
            />
            <NumberInput
              label="Border Radius"
              value={s.coverImage.borderRadius ?? 16}
              onChange={(v) => updateCoverImage("borderRadius", v)}
              min={0}
              max={32}
              step={2}
              unit="px"
            />
            <NumberInput
              label="Margin Bottom"
              value={s.coverImage.marginBottom ?? 32}
              onChange={(v) => updateCoverImage("marginBottom", v)}
              min={0}
              max={80}
              step={4}
              unit="px"
            />
          </>
        )}
      </AccordionSection>

      <AccordionSection title="Prose">
        <SelectInput
          label="Prose Size"
          value={s.prose.size ?? "lg"}
          onChange={(v) => updateProse("size", v)}
          options={[
            { value: "sm", label: "Small" },
            { value: "base", label: "Base" },
            { value: "lg", label: "Large" },
            { value: "xl", label: "Extra Large" },
          ]}
        />
        <NumberInput
          label="Max Width"
          value={s.prose.maxWidth ?? 720}
          onChange={(v) => updateProse("maxWidth", v)}
          min={400}
          max={1200}
          step={20}
          unit="px"
        />
      </AccordionSection>
    </div>
  );

  const renderStyleTab = () => (
    <div className="space-y-3">
      <AccordionSection title="Prose Colors" defaultOpen>
        <ColorInput label="Heading Color" value={s.prose.headingColor ?? ""} onChange={(v) => updateProse("headingColor", v)} />
        <ColorInput label="Body Color" value={s.prose.bodyColor ?? "#475569"} onChange={(v) => updateProse("bodyColor", v)} />
        <ColorInput label="Link Color" value={s.prose.linkColor ?? ""} onChange={(v) => updateProse("linkColor", v)} />
        <ColorInput label="Link Hover Color" value={s.prose.linkHoverColor ?? ""} onChange={(v) => updateProse("linkHoverColor", v)} />
        <ColorInput label="Blockquote Color" value={s.prose.quoteColor ?? ""} onChange={(v) => updateProse("quoteColor", v)} />
        <ColorInput label="Code Background" value={s.prose.codeBg ?? "#f1f5f9"} onChange={(v) => updateProse("codeBg", v)} />
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
