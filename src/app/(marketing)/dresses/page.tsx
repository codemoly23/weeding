import type { Metadata } from "next";
import Link from "next/link";
import {
  Shirt, Users, Heart, Flower2,
  Briefcase, Gem, Sparkles, Star,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dresses & Attire - Wedding Fashion",
  description:
    "Find your dream wedding dress. Browse bridal gowns, bridesmaid dresses, suits, tuxedos, and wedding accessories.",
};

const categories = [
  {
    title: "Bridal",
    items: [
      { label: "Bridal Gowns", href: "/dresses/bridal", icon: Shirt },
      { label: "Bridesmaid Dresses", href: "/dresses/bridesmaid", icon: Users },
      { label: "Mother of the Bride", href: "/dresses/mother-of-bride", icon: Heart },
      { label: "Flower Girl Dresses", href: "/dresses/flower-girl", icon: Flower2 },
    ],
  },
  {
    title: "Groom",
    items: [
      { label: "Suits & Tuxedos", href: "/dresses/suits", icon: Briefcase },
      { label: "Groomsmen Attire", href: "/dresses/groomsmen", icon: Users },
    ],
  },
  {
    title: "Accessories",
    items: [
      { label: "Jewelry", href: "/dresses/jewelry", icon: Gem },
      { label: "Shoes", href: "/dresses/shoes", icon: Star },
      { label: "Veils & Headpieces", href: "/dresses/veils", icon: Sparkles },
    ],
  },
];

export default function DressesPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-pink-50 to-fuchsia-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Dresses & Attire</h1>
          <p className="text-lg text-gray-600">
            Find the perfect wedding dress, bridesmaid gowns, suits, and accessories for your big day.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
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
                        className="flex items-center gap-3 text-gray-600 hover:text-fuchsia-700 transition-colors group"
                      >
                        <span className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-fuchsia-100 flex items-center justify-center transition-colors flex-shrink-0">
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
