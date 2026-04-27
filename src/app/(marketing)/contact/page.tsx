export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { WidgetSectionsRenderer } from "@/components/landing-page/widget-sections-renderer";
import { ContactPageContent } from "@/components/contact/contact-page-content";
import { getContactTemplate } from "@/lib/templates/get-template";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with our team. We're here to help with any questions about our services.",
};

export default async function ContactPage() {
  const template = await getContactTemplate();

  if (template) {
    return <WidgetSectionsRenderer sections={template.sections} />;
  }

  return <ContactPageContent />;
}
