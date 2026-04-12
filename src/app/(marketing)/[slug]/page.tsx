import { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { WidgetSectionsRenderer } from "@/components/landing-page/widget-sections-renderer";
import type { Section } from "@/lib/page-builder/types";
import { DEFAULT_COLUMN_SETTINGS } from "@/lib/page-builder/defaults";

// Force dynamic rendering - these pages depend on database content
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Reserved slugs that have their own routes
const RESERVED_SLUGS = [
  "about",
  "blog",
  "contact",
  "disclaimer",
  "faq",
  "llc",
  "pricing",
  "privacy",
  "refund-policy",
  "services",
  "terms",
  "login",
  "register",
  "dashboard",
  "admin",
  "checkout",
  "search",
];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // Don't generate metadata for reserved slugs
  if (RESERVED_SLUGS.includes(slug)) {
    return {};
  }

  // First check LandingPage (Page Builder pages)
  const landingPage = await prisma.landingPage.findUnique({
    where: { slug, isActive: true },
    select: { metaTitle: true, metaDescription: true, name: true },
  });

  if (landingPage) {
    return {
      title: landingPage.metaTitle || `${landingPage.name} | Ceremoney`,
      description: landingPage.metaDescription || `${landingPage.name} - Ceremoney`,
    };
  }

  // Fallback to LegalPage
  const legalPage = await prisma.legalPage.findUnique({
    where: { slug, isActive: true },
    select: { metaTitle: true, metaDescription: true, title: true },
  });

  if (!legalPage) {
    return {
      title: "Page Not Found | Ceremoney",
    };
  }

  return {
    title: legalPage.metaTitle || `${legalPage.title} | Ceremoney`,
    description: legalPage.metaDescription || `${legalPage.title} - Ceremoney`,
  };
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;

  // Don't handle reserved slugs - they have their own routes
  if (RESERVED_SLUGS.includes(slug)) {
    notFound();
  }

  // First check LandingPage (Page Builder pages)
  const landingPage = await prisma.landingPage.findUnique({
    where: { slug, isActive: true },
    include: {
      blocks: {
        where: { type: "widget-page-sections", isActive: true },
        select: { settings: true },
      },
    },
  });

  if (landingPage) {
    // Get sections from the widget-page-sections block
    const sectionsBlock = landingPage.blocks[0];
    const rawSections = (sectionsBlock?.settings as unknown as Section[]) || [];
    const sections = rawSections.map((s) => ({
      ...s,
      columns: s.columns.map((col) => ({
        ...col,
        settings: { ...DEFAULT_COLUMN_SETTINGS, ...col.settings },
      })),
    }));

    return <WidgetSectionsRenderer sections={sections} />;
  }

  // Fallback to LegalPage
  const legalPage = await prisma.legalPage.findUnique({
    where: { slug, isActive: true },
  });

  if (!legalPage) {
    notFound();
  }

  return (
    <div className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <Badge variant="secondary" className="mb-4">Page</Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              {legalPage.title}
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">
              Last updated: {formatDate(legalPage.updatedAt)}
            </p>
          </div>

          {/* Content */}
          <div
            className="prose prose-gray dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: legalPage.content }}
          />
        </div>
      </div>
    </div>
  );
}

