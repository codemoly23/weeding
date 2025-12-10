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
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const services = [
  {
    name: "LLC Formation",
    description:
      "Form your US LLC in any state with complete documentation and compliance support.",
    icon: Building2,
    href: "/services/llc-formation",
    price: "From $149",
    popular: true,
  },
  {
    name: "EIN Application",
    description:
      "Get your Employer Identification Number (Tax ID) for your US business.",
    icon: FileText,
    href: "/services/ein-application",
    price: "From $79",
    popular: false,
  },
  {
    name: "Amazon Seller Account",
    description:
      "Professional Amazon seller account setup with full verification support.",
    icon: ShoppingCart,
    href: "/services/amazon-seller",
    price: "From $299",
    popular: true,
  },
  {
    name: "Registered Agent",
    description:
      "Comply with state requirements with our reliable registered agent service.",
    icon: Shield,
    href: "/services/registered-agent",
    price: "From $99/yr",
    popular: false,
  },
  {
    name: "Virtual US Address",
    description:
      "Get a real US business address for mail forwarding and business presence.",
    icon: MapPin,
    href: "/services/virtual-address",
    price: "From $149/yr",
    popular: false,
  },
  {
    name: "Business Banking",
    description:
      "Open a US business bank account with our partner banks remotely.",
    icon: Landmark,
    href: "/services/business-banking",
    price: "From $199",
    popular: false,
  },
  {
    name: "Amazon Brand Registry",
    description:
      "Protect your brand on Amazon with trademark and brand registry assistance.",
    icon: BadgeCheck,
    href: "/services/brand-registry",
    price: "From $499",
    popular: false,
  },
  {
    name: "Annual Compliance",
    description:
      "Stay compliant with annual reports, renewals, and state filings.",
    icon: Briefcase,
    href: "/services/compliance",
    price: "From $149/yr",
    popular: false,
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

        {/* Services Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
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
      </div>
    </section>
  );
}
