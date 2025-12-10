import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { services } from "@/lib/data/services";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore our comprehensive US business formation services including LLC formation, EIN application, Amazon seller accounts, and more.",
};

export default function ServicesPage() {
  return (
    <div className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            Our Services
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Complete US Business Services
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to start, run, and grow your US business as an
            international entrepreneur.
          </p>
        </div>

        {/* Services Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Link key={service.slug} href={`/services/${service.slug}`}>
                <Card className="group h-full transition-all hover:border-primary hover:shadow-lg">
                  <CardHeader>
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-7 w-7" />
                    </div>
                    <CardTitle className="text-xl">{service.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{service.shortDesc}</p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-lg font-semibold text-primary">
                        From ${service.startingPrice}
                      </span>
                      <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            Not sure which service you need?
          </p>
          <Button className="mt-4" variant="outline" asChild>
            <Link href="/contact">Contact Us for a Free Consultation</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
