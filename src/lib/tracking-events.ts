/**
 * Client-side Tracking Event Helpers
 *
 * Fire events to GTM dataLayer, Facebook Pixel, and Google Ads
 * after successful lead form submissions.
 */

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

interface LeadFormTrackingData {
  event?: string;
  leadId?: string;
  score?: number;
  service?: string | null;
  source?: string;
  [key: string]: unknown;
}

/**
 * Track a lead form submission across all configured tracking platforms.
 * Call this after receiving a successful API response from /api/leads.
 */
export function trackLeadFormSubmit(trackingData: LeadFormTrackingData) {
  if (typeof window === "undefined") return;

  // Google Tag Manager / dataLayer
  if (window.dataLayer) {
    window.dataLayer.push({
      event: trackingData.event || "lead_form_submit",
      ...trackingData,
    });
  }

  // Facebook Pixel
  if (window.fbq) {
    window.fbq("track", "Lead", {
      content_name: trackingData.service || "general",
      content_category: "lead_form",
      value: trackingData.score || 0,
      currency: "USD",
    });
  }

  // Google Ads
  if (window.gtag) {
    window.gtag("event", "conversion", {
      send_to: trackingData.gadsConversionLabel || undefined,
      value: trackingData.score || 0,
      currency: "USD",
    });
  }
}
