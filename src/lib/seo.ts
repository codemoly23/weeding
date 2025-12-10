import { Metadata } from "next";

const siteConfig = {
  name: "LLCPad",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://llcpad.com",
  description:
    "Start your US LLC in 24 hours. Professional LLC formation, EIN application, Amazon seller account setup, and business banking assistance for international entrepreneurs.",
  ogImage: "/og-image.jpg",
  links: {
    twitter: "https://twitter.com/llcpad",
    facebook: "https://facebook.com/llcpad",
  },
};

export function generateMetadata({
  title,
  description,
  keywords,
  image,
  noIndex = false,
  pathname = "",
}: {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
  pathname?: string;
}): Metadata {
  const url = `${siteConfig.url}${pathname}`;
  const ogImage = image || siteConfig.ogImage;

  return {
    title,
    description,
    keywords: keywords?.join(", "),
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    alternates: {
      canonical: url,
    },
  };
}

// Organization Schema
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "LLCPad",
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description: siteConfig.description,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-555-123-4567",
      contactType: "customer service",
      availableLanguage: ["English"],
    },
    sameAs: [siteConfig.links.twitter, siteConfig.links.facebook],
  };
}

// Service Schema
export function generateServiceSchema({
  name,
  description,
  price,
  image,
  url,
}: {
  name: string;
  description: string;
  price: number;
  image?: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    provider: {
      "@type": "Organization",
      name: "LLCPad",
      url: siteConfig.url,
    },
    offers: {
      "@type": "Offer",
      price: price.toString(),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    image: image || `${siteConfig.url}/og-image.jpg`,
    url: `${siteConfig.url}${url}`,
  };
}

// Product Schema for Packages
export function generateProductSchema({
  name,
  description,
  price,
  image,
  url,
  reviews,
}: {
  name: string;
  description: string;
  price: number;
  image?: string;
  url: string;
  reviews?: { rating: number; count: number };
}) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: image || `${siteConfig.url}/og-image.jpg`,
    url: `${siteConfig.url}${url}`,
    brand: {
      "@type": "Brand",
      name: "LLCPad",
    },
    offers: {
      "@type": "Offer",
      price: price.toString(),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "LLCPad",
      },
    },
  };

  if (reviews) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: reviews.rating.toString(),
      reviewCount: reviews.count.toString(),
    };
  }

  return schema;
}

// FAQ Schema
export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// Breadcrumb Schema
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.url}`,
    })),
  };
}

// Local Business Schema (for contact page)
export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "LLCPad",
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description: siteConfig.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: "1712 Pioneer Ave, Suite 500",
      addressLocality: "Cheyenne",
      addressRegion: "WY",
      postalCode: "82001",
      addressCountry: "US",
    },
    telephone: "+1-555-123-4567",
    email: "support@llcpad.com",
    priceRange: "$99 - $599",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
  };
}

// WebPage Schema
export function generateWebPageSchema({
  title,
  description,
  url,
}: {
  title: string;
  description: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: `${siteConfig.url}${url}`,
    isPartOf: {
      "@type": "WebSite",
      name: "LLCPad",
      url: siteConfig.url,
    },
  };
}

export { siteConfig };
