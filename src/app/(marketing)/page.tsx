import prisma from "@/lib/db";
import { PageRenderer } from "@/components/landing-page/page-renderer";
import { WidgetSectionsRenderer } from "@/components/landing-page/widget-sections-renderer";
import { Hero } from "@/components/sections/hero";
import { ServicesGrid } from "@/components/sections/services-grid";
import { HowItWorks } from "@/components/sections/how-it-works";
import { PricingTable } from "@/components/sections/pricing-table";
import { Testimonials } from "@/components/sections/testimonials";
import { BlogSection } from "@/components/sections/blog-section";
import { FAQSection } from "@/components/sections/faq-section";
import { CTASection } from "@/components/sections/cta-section";
import { JsonLd, MultiJsonLd } from "@/components/seo/json-ld";
import {
  generateOrganizationSchema,
  generateFAQSchema,
  generateProductSchema,
} from "@/lib/seo";
import type { Section } from "@/lib/page-builder/types";

const homepageFaqs = [
  {
    question: "How long does it take to form an LLC?",
    answer:
      "Standard LLC formation typically takes 3-5 business days after state filing. With our expedited service, you can have your LLC formed within 24 hours.",
  },
  {
    question: "Do I need to be a US citizen to form an LLC?",
    answer:
      "No, you do not need to be a US citizen or resident to form an LLC in the United States. International entrepreneurs from any country can form a US LLC.",
  },
  {
    question: "What is an EIN and do I need one?",
    answer:
      "An EIN (Employer Identification Number) is a tax ID for your business, similar to a Social Security Number for individuals. You'll need an EIN to open a business bank account, hire employees, and file taxes.",
  },
  {
    question: "Which state is best for forming an LLC?",
    answer:
      "Wyoming, Delaware, and New Mexico are popular choices for LLC formation due to their business-friendly laws, low fees, and privacy protections. Wyoming is often the best choice for small businesses and international entrepreneurs.",
  },
  {
    question: "What documents will I receive after LLC formation?",
    answer:
      "You'll receive your Articles of Organization, Operating Agreement, EIN confirmation letter (if ordered), and all state filing receipts. All documents are delivered digitally to your dashboard.",
  },
];

const HOMEPAGE_SLUG = "homepage";
const WIDGET_BLOCK_TYPE = "widget-page-sections";

/**
 * Fetch widget page builder sections from the database
 */
async function getWidgetSections(): Promise<Section[]> {
  try {
    const page = await prisma.landingPage.findUnique({
      where: { slug: HOMEPAGE_SLUG },
      include: {
        blocks: {
          where: { type: WIDGET_BLOCK_TYPE, isActive: true },
        },
      },
    });

    if (!page || page.blocks.length === 0) {
      return [];
    }

    const widgetBlock = page.blocks.find((b) => b.type === WIDGET_BLOCK_TYPE);
    const sections = widgetBlock?.settings as Section[] | null;

    return Array.isArray(sections) ? sections : [];
  } catch (error) {
    console.error("Error fetching widget sections:", error);
    return [];
  }
}

/**
 * Fetch the default landing page with its blocks
 * Falls back to null if no default page exists
 */
async function getDefaultLandingPage() {
  try {
    const page = await prisma.landingPage.findFirst({
      where: {
        isDefault: true,
        isActive: true,
      },
      include: {
        blocks: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return page;
  } catch (error) {
    console.error("Error fetching landing page:", error);
    return null;
  }
}

export default async function HomePage() {
  // Fetch widget page builder sections (new system)
  const widgetSections = await getWidgetSections();

  // Fetch old block-based landing page content (fallback)
  const landingPage = await getDefaultLandingPage();

  // Priority: Widget sections > Old blocks > Static components
  const useWidgetSections = widgetSections.length > 0;
  const useOldBlocks =
    !useWidgetSections &&
    landingPage &&
    landingPage.blocks.length > 0 &&
    landingPage.blocks.some((b) => b.type.startsWith("hero"));

  return (
    <>
      <MultiJsonLd
        data={[
          generateOrganizationSchema(),
          generateFAQSchema(homepageFaqs),
          generateProductSchema({
            name: "LLC Formation Service",
            description:
              "Professional US LLC formation service for international entrepreneurs. Includes state filing, registered agent, and operating agreement.",
            price: 149,
            url: "/services/llc-formation",
            reviews: { rating: 4.9, count: 1247 },
          }),
        ]}
      />

      {useWidgetSections ? (
        <>
          {/* Render widget page builder sections */}
          <WidgetSectionsRenderer sections={widgetSections} />
          {/* Static sections below hero */}
          <ServicesGrid />
          <HowItWorks />
          <PricingTable />
          <Testimonials />
          <FAQSection />
          <CTASection />
        </>
      ) : useOldBlocks ? (
        <>
          {/* Render old hero blocks from database */}
          <PageRenderer
            blocks={landingPage!.blocks.filter((b) => b.type.startsWith("hero"))}
          />
          {/* Static sections */}
          <ServicesGrid />
          <HowItWorks />
          <PricingTable />
          <Testimonials />
          <FAQSection />
          <CTASection />
        </>
      ) : (
        <>
          {/* Fallback to static components */}
          <Hero />
          <ServicesGrid />
          <HowItWorks />
          <PricingTable />
          <Testimonials />
          <FAQSection />
          <CTASection />
        </>
      )}
    </>
  );
}
