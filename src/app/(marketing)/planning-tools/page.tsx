import type { Metadata } from "next";
import Link from "next/link";
import {
  ClipboardList, LayoutDashboard, Users, Calculator, Globe,
  Hotel, CalendarSearch, BookOpen, Palette, Hash,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Planning Tools - Wedding & Event Planning",
  description:
    "Everything you need to plan your perfect event. Checklists, seating charts, guest lists, budget tracker, and personalization tools.",
};

const categories = [
  {
    title: "Organize with ease",
    items: [
      { label: "Checklist", href: "/planner", icon: ClipboardList },
      { label: "Seating Chart", href: "/planner", icon: LayoutDashboard },
      { label: "Guests", href: "/planner", icon: Users },
      { label: "Budget", href: "/planner", icon: Calculator },
      { label: "Event Website", href: "/planner", icon: Globe },
    ],
  },
  {
    title: "Personalize your event",
    items: [
      { label: "Hotel Blocks", href: "/planner", icon: Hotel },
      { label: "Date Finder", href: "/planner", icon: CalendarSearch },
      { label: "Cost Guide", href: "/planner", icon: BookOpen },
      { label: "Color Generator", href: "/planner", icon: Palette },
      { label: "Hashtag Generator", href: "/planner", icon: Hash },
    ],
  },
];

export default function PlanningToolsPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-violet-50 to-blue-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Planning Tools</h1>
          <p className="text-lg text-gray-600">
            All the tools you need to plan your perfect wedding or event — from checklist to seating chart.
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
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 text-gray-600 hover:text-violet-700 transition-colors group"
                      >
                        <span className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-violet-100 flex items-center justify-center transition-colors flex-shrink-0">
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
