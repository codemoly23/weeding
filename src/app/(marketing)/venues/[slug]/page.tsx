import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Tag, Star, ArrowLeft, CheckCircle, Phone, Mail } from "lucide-react";
import prisma from "@/lib/db";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getVenue(slug: string) {
  return prisma.venue.findFirst({
    where: { slug, isActive: true },
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const venue = await getVenue(slug);
  if (!venue) return { title: "Venue Not Found" };
  return {
    title: `${venue.name} — Ceremoney Venues`,
    description: venue.description || `Book ${venue.name} for your special event. Located in ${venue.location || "a beautiful setting"}.`,
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  wedding: "Wedding Venues",
  party: "Party & Event Venues",
  specialty: "Specialty Venues",
};

export default async function VenueDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const venue = await getVenue(slug);

  if (!venue) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back */}
      <div className="max-w-5xl mx-auto px-4 pt-8">
        <Link
          href="/venues"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-purple-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Venues
        </Link>
      </div>

      {/* Hero Image */}
      <div className="max-w-5xl mx-auto px-4 mt-4">
        <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
          {venue.image ? (
            <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-8xl">🏛️</span>
          )}
          {venue.badge && (
            <span
              className="absolute top-4 left-4 text-sm font-semibold px-3 py-1.5 rounded-full capitalize"
              style={{
                backgroundColor: venue.badgeColor ? `${venue.badgeColor}25` : "#7c3aed25",
                color: venue.badgeColor || "#7c3aed",
              }}
            >
              {venue.badge}
            </span>
          )}
          {venue.isFeatured && (
            <span className="absolute top-4 right-4 text-sm font-semibold px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-700">
              ⭐ Featured Venue
            </span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div>
            <p className="text-sm text-purple-600 font-medium mb-1">
              {CATEGORY_LABELS[venue.category] ?? venue.category}
            </p>
            <h1 className="text-3xl font-bold text-gray-900">{venue.name}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1.5">
                <Tag className="h-4 w-4" /> {venue.type}
              </span>
              {venue.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {venue.location}
                </span>
              )}
              {venue.rating > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-gray-700">{venue.rating.toFixed(1)}</span>
                  {venue.reviewCount > 0 && <span>({venue.reviewCount} reviews)</span>}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {venue.description && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">About This Venue</h2>
              <p className="text-gray-600 leading-relaxed">{venue.description}</p>
            </div>
          )}

          {/* Tags / Features */}
          {venue.tags.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Features & Amenities</h2>
              <div className="grid grid-cols-2 gap-3">
                {venue.tags.map((tag) => (
                  <div key={tag} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-purple-500 shrink-0" />
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — Booking Card */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
            {venue.price ? (
              <div className="mb-4">
                <p className="text-3xl font-bold text-purple-600">
                  {venue.price.toLocaleString()}
                  <span className="text-base font-normal text-gray-400 ml-1">{venue.priceUnit || "/day"}</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">Price may vary based on date and package</p>
              </div>
            ) : (
              <p className="text-lg font-semibold text-gray-700 mb-4">Contact for pricing</p>
            )}

            <a
              href="mailto:hello@ceremoney.com"
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              <Mail className="h-4 w-4" />
              Send Inquiry
            </a>

            <a
              href="tel:+46000000000"
              className="mt-3 w-full flex items-center justify-center gap-2 border border-gray-200 hover:border-purple-300 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors"
            >
              <Phone className="h-4 w-4" />
              Call Us
            </a>

            <div className="mt-5 pt-5 border-t border-gray-100 space-y-3 text-sm text-gray-500">
              {venue.type && (
                <div className="flex justify-between">
                  <span>Type</span>
                  <span className="font-medium text-gray-700">{venue.type}</span>
                </div>
              )}
              {venue.location && (
                <div className="flex justify-between">
                  <span>Location</span>
                  <span className="font-medium text-gray-700">{venue.location}</span>
                </div>
              )}
              {venue.city && (
                <div className="flex justify-between">
                  <span>City</span>
                  <span className="font-medium text-gray-700">{venue.city}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
