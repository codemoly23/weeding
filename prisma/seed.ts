import { PrismaClient, FeatureValueType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

// Use DATABASE_URL from .env for consistency
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── Service Categories ────────────────────────────────────────────────────────
const serviceCategories = [
  {
    slug: "subscriptions",
    name: "Subscription Plans",
    description: "Choose a Ceremoney plan that fits your wedding size and needs",
    icon: "Sparkles",
    sortOrder: 1,
  },
  {
    slug: "addons",
    name: "Add-ons",
    description: "Enhance your plan with individual features and extras",
    icon: "PlusCircle",
    sortOrder: 2,
  },
  {
    slug: "professional",
    name: "Professional Tools",
    description: "Advanced tools and white-label solutions for wedding planners",
    icon: "Briefcase",
    sortOrder: 3,
  },
];

// ─── Premium plan comparison features ─────────────────────────────────────────
// Used on the main subscription comparison table (Basic / Premium / Elite)
const subscriptionComparisonFeatures = [
  {
    text: "Event Website",
    tooltip: "A beautiful, shareable wedding website with countdown, story, and gallery",
    packages: {
      Basic:   { valueType: "BOOLEAN" as FeatureValueType, included: true },
      Premium: { valueType: "BOOLEAN" as FeatureValueType, included: true },
      Elite:   { valueType: "BOOLEAN" as FeatureValueType, included: true },
    },
  },
  {
    text: "Basic RSVP Collection",
    tooltip: "Collect yes/no RSVPs from guests via your event website",
    packages: {
      Basic:   { valueType: "BOOLEAN" as FeatureValueType, included: true },
      Premium: { valueType: "BOOLEAN" as FeatureValueType, included: true },
      Elite:   { valueType: "BOOLEAN" as FeatureValueType, included: true },
    },
  },
  {
    text: "Wedding Checklist",
    tooltip: "Guided checklist covering every task from 12 months out to the big day",
    packages: {
      Basic:   { valueType: "BOOLEAN" as FeatureValueType, included: true },
      Premium: { valueType: "BOOLEAN" as FeatureValueType, included: true },
      Elite:   { valueType: "BOOLEAN" as FeatureValueType, included: true },
    },
  },
  {
    text: "Vendor Directory Access",
    tooltip: "Browse vetted photographers, florists, caterers, and venues",
    packages: {
      Basic:   { valueType: "BOOLEAN" as FeatureValueType, included: true },
      Premium: { valueType: "BOOLEAN" as FeatureValueType, included: true },
      Elite:   { valueType: "BOOLEAN" as FeatureValueType, included: true },
    },
  },
  {
    text: "Guest List Management",
    tooltip: "Add, organise, and track guests with contact details and dietary notes",
    packages: {
      Basic:   { valueType: "DASH" as FeatureValueType, included: false },
      Premium: { valueType: "BOOLEAN" as FeatureValueType, included: true },
      Elite:   { valueType: "BOOLEAN" as FeatureValueType, included: true },
    },
  },
  {
    text: "Seating Chart Builder",
    tooltip: "Interactive drag-and-drop seating chart with table and seat assignments",
    packages: {
      Basic:   { valueType: "DASH" as FeatureValueType, included: false },
      Premium: { valueType: "BOOLEAN" as FeatureValueType, included: true },
      Elite:   { valueType: "BOOLEAN" as FeatureValueType, included: true },
    },
  },
  {
    text: "Custom Domain",
    tooltip: "Connect your own domain (e.g. emma-and-lucas.com) to your event website",
    packages: {
      Basic:   { valueType: "DASH" as FeatureValueType, included: false },
      Premium: { valueType: "BOOLEAN" as FeatureValueType, included: true },
      Elite:   { valueType: "BOOLEAN" as FeatureValueType, included: true },
    },
  },
  {
    text: "Digital Stationery",
    tooltip: "Design and send digital save-the-dates and invitations",
    packages: {
      Basic:   { valueType: "DASH" as FeatureValueType, included: false },
      Premium: { valueType: "BOOLEAN" as FeatureValueType, included: true },
      Elite:   { valueType: "BOOLEAN" as FeatureValueType, included: true },
    },
  },
  {
    text: "Collaborators",
    tooltip: "Invite parents, bridesmaids, or other helpers to co-manage the planning",
    packages: {
      Basic:   { valueType: "DASH" as FeatureValueType, included: false },
      Premium: { valueType: "ADDON" as FeatureValueType, included: false, addonPriceUSD: 5 },
      Elite:   { valueType: "BOOLEAN" as FeatureValueType, included: true },
    },
  },
  {
    text: "QR Code Entrance Check-in",
    tooltip: "Generate unique QR codes per guest for fast, contactless door check-in",
    packages: {
      Basic:   { valueType: "DASH" as FeatureValueType, included: false },
      Premium: { valueType: "DASH" as FeatureValueType, included: false },
      Elite:   { valueType: "BOOLEAN" as FeatureValueType, included: true },
    },
  },
  {
    text: "Advanced RSVP Forms",
    tooltip: "Custom RSVP questions: meal choices, song requests, shuttle needs, and more",
    packages: {
      Basic:   { valueType: "DASH" as FeatureValueType, included: false },
      Premium: { valueType: "DASH" as FeatureValueType, included: false },
      Elite:   { valueType: "BOOLEAN" as FeatureValueType, included: true },
    },
  },
  {
    text: "Priority Support",
    tooltip: "Dedicated support queue with guaranteed response within 4 business hours",
    packages: {
      Basic:   { valueType: "DASH" as FeatureValueType, included: false },
      Premium: { valueType: "DASH" as FeatureValueType, included: false },
      Elite:   { valueType: "BOOLEAN" as FeatureValueType, included: true },
    },
  },
];

// ─── Full services data ────────────────────────────────────────────────────────
const servicesData = [
  // ── SUBSCRIPTION PLANS ──────────────────────────────────────────────────────
  {
    slug: "plan-basic",
    name: "Basic Plan",
    shortDesc: "Everything you need to get started — free forever. Build your event website, collect RSVPs, and access our vendor directory.",
    metaTitle: "Basic Plan (Free) | Ceremoney – Wedding Planning Made Simple",
    metaDescription: "Start planning your wedding for free. Ceremoney's Basic plan includes an event website, RSVP collection, a guided checklist, and access to our vendor directory. No credit card required.",
    description: `<p>Start planning your wedding with Ceremoney at no cost. The Basic plan gives you the essential tools to begin organising your big day — no credit card required, no time limit.</p>

<h3>What's Included</h3>
<ul>
  <li><strong>Event Website:</strong> A beautiful, mobile-friendly wedding website with countdown, love story, photo gallery, and venue map.</li>
  <li><strong>Basic RSVP:</strong> Collect simple yes/no RSVPs from guests directly through your event website.</li>
  <li><strong>Wedding Checklist:</strong> A guided task list covering everything from 12 months before the wedding down to the final week.</li>
  <li><strong>Vendor Directory:</strong> Browse and shortlist vetted photographers, florists, caterers, DJs, and venues.</li>
</ul>

<h3>When Should You Upgrade?</h3>
<p>The Basic plan is perfect for couples in the early stages of planning. When you're ready to manage your full guest list, build a seating chart, or send digital invitations, upgrade to Premium or Elite.</p>`,
    icon: "Sparkles",
    image: "/images/services/plan-basic.jpg",
    startingPrice: 0,
    categorySlug: "subscriptions",
    isPopular: false,
    features: [
      "Event website (unlimited pages)",
      "Basic RSVP collection",
      "Guided wedding checklist",
      "Vendor directory access",
      "Mobile-friendly design",
      "Ceremoney subdomain included",
    ],
    packages: [
      {
        name: "Basic",
        price: 0,
        description: "Free forever — no credit card required",
        processingTime: "Instant",
        processingIcon: "zap",
        badgeText: null,
        badgeColor: null,
        features: [],
        notIncluded: [],
        isPopular: false,
      },
    ],
    comparisonFeatures: subscriptionComparisonFeatures,
    faqs: [
      {
        question: "Is the Basic plan really free forever?",
        answer: "Yes. The Basic plan is completely free with no hidden fees and no time limit. You can stay on the Basic plan for as long as you need.",
      },
      {
        question: "Do I need a credit card to sign up?",
        answer: "No credit card is required for the Basic plan. Simply create an account and start planning.",
      },
      {
        question: "Can I upgrade from Basic to Premium at any time?",
        answer: "Absolutely. You can upgrade to Premium or Elite at any time from your dashboard. Your existing data, website, and RSVPs are preserved when you upgrade.",
      },
    ],
  },
  {
    slug: "plan-premium",
    name: "Premium Plan",
    shortDesc: "The complete wedding planning toolkit. Guest list, seating chart, custom domain, and digital stationery — everything a couple needs.",
    metaTitle: "Premium Plan | 399 SEK/month | Ceremoney Wedding Planning",
    metaDescription: "Upgrade to Ceremoney Premium for 399 SEK/month. Get full guest list management, an interactive seating chart builder, custom domain support, and digital save-the-dates and invitations.",
    description: `<p>Ceremoney Premium gives you everything in Basic plus the full suite of tools you need to plan a seamless wedding. Manage your complete guest list, build your seating chart, and send beautiful digital stationery — all in one place.</p>

<h3>Everything in Basic, Plus:</h3>
<ul>
  <li><strong>Guest List Management:</strong> Add unlimited guests with contact details, dietary requirements, plus/minus tracking, and RSVP status at a glance.</li>
  <li><strong>Seating Chart Builder:</strong> Drag-and-drop tables and seats. Auto-assign guests or arrange them manually. Export to PDF for your venue coordinator.</li>
  <li><strong>Custom Domain:</strong> Connect your own domain (e.g. emma-and-lucas.com) to your Ceremoney event website.</li>
  <li><strong>Digital Stationery:</strong> Design and send personalised save-the-dates and invitations. Track opens and delivery status.</li>
</ul>

<h3>Pricing</h3>
<ul>
  <li><strong>Monthly:</strong> 399 SEK/month — cancel any time</li>
  <li><strong>Annual:</strong> 3 588 SEK/year (equiv. 299 SEK/month — save 25%)</li>
</ul>`,
    icon: "Crown",
    image: "/images/services/plan-premium.jpg",
    startingPrice: 399,
    categorySlug: "subscriptions",
    isPopular: true,
    features: [
      "Everything in Basic",
      "Guest list management (unlimited guests)",
      "Interactive seating chart builder",
      "Custom domain support",
      "Digital save-the-dates & invitations",
      "PDF export for venue coordinators",
      "25% discount on annual billing",
    ],
    packages: [
      {
        name: "Premium",
        price: 399,
        description: "Monthly billing — cancel any time",
        processingTime: "Instant activation",
        processingIcon: "zap",
        badgeText: "Most Popular",
        badgeColor: "rose",
        features: [],
        notIncluded: [],
        isPopular: true,
      },
      {
        name: "Premium Annual",
        price: 299,
        description: "Annual billing — 3 588 SEK/year (save 25%)",
        processingTime: "Instant activation",
        processingIcon: "zap",
        badgeText: "Best Value",
        badgeColor: "green",
        features: [],
        notIncluded: [],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "How many guests can I add to the guest list?",
        answer: "Premium supports unlimited guests. There is no cap on the number of contacts you can add to your guest list.",
      },
      {
        question: "How does custom domain support work?",
        answer: "You point your domain's DNS records to Ceremoney (we provide the values) and your event website will be accessible at your chosen domain, typically within a few hours.",
      },
      {
        question: "Can I cancel my Premium subscription at any time?",
        answer: "Yes. Monthly subscribers can cancel at any time and retain access until the end of the billing period. Annual subscribers can cancel renewal; access continues until the annual period ends.",
      },
      {
        question: "What happens to my data if I downgrade?",
        answer: "Your data is preserved. If you downgrade to Basic, your guest list and seating chart data are saved but become read-only until you upgrade again.",
      },
    ],
  },
  {
    slug: "plan-elite",
    name: "Elite Plan",
    shortDesc: "The ultimate experience. Everything in Premium plus collaborators, QR entrance check-in, advanced RSVP forms, and priority support.",
    metaTitle: "Elite Plan | 799 SEK/month | Ceremoney Wedding Planning",
    metaDescription: "Ceremoney Elite for 799 SEK/month. Includes all Premium features plus multi-collaborator access, QR code door check-in, fully customisable RSVP forms, and priority 4-hour support.",
    description: `<p>Ceremoney Elite is the premium tier for couples who want the full experience — and for families and wedding parties with multiple stakeholders involved in the planning process.</p>

<h3>Everything in Premium, Plus:</h3>
<ul>
  <li><strong>Collaborators:</strong> Invite parents, bridesmaids, best man, or a professional planner to co-manage the event. Assign roles and permissions per collaborator.</li>
  <li><strong>QR Code Entrance Check-in:</strong> Each guest receives a unique QR code. Scan at the door for instant, contactless attendance tracking. Export attendance reports post-event.</li>
  <li><strong>Advanced RSVP Forms:</strong> Go beyond yes/no. Collect meal preferences, dietary restrictions, song requests, shuttle bookings, hotel room sharing, allergies, and any custom question you need.</li>
  <li><strong>Priority Support:</strong> Skip the general queue. Elite subscribers receive guaranteed responses within 4 business hours from our dedicated team.</li>
</ul>

<h3>Pricing</h3>
<ul>
  <li><strong>Monthly:</strong> 799 SEK/month — cancel any time</li>
  <li><strong>Annual:</strong> 7 188 SEK/year (equiv. 599 SEK/month — save 25%)</li>
</ul>`,
    icon: "Star",
    image: "/images/services/plan-elite.jpg",
    startingPrice: 799,
    categorySlug: "subscriptions",
    isPopular: false,
    features: [
      "Everything in Premium",
      "Unlimited collaborators with role-based access",
      "QR code entrance check-in",
      "Advanced & fully customisable RSVP forms",
      "Post-event attendance export",
      "Priority support (4-hour response)",
      "25% discount on annual billing",
    ],
    packages: [
      {
        name: "Elite",
        price: 799,
        description: "Monthly billing — cancel any time",
        processingTime: "Instant activation",
        processingIcon: "zap",
        badgeText: null,
        badgeColor: null,
        features: [],
        notIncluded: [],
        isPopular: false,
      },
      {
        name: "Elite Annual",
        price: 599,
        description: "Annual billing — 7 188 SEK/year (save 25%)",
        processingTime: "Instant activation",
        processingIcon: "zap",
        badgeText: "Best Value",
        badgeColor: "green",
        features: [],
        notIncluded: [],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "How many collaborators can I invite?",
        answer: "Elite allows unlimited collaborators. You can assign different roles — view-only, editor, or co-host — to each person you invite.",
      },
      {
        question: "How does QR code check-in work on the day?",
        answer: "Each guest receives a unique QR code in their invitation or confirmation email. On the day, door staff scan the code with any smartphone or tablet. The attendance list updates in real time in your dashboard.",
      },
      {
        question: "Can I build custom RSVP questions?",
        answer: "Yes. The advanced RSVP form builder lets you add text fields, dropdowns, checkboxes, and rating questions. You can make questions required or optional and set different questions for adults vs. children.",
      },
      {
        question: "What does 4-hour priority support mean?",
        answer: "Elite subscribers are placed in a dedicated support queue. Our team commits to a first response within 4 business hours. During business hours (Mon–Fri, 08:00–17:00 CET) response times are typically much faster.",
      },
    ],
  },
  {
    slug: "plan-white-label",
    name: "White-Label Plan",
    shortDesc: "For professional wedding planners. Multi-event management, client portals, custom branding, and enterprise integrations. Contact us for pricing.",
    metaTitle: "White-Label Plan for Wedding Planners | Ceremoney Professional",
    metaDescription: "Ceremoney White-Label lets professional wedding planners manage multiple events under their own brand. Client portals, custom domain, priority onboarding, and API access. Contact for pricing.",
    description: `<p>Ceremoney White-Label is designed for professional wedding planners and agencies who manage multiple events for clients. Run all your events under your own brand on a single, powerful platform.</p>

<h3>Key Features</h3>
<ul>
  <li><strong>Multi-Event Management:</strong> Manage unlimited client events from one dashboard. Switch between projects instantly.</li>
  <li><strong>Client Portals:</strong> Give each couple their own branded portal to track progress, approve proposals, and communicate with you.</li>
  <li><strong>Custom Branding:</strong> Full white-label: your logo, your colours, your domain. Your clients see your brand, not Ceremoney.</li>
  <li><strong>All Elite Features Included:</strong> Every feature from the Elite plan — collaborators, QR check-in, advanced forms, and priority support — available for all your clients.</li>
  <li><strong>API Access:</strong> Integrate Ceremoney data with your CRM, accounting software, or custom tools via REST API.</li>
  <li><strong>Dedicated Onboarding:</strong> A dedicated account manager helps you migrate existing clients and configure your workspace.</li>
</ul>

<h3>Pricing</h3>
<p>White-Label pricing is based on the number of active events and team members. <strong>Contact us</strong> for a personalised quote.</p>`,
    icon: "Briefcase",
    image: "/images/services/plan-white-label.jpg",
    startingPrice: 0,
    categorySlug: "professional",
    isPopular: false,
    features: [
      "Unlimited client events",
      "Branded client portals",
      "Full white-label (logo, colours, domain)",
      "All Elite features for every event",
      "REST API access",
      "Dedicated account manager",
      "Priority SLA and phone support",
      "Custom integrations available",
    ],
    packages: [
      {
        name: "White-Label",
        price: 0,
        description: "Custom pricing — contact us for a quote",
        processingTime: "Onboarding within 3 days",
        processingIcon: "clock",
        badgeText: "Enterprise",
        badgeColor: "purple",
        features: [
          "Unlimited events",
          "Branded client portals",
          "Full white-label UI",
          "All Elite features",
          "REST API",
          "Dedicated account manager",
        ],
        notIncluded: [],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "How is White-Label pricing structured?",
        answer: "Pricing is customised based on the number of active events, team members, and any special integrations required. Contact our sales team at sales@ceremoney.com for a quote.",
      },
      {
        question: "Can my clients access Ceremoney features without knowing it's Ceremoney?",
        answer: "Yes. With full white-labelling, your clients see only your brand — your logo, colours, and domain. Ceremoney branding is completely hidden.",
      },
      {
        question: "Is there an API for integrating with my existing tools?",
        answer: "Yes. White-Label includes REST API access with documentation and sandbox environment. We support webhooks for real-time event data.",
      },
      {
        question: "What does the dedicated onboarding process look like?",
        answer: "You'll be assigned a dedicated account manager who will guide you through workspace setup, branding configuration, client migration, and training for your team — typically completed within 3 business days.",
      },
    ],
  },
  // ── ADD-ONS ──────────────────────────────────────────────────────────────────
  {
    slug: "addon-extra-collaborators",
    name: "Extra Collaborators",
    shortDesc: "Add more co-planners to your Premium account. Invite parents, bridesmaids, or a hired coordinator with controlled permissions.",
    metaTitle: "Extra Collaborators Add-on | Ceremoney Premium",
    metaDescription: "Add collaborators to your Ceremoney Premium account. Invite up to 5 people to co-manage your wedding planning with view or edit permissions. Upgrade or add on at any time.",
    description: `<p>On the Premium plan, collaborators are available as an add-on. Invite people you trust to help with your planning — each with their own login and customisable permission level.</p>

<h3>Permission Levels</h3>
<ul>
  <li><strong>View Only:</strong> Can see all planning details but cannot make changes. Perfect for parents who want to stay informed.</li>
  <li><strong>Editor:</strong> Can update the guest list, RSVP responses, and checklist. Ideal for a maid of honour or best man.</li>
  <li><strong>Co-Host:</strong> Full access equivalent to the account owner, except billing settings.</li>
</ul>

<p>Note: Collaborators are included as a standard feature on the Elite plan. This add-on is for Premium subscribers who need them.</p>`,
    icon: "Users",
    image: "/images/services/addon-collaborators.jpg",
    startingPrice: 49,
    categorySlug: "addons",
    isPopular: false,
    features: [
      "Up to 5 additional collaborators",
      "Role-based permissions (View / Edit / Co-Host)",
      "Individual logins per collaborator",
      "Real-time collaboration on guest list and checklist",
      "Audit log of changes per collaborator",
    ],
    packages: [
      {
        name: "5 Collaborators",
        price: 49,
        description: "Add up to 5 collaborators to your Premium plan",
        features: ["5 Extra Logins", "View / Edit / Co-Host Roles", "Audit Log"],
        notIncluded: [],
        isPopular: true,
      },
    ],
    faqs: [
      {
        question: "Do collaborators need their own Ceremoney account?",
        answer: "Yes. Each collaborator creates a free Ceremoney account. Once they've registered, you can send them an invitation from your dashboard.",
      },
      {
        question: "Can I remove a collaborator after adding them?",
        answer: "Yes. You can revoke a collaborator's access at any time from your account settings.",
      },
    ],
  },
  {
    slug: "addon-print-stationery",
    name: "Printed Stationery Package",
    shortDesc: "Professional print-ready stationery files. Save-the-dates, invitations, RSVP cards, menus, and place cards delivered as print-ready PDFs.",
    metaTitle: "Printed Stationery Add-on | Ceremoney Wedding Stationery",
    metaDescription: "Upgrade to professionally designed print-ready wedding stationery. Includes save-the-dates, invitations, RSVP cards, menus, and place cards delivered as PDF files ready for your local printer.",
    description: `<p>Complement your digital planning with beautiful, professionally designed printed stationery. All designs are delivered as print-ready PDFs — take them to any local printer or online print service.</p>

<h3>Why You Need an Amazon Seller Account</h3>
<ul>
  <li>Save-the-date card (front + back)</li>
  <li>Wedding invitation suite (invitation, details card, envelope liner)</li>
  <li>RSVP card</li>
  <li>Ceremony programme (4-page)</li>
  <li>Dinner menu card</li>
  <li>Place card template</li>
</ul>

<h3>Process</h3>
<ol>
  <li>Choose your design template from our library</li>
  <li>Fill in your event details via a simple form</li>
  <li>Review a digital proof within 3 business days</li>
  <li>Approve and receive your print-ready PDFs</li>
  <li>Print locally or through your preferred print service</li>
</ol>`,
    icon: "Mail",
    image: "/images/services/addon-stationery.jpg",
    startingPrice: 599,
    categorySlug: "addons",
    isPopular: false,
    features: [
      "Save-the-date card design",
      "Full invitation suite",
      "RSVP card",
      "Ceremony programme",
      "Dinner menu card",
      "Place card template",
      "2 rounds of revisions",
      "Print-ready PDF delivery",
    ],
    packages: [
      {
        name: "Essential",
        price: 599,
        description: "Save-the-date + Invitation suite + RSVP card",
        features: ["Save-the-date", "Invitation Suite", "RSVP Card", "2 Revisions", "Print-ready PDFs"],
        notIncluded: ["Menu Card", "Place Cards", "Ceremony Programme"],
        isPopular: false,
      },
      {
        name: "Full Suite",
        price: 990,
        description: "Complete printed stationery collection",
        features: [
          "Everything in Essential",
          "Ceremony Programme",
          "Dinner Menu Card",
          "Place Card Template",
          "Unlimited Revisions",
        ],
        notIncluded: [],
        isPopular: true,
      },
    ],
    faqs: [
      {
        question: "Can I customise the colours and fonts?",
        answer: "Yes. During the design brief, you specify your colour palette, preferred fonts, and any design notes. Our designers will match your wedding aesthetic.",
      },
      {
        question: "Do you offer printing, or just the digital files?",
        answer: "We deliver print-ready PDF and PNG files. Printing is not included — you arrange printing with your preferred local or online printer using our files.",
      },
      {
        question: "How long does the stationery design process take?",
        answer: "You'll receive your first digital proof within 3 business days of submitting your design brief. Each revision round takes 1–2 business days.",
      },
    ],
  },
  {
    slug: "addon-wedding-website-premium-theme",
    name: "Premium Website Theme",
    shortDesc: "Unlock an exclusive, fully customisable event website theme with animated transitions, advanced photo galleries, and bespoke typography.",
    metaTitle: "Premium Wedding Website Theme | Ceremoney Add-on",
    metaDescription: "Upgrade your Ceremoney event website with a premium theme. Animated page transitions, advanced photo galleries, video backgrounds, and fully customisable colours and fonts.",
    description: `<p>Your event website is often the first impression guests have of your wedding. Premium themes take it to the next level — with cinematic animations, advanced galleries, and full colour and font customisation.</p>

<h3>What's Included</h3>
<ul>
  <li><strong>Animated Page Transitions:</strong> Smooth fade and slide animations that set a romantic mood.</li>
  <li><strong>Video Background Hero:</strong> Display a short video or cinematic slideshow on your homepage hero section.</li>
  <li><strong>Advanced Gallery:</strong> Masonry, lightbox, and carousel gallery layouts with lazy loading.</li>
  <li><strong>Custom Colour & Font Control:</strong> Full access to the theme editor — choose any Google Font and custom brand colours.</li>
  <li><strong>Password Protected Pages:</strong> Keep parts of your website private (e.g. accommodation details visible only to invited guests).</li>
</ul>`,
    icon: "Palette",
    image: "/images/services/addon-theme.jpg",
    startingPrice: 199,
    categorySlug: "addons",
    isPopular: false,
    features: [
      "Exclusive animated website theme",
      "Video background hero section",
      "Advanced masonry & lightbox gallery",
      "Full colour and font customisation",
      "Password protected page sections",
      "Mobile-optimised & fast-loading",
    ],
    packages: [
      {
        name: "Premium Theme",
        price: 199,
        description: "One-time purchase — yours for the lifetime of your event",
        features: [
          "Exclusive Theme",
          "Video Hero",
          "Advanced Gallery",
          "Theme Editor Access",
          "Password Protected Sections",
        ],
        notIncluded: [],
        isPopular: true,
      },
    ],
    faqs: [
      {
        question: "Is this a subscription or a one-time purchase?",
        answer: "It is a one-time purchase. Once you buy a premium theme, it is unlocked for the full duration of your Ceremoney account — no recurring fees.",
      },
      {
        question: "Can I switch themes after purchasing?",
        answer: "Yes. You can switch between your standard theme and premium themes at any time. Your content (text, photos, guest list) is preserved across theme switches.",
      },
    ],
  },
  // ── PROFESSIONAL TOOLS ───────────────────────────────────────────────────────
  {
    slug: "vendor-verified-listing",
    name: "Verified Vendor Listing",
    shortDesc: "Get listed in the Ceremoney vendor directory as a verified supplier. Reach couples actively planning their wedding.",
    metaTitle: "Vendor Directory Listing | Ceremoney Verified Vendor",
    metaDescription: "List your wedding business in the Ceremoney vendor directory. Get discovered by couples planning their wedding. Includes verified badge, portfolio photos, reviews, and inquiry management.",
    description: `<p>The Ceremoney vendor directory is where couples go to discover and shortlist their wedding suppliers. A verified listing puts your business in front of actively planning couples and gives you a professional profile to showcase your work.</p>

<h3>What's Included</h3>
<ul>
  <li><strong>Verified Badge:</strong> A visual trust indicator shown on your listing and in search results.</li>
  <li><strong>Full Portfolio:</strong> Upload up to 50 photos and 3 video reels to showcase your work.</li>
  <li><strong>Review Management:</strong> Collect and respond to couple reviews directly from your vendor dashboard.</li>
  <li><strong>Inquiry Inbox:</strong> Receive and manage couple enquiries without giving out your personal email.</li>
  <li><strong>Analytics:</strong> See how many couples viewed your listing, saved you to their shortlist, and sent enquiries.</li>
</ul>`,
    icon: "BadgeCheck",
    image: "/images/services/vendor-listing.jpg",
    startingPrice: 249,
    categorySlug: "professional",
    isPopular: false,
    features: [
      "Verified vendor badge",
      "Portfolio (50 photos + 3 videos)",
      "Couple review system",
      "Inquiry inbox",
      "Listing analytics dashboard",
      "Featured placement option",
    ],
    packages: [
      {
        name: "Annual Listing",
        price: 249,
        description: "12-month verified listing in the Ceremoney directory",
        features: [
          "Verified Badge",
          "Full Portfolio",
          "Review Management",
          "Inquiry Inbox",
          "Analytics",
        ],
        notIncluded: ["Featured Placement", "Homepage Spotlight"],
        isPopular: true,
      },
      {
        name: "Featured Listing",
        price: 499,
        description: "12-month listing with premium featured placement",
        features: [
          "Everything in Annual Listing",
          "Featured Placement in Category",
          "Homepage Spotlight (rotating)",
          "Priority in Search Results",
        ],
        notIncluded: [],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "How do I get the verified badge?",
        answer: "After purchasing a listing, our team reviews your business details, portfolio, and contact information. Verification is typically completed within 2 business days.",
      },
      {
        question: "What categories can I list under?",
        answer: "We support: Photographers, Videographers, Florists, Caterers, Venues, DJs & Bands, Hair & Makeup, Wedding Cakes, Transport, Officiants, and more. Contact us if your category is not listed.",
      },
      {
        question: "Can I update my listing after it's published?",
        answer: "Yes. You have full control over your listing content — update photos, pricing, descriptions, and availability at any time from your vendor dashboard.",
      },
    ],
  },
  {
    slug: "planning-concierge",
    name: "Planning Concierge",
    shortDesc: "Hand off the hard work. A dedicated Ceremoney planner helps you shortlist vendors, negotiate quotes, and manage your timeline.",
    metaTitle: "Wedding Planning Concierge Service | Ceremoney",
    metaDescription: "Let a dedicated Ceremoney planner do the heavy lifting. Vendor shortlisting, quote negotiation, contract review, and timeline management included. Available for any subscription tier.",
    description: `<p>The Planning Concierge pairs you with a dedicated Ceremoney planner who takes the time-consuming coordination off your plate. Available as an add-on to any subscription tier.</p>

<h3>What Your Concierge Does</h3>
<ul>
  <li><strong>Vendor Shortlisting:</strong> Based on your style, budget, and availability, your planner presents a curated shortlist for each vendor category.</li>
  <li><strong>Quote Negotiation:</strong> Your planner reaches out to vendors, collects quotes, and negotiates on your behalf.</li>
  <li><strong>Contract Review:</strong> Plain-English summary of vendor contracts, highlighting key dates, cancellation policies, and payment schedules.</li>
  <li><strong>Timeline Management:</strong> Your planner builds and maintains a detailed day-of timeline and keeps all vendors informed.</li>
  <li><strong>Monthly Check-in Calls:</strong> Regular progress calls to keep planning on track and address any concerns.</li>
</ul>`,
    icon: "HeartHandshake",
    image: "/images/services/planning-concierge.jpg",
    startingPrice: 2500,
    categorySlug: "professional",
    isPopular: true,
    features: [
      "Dedicated Ceremoney planner assigned",
      "Vendor shortlisting (all categories)",
      "Quote collection and negotiation",
      "Contract plain-English summaries",
      "Day-of timeline management",
      "Monthly 30-minute progress calls",
      "Unlimited email support",
    ],
    packages: [
      {
        name: "Essentials",
        price: 2500,
        description: "Concierge support for up to 3 vendor categories",
        features: [
          "Dedicated Planner",
          "3 Vendor Categories",
          "Quote Collection",
          "Contract Summaries",
          "2 x 30-min Calls",
        ],
        notIncluded: ["Day-of Coordination", "Unlimited Categories"],
        isPopular: false,
      },
      {
        name: "Full Service",
        price: 4900,
        description: "Complete concierge for all vendor categories + day-of coordination",
        features: [
          "Everything in Essentials",
          "All Vendor Categories",
          "Day-of Timeline Management",
          "Vendor Briefing Pack",
          "Monthly Calls (up to 6)",
          "Unlimited Email Support",
        ],
        notIncluded: [],
        isPopular: true,
      },
    ],
    faqs: [
      {
        question: "Do I need a Premium or Elite plan to use the concierge?",
        answer: "No. The Planning Concierge is available as an add-on to any Ceremoney subscription tier, including Basic.",
      },
      {
        question: "How quickly is a concierge assigned?",
        answer: "Within 1 business day of your purchase, you'll receive an introduction email from your dedicated planner and a link to schedule your first call.",
      },
      {
        question: "What does 'contract summary' mean — do you review the contract?",
        answer: "We provide a plain-English summary of key terms — payment schedules, cancellation policies, and important dates. This is an informational summary, not legal advice. We recommend consulting a lawyer for high-value contracts.",
      },
    ],
  },
];

// ─── Main seed function ────────────────────────────────────────────────────────
async function main() {
  console.log("Seeding database...\n");

  // Hash password
  const hashedPassword = await bcrypt.hash("Demo@123", 12);

  // Create demo users for each role
  console.log("Creating users...");
  const users = [
    { email: "admin@ceremoney.com", name: "Admin User", password: hashedPassword, role: "ADMIN" as const, country: "Sweden" },
    { email: "customer@ceremoney.com", name: "Demo Customer", password: hashedPassword, role: "CUSTOMER" as const, country: "Sweden" },
    { email: "content@ceremoney.com", name: "Content Manager", password: hashedPassword, role: "CONTENT_MANAGER" as const, country: "Sweden" },
    { email: "sales@ceremoney.com", name: "Sales Agent", password: hashedPassword, role: "SALES_AGENT" as const, country: "Sweden" },
    { email: "support@ceremoney.com", name: "Support Agent", password: hashedPassword, role: "SUPPORT_AGENT" as const, country: "Sweden" },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
    console.log(`  + ${user.email} (${user.role})`);
  }

  // Create service categories
  console.log("\nCreating service categories...");
  const categoryMap: Record<string, string> = {};

  for (const category of serviceCategories) {
    const created = await prisma.serviceCategory.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        icon: category.icon,
        sortOrder: category.sortOrder,
      },
      create: category,
    });
    categoryMap[category.slug] = created.id;
    console.log(`  + ${category.name}`);
  }

  // Create services with features, packages, and FAQs
  console.log("\nCreating services...");

  for (const serviceData of servicesData) {
    const {
      features,
      packages,
      faqs,
      categorySlug,
      metaTitle,
      metaDescription,
      comparisonFeatures,
      ...serviceFields
    } = serviceData as typeof servicesData[0] & { comparisonFeatures?: typeof subscriptionComparisonFeatures };

    // Create or update service
    const service = await prisma.service.upsert({
      where: { slug: serviceData.slug },
      update: {
        name: serviceFields.name,
        shortDesc: serviceFields.shortDesc,
        description: serviceFields.description,
        icon: serviceFields.icon,
        image: serviceFields.image,
        startingPrice: serviceFields.startingPrice,
        isPopular: serviceFields.isPopular,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        categoryId: categoryMap[categorySlug],
      },
      create: {
        slug: serviceFields.slug,
        name: serviceFields.name,
        shortDesc: serviceFields.shortDesc,
        description: serviceFields.description,
        icon: serviceFields.icon,
        image: serviceFields.image,
        startingPrice: serviceFields.startingPrice,
        isPopular: serviceFields.isPopular,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        categoryId: categoryMap[categorySlug],
      },
    });
    console.log(`  + ${service.name}`);

    // Delete existing features, packages, FAQs to avoid duplicates
    await prisma.serviceFeature.deleteMany({ where: { serviceId: service.id } });
    await prisma.serviceFAQ.deleteMany({ where: { serviceId: service.id } });

    // Delete packages and their related features
    const existingPackages = await prisma.package.findMany({ where: { serviceId: service.id } });
    for (const pkg of existingPackages) {
      await prisma.packageFeature.deleteMany({ where: { packageId: pkg.id } });
      await prisma.packageNotIncluded.deleteMany({ where: { packageId: pkg.id } });
      await prisma.packageFeatureMap.deleteMany({ where: { packageId: pkg.id } });
    }
    await prisma.package.deleteMany({ where: { serviceId: service.id } });

    // Create packages (need packages first for comparison feature mapping)
    const packageMap: Record<string, string> = {};
    for (let i = 0; i < packages.length; i++) {
      const pkg = packages[i] as typeof packages[0] & {
        processingTime?: string;
        processingIcon?: string;
        badgeText?: string | null;
        badgeColor?: string | null;
      };
      const createdPackage = await prisma.package.create({
        data: {
          serviceId: service.id,
          name: pkg.name,
          description: pkg.description,
          priceUSD: pkg.price,
          isPopular: pkg.isPopular,
          sortOrder: i,
          processingTime: pkg.processingTime || null,
          processingTimeNote: null,
          processingIcon: pkg.processingIcon || null,
          badgeText: pkg.badgeText || null,
          badgeColor: pkg.badgeColor || null,
        },
      });
      packageMap[pkg.name] = createdPackage.id;

      // Create legacy package features (for backward compatibility)
      for (let j = 0; j < pkg.features.length; j++) {
        await prisma.packageFeature.create({
          data: {
            packageId: createdPackage.id,
            text: pkg.features[j],
            sortOrder: j,
          },
        });
      }

      // Create package not-included items
      for (let j = 0; j < pkg.notIncluded.length; j++) {
        await prisma.packageNotIncluded.create({
          data: {
            packageId: createdPackage.id,
            text: pkg.notIncluded[j],
            sortOrder: j,
          },
        });
      }
    }
    console.log(`    - ${packages.length} package(s)`);

    // Create comparison table features if available
    if (comparisonFeatures && comparisonFeatures.length > 0) {
      for (let i = 0; i < comparisonFeatures.length; i++) {
        const feature = comparisonFeatures[i];

        const featureAny = feature as any;
        const createdFeature = await prisma.serviceFeature.create({
          data: {
            serviceId: service.id,
            text: feature.text,
            tooltip: feature.tooltip || null,
            description: featureAny.description || null,
            tag: featureAny.tag || null,
            tagType: featureAny.tagType || null,
            icon: featureAny.icon || null,
            sortOrder: i,
          },
        });

        for (const [packageName, mapping] of Object.entries(feature.packages)) {
          const packageId = packageMap[packageName];
          if (packageId) {
            const mappingData = mapping as {
              valueType: FeatureValueType;
              included: boolean;
              addonPriceUSD?: number;
              addonPriceBDT?: number;
              customValue?: string;
            };
            await prisma.packageFeatureMap.create({
              data: {
                packageId,
                featureId: createdFeature.id,
                included: mappingData.included,
                valueType: mappingData.valueType,
                addonPriceUSD: mappingData.addonPriceUSD || null,
                addonPriceBDT: mappingData.addonPriceBDT || null,
                customValue: mappingData.customValue || null,
              },
            });
          }
        }
      }
      console.log(`    - ${comparisonFeatures.length} comparison features`);
    } else {
      // Legacy: create simple service features
      for (let i = 0; i < features.length; i++) {
        await prisma.serviceFeature.create({
          data: {
            serviceId: service.id,
            text: features[i],
            sortOrder: i,
          },
        });
      }
      console.log(`    - ${features.length} feature(s)`);
    }

    // Create service FAQs
    for (let i = 0; i < faqs.length; i++) {
      await prisma.serviceFAQ.create({
        data: {
          serviceId: service.id,
          question: faqs[i].question,
          answer: faqs[i].answer,
          sortOrder: i,
        },
      });
    }
    console.log(`    - ${faqs.length} FAQ(s)`);
  }

  // Placeholder state fees (model is required by schema; we use it for subscription plan region notes)
  console.log("\nCreating subscription plan placeholders (StateFee table)...");
  const planPlaceholders = [
    { stateCode: "BASIC",    stateName: "Basic (Free)",              llcFee: 0,   annualFee: 0,    processingTime: "Instant", isPopular: false },
    { stateCode: "PREMIUM",  stateName: "Premium (399 SEK/month)",   llcFee: 399, annualFee: 3588, processingTime: "Instant", isPopular: true  },
    { stateCode: "ELITE",    stateName: "Elite (799 SEK/month)",     llcFee: 799, annualFee: 7188, processingTime: "Instant", isPopular: false },
    { stateCode: "WHITELBL", stateName: "White-Label (Custom)",      llcFee: 0,   annualFee: 0,    processingTime: "3 days",  isPopular: false },
  ];

  for (const entry of planPlaceholders) {
    await prisma.stateFee.upsert({
      where: { stateCode: entry.stateCode },
      update: entry,
      create: entry,
    });
    console.log(`  + ${entry.stateName}`);
  }

  // Create testimonials
  console.log("\nCreating testimonials...");
  const testimonials = [
    {
      name: "Emma Lindqvist",
      company: "Bride",
      country: "Sweden",
      content: "Ceremoney made our entire planning process feel effortless. The seating chart builder alone saved us hours of frustration. We could not recommend it more!",
      rating: 5,
      sortOrder: 1,
    },
    {
      name: "Lucas Bergström",
      company: "Groom",
      country: "Sweden",
      content: "As the groom who had no idea where to start, Ceremoney's checklist guided us step-by-step. The vendor directory helped us find a fantastic photographer we would never have discovered otherwise.",
      rating: 5,
      sortOrder: 2,
    },
    {
      name: "Amara & Kofi Asante",
      company: "Newlyweds",
      country: "Ghana",
      content: "We planned our Swedish destination wedding entirely from Accra. The QR check-in on Elite was a hit — our guests loved it! The planning concierge was worth every krona.",
      rating: 5,
      sortOrder: 3,
    },
    {
      name: "Sofia Mäkinen",
      company: "Professional Wedding Planner",
      country: "Finland",
      content: "The White-Label plan transformed my business. My clients get a branded portal, I manage everything from one dashboard, and the API integration with my CRM saves me hours every week.",
      rating: 5,
      sortOrder: 4,
    },
    {
      name: "Lena & Marcus Hoffmann",
      company: "Newlyweds",
      country: "Germany",
      content: "The digital stationery package was stunning. Our guests kept complimenting the invitations. Switching to custom domain for our wedding website was seamless — literally took 10 minutes.",
      rating: 5,
      sortOrder: 5,
    },
    {
      name: "Priya Sharma",
      company: "Bride",
      country: "India",
      content: "We used the advanced RSVP forms on Elite to collect meal choices and shuttle preferences for 280 guests. The export was perfectly formatted — we just forwarded it straight to the caterer.",
      rating: 5,
      sortOrder: 6,
    },
  ];

  for (const testimonial of testimonials) {
    const existing = await prisma.testimonial.findFirst({ where: { name: testimonial.name } });
    if (!existing) {
      await prisma.testimonial.create({ data: testimonial });
      console.log(`  + ${testimonial.name}`);
    } else {
      console.log(`  ~ ${testimonial.name} (already exists, skipping)`);
    }
  }

  // Create legal pages
  console.log("\nCreating legal pages...");
  const legalPages = [
    {
      slug: "terms",
      title: "Terms of Service",
      metaTitle: "Terms of Service | Ceremoney",
      metaDescription: "Read Ceremoney's Terms of Service. Understand your rights and obligations when using our wedding planning platform and services.",
      content: `<h2>1. Acceptance of Terms</h2>
<p>By creating a Ceremoney account or using any Ceremoney service, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our platform. These Terms apply to all users, including couples, collaborators, vendors, and professional planners.</p>

<h2>2. Description of Service</h2>
<p>Ceremoney is a Software-as-a-Service (SaaS) wedding planning platform operated from Sweden. Our services include, but are not limited to:</p>
<ul>
  <li>Event website creation and hosting</li>
  <li>RSVP collection and guest list management</li>
  <li>Seating chart builder</li>
  <li>Digital stationery design and delivery</li>
  <li>Vendor directory and inquiry management</li>
  <li>Planning checklists and timeline tools</li>
  <li>QR code entrance check-in</li>
  <li>White-label solutions for professional planners</li>
</ul>

<h2>3. Not a Law Firm or Venue</h2>
<p><strong>Important:</strong> Ceremoney is a technology platform, not a law firm, venue, catering company, or professional services provider. We do not provide legal, financial, or contractual advice. Any information provided through our platform is for general informational purposes only. For legal or contractual matters relating to vendor agreements, please consult a licensed professional.</p>

<h2>4. Subscription Plans and Billing</h2>
<p>Ceremoney offers Free (Basic), Premium (399 SEK/month or 3 588 SEK/year), Elite (799 SEK/month or 7 188 SEK/year), and White-Label (custom pricing) plans. Prices are listed in Swedish Krona (SEK) and are inclusive of applicable VAT where required by law.</p>
<ul>
  <li>Monthly subscriptions renew automatically each calendar month.</li>
  <li>Annual subscriptions renew automatically after 12 months.</li>
  <li>You may cancel auto-renewal at any time from your account settings; access continues until the end of the paid period.</li>
  <li>We reserve the right to change pricing with 30 days' notice to existing subscribers.</li>
</ul>

<h2>5. User Responsibilities</h2>
<p>You are responsible for:</p>
<ul>
  <li>Maintaining the security and confidentiality of your account credentials</li>
  <li>Ensuring all content you publish on your event website complies with applicable laws</li>
  <li>Obtaining proper consent before uploading photographs featuring other individuals</li>
  <li>Ensuring your own vendor contracts and agreements are reviewed and understood before signing</li>
  <li>Complying with GDPR and applicable data protection laws when collecting guest data</li>
</ul>

<h2>6. Intellectual Property</h2>
<p>Ceremoney owns all rights to the platform, software, and designs. Content you create (wedding website content, photos, guest data) remains yours. By using Ceremoney, you grant us a limited licence to store, display, and process your content solely to provide the service.</p>

<h2>7. Refund Policy</h2>
<p>Please refer to our <a href="/refund-policy">Refund Policy</a> for full details on cancellations and refunds.</p>

<h2>8. Limitation of Liability</h2>
<p>To the maximum extent permitted by Swedish and EU law, Ceremoney's aggregate liability to you for any claim arising from use of the platform shall not exceed the total fees paid by you in the 12 months preceding the claim. We are not liable for indirect, incidental, or consequential damages, including losses arising from vendor no-shows, venue cancellations, or third-party service failures.</p>

<h2>9. Governing Law</h2>
<p>These Terms are governed by the laws of Sweden. Any disputes shall be subject to the exclusive jurisdiction of the courts of Stockholm, Sweden, unless mandatory consumer protection laws in your country of residence provide otherwise.</p>

<h2>10. Changes to Terms</h2>
<p>We may update these Terms from time to time. We will notify you by email and in-app notice at least 14 days before material changes take effect. Continued use of Ceremoney after that date constitutes acceptance of the new Terms.</p>

<h2>11. Contact</h2>
<p>For questions about these Terms, contact us at <a href="mailto:legal@ceremoney.com">legal@ceremoney.com</a>.</p>`,
    },
    {
      slug: "privacy",
      title: "Privacy Policy",
      metaTitle: "Privacy Policy | Ceremoney",
      metaDescription: "Ceremoney's Privacy Policy — how we collect, use, and protect your personal data in compliance with GDPR and Swedish data protection law.",
      content: `<h2>1. Data Controller</h2>
<p>Ceremoney AB is the data controller for personal data processed through the Ceremoney platform. We are registered in Sweden and comply with the General Data Protection Regulation (GDPR) and the Swedish Data Protection Act (2018:218).</p>

<h2>2. What Data We Collect</h2>
<p>We collect the following categories of personal data:</p>
<ul>
  <li><strong>Account data:</strong> Name, email address, password (hashed), profile photo</li>
  <li><strong>Event data:</strong> Wedding date, venue, couple names, event website content</li>
  <li><strong>Guest data:</strong> Names, email addresses, phone numbers, dietary requirements, RSVP responses — provided by you when building your guest list</li>
  <li><strong>Payment data:</strong> Billing name, billing address, last four digits of card (full card numbers are processed by Stripe and never stored by us)</li>
  <li><strong>Usage data:</strong> IP address, browser type, pages visited, feature usage — collected automatically for service improvement</li>
</ul>

<h2>3. Legal Basis for Processing</h2>
<ul>
  <li><strong>Contract performance:</strong> Processing necessary to provide the services you have subscribed to</li>
  <li><strong>Legitimate interest:</strong> Analytics to improve the platform, fraud prevention, security</li>
  <li><strong>Legal obligation:</strong> Tax records, audit requirements</li>
  <li><strong>Consent:</strong> Marketing communications (you can withdraw consent at any time)</li>
</ul>

<h2>4. How We Use Your Data</h2>
<ul>
  <li>To provide and operate the Ceremoney platform</li>
  <li>To process payments and manage your subscription</li>
  <li>To send transactional emails (RSVP notifications, invoice receipts, checklist reminders)</li>
  <li>To send marketing communications where you have opted in</li>
  <li>To improve and develop new platform features through aggregated analytics</li>
  <li>To comply with legal and regulatory obligations</li>
</ul>

<h2>5. Guest Data</h2>
<p>When you add guest contact details to Ceremoney, you are acting as a data controller for that guest data and Ceremoney acts as your data processor. You are responsible for having a valid lawful basis (e.g. the guests' consent) to provide their data to Ceremoney. We process guest data only to provide the services you have requested.</p>

<h2>6. Data Sharing</h2>
<p>We share your data only with:</p>
<ul>
  <li><strong>Stripe:</strong> For payment processing (PCI DSS compliant)</li>
  <li><strong>Hosting providers:</strong> Infrastructure providers operating under GDPR-compliant data processing agreements</li>
  <li><strong>Email delivery providers:</strong> For transactional and marketing email delivery</li>
  <li><strong>Legal authorities:</strong> When required by law or court order</li>
</ul>
<p>We do <strong>not</strong> sell your personal data to third parties.</p>

<h2>7. Data Retention</h2>
<p>Account data is retained for the duration of your account plus 2 years after account closure (for legal and audit purposes). You may request earlier deletion by contacting <a href="mailto:privacy@ceremoney.com">privacy@ceremoney.com</a>. Some data may be retained longer where required by law (e.g. invoicing records for 7 years under Swedish accounting law).</p>

<h2>8. Your Rights (GDPR)</h2>
<p>Under GDPR, you have the right to:</p>
<ul>
  <li>Access a copy of your personal data</li>
  <li>Rectify inaccurate data</li>
  <li>Erasure ("right to be forgotten") — subject to legal retention obligations</li>
  <li>Data portability — export your data in machine-readable format</li>
  <li>Object to or restrict certain processing</li>
  <li>Lodge a complaint with the Swedish Authority for Privacy Protection (IMY) at <a href="https://www.imy.se" target="_blank" rel="noopener">imy.se</a></li>
</ul>

<h2>9. Cookies</h2>
<p>We use essential cookies (required for the platform to function), analytics cookies (to understand feature usage), and preference cookies (to remember your settings). A cookie consent banner allows you to manage non-essential cookies when you first visit our site.</p>

<h2>10. Contact</h2>
<p>For privacy enquiries or to exercise your rights, contact our Data Protection Officer at <a href="mailto:privacy@ceremoney.com">privacy@ceremoney.com</a>.</p>`,
    },
    {
      slug: "refund-policy",
      title: "Refund Policy",
      metaTitle: "Refund Policy | Ceremoney",
      metaDescription: "Ceremoney's refund and cancellation policy for subscription plans, add-ons, and concierge services. Understand your rights before subscribing.",
      content: `<h2>Our Commitment</h2>
<p>At Ceremoney, we want you to be confident in your purchase. This policy explains your options for cancellations and refunds across all our products.</p>

<h2>Subscription Plans (Basic, Premium, Elite)</h2>
<h3>Monthly Subscriptions</h3>
<ul>
  <li>You may cancel at any time. Access continues until the end of the current billing period.</li>
  <li>Monthly fees already charged are <strong>non-refundable</strong> except as set out under EU Consumer Rights below.</li>
</ul>
<h3>Annual Subscriptions</h3>
<ul>
  <li>Annual subscriptions may be cancelled at any time; the subscription will not renew.</li>
  <li>A <strong>pro-rata refund</strong> of the unused months is available within the first 60 days of the annual billing date.</li>
  <li>After 60 days, no refund is issued for the remaining annual period.</li>
</ul>

<h2>Add-ons (Printed Stationery, Premium Theme, Extra Collaborators)</h2>
<ul>
  <li><strong>Digital Add-ons (Premium Theme, Extra Collaborators):</strong> Refundable within 14 days if you have not made use of the feature.</li>
  <li><strong>Printed Stationery:</strong> Refundable in full before the design proof has been started. Once a proof has been delivered, a partial refund of 50% is available within 7 days. After approval of the final proof, no refund is available as design work has been completed.</li>
</ul>

<h2>Planning Concierge</h2>
<ul>
  <li>Fully refundable within 48 hours of purchase, provided no planning work has commenced.</li>
  <li>Once your assigned planner has begun work (shortlisting, vendor outreach), a partial refund based on work completed will be assessed on a case-by-case basis.</li>
</ul>

<h2>White-Label Plan</h2>
<p>Refund terms for White-Label agreements are specified in the individual service agreement. Please refer to your contract or contact your account manager.</p>

<h2>EU Consumer Right of Withdrawal</h2>
<p>If you are a consumer in the EU/EEA, you have a 14-day right of withdrawal from the date of purchase for digital services, unless you have already started using the service and expressly waived this right at checkout. Where you have started using a digital service immediately, the right of withdrawal may not apply in full — we will assess each request individually in accordance with applicable consumer protection law.</p>

<h2>How to Request a Refund</h2>
<ol>
  <li>Email <a href="mailto:support@ceremoney.com">support@ceremoney.com</a> with your order number and reason</li>
  <li>Our team will review and respond within 2 business days</li>
  <li>Approved refunds are returned to your original payment method within 5–10 business days</li>
</ol>

<h2>Questions?</h2>
<p>Contact us at <a href="mailto:support@ceremoney.com">support@ceremoney.com</a> — we are happy to help.</p>`,
    },
    {
      slug: "disclaimer",
      title: "Disclaimer",
      metaTitle: "Disclaimer | Ceremoney",
      metaDescription: "Important disclaimers about Ceremoney's wedding planning platform, including limitations of our service and third-party vendor relationships.",
      content: `<h2>Not a Professional Services Provider</h2>
<p><strong>Ceremoney is a technology platform, not a law firm, venue, catering company, florist, photographer, or any other professional wedding service provider.</strong> We provide tools that help couples organise and manage their wedding planning. We do not provide legal, financial, contractual, or professional advice of any kind.</p>

<h2>No Endorsement of Vendors</h2>
<p>Vendors listed in the Ceremoney directory have undergone a basic verification process, but listing on Ceremoney does not constitute an endorsement, warranty, or guarantee of any vendor's quality, reliability, or suitability for your event. Couples are responsible for conducting their own due diligence before entering into any contract with a vendor.</p>

<h2>Vendor Contracts</h2>
<p>Any contract you enter into with a vendor found through Ceremoney is a direct agreement between you and that vendor. Ceremoney is not a party to such contracts and is not liable for vendor performance, cancellations, pricing disputes, or any other matter arising from your relationship with a vendor. We strongly recommend reviewing all vendor contracts carefully and seeking professional legal advice for high-value agreements.</p>

<h2>Platform Availability</h2>
<p>While we strive for 99.9% uptime, Ceremoney cannot guarantee uninterrupted service. We are not liable for losses arising from scheduled or unscheduled platform downtime, including any impact on your event website or RSVP collection. We recommend maintaining offline backups of critical guest list data as your event date approaches.</p>

<h2>Accuracy of Information</h2>
<p>We make reasonable efforts to keep information on the Ceremoney platform accurate and up to date. However, we make no representations or warranties as to the completeness, accuracy, or suitability of any information provided, including vendor profiles, pricing, or availability. Always confirm details directly with your vendors.</p>

<h2>Guest Data Responsibility</h2>
<p>You are the data controller for the personal data of your guests that you enter into the Ceremoney platform. It is your responsibility to ensure you have the appropriate legal basis (such as consent) to collect and process your guests' personal information. Ceremoney acts as your data processor in relation to guest data.</p>

<h2>Limitation of Liability</h2>
<p>To the maximum extent permitted by applicable law, Ceremoney's total liability for any claim arising out of or related to use of our platform shall not exceed the total subscription fees paid by you in the 12 months preceding the claim. We exclude liability for any indirect, consequential, incidental, or special damages.</p>

<h2>Changes to This Disclaimer</h2>
<p>We may update this disclaimer periodically. The most current version is always available at <a href="/disclaimer">ceremoney.com/disclaimer</a>.</p>

<h2>Contact</h2>
<p>For questions about this disclaimer, contact us at <a href="mailto:legal@ceremoney.com">legal@ceremoney.com</a>.</p>`,
    },
  ];

  for (const page of legalPages) {
    await prisma.legalPage.upsert({
      where: { slug: page.slug },
      update: {
        title: page.title,
        content: page.content,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
      },
      create: page,
    });
    console.log(`  + ${page.title}`);
  }

  // Create Header Configuration
  console.log("\nCreating header configuration...");

  await prisma.menuItem.deleteMany({ where: { headerId: { not: null } } });
  await prisma.headerConfig.deleteMany({});

  const headerConfig = await prisma.headerConfig.create({
    data: {
      name: "Default Header",
      isActive: true,
      layout: "DEFAULT",
      sticky: true,
      transparent: false,
      topBarEnabled: false,
      logoPosition: "LEFT",
      logoMaxHeight: 56,
      ctaButtons: JSON.stringify([
        { text: "Start Planning Free", url: "/register", variant: "primary" },
      ]),
      showAuthButtons: true,
      loginText: "Sign In",
      loginUrl: "/login",
      registerText: "Start Planning Free",
      registerUrl: "/register",
      searchEnabled: false,
      mobileBreakpoint: 1024,
      height: 80,
    },
  });
  console.log("  + Header config created");

  // Create menu items for header
  const menuItems = [
    { label: "Home",     url: "/",         sortOrder: 0 },
    { label: "Features", url: "/features", sortOrder: 1, isMegaMenu: true, megaMenuColumns: 3 },
    { label: "Pricing",  url: "/pricing",  sortOrder: 2 },
    { label: "Vendors",  url: "/vendors",  sortOrder: 3 },
    { label: "Blog",     url: "/blog",     sortOrder: 4 },
    { label: "Contact",  url: "/contact",  sortOrder: 5 },
  ];

  for (const item of menuItems) {
    const menuItem = await prisma.menuItem.create({
      data: {
        ...item,
        headerId: headerConfig.id,
        target: "_self",
        isVisible: true,
        visibleOnMobile: true,
      },
    });

    if (item.isMegaMenu) {
      const megaCategories = [
        {
          categoryName: "Planning Tools",
          categoryIcon: "calendar-heart",
          categoryDesc: "Everything to organise your day",
          children: [
            { label: "Event Website",          url: "/features/event-website",     badge: "Free" },
            { label: "Guest List Management",  url: "/features/guest-list" },
            { label: "Seating Chart Builder",  url: "/features/seating-chart",     badge: "Popular" },
            { label: "Wedding Checklist",      url: "/features/checklist",         badge: "Free" },
            { label: "Budget Tracker",         url: "/features/budget" },
            { label: "Day-of Timeline",        url: "/features/timeline" },
          ],
        },
        {
          categoryName: "Guest Experience",
          categoryIcon: "users",
          categoryDesc: "Delight your guests from invite to check-in",
          children: [
            { label: "RSVP Collection",        url: "/features/rsvp",              badge: "Free" },
            { label: "Advanced RSVP Forms",    url: "/features/advanced-rsvp",     badge: "Elite" },
            { label: "Digital Stationery",     url: "/features/stationery" },
            { label: "QR Entrance Check-in",   url: "/features/qr-checkin",        badge: "Elite" },
            { label: "Custom Domain",          url: "/features/custom-domain" },
          ],
        },
        {
          categoryName: "For Professionals",
          categoryIcon: "briefcase",
          categoryDesc: "Tools built for wedding planners",
          children: [
            { label: "White-Label Platform",   url: "/services/plan-white-label",  badge: "Enterprise" },
            { label: "Multi-Event Management", url: "/features/multi-event" },
            { label: "Client Portals",         url: "/features/client-portals" },
            { label: "Vendor Directory Listing", url: "/services/vendor-verified-listing" },
            { label: "API Access",             url: "/features/api" },
          ],
        },
      ];

      for (let i = 0; i < megaCategories.length; i++) {
        const cat = megaCategories[i];
        const categoryMenuItem = await prisma.menuItem.create({
          data: {
            label: cat.categoryName,
            url: "#",
            headerId: headerConfig.id,
            parentId: menuItem.id,
            categoryName: cat.categoryName,
            categoryIcon: cat.categoryIcon,
            categoryDesc: cat.categoryDesc,
            sortOrder: i,
            target: "_self",
            isVisible: true,
            visibleOnMobile: true,
          },
        });

        for (let j = 0; j < cat.children.length; j++) {
          const child = cat.children[j];
          await prisma.menuItem.create({
            data: {
              label: child.label,
              url: child.url,
              headerId: headerConfig.id,
              parentId: categoryMenuItem.id,
              badge: child.badge || null,
              sortOrder: j,
              target: "_self",
              isVisible: true,
              visibleOnMobile: true,
            },
          });
        }
      }
    }
  }
  console.log("  + Header menu items created");

  // Create Footer Configuration
  console.log("\nCreating footer configuration...");

  const existingFooter = await prisma.footerConfig.findFirst({ where: { isActive: true } });

  let footerConfig;
  if (existingFooter) {
    console.log("  ~ Active footer config already exists, skipping to preserve customisations");
    footerConfig = existingFooter;
  } else {
    await prisma.menuItem.deleteMany({ where: { footerWidgetId: { not: null } } });
    await prisma.footerWidget.deleteMany({});
    await prisma.footerConfig.deleteMany({});

    footerConfig = await prisma.footerConfig.create({
      data: {
        name: "Default Footer",
        isActive: true,
        layout: "MULTI_COLUMN",
        columns: 6,
        newsletterEnabled: true,
        newsletterTitle: "Wedding planning tips, delivered to your inbox",
        newsletterSubtitle: "Monthly inspiration, vendor spotlights, and planning guides",
        showSocialLinks: true,
        socialPosition: "brand",
        showContactInfo: true,
        contactPosition: "brand",
        bottomBarEnabled: true,
        showDisclaimer: true,
        disclaimerText: "Ceremoney is a wedding planning technology platform, not a professional services provider. Vendor listings do not constitute endorsements. Always review vendor contracts carefully.",
        showTrustBadges: false,
        paddingTop: 48,
        paddingBottom: 32,
      },
    });
    console.log("  + Footer config created");

    // Widget 1: Brand (column 1–2)
    await prisma.footerWidget.create({
      data: {
        footerId: footerConfig.id,
        type: "BRAND",
        title: "Ceremoney",
        showTitle: false,
        column: 1,
        sortOrder: 0,
      },
    });

    // Widget 2: Plans (column 3)
    const plansWidget = await prisma.footerWidget.create({
      data: {
        footerId: footerConfig.id,
        type: "LINKS",
        title: "Plans",
        showTitle: true,
        column: 3,
        sortOrder: 0,
      },
    });

    const planLinks = [
      { label: "Basic (Free)",    url: "/services/plan-basic" },
      { label: "Premium",        url: "/services/plan-premium" },
      { label: "Elite",          url: "/services/plan-elite" },
      { label: "White-Label",    url: "/services/plan-white-label" },
      { label: "Pricing",        url: "/pricing" },
      { label: "Compare Plans",  url: "/pricing#compare" },
    ];

    for (let i = 0; i < planLinks.length; i++) {
      await prisma.menuItem.create({
        data: {
          label: planLinks[i].label,
          url: planLinks[i].url,
          footerWidgetId: plansWidget.id,
          sortOrder: i,
          target: "_self",
          isVisible: true,
          visibleOnMobile: true,
        },
      });
    }

    // Widget 3: Features (column 4)
    const featuresWidget = await prisma.footerWidget.create({
      data: {
        footerId: footerConfig.id,
        type: "LINKS",
        title: "Features",
        showTitle: true,
        column: 4,
        sortOrder: 0,
      },
    });

    const featureLinks = [
      { label: "Event Website",        url: "/features/event-website" },
      { label: "Guest List",           url: "/features/guest-list" },
      { label: "Seating Chart",        url: "/features/seating-chart" },
      { label: "RSVP Forms",           url: "/features/rsvp" },
      { label: "Digital Stationery",   url: "/features/stationery" },
      { label: "QR Check-in",          url: "/features/qr-checkin" },
    ];

    for (let i = 0; i < featureLinks.length; i++) {
      await prisma.menuItem.create({
        data: {
          label: featureLinks[i].label,
          url: featureLinks[i].url,
          footerWidgetId: featuresWidget.id,
          sortOrder: i,
          target: "_self",
          isVisible: true,
          visibleOnMobile: true,
        },
      });
    }

    // Widget 4: Company (column 5)
    const companyWidget = await prisma.footerWidget.create({
      data: {
        footerId: footerConfig.id,
        type: "LINKS",
        title: "Company",
        showTitle: true,
        column: 5,
        sortOrder: 0,
      },
    });

    const companyLinks = [
      { label: "About Us",      url: "/about" },
      { label: "Blog",          url: "/blog" },
      { label: "FAQs",          url: "/faq" },
      { label: "Contact",       url: "/contact" },
      { label: "Testimonials",  url: "/testimonials" },
      { label: "For Vendors",   url: "/vendors/list-your-business" },
    ];

    for (let i = 0; i < companyLinks.length; i++) {
      await prisma.menuItem.create({
        data: {
          label: companyLinks[i].label,
          url: companyLinks[i].url,
          footerWidgetId: companyWidget.id,
          sortOrder: i,
          target: "_self",
          isVisible: true,
          visibleOnMobile: true,
        },
      });
    }

    // Widget 5: Legal (column 6)
    const legalWidget = await prisma.footerWidget.create({
      data: {
        footerId: footerConfig.id,
        type: "LINKS",
        title: "Legal",
        showTitle: true,
        column: 6,
        sortOrder: 0,
      },
    });

    const legalLinks = [
      { label: "Privacy Policy",   url: "/privacy" },
      { label: "Terms of Service", url: "/terms" },
      { label: "Refund Policy",    url: "/refund-policy" },
      { label: "Disclaimer",       url: "/disclaimer" },
    ];

    for (let i = 0; i < legalLinks.length; i++) {
      await prisma.menuItem.create({
        data: {
          label: legalLinks[i].label,
          url: legalLinks[i].url,
          footerWidgetId: legalWidget.id,
          sortOrder: i,
          target: "_self",
          isVisible: true,
          visibleOnMobile: true,
        },
      });
    }

    console.log("  + Footer widgets created");
  }

  // Create brand color settings (preserved as-is per instructions)
  console.log("\nCreating brand color settings...");
  const brandSettings = [
    // Primary Brand Colors - Midnight Orange Theme
    { key: "brand_primary_color",    value: "#F97316", type: "color" }, // Orange 500
    { key: "brand_primary_dark",     value: "#EA580C", type: "color" }, // Orange 600
    { key: "brand_primary_light",    value: "#FB923C", type: "color" }, // Orange 400
    { key: "brand_secondary_color",  value: "#1E2642", type: "color" }, // Midnight Light
    { key: "brand_secondary_dark",   value: "#0A0F1E", type: "color" }, // Midnight
    { key: "brand_secondary_light",  value: "#2D3A5C", type: "color" }, // Midnight 700
    { key: "brand_accent_color",     value: "#F97316", type: "color" }, // Orange 500 (same as primary)
    { key: "brand_accent_dark",      value: "#C2410C", type: "color" }, // Orange 700
    { key: "brand_accent_light",     value: "#FDBA74", type: "color" }, // Orange 300
    // Semantic Colors
    { key: "color_success",          value: "#22C55E", type: "color" }, // Green 500
    { key: "color_warning",          value: "#F59E0B", type: "color" },
    { key: "color_error",            value: "#EF4444", type: "color" },
    { key: "color_info",             value: "#3B82F6", type: "color" },
  ];

  for (const setting of brandSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, type: setting.type },
      create: setting,
    });
  }
  console.log("  + Brand color settings created");

  // Create social media settings (preserved as-is per instructions)
  console.log("\nCreating social media settings...");
  const socialSettings = [
    { key: "business.social.facebook",  value: "https://facebook.com/ceremoney",  type: "url" },
    { key: "business.social.twitter",   value: "https://x.com/ceremoney",         type: "url" },
    { key: "business.social.youtube",   value: "https://youtube.com/@ceremoney",  type: "url" },
    { key: "business.social.instagram", value: "https://instagram.com/ceremoney", type: "url" },
    { key: "business.social.pinterest", value: "https://pinterest.com/ceremoney", type: "url" },
  ];

  for (const setting of socialSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, type: setting.type },
      create: setting,
    });
  }
  console.log("  + Social media settings created");

  // Create Global FAQs
  console.log("\nCreating global FAQs...");
  await prisma.fAQ.deleteMany();
  const globalFaqs = [
    // General
    {
      question: "What is Ceremoney?",
      answer: "<p>Ceremoney is a Swedish wedding planning SaaS platform that gives couples all the tools they need to plan their wedding in one place — from an event website and RSVP collection to guest list management, seating charts, digital stationery, and QR code entrance check-in.</p>",
      category: "general",
      sortOrder: 0,
    },
    {
      question: "Who is Ceremoney for?",
      answer: "<p>Ceremoney is designed for <strong>couples planning their wedding</strong>, their trusted collaborators (parents, wedding party, friends), and <strong>professional wedding planners</strong> managing multiple events for clients. We offer plans from free to enterprise.</p>",
      category: "general",
      sortOrder: 1,
    },
    {
      question: "Do I need to be based in Sweden to use Ceremoney?",
      answer: "<p>No. Ceremoney is used by couples worldwide. Our platform is available in English (Swedish coming soon) and supports international events. Whether you're planning a wedding in Stockholm, London, or Bali, Ceremoney works for you.</p>",
      category: "general",
      sortOrder: 2,
    },
    {
      question: "Can I plan a destination wedding with Ceremoney?",
      answer: "<p>Absolutely. Ceremoney is built for remote planning. You can manage vendors, collect RSVPs, build your seating chart, and communicate with your planning team entirely online — no matter where you or your guests are based.</p>",
      category: "general",
      sortOrder: 3,
    },
    {
      question: "Is Ceremoney a law firm or vendor?",
      answer: "<p>No. Ceremoney is a technology platform. We are not a law firm, venue, caterer, photographer, or any other type of wedding services provider. We provide tools that help you organise your planning. Vendor listings in our directory do not constitute endorsements.</p>",
      category: "general",
      sortOrder: 4,
    },
    {
      question: "How do I get started?",
      answer: "<p>Simply <a href='/register'>create a free account</a> — no credit card required. You'll be guided through setting up your event website and starting your planning checklist within minutes. You can upgrade to Premium or Elite whenever you're ready for more features.</p>",
      category: "general",
      sortOrder: 5,
    },

    // Plans & Pricing
    {
      question: "What are the differences between the plans?",
      answer: "<p>Ceremoney offers four tiers:</p><ul><li><strong>Basic (Free):</strong> Event website, basic RSVP, checklist, vendor directory access</li><li><strong>Premium (399 SEK/month):</strong> All Basic features + guest list, seating chart, custom domain, digital stationery</li><li><strong>Elite (799 SEK/month):</strong> All Premium features + collaborators, QR entrance check-in, advanced RSVP forms, priority support</li><li><strong>White-Label (custom):</strong> All Elite features for multiple client events, under your own brand</li></ul><p>Visit our <a href='/pricing'>pricing page</a> for a full feature comparison.</p>",
      category: "pricing",
      sortOrder: 0,
    },
    {
      question: "Is there a discount for annual billing?",
      answer: "<p>Yes — annual billing saves 25% on both Premium and Elite plans:</p><ul><li><strong>Premium Annual:</strong> 3 588 SEK/year (equivalent to 299 SEK/month)</li><li><strong>Elite Annual:</strong> 7 188 SEK/year (equivalent to 599 SEK/month)</li></ul><p>Annual plans are billed once per year and renew automatically unless cancelled.</p>",
      category: "pricing",
      sortOrder: 1,
    },
    {
      question: "What payment methods do you accept?",
      answer: "<p>We accept major credit and debit cards (Visa, Mastercard, American Express) via Stripe. Invoicing is available for White-Label and annual enterprise agreements. All payments are processed securely with SSL encryption.</p>",
      category: "pricing",
      sortOrder: 2,
    },
    {
      question: "Can I get a refund if I change my mind?",
      answer: "<p>Yes, in many cases. Monthly subscribers can cancel at any time; annual subscribers can request a pro-rata refund within the first 60 days. Please see our full <a href='/refund-policy'>Refund Policy</a> for details on all product types.</p>",
      category: "pricing",
      sortOrder: 3,
    },
    {
      question: "Is there a free trial for Premium or Elite?",
      answer: "<p>We offer a <strong>14-day free trial</strong> of the Premium plan — no credit card required. You can explore all Premium features and decide if you want to continue. If you do not upgrade, your account automatically returns to the Basic tier after 14 days.</p>",
      category: "pricing",
      sortOrder: 4,
    },

    // Features & Platform
    {
      question: "How does the seating chart builder work?",
      answer: "<p>The Ceremoney seating chart builder lets you create tables (round, rectangular, or custom shapes), set the number of seats per table, and drag-and-drop guests from your guest list into seats. You can filter by RSVP status, dietary requirement, or group. Finished charts can be exported as PDF for your venue coordinator.</p>",
      category: "features",
      sortOrder: 0,
    },
    {
      question: "How does QR code check-in work?",
      answer: "<p>On the Elite plan, each confirmed guest receives a unique QR code in their RSVP confirmation or invitation email. On the wedding day, your door team scans QR codes with any smartphone or tablet — no special hardware required. Attendance updates in real time in your Ceremoney dashboard. After the event, export an attendance report.</p>",
      category: "features",
      sortOrder: 1,
    },
    {
      question: "Can I use my own domain for my event website?",
      answer: "<p>Yes — custom domain is included in Premium and Elite plans. You point your domain's DNS records to Ceremoney (we provide step-by-step instructions), and your event website becomes accessible at your chosen address, typically within a few hours.</p>",
      category: "features",
      sortOrder: 2,
    },
    {
      question: "Can I invite family or friends to help with the planning?",
      answer: "<p>Yes. The <strong>Collaborators</strong> feature (included in Elite, available as an add-on for Premium) lets you invite people to access your planning dashboard with custom permission levels: View Only, Editor, or Co-Host. Each collaborator has their own login.</p>",
      category: "features",
      sortOrder: 3,
    },
    {
      question: "What advanced RSVP questions can I ask guests?",
      answer: "<p>With Advanced RSVP Forms on Elite, you can add any custom questions — for example: meal choice, dietary restrictions, shuttle pickup preference, song requests, hotel room sharing, children's meals, accessibility needs, and more. Each question can be required or optional, and you can set different questions for adult and child guests.</p>",
      category: "features",
      sortOrder: 4,
    },

    // Account & Support
    {
      question: "How do I track my planning progress?",
      answer: "<p>Log in to your Ceremoney dashboard to see an overview of your planning status — checklist completion, RSVP counts, budget tracker, and upcoming tasks. The checklist includes reminders that you can customise based on your wedding date.</p>",
      category: "account",
      sortOrder: 0,
    },
    {
      question: "How can I contact Ceremoney support?",
      answer: "<p>You can reach us through:</p><ul><li><strong>Live Chat:</strong> Available on every page during business hours (Mon–Fri, 08:00–17:00 CET)</li><li><strong>Email:</strong> <a href='mailto:support@ceremoney.com'>support@ceremoney.com</a> — we respond within 24 hours</li><li><strong>Help Centre:</strong> Self-service articles and video guides available 24/7</li><li><strong>Priority Support:</strong> Elite subscribers receive a guaranteed 4-hour response time</li></ul>",
      category: "account",
      sortOrder: 1,
    },
    {
      question: "Can I upgrade or downgrade my plan at any time?",
      answer: "<p>Yes. You can upgrade your plan at any time from your account settings — the upgrade takes effect immediately and you are billed pro-rata for the remainder of your billing period. Downgrades take effect at the end of your current billing period. Your data is always preserved.</p>",
      category: "account",
      sortOrder: 2,
    },
    {
      question: "What happens to my event website and data after the wedding?",
      answer: "<p>Your Ceremoney account and all data — event website, guest list, photos — remain accessible as long as your account is active. Many couples keep their event website live as a keepsake. You can also export your guest list and other data at any time from your dashboard.</p>",
      category: "account",
      sortOrder: 3,
    },

    // Professional Planners
    {
      question: "I'm a professional wedding planner. What does Ceremoney offer me?",
      answer: "<p>The <strong>White-Label plan</strong> is built for professional planners. You get: multi-event management from one dashboard, branded client portals (your logo and colours), all Elite features for every client event, REST API access for CRM integration, and a dedicated account manager. <a href='/contact'>Contact our sales team</a> for a personalised quote.</p>",
      category: "professional",
      sortOrder: 0,
    },
    {
      question: "Can I list my business in the Ceremoney vendor directory?",
      answer: "<p>Yes. The <strong>Verified Vendor Listing</strong> add-on gives your business a professional profile in the Ceremoney vendor directory, including portfolio photos, a verified badge, couple reviews, and an inquiry inbox. Listings start from 249 SEK/year. <a href='/services/vendor-verified-listing'>Learn more here</a>.</p>",
      category: "professional",
      sortOrder: 1,
    },
  ];

  for (const faq of globalFaqs) {
    await prisma.fAQ.create({
      data: {
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        isActive: true,
        sortOrder: faq.sortOrder,
      },
    });
  }
  console.log(`  + ${globalFaqs.length} global FAQs created`);

  console.log("\nSeeding completed!");
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
