// Force dynamic rendering - page depends on database content
export const dynamic = "force-dynamic";

import { WidgetSectionsRenderer } from "@/components/landing-page/widget-sections-renderer";
import { NoTemplateFallback } from "@/components/templates/no-template-fallback";
import { MultiJsonLd } from "@/components/seo/json-ld";
import {
  generateOrganizationSchema,
  generateFAQSchema,
  generateProductSchema,
} from "@/lib/seo";
import { getHomeTemplate } from "@/lib/templates/get-template";

const homepageFaqs = [
  {
    question: "What is Ceremoney?",
    answer:
      "Ceremoney is a Swedish wedding planning SaaS that helps couples and professional planners organize every aspect of their celebration — guest list, seating charts, event website with RSVP, vendor coordination, and budget tracking — all in one place.",
  },
  {
    question: "Is Ceremoney free to use?",
    answer:
      "Yes! Our Basic plan is free forever and includes one event, up to 50 guests, a wedding website with online RSVP, and access to the vendor directory. Upgrade to Premium or Elite when you need more guests, advanced features, or a custom domain.",
  },
  {
    question: "How does online RSVP work?",
    answer:
      "Your Ceremoney wedding website includes a built-in RSVP form. Guests visit your site and confirm attendance, meal preferences, and plus-ones. All responses sync instantly to your guest list and seating chart — no manual data entry needed.",
  },
  {
    question: "Can I manage seating for a large wedding?",
    answer:
      "Absolutely. Our drag-and-drop seating chart editor supports any venue layout and any number of tables. Assign guests to seats, spot conflicts instantly, and export a print-ready PDF for your venue coordinator.",
  },
  {
    question: "Does Ceremoney support Swedish and Arabic?",
    answer:
      "Yes. Ceremoney is fully available in Swedish and includes right-to-left (RTL) layout support for Arabic. Switch your language preference at any time from your account settings.",
  },
];

export default async function HomePage() {
  // Try to get the assigned HOME template
  const template = await getHomeTemplate();

  return (
    <>
      <MultiJsonLd
        data={[
          generateOrganizationSchema(),
          generateFAQSchema(homepageFaqs),
          generateProductSchema({
            name: "Ceremoney Wedding Planning",
            description:
              "Wedding planning platform for couples and professional planners. Includes guest management, seating charts, event website with RSVP, and vendor coordination.",
            price: 0,
            url: "/pricing",
            reviews: { rating: 4.9, count: 1247 },
          }),
        ]}
      />

      {template ? (
        // Render the assigned template
        <WidgetSectionsRenderer sections={template.sections} />
      ) : (
        // No template assigned - show setup guide for admins, coming soon for visitors
        <NoTemplateFallback pageType="home" />
      )}
    </>
  );
}
