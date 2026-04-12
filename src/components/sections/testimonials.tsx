import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import prisma from "@/lib/db";

// Fallback testimonials if database is empty
const fallbackTestimonials = [
  {
    id: "1",
    name: "Emma & Lucas",
    country: "Sweden",
    company: "Wedding — Stockholm",
    content:
      "Ceremoney made our entire wedding planning so much easier. The guest list, seating chart, and event website all in one place — we couldn't imagine doing it any other way. Our guests loved the RSVP experience!",
    rating: 5,
  },
  {
    id: "2",
    name: "Sara Lindqvist",
    country: "Sweden",
    company: "Wedding Planner",
    content:
      "As a professional wedding planner, I use Ceremoney for all my clients. The vendor directory saved me hours of research, and the seating chart tool is genuinely the best I've ever used. My clients are always impressed.",
    rating: 5,
  },
  {
    id: "3",
    name: "Aisha & Mohammed",
    country: "UAE",
    company: "Wedding — Dubai",
    content:
      "We planned our wedding from abroad using Ceremoney. The Arabic RTL support was perfect, and coordinating with Swedish vendors through the platform was seamless. Absolutely recommend for international couples.",
    rating: 5,
  },
  {
    id: "4",
    name: "Sofia Bergman",
    country: "Sweden",
    company: "Baptism — Gothenburg",
    content:
      "Used Ceremoney for my son's baptism and it was wonderful. The event website with countdown timer was a big hit with the family. The checklist feature kept me on track for months before the day.",
    rating: 5,
  },
  {
    id: "5",
    name: "Anna & Erik",
    country: "Sweden",
    company: "Wedding — Malmö",
    content:
      "The Elite plan was worth every krona. The printable stationery and QR entrance feature at our wedding felt so modern and professional. Our guests were impressed. Planning was stress-free from start to finish.",
    rating: 5,
  },
  {
    id: "6",
    name: "Olivia Chen",
    country: "UK",
    company: "Wedding — London",
    content:
      "Found Ceremoney while searching for wedding planning tools and it exceeded all expectations. The vendor discovery feature helped us find our photographer and florist in minutes. Beautiful platform — highly recommend!",
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

async function getTestimonials() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 6,
    });

    if (testimonials.length === 0) {
      return fallbackTestimonials;
    }

    return testimonials;
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return fallbackTestimonials;
  }
}

export async function Testimonials() {
  const testimonials = await getTestimonials();

  return (
    <section className="bg-muted/30 py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            Testimonials
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Loved by Couples & Planners Worldwide
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            See what couples, hosts, and wedding planners have to say about
            their experience with Ceremoney.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="relative">
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
                  &ldquo;{testimonial.content}&rdquo;
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
                      {[testimonial.company, testimonial.country]
                        .filter(Boolean)
                        .join(" • ")}
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
              {testimonials.slice(0, 4).map((t, i) => (
                <Avatar key={i} className="border-2 border-background">
                  <AvatarFallback className="bg-primary/10 text-xs text-primary">
                    {getInitials(t.name)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              Join thousands of happy couples
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
              (1,200+ reviews)
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
