import Link from "next/link";
import {
  Building2,
  FileText,
  ShoppingCart,
  MapPin,
  Landmark,
  Shield,
  BadgeCheck,
  Briefcase,
  FileCheck,
  Stamp,
  ScrollText,
  TrendingUp,
  Package,
  Sparkles,
  Target,
  Calculator,
  BookOpen,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Featured services for the main grid
const featuredServices = [
  {
    name: "LLC Formation",
    description:
      "Form your US LLC in any state with complete documentation and compliance support.",
    icon: Building2,
    href: "/services/llc-formation",
    price: "From $199",
    popular: true,
    category: "Formation",
  },
  {
    name: "EIN Application",
    description:
      "Get your Employer Identification Number (Tax ID) for your US business.",
    icon: FileText,
    href: "/services/ein-application",
    price: "From $99",
    popular: false,
    category: "Formation",
  },
  {
    name: "Trademark Registration",
    description:
      "Protect your brand with USPTO trademark registration for nationwide protection.",
    icon: Stamp,
    href: "/services/trademark-registration",
    price: "From $599",
    popular: true,
    category: "Formation",
  },
  {
    name: "Amazon Seller Account",
    description:
      "Professional Amazon seller account setup with full verification support.",
    icon: ShoppingCart,
    href: "/services/amazon-seller",
    price: "From $349",
    popular: true,
    category: "Amazon",
  },
  {
    name: "Brand Registry",
    description:
      "Protect your brand on Amazon with trademark and brand registry enrollment.",
    icon: BadgeCheck,
    href: "/services/brand-registry",
    price: "From $299",
    popular: true,
    category: "Amazon",
  },
  {
    name: "Business Banking",
    description:
      "Open a US business bank account with our partner banks remotely.",
    icon: Landmark,
    href: "/services/business-banking",
    price: "From $199",
    popular: true,
    category: "Finance",
  },
  {
    name: "Registered Agent",
    description:
      "Comply with state requirements with our reliable registered agent service.",
    icon: Shield,
    href: "/services/registered-agent",
    price: "From $99/yr",
    popular: false,
    category: "Compliance",
  },
  {
    name: "Virtual US Address",
    description:
      "Get a real US business address for mail forwarding and business presence.",
    icon: MapPin,
    href: "/services/virtual-address",
    price: "From $149/yr",
    popular: false,
    category: "Compliance",
  },
];

// All service categories for "View All Services" section
const serviceCategories = [
  {
    name: "Formation & Legal",
    description: "Start your US business",
    services: [
      { name: "LLC Formation", href: "/services/llc-formation", price: "$199" },
      { name: "EIN Application", href: "/services/ein-application", price: "$99" },
      { name: "ITIN Application", href: "/services/itin-application", price: "$199" },
      { name: "Trademark Registration", href: "/services/trademark-registration", price: "$599" },
      { name: "DBA / Trade Name", href: "/services/dba-filing", price: "$99" },
      { name: "Operating Agreement", href: "/services/operating-agreement", price: "$149" },
    ],
    icon: Building2,
  },
  {
    name: "Compliance & Documents",
    description: "Keep your business compliant",
    services: [
      { name: "Registered Agent", href: "/services/registered-agent", price: "$99/yr" },
      { name: "Annual Compliance", href: "/services/compliance", price: "$149/yr" },
      { name: "Amendment Filing", href: "/services/amendment-filing", price: "$99" },
      { name: "Certificate of Good Standing", href: "/services/certificate-good-standing", price: "$49" },
      { name: "LLC Dissolution", href: "/services/llc-dissolution", price: "$149" },
      { name: "Apostille Service", href: "/services/apostille-service", price: "$99" },
      { name: "Virtual US Address", href: "/services/virtual-address", price: "$149/yr" },
    ],
    icon: Shield,
  },
  {
    name: "Amazon Services",
    description: "Sell on Amazon with confidence",
    services: [
      { name: "Amazon Seller Account", href: "/services/amazon-seller", price: "$349" },
      { name: "Brand Registry", href: "/services/brand-registry", price: "$299" },
      { name: "Category Ungating", href: "/services/category-ungating", price: "$149" },
      { name: "Listing Optimization", href: "/services/product-listing-optimization", price: "$149" },
      { name: "A+ Content Creation", href: "/services/a-plus-content", price: "$199" },
      { name: "PPC Campaign Setup", href: "/services/ppc-campaign-setup", price: "$249" },
      { name: "Account Reinstatement", href: "/services/account-reinstatement", price: "$399" },
    ],
    icon: ShoppingCart,
  },
  {
    name: "Tax & Finance",
    description: "Financial services for your business",
    services: [
      { name: "Business Banking", href: "/services/business-banking", price: "$199" },
      { name: "Bookkeeping", href: "/services/bookkeeping", price: "$149/mo" },
      { name: "Tax Filing", href: "/services/tax-filing", price: "$349" },
    ],
    icon: Calculator,
  },
];

export function ServicesGrid() {
  return (
    <section className="bg-muted/30 py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            Our Services
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything You Need to Start Your US Business
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From LLC formation to Amazon seller accounts, we provide end-to-end
            support for international entrepreneurs.
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

        {/* All Services by Category */}
        <div className="mt-20">
          <div className="mb-10 text-center">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">
              All Services
            </h3>
            <p className="mt-2 text-muted-foreground">
              Explore our complete range of business services
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
            Not sure which services you need?
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/services">
                View All Services
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/contact">Get Free Consultation</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
