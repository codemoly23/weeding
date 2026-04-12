export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { WidgetSectionsRenderer } from "@/components/landing-page/widget-sections-renderer";
import { NoTemplateFallback } from "@/components/templates/no-template-fallback";
import { getPricingTemplate } from "@/lib/templates/get-template";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for Ceremoney wedding planning. Start free, upgrade when you need more. Plans in SEK — Basic (free), Premium, Elite, and White-Label.",
};

export default async function PricingPage() {
  const template = await getPricingTemplate();

  return (
    <>
      {template ? (
        <WidgetSectionsRenderer sections={template.sections} />
      ) : (
        <NoTemplateFallback pageType="pricing" />
      )}
    </>
  );
}
