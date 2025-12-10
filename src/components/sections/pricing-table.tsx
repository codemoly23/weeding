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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const states = [
  { code: "WY", name: "Wyoming", fee: 100 },
  { code: "DE", name: "Delaware", fee: 140 },
  { code: "NM", name: "New Mexico", fee: 50 },
  { code: "TX", name: "Texas", fee: 300 },
  { code: "FL", name: "Florida", fee: 125 },
];

const packages = [
  {
    name: "Basic",
    description: "Essential LLC formation with core documents",
    price: 149,
    features: [
      { name: "LLC Formation Filing", included: true },
      { name: "Articles of Organization", included: true },
      { name: "Operating Agreement", included: true },
      { name: "Digital Document Storage", included: true },
      { name: "EIN Application", included: false },
      { name: "Registered Agent (1 Year)", included: false },
      { name: "Virtual Address", included: false },
      { name: "Business Banking Assistance", included: false },
      { name: "Priority Support", included: false },
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Standard",
    description: "Complete package for serious entrepreneurs",
    price: 299,
    features: [
      { name: "LLC Formation Filing", included: true },
      { name: "Articles of Organization", included: true },
      { name: "Operating Agreement", included: true },
      { name: "Digital Document Storage", included: true },
      { name: "EIN Application", included: true },
      { name: "Registered Agent (1 Year)", included: true },
      { name: "Virtual Address", included: false },
      { name: "Business Banking Assistance", included: false },
      { name: "Priority Support", included: true },
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Premium",
    description: "All-inclusive package for Amazon sellers",
    price: 499,
    features: [
      { name: "LLC Formation Filing", included: true },
      { name: "Articles of Organization", included: true },
      { name: "Operating Agreement", included: true },
      { name: "Digital Document Storage", included: true },
      { name: "EIN Application", included: true },
      { name: "Registered Agent (1 Year)", included: true },
      { name: "Virtual Address", included: true },
      { name: "Business Banking Assistance", included: true },
      { name: "Priority Support", included: true },
    ],
    cta: "Get Started",
    popular: false,
  },
];

export function PricingTable() {
  const [selectedState, setSelectedState] = useState(states[0]);

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            Pricing
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Transparent Pricing, No Hidden Fees
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the package that fits your needs. State filing fees are
            separate and vary by state.
          </p>
        </div>

        {/* State Selector */}
        <div className="mx-auto mt-8 max-w-xs">
          <label className="mb-2 block text-sm font-medium text-foreground">
            Select your state for accurate pricing
          </label>
          <Select
            value={selectedState.code}
            onValueChange={(value) =>
              setSelectedState(states.find((s) => s.code === value) || states[0])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a state" />
            </SelectTrigger>
            <SelectContent>
              {states.map((state) => (
                <SelectItem key={state.code} value={state.code}>
                  {state.name} (${state.fee} state fee)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pricing Cards */}
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {packages.map((pkg) => (
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
                  <span className="text-4xl font-bold text-foreground">
                    ${pkg.price}
                  </span>
                  <span className="text-muted-foreground"> + </span>
                  <span className="text-lg font-semibold text-primary">
                    ${selectedState.fee}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {" "}
                    state fee
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Total:{" "}
                  <span className="font-semibold text-foreground">
                    ${pkg.price + selectedState.fee}
                  </span>
                </p>
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
                  <Link
                    href={`/checkout?package=${pkg.name.toLowerCase()}&state=${selectedState.code}`}
                  >
                    {pkg.cta}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            All packages include free customer support. Need help choosing?{" "}
            <Link href="/contact" className="text-primary hover:underline">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
