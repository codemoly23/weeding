"use client";

import { Plus, Trash2 } from "lucide-react";
import type {
  PlanigateVendorsWidgetSettings,
  PlanigateVendorCard,
} from "@/lib/page-builder/types";
import { DEFAULT_PLANIGATE_VENDORS_SETTINGS } from "@/lib/page-builder/defaults";
import {
  TextInput,
  NumberInput,
  SelectInput,
  ToggleSwitch,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";
import { ImageUpload } from "@/app/admin/appearance/landing-page/components/ui/image-upload";
import { useFieldAccordion } from "@/components/page-builder/settings/use-field-accordion";
import { Button } from "@/components/ui/button";

interface Props {
  settings: Partial<PlanigateVendorsWidgetSettings>;
  onChange: (settings: PlanigateVendorsWidgetSettings) => void;
  activeTab: "content" | "style" | "advanced";
  activeFieldId?: string | null;
}

export function PlanigateVendorsSettingsPanel({
  settings: partial,
  onChange,
  activeTab,
  activeFieldId,
}: Props) {
  const { getAccordionProps } = useFieldAccordion(activeFieldId);

  const settings: PlanigateVendorsWidgetSettings = {
    heading: partial?.heading ?? DEFAULT_PLANIGATE_VENDORS_SETTINGS.heading,
    viewAllText:
      partial?.viewAllText ?? DEFAULT_PLANIGATE_VENDORS_SETTINGS.viewAllText,
    viewAllHref:
      partial?.viewAllHref ?? DEFAULT_PLANIGATE_VENDORS_SETTINGS.viewAllHref,
    dataSource:
      partial?.dataSource ?? DEFAULT_PLANIGATE_VENDORS_SETTINGS.dataSource ?? "manual",
    onlyFeatured:
      partial?.onlyFeatured ?? DEFAULT_PLANIGATE_VENDORS_SETTINGS.onlyFeatured ?? false,
    limit: partial?.limit ?? DEFAULT_PLANIGATE_VENDORS_SETTINGS.limit ?? 5,
    items: partial?.items?.length
      ? partial.items
      : DEFAULT_PLANIGATE_VENDORS_SETTINGS.items,
  };

  const update = <K extends keyof PlanigateVendorsWidgetSettings>(
    key: K,
    value: PlanigateVendorsWidgetSettings[K]
  ) => onChange({ ...settings, [key]: value });

  const updateItem = (idx: number, patch: Partial<PlanigateVendorCard>) => {
    update(
      "items",
      settings.items.map((item, i) => (i === idx ? { ...item, ...patch } : item))
    );
  };

  const addItem = () => {
    update("items", [
      ...settings.items,
      {
        id: `v_${Date.now()}`,
        image: "",
        name: "New Vendor",
        category: "Category · City",
        rating: 5,
        reviewCount: 0,
      },
    ]);
  };

  const removeItem = (idx: number) => {
    update(
      "items",
      settings.items.filter((_, i) => i !== idx)
    );
  };

  if (activeTab === "content") {
    return (
      <div className="space-y-3">
        <AccordionSection title="Header" defaultOpen {...getAccordionProps("header")}>
          <div className="space-y-3">
            <TextInput
              label="Section heading"
              value={settings.heading}
              onChange={(v) => update("heading", v)}
              placeholder="Populära leverantörer nära dig"
            />
            <TextInput
              label="View-all link text"
              value={settings.viewAllText}
              onChange={(v) => update("viewAllText", v)}
              placeholder="Visa alla"
            />
            <TextInput
              label="View-all link URL"
              value={settings.viewAllHref}
              onChange={(v) => update("viewAllHref", v)}
              placeholder="/vendors"
            />
          </div>
        </AccordionSection>

        <AccordionSection title="Data Source" defaultOpen {...getAccordionProps("data-source")}>
          <div className="space-y-3">
            <SelectInput
              label="Source"
              value={settings.dataSource ?? "manual"}
              onChange={(v) => update("dataSource", v as "manual" | "auto")}
              options={[
                { value: "manual", label: "Manual (use cards below)" },
                { value: "auto", label: "Live from Vendor table" },
              ]}
              description="Auto pulls approved & active vendors from the marketplace."
            />
            {settings.dataSource === "auto" && (
              <>
                <ToggleSwitch
                  label="Only featured vendors"
                  checked={settings.onlyFeatured ?? false}
                  onChange={(v) => update("onlyFeatured", v)}
                  description="Restrict to vendors with the Featured flag."
                />
                <NumberInput
                  label="How many to display"
                  value={settings.limit ?? 5}
                  onChange={(v) => update("limit", v)}
                  min={1}
                  max={12}
                />
              </>
            )}
          </div>
        </AccordionSection>

        <AccordionSection title="Manual Vendor Cards (fallback)" {...getAccordionProps("items")}>
          <div className="space-y-3">
            {settings.items.map((item, idx) => (
              <div
                key={item.id}
                className="space-y-2 rounded-md border border-border p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Vendor {idx + 1}
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
                  label="Name"
                  value={item.name}
                  onChange={(v) => updateItem(idx, { name: v })}
                />
                <TextInput
                  label="Category & city"
                  value={item.category}
                  onChange={(v) => updateItem(idx, { category: v })}
                  placeholder="Festlokal · Stockholm"
                />
                <ImageUpload
                  label="Image"
                  value={item.image}
                  onChange={(url) => updateItem(idx, { image: url })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <NumberInput
                    label="Rating (0-5)"
                    value={item.rating}
                    onChange={(v) => updateItem(idx, { rating: v })}
                    min={0}
                    max={5}
                    step={0.1}
                  />
                  <NumberInput
                    label="Reviews"
                    value={item.reviewCount}
                    onChange={(v) => updateItem(idx, { reviewCount: v })}
                    min={0}
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              className="w-full"
            >
              <Plus className="mr-2 h-3.5 w-3.5" /> Add Vendor
            </Button>
          </div>
        </AccordionSection>
      </div>
    );
  }

  return null;
}
