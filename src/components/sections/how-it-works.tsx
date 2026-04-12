import { Badge } from "@/components/ui/badge";
import {
  ClipboardList,
  Users,
  Globe,
  Rocket,
} from "lucide-react";

const steps = [
  {
    step: 1,
    icon: ClipboardList,
    title: "Create Your Event",
    description:
      "Sign up for free, create your wedding event, and set your date. It only takes a minute to get started.",
  },
  {
    step: 2,
    icon: Users,
    title: "Add Your Guests",
    description:
      "Import your guest list from a spreadsheet or add guests one by one. Organize them into families and groups with ease.",
  },
  {
    step: 3,
    icon: Globe,
    title: "Launch Your Wedding Website",
    description:
      "Publish your beautiful event website in one click. Guests can RSVP, check details, and confirm meal preferences — all online.",
  },
  {
    step: 4,
    icon: Rocket,
    title: "Enjoy Your Day",
    description:
      "Finalize your seating chart, coordinate your vendors, and walk down the aisle knowing every detail is organized.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            How It Works
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Plan Your Wedding in 4 Simple Steps
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We have simplified wedding planning so you can focus on what matters
            — celebrating with the people you love.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, index) => (
            <div key={item.step} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-12 hidden h-0.5 w-full bg-gradient-to-r from-primary to-primary/20 lg:block" />
              )}

              <div className="relative flex flex-col items-center text-center">
                {/* Step Number */}
                <div className="relative">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                    <item.icon className="h-10 w-10 text-primary" />
                  </div>
                  <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {item.step}
                  </div>
                </div>

                {/* Content */}
                <h3 className="mt-6 text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
