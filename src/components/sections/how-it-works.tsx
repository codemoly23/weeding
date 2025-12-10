import { Badge } from "@/components/ui/badge";
import {
  ClipboardList,
  FileCheck,
  Building2,
  Rocket,
} from "lucide-react";

const steps = [
  {
    step: 1,
    icon: ClipboardList,
    title: "Choose Your Package",
    description:
      "Select the LLC formation package that fits your needs. Pick your state and provide basic information about your business.",
  },
  {
    step: 2,
    icon: FileCheck,
    title: "We Handle the Paperwork",
    description:
      "Our team prepares and files all necessary documents with the state. We ensure everything is accurate and compliant.",
  },
  {
    step: 3,
    icon: Building2,
    title: "Receive Your Documents",
    description:
      "Get your LLC approval, Articles of Organization, Operating Agreement, and EIN delivered to your email within 24-48 hours.",
  },
  {
    step: 4,
    icon: Rocket,
    title: "Launch Your Business",
    description:
      "Open your US business bank account, set up your Amazon seller account, and start accepting payments. You're ready to go!",
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
            Start Your LLC in 4 Simple Steps
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We've simplified the process so you can focus on what matters —
            building your business.
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
