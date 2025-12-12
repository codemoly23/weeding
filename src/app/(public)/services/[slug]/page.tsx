import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, X, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getServiceForm } from "@/lib/data/service-forms";
import { cn } from "@/lib/utils";
import { MultiJsonLd } from "@/components/seo/json-ld";
import {
  generateServiceSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
} from "@/lib/seo";
import { ServiceIcon } from "@/components/ui/service-icon";
import prisma from "@/lib/db";

// Force dynamic rendering to avoid SSG issues with client components
export const dynamic = "force-dynamic";

interface ServiceData {
  id: string;
  slug: string;
  name: string;
  shortDesc: string;
  description: string;
  icon: string | null;
  image: string | null;
  startingPrice: number;
  processingTime: string | null;
  isPopular: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  features: string[];
  packages: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    isPopular: boolean;
    features: string[];
    notIncluded: string[];
  }[];
  faqs: {
    id: string;
    question: string;
    answer: string;
  }[];
}

interface RelatedService {
  id: string;
  slug: string;
  name: string;
  shortDesc: string;
  icon: string | null;
  startingPrice: number;
}

async function getService(slug: string): Promise<ServiceData | null> {
  try {
    const service = await prisma.service.findUnique({
      where: { slug, isActive: true },
      include: {
        features: {
          orderBy: { sortOrder: "asc" },
          select: { text: true },
        },
        packages: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: {
            features: {
              orderBy: { sortOrder: "asc" },
              select: { text: true },
            },
            notIncluded: {
              orderBy: { sortOrder: "asc" },
              select: { text: true },
            },
          },
        },
        faqs: {
          orderBy: { sortOrder: "asc" },
          select: { id: true, question: true, answer: true },
        },
      },
    });

    if (!service) return null;

    return {
      id: service.id,
      slug: service.slug,
      name: service.name,
      shortDesc: service.shortDesc,
      description: service.description,
      icon: service.icon,
      image: service.image,
      startingPrice: Number(service.startingPrice),
      processingTime: service.processingTime,
      isPopular: service.isPopular,
      metaTitle: service.metaTitle,
      metaDescription: service.metaDescription,
      features: service.features.map((f) => f.text),
      packages: service.packages.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: Number(p.priceUSD),
        isPopular: p.isPopular,
        features: p.features.map((f) => f.text),
        notIncluded: p.notIncluded.map((n) => n.text),
      })),
      faqs: service.faqs,
    };
  } catch (error) {
    console.error("Error fetching service:", error);
    return null;
  }
}

async function getRelatedServices(
  currentSlug: string,
  limit: number = 4
): Promise<RelatedService[]> {
  try {
    const services = await prisma.service.findMany({
      where: {
        isActive: true,
        slug: { not: currentSlug },
      },
      select: {
        id: true,
        slug: true,
        name: true,
        shortDesc: true,
        icon: true,
        startingPrice: true,
      },
      orderBy: [{ isPopular: "desc" }, { sortOrder: "asc" }],
      take: limit,
    });

    return services.map((s) => ({
      ...s,
      startingPrice: Number(s.startingPrice),
    }));
  } catch (error) {
    console.error("Error fetching related services:", error);
    return [];
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);

  if (!service) {
    return { title: "Service Not Found" };
  }

  return {
    title: service.metaTitle || service.name,
    description: service.metaDescription || service.shortDesc,
  };
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params;
  const service = await getService(slug);

  if (!service) {
    notFound();
  }

  const relatedServices = await getRelatedServices(slug);

  // Determine checkout URL based on whether service has a form config
  const hasFormConfig = getServiceForm(service.slug) !== undefined;
  const checkoutBaseUrl = hasFormConfig
    ? `/checkout/${service.slug}`
    : `/checkout?service=${service.slug}`;

  const schemaData: Record<string, unknown>[] = [
    generateServiceSchema({
      name: service.name,
      description: service.shortDesc,
      price: service.startingPrice,
      url: `/services/${service.slug}`,
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Services", url: "/services" },
      { name: service.name, url: `/services/${service.slug}` },
    ]),
  ];

  if (service.faqs.length > 0) {
    schemaData.push(
      generateFAQSchema(
        service.faqs.map((f) => ({ question: f.question, answer: f.answer }))
      )
    );
  }

  return (
    <div className="py-12 lg:py-20">
      <MultiJsonLd data={schemaData} />
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/services"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Services
          </Link>
        </div>

        {/* Hero Section */}
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ServiceIcon name={service.icon || "Package"} className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              {service.name}
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
              {service.shortDesc}
            </p>

            {/* Features */}
            {service.features.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold text-foreground">
                  What&apos;s Included
                </h3>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA */}
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href={checkoutBaseUrl}>
                  Get Started - From ${service.startingPrice}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Ask a Question</Link>
              </Button>
            </div>
          </div>

          {/* Packages */}
          {service.packages.length > 0 && (
            <div className="space-y-4">
              {service.packages.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={cn(
                    "relative",
                    pkg.isPopular && "border-primary ring-1 ring-primary"
                  )}
                >
                  {pkg.isPopular && (
                    <Badge className="absolute -top-3 right-4 bg-primary">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader>
                    <div className="flex items-baseline justify-between">
                      <CardTitle>{pkg.name}</CardTitle>
                      <div>
                        <span className="text-3xl font-bold">${pkg.price}</span>
                        {pkg.description?.includes("year") && (
                          <span className="text-sm text-muted-foreground">
                            /year
                          </span>
                        )}
                      </div>
                    </div>
                    {pkg.description && (
                      <CardDescription>{pkg.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                      {pkg.notIncluded.map((feature, index) => (
                        <li
                          key={`not-${index}`}
                          className="flex items-center gap-2 text-muted-foreground/60"
                        >
                          <X className="h-4 w-4" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={pkg.isPopular ? "default" : "outline"}
                      asChild
                    >
                      <Link
                        href={
                          hasFormConfig
                            ? `/checkout/${service.slug}?package=${pkg.name.toLowerCase()}`
                            : `/checkout?service=${service.slug}&package=${pkg.name.toLowerCase()}`
                        }
                      >
                        Select {pkg.name}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mt-16 max-w-3xl">
          <h2 className="text-2xl font-bold">About This Service</h2>
          <div
            className="prose prose-slate mt-4 max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: service.description }}
          />
        </div>

        {/* FAQs */}
        {service.faqs.length > 0 && (
          <div className="mt-16 max-w-3xl">
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="mt-6">
              {service.faqs.map((faq, index) => (
                <AccordionItem key={faq.id} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {/* Related Services */}
        {relatedServices.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold">Related Services</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedServices.map((relatedService) => (
                  <Link
                    key={relatedService.slug}
                    href={`/services/${relatedService.slug}`}
                  >
                    <Card className="group h-full transition-all hover:border-primary">
                      <CardHeader className="pb-2">
                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <ServiceIcon name={relatedService.icon || "Package"} className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-base">
                          {relatedService.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {relatedService.shortDesc}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-primary">
                          From ${relatedService.startingPrice}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
