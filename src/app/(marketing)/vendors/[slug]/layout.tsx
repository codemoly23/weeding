import type { Metadata } from "next";
import prisma from "@/lib/db";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

const CATEGORY_LABELS: Record<string, string> = {
  VENUE: "Wedding Venue",
  PHOTOGRAPHY: "Wedding Photographer",
  VIDEOGRAPHY: "Wedding Videographer",
  CATERING: "Wedding Caterer",
  MUSIC_DJ: "Wedding Music & DJ",
  FLOWERS: "Wedding Florist",
  DRESS_ATTIRE: "Dress & Attire Vendor",
  RINGS: "Rings & Jewelry Vendor",
  DECORATIONS: "Wedding Decorator",
  TRANSPORTATION: "Wedding Transportation",
  HAIR_MAKEUP: "Hair & Makeup Artist",
  WEDDING_PLANNER: "Wedding Planner",
  OTHER: "Wedding Vendor",
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const vendor = await prisma.vendorProfile.findFirst({
    where: {
      slug,
      isApproved: true,
      isActive: true,
    },
    select: {
      businessName: true,
      category: true,
      tagline: true,
      description: true,
      city: true,
      country: true,
      photos: true,
    },
  });

  if (!vendor) {
    return {
      title: "Wedding Vendor | Ceremoney",
      description: "Find wedding vendors on Ceremoney.",
    };
  }

  const category = CATEGORY_LABELS[vendor.category] || "Wedding Vendor";
  const location = [vendor.city, vendor.country].filter(Boolean).join(", ");
  const title = `${vendor.businessName} | ${category}`;
  const description = (
    vendor.tagline ||
    vendor.description ||
    `${category}${location ? ` in ${location}` : ""} on Ceremoney.`
  ).slice(0, 160);
  const image = vendor.photos[0];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      images: image ? [{ url: image, alt: vendor.businessName }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default function VendorProfileLayout({ children }: LayoutProps) {
  return children;
}
