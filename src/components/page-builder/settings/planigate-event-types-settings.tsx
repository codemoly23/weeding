"use client";

import { Plus, Trash2 } from "lucide-react";
import type {
  PlanigateEventTypesWidgetSettings,
  PlanigateEventTypeCard,
} from "@/lib/page-builder/types";
import { DEFAULT_PLANIGATE_EVENT_TYPES_SETTINGS } from "@/lib/page-builder/defaults";
import {
  TextInput,
  SelectInput,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";
import { ImageUpload } from "@/app/admin/appearance/landing-page/components/ui/image-upload";
import { useFieldAccordion } from "@/components/page-builder/settings/use-field-accordion";
import { Button } from "@/components/ui/button";

interface Props {
  settings: Partial<PlanigateEventTypesWidgetSettings>;
  onChange: (settings: PlanigateEventTypesWidgetSettings) => void;
  activeTab: "content" | "style" | "advanced";
  activeFieldId?: string | null;
}

export function PlanigateEventTypesSettingsPanel({
  settings: partial,
  onChange,
  activeTab,
  activeFieldId,
}: Props) {
  const { getAccordionProps } = useFieldAccordion(activeFieldId);

  const settings: PlanigateEventTypesWidgetSettings = {
    heading: partial?.heading ?? DEFAULT_PLANIGATE_EVENT_TYPES_SETTINGS.heading,
    dataSource:
      partial?.dataSource ??
      DEFAULT_PLANIGATE_EVENT_TYPES_SETTINGS.dataSource ??
      "manual",
    items: partial?.items?.length
      ? partial.items
      : DEFAULT_PLANIGATE_EVENT_TYPES_SETTINGS.items,
  };

  const updateItem = (idx: number, patch: Partial<PlanigateEventTypeCard>) => {
    const next = settings.items.map((item, i) =>
      i === idx ? { ...item, ...patch } : item
    );
    onChange({ ...settings, items: next });
  };

  const addItem = () => {
    onChange({
      ...settings,
      items: [
        ...settings.items,
        {
          id: `e_${Date.now()}`,
          label: "New Event",
          image: "",
          href: "/events/new",
        },
      ],
    });
  };

  const removeItem = (idx: number) => {
    onChange({
      ...settings,
      items: settings.items.filter((_, i) => i !== idx),
    });
  };

  if (activeTab === "content") {
    return (
      <div className="space-y-3">
        <AccordionSection title="Heading" defaultOpen {...getAccordionProps("heading")}>
          <TextInput
            label="Section heading"
            value={settings.heading}
            onChange={(v) => onChange({ ...settings, heading: v })}
            placeholder="Utforska efter eventtyp"
          />
        </AccordionSection>

        <AccordionSection title="Data Source" defaultOpen {...getAccordionProps("data-source")}>
          <SelectInput
            label="Source"
            value={settings.dataSource ?? "manual"}
            onChange={(v) =>
              onChange({ ...settings, dataSource: v as "manual" | "auto" })
            }
            options={[
              { value: "manual", label: "Manual (use cards below)" },
              { value: "auto", label: "Live from Service Categories" },
            ]}
            description="Auto uses category names from /api/services/categories. Images fall back to the manual cards by position."
          />
        </AccordionSection>

        <AccordionSection title="Manual Cards (fallback)" {...getAccordionProps("items")}>
          <div className="space-y-3">
            {settings.items.map((item, idx) => (
              <div
                key={item.id}
                className="space-y-2 rounded-md border border-border p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Card {idx + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(idx)}
                    className="h-7 w-7 p-0 text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <TextInput
                  label="Label"
                  value={item.label}
                  onChange={(v) => updateItem(idx, { label: v })}
                />
                <ImageUpload
                  label="Image"
                  value={item.image}
                  onChange={(url) => updateItem(idx, { image: url })}
                />
                <TextInput
                  label="Link URL"
                  value={item.href}
                  onChange={(v) => updateItem(idx, { href: v })}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              className="w-full"
            >
              <Plus className="mr-2 h-3.5 w-3.5" /> Add Event Type
            </Button>
          </div>
        </AccordionSection>
      </div>
    );
  }

  return null;
}
