"use client";

import { Plus, Trash2 } from "lucide-react";
import type {
  PlanigateHeroWidgetSettings,
  PlanigateEventTypePill,
} from "@/lib/page-builder/types";
import { DEFAULT_PLANIGATE_HERO_SETTINGS } from "@/lib/page-builder/defaults";
import {
  TextInput,
  TextAreaInput,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";
import { ImageUpload } from "@/app/admin/appearance/landing-page/components/ui/image-upload";
import { useFieldAccordion } from "@/components/page-builder/settings/use-field-accordion";
import { Button } from "@/components/ui/button";

interface Props {
  settings: Partial<PlanigateHeroWidgetSettings>;
  onChange: (settings: PlanigateHeroWidgetSettings) => void;
  activeTab: "content" | "style" | "advanced";
  activeFieldId?: string | null;
}

export function PlanigateHeroSettingsPanel({
  settings: partial,
  onChange,
  activeTab,
  activeFieldId,
}: Props) {
  const { getAccordionProps } = useFieldAccordion(activeFieldId);

  const settings: PlanigateHeroWidgetSettings = {
    ...DEFAULT_PLANIGATE_HERO_SETTINGS,
    ...partial,
    collageImages: {
      ...DEFAULT_PLANIGATE_HERO_SETTINGS.collageImages,
      ...(partial?.collageImages ?? {}),
    },
    eventPills: partial?.eventPills?.length
      ? partial.eventPills
      : DEFAULT_PLANIGATE_HERO_SETTINGS.eventPills,
    avatars: partial?.avatars?.length
      ? partial.avatars
      : DEFAULT_PLANIGATE_HERO_SETTINGS.avatars,
  };

  const update = <K extends keyof PlanigateHeroWidgetSettings>(
    key: K,
    value: PlanigateHeroWidgetSettings[K]
  ) => onChange({ ...settings, [key]: value });

  const updateAvatar = (idx: number, url: string) => {
    const next = [...settings.avatars];
    next[idx] = url;
    update("avatars", next);
  };

  const updatePill = (idx: number, patch: Partial<PlanigateEventTypePill>) => {
    const next = settings.eventPills.map((p, i) =>
      i === idx ? { ...p, ...patch } : p
    );
    update("eventPills", next);
  };

  const addPill = () => {
    update("eventPills", [
      ...settings.eventPills,
      {
        id: `p_${Date.now()}`,
        label: "New",
        icon: "Sparkles",
        value: "new",
      },
    ]);
  };

  const removePill = (idx: number) => {
    update("eventPills", settings.eventPills.filter((_, i) => i !== idx));
  };

  if (activeTab === "content") {
    return (
      <div className="space-y-3">
        {/* Headline */}
        <AccordionSection title="Heading" defaultOpen {...getAccordionProps("heading")}>
          <div className="space-y-3">
            <TextInput
              label="First line (regular)"
              value={settings.headingPart1}
              onChange={(v) => update("headingPart1", v)}
              placeholder="Allt för livets"
            />
            <TextInput
              label="Second line (italic serif gold)"
              value={settings.headingPart2}
              onChange={(v) => update("headingPart2", v)}
              placeholder="event – på ett ställe"
            />
            <TextAreaInput
              label="Subtitle"
              value={settings.subtitle}
              onChange={(v) => update("subtitle", v)}
              rows={3}
            />
          </div>
        </AccordionSection>

        {/* Trust Row */}
        <AccordionSection title="Trust Badge" {...getAccordionProps("trust")}>
          <div className="space-y-3">
            <TextInput
              label="Rating count text"
              value={settings.ratingCountText}
              onChange={(v) => update("ratingCountText", v)}
              placeholder="12 000+ nöjda användare"
            />
            <TextInput
              label="Tagline (after divider)"
              value={settings.ratingDividerText}
              onChange={(v) => update("ratingDividerText", v)}
              placeholder="Sveriges nya plattform för eventplanering"
            />
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Avatar images (4)
              </label>
              {[0, 1, 2, 3].map((i) => (
                <ImageUpload
                  key={i}
                  value={settings.avatars[i] ?? ""}
                  onChange={(url) => updateAvatar(i, url)}
                  label={`Avatar ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </AccordionSection>

        {/* Collage Images */}
        <AccordionSection title="Hero Collage Images" {...getAccordionProps("collage")}>
          <div className="space-y-3">
            <ImageUpload
              label="Couple (top-left, large portrait)"
              value={settings.collageImages.couple}
              onChange={(url) =>
                update("collageImages", { ...settings.collageImages, couple: url })
              }
            />
            <ImageUpload
              label="Dinner (top-right, horizontal)"
              value={settings.collageImages.dinner}
              onChange={(url) =>
                update("collageImages", { ...settings.collageImages, dinner: url })
              }
            />
            <ImageUpload
              label="Toasting (middle-right)"
              value={settings.collageImages.toasting}
              onChange={(url) =>
                update("collageImages", { ...settings.collageImages, toasting: url })
              }
            />
            <ImageUpload
              label="Laptop (overlay, product UI)"
              value={settings.collageImages.laptop}
              onChange={(url) =>
                update("collageImages", { ...settings.collageImages, laptop: url })
              }
            />
            <ImageUpload
              label="Phone (right edge, product UI)"
              value={settings.collageImages.phone}
              onChange={(url) =>
                update("collageImages", { ...settings.collageImages, phone: url })
              }
            />
          </div>
        </AccordionSection>

        {/* Search Module */}
        <AccordionSection title="Search Module" {...getAccordionProps("search")}>
          <div className="space-y-3">
            <TextInput
              label="Search heading"
              value={settings.searchHeading}
              onChange={(v) => update("searchHeading", v)}
              placeholder="Vad planerar du?"
            />
            <TextInput
              label="Service input label"
              value={settings.serviceInputLabel}
              onChange={(v) => update("serviceInputLabel", v)}
            />
            <TextInput
              label="Service input placeholder"
              value={settings.serviceInputPlaceholder}
              onChange={(v) => update("serviceInputPlaceholder", v)}
            />
            <TextInput
              label="Location input label"
              value={settings.locationInputLabel}
              onChange={(v) => update("locationInputLabel", v)}
            />
            <TextInput
              label="Location input placeholder"
              value={settings.locationInputPlaceholder}
              onChange={(v) => update("locationInputPlaceholder", v)}
            />
            <TextInput
              label="Primary CTA text"
              value={settings.ctaText}
              onChange={(v) => update("ctaText", v)}
            />
            <TextInput
              label="Primary CTA link"
              value={settings.ctaHref}
              onChange={(v) => update("ctaHref", v)}
            />
            <TextInput
              label="Explore link text"
              value={settings.exploreLinkText}
              onChange={(v) => update("exploreLinkText", v)}
            />
            <TextInput
              label="Explore link href"
              value={settings.exploreLinkHref}
              onChange={(v) => update("exploreLinkHref", v)}
            />
          </div>
        </AccordionSection>

        {/* Event Pills */}
        <AccordionSection title="Event Pills" {...getAccordionProps("pills")}>
          <div className="space-y-3">
            {settings.eventPills.map((pill, idx) => (
              <div
                key={pill.id}
                className="space-y-2 rounded-md border border-border p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Pill {idx + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePill(idx)}
                    className="h-7 w-7 p-0 text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <TextInput
                  label="Label"
                  value={pill.label}
                  onChange={(v) => updatePill(idx, { label: v })}
                />
                <TextInput
                  label="Icon (Lucide name)"
                  value={pill.icon}
                  onChange={(v) => updatePill(idx, { icon: v })}
                />
                <TextInput
                  label="Value (used in URL)"
                  value={pill.value}
                  onChange={(v) => updatePill(idx, { value: v })}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPill}
              className="w-full"
            >
              <Plus className="mr-2 h-3.5 w-3.5" /> Add Pill
            </Button>
          </div>
        </AccordionSection>
      </div>
    );
  }

  if (activeTab === "style") {
    return (
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground px-1">
          Hero layout is pixel-perfect locked to match the reference design.
          Style adjustments (colors, fonts) are tuned via the global theme. To
          change content, switch to the Content tab.
        </p>
      </div>
    );
  }

  return null;
}
