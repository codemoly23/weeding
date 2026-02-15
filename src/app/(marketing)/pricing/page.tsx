export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { WidgetSectionsRenderer } from "@/components/landing-page/widget-sections-renderer";
import { NoTemplateFallback } from "@/components/templates/no-template-fallback";
import { getPricingTemplate } from "@/lib/templates/get-template";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Transparent pricing for US LLC formation services. No hidden fees. Choose from Basic, Standard, or Premium packages starting at $199.",
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
