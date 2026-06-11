/**
 * Centralized Button Style Presets
 *
 * Single source of truth for all button style presets used across:
 * - Admin button style editor
 * - Header appearance admin
 * - Footer appearance admin
 * - Landing page builders
 */

import type { ButtonCustomStyle } from "@/lib/header-footer/types";
import { CRAFT_BG_DARK, WHITE, ORANGE_PRIMARY } from "./button-constants";

export interface ButtonStylePreset {
  id: string;
  name: string;
  description: string;
  style: ButtonCustomStyle;
}

export const BUTTON_STYLE_PRESETS: ButtonStylePreset[] = [
  {
    id: "ocean-gradient",
    name: "Ocean",
    description: "Smooth blue-to-cyan gradient with lift effect",
    style: {
      useGradient: true,
      gradientFrom: "#3B82F6",
      gradientTo: "#0A0F1E",
      gradientDirection: "to-r",
      textColor: WHITE,
      borderWidth: 0,
      borderRadius: 8,
      hoverEffect: "shadow-lift",
      shadow: "0 2px 8px rgba(59, 130, 246, 0.3)",
      hoverShadow: "0 8px 25px rgba(59, 130, 246, 0.4)",
    },
  },
  {
    id: "sunset-glow",
    name: "Sunset",
    description: "Orange-to-pink gradient with glow pulse",
    style: {
      useGradient: true,
      gradientFrom: "#8A6F3E",
      gradientTo: "#1A1A1A",
      gradientDirection: "to-r",
      textColor: WHITE,
      borderWidth: 0,
      borderRadius: 25,
      hoverEffect: "glow-pulse",
      shadow: "0 4px 15px rgba(138, 111, 62, 0.3)",
    },
  },
  {
    id: "neon-cyber",
    name: "Neon",
    description: "Electric purple with slide fill effect",
    style: {
      bgColor: "#8A6F3E",
      textColor: WHITE,
      borderWidth: 2,
      borderColor: "#E4A93B",
      borderRadius: 6,
      hoverBgColor: "#E4A93B",
      hoverEffect: "slide-fill",
      shadow: "0 0 20px rgba(138, 111, 62, 0.3)",
    },
  },
  {
    id: "emerald-success",
    name: "Emerald",
    description: "Rich green gradient with scale effect",
    style: {
      useGradient: true,
      gradientFrom: "#22C55E",
      gradientTo: "#22C55E",
      gradientDirection: "to-tr",
      textColor: WHITE,
      borderWidth: 0,
      borderRadius: 10,
      hoverEffect: "scale-up",
      shadow: "0 4px 12px rgba(34, 197, 94, 0.3)",
    },
  },
  {
    id: "midnight-premium",
    name: "Midnight",
    description: "Deep dark with gold accent border fill",
    style: {
      bgColor: "#1a1a2e",
      textColor: "#FFD700",
      borderWidth: 2,
      borderColor: "#FFD700",
      borderRadius: 4,
      hoverBgColor: "#FFD700",
      hoverTextColor: "#1a1a2e",
      hoverEffect: "border-fill",
    },
  },
  {
    id: "coral-soft",
    name: "Coral",
    description: "Soft coral with ripple effect",
    style: {
      bgColor: "#FF6F61",
      textColor: WHITE,
      borderWidth: 0,
      borderRadius: 20,
      hoverBgColor: "#FF8577",
      hoverEffect: "ripple",
      shadow: "0 3px 10px rgba(255, 111, 97, 0.3)",
    },
  },
  {
    id: "arctic-shift",
    name: "Arctic",
    description: "Cool blue gradient with shift animation",
    style: {
      useGradient: true,
      gradientFrom: "#0A0F1E",
      gradientTo: "#1E2642",
      gradientDirection: "to-r",
      textColor: WHITE,
      borderWidth: 0,
      borderRadius: 8,
      hoverBgColor: "#1E2642",
      hoverEffect: "gradient-shift",
    },
  },
  {
    id: "red-alert",
    name: "Red",
    description: "High-contrast red for urgent actions",
    style: {
      bgColor: "#DC2626",
      textColor: WHITE,
      borderWidth: 0,
      borderRadius: 6,
      hoverBgColor: "#B91C1C",
      hoverEffect: "shadow-press",
      shadow: "0 4px 14px rgba(220, 38, 38, 0.4)",
    },
  },
  {
    id: "outline-modern",
    name: "Outline",
    description: "Clean outline with slide fill on hover",
    style: {
      bgColor: "transparent",
      textColor: "#2563EB",
      borderWidth: 2,
      borderColor: "#2563EB",
      borderRadius: 8,
      hoverBgColor: "#2563EB",
      hoverTextColor: WHITE,
      hoverEffect: "slide-fill",
    },
  },
  {
    id: "craft-expand",
    name: "Craft",
    description: "Modern pill button with expanding icon circle on hover",
    style: {
      bgColor: CRAFT_BG_DARK,
      textColor: WHITE,
      borderWidth: 0,
      borderRadius: 9999,
      hoverEffect: "craft-expand",
      shadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      hoverShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    },
  },
  {
    id: "heartbeat",
    name: "Heartbeat",
    description: "Eye-catching pulsing animation for urgent CTAs",
    style: {
      bgColor: "#DC2626",
      textColor: WHITE,
      borderWidth: 0,
      borderRadius: 8,
      hoverEffect: "heartbeat",
      shadow: "0 0 0 0 rgba(220, 38, 38, 0.7)",
    },
  },
  {
    id: "flow-border",
    name: "Flow",
    description: "Rotating border gradient with conic animation on hover",
    style: {
      bgColor: ORANGE_PRIMARY,
      textColor: WHITE,
      borderWidth: 2,
      borderColor: ORANGE_PRIMARY,
      borderRadius: 8,
      hoverEffect: "flow-border",
      shadow: "0 0 0 2px rgba(249, 115, 22, 0.3)",
    },
  },
  {
    id: "stitches",
    name: "Stitches",
    description: "3D stitched effect with dashed inner border and shadow depth",
    style: {
      bgColor: "#8A6F3E",
      textColor: WHITE,
      borderWidth: 2,
      borderColor: "#8A6F3E",
      borderRadius: 8,
      hoverEffect: "stitches",
    },
  },
  {
    id: "ring-hover",
    name: "Ring",
    description: "Elegant ring outline effect on hover with smooth transition",
    style: {
      bgColor: ORANGE_PRIMARY,
      textColor: WHITE,
      borderWidth: 0,
      borderRadius: 6,
      hoverEffect: "ring-hover",
    },
  },
  {
    id: "neural",
    name: "Neural",
    description: "Futuristic button with animated border beam and scale effects",
    style: {
      bgColor: "#1A1A1A",
      textColor: WHITE,
      borderWidth: 0,
      borderRadius: 12,
      hoverEffect: "neural",
    },
  },
];

// Helper to get preset by ID
export function getPresetById(id: string): ButtonStylePreset | undefined {
  return BUTTON_STYLE_PRESETS.find(preset => preset.id === id);
}

// Helper to get all preset IDs
export function getAllPresetIds(): string[] {
  return BUTTON_STYLE_PRESETS.map(preset => preset.id);
}
