// ============================================
// PAGE BUILDER RENDERER
// Renders Page Builder sections on the frontend (view-only)
// ============================================

import { cn } from "@/lib/utils";
import type { Section, Column, Widget, WidgetType } from "@/lib/page-builder/types";
import {
  getLayoutGridClass,
  getColumnSpanClasses,
  getMaxWidthClass,
} from "@/lib/page-builder/section-layouts";
import { WidgetRenderer } from "./widget-renderer";

// ============================================
// PAGE BUILDER RENDERER
// ============================================

interface PageBuilderRendererProps {
  sections: Section[];
  className?: string;
}

export function PageBuilderRenderer({ sections, className }: PageBuilderRendererProps) {
  if (!sections || sections.length === 0) {
    return null;
  }

  // Sort sections by order
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className={cn("page-builder-content", className)}>
      {sortedSections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </div>
  );
}

// ============================================
// SECTION RENDERER
// ============================================

interface SectionRendererProps {
  section: Section;
}

function SectionRenderer({ section }: SectionRendererProps) {
  const { settings, layout, columns } = section;
  const columnSpanClasses = getColumnSpanClasses(layout);

  // Build background styles
  const backgroundStyles: React.CSSProperties = {};

  // Handle new background system
  if (settings.background) {
    const { background } = settings;

    switch (background.type) {
      case "solid":
        if (background.color) {
          backgroundStyles.backgroundColor = background.color;
        }
        break;
      case "gradient":
        if (background.gradient) {
          const { type, angle, colors } = background.gradient;
          const colorStops = colors
            .map((c) => `${c.color} ${c.position}%`)
            .join(", ");
          backgroundStyles.backgroundImage =
            type === "linear"
              ? `linear-gradient(${angle}deg, ${colorStops})`
              : `radial-gradient(circle, ${colorStops})`;
        }
        break;
      case "image":
        if (background.image?.url) {
          backgroundStyles.backgroundImage = `url(${background.image.url})`;
          backgroundStyles.backgroundSize = background.image.size || "cover";
          backgroundStyles.backgroundPosition = background.image.position || "center";
          backgroundStyles.backgroundRepeat = background.image.repeat || "no-repeat";
          if (background.image.fixed) {
            backgroundStyles.backgroundAttachment = "fixed";
          }
        }
        break;
    }
  }

  // Legacy background support
  if (settings.backgroundColor && !settings.background?.type) {
    backgroundStyles.backgroundColor = settings.backgroundColor;
  }
  if (settings.backgroundImage && !settings.background?.type) {
    backgroundStyles.backgroundImage = `url(${settings.backgroundImage})`;
    backgroundStyles.backgroundSize = "cover";
    backgroundStyles.backgroundPosition = "center";
  }

  return (
    <section
      className={cn(
        "relative w-full",
        settings.className
      )}
      style={{
        ...backgroundStyles,
        paddingTop: `${settings.paddingTop}px`,
        paddingBottom: `${settings.paddingBottom}px`,
        borderRadius: settings.borderRadius ? `${settings.borderRadius}px` : undefined,
      }}
    >
      {/* Background Overlay */}
      {settings.backgroundOverlay?.enabled && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: settings.backgroundOverlay.color,
            opacity: settings.backgroundOverlay.opacity,
            borderRadius: settings.borderRadius ? `${settings.borderRadius}px` : undefined,
          }}
        />
      )}

      {/* Container */}
      <div
        className={cn(
          "relative mx-auto px-4",
          !settings.fullWidth && getMaxWidthClass(settings.maxWidth)
        )}
      >
        {/* Grid */}
        <div
          className={cn("grid", getLayoutGridClass(layout))}
          style={{ gap: `${settings.gap}px` }}
        >
          {columns.map((column, index) => (
            <ColumnRenderer
              key={column.id}
              column={column}
              spanClass={columnSpanClasses[index] || "col-span-12"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// COLUMN RENDERER
// ============================================

interface ColumnRendererProps {
  column: Column;
  spanClass: string;
}

function ColumnRenderer({ column, spanClass }: ColumnRendererProps) {
  const { settings, widgets } = column;

  // Vertical alignment classes
  const alignmentClasses = {
    top: "justify-start",
    center: "justify-center",
    bottom: "justify-end",
  };

  return (
    <div
      className={cn(
        "flex flex-col",
        spanClass,
        alignmentClasses[settings.verticalAlign],
        settings.className
      )}
      style={{
        padding: settings.padding ? `${settings.padding}px` : undefined,
        backgroundColor: settings.backgroundColor,
      }}
    >
      {widgets.map((widget) => (
        <WidgetRenderer key={widget.id} widget={widget} />
      ))}
    </div>
  );
}
