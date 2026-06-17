import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Star, Tag } from "lucide-react";
import prisma from "@/lib/db";

export const revalidate = 60;

interface Venue {
  id: string;
  name: string;
  slug: string;
  category: string;
  type: string;
  location: string | null;
  price: number | null;
  priceUnit: string | null;
  badge: string | null;
  badgeColor: string | null;
  tags: string[];
  image: string | null;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  wedding: "Wedding Venues",
  party: "Party & Event Venues",
  specialty: "Specialty Venues",
};

interface PageProps {
  searchParams: Promise<{ type?: string; category?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { type, category } = await searchParams;
  if (type) {
    return {
      title: `${type}s — Find Your Perfect Venue`,
      description: `Browse ${type} venues for your wedding or special event.`,
    };
  }
  if (category) {
    const label = CATEGORY_LABELS[category] ?? category;
    return {
      title: `${label} — Ceremoney`,
      description: `Browse ${label.toLowerCase()} for your special day.`,
    };
  }
  return {
    title: "Venues - Find Your Perfect Wedding Venue",
    description:
      "Discover the perfect venue for your wedding or event. Browse wedding venues, banquet halls, gardens, beach venues, and more.",
  };
}

async function getVenues(type?: string, category?: string): Promise<Venue[]> {
  const where: Record<string, unknown> = { isActive: true };
  if (type) where.type = type;
  if (category) where.category = category;

  return prisma.venue.findMany({
    where,
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      type: true,
      location: true,
      price: true,
      priceUnit: true,
      badge: true,
      badgeColor: true,
      tags: true,
      image: true,
      rating: true,
      reviewCount: true,
      isFeatured: true,
    },
  }) as Promise<Venue[]>;
}

function VenueCard({ venue }: { venue: Venue }) {
  return (
    <Link
      href={`/venues/${venue.slug}`}
      className="group relative bg-white rounded-2xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all overflow-hidden block"
    >
      <div className="h-44 bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center relative">
        {venue.image ? (
          <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl">🏛️</span>
        )}
        {venue.badge && (
          <span
            className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
            style={{
              backgroundColor: venue.badgeColor ? `${venue.badgeColor}20` : "#7c3aed20",
              color: venue.badgeColor || "#7c3aed",
            }}
          >
            {venue.badge}
          </span>
        )}
        {venue.isFeatured && (
          <span className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700">
            ⭐ Featured
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors leading-tight">
            {venue.name}
          </h3>
          {venue.price && (
            <p className="text-sm font-semibold text-purple-600 whitespace-nowrap shrink-0">
              {venue.price.toLocaleString()}{venue.priceUnit || "/day"}
            </p>
          )}
        </div>

        <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            <Tag className="h-3 w-3" /> {venue.type}
          </span>
          {venue.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {venue.location}
            </span>
          )}
        </div>

        {venue.rating > 0 && (
          <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-500">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="font-medium text-gray-700">{venue.rating.toFixed(1)}</span>
            {venue.reviewCount > 0 && <span>({venue.reviewCount} reviews)</span>}
          </div>
        )}

        {venue.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {venue.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export default async function VenuesPage({ searchParams }: PageProps) {
  const { type, category } = await searchParams;
  const venues = await getVenues(type, category);

  const isFiltered = !!(type || category);
  const filterLabel = type ?? (category ? CATEGORY_LABELS[category] : null);

  // ── Filtered view (by type or category) ──────────────────────────────
  if (isFiltered) {
    return (
      <div className="min-h-screen">
        <section className="bg-gradient-to-br from-purple-50 to-pink-50 py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{filterLabel}</h1>
            <p className="text-lg text-gray-600">
              Browse our curated selection of {filterLabel?.toLowerCase()} for your special day.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">{venues.length} venues found</p>
            <Link
              href="/venues"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              ← Browse all venues
            </Link>
          </div>

          {venues.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-6xl">🏛️</span>
              <p className="mt-4 text-gray-700 font-semibold text-lg">
                No {filterLabel} available yet
              </p>
              <p className="text-gray-400 text-sm mt-2">Check back soon — new venues are added regularly.</p>
              <Link
                href="/venues"
                className="mt-6 inline-block bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                Browse All Venues
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {venues.map((venue) => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  // ── Default view (all venues grouped by category) ────────────────────
  const grouped = venues.reduce((acc: Record<string, Venue[]>, venue) => {
    const cat = venue.category || "wedding";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(venue);
    return acc;
  }, {});

  const categories = ["wedding", "party", "specialty"];
  const hasAnyVenue = venues.length > 0;

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-purple-50 to-pink-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Your Perfect Venue</h1>
          <p className="text-lg text-gray-600">
            Browse our curated selection of wedding venues, banquet halls, gardens, and unique spaces for your special day.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16 space-y-14">
        {!hasAnyVenue ? (
          <div className="text-center py-20">
            <span className="text-6xl">🏛️</span>
            <p className="mt-4 text-gray-400 text-lg">No venues available yet.</p>
            <p className="text-gray-400 text-sm mt-2">Check back soon!</p>
          </div>
        ) : (
          categories.map((cat) => {
            const catVenues = grouped[cat] ?? [];
            const label = CATEGORY_LABELS[cat] ?? cat;
            return (
              <div key={cat}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{label}</h2>
                  <span className="text-sm text-gray-400">{catVenues.length} venues</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {catVenues.length === 0 ? (
                    <div className="col-span-full py-10 text-center text-gray-400">
                      <p className="text-sm">No {label.toLowerCase()} available yet.</p>
                    </div>
                  ) : (
                    catVenues.map((venue) => <VenueCard key={venue.id} venue={venue} />)
                  )}
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
