import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import prisma from "@/lib/db";

// Fallback FAQs if database is empty
const fallbackFaqs = [
  {
    id: "1",
    question: "Is Ceremoney free to use?",
    answer:
      "Yes! Ceremoney offers a free Basic plan that includes an event website, basic RSVP form, checklist, and access to the vendor directory. Premium and Elite plans unlock advanced features like guest list management, seating chart editor, custom domain, stationery engine, and more.",
  },
  {
    id: "2",
    question: "What event types does Ceremoney support?",
    answer:
      "Ceremoney supports weddings, baptisms, parties (birthday, anniversary), and corporate events. Each event type has tailored components — for example, weddings include couple names, ceremony + reception layout, registry, and 'Our Story' widget. Baptisms include godparent widgets and religious elements.",
  },
  {
    id: "3",
    question: "Can guests RSVP online through Ceremoney?",
    answer:
      "Yes! Every event created on Ceremoney gets a beautiful mobile-first event website with an RSVP form. Guests can RSVP, indicate dietary requirements, add plus-ones, and leave messages in the guestbook. Premium and Elite plans offer advanced conditional RSVP forms.",
  },
  {
    id: "4",
    question: "How does the seating chart editor work?",
    answer:
      "The seating chart editor is a drag-and-drop canvas tool built with Konva.js. You can create tables, assign guests to seats, and visualize your entire venue layout. It's available on Premium and Elite plans. Elite users can also share QR codes so guests can look up their own seats.",
  },
  {
    id: "5",
    question: "Can I find and contact vendors through Ceremoney?",
    answer:
      "Yes! Ceremoney has a vendor directory with geo-search, category filters, and date availability. You can browse photographer, venue, florist, catering, and other vendors, view their portfolios and reviews, and send inquiries directly through the platform.",
  },
  {
    id: "6",
    question: "Does Ceremoney support Swedish (Swish) and international payments?",
    answer:
      "Yes. Ceremoney supports Stripe for global card payments, Swish for Swedish mobile payments, and Klarna for buy-now-pay-later options. All invoices include proper Swedish VAT (Moms 25%) and PDF receipts with Org.nr for Swedish users.",
  },
  {
    id: "7",
    question: "Can I collaborate with my partner or wedding planner?",
    answer:
      "Yes! Elite plan users can invite collaborators to their event project. Collaborators can view and edit the guest list with role-based permissions. Real-time sync keeps everyone up to date. White-label plan users (professional planners) can manage multiple events for their clients.",
  },
  {
    id: "8",
    question: "Is Arabic (RTL) supported?",
    answer:
      "Yes, Ceremoney fully supports Arabic with right-to-left (RTL) layout. You can create your entire event in Arabic, and guests will see a fully RTL experience on the event website. Swedish, English, and Arabic are all supported from launch.",
  },
];

async function getFAQs() {
  try {
    const faqs = await prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 8,
    });

    if (faqs.length === 0) {
      return fallbackFaqs;
    }

    return faqs;
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return fallbackFaqs;
  }
}

export async function FAQSection() {
  const faqs = await getFAQs();

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Section Header */}
          <div className="lg:col-span-1">
            <Badge variant="secondary" className="mb-4">
              FAQs
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-muted-foreground">
              Get answers to the most common questions about planning your
              wedding or event with Ceremoney.
            </p>
            <Button className="group mt-6" variant="outline" asChild>
              <Link href="/faq">
                View All FAQs
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          {/* FAQ Accordion */}
          <div className="lg:col-span-2">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={faq.id} value={`item-${index}`}>
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
        </div>
      </div>
    </section>
  );
}
