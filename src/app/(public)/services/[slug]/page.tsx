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
import { services, getServiceBySlug, getAllServiceSlugs } from "@/lib/data/services";
import { cn } from "@/lib/utils";
import { MultiJsonLd } from "@/components/seo/json-ld";
import {
  generateServiceSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
} from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllServiceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    return { title: "Service Not Found" };
  }

  return {
    title: service.name,
    description: service.shortDesc,
  };
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const Icon = service.icon;

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
    schemaData.push(generateFAQSchema(service.faqs));
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
              <Icon className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              {service.name}
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
              {service.shortDesc}
            </p>

            {/* Features */}
            <div className="mt-8">
              <h3 className="font-semibold text-foreground">What's Included</h3>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href={`/checkout?service=${service.slug}`}>
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
          <div className="space-y-4">
            {service.packages.map((pkg) => (
              <Card
                key={pkg.name}
                className={cn(
                  "relative",
                  pkg.popular && "border-primary ring-1 ring-primary"
                )}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-3 right-4 bg-primary">
                    Most Popular
                  </Badge>
                )}
                <CardHeader>
                  <div className="flex items-baseline justify-between">
                    <CardTitle>{pkg.name}</CardTitle>
                    <div>
                      <span className="text-3xl font-bold">${pkg.price}</span>
                      {pkg.description.includes("year") && (
                        <span className="text-sm text-muted-foreground">
                          /year
                        </span>
                      )}
                    </div>
                  </div>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                    {pkg.notIncluded?.map((feature) => (
                      <li
                        key={feature}
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
                    variant={pkg.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link
                      href={`/checkout?service=${service.slug}&package=${pkg.name.toLowerCase()}`}
                    >
                      Select {pkg.name}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
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
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {/* Related Services */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold">Related Services</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services
              .filter((s) => s.slug !== service.slug)
              .slice(0, 4)
              .map((relatedService) => {
                const RelatedIcon = relatedService.icon;
                return (
                  <Link
                    key={relatedService.slug}
                    href={`/services/${relatedService.slug}`}
                  >
                    <Card className="group h-full transition-all hover:border-primary">
                      <CardHeader className="pb-2">
                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <RelatedIcon className="h-5 w-5" />
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
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
