"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BillingPeriod = "monthly" | "yearly";

const packages = [
  {
    name: "Basic",
    description: "Start planning for free — no credit card required",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      { name: "1 active event", included: true },
      { name: "Up to 50 guests", included: true },
      { name: "Wedding website with RSVP", included: true },
      { name: "Basic seating chart", included: true },
      { name: "Vendor directory access", included: true },
      { name: "Planning checklist", included: true },
      { name: "Custom domain", included: false },
      { name: "Unlimited guests", included: false },
      { name: "Budget tracker", included: false },
      { name: "Priority support", included: false },
    ],
    cta: "Get Started Free",
    popular: false,
    href: "/register",
  },
  {
    name: "Premium",
    description: "Everything you need for a seamless wedding",
    monthlyPrice: 399,
    yearlyPrice: 3499,
    features: [
      { name: "1 active event", included: true },
      { name: "Up to 300 guests", included: true },
      { name: "Wedding website with RSVP", included: true },
      { name: "Advanced seating chart + PDF export", included: true },
      { name: "Vendor directory access", included: true },
      { name: "Planning checklist", included: true },
      { name: "Custom domain", included: true },
      { name: "Budget tracker", included: true },
      { name: "Vendor collaboration invites", included: true },
      { name: "Priority support", included: true },
    ],
    cta: "Start Premium",
    popular: true,
    href: "/checkout?plan=premium",
  },
  {
    name: "Elite",
    description: "For larger weddings and multiple events",
    monthlyPrice: 799,
    yearlyPrice: 6999,
    features: [
      { name: "Unlimited events", included: true },
      { name: "Unlimited guests", included: true },
      { name: "Wedding website with RSVP", included: true },
      { name: "Advanced seating chart + PDF export", included: true },
      { name: "Vendor directory access", included: true },
      { name: "Planning checklist", included: true },
      { name: "Custom domain", included: true },
      { name: "Budget tracker", included: true },
      { name: "Vendor collaboration invites", included: true },
      { name: "Event analytics & export", included: true },
    ],
    cta: "Start Elite",
    popular: false,
    href: "/checkout?plan=elite",
  },
];

export function PricingTable() {
  const [billing, setBilling] = useState<BillingPeriod>("yearly");

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            Pricing
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start for free. Upgrade when you need more. All prices in SEK, VAT excluded.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="mx-auto mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => setBilling("monthly")}
            className={cn(
              "text-sm font-medium transition-colors",
              billing === "monthly" ? "text-foreground" : "text-muted-foreground"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling(billing === "monthly" ? "yearly" : "monthly")}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors"
            aria-label="Toggle billing period"
          >
            <span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                billing === "yearly" ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-colors",
              billing === "yearly" ? "text-foreground" : "text-muted-foreground"
            )}
          >
            Yearly
            <Badge className="bg-green-100 text-green-700 text-xs">Save ~25%</Badge>
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {packages.map((pkg) => {
            const price = billing === "monthly" ? pkg.monthlyPrice : pkg.yearlyPrice;
            const period = billing === "monthly" ? "/mo" : "/yr";

            return (
              <Card
                key={pkg.name}
                className={cn(
                  "relative flex flex-col",
                  pkg.popular && "border-primary shadow-lg ring-1 ring-primary"
                )}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                  <div className="mt-4">
                    {price === 0 ? (
                      <span className="text-4xl font-bold text-foreground">Free</span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-foreground">
                          {price.toLocaleString("sv-SE")} SEK
                        </span>
                        <span className="text-muted-foreground">{period}</span>
                      </>
                    )}
                  </div>
                  {billing === "yearly" && price > 0 && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Billed annually
                    </p>
                  )}
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {pkg.features.map((feature) => (
                      <li key={feature.name} className="flex items-center gap-3">
                        {feature.included ? (
                          <Check className="h-5 w-5 shrink-0 text-primary" />
                        ) : (
                          <X className="h-5 w-5 shrink-0 text-muted-foreground/50" />
                        )}
                        <span
                          className={cn(
                            "text-sm",
                            feature.included
                              ? "text-foreground"
                              : "text-muted-foreground/70"
                          )}
                        >
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="group w-full"
                    variant={pkg.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href={`${pkg.href}&billing=${billing}`}>
                      {pkg.cta}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* White-Label CTA */}
        <div className="mt-12 rounded-xl border bg-muted/50 p-8 text-center">
          <h3 className="text-xl font-semibold text-foreground">
            Professional Wedding Planner?
          </h3>
          <p className="mt-2 text-muted-foreground">
            Our White-Label plan lets you manage unlimited client events under your own brand.
            Custom pricing based on your needs.
          </p>
          <Button className="mt-4" variant="default" asChild>
            <Link href="/contact?subject=white-label">Contact Us for White-Label</Link>
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            All plans include free customer support. Prices exclude Swedish VAT (Moms 25%). Need help choosing?{" "}
            <Link href="/contact" className="text-primary hover:underline">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
