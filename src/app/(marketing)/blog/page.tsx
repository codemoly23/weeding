export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { WidgetSectionsRenderer } from "@/components/landing-page/widget-sections-renderer";
import { NoTemplateFallback } from "@/components/templates/no-template-fallback";
import { getBlogListTemplate } from "@/lib/templates/get-template";

export const metadata: Metadata = {
  title: "Blog - LLC Formation Guides & Business Tips",
  description:
    "Expert guides on US LLC formation, EIN applications, Amazon selling, business banking, and tips for international entrepreneurs. Stay informed with LLCPad.",
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
