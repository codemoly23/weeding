"use client";

import { useCallback } from "react";
import type { ServiceChecklistCardWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_SERVICE_CHECKLIST_CARD_SETTINGS, DEFAULT_WIDGET_CONTAINER } from "@/lib/page-builder/defaults";
import { ContainerStyleSection } from "@/components/page-builder/shared/container-style-section";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";
import { useFieldAccordion } from "@/components/page-builder/settings/use-field-accordion";
import {
  TextInput,
  NumberInput,
  ToggleSwitch,
  ColorInput,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";

interface ServiceChecklistCardSettingsPanelProps {
  settings: Partial<ServiceChecklistCardWidgetSettings>;
  onChange: (settings: ServiceChecklistCardWidgetSettings) => void;
  activeTab: "content" | "style" | "advanced";
  activeFieldId?: string | null;
}

export function ServiceChecklistCardSettingsPanel({
  settings: partialSettings,
  onChange,
  activeTab,
  activeFieldId,
}: ServiceChecklistCardSettingsPanelProps) {
  const { getAccordionProps } = useFieldAccordion(activeFieldId);
  const settings: ServiceChecklistCardWidgetSettings = {
    ...DEFAULT_SERVICE_CHECKLIST_CARD_SETTINGS,
    ...partialSettings,
    stats: partialSettings?.stats ?? DEFAULT_SERVICE_CHECKLIST_CARD_SETTINGS.stats,
    container: { ...DEFAULT_WIDGET_CONTAINER, ...partialSettings?.container },
  };

  const updateField = useCallback(
    <K extends keyof ServiceChecklistCardWidgetSettings>(
      key: K,
      value: ServiceChecklistCardWidgetSettings[K]
    ) => {
      onChange({ ...settings, [key]: value });
    },
    [settings, onChange]
  );

  // Stats helpers
  const updateStat = (index: number, field: "value" | "label", val: string) => {
    const newStats = [...settings.stats];
    newStats[index] = { ...newStats[index], [field]: val };
    updateField("stats", newStats);
  };

  const addStat = () => {
    updateField("stats", [...settings.stats, { value: "0", label: "Label" }]);
  };

  const removeStat = (index: number) => {
    updateField("stats", settings.stats.filter((_, i) => i !== index));
  };

  // Content Tab
  const renderContentTab = () => (
    <div className="space-y-1">
      <AccordionSection title="Card Content" {...getAccordionProps("card-content")} defaultOpen>
        <div className="space-y-3">
          <TextInput
            label="Card Title"
            value={settings.cardTitle}
            onChange={(v) => updateField("cardTitle", v)}
          />
          <ToggleSwitch
            label="Auto-load from service features"
            checked={settings.autoItems}
            onChange={(v) => updateField("autoItems", v)}
          />
          <NumberInput
            label="Item Limit"
            value={settings.itemLimit}
            onChange={(v) => updateField("itemLimit", v)}
            min={0}
            max={50}
            description="0 = show all features"
          />
          <ToggleSwitch
            label="Auto-scroll (marquee)"
            checked={settings.autoScroll}
            onChange={(v) => updateField("autoScroll", v)}
          />
          {settings.autoScroll && (
            <>
              <NumberInput
                label="Scroll Speed (seconds)"
                value={settings.autoScrollSpeed}
                onChange={(v) => updateField("autoScrollSpeed", v)}
                min={5}
                max={60}
                description="Full cycle duration — higher = slower"
              />
              <NumberInput
                label="Visible Height (px)"
                value={settings.maxHeight}
                onChange={(v) => updateField("maxHeight", v)}
                min={100}
                max={600}
              />
            </>
          )}
        </div>
      </AccordionSection>

      <AccordionSection title="Stats Row" {...getAccordionProps("stats")}>
        <div className="space-y-3">
          <ToggleSwitch
            label="Show Stats"
            checked={settings.showStats}
            onChange={(v) => updateField("showStats", v)}
          />
          {settings.showStats && (
            <div className="space-y-2">
              {settings.stats.map((stat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={stat.value}
                    onChange={(e) => updateStat(i, "value", e.target.value)}
                    placeholder="1,200+"
                    className="h-8 text-xs flex-1"
                  />
                  <Input
                    value={stat.label}
                    onChange={(e) => updateStat(i, "label", e.target.value)}
                    placeholder="Clients"
                    className="h-8 text-xs flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => removeStat(i)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full h-8 text-xs" onClick={addStat}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Stat
              </Button>
            </div>
          )}
        </div>
      </AccordionSection>
    </div>
  );

  // Style Tab
  const renderStyleTab = () => (
    <div className="space-y-1">
      <AccordionSection title="Card Style" {...getAccordionProps("card-style")} defaultOpen>
        <div className="space-y-3">
          <ColorInput
            label="Background Color"
            value={settings.backgroundColor}
            onChange={(v) => updateField("backgroundColor", v)}
          />
          <ColorInput
            label="Accent Color"
            value={settings.accentColor}
            onChange={(v) => updateField("accentColor", v)}
          />
          <NumberInput
            label="Border Radius"
            value={settings.borderRadius}
            onChange={(v) => updateField("borderRadius", v)}
            min={0}
            max={40}
          />
          <div className="space-y-1">
            <Label className="text-xs">Box Shadow</Label>
            <Input
              value={settings.shadow}
              onChange={(e) => updateField("shadow", e.target.value)}
              className="h-8 text-xs"
              placeholder="0 24px 64px rgba(27,58,45,0.22)"
            />
          </div>
        </div>
      </AccordionSection>
    </div>
  );

  // Advanced Tab
  const renderAdvancedTab = () => (
    <ContainerStyleSection
      container={settings.container!}
      onChange={(container) => updateField("container", container)}
    />
  );

  return (
    <>
      {activeTab === "content" && renderContentTab()}
      {activeTab === "style" && renderStyleTab()}
      {activeTab === "advanced" && renderAdvancedTab()}
    </>
  );
}
