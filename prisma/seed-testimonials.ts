import prisma from "../src/lib/db";

const testimonials = [
  {
    id: "new_001",
    name: "Priya Sharma",
    country: "India",
    company: "Bride & Groom",
    content:
      "I was hesitant about planning a destination wedding, but Ceremoney made it incredibly smooth. Within 10 days, I had my venue shortlist, catering quotes, and photographer booked. Now our dream wedding is taking shape! Their expertise saved me months of research.",
    rating: 5,
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "new_002",
    name: "Ahmed Al-Farsi",
    country: "UAE",
    company: "Wedding Couple",
    content:
      "Outstanding service! Ceremoney handled my entire wedding coordination, vendor bookings, and timeline seamlessly. The team's professionalism and quick response time exceeded all expectations. Highly recommend for couples planning their big day.",
    rating: 5,
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "new_003",
    name: "Imran Khan",
    country: "Pakistan",
    company: "Engaged Couple",
    content:
      "After comparing 5+ planning services, I chose Ceremoney for their transparency and expertise. Best decision ever! They guided me through venue selection, catering planning, and even helped coordinate with our photographer. True planning partners, not just a service provider.",
    rating: 5,
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "new_004",
    name: "Vijay Patel",
    country: "India",
    company: "Newlyweds",
    content:
      "Ceremoney's Premium package was worth every penny. Got our venue, catering, and floral arrangements done professionally. Their knowledge of wedding planning challenges is unmatched. Our ceremony looked incredible and ran perfectly!",
    rating: 5,
    isActive: true,
    sortOrder: 4,
  },
  {
    id: "new_005",
    name: "Sarah Johnson",
    country: "UK",
    company: "Bride",
    content:
      "I needed full wedding coordination on a tight timeline. Ceremoney delivered everything - venue, catering, decorations - within a week of booking. Their step-by-step guidance made complex planning simple. Our wedding was perfect and guests were amazed!",
    rating: 5,
    isActive: true,
    sortOrder: 5,
  },
  {
    id: "new_006",
    name: "Omar Hassan",
    country: "UAE",
    company: "Wedding Couple",
    content:
      "Exceptional experience from start to finish! Ceremoney helped us plan our destination wedding with seamless coordination. The vendor management was reliable, and their planning support ensured we never missed important milestones. Trustworthy partner for celebrating love.",
    rating: 5,
    isActive: true,
    sortOrder: 6,
  },
];

async function main() {
  console.log("🌱 Seeding testimonials...");

  // Delete old testimonials
  await prisma.testimonial.deleteMany({});
  console.log("✅ Deleted old testimonials");

  // Create new testimonials
  for (const testimonial of testimonials) {
    await prisma.testimonial.create({
      data: testimonial,
    });
  }

  console.log(`✅ Created ${testimonials.length} new testimonials`);
  console.log("🎉 Testimonials seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
