import Link from "next/link";
import {
  Users,
  Globe,
  LayoutGrid,
  Camera,
  Flower2,
  UtensilsCrossed,
  Music,
  MapPin,
  CalendarCheck,
  Heart,
  MessageSquare,
  BarChart3,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Featured services for the main grid
const featuredServices = [
  {
    name: "Guest List Management",
    description:
      "Build and manage your complete guest list with RSVP tracking, dietary requirements, and family grouping.",
    icon: Users,
    href: "/features/guest-management",
    price: "Free",
    popular: true,
    category: "Core",
  },
  {
    name: "Seating Chart Editor",
    description:
      "Drag-and-drop visual seating planner. Assign guests to tables and export a PDF for your venue.",
    icon: LayoutGrid,
    href: "/features/seating-chart",
    price: "From Free",
    popular: true,
    category: "Core",
  },
  {
    name: "Wedding Website & RSVP",
    description:
      "Beautiful, customizable event website with online RSVP, countdown timer, and photo gallery.",
    icon: Globe,
    href: "/features/wedding-website",
    price: "Free",
    popular: true,
    category: "Core",
  },
  {
    name: "Vendor Directory",
    description:
      "Browse verified photographers, venues, florists, caterers, and more. Compare and contact in one place.",
    icon: Camera,
    href: "/vendors",
    price: "Free to Browse",
    popular: true,
    category: "Vendors",
  },
  {
    name: "Budget Tracker",
    description:
      "Set your wedding budget, log expenses, and track spending category by category in real time.",
    icon: BarChart3,
    href: "/features/budget",
    price: "Premium",
    popular: false,
    category: "Planning",
  },
  {
    name: "Wedding Checklist",
    description:
      "Personalized month-by-month planning checklist so nothing falls through the cracks.",
    icon: CalendarCheck,
    href: "/features/checklist",
    price: "Free",
    popular: false,
    category: "Planning",
  },
  {
    name: "Vendor Collaboration",
    description:
      "Invite your photographer, caterer, or florist to access relevant event details securely.",
    icon: MessageSquare,
    href: "/features/vendor-collaboration",
    price: "Premium",
    popular: false,
    category: "Vendors",
  },
  {
    name: "Event Analytics",
    description:
      "Track RSVP response rates, dietary breakdowns, and guest demographics with visual reports.",
    icon: BarChart3,
    href: "/features/analytics",
    price: "Elite",
    popular: false,
    category: "Insights",
  },
];

// All feature/service categories
const serviceCategories = [
  {
    name: "Guest & Seating",
    description: "Manage everyone on your big day",
    services: [
      { name: "Guest List Manager", href: "/features/guest-management", price: "Free" },
      { name: "Family Grouping", href: "/features/guest-management", price: "Free" },
      { name: "RSVP Collection", href: "/features/wedding-website", price: "Free" },
      { name: "Dietary Tracking", href: "/features/guest-management", price: "Free" },
      { name: "Seating Chart Editor", href: "/features/seating-chart", price: "Free" },
      { name: "Seating PDF Export", href: "/features/seating-chart", price: "Premium" },
    ],
    icon: Users,
  },
  {
    name: "Event Website",
    description: "Share your story with guests",
    services: [
      { name: "Wedding Website", href: "/features/wedding-website", price: "Free" },
      { name: "Online RSVP Form", href: "/features/wedding-website", price: "Free" },
      { name: "Custom Domain", href: "/features/wedding-website", price: "Premium" },
      { name: "Photo Gallery", href: "/features/wedding-website", price: "Free" },
      { name: "Countdown Timer", href: "/features/wedding-website", price: "Free" },
      { name: "Gift Registry Links", href: "/features/wedding-website", price: "Free" },
    ],
    icon: Globe,
  },
  {
    name: "Vendors & Venues",
    description: "Find and coordinate your suppliers",
    services: [
      { name: "Photographer Directory", href: "/vendors/photographers", price: "Free" },
      { name: "Venue Directory", href: "/vendors/venues", price: "Free" },
      { name: "Florists & Decoration", href: "/vendors/florists", price: "Free" },
      { name: "Catering & Food", href: "/vendors/catering", price: "Free" },
      { name: "Music & Entertainment", href: "/vendors/music", price: "Free" },
      { name: "Vendor Collaboration", href: "/features/vendor-collaboration", price: "Premium" },
    ],
    icon: Camera,
  },
  {
    name: "Planning Tools",
    description: "Keep every detail organized",
    services: [
      { name: "Wedding Checklist", href: "/features/checklist", price: "Free" },
      { name: "Budget Tracker", href: "/features/budget", price: "Premium" },
      { name: "Event Analytics", href: "/features/analytics", price: "Elite" },
      { name: "Multiple Events", href: "/pricing", price: "Elite" },
    ],
    icon: CalendarCheck,
  },
];

export function ServicesGrid() {
  return (
    <section className="bg-muted/30 py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            Features
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything You Need to Plan Your Perfect Wedding
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From guest list to seating chart, event website to vendor coordination,
            Ceremoney brings every part of your wedding planning into one place.
          </p>
        </div>

        {/* Featured Services Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredServices.map((service) => (
            <Link key={service.name} href={service.href} className="group">
              <Card className="relative h-full transition-all hover:border-primary hover:shadow-lg">
                {service.popular && (
                  <Badge className="absolute -top-2 right-4 bg-accent text-accent-foreground">
                    Popular
                  </Badge>
                )}
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <service.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="flex items-center justify-between text-lg">
                    {service.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-primary">
                      {service.price}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* All Features by Category */}
        <div className="mt-20">
          <div className="mb-10 text-center">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">
              All Features
            </h3>
            <p className="mt-2 text-muted-foreground">
              Explore the complete Ceremoney feature set
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {serviceCategories.map((category) => (
              <div
                key={category.name}
                className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <category.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {category.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                </div>

                <ul className="space-y-2">
                  {category.services.map((service) => (
                    <li key={service.name}>
                      <Link
                        href={service.href}
                        className="group flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
                      >
                        <span className="text-foreground group-hover:text-primary">
                          {service.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {service.price}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <p className="mb-4 text-muted-foreground">
            Not sure which plan is right for you?
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/pricing">
                View Pricing
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/contact">Talk to Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
