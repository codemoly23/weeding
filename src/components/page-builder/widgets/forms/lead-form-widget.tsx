"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import type { LeadFormWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_LEAD_FORM_SETTINGS } from "@/lib/page-builder/defaults";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";
import { trackLeadFormSubmit } from "@/lib/tracking-events";

// Helper function to darken a hex color
function darkenColor(hex: string, percent: number): string {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const darken = (value: number) => Math.max(0, Math.floor(value * (1 - percent / 100)));
  const toHex = (value: number) => value.toString(16).padStart(2, "0");
  return `#${toHex(darken(r))}${toHex(darken(g))}${toHex(darken(b))}`;
}

// Get UTM parameters from URL
function getUTMParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  if (params.get("utm_source")) utm.utmSource = params.get("utm_source")!;
  if (params.get("utm_medium")) utm.utmMedium = params.get("utm_medium")!;
  if (params.get("utm_campaign")) utm.utmCampaign = params.get("utm_campaign")!;
  if (params.get("utm_term")) utm.utmTerm = params.get("utm_term")!;
  if (params.get("utm_content")) utm.utmContent = params.get("utm_content")!;
  return utm;
}

interface LeadFormWidgetProps {
  settings: Partial<LeadFormWidgetSettings>;
  isPreview?: boolean;
  formInstanceSlug?: string;
  formInstanceId?: string;
}

export function LeadFormWidget({
  settings: partialSettings,
  isPreview,
  formInstanceSlug,
  formInstanceId,
}: LeadFormWidgetProps) {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectValues, setSelectValues] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  // Merge with defaults
  const settings: LeadFormWidgetSettings = {
    ...DEFAULT_LEAD_FORM_SETTINGS,
    ...partialSettings,
  };

  const {
    title,
    description,
    fields,
    submitButton,
    backgroundColor,
    titleColor,
    descriptionColor,
    labelColor,
    inputTextColor,
    padding,
    borderRadius,
    shadow,
  } = settings;

  // Get button styles
  const buttonStyle = submitButton.style || {};
  const buttonBgColor = buttonStyle.bgColor || "#f97316";
  const buttonHoverBgColor = darkenColor(buttonBgColor, 15);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPreview) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const data: Record<string, unknown> = {};

      // Map form fields to lead fields
      fields.forEach((field) => {
        const value = field.type === "select"
          ? selectValues[field.name]
          : formData.get(field.name);

        if (value) {
          // Map common field names to Lead model fields
          const fieldMapping: Record<string, string> = {
            name: "firstName", // Split name later if needed
            first_name: "firstName",
            firstName: "firstName",
            last_name: "lastName",
            lastName: "lastName",
            email: "email",
            phone: "phone",
            company: "company",
            country: "country",
            city: "city",
            service: "interestedIn",
            services: "interestedIn",
            interest: "interestedIn",
            interested_in: "interestedIn",
            budget: "budget",
            timeline: "timeline",
            message: "message",
          };

          const mappedField = fieldMapping[field.name] || field.name;

          // Handle name field (split into first/last)
          if (field.name === "name" && typeof value === "string") {
            const parts = value.trim().split(" ");
            data.firstName = parts[0];
            if (parts.length > 1) {
              data.lastName = parts.slice(1).join(" ");
            }
          } else if (mappedField === "interestedIn") {
            // Ensure interestedIn is always an array
            data.interestedIn = typeof value === "string" ? [value] : value;
          } else {
            data[mappedField] = value;
          }
        }
      });

      // Add UTM parameters
      const utmParams = getUTMParams();
      Object.assign(data, utmParams);

      // Add form instance info
      if (formInstanceSlug) data.formInstanceSlug = formInstanceSlug;
      if (formInstanceId) data.formInstanceId = formInstanceId;

      // Add source detail (current page URL)
      data.sourceDetail = typeof window !== "undefined" ? window.location.pathname : undefined;

      // Submit to API
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit form");
      }

      // Fire tracking events (GTM, FB Pixel, Google Ads)
      if (result.trackingData) {
        trackLeadFormSubmit(result.trackingData);
      }

      setIsSubmitted(true);

      // Reset form after showing success
      if (formRef.current) {
        formRef.current.reset();
        setSelectValues({});
      }
    } catch (err) {
      console.error("Form submission error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show success message
  if (isSubmitted) {
    return (
      <div
        className={cn("w-full", shadow && "shadow-lg")}
        style={{
          backgroundColor: backgroundColor || "transparent",
          padding: `${padding}px`,
          borderRadius: `${borderRadius}px`,
        }}
      >
        <div className="text-center py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3
            className="text-xl font-semibold mb-2"
            style={{ color: titleColor || "#ffffff" }}
          >
            Thank You!
          </h3>
          <p
            className="text-sm"
            style={{ color: descriptionColor || "#94a3b8" }}
          >
            We&apos;ve received your information and will get back to you shortly.
          </p>
          <Button
            variant="link"
            onClick={() => setIsSubmitted(false)}
            className="mt-4"
            style={{ color: buttonBgColor }}
          >
            Submit another response
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("w-full", shadow && "shadow-lg")}
      style={{
        backgroundColor: backgroundColor || "transparent",
        padding: `${padding}px`,
        borderRadius: `${borderRadius}px`,
      }}
    >
      {/* Title */}
      {title && (
        <h3
          className="text-xl font-semibold mb-2"
          style={{ color: titleColor || "#ffffff" }}
        >
          {title}
        </h3>
      )}

      {/* Description */}
      {description && (
        <p
          className="text-sm mb-6"
          style={{ color: descriptionColor || "#94a3b8" }}
        >
          {description}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Form Fields */}
      <form ref={formRef} className="space-y-4" onSubmit={handleSubmit}>
        {fields.map((field) => (
          <div key={field.id} className="space-y-1.5">
            <Label
              htmlFor={field.id}
              className="text-sm font-medium"
              style={{ color: labelColor || "#e2e8f0" }}
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>

            {field.type === "text" && (
              <Input
                id={field.id}
                type="text"
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
                disabled={isPreview || isSubmitting}
                className="bg-slate-800/50 border-slate-700 placeholder:text-slate-500 focus:border-primary focus:ring-primary"
                style={{ color: inputTextColor || "#ffffff" }}
              />
            )}

            {field.type === "email" && (
              <Input
                id={field.id}
                type="email"
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
                disabled={isPreview || isSubmitting}
                className="bg-slate-800/50 border-slate-700 placeholder:text-slate-500 focus:border-primary focus:ring-primary"
                style={{ color: inputTextColor || "#ffffff" }}
              />
            )}

            {field.type === "phone" && (
              <Input
                id={field.id}
                type="tel"
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
                disabled={isPreview || isSubmitting}
                className="bg-slate-800/50 border-slate-700 placeholder:text-slate-500 focus:border-primary focus:ring-primary"
                style={{ color: inputTextColor || "#ffffff" }}
              />
            )}

            {field.type === "select" && (
              <Select
                disabled={isPreview || isSubmitting}
                value={selectValues[field.name] || ""}
                onValueChange={(value) => setSelectValues(prev => ({ ...prev, [field.name]: value }))}
              >
                <SelectTrigger
                  className="bg-slate-800/50 border-slate-700"
                  style={{ color: inputTextColor || "#ffffff" }}
                >
                  <SelectValue placeholder={field.placeholder || "Select..."} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option, idx) => (
                    <SelectItem key={idx} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {field.type === "textarea" && (
              <Textarea
                id={field.id}
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
                disabled={isPreview || isSubmitting}
                rows={4}
                className="bg-slate-800/50 border-slate-700 placeholder:text-slate-500 focus:border-primary focus:ring-primary resize-none"
                style={{ color: inputTextColor || "#ffffff" }}
              />
            )}
          </div>
        ))}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isPreview || isSubmitting}
          className={cn(
            "transition-all duration-200 cursor-pointer",
            submitButton.fullWidth && "w-full"
          )}
          style={{
            backgroundColor: isButtonHovered && !isSubmitting ? buttonHoverBgColor : buttonBgColor,
            color: buttonStyle.textColor || "#ffffff",
            borderRadius: buttonStyle.borderRadius
              ? `${buttonStyle.borderRadius}px`
              : undefined,
            transform: isButtonHovered && !isSubmitting ? "translateY(-2px)" : "translateY(0)",
            boxShadow: isButtonHovered && !isSubmitting
              ? "0 4px 12px rgba(0, 0, 0, 0.15)"
              : "none",
          }}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            submitButton.text
          )}
        </Button>
      </form>
    </div>
  );
}
