import type { Metadata } from "next";
import Link from "next/link";
import {
  Palette, Flower2, LayoutDashboard, Star,
  PartyPopper, Gift, Camera, Plane,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Ideas - Wedding Inspiration & Decor",
  description:
    "Get inspired for your wedding. Browse wedding themes, floral arrangements, table settings, reception ideas, and more.",
};

const categories = [
  {
    title: "Decor",
    items: [
      { label: "Wedding Themes", href: "/ideas/themes", icon: Palette },
      { label: "Floral Arrangements", href: "/ideas/flowers", icon: Flower2 },
      { label: "Table Settings", href: "/ideas/tables", icon: LayoutDashboard },
      { label: "Ceremony Decor", href: "/ideas/ceremony", icon: Star },
    ],
  },
  {
    title: "Celebration",
    items: [
      { label: "Reception Ideas", href: "/ideas/reception", icon: PartyPopper },
      { label: "Wedding Favors", href: "/ideas/favors", icon: Gift },
      { label: "Photo Ideas", href: "/ideas/photos", icon: Camera },
      { label: "Honeymoon Ideas", href: "/ideas/honeymoon", icon: Plane },
    ],
  },
];

export default function IdeasPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-amber-50 to-yellow-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Wedding Ideas</h1>
          <p className="text-lg text-gray-600">
            Find inspiration for every detail of your wedding — from decor and flowers to reception and honeymoon.
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
                        className="flex items-center gap-3 text-gray-600 hover:text-amber-700 transition-colors group"
                      >
                        <span className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-amber-100 flex items-center justify-center transition-colors flex-shrink-0">
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
