// Force dynamic rendering - page depends on database content
export const dynamic = "force-dynamic";

import { WidgetSectionsRenderer } from "@/components/landing-page/widget-sections-renderer";
import { NoTemplateFallback } from "@/components/templates/no-template-fallback";
import { getHomeTemplate } from "@/lib/templates/get-template";

export default async function HomePath() {
  const template = await getHomeTemplate();

  return template ? (
    <WidgetSectionsRenderer sections={template.sections} />
  ) : (
    <NoTemplateFallback pageType="home" />
  );
}
