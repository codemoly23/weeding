import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const pool = new Pool({
  host: process.env.DATABASE_HOST || "127.0.0.1",
  port: parseInt(process.env.DATABASE_PORT || "5432"),
  user: process.env.DATABASE_USER || "postgres",
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME || "llcpad",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Service Categories
const serviceCategories = [
  {
    slug: "formation",
    name: "Formation & Legal",
    description: "Start and maintain your US business entity",
    icon: "Building2",
    sortOrder: 1,
  },
  {
    slug: "compliance",
    name: "Compliance & Documents",
    description: "Keep your business in good standing",
    icon: "FileCheck",
    sortOrder: 2,
  },
  {
    slug: "amazon",
    name: "Amazon Services",
    description: "Sell on Amazon with confidence",
    icon: "ShoppingCart",
    sortOrder: 3,
  },
  {
    slug: "tax-finance",
    name: "Tax & Finance",
    description: "Financial and tax services for your business",
    icon: "Calculator",
    sortOrder: 4,
  },
];

// Full services data
const servicesData = [
  {
    slug: "llc-formation",
    name: "LLC Formation",
    shortDesc: "Launch your US business in 24-48 hours. No SSN required. Trusted by 10,000+ international entrepreneurs from Bangladesh, India, Pakistan & 50+ countries.",
    description: `<p>Launch your American business in 24-48 hours. We handle all the paperwork while you focus on growing your business. <strong>No US residency or SSN required</strong> - we've helped over 10,000 entrepreneurs from 50+ countries establish their US presence.</p>

<h3>Why Form a US LLC?</h3>
<p>A Limited Liability Company (LLC) is the most popular business structure for international entrepreneurs entering the US market:</p>
<ul>
  <li><strong>Personal Asset Protection:</strong> Your personal assets (home, savings, investments) are legally separated from business liabilities.</li>
  <li><strong>Tax Flexibility:</strong> LLCs enjoy "pass-through" taxation without corporate double-taxation.</li>
  <li><strong>Global Credibility:</strong> A US LLC instantly boosts your business credibility.</li>
  <li><strong>No Residency Required:</strong> Unlike many countries, the US allows non-residents to own and operate LLCs.</li>
</ul>

<h3>Which State Should You Choose?</h3>
<ul>
  <li><strong>Wyoming (Most Popular):</strong> Zero state income tax, strongest privacy protections, lowest annual fees ($62/year).</li>
  <li><strong>Delaware:</strong> Home to 66% of Fortune 500 companies. Best for startups seeking investment.</li>
  <li><strong>New Mexico:</strong> No annual report requirement, strong privacy, low formation cost.</li>
</ul>`,
    icon: "Building2",
    image: "/images/services/llc-formation.jpg",
    startingPrice: 199,
    categorySlug: "formation",
    isPopular: true,
    features: [
      "LLC formation in all 50 US states",
      "Articles of Organization filed with state",
      "Customized Operating Agreement included",
      "Free name availability search",
      "Lifetime digital document storage",
      "Compliance calendar with reminders",
      "24/7 customer support",
      "100% satisfaction guarantee",
    ],
    packages: [
      {
        name: "Basic",
        price: 199,
        description: "Essential LLC formation for budget-conscious entrepreneurs",
        features: ["State LLC Filing", "Articles of Organization", "Operating Agreement", "Digital Document Storage"],
        notIncluded: ["EIN Application", "Registered Agent", "Virtual Address"],
        isPopular: false,
      },
      {
        name: "Standard",
        price: 349,
        description: "Most popular - Everything you need to start your US business",
        features: ["Everything in Basic", "EIN/Tax ID Application", "Registered Agent (1 Year)", "Priority Processing & Support"],
        notIncluded: ["Virtual Address", "Business Banking"],
        isPopular: true,
      },
      {
        name: "Premium",
        price: 549,
        description: "All-inclusive package for serious entrepreneurs",
        features: ["Everything in Standard", "Virtual US Address (1 Year)", "Business Banking Assistance", "Amazon Seller Setup Guide"],
        notIncluded: [],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "Can non-US residents form a US LLC?",
        answer: "Absolutely! US LLCs are available to anyone regardless of citizenship or residency. You don't need a visa, green card, SSN, or ITIN to form and operate a US LLC.",
      },
      {
        question: "Which state is best for my LLC - Wyoming or Delaware?",
        answer: "For most international entrepreneurs, Wyoming is the best choice. It offers zero state income tax, the lowest annual fees ($62/year), and strongest privacy protections.",
      },
      {
        question: "How long does LLC formation take?",
        answer: "Most LLCs are approved within 24-48 hours after we submit to the state. Wyoming and New Mexico are typically the fastest.",
      },
      {
        question: "Do I need to visit the US to form an LLC?",
        answer: "No! The entire process can be completed 100% online from anywhere in the world.",
      },
    ],
  },
  {
    slug: "ein-application",
    name: "EIN Application",
    shortDesc: "Get your EIN (Tax ID) without an SSN. Required for US bank accounts, Amazon seller accounts & tax filing. Fast processing for international business owners.",
    description: `<p>Your EIN is your business's Social Security Number. We handle the entire IRS application process, <strong>even without an SSN or ITIN</strong>.</p>

<h3>What is an EIN and Why Do You Need One?</h3>
<p>An Employer Identification Number (EIN) is a unique 9-digit number assigned by the IRS to identify your business.</p>
<h4>You Need an EIN To:</h4>
<ul>
  <li><strong>Open a US Business Bank Account:</strong> Every US bank requires an EIN.</li>
  <li><strong>Set Up Amazon Seller Account:</strong> Amazon requires an EIN during seller verification.</li>
  <li><strong>Accept Payments via Stripe/PayPal:</strong> Payment processors require your EIN for tax reporting.</li>
  <li><strong>File Business Taxes:</strong> The IRS uses your EIN to track your business taxes.</li>
</ul>`,
    icon: "FileText",
    image: "/images/services/ein-application.jpg",
    startingPrice: 99,
    categorySlug: "formation",
    isPopular: false,
    features: [
      "Complete SS-4 form preparation",
      "IRS submission handling",
      "Official EIN confirmation letter",
      "EIN verification letter for banking",
      "No SSN/ITIN required",
      "Support until EIN received",
    ],
    packages: [
      {
        name: "Standard",
        price: 99,
        description: "Complete EIN application service for international applicants",
        features: ["SS-4 Form Preparation", "IRS Fax Submission", "Official EIN Letter", "Banking Verification Letter"],
        notIncluded: [],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "Do I need an SSN or ITIN to get an EIN?",
        answer: "No! International business owners can obtain an EIN without an SSN or ITIN.",
      },
      {
        question: "How long does it take to get an EIN?",
        answer: "For international applicants without an SSN, the IRS typically processes EIN applications within 4-6 weeks.",
      },
    ],
  },
  {
    slug: "registered-agent",
    name: "Registered Agent",
    shortDesc: "Professional registered agent service in all 50 US states. Required for every LLC. Receive legal documents and state mail on your behalf.",
    description: `<p>Every US LLC is legally required to have a registered agent in their state of formation. A registered agent is an individual or company designated to receive legal documents and official state correspondence on behalf of your business.</p>

<h3>Why Do You Need a Registered Agent?</h3>
<ul>
  <li><strong>Legal Requirement:</strong> Every state requires LLCs to maintain a registered agent with a physical address.</li>
  <li><strong>Privacy Protection:</strong> Use our address instead of your personal address on public records.</li>
  <li><strong>Never Miss Important Documents:</strong> We receive and forward all legal notices, tax documents, and compliance reminders.</li>
  <li><strong>Compliance Alerts:</strong> We notify you of annual report deadlines and other compliance requirements.</li>
</ul>`,
    icon: "MapPin",
    image: "/images/services/registered-agent.jpg",
    startingPrice: 99,
    categorySlug: "compliance",
    isPopular: false,
    features: [
      "Physical address in your LLC state",
      "Receive legal documents on your behalf",
      "Forward documents to your address",
      "Compliance calendar reminders",
      "Online document portal access",
      "Same-day email notifications",
    ],
    packages: [
      {
        name: "Annual",
        price: 99,
        description: "1 year registered agent service",
        features: ["Physical Address", "Document Forwarding", "Email Notifications", "Online Portal Access"],
        notIncluded: [],
        isPopular: true,
      },
    ],
    faqs: [
      {
        question: "Do I need a registered agent for my LLC?",
        answer: "Yes, every LLC is required by law to have a registered agent in their state of formation.",
      },
      {
        question: "Can I be my own registered agent?",
        answer: "Yes, but you must have a physical address in the state and be available during business hours. Using a professional service provides privacy and reliability.",
      },
    ],
  },
  {
    slug: "trademark-registration",
    name: "Trademark Registration",
    shortDesc: "Protect your brand with USPTO trademark registration. Required for Amazon Brand Registry. Stop copycats and counterfeiters.",
    description: `<p>A registered trademark gives you <strong>exclusive nationwide rights</strong> to your brand name, logo, or slogan. Stop copycats, qualify for Amazon Brand Registry, and build lasting brand value.</p>

<h3>Why Register a Trademark?</h3>
<ul>
  <li><strong>Legal Protection:</strong> Exclusive right to use your brand name/logo nationwide.</li>
  <li><strong>Amazon Brand Registry:</strong> Required to enroll in Brand Registry.</li>
  <li><strong>Deter Copycats:</strong> The ® symbol signals federal registration.</li>
  <li><strong>Business Value:</strong> Trademarks are valuable intellectual property assets.</li>
</ul>`,
    icon: "Stamp",
    image: "/images/services/trademark.jpg",
    startingPrice: 599,
    categorySlug: "formation",
    isPopular: true,
    features: [
      "Comprehensive trademark search",
      "USPTO application filing",
      "Office action response (Standard+)",
      "Registration certificate",
      "Trademark monitoring",
      "Amazon Brand Registry ready",
    ],
    packages: [
      {
        name: "Basic",
        price: 599,
        description: "Trademark search + filing (USPTO fees extra)",
        features: ["Comprehensive Search", "USPTO Filing (1 Class)", "Application Monitoring", "Digital Certificate"],
        notIncluded: ["Office Action Response", "Monitoring"],
        isPopular: false,
      },
      {
        name: "Standard",
        price: 799,
        description: "Complete trademark service - Most Popular",
        features: ["Everything in Basic", "Office Action Response", "Priority Support", "90-Day Monitoring"],
        notIncluded: ["1-Year Monitoring"],
        isPopular: true,
      },
      {
        name: "Premium",
        price: 999,
        description: "Full protection package with ongoing monitoring",
        features: ["Everything in Standard", "1-Year Trademark Monitoring", "Infringement Alerts", "Dedicated Account Manager"],
        notIncluded: [],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "How long does trademark registration take?",
        answer: "The USPTO process typically takes 8-12 months from filing to registration.",
      },
      {
        question: "Can I use my trademark before it's registered?",
        answer: "Yes, you can use the ™ symbol immediately and switch to ® once registered.",
      },
    ],
  },
  {
    slug: "amazon-seller",
    name: "Amazon Seller Account",
    shortDesc: "Complete Amazon seller account setup. We handle verification, tax interviews, and account configuration. Start selling in 7 days.",
    description: `<p>Start your Amazon selling journey the right way. We handle the complex verification process, tax interview, and initial account configuration so you can focus on sourcing products.</p>

<h3>What's Included</h3>
<ul>
  <li><strong>Account Creation:</strong> We set up your Professional Seller account correctly.</li>
  <li><strong>Verification Support:</strong> Navigate the identity and business verification process.</li>
  <li><strong>Tax Interview:</strong> Complete the W-8BEN-E form correctly for international sellers.</li>
  <li><strong>Account Configuration:</strong> Set up shipping, return policies, and business information.</li>
</ul>`,
    icon: "ShoppingCart",
    image: "/images/services/amazon-seller.jpg",
    startingPrice: 299,
    categorySlug: "amazon",
    isPopular: true,
    features: [
      "Professional seller account setup",
      "Identity verification support",
      "Tax interview (W-8BEN-E) completion",
      "Account configuration",
      "Shipping settings setup",
      "7-day setup guarantee",
    ],
    packages: [
      {
        name: "Standard",
        price: 299,
        description: "Complete Amazon seller account setup",
        features: ["Account Creation", "Verification Support", "Tax Interview", "Basic Configuration"],
        notIncluded: ["Brand Registry", "Listing Optimization"],
        isPopular: true,
      },
      {
        name: "Premium",
        price: 499,
        description: "Full Amazon business setup",
        features: ["Everything in Standard", "Brand Registry Enrollment", "5 Product Listings", "Listing Optimization"],
        notIncluded: [],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "Do I need an LLC to sell on Amazon?",
        answer: "While not required, having a US LLC provides credibility, liability protection, and makes tax reporting easier.",
      },
      {
        question: "How long does Amazon verification take?",
        answer: "Typically 3-7 days, but can vary. We ensure your documents are correct to minimize delays.",
      },
    ],
  },
  {
    slug: "virtual-address",
    name: "Virtual Business Address",
    shortDesc: "Get a professional US business address. Use for your LLC, receive mail & packages, and look professional to customers.",
    description: `<p>Get a professional US business address for your LLC. We provide a real street address (not a PO Box) that you can use on your LLC documents, website, and marketing materials.</p>

<h3>Benefits</h3>
<ul>
  <li><strong>Professional Image:</strong> A US business address builds trust with customers.</li>
  <li><strong>Privacy Protection:</strong> Keep your personal address off public records.</li>
  <li><strong>Mail Handling:</strong> We receive, scan, and forward your business mail.</li>
  <li><strong>Package Receiving:</strong> Accept packages from USPS, UPS, FedEx, and DHL.</li>
</ul>`,
    icon: "MapPin",
    image: "/images/services/virtual-address.jpg",
    startingPrice: 149,
    categorySlug: "compliance",
    isPopular: false,
    features: [
      "Real US street address",
      "Mail receiving & scanning",
      "Package acceptance",
      "Mail forwarding available",
      "Use for LLC registration",
      "Online mail management",
    ],
    packages: [
      {
        name: "Standard",
        price: 149,
        description: "Virtual address with mail scanning",
        features: ["US Street Address", "Mail Receiving", "Mail Scanning", "30-Day Mail Storage"],
        notIncluded: ["Package Forwarding", "Mail Forwarding"],
        isPopular: true,
      },
      {
        name: "Premium",
        price: 249,
        description: "Full mail handling service",
        features: ["Everything in Standard", "Package Receiving", "Mail Forwarding", "90-Day Mail Storage"],
        notIncluded: [],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "Can I use this address for my LLC registration?",
        answer: "Yes, you can use our address as your LLC's principal business address.",
      },
      {
        question: "How does mail forwarding work?",
        answer: "We scan your mail and notify you. You can then request forwarding to your international address.",
      },
    ],
  },
  {
    slug: "business-banking",
    name: "Business Bank Account",
    shortDesc: "Open a US business bank account remotely. No US visit required. Works for international LLC owners.",
    description: `<p>Opening a US business bank account is essential for your LLC. We partner with banks that welcome international business owners and offer remote account opening.</p>

<h3>Why You Need a US Bank Account</h3>
<ul>
  <li><strong>Accept USD Payments:</strong> Receive payments from US customers directly.</li>
  <li><strong>Amazon Disbursements:</strong> Required for Amazon seller payouts.</li>
  <li><strong>Payment Processors:</strong> Connect Stripe, PayPal, and other payment platforms.</li>
  <li><strong>Build Business Credit:</strong> Establish US business credit history.</li>
</ul>`,
    icon: "Landmark",
    image: "/images/services/business-banking.jpg",
    startingPrice: 199,
    categorySlug: "tax-finance",
    isPopular: false,
    features: [
      "Remote account opening",
      "No US visit required",
      "Multiple bank options",
      "Debit card included",
      "Online banking access",
      "International wire transfers",
    ],
    packages: [
      {
        name: "Standard",
        price: 199,
        description: "Business bank account setup assistance",
        features: ["Bank Application Preparation", "Document Review", "Application Submission", "Follow-up Support"],
        notIncluded: [],
        isPopular: true,
      },
    ],
    faqs: [
      {
        question: "Can I open a US bank account without visiting the US?",
        answer: "Yes, our partner banks offer remote account opening for qualified LLC owners.",
      },
      {
        question: "What documents do I need?",
        answer: "Typically: LLC documents, EIN letter, passport, and proof of address.",
      },
    ],
  },
  {
    slug: "annual-report",
    name: "Annual Report Filing",
    shortDesc: "Stay compliant with state annual report requirements. We file on time so your LLC stays in good standing.",
    description: `<p>Most states require LLCs to file an annual report to maintain good standing. We handle the entire filing process so you never miss a deadline.</p>

<h3>Why Annual Reports Matter</h3>
<ul>
  <li><strong>Maintain Good Standing:</strong> Required to keep your LLC active and compliant.</li>
  <li><strong>Avoid Penalties:</strong> Late filings result in fees and potential dissolution.</li>
  <li><strong>Update State Records:</strong> Keep your registered agent and address current.</li>
</ul>`,
    icon: "FileCheck",
    image: "/images/services/annual-report.jpg",
    startingPrice: 75,
    categorySlug: "compliance",
    isPopular: false,
    features: [
      "Timely annual report filing",
      "State fee included",
      "Good standing maintenance",
      "Filing confirmation",
      "Compliance reminders",
      "No missed deadlines",
    ],
    packages: [
      {
        name: "Standard",
        price: 75,
        description: "Annual report filing (+ state fee)",
        features: ["Report Preparation", "State Filing", "Confirmation Letter", "Compliance Calendar"],
        notIncluded: [],
        isPopular: true,
      },
    ],
    faqs: [
      {
        question: "Do all states require annual reports?",
        answer: "Most states do, but requirements vary. Wyoming requires an annual report ($62), while New Mexico has no annual report requirement.",
      },
      {
        question: "What happens if I miss my annual report deadline?",
        answer: "Late filings typically incur penalties and can lead to administrative dissolution of your LLC.",
      },
    ],
  },
  {
    slug: "brand-registry",
    name: "Amazon Brand Registry",
    shortDesc: "Enroll in Amazon Brand Registry. Protect your brand, access A+ Content, and unlock Sponsored Brands advertising.",
    description: `<p>Amazon Brand Registry is essential for protecting your brand on Amazon and unlocking powerful selling tools. We help you enroll quickly and correctly.</p>

<h3>Brand Registry Benefits</h3>
<ul>
  <li><strong>Brand Protection:</strong> Report and remove counterfeit listings.</li>
  <li><strong>A+ Content:</strong> Create enhanced product descriptions with images and comparison charts.</li>
  <li><strong>Sponsored Brands:</strong> Run headline search ads featuring your brand logo.</li>
  <li><strong>Brand Analytics:</strong> Access detailed customer search and purchase data.</li>
</ul>`,
    icon: "BadgeCheck",
    image: "/images/services/brand-registry.jpg",
    startingPrice: 199,
    categorySlug: "amazon",
    isPopular: false,
    features: [
      "Brand Registry enrollment",
      "Trademark verification",
      "A+ Content access",
      "Brand protection tools",
      "Sponsored Brands eligibility",
      "Brand Analytics access",
    ],
    packages: [
      {
        name: "Standard",
        price: 199,
        description: "Brand Registry enrollment service",
        features: ["Enrollment Application", "Trademark Verification", "Account Configuration", "Setup Support"],
        notIncluded: [],
        isPopular: true,
      },
    ],
    faqs: [
      {
        question: "Do I need a registered trademark for Brand Registry?",
        answer: "You need either a registered trademark or a pending trademark application with a serial number.",
      },
      {
        question: "How long does Brand Registry enrollment take?",
        answer: "Typically 1-2 weeks after submitting a complete application with valid trademark information.",
      },
    ],
  },
  {
    slug: "bookkeeping",
    name: "Bookkeeping Services",
    shortDesc: "Professional bookkeeping for your US LLC. Monthly statements, expense tracking, and tax-ready financials.",
    description: `<p>Keep your LLC finances organized with professional bookkeeping. We track income, expenses, and prepare financial statements so you're always tax-ready.</p>

<h3>What's Included</h3>
<ul>
  <li><strong>Transaction Recording:</strong> Categorize all income and expenses.</li>
  <li><strong>Monthly Statements:</strong> Profit & Loss and Balance Sheet.</li>
  <li><strong>Bank Reconciliation:</strong> Match bank transactions with records.</li>
  <li><strong>Tax Preparation:</strong> Year-end financials ready for tax filing.</li>
</ul>`,
    icon: "Calculator",
    image: "/images/services/bookkeeping.jpg",
    startingPrice: 149,
    categorySlug: "tax-finance",
    isPopular: false,
    features: [
      "Monthly transaction recording",
      "Expense categorization",
      "Profit & Loss statements",
      "Balance sheet",
      "Bank reconciliation",
      "Tax-ready financials",
    ],
    packages: [
      {
        name: "Starter",
        price: 149,
        description: "For businesses with up to 50 transactions/month",
        features: ["Up to 50 Transactions", "Monthly P&L", "Expense Categorization", "Bank Reconciliation"],
        notIncluded: ["Balance Sheet", "Dedicated Accountant"],
        isPopular: false,
      },
      {
        name: "Growth",
        price: 299,
        description: "For businesses with up to 150 transactions/month",
        features: ["Up to 150 Transactions", "Monthly P&L & Balance Sheet", "Dedicated Accountant", "Quarterly Review Call"],
        notIncluded: [],
        isPopular: true,
      },
    ],
    faqs: [
      {
        question: "Do I need bookkeeping for my LLC?",
        answer: "Yes, proper bookkeeping is essential for tax compliance and understanding your business performance.",
      },
      {
        question: "How do you access my financial data?",
        answer: "We connect securely to your bank accounts and accounting software through read-only integrations.",
      },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding database...\n");

  // Hash password
  const hashedPassword = await bcrypt.hash("Demo@123", 12);

  // Create demo users for each role
  console.log("👤 Creating users...");
  const users = [
    { email: "admin@llcpad.com", name: "Admin User", password: hashedPassword, role: "ADMIN" as const, country: "USA" },
    { email: "customer@llcpad.com", name: "Demo Customer", password: hashedPassword, role: "CUSTOMER" as const, country: "Bangladesh" },
    { email: "content@llcpad.com", name: "Content Manager", password: hashedPassword, role: "CONTENT_MANAGER" as const, country: "USA" },
    { email: "sales@llcpad.com", name: "Sales Agent", password: hashedPassword, role: "SALES_AGENT" as const, country: "USA" },
    { email: "support@llcpad.com", name: "Support Agent", password: hashedPassword, role: "SUPPORT_AGENT" as const, country: "USA" },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
    console.log(`  ✓ ${user.email} (${user.role})`);
  }

  // Create service categories
  console.log("\n📁 Creating service categories...");
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
    console.log(`  ✓ ${category.name}`);
  }

  // Create services with features, packages, and FAQs
  console.log("\n🛠️ Creating services...");

  for (const serviceData of servicesData) {
    const { features, packages, faqs, categorySlug, ...serviceFields } = serviceData;

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
        categoryId: categoryMap[categorySlug],
      },
    });
    console.log(`  ✓ ${service.name}`);

    // Delete existing features, packages, FAQs to avoid duplicates
    await prisma.serviceFeature.deleteMany({ where: { serviceId: service.id } });
    await prisma.serviceFAQ.deleteMany({ where: { serviceId: service.id } });

    // Delete packages and their related features
    const existingPackages = await prisma.package.findMany({ where: { serviceId: service.id } });
    for (const pkg of existingPackages) {
      await prisma.packageFeature.deleteMany({ where: { packageId: pkg.id } });
      await prisma.packageNotIncluded.deleteMany({ where: { packageId: pkg.id } });
    }
    await prisma.package.deleteMany({ where: { serviceId: service.id } });

    // Create service features
    for (let i = 0; i < features.length; i++) {
      await prisma.serviceFeature.create({
        data: {
          serviceId: service.id,
          text: features[i],
          sortOrder: i,
        },
      });
    }
    console.log(`    - ${features.length} features`);

    // Create packages with features
    for (let i = 0; i < packages.length; i++) {
      const pkg = packages[i];
      const createdPackage = await prisma.package.create({
        data: {
          serviceId: service.id,
          name: pkg.name,
          description: pkg.description,
          priceUSD: pkg.price,
          isPopular: pkg.isPopular,
          sortOrder: i,
        },
      });

      // Create package features
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
    console.log(`    - ${packages.length} packages`);

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
    console.log(`    - ${faqs.length} FAQs`);
  }

  // Create popular state fees
  console.log("\n🗺️ Creating state fees...");
  const stateFees = [
    { stateCode: "WY", stateName: "Wyoming", llcFee: 100, annualFee: 62, processingTime: "1-2 business days", isPopular: true },
    { stateCode: "DE", stateName: "Delaware", llcFee: 90, annualFee: 300, processingTime: "1-2 weeks", isPopular: true },
    { stateCode: "NV", stateName: "Nevada", llcFee: 425, annualFee: 350, processingTime: "1-3 weeks", isPopular: true },
    { stateCode: "FL", stateName: "Florida", llcFee: 125, annualFee: 138.75, processingTime: "1-2 weeks", isPopular: true },
    { stateCode: "TX", stateName: "Texas", llcFee: 300, annualFee: 0, processingTime: "2-3 weeks", isPopular: true },
    { stateCode: "CA", stateName: "California", llcFee: 70, annualFee: 800, processingTime: "2-4 weeks", isPopular: false },
    { stateCode: "NY", stateName: "New York", llcFee: 200, annualFee: 25, processingTime: "2-3 weeks", isPopular: false },
    { stateCode: "NM", stateName: "New Mexico", llcFee: 50, annualFee: 0, processingTime: "1-2 business days", isPopular: true },
  ];

  for (const state of stateFees) {
    await prisma.stateFee.upsert({
      where: { stateCode: state.stateCode },
      update: state,
      create: state,
    });
    console.log(`  ✓ ${state.stateName}`);
  }

  // Create sample testimonials
  console.log("\n⭐ Creating testimonials...");
  const testimonials = [
    { name: "Rahman Ahmed", company: "TechBD Solutions", country: "Bangladesh", content: "LLCPad made forming my US LLC incredibly easy. The team was responsive and guided me through every step. Highly recommended!", rating: 5, sortOrder: 1 },
    { name: "Sarah Chen", company: "Global Imports Co", country: "China", content: "Professional service with excellent communication. Got my Wyoming LLC and EIN within 2 weeks. Very satisfied!", rating: 5, sortOrder: 2 },
    { name: "Mohammed Al-Farsi", company: "Gulf Trading LLC", country: "UAE", content: "The premium package was worth every penny. They helped me set up everything including my Amazon seller account.", rating: 5, sortOrder: 3 },
  ];

  for (const testimonial of testimonials) {
    const existing = await prisma.testimonial.findFirst({ where: { name: testimonial.name } });
    if (!existing) {
      await prisma.testimonial.create({ data: testimonial });
      console.log(`  ✓ ${testimonial.name}`);
    }
  }

  console.log("\n✅ Seeding completed!");
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
