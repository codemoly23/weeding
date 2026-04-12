import { Metadata } from "next";

const siteConfig = {
  name: "Ceremoney",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://ceremoney.com",
  description:
    "Plan your perfect wedding, baptism, or event with Ceremoney. Guest management, seating charts, vendor directory, event websites, and more — all in one place.",
  ogImage: "/og-image.jpg",
  links: {
    twitter: "https://twitter.com/ceremoney",
    instagram: "https://instagram.com/ceremoney",
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
    name: "Ceremoney",
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description: siteConfig.description,
    contactPoint: {
      "@type": "ContactPoint",
      email: "support@ceremoney.com",
      contactType: "customer service",
      availableLanguage: ["English", "Swedish", "Arabic"],
    },
    sameAs: [siteConfig.links.twitter, siteConfig.links.instagram],
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
      name: "Ceremoney",
      url: siteConfig.url,
    },
    offers: {
      "@type": "Offer",
      price: price.toString(),
      priceCurrency: "SEK",
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
      name: "Ceremoney",
    },
    offers: {
      "@type": "Offer",
      price: price.toString(),
      priceCurrency: "SEK",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Ceremoney",
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
    "@type": "SoftwareApplication",
    name: "Ceremoney",
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description: siteConfig.description,
    email: "support@ceremoney.com",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
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
      name: "Ceremoney",
      url: siteConfig.url,
    },
  };
}

export { siteConfig };
