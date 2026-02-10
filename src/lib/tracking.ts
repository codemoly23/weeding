/**
 * Tracking Settings Server Utility
 *
 * Fetches tracking configuration from the TrackingSettings model.
 * Uses React cache() for request-level memoization in Server Components.
 */

import { cache } from "react";
import prisma from "@/lib/db";

export interface TrackingConfig {
  gtmEnabled: boolean;
  gtmContainerId: string | null;
  gtmTrackForms: boolean;
  gtmTrackPages: boolean;
  fbPixelEnabled: boolean;
  fbPixelId: string | null;
  fbTrackLead: boolean;
  fbTrackPageView: boolean;
  fbTrackContent: boolean;
  gadsEnabled: boolean;
  gadsConversionId: string | null;
  gadsConversionLabel: string | null;
  gadsDefaultValue: number | null;
}

export const getTrackingSettings = cache(async (): Promise<TrackingConfig | null> => {
  try {
    const settings = await prisma.trackingSettings.findFirst();
    if (!settings) return null;

    return {
      gtmEnabled: settings.gtmEnabled,
      gtmContainerId: settings.gtmContainerId,
      gtmTrackForms: settings.gtmTrackForms,
      gtmTrackPages: settings.gtmTrackPages,
      fbPixelEnabled: settings.fbPixelEnabled,
      fbPixelId: settings.fbPixelId,
      fbTrackLead: settings.fbTrackLead,
      fbTrackPageView: settings.fbTrackPageView,
      fbTrackContent: settings.fbTrackContent,
      gadsEnabled: settings.gadsEnabled,
      gadsConversionId: settings.gadsConversionId,
      gadsConversionLabel: settings.gadsConversionLabel,
      gadsDefaultValue: settings.gadsDefaultValue,
    };
  } catch (error) {
    console.error("Error fetching tracking settings:", error);
    return null;
  }
});
