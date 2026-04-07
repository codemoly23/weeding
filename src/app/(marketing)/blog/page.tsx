export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { WidgetSectionsRenderer } from "@/components/landing-page/widget-sections-renderer";
import { NoTemplateFallback } from "@/components/templates/no-template-fallback";
import { getBlogListTemplate } from "@/lib/templates/get-template";

export const metadata: Metadata = {
  title: "Blog - Wedding Planning Tips & Event Guides",
  description:
    "Expert guides on wedding planning, guest management, seating charts, vendor selection, and tips for planning your perfect event. Stay inspired with Ceremoney.",
};

export default async function BlogPage() {
  const template = await getBlogListTemplate();

  return (
    <>
      {template ? (
        <WidgetSectionsRenderer sections={template.sections} />
      ) : (
        <NoTemplateFallback pageType="blog_list" />
      )}
    </>
  );
}
