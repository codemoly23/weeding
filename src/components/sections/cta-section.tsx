import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, MessageCircle } from "lucide-react";

const benefits = [
  "24-48 hour LLC formation",
  "Dedicated support team",
  "No hidden fees guaranteed",
  "100% satisfaction guarantee",
];

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-primary py-16 lg:py-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-0 top-0 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[300px] translate-x-1/2 translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            Ready to Start Your US Business?
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80">
            Join thousands of international entrepreneurs who have successfully
            launched their US LLC with LLCPad. Get started in minutes.
          </p>

          {/* Benefits */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-center gap-2 text-primary-foreground/90"
              >
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              variant="secondary"
              className="group w-full sm:w-auto"
              asChild
            >
              <Link href="/services/llc-formation">
                Start Your LLC Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto"
              asChild
            >
              <Link href="/contact">
                <MessageCircle className="mr-2 h-4 w-4" />
                Talk to Us
              </Link>
            </Button>
          </div>

          {/* Trust Line */}
          <p className="mt-8 text-sm text-primary-foreground/70">
            🔒 Your information is secure and encrypted. We never share your
            data.
          </p>
        </div>
      </div>
    </section>
  );
}
