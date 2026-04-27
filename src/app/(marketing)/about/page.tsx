export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { WidgetSectionsRenderer } from "@/components/landing-page/widget-sections-renderer";
import { AboutPageContent } from "@/components/about/about-page-content";
import { getAboutTemplate } from "@/lib/templates/get-template";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Ceremoney — the wedding and event planning platform helping couples and hosts create unforgettable moments. Trusted by thousands across Sweden and beyond.",
};

export default async function AboutPage() {
  const template = await getAboutTemplate();

  if (template) {
    return <WidgetSectionsRenderer sections={template.sections} />;
  }

  return <AboutPageContent />;
}
