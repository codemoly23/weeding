import { MetadataRoute } from "next";
import prisma from "@/lib/db";

export const revalidate = 86400; // Regenerate sitemap every 24 hours

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ceremoney.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Fetch published blog posts
  let blogSlugs: string[] = [];
  try {
    const blogs = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true },
      orderBy: { publishedAt: "desc" },
    });
    blogSlugs = blogs.map((b) => b.slug);
  } catch {
    // Sitemap degrades gracefully if DB is unavailable
  }

  // Fetch approved vendor profiles
  let vendorSlugs: string[] = [];
  try {
    const vendors = await prisma.vendorProfile.findMany({
      where: { status: "APPROVED" },
      select: { slug: true },
      orderBy: { createdAt: "desc" },
    });
    vendorSlugs = vendors.map((v) => v.slug);
  } catch {
    // Sitemap degrades gracefully if DB is unavailable
  }

  // Fetch active services
  let serviceSlugs: string[] = [];
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      select: { slug: true },
    });
    serviceSlugs = services.map((s) => s.slug);
  } catch {
    // Sitemap degrades gracefully if DB is unavailable
  }

  // Fetch active venues
  let venueSlugs: string[] = [];
  try {
    const venues = await prisma.venue.findMany({
      where: { isActive: true },
      select: { slug: true },
    });
    venueSlugs = venues.map((v) => v.slug);
  } catch {
    // Sitemap degrades gracefully if DB is unavailable
  }

  // Core marketing pages — auth routes (/login, /register) intentionally excluded
  // (they are disallowed in robots.ts and not indexable content)
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/pricing`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/vendors`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/services`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/search`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/disclaimer`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/refund-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const vendorPages: MetadataRoute.Sitemap = vendorSlugs.map((slug) => ({
    url: `${baseUrl}/vendors/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const servicePages: MetadataRoute.Sitemap = serviceSlugs.map((slug) => ({
    url: `${baseUrl}/services/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const venuePages: MetadataRoute.Sitemap = venueSlugs.map((slug) => ({
    url: `${baseUrl}/venues/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages, ...vendorPages, ...servicePages, ...venuePages];
}
