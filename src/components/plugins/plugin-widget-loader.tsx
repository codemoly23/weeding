"use client";

import { useEffect, useState, Suspense, lazy } from "react";

interface PluginWidget {
  pluginSlug: string;
  widgetName: string;
  position: string;
  config: Record<string, unknown>;
}

interface PluginWidgetLoaderProps {
  position: "body-end" | "body-start" | "header" | "footer";
}

// Lazy load the LiveSupport chat widget for better performance
const LiveSupportChatWidget = lazy(() =>
  import("./livesupport-chat-widget").then((mod) => ({
    default: mod.LiveSupportChatWidget,
  }))
);

/**
 * Render widget component based on plugin and widget name
 */
function renderWidget(widget: PluginWidget) {
  // LiveSupport Pro Chat Widget
  if (widget.pluginSlug === "livesupport-pro" && widget.widgetName === "ChatWidget") {
    return (
      <Suspense fallback={null}>
        <LiveSupportChatWidget
          config={widget.config as {
            position?: "bottom-right" | "bottom-left";
            primaryColor?: string;
            welcomeMessage?: string;
            enabled?: boolean;
          }}
        />
      </Suspense>
    );
  }

  // For other plugins, render a placeholder div that can be hydrated by external scripts
  return (
    <div
      id={`plugin-widget-${widget.pluginSlug}-${widget.widgetName}`}
      data-plugin={widget.pluginSlug}
      data-widget={widget.widgetName}
      data-config={JSON.stringify(widget.config)}
    />
  );
}

/**
 * Dynamic Plugin Widget Loader
 * Loads widgets from active plugins based on their manifest configuration.
 *
 * This component fetches active plugin widgets from the API and renders
 * the appropriate widget component for each plugin.
 *
 * Supported widgets:
 * - livesupport-pro/ChatWidget - Live chat widget for customer support
 *
 * For unsupported plugins, it renders placeholder divs that can be
 * hydrated by the plugin's own scripts.
 */
export function PluginWidgetLoader({ position }: PluginWidgetLoaderProps) {
  const [widgets, setWidgets] = useState<PluginWidget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWidgets() {
      try {
        const response = await fetch(`/api/plugins/widgets?position=${position}`);
        if (response.ok) {
          const data = await response.json();
          setWidgets(data.widgets || []);
        }
      } catch (error) {
        console.error("Error loading plugin widgets:", error);
      } finally {
        setLoading(false);
      }
    }

    loadWidgets();
  }, [position]);

  // Don't render anything while loading or if no widgets
  if (loading || widgets.length === 0) {
    return null;
  }

  return (
    <>
      {widgets.map((widget) => (
        <div key={`${widget.pluginSlug}-${widget.widgetName}`}>
          {renderWidget(widget)}
        </div>
      ))}
    </>
  );
}
