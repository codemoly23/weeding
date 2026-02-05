// ============================================
// PAGE BUILDER - MAIN EXPORTS
// ============================================

// Types
export * from "./types";

// Section Layouts
export * from "./section-layouts";

// Widget Registry
export {
  WidgetRegistry,
  WIDGET_CATEGORIES,
  generateId,
  createSection,
  createWidget,
} from "./widget-registry";

// Default Settings
export * from "./defaults";

// Service Context (for Service Details template)
export {
  ServiceProvider,
  useServiceContext,
  useOptionalServiceContext,
  filterSectionsByDisplayOptions,
  resolvePlaceholders,
  DEFAULT_DISPLAY_OPTIONS,
  WIDGET_TO_DISPLAY_OPTION,
  type ServiceData,
  type ServiceDisplayOptions,
  type ServiceFeatureData,
  type ServiceFAQData,
  type PackageData,
  type ServiceCategoryData,
} from "./contexts/service-context";
