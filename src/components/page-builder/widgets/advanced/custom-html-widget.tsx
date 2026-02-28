"use client";

import { useId } from "react";
import DOMPurify from "isomorphic-dompurify";
import type { CustomHtmlWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_CUSTOM_HTML_SETTINGS } from "@/lib/page-builder/defaults";
import { WidgetContainer } from "@/components/page-builder/shared/widget-container";

/**
 * Scope CSS selectors with a wrapper class while preserving @keyframes and @media blocks.
 * Uses a segment-based approach: splits CSS at @keyframes boundaries,
 * scopes only the non-keyframes segments, then reassembles.
 */
function scopeCss(css: string, scopeClass: string): string {
  const keyframeRegex = /@keyframes\s+[\w-]+\s*\{[^}]*(?:\{[^}]*\}[^}]*)*\}/g;
  const segments: string[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Split CSS into alternating [regular, @keyframes, regular, ...] segments
  while ((match = keyframeRegex.exec(css)) !== null) {
    // Add the regular CSS before this @keyframes block (scoped)
    if (match.index > lastIndex) {
      segments.push(scopeSelectors(css.slice(lastIndex, match.index), scopeClass));
    }
    // Add the @keyframes block as-is (no scoping)
    segments.push(match[0]);
    lastIndex = match.index + match[0].length;
  }

  // Add remaining CSS after the last @keyframes block
  if (lastIndex < css.length) {
    segments.push(scopeSelectors(css.slice(lastIndex), scopeClass));
  }

  return segments.join("");
}

/** Scope regular CSS selectors by prefixing with the wrapper class */
function scopeSelectors(css: string, scopeClass: string): string {
  return css.replace(
    /([^{}@][^{}]*?)\{/g,
    (_match, selector: string) => {
      const trimmed = selector.trim();
      if (!trimmed || trimmed.startsWith("@")) return _match;
      const scoped = trimmed
        .split(",")
        .map((s: string) => `.${scopeClass} ${s.trim()}`)
        .join(", ");
      return `${scoped} {`;
    }
  );
}

interface CustomHtmlWidgetProps {
  settings: Partial<CustomHtmlWidgetSettings>;
  isPreview?: boolean;
}

export function CustomHtmlWidget({ settings: partialSettings }: CustomHtmlWidgetProps) {
  const scopeId = useId().replace(/:/g, "");
  const settings: CustomHtmlWidgetSettings = {
    ...DEFAULT_CUSTOM_HTML_SETTINGS,
    ...partialSettings,
  };

  const { html, css } = settings;

  if (!html && !css) {
    return (
      <WidgetContainer container={settings.container}>
        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground border border-dashed rounded-lg">
          Custom HTML — add HTML content in settings
        </div>
      </WidgetContainer>
    );
  }

  // Sanitize HTML: strip scripts and event handlers, allow SVGs
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ADD_TAGS: ["svg", "path", "circle", "polyline", "line", "rect", "polygon", "ellipse", "g", "defs", "use"],
    ADD_ATTR: ["viewBox", "fill", "stroke", "stroke-width", "d", "cx", "cy", "r", "points", "x", "y", "width", "height", "x1", "y1", "x2", "y2", "rx", "ry", "transform"],
    FORBID_TAGS: ["script", "iframe", "object", "embed"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur", "onsubmit", "onchange", "oninput"],
  });

  // Scope CSS by prefixing selectors with a unique wrapper class
  const scopeClass = `chw-${scopeId}`;
  const scopedCss = css ? scopeCss(css, scopeClass) : "";

  return (
    <WidgetContainer container={settings.container}>
      <div className={scopeClass}>
        {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
        <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
      </div>
    </WidgetContainer>
  );
}
