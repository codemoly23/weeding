import type { Metadata } from "next";
import Link from "next/link";
import {
  Heart, Building2, Wine, Flower2, Waves, Home,
  PartyPopper, Briefcase, Hotel, Landmark, Ship, TreePine,
  Church, Diamond, Plane, Sparkles, MapPin,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Venues - Find Your Perfect Wedding Venue",
  description:
    "Discover the perfect venue for your wedding or event. Browse wedding venues, banquet halls, gardens, beach venues, and more.",
};

const categories = [
  {
    title: "Wedding Venues",
    items: [
      { label: "All Wedding Venues", href: "/venues/wedding", icon: Heart },
      { label: "Banquet Halls", href: "/venues/banquet-halls", icon: Building2 },
      { label: "Wineries", href: "/venues/wineries", icon: Wine },
      { label: "Gardens", href: "/venues/gardens", icon: Flower2 },
      { label: "Beach Venues", href: "/venues/beach", icon: Waves },
      { label: "Mansions", href: "/venues/mansions", icon: Home },
    ],
  },
  {
    title: "Party & Event Venues",
    items: [
      { label: "Party Halls", href: "/venues/party-halls", icon: PartyPopper },
      { label: "Conference Centers", href: "/venues/conference-centers", icon: Briefcase },
      { label: "Hotels", href: "/venues/hotels", icon: Hotel },
      { label: "Historic Venues", href: "/venues/historic", icon: Landmark },
      { label: "Yachts & Boats", href: "/venues/yachts", icon: Ship },
      { label: "Outdoor Venues", href: "/venues/outdoor", icon: TreePine },
    ],
  },
  {
    title: "Specialty Venues",
    items: [
      { label: "Religious Venues", href: "/venues/religious", icon: Church },
      { label: "Luxury Estates", href: "/venues/luxury", icon: Diamond },
      { label: "Destination Venues", href: "/venues/destination", icon: Plane },
      { label: "Unique Spaces", href: "/venues/unique", icon: Sparkles },
      { label: "Find Near Me", href: "/venues/near-me", icon: MapPin },
    ],
  },
];

export default function VenuesPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-purple-50 to-pink-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Your Perfect Venue</h1>
          <p className="text-lg text-gray-600">
            Browse thousands of wedding venues, banquet halls, gardens, and unique spaces for your special day.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {categories.map((cat) => (
            <div key={cat.title}>
              <h2 className="text-lg font-semibold text-gray-900 mb-5 pb-2 border-b border-gray-200">
                {cat.title}
              </h2>
              <ul className="space-y-3">
                {cat.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 text-gray-600 hover:text-purple-700 transition-colors group"
                      >
                        <span className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-purple-100 flex items-center justify-center transition-colors flex-shrink-0">
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className="text-sm">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
