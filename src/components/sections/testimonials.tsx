import { Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import prisma from "@/lib/db";

// Fallback testimonials if database is empty
const fallbackTestimonials = [
  {
    id: "1",
    name: "Emma & Oliver Lindqvist",
    country: "Sweden",
    company: "Wedding Couple",
    content:
      "Ceremoney made our entire wedding planning so much easier. The seating chart feature saved us hours, and guests loved how elegant our wedding website looked. We got RSVPs from everyone in the first week!",
    rating: 5,
    eventsPlanned: 1,
  },
  {
    id: "2",
    name: "Sofia & Ahmed Karlsson",
    country: "Sweden",
    company: "Wedding Couple",
    content:
      "We used Ceremoney Elite and the QR code entrance scanning was absolutely brilliant. Our venue coordinator was amazed — check-in took seconds for each guest. Worth every öre.",
    rating: 5,
    eventsPlanned: 1,
  },
  {
    id: "3",
    name: "Maja & Felix Bergström",
    country: "Sweden",
    company: "Wedding Couple",
    content:
      "As someone who is not tech-savvy at all, I was worried about building a wedding website. Ceremoney was incredibly easy to use. Our website was live in under an hour and looked absolutely beautiful.",
    rating: 5,
    eventsPlanned: 1,
  },
  {
    id: "4",
    name: "Alicia & Tom Johansson",
    country: "Sweden",
    company: "Wedding Couple",
    content:
      "The stationery designer in Elite is stunning. We designed our digital invitations to perfectly match our wedding theme and colors. Guests loved receiving them. Highly recommend!",
    rating: 5,
    eventsPlanned: 1,
  },
  {
    id: "5",
    name: "Sara Lindqvist",
    country: "Sweden",
    company: "Wedding Planner",
    content:
      "As a professional wedding planner, I use Ceremoney for all my clients. The vendor directory saved me hours of research, and the seating chart tool is genuinely the best I've ever used. My clients are always impressed.",
    rating: 5,
    eventsPlanned: 40,
  },
  {
    id: "6",
    name: "Hannah Berg",
    country: "Sweden",
    company: "Event Coordinator",
    content:
      "Managing dietary restrictions for guests seemed impossible before Ceremoney. The platform collected everything we needed so we could export a clean list straight to the caterer. Game changer.",
    rating: 5,
    eventsPlanned: 25,
  },
];

function getInitials(name: string) {
  const parts = name.split(" ");
  if (parts.length >= 3 && parts[1] === "&") {
    // "Emma & Oliver" -> "E&"
    return parts[0][0] + "&";
  }
  return parts
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

type TestimonialItem = {
  id: string;
  name: string;
  country: string;
  company: string | null;
  content: string;
  rating: number;
  eventsPlanned?: number;
};

async function getTestimonials(): Promise<TestimonialItem[]> {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 6,
    });

    if (testimonials.length === 0) {
      return fallbackTestimonials;
    }

    return testimonials.map((t) => ({ ...t, eventsPlanned: undefined }));
  } catch {
    return fallbackTestimonials;
  }
}

export async function Testimonials() {
  const testimonials = await getTestimonials();

  return (
    <section
      className="py-16 lg:py-24"
      style={{
        background:
          "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 30%, #ede9fe 70%, #f5f3ff 100%)",
      }}
    >
      <div className="w-full px-6 lg:px-16 xl:px-24">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white/80 px-5 py-2 text-sm font-semibold text-purple-700 shadow-sm">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            Trusted by Thousands
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            What Event Planners Say
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Join thousands of happy planners who&apos;ve created unforgettable
            events
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="flex flex-col rounded-2xl bg-white p-8 shadow-md"
            >
              {/* Rating */}
              <div className="mb-4 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < testimonial.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                ))}
              </div>

              {/* Big Quote Mark */}
              <div className="mb-4 text-5xl font-bold leading-none text-purple-300 select-none">
                &#x275D;&#x275E;
              </div>

              {/* Content */}
              <p className="flex-1 text-base leading-relaxed text-gray-600">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Divider */}
              <div className="my-6 h-0.5 w-14 bg-gradient-to-r from-purple-400 to-pink-400" />

              {/* Author */}
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-pink-400 text-sm font-semibold text-white">
                    {getInitials(testimonial.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-gray-400">{testimonial.company}</p>
                  {testimonial.eventsPlanned !== undefined &&
                    testimonial.eventsPlanned > 0 && (
                      <p className="text-xs font-medium text-purple-600">
                        {testimonial.eventsPlanned}++ events planned
                      </p>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
