"use client";

import { Plus, Trash2 } from "lucide-react";
import type {
  PlanigateFeaturesWidgetSettings,
  PlanigateFeatureItem,
} from "@/lib/page-builder/types";
import { DEFAULT_PLANIGATE_FEATURES_SETTINGS } from "@/lib/page-builder/defaults";
import {
  TextInput,
  TextAreaInput,
  ColorPicker,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";
import { useFieldAccordion } from "@/components/page-builder/settings/use-field-accordion";
import { Button } from "@/components/ui/button";

interface Props {
  settings: Partial<PlanigateFeaturesWidgetSettings>;
  onChange: (settings: PlanigateFeaturesWidgetSettings) => void;
  activeTab: "content" | "style" | "advanced";
  activeFieldId?: string | null;
}

export function PlanigateFeaturesSettingsPanel({
  settings: partial,
  onChange,
  activeTab,
  activeFieldId,
}: Props) {
  const { getAccordionProps } = useFieldAccordion(activeFieldId);

  const settings: PlanigateFeaturesWidgetSettings = {
    items: partial?.items?.length
      ? partial.items
      : DEFAULT_PLANIGATE_FEATURES_SETTINGS.items,
  };

  const updateItem = (idx: number, patch: Partial<PlanigateFeatureItem>) => {
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
          id: `f_${Date.now()}`,
          icon: "Sparkles",
          iconBgColor: "#E8E2D7",
          title: "New Feature",
          description: "Description here.",
          linkText: "Läs mer",
          href: "#",
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
        <AccordionSection title="Feature Cards" defaultOpen {...getAccordionProps("items")}>
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
                  label="Title"
                  value={item.title}
                  onChange={(v) => updateItem(idx, { title: v })}
                />
                <TextAreaInput
                  label="Description"
                  value={item.description}
                  onChange={(v) => updateItem(idx, { description: v })}
                  rows={2}
                />
                <TextInput
                  label="Icon (Lucide name)"
                  value={item.icon}
                  onChange={(v) => updateItem(idx, { icon: v })}
                  placeholder="Mail, Users, LayoutGrid..."
                />
                <ColorPicker
                  label="Icon background color"
                  value={item.iconBgColor}
                  onChange={(v) => updateItem(idx, { iconBgColor: v })}
                />
                <TextInput
                  label="Link text"
                  value={item.linkText}
                  onChange={(v) => updateItem(idx, { linkText: v })}
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
              <Plus className="mr-2 h-3.5 w-3.5" /> Add Card
            </Button>
          </div>
        </AccordionSection>
      </div>
    );
  }

  return null;
}
