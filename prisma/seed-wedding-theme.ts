/**
 * seed-wedding-theme.ts
 *
 * Seeds:
 *  1. Activates the Wedding theme in DB
 *  2. Creates 12 realistic Swedish wedding vendors
 *  3. Adds approved reviews for each vendor
 *
 * Run: npx tsx prisma/seed-wedding-theme.ts
 */

import { PrismaClient, VendorCategory, VendorStatus, VendorPlanTier } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── 1. Theme data from data.json ────────────────────────────────────────────
const THEME_ID = "wedding";
const THEME_NAME = "Wedding & Ceremony Planning";
const COLOR_PALETTE = {
  light: {
    background: "#FDFAF7",
    foreground: "#2C1A1A",
    card: "#FFFFFF",
    "card-foreground": "#2C1A1A",
    popover: "#FFFFFF",
    "popover-foreground": "#2C1A1A",
    primary: "#BE6B8B",
    "primary-foreground": "#FFFFFF",
    secondary: "#F5EDE8",
    "secondary-foreground": "#2C1A1A",
    muted: "#F5EDE8",
    "muted-foreground": "#8C6E6E",
    accent: "#C9A84C",
    "accent-foreground": "#FFFFFF",
    destructive: "#EF4444",
    "destructive-foreground": "#FFFFFF",
    border: "#EDD5C8",
    input: "#EDD5C8",
    ring: "#BE6B8B",
  },
  dark: {
    background: "#1A0F0F",
    foreground: "#F5EDE8",
    card: "#231515",
    "card-foreground": "#F5EDE8",
    popover: "#231515",
    "popover-foreground": "#F5EDE8",
    primary: "#D4879F",
    "primary-foreground": "#FFFFFF",
    secondary: "#2E1C1C",
    "secondary-foreground": "#F5EDE8",
    muted: "#2E1C1C",
    "muted-foreground": "#A08080",
    accent: "#C9A84C",
    "accent-foreground": "#FFFFFF",
    destructive: "#7F1D1D",
    "destructive-foreground": "#FFFFFF",
    border: "#3D2020",
    input: "#3D2020",
    ring: "#D4879F",
  },
};
const FONT_CONFIG = {
  headingFont: "Cormorant Garamond",
  bodyFont: "Lato",
  accentFont: "Georgia",
};

// ─── 2. Sample vendors ────────────────────────────────────────────────────────
interface VendorSeed {
  slug: string;
  businessName: string;
  category: VendorCategory;
  tagline: string;
  description: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  phone: string;
  email: string;
  website?: string;
  instagram?: string;
  startingPrice: number;
  maxPrice: number;
  currency: string;
  yearsInBusiness: number;
  languages: string[];
  isFeatured: boolean;
  isVerified: boolean;
  photos: string[];
  reviews: { authorName: string; rating: number; comment: string }[];
}

const vendors: VendorSeed[] = [
  // ── VENUE ──────────────────────────────────────────────────────────────────
  {
    slug: "grand-palace-venue-stockholm",
    businessName: "Grand Palace Venue",
    category: VendorCategory.VENUE,
    tagline: "Stockholm's most romantic wedding venue",
    description:
      "Nestled in the heart of Stockholm, Grand Palace Venue offers breathtaking views of Lake Mälaren and exquisite ballrooms for up to 400 guests. Our team of dedicated wedding coordinators ensures every detail is perfect from ceremony to reception.",
    city: "Stockholm",
    country: "SE",
    lat: 59.3293,
    lng: 18.0686,
    phone: "+46 8 555 10 10",
    email: "info@grandpalacevenue.se",
    website: "https://grandpalacevenue.se",
    instagram: "grandpalacevenue",
    startingPrice: 45000,
    maxPrice: 150000,
    currency: "SEK",
    yearsInBusiness: 15,
    languages: ["Swedish", "English"],
    isFeatured: true,
    isVerified: true,
    photos: [],
    reviews: [
      { authorName: "Emma Lindqvist", rating: 5, comment: "Absolutely stunning venue! Every guest was in awe. The staff were professional and attentive throughout our entire wedding day." },
      { authorName: "Marcus Bergström", rating: 5, comment: "We had our dream wedding here. The views are incredible and the catering team is top notch. Highly recommended!" },
      { authorName: "Sofia Hansson", rating: 4, comment: "Beautiful venue with great service. Parking could be a bit tricky but overall an amazing experience." },
    ],
  },
  {
    slug: "lakeside-manor-goteborg",
    businessName: "Lakeside Manor Göteborg",
    category: VendorCategory.VENUE,
    tagline: "A timeless estate for your perfect day",
    description:
      "A 19th-century manor house surrounded by lush gardens and a private lake. Lakeside Manor offers an intimate setting for up to 120 guests with full-day buyout packages including bridal suite, outdoor ceremony space, and candlelit dining hall.",
    city: "Göteborg",
    country: "SE",
    lat: 57.7089,
    lng: 11.9746,
    phone: "+46 31 700 20 30",
    email: "events@lakesidemanor.se",
    instagram: "lakesidemanorgbg",
    startingPrice: 35000,
    maxPrice: 95000,
    currency: "SEK",
    yearsInBusiness: 8,
    languages: ["Swedish", "English", "Norwegian"],
    isFeatured: true,
    isVerified: true,
    photos: [],
    reviews: [
      { authorName: "Klara Nilsson", rating: 5, comment: "Magical! The garden ceremony was like a fairy tale. Can't recommend this place enough." },
      { authorName: "Johan Eriksson", rating: 5, comment: "Our guests are still talking about the venue. Gorgeous setting and fantastic food." },
    ],
  },

  // ── PHOTOGRAPHY ───────────────────────────────────────────────────────────
  {
    slug: "saga-moments-photography",
    businessName: "Saga Moments Photography",
    category: VendorCategory.PHOTOGRAPHY,
    tagline: "Capturing love stories, one frame at a time",
    description:
      "Award-winning wedding photographers specialising in natural, documentary-style storytelling. We travel throughout Scandinavia and beyond to capture the genuine emotions and fleeting moments that make your wedding unique. Full-day coverage, edited gallery delivered within 6 weeks.",
    city: "Stockholm",
    country: "SE",
    lat: 59.3346,
    lng: 18.0632,
    phone: "+46 70 123 45 67",
    email: "hello@sagamoments.se",
    website: "https://sagamoments.se",
    instagram: "sagamoments",
    startingPrice: 18000,
    maxPrice: 45000,
    currency: "SEK",
    yearsInBusiness: 10,
    languages: ["Swedish", "English"],
    isFeatured: true,
    isVerified: true,
    photos: [],
    reviews: [
      { authorName: "Alicia Svensson", rating: 5, comment: "Anna captured moments we didn't even know were happening. Our album is absolutely gorgeous." },
      { authorName: "Peter Holmberg", rating: 5, comment: "Professional, creative, and so easy to work with. The photos tell our love story perfectly." },
      { authorName: "Malin Johansson", rating: 5, comment: "We are speechless. Every photo is a work of art. Thank you Saga Moments!" },
      { authorName: "Erik Lund", rating: 4, comment: "Beautiful photos. Delivery took a little longer than expected but worth the wait." },
    ],
  },
  {
    slug: "nordic-light-photography-malmo",
    businessName: "Nordic Light Photography",
    category: VendorCategory.PHOTOGRAPHY,
    tagline: "Scandinavian light, eternal memories",
    description:
      "Based in Malmö, we specialise in light-filled, modern wedding photography with a timeless Scandinavian aesthetic. Our packages include engagement sessions, full wedding day coverage, and beautiful lay-flat albums printed in Sweden.",
    city: "Malmö",
    country: "SE",
    lat: 55.6050,
    lng: 13.0038,
    phone: "+46 70 987 65 43",
    email: "book@nordiclight.se",
    instagram: "nordiclightphoto",
    startingPrice: 14000,
    maxPrice: 38000,
    currency: "SEK",
    yearsInBusiness: 6,
    languages: ["Swedish", "English", "Danish"],
    isFeatured: false,
    isVerified: true,
    photos: [],
    reviews: [
      { authorName: "Cecilia Björk", rating: 5, comment: "Stunning photos that truly capture the atmosphere of our day. Very professional team." },
      { authorName: "Daniel Persson", rating: 4, comment: "Great photographer. Responded quickly to all our questions before the wedding." },
    ],
  },

  // ── CATERING ──────────────────────────────────────────────────────────────
  {
    slug: "smorgasbord-catering-stockholm",
    businessName: "Smörgåsbord Catering",
    category: VendorCategory.CATERING,
    tagline: "New Nordic cuisine for unforgettable receptions",
    description:
      "Our award-winning chefs create bespoke wedding menus celebrating the finest Swedish and Nordic ingredients. From intimate dinners of 20 to grand receptions for 500, we handle every culinary detail including tasting events, dietary requirements, and full service staff.",
    city: "Stockholm",
    country: "SE",
    lat: 59.3319,
    lng: 18.0557,
    phone: "+46 8 400 30 00",
    email: "weddings@smorgasbordcatering.se",
    website: "https://smorgasbordcatering.se",
    startingPrice: 650,
    maxPrice: 1800,
    currency: "SEK",
    yearsInBusiness: 12,
    languages: ["Swedish", "English"],
    isFeatured: false,
    isVerified: true,
    photos: [],
    reviews: [
      { authorName: "Helena Strand", rating: 5, comment: "The food was incredible! Our guests couldn't stop raving about the salmon and the dessert table." },
      { authorName: "Björn Lindgren", rating: 5, comment: "Professional service from start to finish. The tasting event was a highlight in itself." },
      { authorName: "Anna Petersson", rating: 4, comment: "Delicious food and great presentation. Would recommend to anyone planning a wedding." },
    ],
  },

  // ── MUSIC / DJ ────────────────────────────────────────────────────────────
  {
    slug: "dj-aurora-weddings",
    businessName: "DJ Aurora Weddings",
    category: VendorCategory.MUSIC_DJ,
    tagline: "Setting the perfect mood all night long",
    description:
      "Professional wedding DJ with over 12 years of experience creating unforgettable dance floors across Scandinavia. We offer customised playlists, ceremony music coordination, MC services, and state-of-the-art lighting packages. Couples portal for song requests included.",
    city: "Uppsala",
    country: "SE",
    lat: 59.8586,
    lng: 17.6389,
    phone: "+46 73 555 77 88",
    email: "book@djaurora.se",
    instagram: "djaurorawesome",
    startingPrice: 8500,
    maxPrice: 22000,
    currency: "SEK",
    yearsInBusiness: 12,
    languages: ["Swedish", "English", "Finnish"],
    isFeatured: false,
    isVerified: false,
    photos: [],
    reviews: [
      { authorName: "Tobias Gren", rating: 5, comment: "The dance floor was packed all night! DJ Aurora read the crowd perfectly. 10/10!" },
      { authorName: "Frida Magnusson", rating: 5, comment: "Amazing energy and so professional. Played all our favourite songs and kept everyone dancing." },
      { authorName: "Gustav Nordin", rating: 4, comment: "Great DJ. The lighting setup looked fantastic. Would definitely hire again." },
    ],
  },

  // ── FLOWERS ───────────────────────────────────────────────────────────────
  {
    slug: "blomster-bridal-flowers",
    businessName: "Blomster Bridal Flowers",
    category: VendorCategory.FLOWERS,
    tagline: "Sustainable floral design for modern weddings",
    description:
      "We create breathtaking floral designs using locally grown and seasonal Swedish flowers. Our sustainable approach means no floral foam and minimal waste. Specialties include lush ceremony arches, cascading bouquets, table centrepieces, and full venue floral installations.",
    city: "Göteborg",
    country: "SE",
    lat: 57.7010,
    lng: 11.9680,
    phone: "+46 31 600 10 20",
    email: "studio@blomsterbridal.se",
    instagram: "blomsterbridal",
    startingPrice: 6000,
    maxPrice: 35000,
    currency: "SEK",
    yearsInBusiness: 7,
    languages: ["Swedish", "English"],
    isFeatured: true,
    isVerified: true,
    photos: [],
    reviews: [
      { authorName: "Lena Åström", rating: 5, comment: "My bouquet was the most beautiful thing I have ever held. The arch was jaw-dropping!" },
      { authorName: "Nils Borg", rating: 5, comment: "The flowers transformed our venue completely. Every arrangement was perfect." },
      { authorName: "Sara Lindqvist", rating: 5, comment: "Sustainable AND stunning. Couldn't ask for more. Highly recommend!" },
    ],
  },

  // ── WEDDING PLANNER ────────────────────────────────────────────────────────
  {
    slug: "elegance-wedding-planning",
    businessName: "Elegance Wedding Planning",
    category: VendorCategory.WEDDING_PLANNER,
    tagline: "Turning your vision into a flawless reality",
    description:
      "Full-service and day-of wedding coordination for couples throughout Sweden. With over 200 weddings planned, our team manages every detail so you can enjoy every moment. Services include vendor management, timeline creation, budget tracking, and on-the-day coordination.",
    city: "Stockholm",
    country: "SE",
    lat: 59.3260,
    lng: 18.0730,
    phone: "+46 8 700 55 55",
    email: "hello@eleganceweddings.se",
    website: "https://eleganceweddings.se",
    instagram: "eleganceweddingsse",
    startingPrice: 12000,
    maxPrice: 55000,
    currency: "SEK",
    yearsInBusiness: 11,
    languages: ["Swedish", "English", "Arabic"],
    isFeatured: true,
    isVerified: true,
    photos: [],
    reviews: [
      { authorName: "Yasmin Al-Rashid", rating: 5, comment: "Maria handled absolutely everything flawlessly. Best investment we made for our wedding." },
      { authorName: "Carl Lindström", rating: 5, comment: "Worth every krona. Our wedding day was completely stress-free thanks to this amazing team." },
      { authorName: "Ingrid Karlsson", rating: 5, comment: "Organised, creative, and so kind. They made our vision come to life beautifully." },
      { authorName: "Ahmed Osman", rating: 4, comment: "Great service and very responsive. Helped us coordinate an Arabic-Swedish wedding perfectly." },
    ],
  },

  // ── HAIR & MAKEUP ─────────────────────────────────────────────────────────
  {
    slug: "bridal-glow-studio-stockholm",
    businessName: "Bridal Glow Studio",
    category: VendorCategory.HAIR_MAKEUP,
    tagline: "Radiant bridal beauty for your most important day",
    description:
      "Award-winning bridal hair and makeup artists serving Stockholm and surrounding regions. We offer trials, wedding day prep, and travel-ready services for the full bridal party. Specialising in natural, long-lasting looks that photograph beautifully in any light.",
    city: "Stockholm",
    country: "SE",
    lat: 59.3400,
    lng: 18.0500,
    phone: "+46 70 222 33 44",
    email: "book@bridalglow.se",
    instagram: "bridalglow_se",
    startingPrice: 3500,
    maxPrice: 12000,
    currency: "SEK",
    yearsInBusiness: 9,
    languages: ["Swedish", "English"],
    isFeatured: false,
    isVerified: true,
    photos: [],
    reviews: [
      { authorName: "Caroline Berg", rating: 5, comment: "I felt like the most beautiful version of myself. The makeup lasted all day and night!" },
      { authorName: "Anna-Karin Dahl", rating: 5, comment: "So talented and professional. Did hair and makeup for 5 bridesmaids and we all looked amazing." },
      { authorName: "Maria Sjögren", rating: 5, comment: "The trial was so helpful and the day-of look was even better. Highly recommend!" },
    ],
  },

  // ── VIDEOGRAPHY ───────────────────────────────────────────────────────────
  {
    slug: "cinematic-love-films",
    businessName: "Cinematic Love Films",
    category: VendorCategory.VIDEOGRAPHY,
    tagline: "Your love story, cinematic style",
    description:
      "We create breathtaking cinematic wedding films that you will watch over and over again. Our team uses professional cinema-grade cameras and drones to capture every angle of your day. Deliverables include a highlight film (4–6 min), full ceremony film, and raw footage.",
    city: "Stockholm",
    country: "SE",
    lat: 59.3180,
    lng: 18.0620,
    phone: "+46 70 888 99 00",
    email: "films@cinematiclove.se",
    website: "https://cinematiclove.se",
    instagram: "cinematiclovefilms",
    startingPrice: 15000,
    maxPrice: 42000,
    currency: "SEK",
    yearsInBusiness: 5,
    languages: ["Swedish", "English"],
    isFeatured: false,
    isVerified: false,
    photos: [],
    reviews: [
      { authorName: "Viktor Strand", rating: 5, comment: "We cried watching our wedding film. It captured everything perfectly. Absolute magic!" },
      { authorName: "Johanna Melin", rating: 5, comment: "The drone footage of our outdoor ceremony is breathtaking. So glad we booked them." },
    ],
  },

  // ── DRESS / ATTIRE ────────────────────────────────────────────────────────
  {
    slug: "atelier-bride-stockholm",
    businessName: "Atelier Bride Stockholm",
    category: VendorCategory.DRESS_ATTIRE,
    tagline: "Bespoke and designer bridal gowns",
    description:
      "Stockholm's premier bridal boutique offering bespoke couture gowns and curated designer collections from Europe's finest bridal houses. Our experienced stylists guide you through every step of the process, from initial consultation to final alterations, in our elegant showroom.",
    city: "Stockholm",
    country: "SE",
    lat: 59.3350,
    lng: 18.0760,
    phone: "+46 8 600 80 80",
    email: "appointments@atelierbride.se",
    website: "https://atelierbride.se",
    instagram: "atelierbridesthlm",
    startingPrice: 12000,
    maxPrice: 80000,
    currency: "SEK",
    yearsInBusiness: 14,
    languages: ["Swedish", "English", "French"],
    isFeatured: false,
    isVerified: true,
    photos: [],
    reviews: [
      { authorName: "Camilla Westerberg", rating: 5, comment: "Found my absolute dream dress here. The alterations were perfect and the team was so supportive." },
      { authorName: "Eva Holmqvist", rating: 5, comment: "Incredible selection and no-pressure environment. Exactly what I needed for dress shopping." },
    ],
  },

  // ── TRANSPORTATION ────────────────────────────────────────────────────────
  {
    slug: "vintage-rides-wedding-cars",
    businessName: "Vintage Rides Wedding Cars",
    category: VendorCategory.TRANSPORTATION,
    tagline: "Arrive in timeless style",
    description:
      "A fleet of meticulously restored vintage and classic cars for hire on your wedding day. Our collection includes 1960s Rolls-Royces, vintage Jaguar E-Types, and Swedish Volvo classics. Uniformed chauffeurs, ribbons, and champagne welcome included in every hire.",
    city: "Stockholm",
    country: "SE",
    lat: 59.3440,
    lng: 18.0200,
    phone: "+46 8 300 40 50",
    email: "bookings@vintagerides.se",
    instagram: "vintagerideswedding",
    startingPrice: 5000,
    maxPrice: 18000,
    currency: "SEK",
    yearsInBusiness: 8,
    languages: ["Swedish", "English"],
    isFeatured: false,
    isVerified: false,
    photos: [],
    reviews: [
      { authorName: "Pontus Ekman", rating: 5, comment: "The Rolls-Royce was stunning. Our photographer went crazy for it. Highly recommend!" },
      { authorName: "Lisa Fredriksson", rating: 4, comment: "Beautiful car and punctual driver. Made us feel like royalty on our wedding day." },
    ],
  },
];

// ─── Main seed function ───────────────────────────────────────────────────────
async function main() {
  console.log("🌹 Seeding Wedding Theme & Vendors...\n");

  // 1. Activate wedding theme
  await prisma.activeTheme.upsert({
    where: { themeId: THEME_ID },
    update: {
      themeName: THEME_NAME,
      colorPalette: COLOR_PALETTE,
      fontConfig: FONT_CONFIG,
      activatedAt: new Date(),
    },
    create: {
      themeId: THEME_ID,
      themeName: THEME_NAME,
      colorPalette: COLOR_PALETTE,
      fontConfig: FONT_CONFIG,
      originalColorPalette: COLOR_PALETTE,
    },
  });
  console.log(`✅ Theme activated: ${THEME_NAME}`);

  // 2. Create vendors + reviews
  let vendorCount = 0;
  let reviewCount = 0;

  for (const v of vendors) {
    const { reviews, ...vendorData } = v;

    const vendor = await prisma.vendorProfile.upsert({
      where: { slug: v.slug },
      update: {
        businessName: vendorData.businessName,
        category: vendorData.category,
        tagline: vendorData.tagline,
        description: vendorData.description,
        city: vendorData.city,
        country: vendorData.country,
        lat: vendorData.lat,
        lng: vendorData.lng,
        phone: vendorData.phone,
        email: vendorData.email,
        website: vendorData.website,
        instagram: vendorData.instagram,
        startingPrice: vendorData.startingPrice,
        maxPrice: vendorData.maxPrice,
        currency: vendorData.currency,
        yearsInBusiness: vendorData.yearsInBusiness,
        languages: vendorData.languages,
        isFeatured: vendorData.isFeatured,
        isVerified: vendorData.isVerified,
        status: VendorStatus.APPROVED,
        isApproved: true,
        isActive: true,
        planTier: VendorPlanTier.BUSINESS,
      },
      create: {
        slug: vendorData.slug,
        businessName: vendorData.businessName,
        category: vendorData.category,
        tagline: vendorData.tagline,
        description: vendorData.description,
        city: vendorData.city,
        country: vendorData.country,
        lat: vendorData.lat,
        lng: vendorData.lng,
        phone: vendorData.phone,
        email: vendorData.email,
        website: vendorData.website,
        instagram: vendorData.instagram,
        startingPrice: vendorData.startingPrice,
        maxPrice: vendorData.maxPrice,
        currency: vendorData.currency,
        yearsInBusiness: vendorData.yearsInBusiness,
        languages: vendorData.languages,
        isFeatured: vendorData.isFeatured,
        isVerified: vendorData.isVerified,
        status: VendorStatus.APPROVED,
        isApproved: true,
        isActive: true,
        planTier: VendorPlanTier.BUSINESS,
      },
    });

    vendorCount++;

    // Delete existing reviews to avoid duplicates on re-run
    await prisma.vendorReview.deleteMany({ where: { vendorId: vendor.id } });

    // Create reviews
    for (const r of reviews) {
      await prisma.vendorReview.create({
        data: {
          vendorId: vendor.id,
          authorName: r.authorName,
          rating: r.rating,
          comment: r.comment,
          isApproved: true,
        },
      });
      reviewCount++;
    }

    console.log(`  ✓ ${vendor.businessName} (${vendor.category}) — ${reviews.length} reviews`);
  }

  console.log(`\n🎉 Done!`);
  console.log(`   Vendors: ${vendorCount}`);
  console.log(`   Reviews: ${reviewCount}`);
  console.log(`   Theme:   ${THEME_NAME} (active)`);
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
