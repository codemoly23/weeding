import type { Metadata } from "next";
import Link from "next/link";
import { Search, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs, faqCategories, getFAQsByCategory } from "@/lib/data/faqs";
import { MultiJsonLd } from "@/components/seo/json-ld";
import { generateFAQSchema, generateBreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "FAQ - Frequently Asked Questions",
  description:
    "Find answers to common questions about US LLC formation, EIN application, business banking, Amazon seller accounts, and more. Get the information you need.",
  keywords: [
    "LLC FAQ",
    "LLC formation questions",
    "EIN FAQ",
    "business formation help",
    "Amazon seller FAQ",
    "international LLC",
  ],
  openGraph: {
    title: "FAQ - Frequently Asked Questions | LLCPad",
    description:
      "Find answers to common questions about US LLC formation, EIN application, business banking, Amazon seller accounts, and more.",
  },
};

export default function FAQPage() {
  const schemaData = [
    generateFAQSchema(
      faqs.map((faq) => ({ question: faq.question, answer: faq.answer }))
    ),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "FAQ", url: "/faq" },
    ]),
  ];

  return (
    <div className="py-16 lg:py-24">
      <MultiJsonLd data={schemaData} />

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            Help Center
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Find answers to common questions about US LLC formation, EIN
            application, business banking, and more.
          </p>
        </div>

        {/* Quick Links */}
        <div className="mx-auto mt-12 max-w-4xl">
          <div className="flex flex-wrap justify-center gap-2">
            {faqCategories.map((category) => (
              <a
                key={category.id}
                href={`#${category.id}`}
                className="rounded-full border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                {category.name}
              </a>
            ))}
          </div>
        </div>

        {/* FAQ Sections */}
        <div className="mx-auto mt-16 max-w-3xl space-y-12">
          {faqCategories.map((category) => {
            const categoryFaqs = getFAQsByCategory(category.id);
            if (categoryFaqs.length === 0) return null;

            return (
              <section key={category.id} id={category.id}>
                <h2 className="mb-6 text-2xl font-bold text-foreground">
                  {category.name}
                </h2>
                <Accordion type="single" collapsible className="w-full">
                  {categoryFaqs.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`${category.id}-${index}`}
                    >
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            );
          })}
        </div>

        {/* Still Have Questions */}
        <div className="mx-auto mt-16 max-w-2xl">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <MessageCircle className="h-6 w-6" />
              </div>
              <CardTitle>Still Have Questions?</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-6 text-muted-foreground">
                Can't find the answer you're looking for? Our team is here to
                help. Reach out and we'll get back to you within 24 hours.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild>
                  <Link href="/contact">Contact Us</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/support">Open Support Ticket</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Popular Services CTA */}
        <div className="mx-auto mt-16 max-w-4xl">
          <h2 className="mb-6 text-center text-2xl font-bold">
            Ready to Get Started?
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Link href="/services/llc-formation">
              <Card className="h-full transition-all hover:border-primary">
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold">LLC Formation</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    From $149 + state fee
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/services/ein-application">
              <Card className="h-full transition-all hover:border-primary">
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold">EIN Application</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    From $79
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/services/amazon-seller">
              <Card className="h-full transition-all hover:border-primary">
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold">Amazon Seller Setup</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    From $149
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
