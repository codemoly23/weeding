"use client";

import type { ImageWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_IMAGE_SETTINGS } from "@/lib/page-builder/defaults";
import {
  TextInput,
  SelectInput,
  NumberInput,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { ImageUpload } from "@/app/admin/appearance/landing-page/components/ui/image-upload";

interface ImageWidgetSettingsProps {
  settings: ImageWidgetSettings;
  onChange: (settings: ImageWidgetSettings) => void;
  activeTab?: "content" | "style" | "advanced";
}

export function ImageWidgetSettingsPanel({
  settings,
  onChange,
  activeTab = "content",
}: ImageWidgetSettingsProps) {
  // Merge with defaults
  const s: ImageWidgetSettings = {
    ...DEFAULT_IMAGE_SETTINGS,
    ...settings,
  };

  const updateField = <K extends keyof ImageWidgetSettings>(
    key: K,
    value: ImageWidgetSettings[K]
  ) => {
    onChange({ ...s, [key]: value });
  };

  // Content Tab
  const renderContentTab = () => (
    <div className="space-y-4">
      {/* Image Upload */}
      <ImageUpload
        label="Image"
        description="Recommended: Use WebP or optimized images"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        value={s.src}
        onChange={(url) => updateField("src", url)}
      />

      {/* Alt Text */}
      <TextInput
        label="Alt Text"
        value={s.alt}
        onChange={(v) => updateField("alt", v)}
        placeholder="Describe the image for accessibility"
        description="Important for SEO and accessibility"
      />
    </div>
  );

  // Style Tab
  const renderStyleTab = () => (
    <div className="space-y-4">
      {/* Aspect Ratio */}
      <SelectInput
        label="Aspect Ratio"
        value={s.aspectRatio}
        onChange={(v) => updateField("aspectRatio", v as ImageWidgetSettings["aspectRatio"])}
        options={[
          { value: "auto", label: "Auto" },
          { value: "1:1", label: "Square (1:1)" },
          { value: "4:3", label: "Standard (4:3)" },
          { value: "16:9", label: "Widescreen (16:9)" },
          { value: "3:2", label: "Photo (3:2)" },
        ]}
      />

      {/* Object Fit */}
      <SelectInput
        label="Object Fit"
        value={s.objectFit}
        onChange={(v) => updateField("objectFit", v as ImageWidgetSettings["objectFit"])}
        options={[
          { value: "cover", label: "Cover" },
          { value: "contain", label: "Contain" },
          { value: "fill", label: "Fill" },
        ]}
      />

      {/* Border Radius */}
      <NumberInput
        label="Border Radius"
        value={s.borderRadius}
        onChange={(v) => updateField("borderRadius", v)}
        min={0}
        max={50}
        step={1}
        unit="px"
      />

      {/* Shadow */}
      <SelectInput
        label="Shadow"
        value={s.shadow}
        onChange={(v) => updateField("shadow", v as ImageWidgetSettings["shadow"])}
        options={[
          { value: "none", label: "None" },
          { value: "sm", label: "Small" },
          { value: "md", label: "Medium" },
          { value: "lg", label: "Large" },
          { value: "xl", label: "Extra Large" },
          { value: "2xl", label: "2X Large" },
        ]}
      />
    </div>
  );

  // Advanced Tab
  const renderAdvancedTab = () => (
    <div className="space-y-4">
      {/* Animation */}
      <SelectInput
        label="Entrance Animation"
        value={s.animation}
        onChange={(v) => updateField("animation", v as ImageWidgetSettings["animation"])}
        options={[
          { value: "none", label: "None" },
          { value: "fade", label: "Fade In" },
          { value: "slide-up", label: "Slide Up" },
          { value: "zoom", label: "Zoom In" },
        ]}
      />
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
