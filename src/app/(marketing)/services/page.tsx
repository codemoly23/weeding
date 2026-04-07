// Force dynamic rendering - page depends on database content
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { WidgetSectionsRenderer } from "@/components/landing-page/widget-sections-renderer";
import { NoTemplateFallback } from "@/components/templates/no-template-fallback";
import { getServicesListTemplate } from "@/lib/templates/get-template";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore all Ceremoney features — guest list management, seating charts, wedding websites with RSVP, vendor directory, budget tracking, and more.",
};

export default async function ServicesPage() {
  const template = await getServicesListTemplate();

  return (
    <>
      {template ? (
        <WidgetSectionsRenderer sections={template.sections} />
      ) : (
        <NoTemplateFallback pageType="services_list" />
      )}
    </>
  );
}
