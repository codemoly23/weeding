import type { Metadata } from "next";
import Link from "next/link";
import {
  PlusCircle, Search, Home, Plane, Banknote, Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Registry - Create or Find a Wedding Registry",
  description:
    "Create your wedding registry or find a couple's registry. Browse home, travel, cash funds, and experience gifts.",
};

const categories = [
  {
    title: "Registry",
    items: [
      { label: "Create a Registry", href: "/registry/create", icon: PlusCircle },
      { label: "Find a Registry", href: "/registry/find", icon: Search },
    ],
  },
  {
    title: "Categories",
    items: [
      { label: "Home & Kitchen", href: "/registry/home", icon: Home },
      { label: "Travel Fund", href: "/registry/travel", icon: Plane },
      { label: "Cash Fund", href: "/registry/cash", icon: Banknote },
      { label: "Experiences", href: "/registry/experiences", icon: Sparkles },
    ],
  },
];

export default function RegistryPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-teal-50 to-cyan-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Wedding Registry</h1>
          <p className="text-lg text-gray-600">
            Create your dream registry or find a couple's wishlist — from home essentials to travel funds and experiences.
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
                        className="flex items-center gap-3 text-gray-600 hover:text-teal-700 transition-colors group"
                      >
                        <span className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-teal-100 flex items-center justify-center transition-colors flex-shrink-0">
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
