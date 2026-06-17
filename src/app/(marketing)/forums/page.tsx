import type { Metadata } from "next";
import Link from "next/link";
import {
  ClipboardList, Calculator, Building2, Shirt, Plane,
  Hammer, Heart, HeartHandshake, Camera,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Forums - Wedding Community & Discussion",
  description:
    "Join the wedding community. Discuss planning tips, budget advice, venues, fashion, and get inspiration from real weddings.",
};

const categories = [
  {
    title: "Community",
    items: [
      { label: "Wedding Planning", href: "/forums/wedding-planning", icon: ClipboardList },
      { label: "Budget & Finance", href: "/forums/budget", icon: Calculator },
      { label: "Venues & Vendors", href: "/forums/venues-vendors", icon: Building2 },
      { label: "Fashion & Beauty", href: "/forums/fashion", icon: Shirt },
      { label: "Honeymoon", href: "/forums/honeymoon", icon: Plane },
    ],
  },
  {
    title: "Inspiration",
    items: [
      { label: "DIY Projects", href: "/forums/diy", icon: Hammer },
      { label: "Real Weddings", href: "/forums/real-weddings", icon: Heart },
      { label: "Newlyweds", href: "/forums/newlyweds", icon: HeartHandshake },
      { label: "Photo Ideas", href: "/forums/photos", icon: Camera },
    ],
  },
];

export default function ForumsPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-rose-50 to-orange-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Wedding Forums</h1>
          <p className="text-lg text-gray-600">
            Connect with couples, share advice, and find inspiration from our wedding community.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
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
                        className="flex items-center gap-3 text-gray-600 hover:text-rose-700 transition-colors group"
                      >
                        <span className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-rose-100 flex items-center justify-center transition-colors flex-shrink-0">
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
