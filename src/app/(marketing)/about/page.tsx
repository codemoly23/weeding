export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { WidgetSectionsRenderer } from "@/components/landing-page/widget-sections-renderer";
import { NoTemplateFallback } from "@/components/templates/no-template-fallback";
import { getAboutTemplate } from "@/lib/templates/get-template";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about LLCPad - the trusted partner for international entrepreneurs starting US businesses. Over 10,000 LLCs formed for clients in 50+ countries.",
};

export default async function AboutPage() {
  const template = await getAboutTemplate();

  return (
    <>
      {template ? (
        <WidgetSectionsRenderer sections={template.sections} />
      ) : (
        <NoTemplateFallback pageType="about" />
      )}
    </>
  );
}
