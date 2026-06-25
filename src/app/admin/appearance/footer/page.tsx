"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Save,
  Eye,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Loader2,
  ExternalLink,
  Columns3,
  Type,
  LinkIcon,
  Mail,
  Share2,
  Phone,
  Code,
  FileText,
  MapPin,
  Building2,
  Monitor,
  Smartphone,
  Shield,
  Image as ImageIcon,
  Sparkles,
  Palette,
  CircleDot,
  SquareStack,
  Maximize2,
  Wand2,
  Download,
  Upload,
  RefreshCw,
  Send,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useBusinessConfig } from "@/hooks/use-business-config";
import type { FooterConfig, FooterWidget, FooterWidgetType, FooterLayout, BottomLink, TrustBadge, FooterWidgetLink, ButtonHoverEffect, ButtonCustomStyle, GradientDirection, Translations } from "@/lib/header-footer/types";
import { LocalizedInput } from "@/components/admin/LocalizedInput";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CraftButton, CraftButtonLabel, CraftButtonIcon } from "@/components/ui/craft-button";
import { PrimaryFlowButton } from "@/components/ui/flow-button";
import { NeuralButton } from "@/components/ui/neural-button";
import { ArrowUpRight, MousePointerClick } from "lucide-react";
import { PresetGallery } from "./components/PresetGallery";
import { BUTTON_STYLE_PRESETS, type ButtonStylePreset } from "@/lib/button-presets";
import { useLanguage } from "@/lib/i18n/language-context";

const layoutOptions: { value: FooterLayout; labelKey: string; descriptionKey: string }[] = [
  { value: "MULTI_COLUMN", labelKey: "admin.footer.layoutMultiColumn", descriptionKey: "admin.footer.layoutMultiColumnDesc" },
  { value: "CENTERED", labelKey: "admin.footer.layoutCentered", descriptionKey: "admin.footer.layoutCenteredDesc" },
  { value: "MINIMAL", labelKey: "admin.footer.layoutMinimal", descriptionKey: "admin.footer.layoutMinimalDesc" },
  { value: "MEGA", labelKey: "admin.footer.layoutMega", descriptionKey: "admin.footer.layoutMegaDesc" },
  // New layouts (Phase 2)
  { value: "STACKED", labelKey: "admin.footer.layoutStacked", descriptionKey: "admin.footer.layoutStackedDesc" },
  { value: "ASYMMETRIC", labelKey: "admin.footer.layoutAsymmetric", descriptionKey: "admin.footer.layoutAsymmetricDesc" },
  { value: "MEGA_PLUS", labelKey: "admin.footer.layoutMegaPlus", descriptionKey: "admin.footer.layoutMegaPlusDesc" },
  { value: "APP_FOCUSED", labelKey: "admin.footer.layoutAppFocused", descriptionKey: "admin.footer.layoutAppFocusedDesc" },
];

const widgetTypes: { value: FooterWidgetType; labelKey: string; icon: React.ReactNode }[] = [
  { value: "BRAND", labelKey: "admin.footer.widgetBrand", icon: <Building2 className="h-4 w-4" /> },
  { value: "LINKS", labelKey: "admin.footer.widgetLinks", icon: <LinkIcon className="h-4 w-4" /> },
  { value: "CONTACT", labelKey: "admin.footer.widgetContact", icon: <Phone className="h-4 w-4" /> },
  { value: "SOCIAL", labelKey: "admin.footer.widgetSocial", icon: <Share2 className="h-4 w-4" /> },
  { value: "TEXT", labelKey: "admin.footer.widgetText", icon: <Type className="h-4 w-4" /> },
  { value: "RECENT_POSTS", labelKey: "admin.footer.widgetRecentPosts", icon: <FileText className="h-4 w-4" /> },
  { value: "SERVICES", labelKey: "admin.footer.widgetServices", icon: <Columns3 className="h-4 w-4" /> },
  { value: "STATES", labelKey: "admin.footer.widgetStates", icon: <MapPin className="h-4 w-4" /> },
  { value: "CUSTOM_HTML", labelKey: "admin.footer.widgetCustomHtml", icon: <Code className="h-4 w-4" /> },
  { value: "BUTTON", labelKey: "admin.footer.widgetButton", icon: <MousePointerClick className="h-4 w-4" /> },
  { value: "NEWSLETTER", labelKey: "admin.footer.widgetNewsletter", icon: <Send className="h-4 w-4" /> },
];

// Gradient direction options for button styling
const gradientDirectionOptions: { value: GradientDirection; labelKey: string }[] = [
  { value: "to-r", labelKey: "admin.footer.dirToR" },
  { value: "to-l", labelKey: "admin.footer.dirToL" },
  { value: "to-t", labelKey: "admin.footer.dirToT" },
  { value: "to-b", labelKey: "admin.footer.dirToB" },
  { value: "to-tr", labelKey: "admin.footer.dirToTr" },
  { value: "to-tl", labelKey: "admin.footer.dirToTl" },
  { value: "to-br", labelKey: "admin.footer.dirToBr" },
  { value: "to-bl", labelKey: "admin.footer.dirToBl" },
];

// Button hover effects
const hoverEffectOptions: { value: ButtonHoverEffect; labelKey: string }[] = [
  { value: "none", labelKey: "admin.footer.hoverNone" },
  { value: "darken", labelKey: "admin.footer.hoverDarken" },
  { value: "lighten", labelKey: "admin.footer.hoverLighten" },
  { value: "shadow-lift", labelKey: "admin.footer.hoverShadowLift" },
  { value: "shadow-press", labelKey: "admin.footer.hoverShadowPress" },
  { value: "scale-up", labelKey: "admin.footer.hoverScaleUp" },
  { value: "scale-down", labelKey: "admin.footer.hoverScaleDown" },
  { value: "slide-fill", labelKey: "admin.footer.hoverSlideFill" },
  { value: "border-fill", labelKey: "admin.footer.hoverBorderFill" },
  { value: "gradient-shift", labelKey: "admin.footer.hoverGradientShift" },
  { value: "glow-pulse", labelKey: "admin.footer.hoverGlowPulse" },
  { value: "ripple", labelKey: "admin.footer.hoverRipple" },
  { value: "craft-expand", labelKey: "admin.footer.hoverCraftExpand" },
  { value: "heartbeat", labelKey: "admin.footer.hoverHeartbeat" },
  { value: "flow-border", labelKey: "admin.footer.hoverFlowBorder" },
  { value: "stitches", labelKey: "admin.footer.hoverStitches" },
  { value: "ring-hover", labelKey: "admin.footer.hoverRingHover" },
  { value: "neural", labelKey: "admin.footer.hoverNeural" },
];

// Convert gradient direction to CSS
function getGradientCSS(direction?: GradientDirection): string {
  switch (direction) {
    case "to-r": return "to right";
    case "to-l": return "to left";
    case "to-t": return "to top";
    case "to-b": return "to bottom";
    case "to-tr": return "to top right";
    case "to-tl": return "to top left";
    case "to-br": return "to bottom right";
    case "to-bl": return "to bottom left";
    default: return "to right";
  }
}

// Get hover effect CSS class for preview
function getPreviewHoverClass(effect?: ButtonHoverEffect): string {
  switch (effect) {
    case "darken": return "hover:brightness-90";
    case "lighten": return "hover:brightness-110";
    case "shadow-lift": return "hover:-translate-y-0.5 hover:shadow-lg";
    case "shadow-press": return "hover:translate-y-0.5 hover:shadow-sm";
    case "scale-up": return "hover:scale-105";
    case "scale-down": return "hover:scale-95";
    case "glow-pulse": return "hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]";
    case "heartbeat": return "animate-heartbeat";
    case "stitches": return "stitches-button";
    case "ring-hover": return "ring-offset-background hover:ring-primary/90 transition-all duration-300 hover:ring-2 hover:ring-offset-2";
    case "slide-fill":
    case "border-fill":
    case "gradient-shift":
    case "ripple":
    case "flow-border":
    case "neural":
      return "";
    default: return "";
  }
}

// Check if effect needs special rendering
function isComplexHoverEffect(effect?: ButtonHoverEffect): boolean {
  return effect === "slide-fill" || effect === "border-fill" || effect === "gradient-shift" || effect === "ripple";
}

// Footer Button Widget Preview Component
function FooterButtonPreview({ style }: { style: ButtonCustomStyle }) {
  const [isHovered, setIsHovered] = useState(false);
  const text = "Button";

  // Check if this is a CraftButton style
  if (style.hoverEffect === "craft-expand") {
    return (
      <CraftButton
        bgColor={style.bgColor || "#18181b"}
        textColor={style.textColor || "#ffffff"}
        size="sm"
        style={{
          boxShadow: style.shadow,
          borderRadius: `${style.borderRadius ?? 9999}px`,
        }}
      >
        <CraftButtonLabel>{text}</CraftButtonLabel>
        <CraftButtonIcon>
          <ArrowUpRight className="size-3 stroke-2" />
        </CraftButtonIcon>
      </CraftButton>
    );
  }

  // Check if this is a FlowButton style
  if (style.hoverEffect === "flow-border") {
    return (
      <PrimaryFlowButton
        className="text-sm"
        ringColor={style.bgColor || '#F97316'}
      >
        {text}
      </PrimaryFlowButton>
    );
  }

  // Check if this is a NeuralButton style
  if (style.hoverEffect === "neural") {
    return (
      <NeuralButton size="sm">
        {text}
      </NeuralButton>
    );
  }

  const hoverClass = getPreviewHoverClass(style.hoverEffect);
  const hasComplexEffect = isComplexHoverEffect(style.hoverEffect);

  const getNormalBackground = () => {
    if (style.useGradient) {
      return `linear-gradient(${getGradientCSS(style.gradientDirection)}, ${style.gradientFrom || "#F97316"}, ${style.gradientTo || "#C2410C"})`;
    }
    return style.bgColor || "#F97316";
  };

  const getHoverBackground = () => {
    if (style.hoverUseGradient) {
      return `linear-gradient(${getGradientCSS(style.hoverGradientDirection)}, ${style.hoverGradientFrom || "#EA580C"}, ${style.hoverGradientTo || "#065F46"})`;
    }
    if (style.hoverBgColor) {
      return style.hoverBgColor;
    }
    return getNormalBackground();
  };

  const getGradientShiftBackground = () => {
    const fromColor = style.bgColor || "#F97316";
    const toColor = style.hoverBgColor || "#C2410C";
    return `linear-gradient(90deg, ${fromColor} 0%, ${toColor} 50%, ${fromColor} 100%)`;
  };

  const getBaseStylesForEffect = (): React.CSSProperties => {
    if (!hasComplexEffect) return {};

    switch (style.hoverEffect) {
      case "slide-fill":
        return {
          boxShadow: isHovered
            ? `inset 200px 0 0 0 ${style.hoverBgColor || "#EA580C"}`
            : `inset 0 0 0 0 ${style.hoverBgColor || "#EA580C"}`,
        };
      case "border-fill":
        return {
          boxShadow: isHovered
            ? `inset 0 0 0 50px ${style.hoverBgColor || "#EA580C"}`
            : `inset 0 0 0 0 ${style.hoverBgColor || "#EA580C"}`,
        };
      case "gradient-shift":
        return {
          backgroundSize: "200% 100%",
          backgroundPosition: isHovered ? "100% 0" : "0% 0",
        };
      case "ripple":
        return {
          boxShadow: isHovered
            ? `0 0 0 8px ${(style.bgColor || "#F97316")}30, 0 0 20px ${(style.bgColor || "#F97316")}20`
            : `0 0 0 0 ${(style.bgColor || "#F97316")}30`,
        };
      default:
        return {};
    }
  };

  const effectStyles = getBaseStylesForEffect();

  const getFinalBackground = () => {
    if (style.hoverEffect === "gradient-shift") {
      return getGradientShiftBackground();
    }
    if (style.hoverEffect === "slide-fill" || style.hoverEffect === "border-fill") {
      return getNormalBackground();
    }
    return isHovered ? getHoverBackground() : getNormalBackground();
  };

  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium cursor-pointer overflow-hidden",
        hoverClass,
        hasComplexEffect ? "transition-all duration-500 ease-out" : "transition-all duration-300"
      )}
      style={{
        background: getFinalBackground(),
        color: isHovered && style.hoverTextColor ? style.hoverTextColor : (style.textColor || "#ffffff"),
        borderWidth: `${style.borderWidth ?? 1}px`,
        borderStyle: "solid",
        borderColor: style.borderColor || style.bgColor || "#F97316",
        borderRadius: `${style.borderRadius ?? 6}px`,
        ...effectStyles,
        ...((!hasComplexEffect && style.shadow) ? { boxShadow: isHovered && style.hoverShadow ? style.hoverShadow : style.shadow } : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {text}
    </span>
  );
}

interface WidgetLink {
  id: string;
  label: string;
  url: string;
  target: "_self" | "_blank";
  translations?: Translations | null;
}

const defaultWidgetFormData = {
  type: "LINKS" as FooterWidgetType,
  title: "",
  showTitle: true,
  headingIcon: "",
  column: 1,
  content: {} as Record<string, unknown>,
  links: [] as WidgetLink[],
  translations: {} as Translations,
};

// Sortable Widget Component
function SortableWidget({
  widget,
  onEdit,
  onDelete,
}: {
  widget: FooterWidget;
  onEdit: (widget: FooterWidget) => void;
  onDelete: (widget: FooterWidget) => void;
}) {
  const { t } = useLanguage();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const widgetTypeEntry = widgetTypes.find((wt) => wt.value === widget.type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-card p-3 transition-shadow",
        isDragging && "shadow-lg ring-2 ring-primary"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {widgetTypeEntry?.icon}
          <span className="text-sm font-medium truncate">
            {widget.title || (widgetTypeEntry ? t(widgetTypeEntry.labelKey) : "")}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {widget.type}
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={() => onEdit(widget)}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 text-destructive"
        onClick={() => onDelete(widget)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Droppable Column Component
function DroppableColumn({
  column,
  widgets,
  isOver,
  onAddWidget,
  onEditWidget,
  onDeleteWidget,
}: {
  column: number;
  widgets: FooterWidget[];
  isOver: boolean;
  onAddWidget: (column: number) => void;
  onEditWidget: (widget: FooterWidget) => void;
  onDeleteWidget: (widget: FooterWidget) => void;
}) {
  const { t } = useLanguage();
  const { setNodeRef } = useDroppable({
    id: `column-${column}`,
  });

  return (
    <div className="space-y-2">
      <Label>{t("admin.footer.columnLabel", { num: String(column) })}</Label>
      <div
        ref={setNodeRef}
        className={cn(
          "min-h-50 space-y-2 rounded-lg border-2 border-dashed p-2 transition-colors",
          isOver && "border-primary bg-primary/5"
        )}
      >
        <SortableContext
          items={widgets.map((w) => w.id)}
          strategy={verticalListSortingStrategy}
        >
          {widgets.length === 0 ? (
            <button
              onClick={() => onAddWidget(column)}
              className="flex h-full min-h-45 w-full flex-col items-center justify-center rounded-lg border border-dashed text-muted-foreground hover:bg-muted/50"
            >
              <Plus className="mb-2 h-6 w-6" />
              <span className="text-sm">{t("admin.footer.addWidget")}</span>
            </button>
          ) : (
            <>
              {widgets.map((widget) => (
                <SortableWidget
                  key={widget.id}
                  widget={widget}
                  onEdit={onEditWidget}
                  onDelete={onDeleteWidget}
                />
              ))}
              <button
                onClick={() => onAddWidget(column)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed py-2 text-sm text-muted-foreground hover:bg-muted/50"
              >
                <Plus className="h-4 w-4" />
                <span>{t("admin.footer.addWidget")}</span>
              </button>
            </>
          )}
        </SortableContext>
      </div>
    </div>
  );
}

export default function FooterBuilderPage() {
  const { t } = useLanguage();
  const { config: businessConfig } = useBusinessConfig();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [footer, setFooter] = useState<FooterConfig | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  // Widget dialog
  const [widgetDialogOpen, setWidgetDialogOpen] = useState(false);
  const [deleteWidgetDialogOpen, setDeleteWidgetDialogOpen] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<FooterWidget | null>(null);
  const [widgetFormData, setWidgetFormData] = useState(defaultWidgetFormData);

  // Widget drag and drop with @dnd-kit
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<number | null>(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Logo preview component for live preview
  const LogoPreview = ({ size = "md", logoMode = "auto" }: { size?: "xs" | "sm" | "md" | "lg" | "xl"; logoMode?: "auto" | "light" | "dark" }) => {
    const sizeClasses = {
      xs: "h-6 w-6 text-[10px]",
      sm: "h-7 w-7 text-[10px]",
      md: "h-8 w-8 text-xs",
      lg: "h-10 w-10 text-sm",
      xl: "h-12 w-12 text-base",
    };
    const imgSizes = {
      xs: 24,
      sm: 28,
      md: 32,
      lg: 40,
      xl: 48,
    };

    // Determine which logo to use based on logoMode
    const getLogoUrl = () => {
      if (logoMode === "light") {
        return businessConfig.logo.url;
      }
      if (logoMode === "dark") {
        return businessConfig.logo.darkUrl || businessConfig.logo.url;
      }
      // Auto: use dark logo if available (since footer is typically dark)
      return businessConfig.logo.darkUrl || businessConfig.logo.url;
    };

    const logoUrl = getLogoUrl();

    if (logoUrl) {
      return (
        <Image
          src={logoUrl}
          alt={businessConfig.name}
          width={imgSizes[size]}
          height={imgSizes[size]}
          className={cn(sizeClasses[size], "rounded-lg object-contain")}
        />
      );
    }

    return (
      <div className={cn(
        sizeClasses[size],
        "rounded-lg bg-primary/20 flex items-center justify-center font-bold text-primary"
      )}>
        {businessConfig.logo.text || businessConfig.name.charAt(0)}
      </div>
    );
  };

  // Form state
  const [formData, setFormData] = useState({
    id: "",
    name: "Default Footer",
    layout: "MULTI_COLUMN" as FooterLayout,
    columns: 4,
    showSocialLinks: true,
    socialPosition: "brand",
    showContactInfo: true,
    contactPosition: "brand",
    bottomBarEnabled: true,
    bottomBarLayout: "split",
    copyrightText: "",
    showDisclaimer: true,
    disclaimerText: "",
    translations: {} as Translations,
    bottomLinks: [] as BottomLink[],
    showTrustBadges: false,
    trustBadges: [] as TrustBadge[],
    // Background styling
    bgType: "solid",
    bgColor: "",
    bgGradient: null as { type: string; colors: { color: string; position: number }[]; angle?: number } | null,
    bgPattern: "",
    bgPatternColor: "",
    bgPatternOpacity: 10,
    bgImage: "",
    bgImageOverlay: "rgba(0,0,0,0.5)",
    // Text colors
    textColor: "",
    headingColor: "",
    linkColor: "",
    linkHoverColor: "",
    accentColor: "",
    borderColor: "",
    // Typography
    headingSize: "sm",
    headingWeight: "semibold",
    headingStyle: "normal",
    // Social icon styling
    socialShape: "circle",
    socialSize: "md",
    socialColorMode: "brand",
    socialHoverEffect: "scale",
    socialBgStyle: "subtle",
    // Divider
    dividerStyle: "solid",
    dividerColor: "",
    // Effects & Animation
    enableAnimations: false,
    entranceAnimation: "",
    animationDuration: 300,
    linkPrefix: "none",
    linkHoverEffect: "color",
    topBorderStyle: "none",
    topBorderHeight: 1,
    topBorderColor: "",
    topBorderGradientFrom: "",
    topBorderGradientTo: "",
    // Shadow & Border radius
    shadow: "none",
    borderRadius: 0,
    // Container
    containerWidth: "full",
    containerStyle: "sharp",
    cornerRadiusTL: 0,
    cornerRadiusTR: 0,
    cornerRadiusBL: 0,
    cornerRadiusBR: 0,
    // Spacing
    paddingTop: 48,
    paddingBottom: 32,
    // Brand Reveal
    brandRevealEnabled: false,
    brandRevealText: "",
    brandRevealColor: "",
    brandRevealOpacity: 0.08,
    // Custom CSS
    customCSS: "",
  });

  useEffect(() => {
    fetchFooter();
  }, []);

  async function fetchFooter() {
    try {
      const res = await fetch("/api/admin/footer");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      if (data.footers && data.footers.length > 0) {
        const activeFooter = data.footers.find((f: FooterConfig) => f.isActive) || data.footers[0];
        setFooter(activeFooter);
        setFormData({
          id: activeFooter.id,
          name: activeFooter.name,
          layout: activeFooter.layout,
          columns: activeFooter.columns,
          showSocialLinks: activeFooter.showSocialLinks,
          socialPosition: activeFooter.socialPosition,
          showContactInfo: activeFooter.showContactInfo,
          contactPosition: activeFooter.contactPosition,
          bottomBarEnabled: activeFooter.bottomBarEnabled,
          bottomBarLayout: activeFooter.bottomBarLayout || "split",
          copyrightText: activeFooter.copyrightText || "",
          showDisclaimer: activeFooter.showDisclaimer,
          disclaimerText: activeFooter.disclaimerText || "",
          translations: activeFooter.translations || {},
          bottomLinks: activeFooter.bottomLinks || [],
          showTrustBadges: activeFooter.showTrustBadges,
          trustBadges: activeFooter.trustBadges || [],
          // Background styling
          bgType: activeFooter.bgType || "solid",
          bgColor: activeFooter.bgColor || "",
          bgGradient: activeFooter.bgGradient || null,
          bgPattern: activeFooter.bgPattern || "",
          bgPatternColor: activeFooter.bgPatternColor || "",
          bgPatternOpacity: activeFooter.bgPatternOpacity || 10,
          bgImage: activeFooter.bgImage || "",
          bgImageOverlay: activeFooter.bgImageOverlay || "rgba(0,0,0,0.5)",
          // Text colors
          textColor: activeFooter.textColor || "",
          headingColor: activeFooter.headingColor || "",
          linkColor: activeFooter.linkColor || "",
          linkHoverColor: activeFooter.linkHoverColor || "",
          accentColor: activeFooter.accentColor || "",
          borderColor: activeFooter.borderColor || "",
          // Typography
          headingSize: activeFooter.headingSize || "sm",
          headingWeight: activeFooter.headingWeight || "semibold",
          headingStyle: activeFooter.headingStyle || "normal",
          // Social icon styling
          socialShape: activeFooter.socialShape || "circle",
          socialSize: activeFooter.socialSize || "md",
          socialColorMode: activeFooter.socialColorMode || "brand",
          socialHoverEffect: activeFooter.socialHoverEffect || "scale",
          socialBgStyle: activeFooter.socialBgStyle || "subtle",
          // Divider
          dividerStyle: activeFooter.dividerStyle || "solid",
          dividerColor: activeFooter.dividerColor || "",
          // Effects & Animation
          enableAnimations: activeFooter.enableAnimations || false,
          entranceAnimation: activeFooter.entranceAnimation || "",
          animationDuration: activeFooter.animationDuration || 300,
          linkPrefix: activeFooter.linkPrefix || "none",
          linkHoverEffect: activeFooter.linkHoverEffect || "color",
          topBorderStyle: activeFooter.topBorderStyle || "none",
          topBorderHeight: activeFooter.topBorderHeight || 1,
          topBorderColor: activeFooter.topBorderColor || "",
          topBorderGradientFrom: activeFooter.topBorderGradientFrom || "",
          topBorderGradientTo: activeFooter.topBorderGradientTo || "",
          // Shadow & Border radius
          shadow: activeFooter.shadow || "none",
          borderRadius: activeFooter.borderRadius || 0,
          // Container
          containerWidth: activeFooter.containerWidth || "full",
          containerStyle: activeFooter.containerStyle || "sharp",
          cornerRadiusTL: activeFooter.cornerRadiusTL || 0,
          cornerRadiusTR: activeFooter.cornerRadiusTR || 0,
          cornerRadiusBL: activeFooter.cornerRadiusBL || 0,
          cornerRadiusBR: activeFooter.cornerRadiusBR || 0,
          // Spacing
          paddingTop: activeFooter.paddingTop,
          paddingBottom: activeFooter.paddingBottom,
          // Brand Reveal
          brandRevealEnabled: activeFooter.brandRevealEnabled || false,
          brandRevealText: activeFooter.brandRevealText || "",
          brandRevealColor: activeFooter.brandRevealColor || "",
          brandRevealOpacity: activeFooter.brandRevealOpacity || 0.08,
          // Custom CSS
          customCSS: activeFooter.customCSS || "",
        });
      }
    } catch {
      toast.error(t("admin.footer.loadFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!footer) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/footer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: footer.id,
          name: formData.name,
          layout: formData.layout,
          columns: formData.columns,
          // Social & Contact
          showSocialLinks: formData.showSocialLinks,
          socialPosition: formData.socialPosition,
          showContactInfo: formData.showContactInfo,
          contactPosition: formData.contactPosition,
          // Bottom Bar
          bottomBarEnabled: formData.bottomBarEnabled,
          bottomBarLayout: formData.bottomBarLayout,
          copyrightText: formData.copyrightText || null,
          showDisclaimer: formData.showDisclaimer,
          disclaimerText: formData.disclaimerText || null,
          translations: formData.translations,
          bottomLinks: formData.bottomLinks,
          // Trust Badges
          showTrustBadges: formData.showTrustBadges,
          trustBadges: formData.trustBadges.length > 0 ? formData.trustBadges : null,
          // Background styling
          bgType: formData.bgType,
          bgColor: formData.bgColor || null,
          bgGradient: formData.bgGradient,
          bgPattern: formData.bgPattern || null,
          bgPatternColor: formData.bgPatternColor || null,
          bgPatternOpacity: formData.bgPatternOpacity,
          bgImage: formData.bgImage || null,
          bgImageOverlay: formData.bgImageOverlay || null,
          // Text colors
          textColor: formData.textColor || null,
          headingColor: formData.headingColor || null,
          linkColor: formData.linkColor || null,
          linkHoverColor: formData.linkHoverColor || null,
          accentColor: formData.accentColor || null,
          borderColor: formData.borderColor || null,
          // Typography
          headingSize: formData.headingSize,
          headingWeight: formData.headingWeight,
          headingStyle: formData.headingStyle,
          // Social icon styling
          socialShape: formData.socialShape,
          socialSize: formData.socialSize,
          socialColorMode: formData.socialColorMode,
          socialHoverEffect: formData.socialHoverEffect,
          socialBgStyle: formData.socialBgStyle,
          // Divider
          dividerStyle: formData.dividerStyle,
          dividerColor: formData.dividerColor || null,
          // Effects & Animation
          enableAnimations: formData.enableAnimations,
          entranceAnimation: formData.entranceAnimation || null,
          animationDuration: formData.animationDuration,
          linkPrefix: formData.linkPrefix,
          linkHoverEffect: formData.linkHoverEffect,
          topBorderStyle: formData.topBorderStyle,
          topBorderHeight: formData.topBorderHeight,
          topBorderColor: formData.topBorderColor || null,
          topBorderGradientFrom: formData.topBorderGradientFrom || null,
          topBorderGradientTo: formData.topBorderGradientTo || null,
          // Shadow & Border radius
          shadow: formData.shadow,
          borderRadius: formData.borderRadius,
          // Container
          containerWidth: formData.containerWidth,
          containerStyle: formData.containerStyle,
          cornerRadiusTL: formData.cornerRadiusTL,
          cornerRadiusTR: formData.cornerRadiusTR,
          cornerRadiusBL: formData.cornerRadiusBL,
          cornerRadiusBR: formData.cornerRadiusBR,
          // Spacing
          paddingTop: formData.paddingTop,
          paddingBottom: formData.paddingBottom,
          // Brand Reveal
          brandRevealEnabled: formData.brandRevealEnabled,
          brandRevealText: formData.brandRevealText || null,
          brandRevealColor: formData.brandRevealColor || null,
          brandRevealOpacity: formData.brandRevealOpacity,
          // Custom CSS
          customCSS: formData.customCSS || null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        console.error("Footer save error:", errorData);
        throw new Error(errorData?.error || "Failed to save");
      }

      toast.success(t("admin.footer.saveSuccess"));
      fetchFooter();
    } catch (error) {
      console.error("Footer save failed:", error);
      toast.error(t("admin.footer.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  // Widget functions
  function openWidgetDialog(column: number) {
    setSelectedWidget(null);
    setWidgetFormData({ ...defaultWidgetFormData, column });
    setWidgetDialogOpen(true);
  }

  function openEditWidgetDialog(widget: FooterWidget) {
    setSelectedWidget(widget);
    // Convert menuItems to links format
    const links: WidgetLink[] = widget.menuItems?.map((item) => ({
      id: item.id,
      label: item.label,
      url: item.url || "",
      target: item.target,
      translations: item.translations || null,
    })) || [];

    setWidgetFormData({
      type: widget.type,
      title: widget.title || "",
      showTitle: widget.showTitle,
      headingIcon: widget.headingIcon || "",
      column: widget.column,
      content: widget.content || {},
      links,
      translations: widget.translations || {},
    });
    setWidgetDialogOpen(true);
  }

  function openDeleteWidgetDialog(widget: FooterWidget) {
    setSelectedWidget(widget);
    setDeleteWidgetDialogOpen(true);
  }

  async function handleWidgetSave() {
    if (!footer) return;

    setSaving(true);
    try {
      const url = "/api/admin/footer/widgets";
      const method = selectedWidget ? "PUT" : "POST";

      // Convert links to menuItems format for LINKS widget type
      const menuItems = widgetFormData.type === "LINKS" && widgetFormData.links.length > 0
        ? widgetFormData.links.map((link, index) => ({
            id: link.id.startsWith("temp-") ? undefined : link.id,
            label: link.label,
            url: link.url,
            target: link.target,
            sortOrder: index,
            isVisible: true,
            ...(link.translations ? { translations: link.translations } : {}),
          }))
        : undefined;

      const payload = {
        ...(selectedWidget && { id: selectedWidget.id }),
        footerId: footer.id,
        type: widgetFormData.type,
        title: widgetFormData.title || null,
        showTitle: widgetFormData.showTitle,
        headingIcon: widgetFormData.headingIcon || null,
        column: widgetFormData.column,
        content: widgetFormData.content,
        translations: widgetFormData.translations,
        menuItems,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success(selectedWidget ? t("admin.footer.widgetUpdated") : t("admin.footer.widgetCreated"));
      setWidgetDialogOpen(false);
      fetchFooter();
    } catch {
      toast.error(t("admin.footer.widgetSaveFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function handleWidgetDelete() {
    if (!selectedWidget) return;

    try {
      const res = await fetch(`/api/admin/footer/widgets?id=${selectedWidget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      toast.success(t("admin.footer.widgetDeleted"));
      setDeleteWidgetDialogOpen(false);
      fetchFooter();
    } catch {
      toast.error(t("admin.footer.widgetDeleteFailed"));
    }
  }

  // Bottom links functions
  function addBottomLink() {
    setFormData({
      ...formData,
      bottomLinks: [...formData.bottomLinks, { label: t("admin.footer.newLink"), url: "/" }],
    });
  }

  function updateBottomLink(index: number, updates: Partial<BottomLink>) {
    const newLinks = [...formData.bottomLinks];
    newLinks[index] = { ...newLinks[index], ...updates };
    setFormData({ ...formData, bottomLinks: newLinks });
  }

  function removeBottomLink(index: number) {
    const newLinks = formData.bottomLinks.filter((_, i) => i !== index);
    setFormData({ ...formData, bottomLinks: newLinks });
  }

  // Trust badges functions
  function addTrustBadge(style: "image" | "pill" = "pill") {
    setFormData({
      ...formData,
      trustBadges: [
        ...formData.trustBadges,
        style === "pill"
          ? { style: "pill" as const, image: "", alt: t("admin.footer.trustBadgeAlt"), text: "", iconName: "shield", url: "" }
          : { style: "image" as const, image: "", alt: t("admin.footer.trustBadgeAlt"), url: "" },
      ],
    });
  }

  function updateTrustBadge(index: number, updates: Partial<TrustBadge>) {
    const newBadges = [...formData.trustBadges];
    newBadges[index] = { ...newBadges[index], ...updates };
    setFormData({ ...formData, trustBadges: newBadges });
  }

  function removeTrustBadge(index: number) {
    const newBadges = formData.trustBadges.filter((_, i) => i !== index);
    setFormData({ ...formData, trustBadges: newBadges });
  }

  // Widget link functions
  function addWidgetLink() {
    const newLink: WidgetLink = {
      id: `temp-${Date.now()}`,
      label: t("admin.footer.newLink"),
      url: "/",
      target: "_self",
    };
    setWidgetFormData({
      ...widgetFormData,
      links: [...widgetFormData.links, newLink],
    });
  }

  function updateWidgetLink(index: number, updates: Partial<WidgetLink>) {
    const newLinks = [...widgetFormData.links];
    newLinks[index] = { ...newLinks[index], ...updates };
    setWidgetFormData({ ...widgetFormData, links: newLinks });
  }

  function removeWidgetLink(index: number) {
    const newLinks = widgetFormData.links.filter((_, i) => i !== index);
    setWidgetFormData({ ...widgetFormData, links: newLinks });
  }

  // @dnd-kit drag and drop handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    if (over && typeof over.id === "string" && over.id.startsWith("column-")) {
      const columnNum = parseInt(over.id.replace("column-", ""));
      setOverColumn(columnNum);
    } else {
      setOverColumn(null);
    }
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverColumn(null);

    if (!over || !footer) return;

    const activeWidget = footer.widgets?.find((w) => w.id === active.id);
    if (!activeWidget) return;

    // Check if dropping on a column
    if (typeof over.id === "string" && over.id.startsWith("column-")) {
      const targetColumn = parseInt(over.id.replace("column-", ""));

      if (activeWidget.column !== targetColumn) {
        // Move to different column
        try {
          const res = await fetch("/api/admin/footer/widgets", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: activeWidget.id,
              footerId: footer.id,
              column: targetColumn,
              sortOrder: 0,
            }),
          });

          if (!res.ok) throw new Error("Failed to move widget");
          toast.success(t("admin.footer.widgetMovedToColumn", { column: String(targetColumn) }));
          fetchFooter();
        } catch {
          toast.error(t("admin.footer.widgetMoveFailed"));
        }
      }
      return;
    }

    // Check if reordering within same column
    const overWidget = footer.widgets?.find((w) => w.id === over.id);
    if (!overWidget) return;

    if (activeWidget.column === overWidget.column && active.id !== over.id) {
      // Reorder within same column
      const columnWidgets = footer.widgets
        ?.filter((w) => w.column === activeWidget.column)
        .sort((a, b) => a.sortOrder - b.sortOrder) || [];

      const oldIndex = columnWidgets.findIndex((w) => w.id === active.id);
      const newIndex = columnWidgets.findIndex((w) => w.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(columnWidgets, oldIndex, newIndex);

        // Update sort orders via API
        try {
          await Promise.all(
            reordered.map((widget, index) =>
              fetch("/api/admin/footer/widgets", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id: widget.id,
                  footerId: footer.id,
                  sortOrder: index,
                }),
              })
            )
          );
          toast.success(t("admin.footer.widgetOrderUpdated"));
          fetchFooter();
        } catch {
          toast.error(t("admin.footer.widgetReorderFailed"));
        }
      }
    } else if (activeWidget.column !== overWidget.column) {
      // Move to different column (dropped on a widget)
      try {
        const res = await fetch("/api/admin/footer/widgets", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: activeWidget.id,
            footerId: footer.id,
            column: overWidget.column,
            sortOrder: overWidget.sortOrder,
          }),
        });

        if (!res.ok) throw new Error("Failed to move widget");
        toast.success(t("admin.footer.widgetMovedToColumn", { column: String(overWidget.column) }));
        fetchFooter();
      } catch {
        toast.error(t("admin.footer.widgetMoveFailed"));
      }
    }
  }, [footer, t]);

  // Get the active widget for drag overlay
  const activeWidget = activeId ? footer?.widgets?.find((w) => w.id === activeId) : null;

  // Group widgets by column
  function getWidgetsByColumn(column: number): FooterWidget[] {
    if (!footer?.widgets) return [];
    return footer.widgets.filter((w) => w.column === column);
  }

  // Get orphan widgets (widgets in columns beyond current column count)
  function getOrphanWidgets(): FooterWidget[] {
    if (!footer?.widgets) return [];
    return footer.widgets.filter((w) => w.column > formData.columns);
  }

  // Social media icons preview component
  const SocialIconsPreview = ({ size = "sm" }: { size?: "sm" | "md" | "lg" }) => {
    const sizeClasses = {
      sm: "h-5 w-5 text-[8px]",
      md: "h-6 w-6 text-[10px]",
      lg: "h-8 w-8 text-xs",
    };
    const socialPlatforms = [
      { name: "f", color: "#1877F2" }, // Facebook
      { name: "𝕏", color: "#000000" }, // X/Twitter
      { name: "in", color: "#0A66C2" }, // LinkedIn
      { name: "ig", color: "#E4405F" }, // Instagram
    ];
    return (
      <div className="flex gap-1.5">
        {socialPlatforms.map((platform, i) => (
          <div
            key={i}
            className={cn(
              "rounded-full flex items-center justify-center font-bold text-white",
              sizeClasses[size]
            )}
            style={{ backgroundColor: platform.color }}
          >
            {platform.name}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("admin.footer.title")}</h1>
          <p className="text-muted-foreground">
            {t("admin.footer.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/" target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              {t("admin.footer.preview")}
              <ExternalLink className="ml-1 h-3 w-3" />
            </Link>
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {t("admin.footer.saveChanges")}
          </Button>
        </div>
      </div>

      {/* Live Preview - Sticky */}
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{t("admin.footer.livePreview")}</CardTitle>
            <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewMode("desktop")}
                className={cn(
                  previewMode === "desktop" &&
                    "bg-background text-foreground shadow-sm hover:bg-background"
                )}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewMode("mobile")}
                className={cn(
                  previewMode === "mobile" &&
                    "bg-background text-foreground shadow-sm hover:bg-background"
                )}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "mx-auto overflow-hidden rounded-lg border transition-all footer-preview relative",
              previewMode === "mobile" ? "max-w-[375px]" : "w-full"
            )}
            style={{
              // Dynamic background based on bgType
              ...(formData.bgType === "solid" && { backgroundColor: formData.bgColor || "#f9fafb" }),
              ...(formData.bgType === "gradient" && formData.bgGradient?.colors && {
                background: `linear-gradient(${formData.bgGradient.angle || 135}deg, ${formData.bgGradient.colors[0]?.color || "#4338ca"} ${formData.bgGradient.colors[0]?.position || 0}%, ${formData.bgGradient.colors[1]?.color || "#6366f1"} ${formData.bgGradient.colors[1]?.position || 100}%)`,
              }),
              ...(formData.bgType === "pattern" && { backgroundColor: formData.bgColor || "#0f172a" }),
              ...(formData.bgType === "image" && formData.bgImage && {
                backgroundImage: `linear-gradient(${formData.bgImageOverlay || "rgba(0,0,0,0.5)"}, ${formData.bgImageOverlay || "rgba(0,0,0,0.5)"}), url(${formData.bgImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }),
              color: formData.textColor || undefined,
              // CSS custom properties for dynamic hover effects
              "--link-color": formData.linkColor || "#64748b",
              "--link-hover-color": formData.linkHoverColor || "#F97316",
              "--heading-color": formData.headingColor || "#1e293b",
              "--accent-color": formData.accentColor || "#F97316",
              "--divider-color": formData.dividerColor || "#1e293b",
            } as React.CSSProperties}
          >
            {/* Dynamic styles for preview hover effects */}
            <style>{`
              .footer-preview .preview-link {
                color: var(--link-color);
                transition: color 0.2s;
              }
              .footer-preview .preview-link:hover {
                color: var(--link-hover-color);
              }
              .footer-preview .preview-heading {
                color: var(--heading-color);
              }
            `}</style>
            {/* Pattern Overlay for Preview */}
            {formData.bgType === "pattern" && formData.bgPattern && (() => {
              const color = formData.bgPatternColor || "#000";
              const patterns: Record<string, string> = {
                dots: `radial-gradient(circle, ${color} 1px, transparent 1px)`,
                grid: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
                diagonal: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${color} 10px, ${color} 11px)`,
                waves: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 20'%3E%3Cpath d='M0 10 Q 12.5 0, 25 10 T 50 10 T 75 10 T 100 10' fill='none' stroke='${encodeURIComponent(color)}' stroke-width='1'/%3E%3C/svg%3E")`,
                noise: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
              };
              const patternSizes: Record<string, string> = {
                dots: "20px 20px",
                grid: "20px 20px, 20px 20px",
                diagonal: "auto",
                waves: "100px 20px",
                noise: "200px 200px",
              };
              return (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: patterns[formData.bgPattern] || patterns.dots,
                    backgroundSize: patternSizes[formData.bgPattern] || "20px 20px",
                    opacity: (formData.bgPatternOpacity || 10) / 100,
                  }}
                />
              );
            })()}
            {/* Footer Preview Content */}
            <div
              className="px-4 relative z-10"
              style={{
                paddingTop: `${formData.paddingTop}px`,
                paddingBottom: `${formData.paddingBottom}px`,
              }}
            >
              {/* MULTI_COLUMN Layout */}
              {formData.layout === "MULTI_COLUMN" && (
                <div>
                  <div
                    className={cn(
                      "grid gap-4",
                      previewMode === "mobile" ? "grid-cols-2" : ""
                    )}
                    style={previewMode === "desktop" ? { gridTemplateColumns: `repeat(${formData.columns}, 1fr)` } : undefined}
                  >
                    {Array.from({ length: formData.columns }, (_, i) => i + 1).map((column) => {
                      const widgets = getWidgetsByColumn(column);
                      return (
                        <div key={column} className="space-y-2">
                          {widgets.length === 0 ? (
                            <div className="rounded border border-dashed border-gray-300 p-3 text-center">
                              <span className="text-xs text-muted-foreground">{t("admin.footer.columnLabel", { num: String(column) })}</span>
                            </div>
                          ) : (
                            widgets.map((widget) => (
                              <div key={widget.id} className="space-y-1">
                                {widget.showTitle && widget.title && (
                                  <h4 className="text-xs font-semibold preview-heading">{widget.title}</h4>
                                )}
                                <div className="text-xs">
                                  {widget.type === "BRAND" && (() => {
                                    const brandContent = widget.content as { tagline?: string; showContact?: boolean; logoMode?: "auto" | "light" | "dark" } | null;
                                    const showContact = brandContent?.showContact !== false;
                                    const logoMode = brandContent?.logoMode || "auto";
                                    return (
                                      <div className="space-y-1.5">
                                        <LogoPreview size="md" logoMode={logoMode} />
                                        <span className="font-semibold preview-heading block">{businessConfig.name}</span>
                                        {brandContent?.tagline && (
                                          <p className="text-[10px] opacity-70 max-w-[140px] leading-tight">
                                            {brandContent.tagline}
                                          </p>
                                        )}
                                        {showContact && businessConfig.contact.supportEmail && (
                                          <div className="flex items-center gap-1 text-[10px] preview-link mt-1">
                                            <Mail className="h-2.5 w-2.5" />
                                            {businessConfig.contact.supportEmail}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })()}
                                  {widget.type === "LINKS" && (
                                    <ul className="space-y-0.5">
                                      {widget.menuItems && widget.menuItems.length > 0 ? (
                                        widget.menuItems.slice(0, 4).map((item, idx) => (
                                          <li key={idx} className="preview-link cursor-pointer">{item.label}</li>
                                        ))
                                      ) : (
                                        <>
                                          <li className="preview-link cursor-pointer">Link 1</li>
                                          <li className="preview-link cursor-pointer">Link 2</li>
                                          <li className="preview-link cursor-pointer">Link 3</li>
                                        </>
                                      )}
                                    </ul>
                                  )}
                                  {widget.type === "CONTACT" && (
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-1 preview-link"><Mail className="h-3 w-3" /> email@example.com</div>
                                      <div className="flex items-center gap-1 preview-link"><Phone className="h-3 w-3" /> +1 234 567 890</div>
                                    </div>
                                  )}
                                  {widget.type === "SOCIAL" && <SocialIconsPreview size="sm" />}
                                  {widget.type === "TEXT" && <p>{t("admin.footer.previewCustomText")}</p>}
                                  {widget.type === "SERVICES" && <span className="italic">{t("admin.footer.widgetServices")}</span>}
                                  {widget.type === "STATES" && <span className="italic">{t("admin.footer.widgetStates")}</span>}
                                  {widget.type === "RECENT_POSTS" && <span className="italic">{t("admin.footer.widgetRecentPosts")}</span>}
                                  {widget.type === "CUSTOM_HTML" && <span className="italic">{t("admin.footer.widgetCustomHtml")}</span>}
                                  {widget.type === "BUTTON" && (
                                    <div className="mt-1">
                                      <FooterButtonPreview style={(widget.content as { style?: ButtonCustomStyle })?.style || {}} />
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CENTERED Layout */}
              {formData.layout === "CENTERED" && (
                <div className="text-center">
                  {/* All widgets merged from all columns */}
                  <div className="flex flex-col items-center space-y-6">
                    {(() => {
                      // Merge all widgets from all columns, sorted by column then sortOrder
                      const allWidgets = Array.from({ length: formData.columns }, (_, i) => i + 1)
                        .flatMap(col => getWidgetsByColumn(col));

                      if (allWidgets.length === 0) {
                        return (
                          <div className="rounded border border-dashed border-gray-300 p-6">
                            <span className="text-xs text-muted-foreground">{t("admin.footer.noWidgetsConfigured")}</span>
                          </div>
                        );
                      }

                      return allWidgets.map((widget) => (
                        <div key={widget.id} className="w-full max-w-md space-y-1">
                          {widget.showTitle && widget.title && (
                            <h4 className="text-xs font-semibold preview-heading">{widget.title}</h4>
                          )}
                          <div className="text-xs">
                            {widget.type === "BRAND" && (() => {
                              const brandContent = widget.content as { tagline?: string; subtitle?: string; showContact?: boolean; logoMode?: "auto" | "light" | "dark" } | null;
                              const showContact = brandContent?.showContact !== false;
                              const logoMode = brandContent?.logoMode || "auto";
                              return (
                                <div className="flex flex-col items-center gap-2">
                                  <LogoPreview size="lg" logoMode={logoMode} />
                                  <span className="font-semibold preview-heading">{businessConfig.name}</span>
                                  <p className="max-w-xs text-center" style={{ color: "var(--link-color)" }}>
                                    {brandContent?.tagline || "Your all-in-one wedding planning platform."}
                                  </p>
                                  {brandContent?.subtitle && (
                                    <p className="max-w-md text-[10px] opacity-60 text-center">
                                      {brandContent.subtitle}
                                    </p>
                                  )}
                                  {showContact && businessConfig.contact.supportEmail && (
                                    <div className="flex items-center gap-1 text-[10px] preview-link">
                                      <Mail className="h-2.5 w-2.5" />
                                      {businessConfig.contact.supportEmail}
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                            {widget.type === "LINKS" && (
                              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
                                {widget.menuItems && widget.menuItems.length > 0 ? (
                                  widget.menuItems.map((item, idx) => (
                                    <span key={idx} className="preview-link cursor-pointer">{item.label}</span>
                                  ))
                                ) : (
                                  <>
                                    <span className="preview-link cursor-pointer">Link 1</span>
                                    <span className="preview-link cursor-pointer">Link 2</span>
                                    <span className="preview-link cursor-pointer">Link 3</span>
                                  </>
                                )}
                              </div>
                            )}
                            {widget.type === "CONTACT" && (
                              <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-1 preview-link"><Mail className="h-3 w-3" /> email@example.com</div>
                                <div className="flex items-center gap-1 preview-link"><Phone className="h-3 w-3" /> +1 234 567 890</div>
                              </div>
                            )}
                            {widget.type === "SOCIAL" && (
                              <div className="flex justify-center">
                                <SocialIconsPreview size="md" />
                              </div>
                            )}
                            {widget.type === "TEXT" && <p>{t("admin.footer.previewCustomText")}</p>}
                            {widget.type === "SERVICES" && <span className="italic">{t("admin.footer.widgetServices")}</span>}
                            {widget.type === "STATES" && <span className="italic">{t("admin.footer.widgetStates")}</span>}
                            {widget.type === "RECENT_POSTS" && <span className="italic">{t("admin.footer.widgetRecentPosts")}</span>}
                            {widget.type === "CUSTOM_HTML" && <span className="italic">{t("admin.footer.widgetCustomHtml")}</span>}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}

              {/* MINIMAL Layout */}
              {formData.layout === "MINIMAL" && (
                <div className={cn(
                  "flex items-center justify-between gap-4",
                  previewMode === "mobile" ? "flex-col text-center" : ""
                )}>
                  <div className="flex items-center gap-2">
                    <LogoPreview size="xs" />
                    <span className="text-sm font-semibold preview-heading">{businessConfig.name}</span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 text-xs">
                    {formData.bottomLinks.length > 0 ? (
                      formData.bottomLinks.slice(0, 4).map((link, idx) => (
                        <span key={idx} className="preview-link cursor-pointer">{link.label}</span>
                      ))
                    ) : (
                      <>
                        <span className="preview-link cursor-pointer">{t("admin.footer.previewPrivacy")}</span>
                        <span className="preview-link cursor-pointer">{t("admin.footer.previewTerms")}</span>
                        <span className="preview-link cursor-pointer">{t("admin.footer.previewContact")}</span>
                      </>
                    )}
                  </div>
                  {formData.showSocialLinks && <SocialIconsPreview size="sm" />}
                </div>
              )}

              {/* MEGA Layout */}
              {formData.layout === "MEGA" && (
                <div>
                  {/* Top section */}
                  <div className={cn(
                    "flex items-center justify-between gap-4 border-b pb-4",
                    previewMode === "mobile" ? "flex-col" : ""
                  )}>
                    <div className="flex items-center gap-2">
                      <LogoPreview size="md" />
                      <div>
                        <span className="font-semibold">{businessConfig.name}</span>
                        <p className="text-xs text-muted-foreground">{businessConfig.tagline}</p>
                      </div>
                    </div>
                    {formData.showSocialLinks && <SocialIconsPreview size="md" />}
                  </div>
                  {/* Mega grid */}
                  <div
                    className={cn(
                      "mt-4 grid gap-4",
                      previewMode === "mobile" && "grid-cols-2"
                    )}
                    style={previewMode === "desktop" ? { gridTemplateColumns: `repeat(${formData.columns}, 1fr)` } : undefined}
                  >
                    {Array.from({ length: formData.columns }, (_, i) => i + 1).map((column) => {
                      const widgets = getWidgetsByColumn(column);
                      return (
                        <div key={column}>
                          {widgets.length === 0 ? (
                            <div className="text-xs text-muted-foreground">{t("admin.footer.colLabel", { num: String(column) })}</div>
                          ) : (
                            widgets.map((widget) => (
                              <div key={widget.id}>
                                {widget.showTitle && widget.title && (
                                  <h4 className="text-xs font-semibold uppercase tracking-wider">{widget.title}</h4>
                                )}
                                <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                                  {widget.menuItems?.slice(0, 4).map((item, idx) => (
                                    <li key={idx}>{item.label}</li>
                                  )) || (
                                    <>
                                      <li>Item 1</li>
                                      <li>Item 2</li>
                                    </>
                                  )}
                                </ul>
                              </div>
                            ))
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STACKED Layout */}
              {formData.layout === "STACKED" && (
                <div className="space-y-6">
                  {/* Brand Section */}
                  <div className="text-center py-4 border-b" style={{ borderColor: formData.borderColor || undefined }}>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <LogoPreview size="md" />
                      <span className="font-semibold">{businessConfig.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">Your all-in-one wedding planning platform</p>
                  </div>
                  {/* Widget Grid */}
                  <div
                    className={cn("grid gap-4", previewMode === "mobile" ? "grid-cols-2" : "")}
                    style={previewMode === "desktop" ? { gridTemplateColumns: `repeat(${formData.columns}, 1fr)` } : undefined}
                  >
                    {Array.from({ length: formData.columns }, (_, i) => i + 1).map((column) => {
                      const widgets = getWidgetsByColumn(column);
                      return (
                        <div key={column} className="space-y-2">
                          {widgets.length === 0 ? (
                            <div className="rounded border border-dashed border-gray-300 p-3 text-center">
                              <span className="text-xs text-muted-foreground">{t("admin.footer.columnLabel", { num: String(column) })}</span>
                            </div>
                          ) : (
                            widgets.map((widget) => (
                              <div key={widget.id} className="space-y-1">
                                {widget.showTitle && widget.title && (
                                  <h4 className="text-xs font-semibold" style={{ color: formData.headingColor || undefined }}>{widget.title}</h4>
                                )}
                                <div className="text-xs text-muted-foreground">
                                  {widget.type === "LINKS" && (
                                    <ul className="space-y-0.5">
                                      {widget.menuItems?.slice(0, 4).map((item, idx) => (
                                        <li key={idx} className="preview-link cursor-pointer">{item.label}</li>
                                      )) || <li className="preview-link">Link 1</li>}
                                    </ul>
                                  )}
                                  {widget.type === "SOCIAL" && <SocialIconsPreview size="sm" />}
                                  {widget.type === "BUTTON" && (
                                    <div className="mt-1">
                                      <FooterButtonPreview style={(widget.content as { style?: ButtonCustomStyle })?.style || {}} />
                                    </div>
                                  )}
                                  {widget.type === "NEWSLETTER" && (
                                    <div className="mt-2 space-y-1">
                                      <p className="text-xs opacity-60">{(widget.content as { text?: string })?.text || "Get LLC tips & US business insights"}</p>
                                      <div className="flex gap-1">
                                        <div className="h-6 flex-1 rounded border border-white/20 bg-white/5 px-2 text-xs leading-6 opacity-40">{(widget.content as { placeholder?: string })?.placeholder || "your@email.com"}</div>
                                        <div className="h-6 rounded bg-orange-500 px-2 text-xs font-medium leading-6 text-white">{(widget.content as { buttonText?: string })?.buttonText || "Subscribe"}</div>
                                      </div>
                                    </div>
                                  )}
                                  {widget.type !== "LINKS" && widget.type !== "SOCIAL" && widget.type !== "BRAND" && widget.type !== "BUTTON" && widget.type !== "NEWSLETTER" && <span className="italic">{widget.type}</span>}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* APP_FOCUSED Layout */}
              {formData.layout === "APP_FOCUSED" && (
                <div className="space-y-6">
                  <div className={cn("flex gap-8", previewMode === "mobile" ? "flex-col" : "")}>
                    {/* Left: App promo */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-2">
                        <LogoPreview size="lg" />
                        <span className="text-lg font-bold">{businessConfig.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{t("admin.footer.previewBusinessJourney")}</p>
                      <div className="flex gap-2">
                        <div className="h-8 px-3 rounded bg-black text-white text-xs flex items-center gap-1">{t("admin.footer.previewAppStore")}</div>
                        <div className="h-8 px-3 rounded bg-black text-white text-xs flex items-center gap-1">{t("admin.footer.previewPlayStore")}</div>
                      </div>
                    </div>
                    {/* Right: Links */}
                    <div className={cn("grid gap-6", previewMode === "mobile" ? "grid-cols-2" : `grid-cols-${Math.min(formData.columns - 1, 3)}`)}>
                      {Array.from({ length: Math.min(formData.columns - 1, 3) }, (_, i) => i + 2).map((column) => {
                        const widgets = getWidgetsByColumn(column);
                        return (
                          <div key={column} className="space-y-2">
                            {widgets.map((widget) => (
                              <div key={widget.id}>
                                {widget.showTitle && widget.title && <h4 className="text-xs font-semibold mb-1" style={{ color: formData.headingColor || undefined }}>{widget.title}</h4>}
                                {widget.type === "LINKS" && (
                                  <ul className="space-y-0.5 text-xs text-muted-foreground">
                                    {widget.menuItems?.slice(0, 4).map((item, idx) => (
                                      <li key={idx} className="hover:text-foreground cursor-pointer">{item.label}</li>
                                    )) || <li>Link</li>}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ASYMMETRIC Layout */}
              {formData.layout === "ASYMMETRIC" && (
                <div className={cn("flex gap-8", previewMode === "mobile" ? "flex-col" : "")}>
                  {/* Large left section (2/3) */}
                  <div className={cn(previewMode === "desktop" ? "w-2/3" : "w-full", "space-y-4")}>
                    <div className="flex items-center gap-3">
                      <LogoPreview size="xl" />
                      <div>
                        <span className="font-bold text-lg">{businessConfig.name}</span>
                        <p className="text-xs text-muted-foreground">{businessConfig.tagline}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{t("admin.footer.previewWeddingTagline")}</p>
                    {formData.showSocialLinks && <SocialIconsPreview size="lg" />}
                  </div>
                  {/* Right section (1/3) - Links */}
                  <div className={cn(previewMode === "desktop" ? "w-1/3" : "w-full", "grid gap-4", previewMode === "mobile" ? "grid-cols-2" : "grid-cols-1")}>
                    {Array.from({ length: formData.columns }, (_, i) => i + 1).map((column) => {
                      const widgets = getWidgetsByColumn(column).filter(w => w.type === "LINKS");
                      return widgets.map((widget) => (
                        <div key={widget.id}>
                          {widget.showTitle && widget.title && <h4 className="text-xs font-semibold mb-2" style={{ color: formData.headingColor || undefined }}>{widget.title}</h4>}
                          <ul className="space-y-1 text-xs text-muted-foreground">
                            {widget.menuItems?.slice(0, 5).map((item, idx) => (
                              <li key={idx} className="hover:text-foreground cursor-pointer">{item.label}</li>
                            )) || <li>Link</li>}
                          </ul>
                        </div>
                      ));
                    })}
                  </div>
                </div>
              )}

              {/* MEGA_PLUS Layout */}
              {formData.layout === "MEGA_PLUS" && (
                <div className="space-y-6">
                  {/* Featured CTA Banner */}
                  <div className="rounded-lg p-4 text-center" style={{ backgroundColor: formData.accentColor || "#3b82f6", color: "#fff" }}>
                    <p className="font-semibold">{t("admin.footer.previewCtaTitle")}</p>
                    <p className="text-xs opacity-90">{t("admin.footer.previewCtaSubtitle")}</p>
                  </div>
                  {/* Widget Grid */}
                  <div
                    className={cn("grid gap-4", previewMode === "mobile" ? "grid-cols-2" : "")}
                    style={previewMode === "desktop" ? { gridTemplateColumns: `repeat(${formData.columns}, 1fr)` } : undefined}
                  >
                    {Array.from({ length: formData.columns }, (_, i) => i + 1).map((column) => {
                      const widgets = getWidgetsByColumn(column);
                      return (
                        <div key={column} className="space-y-2">
                          {widgets.length === 0 ? (
                            <div className="text-xs text-muted-foreground">{t("admin.footer.colLabel", { num: String(column) })}</div>
                          ) : (
                            widgets.map((widget) => (
                              <div key={widget.id}>
                                {widget.showTitle && widget.title && <h4 className="text-xs font-semibold preview-heading">{widget.title}</h4>}
                                {widget.type === "BRAND" && (() => {
                                  const brandContent = widget.content as { logoMode?: "auto" | "light" | "dark" } | null;
                                  return <div className="space-y-1"><LogoPreview size="sm" logoMode={brandContent?.logoMode || "auto"} /><span className="font-semibold text-sm preview-heading block">{businessConfig.name}</span></div>;
                                })()}
                                {widget.type === "LINKS" && <ul className="space-y-0.5 text-xs">{widget.menuItems?.slice(0,4).map((item,i) => <li key={i} className="preview-link cursor-pointer">{item.label}</li>) || <li className="preview-link">Link</li>}</ul>}
                                {widget.type === "SOCIAL" && <SocialIconsPreview size="sm" />}
                                {widget.type === "BUTTON" && (
                                  <div className="mt-1">
                                    <FooterButtonPreview style={(widget.content as { style?: ButtonCustomStyle })?.style || {}} />
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bottom Bar (all layouts) */}
              {formData.bottomBarEnabled && (
                <div className={cn(
                  "mt-4 border-t pt-4",
                  formData.layout === "CENTERED" ? "text-center" : ""
                )}
                  style={{ borderColor: "var(--divider-color)" }}
                >
                  <div className={cn(
                    "flex items-center justify-between gap-2 text-xs",
                    formData.layout === "CENTERED" || previewMode === "mobile" ? "flex-col" : ""
                  )}
                    style={{ color: formData.textColor || undefined }}
                  >
                    <p>{formData.copyrightText || `© ${new Date().getFullYear()} ${businessConfig.name}. All rights reserved.`}</p>
                    {formData.showDisclaimer && (
                      <p className="max-w-md text-[10px]">
                        <strong>Disclaimer:</strong> {formData.disclaimerText || `${businessConfig.name} is not a law firm and does not provide legal advice.`}
                      </p>
                    )}
                  </div>
                  {formData.bottomLinks.length > 0 && (
                    <div className={cn(
                      "mt-2 flex flex-wrap gap-2 text-xs",
                      formData.layout === "CENTERED" ? "justify-center" : ""
                    )}>
                      {formData.bottomLinks.map((link, idx) => (
                        <span key={idx} className="preview-link cursor-pointer">{link.label}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs defaultValue="layout" className="space-y-4">
        <TabsList>
          <TabsTrigger value="layout">{t("admin.footer.tabLayout")}</TabsTrigger>
          <TabsTrigger value="bottombar">{t("admin.footer.tabBottomBar")}</TabsTrigger>
          <TabsTrigger value="style">{t("admin.footer.tabStyling")}</TabsTrigger>
        </TabsList>

        {/* Layout & Widgets Tab */}
        <TabsContent value="layout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.footer.layoutTitle")}</CardTitle>
              <CardDescription>{t("admin.footer.layoutDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Layout Options */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {layoutOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, layout: option.value })}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors hover:border-primary/50",
                      formData.layout === option.value
                        ? "border-primary bg-primary/5"
                        : "border-muted"
                    )}
                  >
                    <div className="flex h-12 w-full items-center justify-center rounded bg-muted">
                      <span className="text-xs font-medium">{t(option.labelKey)}</span>
                    </div>
                    <span className="text-xs text-muted-foreground text-center">{t(option.descriptionKey)}</span>
                  </button>
                ))}
              </div>

              <Separator />

              {/* Columns */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className={formData.layout === 'CENTERED' || formData.layout === 'MINIMAL' ? 'text-muted-foreground' : ''}>
                    {t("admin.footer.numberOfColumns")}
                  </Label>
                  <span className="text-sm text-muted-foreground">{t("admin.footer.columnsCount", { count: String(formData.columns) })}</span>
                </div>
                <Slider
                  value={[formData.columns]}
                  onValueChange={(value) => setFormData({ ...formData, columns: value[0] })}
                  min={2}
                  max={6}
                  step={1}
                  disabled={formData.layout === 'CENTERED' || formData.layout === 'MINIMAL'}
                />
                {(formData.layout === 'CENTERED' || formData.layout === 'MINIMAL') && (
                  <p className="text-xs text-muted-foreground italic">
                    {t("admin.footer.notApplicableLayout", { layout: formData.layout.toLowerCase() })}
                  </p>
                )}
              </div>

            </CardContent>
          </Card>

          {/* Widget Areas - Same page as layout */}
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.footer.widgetAreas")}</CardTitle>
              <CardDescription>
                {t("admin.footer.widgetAreasDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Warning for orphan widgets - only relevant for MULTI_COLUMN and MEGA layouts */}
              {getOrphanWidgets().length > 0 && (formData.layout === 'MULTI_COLUMN' || formData.layout === 'MEGA') && (
                <div className="rounded-lg border border-yellow-500/50 bg-yellow-50 p-4 dark:bg-yellow-900/20">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    ⚠️ {t("admin.footer.orphanWarning", { count: String(getOrphanWidgets().length), columns: String(formData.columns) })}
                  </p>
                  <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
                    {t("admin.footer.orphanHint")}
                  </p>
                </div>
              )}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
              >
                <div className="overflow-x-auto pb-2">
                  <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${formData.columns}, minmax(200px, 1fr))` }}>
                    {Array.from({ length: formData.columns }, (_, i) => i + 1).map((column) => (
                      <DroppableColumn
                        key={column}
                        column={column}
                        widgets={getWidgetsByColumn(column)}
                        isOver={overColumn === column}
                        onAddWidget={openWidgetDialog}
                        onEditWidget={openEditWidgetDialog}
                        onDeleteWidget={openDeleteWidgetDialog}
                      />
                    ))}
                  </div>
                </div>
                <DragOverlay>
                  {activeWidget ? (() => {
                    const aw = activeWidget;
                    const wt = widgetTypes.find((wtItem) => wtItem.value === aw.type);
                    return (
                      <div className="flex items-center gap-2 rounded-lg border bg-card p-3 shadow-lg ring-2 ring-primary">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {wt?.icon}
                            <span className="text-sm font-medium truncate">
                              {aw.title || (wt ? t(wt.labelKey) : "")}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {aw.type}
                          </span>
                        </div>
                      </div>
                    );
                  })() : null}
                </DragOverlay>
              </DndContext>
            </CardContent>
          </Card>

          {/* Presets Section - Quick Start Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {t("admin.footer.quickStart")}
              </CardTitle>
              <CardDescription>
                {t("admin.footer.quickStartDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {formData.id ? (
                <PresetGallery
                  footerId={formData.id}
                  onPresetApplied={fetchFooter}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {t("admin.footer.saveFirstForPresets")}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Import/Export & Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                {t("admin.footer.importExport")}
              </CardTitle>
              <CardDescription>{t("admin.footer.importExportDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Export */}
                <div className="space-y-3">
                  <h4 className="font-medium">{t("admin.footer.exportConfig")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.footer.exportConfigDesc")}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={!footer}
                    onClick={() => {
                      if (!footer) return;
                      const exportData = {
                        ...formData,
                        widgets: footer.widgets?.map(w => ({
                          type: w.type,
                          title: w.title,
                          showTitle: w.showTitle,
                          column: w.column,
                          sortOrder: w.sortOrder,
                          content: w.content,
                        })),
                        exportedAt: new Date().toISOString(),
                        version: "1.0",
                      };
                      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `footer-config-${new Date().toISOString().split("T")[0]}.json`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      toast.success(t("admin.footer.exportSuccess"));
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {t("admin.footer.exportConfig")}
                  </Button>
                </div>

                {/* Import */}
                <div className="space-y-3">
                  <h4 className="font-medium">{t("admin.footer.importConfig")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.footer.importConfigDesc")}
                  </p>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".json"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const text = await file.text();
                          const importData = JSON.parse(text);
                          if (!importData.layout || !importData.version) {
                            throw new Error("Invalid configuration file");
                          }
                          setFormData(prev => ({
                            ...prev,
                            ...importData,
                            id: prev.id,
                          }));
                          toast.success(t("admin.footer.importSuccess"));
                        } catch (error) {
                          console.error("Import error:", error);
                          toast.error(t("admin.footer.importFailed"));
                        }
                        e.target.value = "";
                      }}
                    />
                    <Button variant="outline" className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      {t("admin.footer.importConfig")}
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Seed Presets Button */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{t("admin.footer.seedPresets")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.footer.seedPresetsDesc")}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/admin/footer/presets/seed", { method: "POST" });
                      if (!res.ok) throw new Error("Failed to seed presets");
                      const data = await res.json();
                      toast.success(data.message);
                    } catch (error) {
                      console.error("Seed error:", error);
                      toast.error(t("admin.footer.seedFailed"));
                    }
                  }}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t("admin.footer.seedPresetsButton")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bottom Bar Tab */}
        <TabsContent value="bottombar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.footer.bottomBarTitle")}</CardTitle>
              <CardDescription>{t("admin.footer.bottomBarDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label className="text-base">{t("admin.footer.enableBottomBar")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.footer.enableBottomBarDesc")}
                  </p>
                </div>
                <Switch
                  checked={formData.bottomBarEnabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, bottomBarEnabled: checked })}
                />
              </div>

              {formData.bottomBarEnabled && (
                <>
                  <LocalizedInput
                    id="copyrightText"
                    label={t("admin.footer.copyrightText")}
                    placeholder={t("admin.footer.copyrightPlaceholder")}
                    value={{ en: formData.copyrightText, ...(formData.translations?.copyrightText || {}) }}
                    onChange={(next) => setFormData({
                      ...formData,
                      copyrightText: next.en ?? "",
                      translations: { ...formData.translations, copyrightText: next as Record<string, string> },
                    })}
                  />

                  {formData.showDisclaimer && (
                    <LocalizedInput
                      id="disclaimerText"
                      textarea
                      rows={3}
                      label={t("admin.footer.disclaimerText")}
                      placeholder={t("admin.footer.disclaimerPlaceholder")}
                      value={{ en: formData.disclaimerText, ...(formData.translations?.disclaimerText || {}) }}
                      onChange={(next) => setFormData({
                        ...formData,
                        disclaimerText: next.en ?? "",
                        translations: { ...formData.translations, disclaimerText: next as Record<string, string> },
                      })}
                    />
                  )}

                  <Separator />

                  {/* Bottom Links */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>{t("admin.footer.bottomLinks")}</Label>
                      <Button variant="outline" size="sm" onClick={addBottomLink}>
                        <Plus className="mr-1 h-4 w-4" />
                        {t("admin.footer.addLink")}
                      </Button>
                    </div>
                    {formData.bottomLinks.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{t("admin.footer.noBottomLinks")}</p>
                    ) : (
                      <div className="space-y-2">
                        {formData.bottomLinks.map((link, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="flex-1">
                              <LocalizedInput
                                value={{ en: link.label, ...(link.translations?.label || {}) }}
                                placeholder={t("admin.footer.linkLabel")}
                                onChange={(next) => updateBottomLink(index, {
                                  label: next.en ?? "",
                                  translations: { ...link.translations, label: next as Record<string, string> },
                                })}
                              />
                            </div>
                            <Input
                              value={link.url}
                              onChange={(e) => updateBottomLink(index, { url: e.target.value })}
                              placeholder={t("admin.footer.urlPlaceholder")}
                              className="mt-7 flex-1"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="mt-7 text-destructive"
                              onClick={() => removeBottomLink(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Trust Badges Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t("admin.footer.trustBadges")}
              </CardTitle>
              <CardDescription>{t("admin.footer.trustBadgesDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label className="text-base">{t("admin.footer.showTrustBadges")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.footer.showTrustBadgesDesc")}
                  </p>
                </div>
                <Switch
                  checked={formData.showTrustBadges}
                  onCheckedChange={(checked) => setFormData({ ...formData, showTrustBadges: checked })}
                />
              </div>

              {formData.showTrustBadges && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>{t("admin.footer.trustBadges")}</Label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => addTrustBadge("pill")}>
                        <Plus className="mr-1 h-4 w-4" />
                        {t("admin.footer.pillBadge")}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addTrustBadge("image")}>
                        <Plus className="mr-1 h-4 w-4" />
                        {t("admin.footer.imageBadge")}
                      </Button>
                    </div>
                  </div>
                  {formData.trustBadges.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed p-8 text-center">
                      <Shield className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">{t("admin.footer.noTrustBadges")}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t("admin.footer.trustBadgesHint")}</p>
                      <Button variant="outline" size="sm" className="mt-4" onClick={() => addTrustBadge("pill")}>
                        <Plus className="mr-1 h-4 w-4" />
                        {t("admin.footer.addPillBadge")}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.trustBadges.map((badge, index) => (
                        <div key={index} className="rounded-lg border p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Select
                                value={badge.style || "image"}
                                onValueChange={(v) => updateTrustBadge(index, { style: v as "image" | "pill" })}
                              >
                                <SelectTrigger className="w-28 h-7 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pill">{t("admin.footer.pill")}</SelectItem>
                                  <SelectItem value="image">{t("admin.footer.image")}</SelectItem>
                                </SelectContent>
                              </Select>
                              <span className="text-xs text-muted-foreground">{t("admin.footer.badgeNum", { num: String(index + 1) })}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={() => removeTrustBadge(index)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>

                          {(badge.style || "image") === "pill" ? (
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <Label className="text-xs">{t("admin.footer.labelText")}</Label>
                                <Input
                                  value={badge.text || ""}
                                  onChange={(e) => updateTrustBadge(index, { text: e.target.value })}
                                  placeholder={t("admin.footer.labelTextPlaceholder")}
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">{t("admin.footer.icon")}</Label>
                                <Select
                                  value={badge.iconName || "shield"}
                                  onValueChange={(v) => updateTrustBadge(index, { iconName: v })}
                                >
                                  <SelectTrigger className="h-8 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="shield">{t("admin.footer.iconShield")}</SelectItem>
                                    <SelectItem value="star">{t("admin.footer.iconStar")}</SelectItem>
                                    <SelectItem value="zap">{t("admin.footer.iconZap")}</SelectItem>
                                    <SelectItem value="award">{t("admin.footer.iconAward")}</SelectItem>
                                    <SelectItem value="check-circle">{t("admin.footer.iconCheckCircle")}</SelectItem>
                                    <SelectItem value="lock">{t("admin.footer.iconLock")}</SelectItem>
                                    <SelectItem value="trophy">{t("admin.footer.iconTrophy")}</SelectItem>
                                    <SelectItem value="heart">{t("admin.footer.iconHeart")}</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="col-span-2 space-y-1">
                                <Label className="text-xs">{t("admin.footer.linkUrlOptional")}</Label>
                                <Input
                                  value={badge.url || ""}
                                  onChange={(e) => updateTrustBadge(index, { url: e.target.value })}
                                  placeholder="https://..."
                                  className="h-8 text-sm"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Input
                                value={badge.image}
                                onChange={(e) => updateTrustBadge(index, { image: e.target.value })}
                                placeholder={t("admin.footer.imageUrlPlaceholder")}
                                className="h-8 text-sm"
                              />
                              <div className="flex gap-2">
                                <Input
                                  value={badge.alt}
                                  onChange={(e) => updateTrustBadge(index, { alt: e.target.value })}
                                  placeholder={t("admin.footer.altText")}
                                  className="flex-1 h-8 text-sm"
                                />
                                <Input
                                  value={badge.url || ""}
                                  onChange={(e) => updateTrustBadge(index, { url: e.target.value })}
                                  placeholder={t("admin.footer.linkUrlOptionalPlaceholder")}
                                  className="flex-1 h-8 text-sm"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Styling Tab */}
        <TabsContent value="style" className="space-y-4">
          {/* Background Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                {t("admin.footer.background")}
              </CardTitle>
              <CardDescription>{t("admin.footer.backgroundDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Background Type */}
              <div className="space-y-2">
                <Label>{t("admin.footer.backgroundType")}</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: "solid", labelKey: "admin.footer.bgSolid" },
                    { value: "gradient", labelKey: "admin.footer.bgGradient" },
                    { value: "pattern", labelKey: "admin.footer.bgPattern" },
                    { value: "image", labelKey: "admin.footer.bgImage" },
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, bgType: type.value })}
                      className={cn(
                        "rounded-lg border-2 p-3 text-sm font-medium transition-colors",
                        formData.bgType === type.value
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-primary/50"
                      )}
                    >
                      {t(type.labelKey)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Solid Color */}
              {formData.bgType === "solid" && (
                <div className="space-y-2">
                  <Label htmlFor="bgColor">{t("admin.footer.backgroundColor")}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bgColor"
                      type="color"
                      value={formData.bgColor || "#f9fafb"}
                      onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                      className="h-10 w-14 cursor-pointer p-1"
                    />
                    <Input
                      value={formData.bgColor}
                      onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                      placeholder="#f9fafb"
                      className="flex-1"
                    />
                  </div>
                </div>
              )}

              {/* Gradient */}
              {formData.bgType === "gradient" && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>{t("admin.footer.gradientStart")}</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.bgGradient?.colors?.[0]?.color || "#4338ca"}
                          onChange={(e) => setFormData({
                            ...formData,
                            bgGradient: {
                              type: "linear",
                              angle: formData.bgGradient?.angle || 135,
                              colors: [
                                { color: e.target.value, position: 0 },
                                { color: formData.bgGradient?.colors?.[1]?.color || "#6366f1", position: 100 },
                              ],
                            },
                          })}
                          className="h-10 w-14 cursor-pointer p-1"
                        />
                        <Input
                          value={formData.bgGradient?.colors?.[0]?.color || "#4338ca"}
                          onChange={(e) => setFormData({
                            ...formData,
                            bgGradient: {
                              type: "linear",
                              angle: formData.bgGradient?.angle || 135,
                              colors: [
                                { color: e.target.value, position: 0 },
                                { color: formData.bgGradient?.colors?.[1]?.color || "#6366f1", position: 100 },
                              ],
                            },
                          })}
                          placeholder="#4338ca"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("admin.footer.gradientEnd")}</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.bgGradient?.colors?.[1]?.color || "#6366f1"}
                          onChange={(e) => setFormData({
                            ...formData,
                            bgGradient: {
                              type: "linear",
                              angle: formData.bgGradient?.angle || 135,
                              colors: [
                                { color: formData.bgGradient?.colors?.[0]?.color || "#4338ca", position: 0 },
                                { color: e.target.value, position: 100 },
                              ],
                            },
                          })}
                          className="h-10 w-14 cursor-pointer p-1"
                        />
                        <Input
                          value={formData.bgGradient?.colors?.[1]?.color || "#6366f1"}
                          onChange={(e) => setFormData({
                            ...formData,
                            bgGradient: {
                              type: "linear",
                              angle: formData.bgGradient?.angle || 135,
                              colors: [
                                { color: formData.bgGradient?.colors?.[0]?.color || "#4338ca", position: 0 },
                                { color: e.target.value, position: 100 },
                              ],
                            },
                          })}
                          placeholder="#6366f1"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>{t("admin.footer.gradientAngle")}</Label>
                      <span className="text-sm text-muted-foreground">{formData.bgGradient?.angle || 135}°</span>
                    </div>
                    <Slider
                      value={[formData.bgGradient?.angle || 135]}
                      onValueChange={(value) => setFormData({
                        ...formData,
                        bgGradient: {
                          ...formData.bgGradient,
                          type: "linear",
                          angle: value[0],
                          colors: formData.bgGradient?.colors || [
                            { color: "#4338ca", position: 0 },
                            { color: "#6366f1", position: 100 },
                          ],
                        },
                      })}
                      min={0}
                      max={360}
                      step={15}
                    />
                  </div>
                </div>
              )}

              {/* Pattern */}
              {formData.bgType === "pattern" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t("admin.footer.patternStyle")}</Label>
                    <Select
                      value={formData.bgPattern || "dots"}
                      onValueChange={(value) => setFormData({ ...formData, bgPattern: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dots">{t("admin.footer.patternDots")}</SelectItem>
                        <SelectItem value="grid">{t("admin.footer.patternGrid")}</SelectItem>
                        <SelectItem value="diagonal">{t("admin.footer.patternDiagonal")}</SelectItem>
                        <SelectItem value="waves">{t("admin.footer.patternWaves")}</SelectItem>
                        <SelectItem value="noise">{t("admin.footer.patternNoise")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>{t("admin.footer.baseColor")}</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.bgColor || "#fef3c7"}
                          onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                          className="h-10 w-14 cursor-pointer p-1"
                        />
                        <Input
                          value={formData.bgColor || ""}
                          onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                          placeholder="#fef3c7"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("admin.footer.patternColor")}</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.bgPatternColor || "#f59e0b"}
                          onChange={(e) => setFormData({ ...formData, bgPatternColor: e.target.value })}
                          className="h-10 w-14 cursor-pointer p-1"
                        />
                        <Input
                          value={formData.bgPatternColor || ""}
                          onChange={(e) => setFormData({ ...formData, bgPatternColor: e.target.value })}
                          placeholder="#f59e0b"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>{t("admin.footer.patternOpacity")}</Label>
                      <span className="text-sm text-muted-foreground">{formData.bgPatternOpacity}%</span>
                    </div>
                    <Slider
                      value={[formData.bgPatternOpacity]}
                      onValueChange={(value) => setFormData({ ...formData, bgPatternOpacity: value[0] })}
                      min={5}
                      max={50}
                      step={5}
                    />
                  </div>
                </div>
              )}

              {/* Image Background */}
              {formData.bgType === "image" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bgImage">{t("admin.footer.bgImageUrl")}</Label>
                    <Input
                      id="bgImage"
                      value={formData.bgImage}
                      onChange={(e) => setFormData({ ...formData, bgImage: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                    <p className="text-xs text-muted-foreground">{t("admin.footer.bgImageUrlHint")}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bgImageOverlay">{t("admin.footer.overlayColor")}</Label>
                    <Input
                      id="bgImageOverlay"
                      value={formData.bgImageOverlay}
                      onChange={(e) => setFormData({ ...formData, bgImageOverlay: e.target.value })}
                      placeholder="rgba(0,0,0,0.5)"
                    />
                    <p className="text-xs text-muted-foreground">{t("admin.footer.overlayColorHint")}</p>
                  </div>
                  {formData.bgImage && (
                    <div className="space-y-2">
                      <Label>{t("admin.footer.previewLabel")}</Label>
                      <div
                        className="h-32 rounded-lg bg-cover bg-center flex items-center justify-center text-white"
                        style={{
                          backgroundImage: `linear-gradient(${formData.bgImageOverlay}, ${formData.bgImageOverlay}), url(${formData.bgImage})`,
                        }}
                      >
                        <span className="text-sm font-medium">{t("admin.footer.sampleText")}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Colors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CircleDot className="h-5 w-5" />
                {t("admin.footer.colors")}
              </CardTitle>
              <CardDescription>{t("admin.footer.colorsDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="textColor">{t("admin.footer.textColor")}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="textColor"
                      type="color"
                      value={formData.textColor || "#6b7280"}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                      className="h-10 w-14 cursor-pointer p-1"
                    />
                    <Input
                      value={formData.textColor}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                      placeholder="#6b7280"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="headingColor">{t("admin.footer.headingColor")}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="headingColor"
                      type="color"
                      value={formData.headingColor || "#111827"}
                      onChange={(e) => setFormData({ ...formData, headingColor: e.target.value })}
                      className="h-10 w-14 cursor-pointer p-1"
                    />
                    <Input
                      value={formData.headingColor}
                      onChange={(e) => setFormData({ ...formData, headingColor: e.target.value })}
                      placeholder="#111827"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkColor">{t("admin.footer.linkColor")}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="linkColor"
                      type="color"
                      value={formData.linkColor || "#374151"}
                      onChange={(e) => setFormData({ ...formData, linkColor: e.target.value })}
                      className="h-10 w-14 cursor-pointer p-1"
                    />
                    <Input
                      value={formData.linkColor}
                      onChange={(e) => setFormData({ ...formData, linkColor: e.target.value })}
                      placeholder="#374151"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkHoverColor">{t("admin.footer.linkHoverColor")}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="linkHoverColor"
                      type="color"
                      value={formData.linkHoverColor || "#F97316"}
                      onChange={(e) => setFormData({ ...formData, linkHoverColor: e.target.value })}
                      className="h-10 w-14 cursor-pointer p-1"
                    />
                    <Input
                      value={formData.linkHoverColor}
                      onChange={(e) => setFormData({ ...formData, linkHoverColor: e.target.value })}
                      placeholder="#F97316"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accentColor">{t("admin.footer.accentColor")}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={formData.accentColor || "#F97316"}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                      className="h-10 w-14 cursor-pointer p-1"
                    />
                    <Input
                      value={formData.accentColor}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                      placeholder="#F97316"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="borderColor">{t("admin.footer.borderColor")}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="borderColor"
                      type="color"
                      value={formData.borderColor || "#e5e7eb"}
                      onChange={(e) => setFormData({ ...formData, borderColor: e.target.value })}
                      className="h-10 w-14 cursor-pointer p-1"
                    />
                    <Input
                      value={formData.borderColor}
                      onChange={(e) => setFormData({ ...formData, borderColor: e.target.value })}
                      placeholder="#e5e7eb"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dividerColor">{t("admin.footer.dividerColor")}</Label>
                  <p className="text-xs text-muted-foreground">{t("admin.footer.dividerColorHint")}</p>
                  <div className="flex gap-2">
                    <Input
                      id="dividerColor"
                      type="color"
                      value={formData.dividerColor || "#1e293b"}
                      onChange={(e) => setFormData({ ...formData, dividerColor: e.target.value })}
                      className="h-10 w-14 cursor-pointer p-1"
                    />
                    <Input
                      value={formData.dividerColor}
                      onChange={(e) => setFormData({ ...formData, dividerColor: e.target.value })}
                      placeholder="#1e293b"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Typography */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                {t("admin.footer.typography")}
              </CardTitle>
              <CardDescription>{t("admin.footer.typographyDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>{t("admin.footer.headingSize")}</Label>
                  <Select
                    value={formData.headingSize}
                    onValueChange={(value) => setFormData({ ...formData, headingSize: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sm">{t("admin.footer.small")}</SelectItem>
                      <SelectItem value="base">{t("admin.footer.base")}</SelectItem>
                      <SelectItem value="lg">{t("admin.footer.large")}</SelectItem>
                      <SelectItem value="xl">{t("admin.footer.extraLarge")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("admin.footer.headingWeight")}</Label>
                  <Select
                    value={formData.headingWeight}
                    onValueChange={(value) => setFormData({ ...formData, headingWeight: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medium">{t("admin.footer.medium")}</SelectItem>
                      <SelectItem value="semibold">{t("admin.footer.semibold")}</SelectItem>
                      <SelectItem value="bold">{t("admin.footer.bold")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("admin.footer.headingStyle")}</Label>
                  <Select
                    value={formData.headingStyle}
                    onValueChange={(value) => setFormData({ ...formData, headingStyle: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">{t("admin.footer.normal")}</SelectItem>
                      <SelectItem value="uppercase">{t("admin.footer.uppercase")}</SelectItem>
                      <SelectItem value="capitalize">{t("admin.footer.capitalize")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Preview */}
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground mb-2">{t("admin.footer.previewColon")}</p>
                <h4
                  className={cn(
                    formData.headingSize === "sm" && "text-sm",
                    formData.headingSize === "base" && "text-base",
                    formData.headingSize === "lg" && "text-lg",
                    formData.headingSize === "xl" && "text-xl",
                    formData.headingWeight === "medium" && "font-medium",
                    formData.headingWeight === "semibold" && "font-semibold",
                    formData.headingWeight === "bold" && "font-bold",
                    formData.headingStyle === "uppercase" && "uppercase",
                    formData.headingStyle === "capitalize" && "capitalize"
                  )}
                  style={{ color: formData.headingColor || undefined }}
                >
                  {t("admin.footer.sampleHeading")}
                </h4>
              </div>
            </CardContent>
          </Card>

          {/* Social Icon Styling */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                {t("admin.footer.socialIcons")}
              </CardTitle>
              <CardDescription>{t("admin.footer.socialIconsDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("admin.footer.iconShape")}</Label>
                  <Select
                    value={formData.socialShape}
                    onValueChange={(value) => setFormData({ ...formData, socialShape: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="circle">{t("admin.footer.shapeCircle")}</SelectItem>
                      <SelectItem value="square">{t("admin.footer.shapeSquare")}</SelectItem>
                      <SelectItem value="rounded">{t("admin.footer.shapeRounded")}</SelectItem>
                      <SelectItem value="pill">{t("admin.footer.shapePill")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("admin.footer.iconSize")}</Label>
                  <Select
                    value={formData.socialSize}
                    onValueChange={(value) => setFormData({ ...formData, socialSize: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sm">{t("admin.footer.small")}</SelectItem>
                      <SelectItem value="md">{t("admin.footer.medium")}</SelectItem>
                      <SelectItem value="lg">{t("admin.footer.large")}</SelectItem>
                      <SelectItem value="xl">{t("admin.footer.extraLarge")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("admin.footer.colorMode")}</Label>
                  <Select
                    value={formData.socialColorMode}
                    onValueChange={(value) => setFormData({ ...formData, socialColorMode: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brand">{t("admin.footer.colorBrand")}</SelectItem>
                      <SelectItem value="monochrome">{t("admin.footer.colorMonochrome")}</SelectItem>
                      <SelectItem value="accent">{t("admin.footer.colorAccent")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("admin.footer.hoverEffect")}</Label>
                  <Select
                    value={formData.socialHoverEffect}
                    onValueChange={(value) => setFormData({ ...formData, socialHoverEffect: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scale">{t("admin.footer.hoverScale")}</SelectItem>
                      <SelectItem value="lift">{t("admin.footer.hoverLift")}</SelectItem>
                      <SelectItem value="glow">{t("admin.footer.hoverGlow")}</SelectItem>
                      <SelectItem value="rotate">{t("admin.footer.hoverRotate")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("admin.footer.bgStyle")}</Label>
                  <Select
                    value={formData.socialBgStyle}
                    onValueChange={(value) => setFormData({ ...formData, socialBgStyle: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t("admin.footer.bgNone")}</SelectItem>
                      <SelectItem value="subtle">{t("admin.footer.bgSubtleGlass")}</SelectItem>
                      <SelectItem value="solid">{t("admin.footer.bgSolidStyle")}</SelectItem>
                      <SelectItem value="outline">{t("admin.footer.bgOutline")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Preview */}
              <div className="rounded-lg border p-4" style={{ backgroundColor: formData.bgColor || '#1a1a2e' }}>
                <p className="text-xs text-white/60 mb-3">{t("admin.footer.previewOnDark")}</p>
                <div className={cn(
                  "flex",
                  formData.socialSize === "sm" && "gap-2",
                  formData.socialSize === "md" && "gap-3",
                  formData.socialSize === "lg" && "gap-3",
                  formData.socialSize === "xl" && "gap-4"
                )}>
                  {[
                    { icon: Facebook, color: "#1877F2", name: "Facebook" },
                    { icon: Twitter, color: "#1DA1F2", name: "Twitter" },
                    { icon: Instagram, color: "#E4405F", name: "Instagram" },
                    { icon: Linkedin, color: "#0A66C2", name: "LinkedIn" },
                  ].map((social) => {
                    const IconComponent = social.icon;
                    const iconColor = formData.socialColorMode === "monochrome"
                      ? "#ffffff"
                      : formData.socialColorMode === "accent"
                        ? (formData.accentColor || social.color)
                        : social.color;
                    return (
                      <div
                        key={social.name}
                        className={cn(
                          "flex items-center justify-center transition-all",
                          // Shape
                          formData.socialShape === "circle" && "rounded-full",
                          formData.socialShape === "square" && "rounded-none",
                          formData.socialShape === "rounded" && "rounded-lg",
                          formData.socialShape === "pill" && "rounded-full",
                          // Size - pill uses different width (explicit style below)
                          formData.socialShape !== "pill" && formData.socialSize === "sm" && "h-7 w-7 p-1.5",
                          formData.socialShape !== "pill" && formData.socialSize === "md" && "h-9 w-9 p-2",
                          formData.socialShape !== "pill" && formData.socialSize === "lg" && "h-11 w-11 p-2.5",
                          formData.socialShape !== "pill" && formData.socialSize === "xl" && "h-13 w-13 p-3",
                          // Hover effect
                          formData.socialHoverEffect === "scale" && "hover:scale-110",
                          formData.socialHoverEffect === "lift" && "hover:-translate-y-1 hover:shadow-lg",
                          formData.socialHoverEffect === "glow" && "hover:shadow-lg hover:shadow-current/30",
                          formData.socialHoverEffect === "rotate" && "hover:rotate-12",
                          // Background style
                          formData.socialBgStyle === "none" && "",
                          formData.socialBgStyle === "subtle" && "bg-white/10 hover:bg-white/20",
                          formData.socialBgStyle === "solid" && "bg-white/20 hover:bg-white/30",
                          formData.socialBgStyle === "outline" && "border border-white/30 hover:border-white/50"
                        )}
                        style={{
                          color: iconColor,
                          // Pill shape uses explicit wider dimensions
                          ...(formData.socialShape === "pill" && {
                            width: formData.socialSize === "sm" ? "45px" : formData.socialSize === "lg" ? "77px" : formData.socialSize === "xl" ? "90px" : "64px",
                            height: formData.socialSize === "sm" ? "28px" : formData.socialSize === "lg" ? "48px" : formData.socialSize === "xl" ? "56px" : "40px",
                          }),
                        }}
                      >
                        <IconComponent className={cn(
                          formData.socialSize === "sm" && "h-4 w-4",
                          formData.socialSize === "md" && "h-5 w-5",
                          formData.socialSize === "lg" && "h-6 w-6",
                          formData.socialSize === "xl" && "h-7 w-7"
                        )} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Effects & Animation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                {t("admin.footer.effectsAnim")}
              </CardTitle>
              <CardDescription>{t("admin.footer.effectsAnimDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Animation Toggle */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label className="text-base">{t("admin.footer.enableAnimations")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.footer.enableAnimationsDesc")}
                  </p>
                </div>
                <Switch
                  checked={formData.enableAnimations}
                  onCheckedChange={(checked) => setFormData({ ...formData, enableAnimations: checked })}
                />
              </div>

              {formData.enableAnimations && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t("admin.footer.entranceAnimation")}</Label>
                    <Select
                      value={formData.entranceAnimation || "none"}
                      onValueChange={(value) => setFormData({ ...formData, entranceAnimation: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t("admin.footer.entranceNone")}</SelectItem>
                        <SelectItem value="fade-in">{t("admin.footer.entranceFadeIn")}</SelectItem>
                        <SelectItem value="fade-up">{t("admin.footer.entranceFadeUp")}</SelectItem>
                        <SelectItem value="slide-up">{t("admin.footer.entranceSlideUp")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>{t("admin.footer.animationDuration")}</Label>
                      <span className="text-sm text-muted-foreground">{formData.animationDuration}ms</span>
                    </div>
                    <Slider
                      value={[formData.animationDuration]}
                      onValueChange={(value) => setFormData({ ...formData, animationDuration: value[0] })}
                      min={100}
                      max={800}
                      step={50}
                    />
                  </div>
                </div>
              )}

              <Separator />

              {/* Shadow */}
              <div className="space-y-2">
                <Label>{t("admin.footer.shadow")}</Label>
                <Select
                  value={formData.shadow}
                  onValueChange={(value) => setFormData({ ...formData, shadow: value })}
                >
                  <SelectTrigger className="w-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("admin.footer.shadowNone")}</SelectItem>
                    <SelectItem value="sm">{t("admin.footer.shadowSm")}</SelectItem>
                    <SelectItem value="md">{t("admin.footer.shadowMd")}</SelectItem>
                    <SelectItem value="lg">{t("admin.footer.shadowLg")}</SelectItem>
                    <SelectItem value="xl">{t("admin.footer.shadowXl")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Divider Style */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("admin.footer.dividerStyle")}</Label>
                  <Select
                    value={formData.dividerStyle}
                    onValueChange={(value) => setFormData({ ...formData, dividerStyle: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t("admin.footer.dividerNone")}</SelectItem>
                      <SelectItem value="solid">{t("admin.footer.dividerSolid")}</SelectItem>
                      <SelectItem value="dashed">{t("admin.footer.dividerDashed")}</SelectItem>
                      <SelectItem value="dotted">{t("admin.footer.dividerDotted")}</SelectItem>
                      <SelectItem value="gradient">{t("admin.footer.dividerGradient")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("admin.footer.linkPrefix")}</Label>
                  <Select
                    value={formData.linkPrefix}
                    onValueChange={(value) => setFormData({ ...formData, linkPrefix: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t("admin.footer.linkPrefixNone")}</SelectItem>
                      <SelectItem value="chevron">{t("admin.footer.linkPrefixChevron")}</SelectItem>
                      <SelectItem value="arrow">{t("admin.footer.linkPrefixArrow")}</SelectItem>
                      <SelectItem value="dash">{t("admin.footer.linkPrefixDash")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{t("admin.footer.linkPrefixHint")}</p>
                </div>

                <div className="space-y-2">
                  <Label>{t("admin.footer.linkHoverEffectLabel")}</Label>
                  <Select
                    value={formData.linkHoverEffect}
                    onValueChange={(value) => setFormData({ ...formData, linkHoverEffect: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="color">{t("admin.footer.linkHoverColorChange")}</SelectItem>
                      <SelectItem value="underline">{t("admin.footer.linkHoverUnderline")}</SelectItem>
                      <SelectItem value="slide">{t("admin.footer.linkHoverSlide")}</SelectItem>
                      <SelectItem value="highlight">{t("admin.footer.linkHoverHighlight")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Container Width & Style */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Maximize2 className="h-5 w-5" />
                {t("admin.footer.containerTitle")}
              </CardTitle>
              <CardDescription>{t("admin.footer.containerDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("admin.footer.containerWidth")}</Label>
                  <Select
                    value={formData.containerWidth}
                    onValueChange={(value) => setFormData({ ...formData, containerWidth: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">{t("admin.footer.containerFull")}</SelectItem>
                      <SelectItem value="boxed">{t("admin.footer.containerBoxed")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {t("admin.footer.containerBoxedHint")}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>{t("admin.footer.cornerStyle")}</Label>
                  <Select
                    value={formData.containerStyle}
                    onValueChange={(value) => {
                      if (value === "sharp") {
                        setFormData({ ...formData, containerStyle: value, cornerRadiusTL: 0, cornerRadiusTR: 0, cornerRadiusBL: 0, cornerRadiusBR: 0 });
                      } else {
                        setFormData({ ...formData, containerStyle: value, cornerRadiusTL: 16, cornerRadiusTR: 16, cornerRadiusBL: 16, cornerRadiusBR: 16 });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sharp">{t("admin.footer.cornerSharp")}</SelectItem>
                      <SelectItem value="round">{t("admin.footer.cornerRound")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.containerStyle === "round" && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">{t("admin.footer.cornerRadiusPx")}</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">{t("admin.footer.cornerTopLeft")}</Label>
                          <span className="text-xs text-muted-foreground">{formData.cornerRadiusTL}px</span>
                        </div>
                        <Slider
                          value={[formData.cornerRadiusTL]}
                          onValueChange={(value) => setFormData({ ...formData, cornerRadiusTL: value[0] })}
                          min={0}
                          max={48}
                          step={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">{t("admin.footer.cornerTopRight")}</Label>
                          <span className="text-xs text-muted-foreground">{formData.cornerRadiusTR}px</span>
                        </div>
                        <Slider
                          value={[formData.cornerRadiusTR]}
                          onValueChange={(value) => setFormData({ ...formData, cornerRadiusTR: value[0] })}
                          min={0}
                          max={48}
                          step={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">{t("admin.footer.cornerBottomLeft")}</Label>
                          <span className="text-xs text-muted-foreground">{formData.cornerRadiusBL}px</span>
                        </div>
                        <Slider
                          value={[formData.cornerRadiusBL]}
                          onValueChange={(value) => setFormData({ ...formData, cornerRadiusBL: value[0] })}
                          min={0}
                          max={48}
                          step={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">{t("admin.footer.cornerBottomRight")}</Label>
                          <span className="text-xs text-muted-foreground">{formData.cornerRadiusBR}px</span>
                        </div>
                        <Slider
                          value={[formData.cornerRadiusBR]}
                          onValueChange={(value) => setFormData({ ...formData, cornerRadiusBR: value[0] })}
                          min={0}
                          max={48}
                          step={4}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Spacing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SquareStack className="h-5 w-5" />
                {t("admin.footer.spacing")}
              </CardTitle>
              <CardDescription>{t("admin.footer.spacingDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{t("admin.footer.paddingTop")}</Label>
                  <span className="text-sm text-muted-foreground">{formData.paddingTop}px</span>
                </div>
                <Slider
                  value={[formData.paddingTop]}
                  onValueChange={(value) => setFormData({ ...formData, paddingTop: value[0] })}
                  min={16}
                  max={120}
                  step={8}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{t("admin.footer.paddingBottom")}</Label>
                  <span className="text-sm text-muted-foreground">{formData.paddingBottom}px</span>
                </div>
                <Slider
                  value={[formData.paddingBottom]}
                  onValueChange={(value) => setFormData({ ...formData, paddingBottom: value[0] })}
                  min={16}
                  max={120}
                  step={8}
                />
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  {t("admin.footer.colorsEmptyHint")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Top Border */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Maximize2 className="h-5 w-5" />
                {t("admin.footer.topBorder")}
              </CardTitle>
              <CardDescription>{t("admin.footer.topBorderDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("admin.footer.borderStyle")}</Label>
                <Select
                  value={formData.topBorderStyle}
                  onValueChange={(value) => setFormData({ ...formData, topBorderStyle: value })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("admin.footer.borderNone")}</SelectItem>
                    <SelectItem value="solid">{t("admin.footer.borderSolid")}</SelectItem>
                    <SelectItem value="gradient">{t("admin.footer.borderGradient")}</SelectItem>
                    <SelectItem value="wave">{t("admin.footer.borderWave")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.topBorderStyle !== "none" && (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>{t("admin.footer.height")}</Label>
                      <span className="text-sm text-muted-foreground">{formData.topBorderHeight}px</span>
                    </div>
                    <Slider
                      value={[formData.topBorderHeight]}
                      onValueChange={(value) => setFormData({ ...formData, topBorderHeight: value[0] })}
                      min={1}
                      max={8}
                      step={1}
                    />
                  </div>

                  {formData.topBorderStyle === "solid" && (
                    <div className="space-y-2">
                      <Label>{t("admin.footer.color")}</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.topBorderColor || "#F97316"}
                          onChange={(e) => setFormData({ ...formData, topBorderColor: e.target.value })}
                          className="h-10 w-10 cursor-pointer rounded border"
                        />
                        <Input
                          value={formData.topBorderColor}
                          onChange={(e) => setFormData({ ...formData, topBorderColor: e.target.value })}
                          placeholder="#F97316"
                        />
                      </div>
                    </div>
                  )}

                  {formData.topBorderStyle === "gradient" && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>{t("admin.footer.gradientStart")}</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={formData.topBorderGradientFrom || "#e84c1e"}
                            onChange={(e) => setFormData({ ...formData, topBorderGradientFrom: e.target.value })}
                            className="h-10 w-10 cursor-pointer rounded border"
                          />
                          <Input
                            value={formData.topBorderGradientFrom}
                            onChange={(e) => setFormData({ ...formData, topBorderGradientFrom: e.target.value })}
                            placeholder="#e84c1e"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>{t("admin.footer.gradientEnd")}</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={formData.topBorderGradientTo || "#253d30"}
                            onChange={(e) => setFormData({ ...formData, topBorderGradientTo: e.target.value })}
                            className="h-10 w-10 cursor-pointer rounded border"
                          />
                          <Input
                            value={formData.topBorderGradientTo}
                            onChange={(e) => setFormData({ ...formData, topBorderGradientTo: e.target.value })}
                            placeholder="#253d30"
                          />
                        </div>
                      </div>
                      {/* Gradient preview */}
                      <div className="col-span-2">
                        <div
                          className="h-4 w-full rounded"
                          style={{
                            background: `linear-gradient(90deg, ${formData.topBorderGradientFrom || "#e84c1e"}, ${formData.topBorderGradientTo || "#253d30"})`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {formData.topBorderStyle === "wave" && (
                    <div className="space-y-2">
                      <Label>{t("admin.footer.color")}</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.topBorderColor || "#F97316"}
                          onChange={(e) => setFormData({ ...formData, topBorderColor: e.target.value })}
                          className="h-10 w-10 cursor-pointer rounded border"
                        />
                        <Input
                          value={formData.topBorderColor}
                          onChange={(e) => setFormData({ ...formData, topBorderColor: e.target.value })}
                          placeholder="#F97316"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Brand Reveal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                {t("admin.footer.brandReveal")}
              </CardTitle>
              <CardDescription>{t("admin.footer.brandRevealDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">{t("admin.footer.enableBrandReveal")}</p>
                  <p className="text-sm text-muted-foreground">{t("admin.footer.enableBrandRevealDesc")}</p>
                </div>
                <Switch
                  checked={formData.brandRevealEnabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, brandRevealEnabled: checked })}
                />
              </div>

              {formData.brandRevealEnabled && (
                <>
                  <div className="space-y-2">
                    <Label>{t("admin.footer.customText")}</Label>
                    <Input
                      value={formData.brandRevealText}
                      onChange={(e) => setFormData({ ...formData, brandRevealText: e.target.value })}
                      placeholder={t("admin.footer.customTextPlaceholder")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("admin.footer.textColor")}</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.brandRevealColor || "#ffffff"}
                        onChange={(e) => setFormData({ ...formData, brandRevealColor: e.target.value })}
                        className="h-10 w-10 cursor-pointer rounded border"
                      />
                      <Input
                        value={formData.brandRevealColor}
                        onChange={(e) => setFormData({ ...formData, brandRevealColor: e.target.value })}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>{t("admin.footer.opacity")}</Label>
                      <span className="text-sm text-muted-foreground">{(formData.brandRevealOpacity * 100).toFixed(0)}%</span>
                    </div>
                    <Slider
                      value={[formData.brandRevealOpacity * 100]}
                      onValueChange={(value) => setFormData({ ...formData, brandRevealOpacity: value[0] / 100 })}
                      min={2}
                      max={20}
                      step={1}
                    />
                  </div>
                  {/* Preview */}
                  <div className="relative overflow-hidden rounded-lg border bg-gray-900 p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-2">{t("admin.footer.previewColon")}</p>
                    <span
                      className="text-4xl font-black tracking-tighter uppercase"
                      style={{
                        color: formData.brandRevealColor || "#ffffff",
                        opacity: formData.brandRevealOpacity,
                      }}
                    >
                      {formData.brandRevealText || "WEEDING CEREMONY"}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Custom CSS */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                {t("admin.footer.customCss")}
              </CardTitle>
              <CardDescription>{t("admin.footer.customCssDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={formData.customCSS}
                onChange={(e) => setFormData({ ...formData, customCSS: e.target.value })}
                placeholder={`.footer-dynamic-styles {\n  /* Your custom CSS here */\n}`}
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {t("admin.footer.customCssHint")} <code>.footer-dynamic-styles</code> {t("admin.footer.customCssHint2")}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Widget Dialog */}
      <Dialog open={widgetDialogOpen} onOpenChange={setWidgetDialogOpen}>
        <DialogContent className={cn(
          "max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col",
          widgetFormData.type === "BUTTON" && "sm:max-w-xl md:max-w-2xl"
        )}>
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>
              {selectedWidget ? t("admin.footer.editWidget") : t("admin.footer.addWidgetTitle")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto flex-1 pr-1">
            <div className="space-y-2">
              <Label>{t("admin.footer.widgetType")}</Label>
              <Select
                value={widgetFormData.type}
                onValueChange={(value: FooterWidgetType) =>
                  setWidgetFormData({ ...widgetFormData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {widgetTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        {type.icon}
                        <span>{t(type.labelKey)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <LocalizedInput
              id="widgetTitle"
              label={t("admin.footer.widgetTitleLabel")}
              placeholder={t("admin.footer.widgetTitlePlaceholder")}
              value={{ en: widgetFormData.title, ...(widgetFormData.translations?.title || {}) }}
              onChange={(next) => setWidgetFormData({
                ...widgetFormData,
                title: next.en ?? "",
                translations: { ...widgetFormData.translations, title: next as Record<string, string> },
              })}
            />

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label>{t("admin.footer.showTitle")}</Label>
                <p className="text-xs text-muted-foreground">{t("admin.footer.showTitleDesc")}</p>
              </div>
              <Switch
                checked={widgetFormData.showTitle}
                onCheckedChange={(checked) => setWidgetFormData({ ...widgetFormData, showTitle: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("admin.footer.column")}</Label>
              <Select
                value={String(widgetFormData.column)}
                onValueChange={(value) =>
                  setWidgetFormData({ ...widgetFormData, column: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: formData.columns }, (_, i) => i + 1).map((col) => (
                    <SelectItem key={col} value={String(col)}>
                      {t("admin.footer.columnLabel", { num: String(col) })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Heading Icon for LINKS widget */}
            {widgetFormData.type === "LINKS" && (
              <div className="space-y-2">
                <Label htmlFor="headingIcon">{t("admin.footer.headingIcon")}</Label>
                <Select
                  value={widgetFormData.headingIcon || "none"}
                  onValueChange={(v) => setWidgetFormData({ ...widgetFormData, headingIcon: v === "none" ? "" : v })}
                >
                  <SelectTrigger id="headingIcon">
                    <SelectValue placeholder={t("admin.footer.noIcon")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("admin.footer.noIcon")}</SelectItem>
                    <SelectItem value="users">{t("admin.footer.iconUsers")}</SelectItem>
                    <SelectItem value="building">{t("admin.footer.iconBuilding")}</SelectItem>
                    <SelectItem value="building-2">{t("admin.footer.iconBuilding2")}</SelectItem>
                    <SelectItem value="party-popper">{t("admin.footer.iconPartyPopper")}</SelectItem>
                    <SelectItem value="message-circle">{t("admin.footer.iconMessageCircle")}</SelectItem>
                    <SelectItem value="store">{t("admin.footer.iconStore")}</SelectItem>
                    <SelectItem value="shopping-bag">{t("admin.footer.iconShoppingBag")}</SelectItem>
                    <SelectItem value="globe">{t("admin.footer.iconGlobe")}</SelectItem>
                    <SelectItem value="tag">{t("admin.footer.iconTag")}</SelectItem>
                    <SelectItem value="headphones">{t("admin.footer.iconHeadphones")}</SelectItem>
                    <SelectItem value="help-circle">{t("admin.footer.iconHelpCircle")}</SelectItem>
                    <SelectItem value="star">{t("admin.footer.iconStar")}</SelectItem>
                    <SelectItem value="heart">{t("admin.footer.iconHeart")}</SelectItem>
                    <SelectItem value="mail">{t("admin.footer.iconMail")}</SelectItem>
                    <SelectItem value="phone">{t("admin.footer.iconPhone")}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{t("admin.footer.headingIconHint")}</p>
              </div>
            )}

            {/* Links Editor for LINKS widget type */}
            {widgetFormData.type === "LINKS" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>{t("admin.footer.links")}</Label>
                  <Button variant="outline" size="sm" onClick={addWidgetLink}>
                    <Plus className="mr-1 h-4 w-4" />
                    {t("admin.footer.addLink")}
                  </Button>
                </div>
                {widgetFormData.links.length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed p-4 text-center">
                    <p className="text-sm text-muted-foreground">{t("admin.footer.noLinksYet")}</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={addWidgetLink}>
                      <Plus className="mr-1 h-4 w-4" />
                      {t("admin.footer.addFirstLink")}
                    </Button>
                  </div>
                ) : (
                  <div className="max-h-50 space-y-2 overflow-y-auto">
                    {widgetFormData.links.map((link, index) => (
                      <div key={link.id} className="flex items-start gap-2 rounded-lg border p-2">
                        <GripVertical className="mt-2 h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="flex-1">
                          <LocalizedInput
                            value={{ en: link.label, ...(link.translations?.label || {}) }}
                            placeholder={t("admin.footer.linkLabelPlaceholder")}
                            onChange={(next) => updateWidgetLink(index, {
                              label: next.en ?? "",
                              translations: { ...link.translations, label: next as Record<string, string> },
                            })}
                          />
                        </div>
                        <Input
                          value={link.url}
                          onChange={(e) => updateWidgetLink(index, { url: e.target.value })}
                          placeholder={t("admin.footer.urlPlaceholder")}
                          className="mt-7 flex-1"
                        />
                        <Select
                          value={link.target}
                          onValueChange={(value: "_self" | "_blank") => updateWidgetLink(index, { target: value })}
                        >
                          <SelectTrigger className="mt-7 w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_self">{t("admin.footer.sameTab")}</SelectItem>
                            <SelectItem value="_blank">{t("admin.footer.newTab")}</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="mt-7 h-8 w-8 shrink-0 text-destructive"
                          onClick={() => removeWidgetLink(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TEXT widget content */}
            {widgetFormData.type === "TEXT" && (
              <div className="space-y-2">
                <Label htmlFor="textContent">{t("admin.footer.textContent")}</Label>
                <Textarea
                  id="textContent"
                  value={(widgetFormData.content as { text?: string })?.text || ""}
                  onChange={(e) => setWidgetFormData({
                    ...widgetFormData,
                    content: { ...widgetFormData.content, text: e.target.value },
                  })}
                  placeholder={t("admin.footer.textContentPlaceholder")}
                  rows={4}
                />
              </div>
            )}

            {/* CUSTOM_HTML widget content */}
            {widgetFormData.type === "CUSTOM_HTML" && (
              <div className="space-y-2">
                <Label htmlFor="htmlContent">{t("admin.footer.htmlContent")}</Label>
                <Textarea
                  id="htmlContent"
                  value={(widgetFormData.content as { html?: string })?.html || ""}
                  onChange={(e) => setWidgetFormData({
                    ...widgetFormData,
                    content: { ...widgetFormData.content, html: e.target.value },
                  })}
                  placeholder={t("admin.footer.htmlContentPlaceholder")}
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  {t("admin.footer.htmlContentHint")}
                </p>
              </div>
            )}

            {/* NEWSLETTER widget content */}
            {widgetFormData.type === "NEWSLETTER" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newsletterText">{t("admin.footer.newsletterDescText")}</Label>
                  <Input
                    id="newsletterText"
                    value={(widgetFormData.content as { text?: string })?.text || ""}
                    onChange={(e) => setWidgetFormData({
                      ...widgetFormData,
                      content: { ...widgetFormData.content, text: e.target.value },
                    })}
                    placeholder={t("admin.footer.newsletterDescPlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newsletterPlaceholder">{t("admin.footer.newsletterInputPh")}</Label>
                  <Input
                    id="newsletterPlaceholder"
                    value={(widgetFormData.content as { placeholder?: string })?.placeholder || ""}
                    onChange={(e) => setWidgetFormData({
                      ...widgetFormData,
                      content: { ...widgetFormData.content, placeholder: e.target.value },
                    })}
                    placeholder={t("admin.footer.newsletterInputPhPh")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newsletterButton">{t("admin.footer.newsletterButton")}</Label>
                  <Input
                    id="newsletterButton"
                    value={(widgetFormData.content as { buttonText?: string })?.buttonText || ""}
                    onChange={(e) => setWidgetFormData({
                      ...widgetFormData,
                      content: { ...widgetFormData.content, buttonText: e.target.value },
                    })}
                    placeholder={t("admin.footer.newsletterButtonPh")}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("admin.footer.newsletterHint")}
                </p>
              </div>
            )}

            {/* BRAND widget options */}
            {widgetFormData.type === "BRAND" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("admin.footer.logoVersion")}</Label>
                  <Select
                    value={(widgetFormData.content as { logoMode?: string })?.logoMode || "auto"}
                    onValueChange={(value) => setWidgetFormData({
                      ...widgetFormData,
                      content: { ...widgetFormData.content, logoMode: value },
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">{t("admin.footer.logoAuto")}</SelectItem>
                      <SelectItem value="light">{t("admin.footer.logoLight")}</SelectItem>
                      <SelectItem value="dark">{t("admin.footer.logoDark")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {t("admin.footer.logoHint")}
                  </p>
                </div>
              </div>
            )}

            {/* BUTTON widget options */}
            {widgetFormData.type === "BUTTON" && (
              <div className="space-y-4">
                {/* Button Text and URL */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t("admin.footer.buttonText")}</Label>
                    <Input
                      value={(widgetFormData.content as { text?: string })?.text || ""}
                      onChange={(e) => setWidgetFormData({
                        ...widgetFormData,
                        content: { ...widgetFormData.content, text: e.target.value },
                      })}
                      placeholder={t("admin.footer.buttonTextPlaceholder")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("admin.footer.urlLabel")}</Label>
                    <Input
                      value={(widgetFormData.content as { url?: string })?.url || ""}
                      onChange={(e) => setWidgetFormData({
                        ...widgetFormData,
                        content: { ...widgetFormData.content, url: e.target.value },
                      })}
                      placeholder={t("admin.footer.urlPagePlaceholder")}
                    />
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-muted-foreground">{t("admin.footer.openInNewTab")}</span>
                      <Switch
                        checked={(widgetFormData.content as { openInNewTab?: boolean })?.openInNewTab ?? false}
                        onCheckedChange={(checked) => setWidgetFormData({
                          ...widgetFormData,
                          content: { ...widgetFormData.content, openInNewTab: checked },
                        })}
                        className="scale-75"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Button Preview */}
                <div className="rounded-lg border p-3">
                  <Label className="text-xs text-muted-foreground mb-1 block">{t("admin.footer.previewHoverTap")}</Label>
                  <div className="flex items-center justify-center py-1">
                    <FooterButtonPreview style={(widgetFormData.content as { style?: ButtonCustomStyle })?.style || {}} />
                  </div>
                </div>

                {/* Style Presets */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t("admin.footer.quickStylePresets")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t("admin.footer.quickStylePresetsHint")}
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5">
                    {BUTTON_STYLE_PRESETS.map((preset) => {
                      const previewBg = preset.style.useGradient
                        ? `linear-gradient(${getGradientCSS(preset.style.gradientDirection)}, ${preset.style.gradientFrom}, ${preset.style.gradientTo})`
                        : preset.style.bgColor || "#F97316";

                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setWidgetFormData({
                            ...widgetFormData,
                            content: { ...widgetFormData.content, style: { ...preset.style } },
                          })}
                          className="group relative flex flex-col items-center p-1.5 rounded-md border hover:border-primary hover:bg-muted/50 transition-all"
                          title={preset.description}
                        >
                          <span
                            className="inline-flex items-center justify-center px-1.5 py-0.5 text-[8px] font-medium rounded transition-all mb-0.5"
                            style={{
                              background: previewBg,
                              color: preset.style.textColor || "#ffffff",
                              borderWidth: `${preset.style.borderWidth ?? 0}px`,
                              borderStyle: "solid",
                              borderColor: preset.style.borderColor || "transparent",
                              borderRadius: `${Math.min(preset.style.borderRadius ?? 6, 4)}px`,
                            }}
                          >
                            Btn
                          </span>
                          <span className="text-[8px] text-muted-foreground group-hover:text-foreground text-center leading-tight truncate w-full">
                            {preset.name.split(' ')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Styling Accordion */}
                <Accordion type="multiple" className="w-full">
                  {/* Colors Section */}
                  <AccordionItem value="colors">
                    <AccordionTrigger className="text-sm">{t("admin.footer.colorsSection")}</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2">
                      {/* Gradient Toggle */}
                      <div className="flex items-center justify-between rounded-lg border p-2 sm:p-3 gap-2">
                        <div className="min-w-0">
                          <Label className="text-xs sm:text-sm">{t("admin.footer.useGradient")}</Label>
                          <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">{t("admin.footer.useGradientHint")}</p>
                        </div>
                        <Switch
                          checked={(widgetFormData.content as { style?: ButtonCustomStyle })?.style?.useGradient || false}
                          onCheckedChange={(checked) => setWidgetFormData({
                            ...widgetFormData,
                            content: {
                              ...widgetFormData.content,
                              style: {
                                ...(widgetFormData.content as { style?: ButtonCustomStyle })?.style,
                                useGradient: checked,
                                gradientFrom: checked ? ((widgetFormData.content as { style?: ButtonCustomStyle })?.style?.gradientFrom || "#F97316") : undefined,
                                gradientTo: checked ? ((widgetFormData.content as { style?: ButtonCustomStyle })?.style?.gradientTo || "#C2410C") : undefined,
                              },
                            },
                          })}
                        />
                      </div>

                      {(widgetFormData.content as { style?: ButtonCustomStyle })?.style?.useGradient ? (
                        <div className="rounded-lg border p-2 sm:p-3 space-y-3 bg-muted/30">
                          <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-3">
                            <div className="space-y-2">
                              <Label className="text-xs">{t("admin.footer.gradientFrom")}</Label>
                              <div className="flex gap-2">
                                <Input
                                  type="color"
                                  value={(widgetFormData.content as { style?: ButtonCustomStyle })?.style?.gradientFrom || "#F97316"}
                                  onChange={(e) => setWidgetFormData({
                                    ...widgetFormData,
                                    content: {
                                      ...widgetFormData.content,
                                      style: { ...(widgetFormData.content as { style?: ButtonCustomStyle })?.style, gradientFrom: e.target.value },
                                    },
                                  })}
                                  className="h-9 w-12 cursor-pointer p-1"
                                />
                                <Input
                                  value={(widgetFormData.content as { style?: ButtonCustomStyle })?.style?.gradientFrom || ""}
                                  onChange={(e) => setWidgetFormData({
                                    ...widgetFormData,
                                    content: {
                                      ...widgetFormData.content,
                                      style: { ...(widgetFormData.content as { style?: ButtonCustomStyle })?.style, gradientFrom: e.target.value },
                                    },
                                  })}
                                  className="flex-1 text-xs"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">{t("admin.footer.gradientTo")}</Label>
                              <div className="flex gap-2">
                                <Input
                                  type="color"
                                  value={(widgetFormData.content as { style?: ButtonCustomStyle })?.style?.gradientTo || "#C2410C"}
                                  onChange={(e) => setWidgetFormData({
                                    ...widgetFormData,
                                    content: {
                                      ...widgetFormData.content,
                                      style: { ...(widgetFormData.content as { style?: ButtonCustomStyle })?.style, gradientTo: e.target.value },
                                    },
                                  })}
                                  className="h-9 w-12 cursor-pointer p-1"
                                />
                                <Input
                                  value={(widgetFormData.content as { style?: ButtonCustomStyle })?.style?.gradientTo || ""}
                                  onChange={(e) => setWidgetFormData({
                                    ...widgetFormData,
                                    content: {
                                      ...widgetFormData.content,
                                      style: { ...(widgetFormData.content as { style?: ButtonCustomStyle })?.style, gradientTo: e.target.value },
                                    },
                                  })}
                                  className="flex-1 text-xs"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">{t("admin.footer.direction")}</Label>
                              <Select
                                value={(widgetFormData.content as { style?: ButtonCustomStyle })?.style?.gradientDirection || "to-r"}
                                onValueChange={(value: GradientDirection) => setWidgetFormData({
                                  ...widgetFormData,
                                  content: {
                                    ...widgetFormData.content,
                                    style: { ...(widgetFormData.content as { style?: ButtonCustomStyle })?.style, gradientDirection: value },
                                  },
                                })}
                              >
                                <SelectTrigger className="text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {gradientDirectionOptions.map((dir) => (
                                    <SelectItem key={dir.value} value={dir.value}>{t(dir.labelKey)}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">{t("admin.footer.textColor")}</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={(widgetFormData.content as { style?: ButtonCustomStyle })?.style?.textColor || "#ffffff"}
                                onChange={(e) => setWidgetFormData({
                                  ...widgetFormData,
                                  content: {
                                    ...widgetFormData.content,
                                    style: { ...(widgetFormData.content as { style?: ButtonCustomStyle })?.style, textColor: e.target.value },
                                  },
                                })}
                                className="h-9 w-12 cursor-pointer p-1"
                              />
                              <Input
                                value={(widgetFormData.content as { style?: ButtonCustomStyle })?.style?.textColor || ""}
                                onChange={(e) => setWidgetFormData({
                                  ...widgetFormData,
                                  content: {
                                    ...widgetFormData.content,
                                    style: { ...(widgetFormData.content as { style?: ButtonCustomStyle })?.style, textColor: e.target.value },
                                  },
                                })}
                                className="flex-1 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-3">
                          <div className="space-y-2">
                            <Label className="text-xs">{t("admin.footer.bgColorLabel")}</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={(widgetFormData.content as { style?: ButtonCustomStyle })?.style?.bgColor || "#F97316"}
                                onChange={(e) => setWidgetFormData({
                                  ...widgetFormData,
                                  content: {
                                    ...widgetFormData.content,
                                    style: { ...(widgetFormData.content as { style?: ButtonCustomStyle })?.style, bgColor: e.target.value },
                                  },
                                })}
                                className="h-9 w-12 cursor-pointer p-1"
                              />
                              <Input
                                value={(widgetFormData.content as { style?: ButtonCustomStyle })?.style?.bgColor || ""}
                                onChange={(e) => setWidgetFormData({
                                  ...widgetFormData,
                                  content: {
                                    ...widgetFormData.content,
                                    style: { ...(widgetFormData.content as { style?: ButtonCustomStyle })?.style, bgColor: e.target.value },
                                  },
                                })}
                                className="flex-1 text-xs"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">{t("admin.footer.textColor")}</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={(widgetFormData.content as { style?: ButtonCustomStyle })?.style?.textColor || "#ffffff"}
                                onChange={(e) => setWidgetFormData({
                                  ...widgetFormData,
                                  content: {
                                    ...widgetFormData.content,
                                    style: { ...(widgetFormData.content as { style?: ButtonCustomStyle })?.style, textColor: e.target.value },
                                  },
                                })}
                                className="h-9 w-12 cursor-pointer p-1"
                              />
                              <Input
                                value={(widgetFormData.content as { style?: ButtonCustomStyle })?.style?.textColor || ""}
                                onChange={(e) => setWidgetFormData({
                                  ...widgetFormData,
                                  content: {
                                    ...widgetFormData.content,
                                    style: { ...(widgetFormData.content as { style?: ButtonCustomStyle })?.style, textColor: e.target.value },
                                  },
                                })}
                                className="flex-1 text-xs"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">{t("admin.footer.borderColor")}</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={(widgetFormData.content as { style?: ButtonCustomStyle })?.style?.borderColor || "#F97316"}
                                onChange={(e) => setWidgetFormData({
                                  ...widgetFormData,
                                  content: {
                                    ...widgetFormData.content,
                                    style: { ...(widgetFormData.content as { style?: ButtonCustomStyle })?.style, borderColor: e.target.value },
                                  },
                                })}
                                className="h-9 w-12 cursor-pointer p-1"
                              />
                              <Input
                                value={(widgetFormData.content as { style?: ButtonCustomStyle })?.style?.borderColor || ""}
                                onChange={(e) => setWidgetFormData({
                                  ...widgetFormData,
                                  content: {
                                    ...widgetFormData.content,
                                    style: { ...(widgetFormData.content as { style?: ButtonCustomStyle })?.style, borderColor: e.target.value },
                                  },
                                })}
                                className="flex-1 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  {/* Border Section */}
                  <AccordionItem value="border">
                    <AccordionTrigger className="text-sm">{t("admin.footer.borderSection")}</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">{t("admin.footer.borderWidth")}</Label>
                          <span className="text-xs text-muted-foreground">
                            {(widgetFormData.content as { style?: ButtonCustomStyle })?.style?.borderWidth ?? 0}px
                          </span>
                        </div>
                        <Slider
                          value={[(widgetFormData.content as { style?: ButtonCustomStyle })?.style?.borderWidth ?? 0]}
                          onValueChange={(value) => setWidgetFormData({
                            ...widgetFormData,
                            content: {
                              ...widgetFormData.content,
                              style: { ...(widgetFormData.content as { style?: ButtonCustomStyle })?.style, borderWidth: value[0] },
                            },
                          })}
                          min={0}
                          max={4}
                          step={1}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">{t("admin.footer.borderRadius")}</Label>
                          <span className="text-xs text-muted-foreground">
                            {(widgetFormData.content as { style?: ButtonCustomStyle })?.style?.borderRadius ?? 6}px
                          </span>
                        </div>
                        <Slider
                          value={[(widgetFormData.content as { style?: ButtonCustomStyle })?.style?.borderRadius ?? 6]}
                          onValueChange={(value) => setWidgetFormData({
                            ...widgetFormData,
                            content: {
                              ...widgetFormData.content,
                              style: { ...(widgetFormData.content as { style?: ButtonCustomStyle })?.style, borderRadius: value[0] },
                            },
                          })}
                          min={0}
                          max={50}
                          step={2}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Hover Effects Section */}
                  <AccordionItem value="hover">
                    <AccordionTrigger className="text-sm">{t("admin.footer.hoverEffectsSection")}</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label className="text-xs">{t("admin.footer.hoverEffect")}</Label>
                        <Select
                          value={(widgetFormData.content as { style?: ButtonCustomStyle })?.style?.hoverEffect || "none"}
                          onValueChange={(value: ButtonHoverEffect) => setWidgetFormData({
                            ...widgetFormData,
                            content: {
                              ...widgetFormData.content,
                              style: { ...(widgetFormData.content as { style?: ButtonCustomStyle })?.style, hoverEffect: value },
                            },
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {hoverEffectOptions.map((effect) => (
                              <SelectItem key={effect.value} value={effect.value}>
                                {t(effect.labelKey)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Hover Background Color */}
                      <div className="space-y-2">
                        <Label className="text-xs">{t("admin.footer.hoverBgColor")}</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={(widgetFormData.content as { style?: ButtonCustomStyle })?.style?.hoverBgColor || "#EA580C"}
                            onChange={(e) => setWidgetFormData({
                              ...widgetFormData,
                              content: {
                                ...widgetFormData.content,
                                style: { ...(widgetFormData.content as { style?: ButtonCustomStyle })?.style, hoverBgColor: e.target.value },
                              },
                            })}
                            className="h-9 w-12 cursor-pointer p-1"
                          />
                          <Input
                            value={(widgetFormData.content as { style?: ButtonCustomStyle })?.style?.hoverBgColor || ""}
                            onChange={(e) => setWidgetFormData({
                              ...widgetFormData,
                              content: {
                                ...widgetFormData.content,
                                style: { ...(widgetFormData.content as { style?: ButtonCustomStyle })?.style, hoverBgColor: e.target.value },
                              },
                            })}
                            placeholder="#EA580C"
                            className="flex-1 text-xs"
                          />
                        </div>
                      </div>

                      {/* Hover Text Color */}
                      <div className="space-y-2">
                        <Label className="text-xs">{t("admin.footer.hoverTextColor")}</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={(widgetFormData.content as { style?: ButtonCustomStyle })?.style?.hoverTextColor || "#ffffff"}
                            onChange={(e) => setWidgetFormData({
                              ...widgetFormData,
                              content: {
                                ...widgetFormData.content,
                                style: { ...(widgetFormData.content as { style?: ButtonCustomStyle })?.style, hoverTextColor: e.target.value },
                              },
                            })}
                            className="h-9 w-12 cursor-pointer p-1"
                          />
                          <Input
                            value={(widgetFormData.content as { style?: ButtonCustomStyle })?.style?.hoverTextColor || ""}
                            onChange={(e) => setWidgetFormData({
                              ...widgetFormData,
                              content: {
                                ...widgetFormData.content,
                                style: { ...(widgetFormData.content as { style?: ButtonCustomStyle })?.style, hoverTextColor: e.target.value },
                              },
                            })}
                            placeholder="#ffffff"
                            className="flex-1 text-xs"
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}

            {widgetFormData.type !== "BUTTON" && (
              <div className="rounded-lg bg-muted/50 p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {widgetFormData.type === "LINKS" && "Add links above. They will be displayed as a list in the footer."}
                  {widgetFormData.type === "BRAND" && "Shows logo, description, and contact info from settings."}
                  {widgetFormData.type === "SERVICES" && "Auto-populated from your active services."}
                  {widgetFormData.type === "STATES" && "Auto-populated list of popular locations/regions."}
                  {widgetFormData.type === "NEWSLETTER" && "Email subscription form."}
                  {widgetFormData.type === "SOCIAL" && "Social media links from settings."}
                  {widgetFormData.type === "CONTACT" && "Contact information from settings."}
                  {widgetFormData.type === "TEXT" && "Enter your custom text above."}
                  {widgetFormData.type === "RECENT_POSTS" && "Latest blog posts."}
                  {widgetFormData.type === "CUSTOM_HTML" && "Enter raw HTML above. Use with caution."}
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="flex-shrink-0 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setWidgetDialogOpen(false)} className="flex-1 sm:flex-none">
              Cancel
            </Button>
            <Button onClick={handleWidgetSave} disabled={saving} className="flex-1 sm:flex-none">
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {selectedWidget ? t("admin.footer.update") : t("admin.footer.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Widget Confirmation */}
      <AlertDialog open={deleteWidgetDialogOpen} onOpenChange={setDeleteWidgetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.footer.deleteWidget")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.footer.deleteWidgetDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("admin.footer.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleWidgetDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("admin.footer.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
