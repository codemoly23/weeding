import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { generateLocalBusinessSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with LLCPad. Have questions about US LLC formation, EIN application, or Amazon seller services? Our team is here to help.",
  keywords: [
    "contact LLCPad",
    "LLC formation support",
    "business formation help",
    "customer service",
  ],
  openGraph: {
    title: "Contact Us | LLCPad",
    description:
      "Get in touch with LLCPad. Have questions about US LLC formation, EIN application, or Amazon seller services? Our team is here to help.",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={generateLocalBusinessSchema()} />
      {children}
    </>
  );
}
