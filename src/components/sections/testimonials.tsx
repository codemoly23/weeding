import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Rakib Hassan",
    country: "Bangladesh",
    role: "Amazon FBA Seller",
    content:
      "LLCPad made it incredibly easy to start my US business from Bangladesh. The team handled everything from LLC formation to getting my EIN. Now I'm successfully selling on Amazon US!",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    country: "India",
    role: "E-commerce Entrepreneur",
    content:
      "As a first-time international seller, I was worried about the complexity. LLCPad simplified everything. Their step-by-step guidance and quick response time exceeded my expectations.",
    rating: 5,
  },
  {
    name: "Ahmed Al-Farsi",
    country: "UAE",
    role: "Business Owner",
    content:
      "Professional service with excellent communication. Got my Wyoming LLC and business bank account set up within a week. Highly recommend for anyone looking to expand to the US market.",
    rating: 5,
  },
  {
    name: "Imran Khan",
    country: "Pakistan",
    role: "Dropshipping Business",
    content:
      "The Premium package was worth every penny. From LLC to Amazon seller account, everything was handled professionally. Their virtual address service is also top-notch.",
    rating: 5,
  },
  {
    name: "Fatima Begum",
    country: "Bangladesh",
    role: "Wholesale Seller",
    content:
      "Fast, reliable, and affordable. I compared many services before choosing LLCPad and I'm glad I did. The customer support team is always available to help.",
    rating: 5,
  },
  {
    name: "Vijay Patel",
    country: "India",
    role: "Tech Entrepreneur",
    content:
      "Setting up my US LLC was seamless with LLCPad. The documentation was thorough and the process was transparent. Great value for money compared to US-based services.",
    rating: 5,
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function Testimonials() {
  return (
    <section className="bg-muted/30 py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            Testimonials
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Trusted by 10,000+ Entrepreneurs Worldwide
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            See what our customers from around the world have to say about their
            experience with LLCPad.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative">
              <CardContent className="p-6">
                {/* Quote Icon */}
                <Quote className="absolute right-6 top-6 h-8 w-8 text-primary/10" />

                {/* Rating */}
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-accent text-accent"
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="mb-6 text-sm text-muted-foreground">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(testimonial.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role} • {testimonial.country}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {["RH", "PS", "AF", "IK"].map((initials, i) => (
                <Avatar key={i} className="border-2 border-background">
                  <AvatarFallback className="bg-primary/10 text-xs text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              Join 10,000+ happy customers
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-accent text-accent" />
              ))}
            </div>
            <span className="ml-2 text-sm font-medium text-foreground">
              4.9/5
            </span>
            <span className="text-sm text-muted-foreground">
              (2,500+ reviews)
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
