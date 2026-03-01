"use client";

import { useState, useEffect } from "react";
import type { TickerMarqueeWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_TICKER_MARQUEE_SETTINGS, DEFAULT_WIDGET_CONTAINER } from "@/lib/page-builder/defaults";
import { ContainerStyleSection } from "@/components/page-builder/shared/container-style-section";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";
import { useFieldAccordion } from "@/components/page-builder/settings/use-field-accordion";
import {
  SelectInput,
  ColorInput,
  NumberInput,
  ToggleSwitch,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { ExternalLink } from "lucide-react";

interface TickerOption {
  id: string;
  name: string;
  isActive: boolean;
}

interface TickerMarqueeWidgetSettingsPanelProps {
  settings: Partial<TickerMarqueeWidgetSettings>;
  onChange: (settings: TickerMarqueeWidgetSettings) => void;
  activeTab: "content" | "style" | "advanced";
  activeFieldId?: string | null;
}

export function TickerMarqueeWidgetSettingsPanel({
  settings: partialSettings,
  onChange,
  activeTab,
  activeFieldId,
}: TickerMarqueeWidgetSettingsPanelProps) {
  const { getAccordionProps } = useFieldAccordion(activeFieldId);
  const settings: TickerMarqueeWidgetSettings = {
    ...DEFAULT_TICKER_MARQUEE_SETTINGS,
    ...partialSettings,
    container: { ...DEFAULT_WIDGET_CONTAINER, ...partialSettings?.container },
  };

  const [tickers, setTickers] = useState<TickerOption[]>([]);
  const [loadingTickers, setLoadingTickers] = useState(false);

  useEffect(() => {
    setLoadingTickers(true);
    fetch("/api/admin/tickers")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTickers(data.map((t: any) => ({ id: t.id, name: t.name, isActive: t.isActive })));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingTickers(false));
  }, []);

  const updateField = <K extends keyof TickerMarqueeWidgetSettings>(
    key: K,
    value: TickerMarqueeWidgetSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  // Content Tab
  if (activeTab === "content") {
    const NONE_VALUE = "__none__";
    const tickerOptions = [
      { label: "None (use inline items)", value: NONE_VALUE },
      ...tickers.map((t) => ({
        label: `${t.name}${!t.isActive ? " (inactive)" : ""}`,
        value: t.name,
      })),
    ];

    return (
      <div className="space-y-4">
        <AccordionSection title="Ticker Source" defaultOpen {...getAccordionProps("tickerName")}>
          <div className="space-y-3">
            <SelectInput
              label="Select Ticker"
              value={settings.tickerName || NONE_VALUE}
              onChange={(v) => updateField("tickerName", v === NONE_VALUE ? undefined : v)}
              options={tickerOptions}
            />
            {loadingTickers && (
              <p className="text-xs text-muted-foreground">Loading tickers...</p>
            )}
            <a
              href="/admin/content/ticker"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              Manage Tickers
            </a>
          </div>
        </AccordionSection>

        <AccordionSection title="Animation" {...getAccordionProps("speed")}>
          <NumberInput
            label="Speed (seconds)"
            value={settings.speed}
            onChange={(v) => updateField("speed", v)}
            min={5}
            max={120}
            step={1}
          />
          <ToggleSwitch
            label="Pause on Hover"
            description="Pause the marquee when hovering over it"
            checked={settings.pauseOnHover ?? true}
            onChange={(v) => updateField("pauseOnHover", v)}
          />
        </AccordionSection>
      </div>
    );
  }

  // Style Tab
  if (activeTab === "style") {
    return (
      <div className="space-y-4">
        <AccordionSection title="Colors" defaultOpen {...getAccordionProps("textColor")}>
          <ColorInput
            label="Text Color"
            value={settings.textColor}
            onChange={(v) => updateField("textColor", v)}
          />
        </AccordionSection>

        <ContainerStyleSection
          container={settings.container || DEFAULT_WIDGET_CONTAINER}
          onChange={(container) => onChange({ ...settings, container })}
        />
      </div>
    );
  }

  // Advanced Tab - handled by common spacing
  return null;
}
