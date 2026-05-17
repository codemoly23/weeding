"use client";

import { Plus, Trash2 } from "lucide-react";
import type {
  PlanigateStatsWidgetSettings,
  PlanigateStatItem,
} from "@/lib/page-builder/types";
import { DEFAULT_PLANIGATE_STATS_SETTINGS } from "@/lib/page-builder/defaults";
import {
  TextInput,
  SelectInput,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";
import { useFieldAccordion } from "@/components/page-builder/settings/use-field-accordion";
import { Button } from "@/components/ui/button";

interface Props {
  settings: Partial<PlanigateStatsWidgetSettings>;
  onChange: (settings: PlanigateStatsWidgetSettings) => void;
  activeTab: "content" | "style" | "advanced";
  activeFieldId?: string | null;
}

export function PlanigateStatsSettingsPanel({
  settings: partial,
  onChange,
  activeTab,
  activeFieldId,
}: Props) {
  const { getAccordionProps } = useFieldAccordion(activeFieldId);

  const settings: PlanigateStatsWidgetSettings = {
    items: partial?.items?.length
      ? partial.items
      : DEFAULT_PLANIGATE_STATS_SETTINGS.items,
  };

  const updateItem = (idx: number, patch: Partial<PlanigateStatItem>) => {
    onChange({
      ...settings,
      items: settings.items.map((item, i) =>
        i === idx ? { ...item, ...patch } : item
      ),
    });
  };

  const addItem = () => {
    onChange({
      ...settings,
      items: [
        ...settings.items,
        {
          id: `s_${Date.now()}`,
          icon: "Sparkles",
          number: "0+",
          label: "New stat",
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
        <AccordionSection title="Stats" defaultOpen {...getAccordionProps("items")}>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Numbers like "12 000+" count up automatically when scrolled into view.
            </p>
            {settings.items.map((item, idx) => (
              <div
                key={item.id}
                className="space-y-2 rounded-md border border-border p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Stat {idx + 1}
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
                <SelectInput
                  label="Live data source"
                  value={item.dataKey ?? "static"}
                  onChange={(v) =>
                    updateItem(idx, {
                      dataKey:
                        v === "static"
                          ? undefined
                          : (v as PlanigateStatItem["dataKey"]),
                    })
                  }
                  options={[
                    { value: "static", label: "Static — use number below" },
                    { value: "totalEvents", label: "Live: total events" },
                    { value: "totalGuests", label: "Live: total guests" },
                    { value: "approvedVendors", label: "Live: approved vendors" },
                  ]}
                  description="Static keeps the number as-is. Live replaces it with a real DB count (with the '+' suffix preserved)."
                />
                <TextInput
                  label={
                    item.dataKey
                      ? "Fallback number (used while loading or on error)"
                      : "Number"
                  }
                  value={item.number}
                  onChange={(v) => updateItem(idx, { number: v })}
                  placeholder="12 000+"
                />
                <TextInput
                  label="Label"
                  value={item.label}
                  onChange={(v) => updateItem(idx, { label: v })}
                  placeholder="Event skapade"
                />
                <TextInput
                  label="Icon (Lucide name)"
                  value={item.icon}
                  onChange={(v) => updateItem(idx, { icon: v })}
                  placeholder="Sparkles, Users, Store, Globe"
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
              <Plus className="mr-2 h-3.5 w-3.5" /> Add Stat
            </Button>
          </div>
        </AccordionSection>
      </div>
    );
  }

  return null;
}
