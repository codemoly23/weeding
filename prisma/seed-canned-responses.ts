import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🤖 Seeding canned responses...");

  // Get admin user
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (!admin) {
    console.error("No admin user found!");
    return;
  }

  // Delete existing canned responses
  await prisma.cannedResponse.deleteMany({});

  const cannedResponses = [
    {
      title: "Welcome Message",
      content:
        "Hello! Thank you for contacting Ceremoney support. We're here to help you with your wedding planning and event services. How can we assist you today?",
      category: "General",
      isPublic: true,
      createdById: admin.id,
    },
    {
      title: "Booking Confirmation Timeline",
      content:
        "Vendor booking confirmations are typically received within 24-48 hours after your package is confirmed with us. Once we receive them, we'll send them to you immediately via email. You'll be able to download them from your dashboard as well.",
      category: "Wedding Planning",
      isPublic: true,
      createdById: admin.id,
    },
    {
      title: "Planning Processing Time",
      content:
        "Initial wedding plan proposals typically take 3-5 business days for standard processing. If you've selected an expedited package, it can be completed within 24 hours. You'll receive email updates at each stage:\n\n1. Planning brief submitted\n2. Vendor shortlists prepared\n3. Proposals sent for review\n4. Documents ready for download",
      category: "Wedding Planning",
      isPublic: true,
      createdById: admin.id,
    },
    {
      title: "Document Upload Request",
      content:
        "To proceed with your order, we need you to upload the required documents. Please:\n\n1. Log in to your dashboard at https://ceremoney.com/dashboard\n2. Go to Documents section\n3. Upload the requested files\n\nIf you're having trouble uploading, please let us know and we can assist you.",
      category: "Documents",
      isPublic: true,
      createdById: admin.id,
    },
    {
      title: "Venue Booking Setup",
      content:
        "Setting up your venue booking typically takes 3-7 business days after your package is confirmed. Here's what we need from you:\n\n✓ Wedding date and guest count\n✓ Preferred venue style (outdoor, ballroom, etc.)\n✓ Budget range\n✓ Contact details for both partners\n✓ Any special requirements or preferences\n\nWe'll guide you through each step!",
      category: "Venue Services",
      isPublic: true,
      createdById: admin.id,
    },
    {
      title: "Payment Confirmation",
      content:
        "We've received your payment successfully! Your order is now being processed. You can track the status in your dashboard at https://ceremoney.com/dashboard\n\nOrder Number: [ORDER_NUMBER]\nTotal Paid: $[AMOUNT]\n\nWe'll send you email updates as we progress. Thank you for choosing Ceremoney!",
      category: "Billing",
      isPublic: true,
      createdById: admin.id,
    },
    {
      title: "Refund Policy",
      content:
        "We offer a 100% money-back guarantee if:\n\n• Venue becomes unavailable after booking (rare)\n• We cannot deliver the service as promised\n• You cancel within 24 hours of placing your order\n\nAfter vendor deposits have been submitted, we cannot issue refunds for third-party fees. However, we'll work with you to resolve any issues. Please review our full refund policy at https://ceremoney.com/refund-policy",
      category: "Billing",
      isPublic: true,
      createdById: admin.id,
    },
    {
      title: "Coordinator Service",
      content:
        "Our Wedding Coordinator service includes:\n\n✓ Dedicated coordinator for your event\n✓ Vendor communication and follow-ups\n✓ Day-of timeline management\n✓ Secure online access to your planning documents\n✓ Milestone reminders throughout planning\n\nRenewal packages available for multi-event clients.",
      category: "Coordination",
      isPublic: true,
      createdById: admin.id,
    },
    {
      title: "Planning Brief",
      content:
        "Your planning brief is customized for your wedding and includes:\n\n• Wedding date and venue details\n• Guest list and seating overview\n• Ceremony and reception timeline\n• Vendor contact list\n• Budget breakdown\n• Special requirements\n\nYou'll receive it as a PDF that you can share with vendors. It's included free with our wedding planning packages!",
      category: "Wedding Planning",
      isPublic: true,
      createdById: admin.id,
    },
    {
      title: "Vendor Recommendation",
      content:
        "For your wedding, we recommend considering these vendor categories:\n\n1. **Photography** - Capturing memories that last a lifetime\n2. **Catering** - Tailored menus for every dietary need\n3. **Floral Design** - From simple elegance to lavish arrangements\n\nWe can connect you with our curated vendor network. Let us know your preferences and budget!",
      category: "Vendors",
      isPublic: true,
      createdById: admin.id,
    },
    {
      title: "Style Consultation",
      content:
        "Before finalizing your décor, we conduct a comprehensive style consultation to ensure:\n\n✓ Theme and color palette align with your vision\n✓ Vendor selections match your aesthetic\n✓ Budget is allocated effectively\n\nThe consultation takes 2-3 business days. If we find alternatives that better suit your vision, we'll suggest them before proceeding.",
      category: "Design",
      isPublic: true,
      createdById: admin.id,
    },
    {
      title: "Photography Package Details",
      content:
        "For your wedding photography, you will need:\n\n1. **Confirmed wedding date and venue**\n2. **Shot list and must-have moments**\n3. **Contact details for key family members**\n4. **Timeline of the day**\n\nPhotography packages include engagement shoots, full-day coverage, and digital gallery delivery. We can help you find the right photographer for your budget.",
      category: "Photography",
      isPublic: true,
      createdById: admin.id,
    },
    {
      title: "Timeline & Milestones",
      content:
        "Don't worry about missing planning milestones! Our coordination service includes:\n\n✓ Booking deadline tracking\n✓ Vendor payment reminders\n✓ RSVP management\n✓ Milestone reminders 60 days in advance\n✓ Document retention\n\nWe'll handle everything for you automatically throughout your planning journey.",
      category: "Coordination",
      isPublic: true,
      createdById: admin.id,
    },
    {
      title: "Virtual Planning Dashboard",
      content:
        "Your Ceremoney planning dashboard includes:\n\n✓ Centralized wedding checklist\n✓ Guest list and RSVP tracking\n✓ Vendor contact management\n✓ Budget tracker\n✓ Online access 24/7\n\nPerfect for coordinating between families, vendors, and your planning team!",
      category: "Services",
      isPublic: true,
      createdById: admin.id,
    },
    {
      title: "Order Status Update",
      content:
        "Your order is currently: [STATUS]\n\nNext steps:\n1. [NEXT_STEP_1]\n2. [NEXT_STEP_2]\n\nEstimated completion: [DATE]\n\nYou can check detailed status anytime at https://ceremoney.com/dashboard\n\nNeed anything else? Just reply to this message!",
      category: "General",
      isPublic: true,
      createdById: admin.id,
    },
  ];

  for (const response of cannedResponses) {
    await prisma.cannedResponse.create({
      data: response,
    });
  }

  console.log(`✅ Created ${cannedResponses.length} canned responses`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
