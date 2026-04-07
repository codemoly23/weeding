import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { generateLocalBusinessSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Ceremoney. Have questions about wedding planning, vendor listings, or your subscription? Our team is here to help.",
  keywords: [
    "contact Ceremoney",
    "wedding planning support",
    "event planning help",
    "customer service",
  ],
  openGraph: {
    title: "Contact Us | Ceremoney",
    description:
      "Get in touch with Ceremoney. Have questions about wedding planning, vendor listings, or your subscription? Our team is here to help.",
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
