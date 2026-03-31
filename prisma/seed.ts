import { PrismaClient, FeatureValueType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

// Use DATABASE_URL from .env for consistency
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
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

// LLC Formation comparison table features - New Mexico LLC package structure
const llcFormationComparisonFeatures = [
  {
    text: "New Mexico State Filing Fee",
    tooltip: "State filing fee for New Mexico LLC formation ($50)",
    packages: {
      Basic: { valueType: "BOOLEAN" as FeatureValueType, included: true },
      Standard: { valueType: "BOOLEAN" as FeatureValueType, included: true },
      Premium: { valueType: "BOOLEAN" as FeatureValueType, included: true },
    },
  },
  {
    text: "Registered Agent (First Year)",
    tooltip: "A registered agent receives legal documents on behalf of your LLC. Included free for the first year.",
    packages: {
      Basic: { valueType: "ADDON" as FeatureValueType, included: false, addonPriceUSD: 99 },
      Standard: { valueType: "BOOLEAN" as FeatureValueType, included: true },
      Premium: { valueType: "BOOLEAN" as FeatureValueType, included: true },
    },
  },
  {
    text: "EIN Application",
    tooltip: "Employer Identification Number (EIN) from the IRS - required for opening bank accounts and hiring employees",
    packages: {
      Basic: { valueType: "ADDON" as FeatureValueType, included: false, addonPriceUSD: 70 },
      Standard: { valueType: "BOOLEAN" as FeatureValueType, included: true },
      Premium: { valueType: "BOOLEAN" as FeatureValueType, included: true },
    },
  },
  {
    text: "BOI Filing",
    tooltip: "Beneficial Ownership Information (BOI) report required by FinCEN for all LLCs",
    packages: {
      Basic: { valueType: "ADDON" as FeatureValueType, included: false, addonPriceUSD: 49 },
      Standard: { valueType: "BOOLEAN" as FeatureValueType, included: true },
      Premium: { valueType: "BOOLEAN" as FeatureValueType, included: true },
    },
  },
  {
    text: "US Business Address / Mail Forwarding",
    tooltip: "Professional US business address with mail scanning and forwarding services",
    packages: {
      Basic: { valueType: "ADDON" as FeatureValueType, included: false, addonPriceUSD: 120 },
      Standard: { valueType: "ADDON" as FeatureValueType, included: false, addonPriceUSD: 120 },
      Premium: { valueType: "BOOLEAN" as FeatureValueType, included: true },
    },
  },
  {
    text: "US Business Phone Number",
    tooltip: "Dedicated US phone number for your business with call forwarding",
    packages: {
      Basic: { valueType: "ADDON" as FeatureValueType, included: false, addonPriceUSD: 60 },
      Standard: { valueType: "ADDON" as FeatureValueType, included: false, addonPriceUSD: 60 },
      Premium: { valueType: "BOOLEAN" as FeatureValueType, included: true },
    },
  },
  {
    text: "US Fintech Business Bank Account Setup",
    tooltip: "We'll help you open a Mercury business bank account - a modern fintech bank perfect for startups and online businesses",
    packages: {
      Basic: { valueType: "DASH" as FeatureValueType, included: false },
      Standard: { valueType: "ADDON" as FeatureValueType, included: false, addonPriceUSD: 99 },
      Premium: { valueType: "BOOLEAN" as FeatureValueType, included: true },
    },
  },
  {
    text: "Stripe Business Account Setup",
    tooltip: "We'll help you set up a Stripe account for accepting online payments globally",
    packages: {
      Basic: { valueType: "DASH" as FeatureValueType, included: false },
      Standard: { valueType: "ADDON" as FeatureValueType, included: false, addonPriceUSD: 79 },
      Premium: { valueType: "BOOLEAN" as FeatureValueType, included: true },
    },
  },
];

// Full services data
const servicesData = [
  {
    slug: "llc-formation",
    name: "LLC Formation",
    shortDesc: "Launch your US business in 24-48 hours. No SSN required. Trusted by 10,000+ international entrepreneurs from Bangladesh, India, Pakistan & 50+ countries.",
    metaTitle: "Form a US LLC Online for Non-Residents | LLCPad",
    metaDescription: "Start your US LLC from anywhere — no SSN or US address required. Wyoming, Delaware & New Mexico options. Fast formation for international entrepreneurs.",
    description: `<p>Starting a <strong>US LLC (Limited Liability Company)</strong> is the fastest way for international entrepreneurs to access the American market, open US bank accounts, and accept global payments. Whether you're based in <strong>Bangladesh, India, Pakistan, or the UAE</strong>, LLCPad handles the entire formation process — no SSN or US address required.</p>

<h3>Why You Need a US LLC</h3>
<ul>
  <li><strong>Asset Protection:</strong> Your personal assets are legally separated from business liabilities, shielding you from lawsuits and debts.</li>
  <li><strong>US Banking &amp; Payments:</strong> Open a US business bank account and accept payments via Stripe, PayPal, and Wise with a legitimate US entity.</li>
  <li><strong>Tax Flexibility:</strong> Single-member LLCs owned by non-residents can benefit from pass-through taxation with zero US federal income tax on foreign-sourced income.</li>
  <li><strong>Global Credibility:</strong> A US-registered business builds trust with American and international clients, partners, and platforms like Amazon and Shopify.</li>
</ul>

<div style="overflow-x:auto;margin:32px 0;padding-top:20px">
<table style="width:100%;border-collapse:separate;border-spacing:0;border-radius:12px;font-size:15px;border:1px solid #e8e5dd">
<thead><tr style="background:#1b3a2d;color:#faf8f4">
<th style="padding:14px 20px;text-align:left;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Feature</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px;position:relative"><span style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:#e84c1e;color:#fff;font-size:10px;padding:2px 10px;border-radius:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap">Recommended</span>Wyoming</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Delaware</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">New Mexico</th>
</tr></thead>
<tbody>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">State Filing Fee</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">$100</td>
<td style="padding:13px 20px;text-align:center">$110</td>
<td style="padding:13px 20px;text-align:center">$50</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Annual Report Cost</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">$60/yr</td>
<td style="padding:13px 20px;text-align:center">$300/yr</td>
<td style="padding:13px 20px;text-align:center">$0/yr</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Owner Privacy</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700"><span style="color:#1b3a2d">&#10003;</span> Full Privacy</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#1b3a2d">&#10003;</span> Full Privacy</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#1b3a2d">&#10003;</span> Full Privacy</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Banking Friendly</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700"><span style="color:#1b3a2d">&#10003;</span> Excellent</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#1b3a2d">&#10003;</span> Good</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#dc2626">&#10007;</span> Limited</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">No State Income Tax</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700"><span style="color:#1b3a2d">&#10003;</span> Yes</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#dc2626">&#10007;</span> Franchise Tax</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#1b3a2d">&#10003;</span> Yes</td>
</tr>
<tr>
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Best For</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">Non-US Residents</td>
<td style="padding:13px 20px;text-align:center">VC-Funded Startups</td>
<td style="padding:13px 20px;text-align:center">Budget-Conscious</td>
</tr>
</tbody>
</table>
</div>

<h3>How It Works</h3>
<ol>
  <li><strong>Choose Your State:</strong> Select Wyoming (recommended for non-residents), Delaware, or New Mexico based on your business goals and budget.</li>
  <li><strong>Submit Your Details:</strong> Provide your company name, member information, and business purpose — we handle all state paperwork and filing.</li>
  <li><strong>Receive Your Documents:</strong> Get your Articles of Organization, Operating Agreement, and EIN — everything you need to open a bank account and start operating.</li>
</ol>

<p style="margin-top:24px;padding:16px 20px;background:#f0faf5;border-left:4px solid #1b3a2d;border-radius:0 8px 8px 0;font-size:14px;color:#1b3a2d"><strong>Important:</strong> LLCPad is a business filing service, not a law firm. We do not provide legal or tax advice. Formation timelines vary by state — Wyoming typically processes filings within 2–5 business days.</p>`,
    icon: "Building2",
    image: "/images/services/llc-formation.jpg",
    startingPrice: 0,
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
    // New package structure with comparison table support
    packages: [
      {
        name: "Basic",
        price: 0,
        description: "State filing fee only - add services as needed",
        processingTime: "3 weeks",
        processingIcon: "clock",
        badgeText: null,
        badgeColor: null,
        features: [],
        notIncluded: [],
        isPopular: false,
      },
      {
        name: "Standard",
        price: 299,
        description: "Complete LLC formation with EIN and essential services",
        processingTime: "3 weeks",
        processingIcon: "clock",
        badgeText: "Recommended",
        badgeColor: "orange",
        features: [],
        notIncluded: [],
        isPopular: true,
      },
      {
        name: "Premium",
        price: 620,
        description: "Full-service LLC with banking and business setup included",
        processingTime: "3 days",
        processingIcon: "zap",
        badgeText: null,
        badgeColor: null,
        features: [],
        notIncluded: [],
        isPopular: false,
      },
    ],
    // Use new comparison features
    comparisonFeatures: llcFormationComparisonFeatures,
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
    metaTitle: "Get an EIN Number Online — No SSN Required | LLCPad",
    metaDescription: "Apply for a US EIN (Tax ID) without an SSN. Fast IRS processing for non-US residents. Required for banking, taxes & hiring. Start your application today.",
    description: `<p>An <strong>EIN (Employer Identification Number)</strong> is a nine-digit tax identification number issued by the IRS for your US business. Every LLC needs an EIN to <strong>open a US bank account, file taxes, and hire employees</strong>. If you're a non-US resident without a Social Security Number, LLCPad handles the entire IRS application on your behalf — no SSN required.</p>

<h3>Why You Need an EIN</h3>
<ul>
  <li><strong>US Bank Account:</strong> Banks require an EIN to open a business checking account — it's the first thing they ask for after your formation documents.</li>
  <li><strong>Tax Compliance:</strong> The IRS uses your EIN to track business tax filings, and payment processors like Stripe and PayPal require it for payouts.</li>
  <li><strong>Hire Contractors &amp; Employees:</strong> You cannot issue W-9 forms or 1099s to US-based contractors without a valid EIN.</li>
  <li><strong>Business Credibility:</strong> An EIN separates your personal and business identities, which is essential for building credit and signing contracts.</li>
</ul>

<div style="overflow-x:auto;margin:32px 0;padding-top:20px">
<table style="width:100%;border-collapse:separate;border-spacing:0;border-radius:12px;font-size:15px;border:1px solid #e8e5dd">
<thead><tr style="background:#1b3a2d;color:#faf8f4">
<th style="padding:14px 20px;text-align:left;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Feature</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px;position:relative"><span style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:#e84c1e;color:#fff;font-size:10px;padding:2px 10px;border-radius:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap">Recommended</span>EIN</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">ITIN</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">SSN</th>
</tr></thead>
<tbody>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Who Needs It</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">Businesses &amp; LLCs</td>
<td style="padding:13px 20px;text-align:center">Individuals (tax filing)</td>
<td style="padding:13px 20px;text-align:center">US Citizens &amp; Residents</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Issued By</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">IRS</td>
<td style="padding:13px 20px;text-align:center">IRS</td>
<td style="padding:13px 20px;text-align:center">SSA</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Format</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">XX-XXXXXXX</td>
<td style="padding:13px 20px;text-align:center">9XX-XX-XXXX</td>
<td style="padding:13px 20px;text-align:center">XXX-XX-XXXX</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Processing Time</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">1–4 weeks (by mail)</td>
<td style="padding:13px 20px;text-align:center">7–11 weeks</td>
<td style="padding:13px 20px;text-align:center">Immediate (in person)</td>
</tr>
<tr>
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">SSN Required</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700"><span style="color:#dc2626">&#10007;</span> No</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#dc2626">&#10007;</span> No</td>
<td style="padding:13px 20px;text-align:center">N/A</td>
</tr>
</tbody>
</table>
</div>

<h3>How It Works</h3>
<ol>
  <li><strong>Provide Your LLC Details:</strong> Share your LLC name, formation state, and responsible party information — we prepare IRS Form SS-4 on your behalf.</li>
  <li><strong>We File with the IRS:</strong> Our team submits your EIN application directly to the IRS using the appropriate method for non-US applicants (fax or mail).</li>
  <li><strong>Receive Your EIN:</strong> Once approved, you receive your official IRS EIN confirmation letter (CP 575) — ready to use for banking and tax filing.</li>
</ol>

<p style="margin-top:24px;padding:16px 20px;background:#f0faf5;border-left:4px solid #1b3a2d;border-radius:0 8px 8px 0;font-size:14px;color:#1b3a2d"><strong>Important:</strong> Non-US residents cannot apply for an EIN online through the IRS website. The IRS requires fax or mail submissions for foreign applicants, which typically takes 1–4 weeks for processing.</p>`,
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
    metaTitle: "US Registered Agent Service — All 50 States | LLCPad",
    metaDescription: "Professional registered agent service in all 50 US states. Mail forwarding, compliance alerts & document scanning for non-US LLC owners. Stay compliant.",
    description: `<p>Every US LLC is <strong>legally required to have a registered agent</strong> — a person or service with a physical address in your formation state who receives legal documents, tax notices, and government correspondence on your behalf. For <strong>non-US residents who don't have a US address</strong>, a professional registered agent service is essential to keep your LLC in good standing.</p>

<h3>Why You Need a Registered Agent</h3>
<ul>
  <li><strong>Legal Requirement:</strong> All 50 states require LLCs to maintain a registered agent with a physical street address (PO boxes are not accepted) during business hours.</li>
  <li><strong>Privacy Protection:</strong> Your registered agent's address appears on public filings instead of your personal address, keeping your home address private.</li>
  <li><strong>Never Miss a Deadline:</strong> Receive timely compliance alerts for annual reports, franchise tax filings, and other state deadlines that could dissolve your LLC.</li>
  <li><strong>Service of Process:</strong> If your LLC is ever named in a lawsuit, your registered agent receives the legal papers and notifies you immediately.</li>
</ul>

<div style="overflow-x:auto;margin:32px 0;padding-top:20px">
<table style="width:100%;border-collapse:separate;border-spacing:0;border-radius:12px;font-size:15px;border:1px solid #e8e5dd">
<thead><tr style="background:#1b3a2d;color:#faf8f4">
<th style="padding:14px 20px;text-align:left;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Feature</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px;position:relative"><span style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:#e84c1e;color:#fff;font-size:10px;padding:2px 10px;border-radius:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap">Recommended</span>LLCPad</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Basic Provider</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">DIY (Self)</th>
</tr></thead>
<tbody>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Mail Forwarding</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700"><span style="color:#1b3a2d">&#10003;</span> Included</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#dc2626">&#10007;</span> Extra Fee</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#dc2626">&#10007;</span> N/A</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Compliance Alerts</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700"><span style="color:#1b3a2d">&#10003;</span> Automated</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#1b3a2d">&#10003;</span> Email Only</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#dc2626">&#10007;</span> Manual</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Annual Report Reminders</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700"><span style="color:#1b3a2d">&#10003;</span> 60-Day Advance</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#1b3a2d">&#10003;</span> 30-Day</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#dc2626">&#10007;</span> None</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Document Scanning</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700"><span style="color:#1b3a2d">&#10003;</span> Same-Day Digital</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#dc2626">&#10007;</span> Not Included</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#dc2626">&#10007;</span> N/A</td>
</tr>
<tr>
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">State Coverage</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">All 50 States</td>
<td style="padding:13px 20px;text-align:center">Select States</td>
<td style="padding:13px 20px;text-align:center">1 State Only</td>
</tr>
</tbody>
</table>
</div>

<h3>How It Works</h3>
<ol>
  <li><strong>Select Your State:</strong> Choose the state where your LLC is registered — we provide a registered agent address in that state immediately.</li>
  <li><strong>We Handle Your Mail:</strong> All legal documents, tax notices, and state correspondence are received at our office, scanned, and forwarded to your dashboard.</li>
  <li><strong>Stay Compliant Automatically:</strong> Receive advance reminders for annual reports and state filings so your LLC never falls out of good standing.</li>
</ol>

<p style="margin-top:24px;padding:16px 20px;background:#f0faf5;border-left:4px solid #1b3a2d;border-radius:0 8px 8px 0;font-size:14px;color:#1b3a2d"><strong>Important:</strong> If your LLC loses its registered agent, most states will send a notice and eventually dissolve or revoke your business. Maintaining continuous registered agent coverage is critical for non-US owners who cannot serve as their own agent.</p>`,
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
    metaTitle: "US Trademark Registration — USPTO Filing | LLCPad",
    metaDescription: "Register your trademark with the USPTO. Protect your brand name & logo in the US. Full filing service for international business owners. Start today.",
    description: `<p><strong>US trademark registration</strong> with the USPTO (United States Patent and Trademark Office) gives you <strong>exclusive legal rights to your brand name, logo, or slogan</strong> across all 50 states. For international entrepreneurs selling in the US market, a registered trademark prevents competitors from using your brand and is essential for platforms like <strong>Amazon Brand Registry</strong>.</p>

<h3>Why You Need a Trademark</h3>
<ul>
  <li><strong>Nationwide Brand Protection:</strong> A federal trademark gives you exclusive rights to your brand name in your registered class of goods or services across the entire United States.</li>
  <li><strong>Amazon Brand Registry:</strong> You must have a registered (or pending) US trademark to enroll in Amazon Brand Registry, which unlocks A+ Content, brand analytics, and counterfeit protection.</li>
  <li><strong>Legal Enforcement:</strong> With a registered trademark, you can file cease-and-desist letters, DMCA takedowns, and federal lawsuits against infringers — and recover statutory damages.</li>
  <li><strong>Asset Value:</strong> A registered trademark is an intangible asset that increases your business valuation and can be licensed or sold independently of the business.</li>
</ul>

<div style="overflow-x:auto;margin:32px 0;padding-top:20px">
<table style="width:100%;border-collapse:separate;border-spacing:0;border-radius:12px;font-size:15px;border:1px solid #e8e5dd">
<thead><tr style="background:#1b3a2d;color:#faf8f4">
<th style="padding:14px 20px;text-align:left;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Feature</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px;position:relative"><span style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:#e84c1e;color:#fff;font-size:10px;padding:2px 10px;border-radius:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap">Recommended</span>Trademark</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Copyright</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Patent</th>
</tr></thead>
<tbody>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">What It Protects</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">Brand names, logos, slogans</td>
<td style="padding:13px 20px;text-align:center">Creative works (books, art, code)</td>
<td style="padding:13px 20px;text-align:center">Inventions &amp; processes</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Duration</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">Indefinite (renew every 10 yrs)</td>
<td style="padding:13px 20px;text-align:center">Life + 70 years</td>
<td style="padding:13px 20px;text-align:center">20 years</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Filing Cost (USPTO)</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">$250–$350 per class</td>
<td style="padding:13px 20px;text-align:center">$45–$65</td>
<td style="padding:13px 20px;text-align:center">$1,600+</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Filing Authority</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">USPTO</td>
<td style="padding:13px 20px;text-align:center">US Copyright Office</td>
<td style="padding:13px 20px;text-align:center">USPTO</td>
</tr>
<tr>
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Processing Time</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">8–12 months</td>
<td style="padding:13px 20px;text-align:center">1–6 months</td>
<td style="padding:13px 20px;text-align:center">1–3 years</td>
</tr>
</tbody>
</table>
</div>

<h3>How It Works</h3>
<ol>
  <li><strong>Trademark Search:</strong> We conduct a comprehensive search of the USPTO database and common law sources to check if your desired brand name or logo is available for registration.</li>
  <li><strong>File Your Application:</strong> Our team prepares and files your trademark application with the USPTO, selecting the correct international class(es) for your goods or services.</li>
  <li><strong>Monitor &amp; Respond:</strong> We track your application through the USPTO examination process, respond to any Office Actions from the examining attorney, and guide you through publication and registration.</li>
</ol>

<p style="margin-top:24px;padding:16px 20px;background:#f0faf5;border-left:4px solid #1b3a2d;border-radius:0 8px 8px 0;font-size:14px;color:#1b3a2d"><strong>Important:</strong> Non-US applicants must appoint a US-licensed attorney to file a trademark application with the USPTO. LLCPad works with licensed trademark attorneys to ensure your application meets all legal requirements. The entire process typically takes 8–12 months from filing to registration.</p>`,
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
    metaTitle: "Amazon Seller Account Setup for Non-US | LLCPad",
    metaDescription: "Set up your Amazon Seller account as a non-US resident. Compare Individual vs Professional plans and start selling on Amazon.com. Get started with LLCPad.",
    description: `<p>Selling on <strong>Amazon.com</strong> is one of the fastest ways for international entrepreneurs to access the world's largest e-commerce market. Whether you're based in <strong>Bangladesh, India, Pakistan, or the UAE</strong>, setting up a US Amazon Seller account gives you direct access to over 300 million active customers. LLCPad handles the entire setup process so you can focus on sourcing products and growing your business.</p>

<h3>Why You Need an Amazon Seller Account</h3>
<ul>
  <li><strong>Access the US Market:</strong> The US Amazon marketplace generates over $400 billion in annual sales — the single largest e-commerce opportunity globally.</li>
  <li><strong>Built-In Customer Trust:</strong> Buyers already trust Amazon, so you skip the brand-building phase that independent stores require.</li>
  <li><strong>Fulfillment by Amazon (FBA):</strong> Ship inventory to Amazon's warehouses and let them handle storage, packing, shipping, and customer service.</li>
  <li><strong>Scalable from Day One:</strong> Start with a handful of products and scale to thousands without building your own logistics infrastructure.</li>
</ul>

<div style="overflow-x:auto;margin:32px 0;padding-top:20px">
<table style="width:100%;border-collapse:separate;border-spacing:0;border-radius:12px;font-size:15px;border:1px solid #e8e5dd">
<thead><tr style="background:#1b3a2d;color:#faf8f4">
<th style="padding:14px 20px;text-align:left;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Feature</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px;position:relative"><span style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:#e84c1e;color:#fff;font-size:10px;padding:2px 10px;border-radius:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap">Recommended</span>Professional</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Individual</th>
</tr></thead>
<tbody>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Monthly Fee</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">$39.99/month</td>
<td style="padding:13px 20px;text-align:center">$0/month</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Per-Item Listing Fee</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">None</td>
<td style="padding:13px 20px;text-align:center">$0.99 per item sold</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Buy Box Eligibility</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700"><span style="color:#1b3a2d">✓</span> Eligible</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#dc2626">✗</span> Not Eligible</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Amazon Advertising (PPC)</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700"><span style="color:#1b3a2d">✓</span> Full Access</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#dc2626">✗</span> Not Available</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Brand Registry Eligibility</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700"><span style="color:#1b3a2d">✓</span> Eligible</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#dc2626">✗</span> Not Eligible</td>
</tr>
<tr>
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Best For</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">Serious sellers (40+ items/mo)</td>
<td style="padding:13px 20px;text-align:center">Testing with &lt;40 items/mo</td>
</tr>
</tbody>
</table>
</div>

<h3>How It Works</h3>
<ol>
  <li><strong>Entity Verification:</strong> We confirm your US LLC is properly set up with an EIN and US address — the prerequisites Amazon requires from non-US residents.</li>
  <li><strong>Account Registration:</strong> We create your Seller Central account, configure tax settings, link your payment method, and complete identity verification on your behalf.</li>
  <li><strong>Launch Preparation:</strong> You receive your fully activated account with step-by-step guidance on listing your first product and shipping inventory to FBA.</li>
</ol>

<p style="margin-top:24px;padding:16px 20px;background:#f0faf5;border-left:4px solid #1b3a2d;border-radius:0 8px 8px 0;font-size:14px;color:#1b3a2d"><strong>Important:</strong> Amazon requires a Professional Seller account ($39.99/month) to access advertising, win the Buy Box, and enroll in Brand Registry. We strongly recommend starting with Professional if you plan to build a serious business.</p>`,
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
    metaTitle: "Virtual US Business Address Service | LLCPad",
    metaDescription: "Get a real US business address for LLC registration, Amazon seller accounts, and business banking. Mail scanning included. Start with LLCPad.",
    description: `<p>A <strong>virtual US business address</strong> is one of the most essential building blocks for international entrepreneurs operating a US-based business. You need a real US street address (not a PO Box) for <strong>LLC registration</strong>, Amazon Seller Central verification, business bank account applications, and receiving official government correspondence. Our virtual address service provides a legitimate commercial address with mail handling — so you can run your US business from anywhere in the world.</p>

<h3>Why You Need a Virtual US Address</h3>
<ul>
  <li><strong>LLC Registration Requirement:</strong> Most states require a US street address for your LLC's principal office or mailing address on formation documents.</li>
  <li><strong>Amazon Seller Verification:</strong> Amazon may request utility bills or bank statements showing a US address during seller account verification.</li>
  <li><strong>Business Banking:</strong> US banks require a domestic address on file. A virtual address satisfies this requirement for online banking applications.</li>
  <li><strong>Professional Presence:</strong> A US commercial address on your website and invoices builds trust with American customers and business partners.</li>
</ul>

<div style="overflow-x:auto;margin:32px 0;padding-top:20px">
<table style="width:100%;border-collapse:separate;border-spacing:0;border-radius:12px;font-size:15px;border:1px solid #e8e5dd">
<thead><tr style="background:#1b3a2d;color:#faf8f4">
<th style="padding:14px 20px;text-align:left;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Feature</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Details</th>
</tr></thead>
<tbody>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Mail Scanning</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#1b3a2d">✓</span> Envelope exterior scanned &amp; notified</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Mail Forwarding</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#1b3a2d">✓</span> Domestic &amp; international forwarding available</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Registered Agent Included</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#1b3a2d">✓</span> Accepts legal &amp; state documents on your behalf</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">State Options</td>
<td style="padding:13px 20px;text-align:center">Wyoming, Delaware, Florida, New Mexico &amp; more</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Business Registration Use</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#1b3a2d">✓</span> Accepted for LLC &amp; EIN filings</td>
</tr>
<tr>
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Banking Accepted</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#1b3a2d">✓</span> Accepted by Mercury, Relay, and most US banks</td>
</tr>
</tbody>
</table>
</div>

<h3>How It Works</h3>
<ol>
  <li><strong>Address Assignment:</strong> We assign you a real US commercial street address with a unique suite number in your chosen state — ready to use on all official documents.</li>
  <li><strong>USPS Form 1583:</strong> We guide you through the notarized USPS Form 1583 (required for mail receiving authorization), which can be completed online with a digital notary.</li>
  <li><strong>Ongoing Mail Handling:</strong> All mail received at your address is scanned, and you're notified instantly. You can request forwarding, content scanning, or secure shredding from your dashboard.</li>
</ol>

<p style="margin-top:24px;padding:16px 20px;background:#f0faf5;border-left:4px solid #1b3a2d;border-radius:0 8px 8px 0;font-size:14px;color:#1b3a2d"><strong>Important:</strong> A virtual address is different from a registered agent address. Your registered agent receives legal service of process, while your virtual address serves as your business mailing address. We recommend having both — and our packages can bundle them together for convenience.</p>`,
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
    metaTitle: "US Business Bank Account for Non-Residents | LLCPad",
    metaDescription: "Open a US business bank account remotely as a non-resident. Mercury, Relay, Wise compared. No SSN required. Apply with our guidance today.",
    description: `<p>A <strong>US business bank account</strong> is essential for operating your LLC — you need it to receive payments, pay expenses, and maintain the legal separation between personal and business finances. As a <strong>non-US resident</strong>, opening a bank account can be challenging, but several fintech banks now offer <strong>remote account opening</strong> without requiring an SSN or a US visit. Our service guides you through the entire process and ensures your application is approved.</p>

<h3>Why You Need a US Business Bank Account</h3>
<ul>
<li><strong>Receive US Payments:</strong> Accept ACH transfers, wire payments, and Stripe/PayPal payouts directly into a US-based business account with a routing and account number.</li>
<li><strong>Maintain LLC Protection:</strong> Mixing personal and business funds can pierce your LLC's liability protection. A dedicated business account keeps finances properly separated.</li>
<li><strong>Payment Processor Requirement:</strong> Stripe, PayPal, and other US payment processors require a US bank account to deposit your funds.</li>
<li><strong>Build US Financial History:</strong> A well-maintained US bank account establishes financial credibility for future credit, loans, and business partnerships.</li>
</ul>

<div style="overflow-x:auto;margin:32px 0;padding-top:20px">
<table style="width:100%;border-collapse:separate;border-spacing:0;border-radius:12px;font-size:15px;border:1px solid #e8e5dd">
<thead><tr style="background:#1b3a2d;color:#faf8f4">
<th style="padding:14px 20px;text-align:left;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Feature</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px;position:relative"><span style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:#e84c1e;color:#fff;font-size:10px;padding:2px 10px;border-radius:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap">Recommended</span>Mercury</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Relay</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Wise Business</th>
</tr></thead>
<tbody>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Minimum Deposit</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">$0</td>
<td style="padding:13px 20px;text-align:center">$0</td>
<td style="padding:13px 20px;text-align:center">$0</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Monthly Fee</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">$0</td>
<td style="padding:13px 20px;text-align:center">$0</td>
<td style="padding:13px 20px;text-align:center">$0</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">International Transfers</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">Domestic wires + ACH (use Wise for international)</td>
<td style="padding:13px 20px;text-align:center">Domestic ACH + wires</td>
<td style="padding:13px 20px;text-align:center;font-weight:600">Best rates — multi-currency native</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Debit Card</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700"><span style="color:#1b3a2d">✓</span> Virtual + Physical</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#1b3a2d">✓</span> Virtual + Physical</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#1b3a2d">✓</span> Virtual + Physical</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Non-Resident Friendly</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700"><span style="color:#1b3a2d">✓</span> Most popular for non-residents</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#1b3a2d">✓</span> Accepts non-residents</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#1b3a2d">✓</span> Accepts non-residents</td>
</tr>
<tr>
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Best For</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">Primary US business banking</td>
<td style="padding:13px 20px;text-align:center">Businesses needing multiple sub-accounts</td>
<td style="padding:13px 20px;text-align:center">International payments and multi-currency</td>
</tr>
</tbody>
</table>
</div>

<h3>How It Works</h3>
<ol>
<li><strong>Gather Your Documents:</strong> You will need your EIN letter, Articles of Organization, Operating Agreement, passport, and proof of address. We provide a checklist and review your documents before submission.</li>
<li><strong>We Guide Your Application:</strong> Follow our step-by-step instructions to submit your application to your chosen bank. We help you answer business verification questions correctly to maximize approval chances.</li>
<li><strong>Account Setup and Integration:</strong> Once approved, we help you configure your account, order debit cards, and connect it to payment processors like Stripe and PayPal.</li>
</ol>

<p style="margin-top:24px;padding:16px 20px;background:#f0faf5;border-left:4px solid #1b3a2d;border-radius:0 8px 8px 0;font-size:14px;color:#1b3a2d"><strong>Important:</strong> Many non-resident LLC owners use Mercury as their primary US bank account alongside Wise for international transfers. Both can be opened 100% remotely. Approval is not guaranteed — having proper LLC formation documents and a clear business description significantly improves your chances.</p>`,
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
    metaTitle: "LLC Annual Report Filing Service | LLCPad",
    metaDescription: "File your LLC annual report on time and stay compliant. LLCPad handles annual reports for non-US residents in all 50 states. Get started today.",
    description: `<p>Every US LLC must file an <strong>annual report</strong> (or equivalent periodic report) with its state of formation to remain in <strong>good standing</strong>. Missing this filing can lead to <strong>administrative dissolution</strong>, late fees, and loss of liability protection. LLCPad handles the entire annual report process so international business owners can stay compliant without worrying about state deadlines.</p>

<h3>Why You Need Annual Report Filing</h3>
<ul>
  <li><strong>Maintain Good Standing:</strong> States require annual or biennial reports to confirm your LLC's information is current. Failing to file can result in your LLC being involuntarily dissolved.</li>
  <li><strong>Avoid Late Penalties:</strong> Many states impose late fees ranging from $50 to $200 on top of the standard filing fee. California charges an additional penalty for late franchise tax payments.</li>
  <li><strong>Preserve Liability Protection:</strong> An LLC that loses good standing may lose the personal liability shield that protects its members' personal assets.</li>
  <li><strong>Keep Banking &amp; Contracts Active:</strong> Banks and business partners often verify good standing status. A lapsed report can freeze your business bank account or void contractual agreements.</li>
</ul>

<div style="overflow-x:auto;margin:32px 0;padding-top:20px">
<table style="width:100%;border-collapse:separate;border-spacing:0;border-radius:12px;font-size:15px;border:1px solid #e8e5dd">
<thead><tr style="background:#1b3a2d;color:#faf8f4">
<th style="padding:14px 20px;text-align:left;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">State</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px;position:relative"><span style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:#e84c1e;color:#fff;font-size:10px;padding:2px 10px;border-radius:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap">Recommended</span>Wyoming</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Delaware</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">New Mexico</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Florida</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Texas</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">California</th>
</tr></thead>
<tbody>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Annual Fee</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">$60/yr</td>
<td style="padding:13px 20px;text-align:center">$300/yr</td>
<td style="padding:13px 20px;text-align:center">$0</td>
<td style="padding:13px 20px;text-align:center">$138.75/yr</td>
<td style="padding:13px 20px;text-align:center">$0</td>
<td style="padding:13px 20px;text-align:center">$800/yr</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Fee Type</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">Annual Report</td>
<td style="padding:13px 20px;text-align:center">Franchise Tax</td>
<td style="padding:13px 20px;text-align:center">No Report</td>
<td style="padding:13px 20px;text-align:center">Annual Report</td>
<td style="padding:13px 20px;text-align:center">No Fee Report</td>
<td style="padding:13px 20px;text-align:center">Franchise Tax</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Due Date</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">1st day of anniv. month</td>
<td style="padding:13px 20px;text-align:center">June 1</td>
<td style="padding:13px 20px;text-align:center">N/A</td>
<td style="padding:13px 20px;text-align:center">May 1</td>
<td style="padding:13px 20px;text-align:center">May 15</td>
<td style="padding:13px 20px;text-align:center">April 15</td>
</tr>
<tr>
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Late Penalty</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">$50 or dissolution</td>
<td style="padding:13px 20px;text-align:center">$200 + 1.5%/mo</td>
<td style="padding:13px 20px;text-align:center">N/A</td>
<td style="padding:13px 20px;text-align:center">$400 supplement</td>
<td style="padding:13px 20px;text-align:center">Forfeiture</td>
<td style="padding:13px 20px;text-align:center">$250 penalty</td>
</tr>
</tbody>
</table>
</div>

<h3>How It Works</h3>
<ol>
  <li><strong>Share Your LLC Details:</strong> Provide your LLC name, state of formation, and current registered agent information through our secure portal.</li>
  <li><strong>We Prepare &amp; File:</strong> Our compliance team prepares your annual report with accurate information and files it directly with the Secretary of State before the deadline.</li>
  <li><strong>Receive Confirmation:</strong> You get a filed copy of the annual report and confirmation that your LLC remains in good standing.</li>
</ol>

<p style="margin-top:24px;padding:16px 20px;background:#f0faf5;border-left:4px solid #1b3a2d;border-radius:0 8px 8px 0;font-size:14px;color:#1b3a2d"><strong>Important:</strong> Annual report deadlines vary by state and are strictly enforced. If your LLC misses its filing window, the state may administratively dissolve your company — requiring costly reinstatement. We recommend setting up annual filing reminders at least 60 days before your due date.</p>`,
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
    metaTitle: "Amazon Brand Registry Enrollment | LLCPad",
    metaDescription: "Enroll in Amazon Brand Registry to protect your brand and unlock A+ Content, Brand Analytics, and more. Non-US sellers welcome. Start with LLCPad.",
    description: `<p><strong>Amazon Brand Registry</strong> gives you powerful tools to protect your brand, enhance your product listings, and gain insights into customer behavior. For international sellers building a <strong>private label brand</strong> on Amazon.com, Brand Registry is essential — it unlocks features that directly increase conversion rates and defend your listings from hijackers and counterfeiters.</p>

<h3>Why You Need Brand Registry</h3>
<ul>
  <li><strong>Listing Protection:</strong> Prevent unauthorized sellers from modifying your product titles, images, and descriptions — a common problem for successful brands.</li>
  <li><strong>A+ Content Access:</strong> Create rich, image-heavy product descriptions that can boost conversion rates by 5–10% compared to plain-text listings.</li>
  <li><strong>Brand Analytics:</strong> Access search term data, market basket analysis, and repeat purchase behavior to make data-driven decisions.</li>
  <li><strong>Counterfeit Prevention:</strong> Use tools like Transparency and Project Zero to proactively remove counterfeit products from the marketplace.</li>
</ul>

<div style="overflow-x:auto;margin:32px 0;padding-top:20px">
<table style="width:100%;border-collapse:separate;border-spacing:0;border-radius:12px;font-size:15px;border:1px solid #e8e5dd">
<thead><tr style="background:#1b3a2d;color:#faf8f4">
<th style="padding:14px 20px;text-align:left;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Benefit</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Access</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Cost</th>
</tr></thead>
<tbody>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">A+ Content (Enhanced Brand Content)</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#1b3a2d">✓</span> Included</td>
<td style="padding:13px 20px;text-align:center;color:#1b3a2d;font-weight:700">Free</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Brand Analytics</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#1b3a2d">✓</span> Included</td>
<td style="padding:13px 20px;text-align:center;color:#1b3a2d;font-weight:700">Free</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Sponsored Brands Ads</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#1b3a2d">✓</span> Included</td>
<td style="padding:13px 20px;text-align:center">Pay-per-click</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Transparency (Anti-Counterfeit)</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#1b3a2d">✓</span> Included</td>
<td style="padding:13px 20px;text-align:center">Per-unit label cost</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Project Zero (Self-Service Removal)</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#1b3a2d">✓</span> By invitation</td>
<td style="padding:13px 20px;text-align:center;color:#1b3a2d;font-weight:700">Free</td>
</tr>
<tr>
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Virtual Bundles</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#1b3a2d">✓</span> Included</td>
<td style="padding:13px 20px;text-align:center;color:#1b3a2d;font-weight:700">Free</td>
</tr>
</tbody>
</table>
</div>

<h3>How It Works</h3>
<ol>
  <li><strong>Trademark Verification:</strong> We verify you have an active or pending US trademark (required by Amazon). If you don't have one, we can help you file.</li>
  <li><strong>Application Submission:</strong> We complete the Brand Registry application through Amazon's portal, linking your trademark to your Seller Central account.</li>
  <li><strong>Activation &amp; Setup:</strong> Once approved (typically 2–4 weeks), we help you activate A+ Content, Brand Analytics, and Sponsored Brands on your account.</li>
</ol>

<p style="margin-top:24px;padding:16px 20px;background:#f0faf5;border-left:4px solid #1b3a2d;border-radius:0 8px 8px 0;font-size:14px;color:#1b3a2d"><strong>Important:</strong> Brand Registry requires a registered or pending trademark with the USPTO. The trademark must match the brand name on your product packaging. We recommend filing your trademark early, as the process can take 8–12 months for full registration.</p>`,
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
    metaTitle: "LLC Bookkeeping Services for Non-Residents | LLCPad",
    metaDescription: "Professional bookkeeping for US LLCs owned by non-residents. Monthly, quarterly, or annual plans. Stay tax-ready year-round. Get started.",
    description: `<p>Accurate <strong>bookkeeping</strong> is the foundation of a healthy US LLC. Whether you run an e-commerce store, offer freelance services, or operate a SaaS business, our <strong>bookkeeping service for non-resident LLC owners</strong> keeps your financial records organized, IRS-compliant, and ready for tax season — so you never scramble to find receipts or reconcile transactions at the last minute.</p>

<h3>Why You Need Professional Bookkeeping</h3>
<ul>
<li><strong>IRS Compliance:</strong> The IRS requires all LLCs to maintain adequate books and records. Without proper bookkeeping, you risk penalties during audits and cannot substantiate deductions.</li>
<li><strong>Tax-Ready Financials:</strong> When tax season arrives, organized books mean faster filing, lower preparation costs, and fewer errors on your returns.</li>
<li><strong>Business Decisions:</strong> Clear financial data helps you understand profitability, manage cash flow, and make informed decisions about scaling your business.</li>
<li><strong>Bank and Investor Requirements:</strong> US banks, payment processors, and potential investors expect professional financial records. Proper bookkeeping strengthens your credibility.</li>
</ul>

<div style="overflow-x:auto;margin:32px 0;padding-top:20px">
<table style="width:100%;border-collapse:separate;border-spacing:0;border-radius:12px;font-size:15px;border:1px solid #e8e5dd">
<thead><tr style="background:#1b3a2d;color:#faf8f4">
<th style="padding:14px 20px;text-align:left;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Feature</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px;position:relative"><span style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:#e84c1e;color:#fff;font-size:10px;padding:2px 10px;border-radius:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap">Recommended</span>Monthly</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Quarterly</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Annual</th>
</tr></thead>
<tbody>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Transaction Categorization</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">Every month</td>
<td style="padding:13px 20px;text-align:center">Every 3 months</td>
<td style="padding:13px 20px;text-align:center">Once at year-end</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Bank Reconciliation</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">Monthly</td>
<td style="padding:13px 20px;text-align:center">Quarterly</td>
<td style="padding:13px 20px;text-align:center">Annual</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Financial Reports</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">Monthly P&L + Balance Sheet</td>
<td style="padding:13px 20px;text-align:center">Quarterly summaries</td>
<td style="padding:13px 20px;text-align:center">Year-end only</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Best For</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">Active businesses, 50+ transactions/month</td>
<td style="padding:13px 20px;text-align:center">Moderate activity, 20–50 transactions/month</td>
<td style="padding:13px 20px;text-align:center">Low activity, under 20 transactions/month</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Tax Readiness</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">Always ready — no year-end rush</td>
<td style="padding:13px 20px;text-align:center">Mostly ready — minor catch-up needed</td>
<td style="padding:13px 20px;text-align:center">Requires significant year-end work</td>
</tr>
<tr>
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Cost Efficiency</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">Highest value — prevents costly errors</td>
<td style="padding:13px 20px;text-align:center">Good balance of cost and coverage</td>
<td style="padding:13px 20px;text-align:center">Lowest upfront cost</td>
</tr>
</tbody>
</table>
</div>

<h3>How It Works</h3>
<ol>
<li><strong>Connect Your Accounts:</strong> Grant read-only access to your US business bank account and payment processors. We securely import your transactions for categorization.</li>
<li><strong>We Organize Your Books:</strong> Our team categorizes every transaction, reconciles bank statements, and maintains your general ledger using industry-standard accounting practices.</li>
<li><strong>Receive Reports and Tax Packages:</strong> Get clear financial reports on your chosen schedule. At year-end, we deliver a complete tax-ready package to your accountant or our tax filing team.</li>
</ol>

<p style="margin-top:24px;padding:16px 20px;background:#f0faf5;border-left:4px solid #1b3a2d;border-radius:0 8px 8px 0;font-size:14px;color:#1b3a2d"><strong>Important:</strong> Mixing personal and business expenses is one of the most common mistakes for non-resident LLC owners. Always use a dedicated US business bank account for LLC transactions. This makes bookkeeping more accurate and protects your limited liability status.</p>`,
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
  // ITIN Application Service
  {
    slug: "itin-application",
    name: "ITIN Application",
    shortDesc: "Get your Individual Taxpayer Identification Number (ITIN) for US tax filing. Required for foreign nationals without SSN. CAA-assisted processing.",
    metaTitle: "ITIN Application for Non-US Residents | LLCPad",
    metaDescription: "Apply for a US ITIN (Individual Taxpayer ID) without visiting the US. Required for tax filing & treaty benefits. CAA-assisted processing for non-residents.",
    description: `<p>An <strong>ITIN (Individual Taxpayer Identification Number)</strong> is a tax processing number issued by the IRS to individuals who are required to file US taxes but are <strong>not eligible for a Social Security Number</strong>. If you're a non-US resident who owns a US LLC, an ITIN allows you to file personal tax returns, claim tax treaty benefits, and meet withholding requirements.</p>

<h3>Why You Need an ITIN</h3>
<ul>
  <li><strong>US Tax Filing:</strong> Non-resident LLC owners who earn US-sourced income must file a US tax return — and you need either an SSN or ITIN to do so.</li>
  <li><strong>Tax Treaty Benefits:</strong> An ITIN lets you claim reduced withholding rates under the US tax treaty with your home country (available for India, Bangladesh, Pakistan, and many others).</li>
  <li><strong>Avoid 30% Withholding:</strong> Without an ITIN, payment processors and banks may withhold 30% of your US income for backup withholding — an ITIN can reduce or eliminate this.</li>
  <li><strong>Build US Financial History:</strong> Some US financial institutions accept an ITIN for credit applications, helping you build a US financial footprint over time.</li>
</ul>

<div style="overflow-x:auto;margin:32px 0;padding-top:20px">
<table style="width:100%;border-collapse:separate;border-spacing:0;border-radius:12px;font-size:15px;border:1px solid #e8e5dd">
<thead><tr style="background:#1b3a2d;color:#faf8f4">
<th style="padding:14px 20px;text-align:left;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Feature</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px;position:relative"><span style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:#e84c1e;color:#fff;font-size:10px;padding:2px 10px;border-radius:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap">Recommended</span>ITIN</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">EIN</th>
</tr></thead>
<tbody>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Purpose</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">Personal tax filing</td>
<td style="padding:13px 20px;text-align:center">Business tax identification</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Who Needs It</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">Non-resident individuals</td>
<td style="padding:13px 20px;text-align:center">Businesses &amp; LLCs</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Format</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">9XX-XX-XXXX</td>
<td style="padding:13px 20px;text-align:center">XX-XXXXXXX</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Processing Time</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">7–11 weeks</td>
<td style="padding:13px 20px;text-align:center">1–4 weeks</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Required Documents</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">Passport + W-7 form + tax return</td>
<td style="padding:13px 20px;text-align:center">SS-4 form + LLC docs</td>
</tr>
<tr>
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Issued By</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">IRS</td>
<td style="padding:13px 20px;text-align:center">IRS</td>
</tr>
</tbody>
</table>
</div>

<h3>How It Works</h3>
<ol>
  <li><strong>Gather Your Documents:</strong> You need a valid passport (or certified copies) and the completed IRS Form W-7 — our team prepares the W-7 for you based on your information.</li>
  <li><strong>CAA-Assisted Processing:</strong> We work with IRS-authorized Certifying Acceptance Agents (CAAs) who can certify your passport copies, so you don't need to mail your original passport to the IRS.</li>
  <li><strong>Receive Your ITIN:</strong> The IRS mails your ITIN assignment letter (CP 565) once processing is complete — typically 7 to 11 weeks after submission.</li>
</ol>

<p style="margin-top:24px;padding:16px 20px;background:#f0faf5;border-left:4px solid #1b3a2d;border-radius:0 8px 8px 0;font-size:14px;color:#1b3a2d"><strong>Important:</strong> An ITIN is for tax purposes only — it does not authorize work in the US or affect your immigration status. ITINs must be renewed if not used on a federal tax return for three consecutive years.</p>`,
    icon: "UserCheck",
    image: "/images/services/itin.jpg",
    startingPrice: 299,
    categorySlug: "tax-finance",
    isPopular: false,
    features: [
      "Form W-7 preparation",
      "CAA document certification",
      "No need to mail original passport",
      "Tax return preparation included",
      "IRS submission handling",
      "Application tracking",
    ],
    packages: [
      {
        name: "Standard",
        price: 299,
        description: "ITIN application with CAA certification",
        features: ["W-7 Preparation", "CAA Certification", "Document Review", "IRS Submission"],
        notIncluded: ["Tax Return Filing", "Rush Processing"],
        isPopular: true,
      },
      {
        name: "Premium",
        price: 449,
        description: "ITIN + Tax return filing",
        features: ["Everything in Standard", "Tax Return Preparation", "Form 1040-NR Filing", "Tax Consultation"],
        notIncluded: [],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "How long does ITIN processing take?",
        answer: "The IRS typically processes ITIN applications within 7-11 weeks. During peak tax season (January-April), processing may take longer.",
      },
      {
        question: "Do I need to send my original passport to the IRS?",
        answer: "No! Through our CAA-assisted service, your documents are certified locally. You never need to mail your original passport to the IRS.",
      },
      {
        question: "What documents do I need for ITIN application?",
        answer: "You need a valid passport (most common) or combination of identity documents. Our team will guide you on accepted documents from your country.",
      },
      {
        question: "Do I need an ITIN if I have an EIN?",
        answer: "They serve different purposes. EIN is for your LLC. ITIN is for you personally if you need to file US taxes or claim treaty benefits. Many foreign LLC owners need both.",
      },
    ],
  },
  // DBA/Trade Name
  {
    slug: "dba-filing",
    name: "DBA/Trade Name",
    shortDesc: "Register a DBA (Doing Business As) or trade name for your LLC. Operate under multiple brand names legally.",
    metaTitle: "DBA Filing / Trade Name Registration | LLCPad",
    metaDescription: "Register a DBA (Doing Business As) for your US LLC. Operate under a different brand name legally. Fast filing for non-US business owners.",
    description: `<p>A <strong>DBA (Doing Business As)</strong>, also called a trade name or fictitious business name, lets your LLC operate under a <strong>different brand name</strong> without forming a new legal entity. If you want your LLC named "Global Ventures LLC" to sell products under "QuickShip Store," a DBA makes that possible — legally and professionally.</p>

<h3>Why You Need a DBA</h3>
<ul>
  <li><strong>Brand Flexibility:</strong> Launch multiple brands, storefronts, or product lines under a single LLC without creating separate legal entities for each.</li>
  <li><strong>Professional Banking:</strong> Accept payments and open bank accounts in your DBA name, so customers see your brand name — not your LLC's legal name.</li>
  <li><strong>Legal Compliance:</strong> Most states require you to register a DBA if you conduct business under any name other than your LLC's exact legal name.</li>
  <li><strong>Cost Efficiency:</strong> Running multiple brands under one LLC with DBAs is far cheaper than forming separate LLCs for each brand.</li>
</ul>

<div style="overflow-x:auto;margin:32px 0;padding-top:20px">
<table style="width:100%;border-collapse:separate;border-spacing:0;border-radius:12px;font-size:15px;border:1px solid #e8e5dd">
<thead><tr style="background:#1b3a2d;color:#faf8f4">
<th style="padding:14px 20px;text-align:left;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Feature</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">LLC Legal Name</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px;position:relative"><span style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:#e84c1e;color:#fff;font-size:10px;padding:2px 10px;border-radius:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap">Recommended</span>DBA Name</th>
</tr></thead>
<tbody>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Legal Protection</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#1b3a2d">&#10003;</span> Full LLC protection</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700"><span style="color:#1b3a2d">&#10003;</span> Inherits LLC protection</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Filing Cost</td>
<td style="padding:13px 20px;text-align:center">Included with formation</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">$10–$100 (varies by state)</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Filing Location</td>
<td style="padding:13px 20px;text-align:center">Secretary of State</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">State or county level</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Brand Flexibility</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#dc2626">&#10007;</span> One name only</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700"><span style="color:#1b3a2d">&#10003;</span> Unlimited brand names</td>
</tr>
<tr>
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Separate Bank Account</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#1b3a2d">&#10003;</span> Yes</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700"><span style="color:#1b3a2d">&#10003;</span> Yes, under DBA name</td>
</tr>
</tbody>
</table>
</div>

<h3>How It Works</h3>
<ol>
  <li><strong>Choose Your Brand Name:</strong> Tell us the trade name you want to operate under — we perform a name availability search in your filing state.</li>
  <li><strong>We File the DBA:</strong> Our team prepares and submits the DBA registration to the appropriate state or county office, handling any publication requirements.</li>
  <li><strong>Start Using Your Brand:</strong> Once approved, you receive your DBA certificate — use it to open a branded bank account, accept payments, and market your business.</li>
</ol>

<p style="margin-top:24px;padding:16px 20px;background:#f0faf5;border-left:4px solid #1b3a2d;border-radius:0 8px 8px 0;font-size:14px;color:#1b3a2d"><strong>Important:</strong> A DBA does not create a new legal entity or provide trademark protection. If you want exclusive rights to your brand name nationwide, consider pairing your DBA with a federal trademark registration.</p>`,
    icon: "Tag",
    image: "/images/services/dba.jpg",
    startingPrice: 99,
    categorySlug: "formation",
    isPopular: false,
    features: [
      "State DBA registration",
      "Name availability search",
      "Filing with state/county",
      "DBA certificate",
      "Publication if required",
      "Renewal reminders",
    ],
    packages: [
      {
        name: "Standard",
        price: 99,
        description: "DBA registration (+ state/county fees)",
        features: ["Name Search", "DBA Filing", "Certificate of Filing", "Digital Document Storage"],
        notIncluded: ["Publication", "Renewal Filing"],
        isPopular: true,
      },
    ],
    faqs: [
      {
        question: "What's the difference between a DBA and an LLC?",
        answer: "An LLC is a legal business entity that provides liability protection. A DBA is just a registered trade name - it doesn't create a new entity or provide additional liability protection.",
      },
      {
        question: "Do I need a DBA for each product line?",
        answer: "Not necessarily. A DBA is only needed if you want to operate under a name different from your LLC's legal name. You can sell multiple products under your LLC name without a DBA.",
      },
      {
        question: "Can I use my DBA name on Amazon?",
        answer: "Amazon uses your legal business name for verification. However, you can display your DBA as your storefront/brand name. For full brand protection, consider trademark registration.",
      },
    ],
  },
  // Operating Agreement
  {
    slug: "operating-agreement",
    name: "Operating Agreement",
    shortDesc: "Custom LLC Operating Agreement drafted for your business. Required by banks and essential for multi-member LLCs.",
    metaTitle: "LLC Operating Agreement — Custom Drafted | LLCPad",
    metaDescription: "Get a custom LLC Operating Agreement for single or multi-member LLCs. Required for banking & legal protection. Drafted for non-US LLC owners.",
    description: `<p>An <strong>LLC Operating Agreement</strong> is a legal document that defines the ownership structure, management rules, and financial arrangements of your company. While not always required by the state, <strong>US banks will ask for your Operating Agreement</strong> when you open a business account — making it an essential document for every non-US LLC owner.</p>

<h3>Why You Need an Operating Agreement</h3>
<ul>
  <li><strong>Bank Account Requirement:</strong> US banks like Mercury, Relay, and Chase require an Operating Agreement to verify your LLC's ownership before opening an account.</li>
  <li><strong>Liability Protection:</strong> Without an Operating Agreement, courts may disregard your LLC's liability protection — a concept known as "piercing the corporate veil."</li>
  <li><strong>Clear Ownership Rules:</strong> Define member percentages, voting rights, and what happens if a member leaves — preventing disputes before they arise.</li>
  <li><strong>Tax Election Support:</strong> Your Operating Agreement documents how profits and losses are distributed, which is critical for proper tax filing.</li>
</ul>

<div style="overflow-x:auto;margin:32px 0;padding-top:20px">
<table style="width:100%;border-collapse:separate;border-spacing:0;border-radius:12px;font-size:15px;border:1px solid #e8e5dd">
<thead><tr style="background:#1b3a2d;color:#faf8f4">
<th style="padding:14px 20px;text-align:left;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Feature</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px;position:relative"><span style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:#e84c1e;color:#fff;font-size:10px;padding:2px 10px;border-radius:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap">Recommended</span>Single-Member</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Multi-Member</th>
</tr></thead>
<tbody>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Management</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">Sole owner manages</td>
<td style="padding:13px 20px;text-align:center">Member or manager-managed</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Profit Distribution</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">100% to single member</td>
<td style="padding:13px 20px;text-align:center">Per ownership % or custom split</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Tax Implications</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">Disregarded entity (simpler)</td>
<td style="padding:13px 20px;text-align:center">Partnership tax return (Form 1065)</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Complexity</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">Simple &amp; straightforward</td>
<td style="padding:13px 20px;text-align:center">Requires detailed provisions</td>
</tr>
<tr>
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Required States</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700" colspan="2">California, Delaware, Maine, Missouri, New York (legally required); all other states strongly recommended</td>
</tr>
</tbody>
</table>
</div>

<h3>How It Works</h3>
<ol>
  <li><strong>Tell Us Your LLC Structure:</strong> Specify whether you have a single-member or multi-member LLC, along with ownership percentages and management preferences.</li>
  <li><strong>We Draft Your Agreement:</strong> Our team creates a state-compliant Operating Agreement tailored to your LLC's structure, including dissolution and amendment clauses.</li>
  <li><strong>Review &amp; Sign:</strong> Receive your completed Operating Agreement ready for signing — use it immediately for bank account applications and legal protection.</li>
</ol>

<p style="margin-top:24px;padding:16px 20px;background:#f0faf5;border-left:4px solid #1b3a2d;border-radius:0 8px 8px 0;font-size:14px;color:#1b3a2d"><strong>Important:</strong> Most non-US entrepreneurs form single-member LLCs, which are treated as "disregarded entities" by the IRS. This means simpler tax filing — but you still need a properly drafted Operating Agreement to prove your LLC's legitimacy to banks and the courts.</p>`,
    icon: "FileText",
    image: "/images/services/operating-agreement.jpg",
    startingPrice: 79,
    categorySlug: "formation",
    isPopular: false,
    features: [
      "Customized Operating Agreement",
      "Single or multi-member options",
      "Management structure defined",
      "Profit distribution rules",
      "Member rights and duties",
      "Dissolution procedures",
    ],
    packages: [
      {
        name: "Single-Member",
        price: 79,
        description: "Operating Agreement for single-owner LLC",
        features: ["Customized Agreement", "Management Provisions", "Bank-Ready Format", "Digital Delivery"],
        notIncluded: ["Multi-Member Provisions"],
        isPopular: true,
      },
      {
        name: "Multi-Member",
        price: 149,
        description: "Operating Agreement for multiple owners",
        features: ["Everything in Single-Member", "Ownership Percentages", "Voting Rights", "Buyout Provisions", "Profit Distribution Rules"],
        notIncluded: [],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "Is an Operating Agreement legally required?",
        answer: "It depends on the state. California, Delaware, Maine, Missouri, and New York require it by law. However, even in states where it's not required, banks and investors will ask for it.",
      },
      {
        question: "Can I write my own Operating Agreement?",
        answer: "You can, but we don't recommend it. A poorly drafted agreement can cause legal issues, fail bank requirements, or not hold up in disputes. Professional drafting ensures all necessary provisions are included.",
      },
      {
        question: "Can I change my Operating Agreement later?",
        answer: "Yes, Operating Agreements can be amended. We recommend reviewing and updating your agreement when there are ownership changes, major business changes, or annually.",
      },
    ],
  },
  // Certificate of Good Standing
  {
    slug: "certificate-good-standing",
    name: "Certificate of Good Standing",
    shortDesc: "Get an official Certificate of Good Standing for your LLC. Required for banking, contracts, and foreign registration.",
    metaTitle: "Certificate of Good Standing Service | LLCPad",
    metaDescription: "Get your LLC Certificate of Good Standing fast. Essential for banking, contracts, and foreign qualification. LLCPad serves non-US LLC owners.",
    description: `<p>A <strong>Certificate of Good Standing</strong> (also called a Certificate of Existence or Certificate of Status) is an official state document confirming that your LLC is <strong>properly registered, compliant with all filings, and authorized to do business</strong>. Banks, government agencies, and business partners frequently require this document. LLCPad obtains your certificate directly from the state so you don't have to navigate unfamiliar government portals.</p>

<h3>Why You Need a Certificate of Good Standing</h3>
<ul>
  <li><strong>Open or Maintain Bank Accounts:</strong> US banks routinely request a recent Certificate of Good Standing before opening business accounts or during annual reviews — especially for non-US owned LLCs.</li>
  <li><strong>Win Contracts &amp; Partnerships:</strong> Many business partners, vendors, and government agencies require proof of good standing before entering into contracts or issuing permits.</li>
  <li><strong>Foreign Qualification:</strong> If you want to register your LLC to do business in another US state, that state will require a Certificate of Good Standing from your home state.</li>
  <li><strong>Annual Renewals &amp; Licensing:</strong> Certain business licenses, professional permits, and state registrations require a current good standing certificate for renewal.</li>
</ul>

<div style="overflow-x:auto;margin:32px 0;padding-top:20px">
<table style="width:100%;border-collapse:separate;border-spacing:0;border-radius:12px;font-size:15px;border:1px solid #e8e5dd">
<thead><tr style="background:#1b3a2d;color:#faf8f4">
<th style="padding:14px 20px;text-align:left;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">When You Need It</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Wyoming</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Delaware</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">New Mexico</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Florida</th>
</tr></thead>
<tbody>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Banking &amp; Financial</td>
<td style="padding:13px 20px;text-align:center">1 – 3 days</td>
<td style="padding:13px 20px;text-align:center">Same day (online)</td>
<td style="padding:13px 20px;text-align:center">3 – 5 days</td>
<td style="padding:13px 20px;text-align:center">1 – 3 days (online)</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Contracts &amp; Partnerships</td>
<td style="padding:13px 20px;text-align:center">1 – 3 days</td>
<td style="padding:13px 20px;text-align:center">Same day (online)</td>
<td style="padding:13px 20px;text-align:center">3 – 5 days</td>
<td style="padding:13px 20px;text-align:center">1 – 3 days (online)</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Foreign Qualification</td>
<td style="padding:13px 20px;text-align:center">1 – 3 days</td>
<td style="padding:13px 20px;text-align:center">Same day (online)</td>
<td style="padding:13px 20px;text-align:center">3 – 5 days</td>
<td style="padding:13px 20px;text-align:center">1 – 3 days (online)</td>
</tr>
<tr>
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Annual Renewal / Licensing</td>
<td style="padding:13px 20px;text-align:center">1 – 3 days</td>
<td style="padding:13px 20px;text-align:center">Same day (online)</td>
<td style="padding:13px 20px;text-align:center">3 – 5 days</td>
<td style="padding:13px 20px;text-align:center">1 – 3 days (online)</td>
</tr>
</tbody>
</table>
</div>

<h3>How It Works</h3>
<ol>
  <li><strong>Submit Your LLC Information:</strong> Provide your LLC name, state of formation, and filing number so we can locate your entity in the state database.</li>
  <li><strong>We Request the Certificate:</strong> Our team submits the request directly to the Secretary of State and pays any applicable state fees on your behalf.</li>
  <li><strong>Receive Your Certificate:</strong> You get the official Certificate of Good Standing as a digital copy, with the option for a mailed physical copy if needed.</li>
</ol>

<p style="margin-top:24px;padding:16px 20px;background:#f0faf5;border-left:4px solid #1b3a2d;border-radius:0 8px 8px 0;font-size:14px;color:#1b3a2d"><strong>Important:</strong> A Certificate of Good Standing is only valid for a limited time — most banks and agencies require one issued within the last 30 to 90 days. If your LLC has any outstanding annual reports or unpaid fees, the state will deny the request until those are resolved. Make sure your filings are current before ordering.</p>`,
    icon: "Award",
    image: "/images/services/good-standing.jpg",
    startingPrice: 75,
    categorySlug: "compliance",
    isPopular: false,
    features: [
      "Official state certificate",
      "Current date certification",
      "Digital and physical copies",
      "Rush processing available",
      "Apostille add-on option",
      "Bank-ready format",
    ],
    packages: [
      {
        name: "Standard",
        price: 75,
        description: "Certificate of Good Standing (+ state fee)",
        features: ["State Filing", "Digital Certificate", "Physical Copy Mailed", "5-7 Business Days"],
        notIncluded: ["Apostille", "Rush Processing"],
        isPopular: true,
      },
      {
        name: "Rush",
        price: 125,
        description: "Expedited Certificate of Good Standing",
        features: ["Everything in Standard", "24-48 Hour Processing", "Priority Handling"],
        notIncluded: ["Apostille"],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "How long is a Certificate of Good Standing valid?",
        answer: "Certificates are typically valid for 30-90 days, depending on the requesting party's requirements. Banks usually accept certificates dated within 30-60 days.",
      },
      {
        question: "What if my LLC is not in good standing?",
        answer: "If your LLC has compliance issues (missed annual reports, unpaid fees), we can help you resolve them and restore good standing before obtaining the certificate.",
      },
      {
        question: "Do I need an apostille for US banks?",
        answer: "No, apostilles are only needed for international use. US banks accept standard Certificates of Good Standing without apostille.",
      },
    ],
  },
  // Amendment Filing
  {
    slug: "amendment-filing",
    name: "Amendment Filing",
    shortDesc: "File amendments to update your LLC's registered information. Name changes, address changes, member changes, and more.",
    metaTitle: "LLC Amendment Filing Service | LLCPad",
    metaDescription: "File LLC amendments for name changes, address updates, and member changes. Fast processing for non-US residents. Start your amendment with LLCPad.",
    description: `<p>When your LLC's information changes — whether it's a <strong>new business name</strong>, updated <strong>principal address</strong>, or a change in <strong>members or managers</strong> — you must file an <strong>Articles of Amendment</strong> (or Certificate of Amendment) with your state. LLCPad handles the entire amendment process for international LLC owners, ensuring your state records stay accurate and your LLC remains compliant.</p>

<h3>Why You Need Amendment Filing</h3>
<ul>
  <li><strong>Legal Compliance:</strong> Most states require you to update your formation documents within 30–90 days of any material change. Failure to file can result in penalties or loss of good standing.</li>
  <li><strong>Accurate Public Records:</strong> Your LLC's state filing is a public record. Outdated information can cause issues with banking, contracts, and government agencies.</li>
  <li><strong>Protect Your Brand:</strong> If you're changing your LLC name, the amendment officially reserves your new name with the state and prevents others from using it.</li>
  <li><strong>Maintain Banking Access:</strong> Banks verify LLC information against state records. Mismatched details (especially name or member changes) can freeze your account.</li>
</ul>

<div style="overflow-x:auto;margin:32px 0;padding-top:20px">
<table style="width:100%;border-collapse:separate;border-spacing:0;border-radius:12px;font-size:15px;border:1px solid #e8e5dd">
<thead><tr style="background:#1b3a2d;color:#faf8f4">
<th style="padding:14px 20px;text-align:left;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Amendment Type</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Typical State Fee</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Processing Time</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Urgency</th>
</tr></thead>
<tbody>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">LLC Name Change</td>
<td style="padding:13px 20px;text-align:center">$50 – $150</td>
<td style="padding:13px 20px;text-align:center">3 – 10 business days</td>
<td style="padding:13px 20px;text-align:center;color:#e84c1e;font-weight:600">High</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Principal Address Change</td>
<td style="padding:13px 20px;text-align:center">$25 – $100</td>
<td style="padding:13px 20px;text-align:center">3 – 7 business days</td>
<td style="padding:13px 20px;text-align:center;color:#d97706;font-weight:600">Medium</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Member / Manager Change</td>
<td style="padding:13px 20px;text-align:center">$25 – $100</td>
<td style="padding:13px 20px;text-align:center">5 – 15 business days</td>
<td style="padding:13px 20px;text-align:center;color:#e84c1e;font-weight:600">High</td>
</tr>
<tr>
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Registered Agent Change</td>
<td style="padding:13px 20px;text-align:center">$25 – $75</td>
<td style="padding:13px 20px;text-align:center">1 – 5 business days</td>
<td style="padding:13px 20px;text-align:center;color:#d97706;font-weight:600">Medium</td>
</tr>
</tbody>
</table>
</div>

<h3>How It Works</h3>
<ol>
  <li><strong>Tell Us What Changed:</strong> Select the type of amendment you need and provide the updated information through our secure order form.</li>
  <li><strong>We Draft &amp; File:</strong> Our team prepares the Articles of Amendment with the correct state-specific form and files it with the Secretary of State on your behalf.</li>
  <li><strong>Receive Your Updated Documents:</strong> Once approved, you receive the stamped amendment confirmation and updated formation documents for your records.</li>
</ol>

<p style="margin-top:24px;padding:16px 20px;background:#f0faf5;border-left:4px solid #1b3a2d;border-radius:0 8px 8px 0;font-size:14px;color:#1b3a2d"><strong>Important:</strong> After filing a state amendment, remember to update your Operating Agreement, EIN records with the IRS (if applicable), bank accounts, and any business licenses. A name change in particular requires updating your EIN letter by submitting IRS Form SS-4 or calling the IRS directly.</p>`,
    icon: "FileEdit",
    image: "/images/services/amendment.jpg",
    startingPrice: 99,
    categorySlug: "compliance",
    isPopular: false,
    features: [
      "Articles of Amendment preparation",
      "State filing submission",
      "Certified copy of amendment",
      "Internal document updates",
      "Compliance verification",
      "Follow-up support",
    ],
    packages: [
      {
        name: "Standard",
        price: 99,
        description: "Single amendment filing (+ state fee)",
        features: ["Amendment Preparation", "State Filing", "Certified Copy", "Document Storage"],
        notIncluded: ["IRS Updates", "Bank Notifications"],
        isPopular: true,
      },
      {
        name: "Complete",
        price: 179,
        description: "Amendment + all notifications",
        features: ["Everything in Standard", "IRS Notification (if needed)", "Bank Letter Template", "Operating Agreement Update"],
        notIncluded: [],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "How long does an amendment take to process?",
        answer: "Processing times vary by state. Most states process amendments within 5-10 business days. Rush processing is available in many states for an additional fee.",
      },
      {
        question: "Do I need to notify the IRS of changes?",
        answer: "Some changes require IRS notification. Name changes and responsible party changes require IRS notification. Address changes may also need reporting. We'll advise you on what's required.",
      },
      {
        question: "Will I get new formation documents after an amendment?",
        answer: "You'll receive a Certificate of Amendment or stamped Articles of Amendment. Your original Articles of Organization remain valid, supplemented by the amendment.",
      },
    ],
  },
  // LLC Dissolution
  {
    slug: "llc-dissolution",
    name: "LLC Dissolution",
    shortDesc: "Properly dissolve your LLC when closing your business. Avoid ongoing fees and compliance obligations.",
    metaTitle: "LLC Dissolution & Closing Service | LLCPad",
    metaDescription: "Properly dissolve your US LLC and avoid ongoing fees. LLCPad handles dissolution filing for non-US residents. Close your LLC the right way.",
    description: `<p>If you no longer need your US LLC, it's critical to <strong>formally dissolve</strong> it with the state rather than simply abandoning it. Without proper dissolution, you may continue to owe <strong>annual fees, franchise taxes, and state penalties</strong> indefinitely. LLCPad manages the full dissolution process so international LLC owners can close their business cleanly and avoid lingering liabilities.</p>

<h3>Why You Need Proper LLC Dissolution</h3>
<ul>
  <li><strong>Stop Ongoing Fees:</strong> States continue charging annual report fees and franchise taxes until your LLC is formally dissolved. In California, that means $800/year even if you earn nothing.</li>
  <li><strong>Avoid Accumulating Penalties:</strong> Unpaid state fees accumulate with interest and late penalties. Some states report delinquent entities to collections agencies.</li>
  <li><strong>Protect Your Personal Credit:</strong> In certain cases, unpaid state obligations tied to your LLC can affect your ability to form new businesses or obtain state permits.</li>
  <li><strong>Clean Legal Record:</strong> A properly dissolved LLC shows as "Dissolved" rather than "Delinquent" or "Revoked" in state records, which reflects well on you as a business owner.</li>
</ul>

<div style="overflow-x:auto;margin:32px 0;padding-top:20px">
<table style="width:100%;border-collapse:separate;border-spacing:0;border-radius:12px;font-size:15px;border:1px solid #e8e5dd">
<thead><tr style="background:#1b3a2d;color:#faf8f4">
<th style="padding:14px 20px;text-align:left;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Requirement</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px;position:relative"><span style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:#e84c1e;color:#fff;font-size:10px;padding:2px 10px;border-radius:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap">Recommended</span>Wyoming</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Delaware</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">New Mexico</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Florida</th>
</tr></thead>
<tbody>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">State Filing Fee</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">$0</td>
<td style="padding:13px 20px;text-align:center">$204</td>
<td style="padding:13px 20px;text-align:center">$0</td>
<td style="padding:13px 20px;text-align:center">$25</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Tax Clearance Needed</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700"><span style="color:#1b3a2d">✗ No</span></td>
<td style="padding:13px 20px;text-align:center"><span style="color:#dc2626">✓ Yes</span></td>
<td style="padding:13px 20px;text-align:center"><span style="color:#1b3a2d">✗ No</span></td>
<td style="padding:13px 20px;text-align:center"><span style="color:#1b3a2d">✗ No</span></td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Final Annual Report Due</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700"><span style="color:#1b3a2d">✗ No</span></td>
<td style="padding:13px 20px;text-align:center"><span style="color:#dc2626">✓ Yes</span></td>
<td style="padding:13px 20px;text-align:center"><span style="color:#1b3a2d">✗ No report</span></td>
<td style="padding:13px 20px;text-align:center"><span style="color:#dc2626">✓ Yes</span></td>
</tr>
<tr>
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Typical Timeline</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">2 – 3 weeks</td>
<td style="padding:13px 20px;text-align:center">4 – 8 weeks</td>
<td style="padding:13px 20px;text-align:center">1 – 2 weeks</td>
<td style="padding:13px 20px;text-align:center">3 – 5 weeks</td>
</tr>
</tbody>
</table>
</div>

<h3>How It Works</h3>
<ol>
  <li><strong>Confirm Your LLC Status:</strong> We verify your LLC's current standing and identify any outstanding fees, reports, or tax obligations that must be cleared before dissolution.</li>
  <li><strong>File Articles of Dissolution:</strong> Our team prepares and files the Articles of Dissolution (or Certificate of Cancellation) with the appropriate state agency.</li>
  <li><strong>Receive Dissolution Confirmation:</strong> Once processed, you receive the official dissolution confirmation document and guidance on closing your EIN with the IRS.</li>
</ol>

<p style="margin-top:24px;padding:16px 20px;background:#f0faf5;border-left:4px solid #1b3a2d;border-radius:0 8px 8px 0;font-size:14px;color:#1b3a2d"><strong>Important:</strong> Dissolution does not cancel your EIN with the IRS. You should also file a final federal tax return (Form 1065 or appropriate form), close your business bank account, and send a letter to the IRS to close your EIN. If you have outstanding state taxes, those must be settled before the state will accept dissolution.</p>`,
    icon: "FileX",
    image: "/images/services/dissolution.jpg",
    startingPrice: 149,
    categorySlug: "compliance",
    isPopular: false,
    features: [
      "Articles of Dissolution preparation",
      "State filing submission",
      "Tax clearance assistance",
      "IRS notification guidance",
      "Account closure checklist",
      "Dissolution certificate",
    ],
    packages: [
      {
        name: "Standard",
        price: 149,
        description: "LLC Dissolution filing (+ state fee)",
        features: ["Dissolution Documents", "State Filing", "Tax Clearance Guidance", "Closure Checklist"],
        notIncluded: ["Final Tax Returns", "Account Cancellations"],
        isPopular: true,
      },
    ],
    faqs: [
      {
        question: "What happens if I just stop using my LLC without dissolving?",
        answer: "The state will continue sending annual report notices and accumulating fees. Eventually, the state may administratively dissolve your LLC, but you'll still owe all back fees and potentially penalties. It's always better to dissolve properly.",
      },
      {
        question: "Do I need tax clearance to dissolve my LLC?",
        answer: "Some states require tax clearance certificates before accepting dissolution filings. This confirms you've paid all state taxes. We'll check your state's requirements and assist with the process.",
      },
      {
        question: "What about my EIN after dissolution?",
        answer: "Your EIN remains permanently assigned to your LLC - it cannot be transferred or reused. You should close the business account with the IRS by sending a letter, but the EIN itself stays on record.",
      },
    ],
  },
  // Apostille Service
  {
    slug: "apostille-service",
    name: "Apostille Service",
    shortDesc: "Get apostille certification for your US documents. Required for international legal recognition of your LLC documents.",
    metaTitle: "Apostille Service for US LLC Documents | LLCPad",
    metaDescription: "Get apostille certification for US LLC documents. Use your formation papers internationally. LLCPad apostille service for non-US entrepreneurs.",
    description: `<p>An <strong>apostille</strong> is an international certification that authenticates US documents for use in foreign countries under the <strong>Hague Apostille Convention</strong>. If you need to use your LLC formation documents, certificates, or legal paperwork in <strong>Bangladesh, India, UAE, Pakistan</strong>, or any other Hague member country, an apostille is required. LLCPad handles the complete apostille process — from document preparation to authentication by the US Secretary of State.</p>

<h3>Why You Need Apostille Service</h3>
<ul>
  <li><strong>International Business Use:</strong> Foreign banks, government agencies, and business partners require apostilled documents to verify the legitimacy of your US LLC.</li>
  <li><strong>Open Foreign Bank Accounts:</strong> If you're opening a business bank account in your home country using your US LLC, the bank will typically require apostilled formation documents.</li>
  <li><strong>Legal Proceedings Abroad:</strong> Court proceedings, property transactions, or regulatory filings in other countries require US documents to be apostilled for legal validity.</li>
  <li><strong>Government Registrations:</strong> Many countries require apostilled documents when registering a foreign-owned company, applying for trade licenses, or filing tax registrations.</li>
</ul>

<div style="overflow-x:auto;margin:32px 0;padding-top:20px">
<table style="width:100%;border-collapse:separate;border-spacing:0;border-radius:12px;font-size:15px;border:1px solid #e8e5dd">
<thead><tr style="background:#1b3a2d;color:#faf8f4">
<th style="padding:14px 20px;text-align:left;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Document</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Common Use Case</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Processing Time</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Notarization Needed</th>
</tr></thead>
<tbody>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Certificate of Formation</td>
<td style="padding:13px 20px;text-align:center">Foreign bank accounts, trade licenses</td>
<td style="padding:13px 20px;text-align:center">5 – 10 business days</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#1b3a2d">✗ No (state-issued)</span></td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Certificate of Good Standing</td>
<td style="padding:13px 20px;text-align:center">Annual bank verification, contracts</td>
<td style="padding:13px 20px;text-align:center">5 – 10 business days</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#1b3a2d">✗ No (state-issued)</span></td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Operating Agreement</td>
<td style="padding:13px 20px;text-align:center">Proof of ownership, partner disputes</td>
<td style="padding:13px 20px;text-align:center">7 – 15 business days</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#dc2626">✓ Yes (notarize first)</span></td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">EIN Confirmation Letter</td>
<td style="padding:13px 20px;text-align:center">Tax registration in home country</td>
<td style="padding:13px 20px;text-align:center">7 – 15 business days</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#dc2626">✓ Yes (notarize first)</span></td>
</tr>
<tr>
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Power of Attorney</td>
<td style="padding:13px 20px;text-align:center">Authorize representatives abroad</td>
<td style="padding:13px 20px;text-align:center">7 – 15 business days</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#dc2626">✓ Yes (notarize first)</span></td>
</tr>
</tbody>
</table>
</div>

<h3>How It Works</h3>
<ol>
  <li><strong>Send Us Your Documents:</strong> Upload or mail the documents you need apostilled. We'll review them and advise if notarization is required before apostille.</li>
  <li><strong>We Notarize &amp; Apostille:</strong> If needed, we arrange notarization through a licensed US notary, then submit the documents to the appropriate Secretary of State for apostille certification.</li>
  <li><strong>Receive Apostilled Documents:</strong> Your authenticated documents are shipped to your international address via express courier with tracking, or delivered as certified digital copies where accepted.</li>
</ol>

<p style="margin-top:24px;padding:16px 20px;background:#f0faf5;border-left:4px solid #1b3a2d;border-radius:0 8px 8px 0;font-size:14px;color:#1b3a2d"><strong>Important:</strong> Apostilles only work for countries that are part of the Hague Apostille Convention. For non-Hague countries, documents require embassy legalization instead (a longer process). Also note that federal documents (like IRS letters) must be apostilled by the US Department of State in Washington, DC — not the state Secretary of State.</p>`,
    icon: "Stamp",
    image: "/images/services/apostille.jpg",
    startingPrice: 149,
    categorySlug: "compliance",
    isPopular: false,
    features: [
      "Document review and preparation",
      "Notarization if required",
      "State apostille processing",
      "Federal apostille available",
      "International shipping",
      "Multiple document discounts",
    ],
    packages: [
      {
        name: "Single Document",
        price: 149,
        description: "Apostille for one document",
        features: ["Document Review", "Notarization (if needed)", "State Apostille", "Digital + Physical Copy"],
        notIncluded: ["International Shipping"],
        isPopular: true,
      },
      {
        name: "Document Package",
        price: 349,
        description: "Apostille for up to 3 documents",
        features: ["Everything in Single Document", "Up to 3 Documents", "Priority Processing", "International Shipping Included"],
        notIncluded: [],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "How long does apostille processing take?",
        answer: "Standard processing takes 5-10 business days depending on the state. Rush processing (2-3 days) is available for an additional fee. Some states are faster than others.",
      },
      {
        question: "Does my country accept apostilles?",
        answer: "Most countries accept apostilles, including all EU countries, UK, India, UAE, and many others. However, some countries (like China and Canada) are not part of the Hague Convention and require different authentication (embassy legalization).",
      },
      {
        question: "Can any document be apostilled?",
        answer: "Only official documents or notarized documents can be apostilled. Private documents (like contracts or agreements) must first be notarized before they can receive an apostille.",
      },
    ],
  },
  // Tax Filing Service
  {
    slug: "tax-filing",
    name: "Tax Filing Service",
    shortDesc: "Professional US tax filing for LLCs. We handle Forms 1120, 1065, 5472, and individual returns for foreign owners.",
    metaTitle: "LLC Tax Filing for Foreign Owners | LLCPad",
    metaDescription: "Professional US LLC tax filing for non-residents. Form 5472, 1120, 1065 preparation with IRS compliance. Avoid $25,000 penalties. Start today.",
    description: `<p>If you own a US LLC as a <strong>non-US resident</strong>, you are required to file specific tax returns with the IRS every year — even if your LLC earned zero income. Our <strong>LLC Tax Filing service</strong> ensures your company stays fully compliant with federal obligations, helping you avoid costly penalties that start at <strong>$25,000 per missed form</strong>.</p>

<h3>Why You Need Professional Tax Filing</h3>
<ul>
<li><strong>Avoid IRS Penalties:</strong> Late or missing filings can trigger penalties of $25,000 or more per form, per year — the IRS does not offer leniency for foreign owners who were unaware of requirements.</li>
<li><strong>Stay in Good Standing:</strong> Consistent tax compliance protects your LLC status, EIN, bank accounts, and ability to operate in the US market.</li>
<li><strong>Filing Varies by LLC Type:</strong> Single-member foreign-owned LLCs, multi-member LLCs, and S-Corps each have different form requirements and deadlines that must be followed precisely.</li>
<li><strong>Focus on Your Business:</strong> Let experienced professionals handle the complexity of US tax law so you can concentrate on growing revenue.</li>
</ul>

<div style="overflow-x:auto;margin:32px 0;padding-top:20px">
<table style="width:100%;border-collapse:separate;border-spacing:0;border-radius:12px;font-size:15px;border:1px solid #e8e5dd">
<thead><tr style="background:#1b3a2d;color:#faf8f4">
<th style="padding:14px 20px;text-align:left;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Requirement</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px;position:relative"><span style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:#e84c1e;color:#fff;font-size:10px;padding:2px 10px;border-radius:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap">Most Common</span>Single-Member (Foreign)</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Multi-Member</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">S-Corp Election</th>
</tr></thead>
<tbody>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Required Forms</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">Form 5472 + Pro-forma 1120</td>
<td style="padding:13px 20px;text-align:center">Form 1065 + Schedule K-1</td>
<td style="padding:13px 20px;text-align:center">Form 1120-S + Schedule K-1</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Filing Deadline</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">April 15</td>
<td style="padding:13px 20px;text-align:center">March 15</td>
<td style="padding:13px 20px;text-align:center">March 15</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Extension Available</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">Yes — to October 15</td>
<td style="padding:13px 20px;text-align:center">Yes — to September 15</td>
<td style="padding:13px 20px;text-align:center">Yes — to September 15</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Late Filing Penalty</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">$25,000 per form</td>
<td style="padding:13px 20px;text-align:center">$220/partner per month</td>
<td style="padding:13px 20px;text-align:center">$220/shareholder per month</td>
</tr>
<tr>
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">US Income Tax Owed</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">Generally none (if no US-source income)</td>
<td style="padding:13px 20px;text-align:center">Depends on member residency</td>
<td style="padding:13px 20px;text-align:center">Corporate-level tax may apply</td>
</tr>
</tbody>
</table>
</div>

<h3>How It Works</h3>
<ol>
<li><strong>Share Your LLC Details:</strong> Provide your EIN, Articles of Organization, and any financial records from the tax year. We identify exactly which forms your LLC requires.</li>
<li><strong>We Prepare Your Returns:</strong> Our team completes all necessary forms, calculates any obligations, and prepares your filing package for IRS submission.</li>
<li><strong>Review and File:</strong> You review the completed returns, approve them, and we e-file or mail them to the IRS before the deadline — with confirmation of receipt.</li>
</ol>

<p style="margin-top:24px;padding:16px 20px;background:#f0faf5;border-left:4px solid #1b3a2d;border-radius:0 8px 8px 0;font-size:14px;color:#1b3a2d"><strong>Important:</strong> Even if your LLC had no income or transactions during the year, foreign-owned single-member LLCs must still file Form 5472 and a pro-forma 1120. Failure to file carries a minimum penalty of $25,000. Do not assume a zero-revenue year means zero filing obligations.</p>`,
    icon: "Receipt",
    image: "/images/services/tax-filing.jpg",
    startingPrice: 299,
    categorySlug: "tax-finance",
    isPopular: false,
    features: [
      "Form 5472 preparation",
      "LLC tax return filing",
      "State tax compliance",
      "IRS e-filing",
      "Deadline tracking",
      "Audit support",
    ],
    packages: [
      {
        name: "Basic",
        price: 299,
        description: "Form 5472 + Pro Forma 1120 (Foreign-owned single-member LLC)",
        features: ["Form 5472 Preparation", "Pro Forma 1120", "E-Filing", "Confirmation Letter"],
        notIncluded: ["State Returns", "Individual Returns"],
        isPopular: true,
      },
      {
        name: "Complete",
        price: 599,
        description: "Full LLC tax compliance",
        features: ["Everything in Basic", "State Tax Returns", "Tax Planning Consultation", "Quarterly Estimates"],
        notIncluded: [],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "Does my LLC need to file taxes if it had no income?",
        answer: "Yes! Foreign-owned single-member LLCs must file Form 5472 even with zero income or transactions. The penalty for not filing is $25,000, so this is not optional.",
      },
      {
        question: "What is Form 5472?",
        answer: "Form 5472 reports transactions between your US LLC and its foreign owner(s). This includes loans, capital contributions, distributions, and payments for services. It's filed with a pro forma Form 1120.",
      },
      {
        question: "When is my LLC tax return due?",
        answer: "For most single-member LLCs, the deadline is April 15 (or the next business day). You can request an automatic 6-month extension, but estimated taxes may still be due by the original deadline.",
      },
    ],
  },
  // Category Ungating
  {
    slug: "category-ungating",
    name: "Amazon Category Ungating",
    shortDesc: "Get approved to sell in restricted Amazon categories. Professional ungating service for Grocery, Beauty, Health, and more.",
    metaTitle: "Amazon Category Ungating Service | LLCPad",
    metaDescription: "Get ungated in restricted Amazon categories like Grocery, Beauty, and Toys. We prepare invoices and applications for non-US sellers. Start today.",
    description: `<p><strong>Amazon Category Ungating</strong> removes the selling restrictions that block your access to some of the most profitable product categories. Many high-demand categories on Amazon.com — including Grocery, Beauty, Toys, and Health — are <strong>gated by default</strong>, meaning you need approval before listing products. For international sellers, navigating these requirements can be especially challenging without US-based supplier relationships.</p>

<h3>Why You Need Category Ungating</h3>
<ul>
  <li><strong>Access Profitable Niches:</strong> Restricted categories often have less competition and higher profit margins because most sellers never bother to get approved.</li>
  <li><strong>Expand Your Catalog:</strong> Selling in multiple categories diversifies your revenue streams and reduces dependency on a single product line.</li>
  <li><strong>Competitive Advantage:</strong> While your competitors remain locked out, you can capture market share in gated categories early.</li>
  <li><strong>Seasonal Opportunities:</strong> Categories like Toys become essential during Q4 holiday season — the highest-revenue period on Amazon.</li>
</ul>

<div style="overflow-x:auto;margin:32px 0;padding-top:20px">
<table style="width:100%;border-collapse:separate;border-spacing:0;border-radius:12px;font-size:15px;border:1px solid #e8e5dd">
<thead><tr style="background:#1b3a2d;color:#faf8f4">
<th style="padding:14px 20px;text-align:left;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Category</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Difficulty</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Requirements</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Timeline</th>
</tr></thead>
<tbody>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Grocery &amp; Gourmet</td>
<td style="padding:13px 20px;text-align:center;color:#e84c1e;font-weight:700">Hard</td>
<td style="padding:13px 20px;text-align:center">Invoices, FDA compliance, COA</td>
<td style="padding:13px 20px;text-align:center">2–4 weeks</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Topicals &amp; Beauty</td>
<td style="padding:13px 20px;text-align:center;color:#e84c1e;font-weight:700">Hard</td>
<td style="padding:13px 20px;text-align:center">Invoices, product images, SDS</td>
<td style="padding:13px 20px;text-align:center">2–4 weeks</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Toys &amp; Games</td>
<td style="padding:13px 20px;text-align:center;color:#d97706;font-weight:700">Medium</td>
<td style="padding:13px 20px;text-align:center">Invoices, CPC certificates</td>
<td style="padding:13px 20px;text-align:center">1–3 weeks</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Clothing &amp; Apparel</td>
<td style="padding:13px 20px;text-align:center;color:#d97706;font-weight:700">Medium</td>
<td style="padding:13px 20px;text-align:center">Invoices, brand verification</td>
<td style="padding:13px 20px;text-align:center">1–2 weeks</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Health &amp; Household</td>
<td style="padding:13px 20px;text-align:center;color:#e84c1e;font-weight:700">Hard</td>
<td style="padding:13px 20px;text-align:center">Invoices, FDA letters, lab reports</td>
<td style="padding:13px 20px;text-align:center">2–5 weeks</td>
</tr>
<tr>
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Automotive</td>
<td style="padding:13px 20px;text-align:center;color:#d97706;font-weight:700">Medium</td>
<td style="padding:13px 20px;text-align:center">Invoices, brand authorization</td>
<td style="padding:13px 20px;text-align:center">1–3 weeks</td>
</tr>
</tbody>
</table>
</div>

<h3>How It Works</h3>
<ol>
  <li><strong>Category Assessment:</strong> We review which restricted categories align with your business goals and evaluate your current account health and eligibility.</li>
  <li><strong>Document Preparation:</strong> We help you source compliant invoices from authorized suppliers and prepare all required documentation, including compliance certificates.</li>
  <li><strong>Application &amp; Follow-Up:</strong> We submit your ungating application to Amazon and handle any follow-up requests until your category access is approved.</li>
</ol>

<p style="margin-top:24px;padding:16px 20px;background:#f0faf5;border-left:4px solid #1b3a2d;border-radius:0 8px 8px 0;font-size:14px;color:#1b3a2d"><strong>Important:</strong> Amazon requires invoices from US-based or authorized distributors for most gated categories. Invoices must show a minimum quantity (typically 10+ units), your business name matching your seller account, and recent dates (within 180 days).</p>`,
    icon: "Unlock",
    image: "/images/services/category-ungating.jpg",
    startingPrice: 199,
    categorySlug: "amazon",
    isPopular: false,
    features: [
      "Category analysis",
      "Documentation preparation",
      "Application submission",
      "Follow-up handling",
      "Multiple category discounts",
      "Success guarantee",
    ],
    packages: [
      {
        name: "Single Category",
        price: 199,
        description: "Ungating for one category",
        features: ["Account Review", "Document Preparation", "Application Submission", "Follow-up Support"],
        notIncluded: ["Product Sourcing", "Brand Approval"],
        isPopular: true,
      },
      {
        name: "Multi-Category",
        price: 449,
        description: "Ungating for up to 3 categories",
        features: ["Everything in Single Category", "Up to 3 Categories", "Priority Support", "Strategy Consultation"],
        notIncluded: [],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "What's the success rate for ungating?",
        answer: "Our success rate is over 90% for standard restricted categories. Success depends on your account health, history, and documentation quality. We review your account before proceeding.",
      },
      {
        question: "How long does ungating take?",
        answer: "Most ungating applications are processed within 24-72 hours. Some categories may require additional documentation or longer review periods.",
      },
      {
        question: "What if my ungating application is rejected?",
        answer: "We'll analyze the rejection reason and resubmit with improved documentation. Our service includes follow-up support until approval or we identify a blocking issue.",
      },
    ],
  },
  // Product Listing Optimization
  {
    slug: "listing-optimization",
    name: "Product Listing Optimization",
    shortDesc: "Optimize your Amazon product listings for higher rankings and conversions. Keyword research, copywriting, and image guidance.",
    metaTitle: "Amazon Listing Optimization Service | LLCPad",
    metaDescription: "Optimize your Amazon listings for higher rankings and conversions. Keyword research, A+ Content, and image strategy for non-US sellers. Get started now.",
    description: `<p>Your <strong>Amazon product listing</strong> is your digital storefront — and most international sellers leave money on the table with poorly optimized titles, weak bullet points, and missing backend keywords. Professional <strong>listing optimization</strong> combines keyword research, persuasive copywriting, and strategic image placement to increase your visibility in Amazon search results and convert more browsers into buyers.</p>

<h3>Why You Need Listing Optimization</h3>
<ul>
  <li><strong>Higher Search Rankings:</strong> Amazon's A9 algorithm rewards listings that contain relevant keywords in the right fields — title, bullets, backend, and description.</li>
  <li><strong>Increased Conversion Rates:</strong> Optimized listings with compelling copy and professional images convert 2–3x better than generic ones.</li>
  <li><strong>Lower Advertising Costs:</strong> Better organic ranking means less reliance on PPC, reducing your overall cost per sale.</li>
  <li><strong>Competitive Edge:</strong> Most sellers — especially international ones — never invest in proper optimization, so you can outperform them with better content.</li>
</ul>

<div style="overflow-x:auto;margin:32px 0;padding-top:20px">
<table style="width:100%;border-collapse:separate;border-spacing:0;border-radius:12px;font-size:15px;border:1px solid #e8e5dd">
<thead><tr style="background:#1b3a2d;color:#faf8f4">
<th style="padding:14px 20px;text-align:left;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Element</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px;position:relative"><span style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:#e84c1e;color:#fff;font-size:10px;padding:2px 10px;border-radius:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap">Recommended</span>Optimized</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Unoptimized</th>
</tr></thead>
<tbody>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Product Title</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">Keyword-rich, structured, 150–200 chars</td>
<td style="padding:13px 20px;text-align:center">Generic brand name only</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Bullet Points</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">Benefit-driven with keywords</td>
<td style="padding:13px 20px;text-align:center">Feature-only, no keywords</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Description</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">HTML-formatted, persuasive copy</td>
<td style="padding:13px 20px;text-align:center">Plain text, minimal info</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Images</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">7–9 images with infographics</td>
<td style="padding:13px 20px;text-align:center">1–3 basic photos</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">A+ Content</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700"><span style="color:#1b3a2d">✓</span> Rich brand story</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#dc2626">✗</span> Not used</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Backend Keywords</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">250 bytes fully utilized</td>
<td style="padding:13px 20px;text-align:center">Empty or duplicated</td>
</tr>
<tr>
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Conversion Rate Impact</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">+50–150% improvement</td>
<td style="padding:13px 20px;text-align:center">Baseline</td>
</tr>
</tbody>
</table>
</div>

<h3>How It Works</h3>
<ol>
  <li><strong>Keyword Research:</strong> We use professional tools to identify high-volume, relevant search terms your target customers are actually typing into Amazon.</li>
  <li><strong>Copy &amp; Content Creation:</strong> We rewrite your title, bullet points, description, and backend keywords using proven copywriting frameworks tailored for Amazon's algorithm.</li>
  <li><strong>Image &amp; A+ Strategy:</strong> We provide an image shot list and A+ Content layout to maximize visual impact and tell your brand story below the fold.</li>
</ol>

<p style="margin-top:24px;padding:16px 20px;background:#f0faf5;border-left:4px solid #1b3a2d;border-radius:0 8px 8px 0;font-size:14px;color:#1b3a2d"><strong>Important:</strong> Listing optimization is not a one-time task. Amazon's algorithm and competitor landscape change constantly. We recommend reviewing and updating your listings quarterly to maintain ranking positions and conversion rates.</p>`,
    icon: "Search",
    image: "/images/services/listing-optimization.jpg",
    startingPrice: 149,
    categorySlug: "amazon",
    isPopular: false,
    features: [
      "Keyword research report",
      "Optimized title",
      "5 bullet points",
      "Product description",
      "Backend keywords",
      "Image recommendations",
    ],
    packages: [
      {
        name: "Single Listing",
        price: 149,
        description: "Complete optimization for one ASIN",
        features: ["Keyword Research", "Title Optimization", "Bullet Points", "Description", "Backend Keywords"],
        notIncluded: ["A+ Content", "Image Design"],
        isPopular: true,
      },
      {
        name: "5 Listing Bundle",
        price: 599,
        description: "Optimize 5 listings at discounted rate",
        features: ["Everything in Single Listing", "5 ASINs", "Competitor Analysis Report", "Priority Turnaround"],
        notIncluded: ["A+ Content", "Image Design"],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "How long until I see results?",
        answer: "Organic ranking improvements typically appear within 1-2 weeks as Amazon indexes your changes. Conversion rate improvements can be immediate. Full impact is usually visible within 30 days.",
      },
      {
        question: "Do you guarantee first page rankings?",
        answer: "We don't guarantee specific rankings because Amazon's algorithm considers many factors beyond listing content (sales history, reviews, price, etc.). However, optimized listings consistently outperform non-optimized ones.",
      },
      {
        question: "What information do you need from me?",
        answer: "We need access to your Seller Central account (or you can implement our recommendations), information about your target audience, key product features and benefits, and any brand guidelines.",
      },
    ],
  },
  // A+ Content Creation
  {
    slug: "a-plus-content",
    name: "A+ Content Creation",
    shortDesc: "Professional Amazon A+ Content design. Increase conversions with enhanced brand content, comparison charts, and rich media.",
    metaTitle: "Amazon A+ Content Creation Service | LLCPad",
    metaDescription: "Create stunning Amazon A+ Content to boost conversions by up to 20%. Professional design for non-US sellers. Enhance your listings with LLCPad today.",
    description: `<p><strong>Amazon A+ Content</strong> (formerly Enhanced Brand Content) replaces your plain-text product description with a visually rich, image-heavy section that tells your brand story and highlights product benefits. Sellers enrolled in Brand Registry can access Basic A+ for free, while <strong>Premium A+ Content</strong> unlocks advanced modules like video and interactive carousels. Studies show A+ Content can increase conversion rates by <strong>5–20%</strong>.</p>

<h3>Why You Need A+ Content</h3>
<ul>
  <li><strong>Higher Conversions:</strong> Rich visuals and comparison charts help customers make faster buying decisions, directly increasing your conversion rate.</li>
  <li><strong>Brand Storytelling:</strong> A+ Content lets you communicate your brand's mission, quality standards, and unique value proposition below the fold.</li>
  <li><strong>Reduced Returns:</strong> Detailed visual content sets accurate expectations, leading to fewer returns and better customer satisfaction.</li>
  <li><strong>Competitive Differentiation:</strong> Most sellers still use plain-text descriptions. A+ Content makes your listing stand out and appear more professional.</li>
</ul>

<div style="overflow-x:auto;margin:32px 0;padding-top:20px">
<table style="width:100%;border-collapse:separate;border-spacing:0;border-radius:12px;font-size:15px;border:1px solid #e8e5dd">
<thead><tr style="background:#1b3a2d;color:#faf8f4">
<th style="padding:14px 20px;text-align:left;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Feature</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Basic A+</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px;position:relative"><span style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:#e84c1e;color:#fff;font-size:10px;padding:2px 10px;border-radius:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap">Recommended</span>Premium A+</th>
</tr></thead>
<tbody>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Content Modules</td>
<td style="padding:13px 20px;text-align:center">5 standard modules</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">7 enhanced modules</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Video Support</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#dc2626">✗</span> Not available</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700"><span style="color:#1b3a2d">✓</span> Full video modules</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Image Size</td>
<td style="padding:13px 20px;text-align:center">Standard (970px wide)</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">Full-width (1464px wide)</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Brand Story</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#1b3a2d">✓</span> Basic brand card</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700"><span style="color:#1b3a2d">✓</span> Rich brand narrative</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Interactive Carousel</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#dc2626">✗</span> Not available</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700"><span style="color:#1b3a2d">✓</span> Swipeable carousels</td>
</tr>
<tr>
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Estimated Conversion Lift</td>
<td style="padding:13px 20px;text-align:center">+5–8%</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">+15–20%</td>
</tr>
</tbody>
</table>
</div>

<h3>How It Works</h3>
<ol>
  <li><strong>Brand &amp; Product Review:</strong> We analyze your product, target audience, and competitive landscape to plan the A+ Content layout and messaging strategy.</li>
  <li><strong>Design &amp; Copywriting:</strong> Our team creates professional image modules, comparison charts, and persuasive copy that aligns with your brand identity.</li>
  <li><strong>Upload &amp; Approval:</strong> We upload the content to your Seller Central account and manage the Amazon review process until your A+ Content goes live.</li>
</ol>

<p style="margin-top:24px;padding:16px 20px;background:#f0faf5;border-left:4px solid #1b3a2d;border-radius:0 8px 8px 0;font-size:14px;color:#1b3a2d"><strong>Important:</strong> Basic A+ Content is free for all Brand Registry-enrolled sellers. Premium A+ is currently available by invitation to sellers who have published A+ Brand Story on all ASINs in their catalog. Amazon occasionally opens Premium A+ to all Brand Registry members during promotional periods.</p>`,
    icon: "Sparkles",
    image: "/images/services/a-plus-content.jpg",
    startingPrice: 299,
    categorySlug: "amazon",
    isPopular: false,
    features: [
      "Custom module design",
      "Professional copywriting",
      "Up to 7 modules",
      "Comparison charts",
      "Brand story section",
      "2 revision rounds",
    ],
    packages: [
      {
        name: "Standard A+",
        price: 299,
        description: "A+ Content for one ASIN",
        features: ["5 Custom Modules", "Professional Copy", "Comparison Chart", "2 Revisions"],
        notIncluded: ["Brand Story", "A+ Premium"],
        isPopular: true,
      },
      {
        name: "Premium A+",
        price: 499,
        description: "Full A+ Content with brand story",
        features: ["7 Custom Modules", "Brand Story Section", "Comparison Chart", "Cross-Sell Modules", "Unlimited Revisions"],
        notIncluded: [],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "Do I need Brand Registry for A+ Content?",
        answer: "Yes, A+ Content is only available to sellers enrolled in Amazon Brand Registry. This requires a trademark (registered or pending). We can help you get brand registered if you're not already.",
      },
      {
        question: "How long does A+ Content creation take?",
        answer: "Our standard turnaround is 5-7 business days for initial designs. After your feedback, revisions take 2-3 business days each.",
      },
      {
        question: "Can I use A+ Content on all my listings?",
        answer: "You can apply A+ Content to any ASIN under your registered brand. Once created, A+ Content can be reused across multiple ASINs with modifications.",
      },
    ],
  },
  // PPC Campaign Setup
  {
    slug: "ppc-campaign-setup",
    name: "Amazon PPC Setup",
    shortDesc: "Professional Amazon PPC campaign setup. Sponsored Products, Brands, and Display campaigns configured for optimal performance.",
    metaTitle: "Amazon PPC Campaign Setup Service | LLCPad",
    metaDescription: "Launch profitable Amazon PPC campaigns. Sponsored Products, Brands, and Display ads set up for non-US sellers. Maximize ROI with expert setup from LLCPad.",
    description: `<p><strong>Amazon PPC (Pay-Per-Click) advertising</strong> is the primary lever for driving visibility and sales on the platform — especially for new products with no organic ranking history. For international sellers, understanding the nuances of Sponsored Products, Sponsored Brands, and Sponsored Display can mean the difference between a <strong>profitable launch</strong> and wasted ad spend. We set up your campaigns with proven structures from day one.</p>

<h3>Why You Need Professional PPC Setup</h3>
<ul>
  <li><strong>Launch Velocity:</strong> New products have zero organic ranking — PPC is the only way to get your product in front of buyers immediately after launch.</li>
  <li><strong>Data-Driven Structure:</strong> Properly structured campaigns separate research, exact, and broad match types, making optimization far more effective over time.</li>
  <li><strong>Budget Efficiency:</strong> Poor campaign structure wastes 40–60% of ad spend on irrelevant clicks. Professional setup eliminates this from day one.</li>
  <li><strong>Competitive Intelligence:</strong> We analyze competitor keywords and bidding patterns to position your products strategically in the marketplace.</li>
</ul>

<div style="overflow-x:auto;margin:32px 0;padding-top:20px">
<table style="width:100%;border-collapse:separate;border-spacing:0;border-radius:12px;font-size:15px;border:1px solid #e8e5dd">
<thead><tr style="background:#1b3a2d;color:#faf8f4">
<th style="padding:14px 20px;text-align:left;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Feature</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px;position:relative"><span style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:#e84c1e;color:#fff;font-size:10px;padding:2px 10px;border-radius:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap">Recommended</span>Sponsored Products</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Sponsored Brands</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Sponsored Display</th>
</tr></thead>
<tbody>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Placement</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">Search results &amp; product pages</td>
<td style="padding:13px 20px;text-align:center">Top of search results</td>
<td style="padding:13px 20px;text-align:center">On &amp; off Amazon</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Targeting</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">Keyword &amp; product targeting</td>
<td style="padding:13px 20px;text-align:center">Keyword &amp; category</td>
<td style="padding:13px 20px;text-align:center">Audience &amp; remarketing</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Avg. Cost-Per-Click</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">$0.50–$2.00</td>
<td style="padding:13px 20px;text-align:center">$0.75–$3.00</td>
<td style="padding:13px 20px;text-align:center">$0.30–$1.50</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Brand Registry Required</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700"><span style="color:#dc2626">✗</span> No</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#1b3a2d">✓</span> Yes</td>
<td style="padding:13px 20px;text-align:center"><span style="color:#dc2626">✗</span> No</td>
</tr>
<tr>
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Best For</td>
<td style="padding:13px 20px;text-align:center;background:#f0faf5;color:#1b3a2d;font-weight:700">All sellers — core campaign type</td>
<td style="padding:13px 20px;text-align:center">Brand awareness &amp; visibility</td>
<td style="padding:13px 20px;text-align:center">Retargeting &amp; off-Amazon reach</td>
</tr>
</tbody>
</table>
</div>

<h3>How It Works</h3>
<ol>
  <li><strong>Keyword &amp; Competitor Analysis:</strong> We research your niche, identify high-converting keywords, and map competitor strategies to find opportunities.</li>
  <li><strong>Campaign Architecture:</strong> We build a structured campaign framework with separate ad groups for automatic, broad, phrase, and exact match types — plus negative keyword lists.</li>
  <li><strong>Launch &amp; Optimization Handoff:</strong> Campaigns go live with recommended daily budgets and bids. You receive a management guide for ongoing bid adjustments and keyword harvesting.</li>
</ol>

<p style="margin-top:24px;padding:16px 20px;background:#f0faf5;border-left:4px solid #1b3a2d;border-radius:0 8px 8px 0;font-size:14px;color:#1b3a2d"><strong>Important:</strong> PPC requires a Professional Seller account ($39.99/month). We recommend starting with a minimum daily budget of $25–$50 per product during the launch phase. Target ACoS (Advertising Cost of Sale) typically stabilizes at 15–30% after 4–6 weeks of optimization.</p>`,
    icon: "Target",
    image: "/images/services/ppc-setup.jpg",
    startingPrice: 349,
    categorySlug: "amazon",
    isPopular: false,
    features: [
      "Keyword research",
      "Campaign structure design",
      "Sponsored Products setup",
      "Sponsored Brands setup",
      "Bid optimization",
      "7-day check-in",
    ],
    packages: [
      {
        name: "Starter",
        price: 349,
        description: "PPC setup for up to 5 products",
        features: ["Keyword Research", "Campaign Setup", "Auto + Manual Campaigns", "7-Day Optimization Check"],
        notIncluded: ["Sponsored Brands", "Ongoing Management"],
        isPopular: true,
      },
      {
        name: "Professional",
        price: 599,
        description: "Complete PPC setup for up to 15 products",
        features: ["Everything in Starter", "Up to 15 Products", "Sponsored Brands", "Sponsored Display", "14-Day Management"],
        notIncluded: [],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "What budget should I start with?",
        answer: "We recommend starting with $20-50/day for new campaigns. This provides enough data for optimization while controlling costs. You can scale up once you identify winning campaigns.",
      },
      {
        question: "How long until I see results?",
        answer: "You'll see initial impressions and clicks within hours of launch. However, meaningful performance data takes 1-2 weeks to accumulate. True optimization happens over 30-60 days.",
      },
      {
        question: "Do you offer ongoing PPC management?",
        answer: "Yes, we offer monthly PPC management services for ongoing optimization. This includes bid adjustments, keyword expansion, negative keyword management, and performance reporting.",
      },
    ],
  },
  // Account Reinstatement
  {
    slug: "account-reinstatement",
    name: "Amazon Account Reinstatement",
    shortDesc: "Professional Amazon seller account reinstatement service. Suspension appeals, Plan of Action writing, and account recovery.",
    metaTitle: "Amazon Account Reinstatement Service | LLCPad",
    metaDescription: "Get your suspended Amazon seller account reinstated fast. Expert appeal writing for non-US sellers facing suspension. Contact LLCPad for urgent help.",
    description: `<p>An <strong>Amazon account suspension</strong> can halt your entire business overnight — and for international sellers, navigating the appeals process without understanding Amazon's internal review system often leads to repeated denials. Whether your account was suspended for policy violations, performance issues, or IP complaints, a professional <strong>Plan of Action (POA)</strong> is your best path to reinstatement. Time is critical — every day your account is down means lost revenue and declining rankings.</p>

<h3>Why You Need Professional Reinstatement Help</h3>
<ul>
  <li><strong>Expert Appeal Writing:</strong> Amazon reviewers evaluate thousands of appeals daily. A poorly written POA gets rejected in seconds — we know exactly what they look for.</li>
  <li><strong>Root Cause Analysis:</strong> We identify the actual reason for your suspension (which is often different from what the notification says) and address it directly.</li>
  <li><strong>Faster Resolution:</strong> Self-written appeals average 3–5 attempts. Professional appeals typically succeed in 1–2 submissions, saving weeks of lost sales.</li>
  <li><strong>Prevention Strategy:</strong> After reinstatement, we provide a compliance framework to prevent future suspensions and keep your account in good standing.</li>
</ul>

<div style="overflow-x:auto;margin:32px 0;padding-top:20px">
<table style="width:100%;border-collapse:separate;border-spacing:0;border-radius:12px;font-size:15px;border:1px solid #e8e5dd">
<thead><tr style="background:#1b3a2d;color:#faf8f4">
<th style="padding:14px 20px;text-align:left;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Suspension Reason</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Severity</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Typical Timeline</th>
</tr></thead>
<tbody>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Inauthentic Product Claims</td>
<td style="padding:13px 20px;text-align:center;color:#e84c1e;font-weight:700">High</td>
<td style="padding:13px 20px;text-align:center">1–4 weeks</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Policy Violation (Listing / Review)</td>
<td style="padding:13px 20px;text-align:center;color:#d97706;font-weight:700">Medium–High</td>
<td style="padding:13px 20px;text-align:center">1–3 weeks</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Linked / Related Accounts</td>
<td style="padding:13px 20px;text-align:center;color:#dc2626;font-weight:700">Very High</td>
<td style="padding:13px 20px;text-align:center">2–6 weeks</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Performance Metrics (ODR, Late Shipment)</td>
<td style="padding:13px 20px;text-align:center;color:#d97706;font-weight:700">Medium</td>
<td style="padding:13px 20px;text-align:center">1–2 weeks</td>
</tr>
<tr>
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Rights Owner / IP Complaint</td>
<td style="padding:13px 20px;text-align:center;color:#e84c1e;font-weight:700">High</td>
<td style="padding:13px 20px;text-align:center">1–4 weeks</td>
</tr>
</tbody>
</table>
</div>

<h3>How It Works</h3>
<ol>
  <li><strong>Account Audit:</strong> We review your suspension notification, account health metrics, and performance history to identify the exact root cause and contributing factors.</li>
  <li><strong>Plan of Action (POA):</strong> We write a comprehensive appeal that addresses the root cause, details corrective actions already taken, and outlines preventive measures.</li>
  <li><strong>Submission &amp; Escalation:</strong> We submit your appeal through the proper channels and escalate if needed — including executive seller relations — until your account is reinstated.</li>
</ol>

<p style="margin-top:24px;padding:16px 20px;background:#f0faf5;border-left:4px solid #1b3a2d;border-radius:0 8px 8px 0;font-size:14px;color:#1b3a2d"><strong>Important:</strong> Do not submit multiple appeals without professional guidance. Each rejected appeal makes the next one harder to succeed. If your account has already been denied, share your previous appeal and Amazon's responses so we can adjust our strategy accordingly.</p>`,
    icon: "ShieldCheck",
    image: "/images/services/reinstatement.jpg",
    startingPrice: 499,
    categorySlug: "amazon",
    isPopular: false,
    features: [
      "Full account analysis",
      "Root cause assessment",
      "Professional POA writing",
      "Appeal submission",
      "Unlimited revisions",
      "Follow-up support",
    ],
    packages: [
      {
        name: "Standard Appeal",
        price: 499,
        description: "Single suspension type appeal",
        features: ["Case Analysis", "POA Writing", "Appeal Submission", "2 Follow-up Appeals"],
        notIncluded: ["Legal Review", "Brand Owner Outreach"],
        isPopular: true,
      },
      {
        name: "Complex Case",
        price: 899,
        description: "Multiple issues or difficult cases",
        features: ["Everything in Standard", "Multiple Issue Resolution", "Unlimited Appeals", "Priority Response", "30-Day Support"],
        notIncluded: [],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "What's your success rate?",
        answer: "Our success rate is approximately 85% for first appeals. Success depends on the suspension type, account history, and whether root causes can be addressed. We evaluate your case before committing.",
      },
      {
        question: "How long does reinstatement take?",
        answer: "Amazon typically responds to appeals within 24-72 hours. Simple cases may be resolved with one appeal. Complex cases may require multiple appeals over 1-2 weeks. Some difficult cases take longer.",
      },
      {
        question: "Can you guarantee reinstatement?",
        answer: "No one can guarantee reinstatement - anyone who does is misleading you. Amazon makes the final decision. However, our professional appeals significantly improve your chances compared to self-written appeals.",
      },
    ],
  },
  // Reseller Certificate
  {
    slug: "reseller-certificate",
    name: "Reseller Certificate",
    shortDesc: "Get your state reseller certificate (sales tax permit). Buy wholesale without paying sales tax on inventory purchases.",
    metaTitle: "Reseller Certificate & Sales Tax Permit | LLCPad",
    metaDescription: "Get your reseller certificate and buy inventory tax-free. LLCPad helps non-US LLC owners obtain sales tax permits across US states.",
    description: `<p>A <strong>reseller certificate</strong> (also called a <strong>sales tax permit</strong> or resale certificate) allows your LLC to purchase goods for resale <strong>without paying sales tax</strong> to the supplier. Instead, you collect sales tax from the end customer and remit it to the state. For international entrepreneurs selling physical products through Amazon, Shopify, or other US channels, a reseller certificate is essential for <strong>legal tax compliance</strong> and maximizing profit margins.</p>

<h3>Why You Need a Reseller Certificate</h3>
<ul>
  <li><strong>Buy Inventory Tax-Free:</strong> Without a reseller certificate, you pay sales tax on every wholesale purchase — an unnecessary cost that cuts into your margins when you resell those products.</li>
  <li><strong>Legal Sales Tax Compliance:</strong> If your LLC has sales tax nexus in a state (physical or economic), you're legally required to collect and remit sales tax. A reseller certificate is the foundation of this compliance.</li>
  <li><strong>Amazon &amp; Marketplace Requirements:</strong> Amazon and other marketplaces may request your reseller certificate or sales tax permit number during seller registration or tax configuration.</li>
  <li><strong>Avoid Audit Penalties:</strong> States actively audit businesses for sales tax compliance. Operating without proper permits can result in back taxes, penalties of 10–25%, and interest charges.</li>
</ul>

<div style="overflow-x:auto;margin:32px 0;padding-top:20px">
<table style="width:100%;border-collapse:separate;border-spacing:0;border-radius:12px;font-size:15px;border:1px solid #e8e5dd">
<thead><tr style="background:#1b3a2d;color:#faf8f4">
<th style="padding:14px 20px;text-align:left;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">State</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Economic Nexus Threshold</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Effective Date</th>
<th style="padding:14px 20px;text-align:center;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:1px">Transaction Threshold</th>
</tr></thead>
<tbody>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">California</td>
<td style="padding:13px 20px;text-align:center">$500,000</td>
<td style="padding:13px 20px;text-align:center">April 1, 2019</td>
<td style="padding:13px 20px;text-align:center">None</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Texas</td>
<td style="padding:13px 20px;text-align:center">$500,000</td>
<td style="padding:13px 20px;text-align:center">October 1, 2019</td>
<td style="padding:13px 20px;text-align:center">None</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">New York</td>
<td style="padding:13px 20px;text-align:center">$500,000</td>
<td style="padding:13px 20px;text-align:center">June 21, 2018</td>
<td style="padding:13px 20px;text-align:center">100 transactions</td>
</tr>
<tr style="border-bottom:1px solid #e8e5dd">
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Florida</td>
<td style="padding:13px 20px;text-align:center">$100,000</td>
<td style="padding:13px 20px;text-align:center">July 1, 2021</td>
<td style="padding:13px 20px;text-align:center">None</td>
</tr>
<tr>
<td style="padding:13px 20px;font-weight:600;background:#f8f7f4">Washington</td>
<td style="padding:13px 20px;text-align:center">$100,000</td>
<td style="padding:13px 20px;text-align:center">October 1, 2018</td>
<td style="padding:13px 20px;text-align:center">None</td>
</tr>
</tbody>
</table>
</div>

<h3>How It Works</h3>
<ol>
  <li><strong>Identify Your Nexus States:</strong> We help you determine which states require you to register based on your sales volume, warehouse locations, or marketplace activity.</li>
  <li><strong>We Register Your LLC:</strong> Our team completes the state sales tax registration application and obtains your reseller certificate / sales tax permit on your behalf.</li>
  <li><strong>Start Buying Tax-Free:</strong> Use your reseller certificate with suppliers to purchase inventory without paying sales tax, and begin collecting tax from your customers as required.</li>
</ol>

<p style="margin-top:24px;padding:16px 20px;background:#f0faf5;border-left:4px solid #1b3a2d;border-radius:0 8px 8px 0;font-size:14px;color:#1b3a2d"><strong>Important:</strong> Economic nexus thresholds are based on the previous 12 months of sales into a state. If you sell on Amazon FBA, your inventory stored in Amazon warehouses creates physical nexus in those states regardless of sales volume. Marketplace facilitator laws mean Amazon collects tax in most states, but you may still need to register and file $0 returns.</p>`,
    icon: "FileBadge",
    image: "/images/services/reseller-certificate.jpg",
    startingPrice: 99,
    categorySlug: "tax-finance",
    isPopular: false,
    features: [
      "State registration",
      "Sales tax permit application",
      "Reseller certificate issuance",
      "Exemption certificate forms",
      "Compliance guidance",
      "Renewal reminders",
    ],
    packages: [
      {
        name: "Single State",
        price: 99,
        description: "Reseller certificate for one state",
        features: ["State Registration", "Sales Tax Permit", "Resale Certificate", "Compliance Guide"],
        notIncluded: ["Additional States", "Sales Tax Filing"],
        isPopular: true,
      },
      {
        name: "Multi-State",
        price: 249,
        description: "Reseller certificates for up to 5 states",
        features: ["Everything in Single State", "Up to 5 States", "Nexus Analysis", "Priority Processing"],
        notIncluded: [],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "Do Amazon sellers need reseller certificates?",
        answer: "If you're buying inventory from US suppliers, yes. Most legitimate wholesalers require a reseller certificate. Additionally, if you have FBA inventory in a state, you may have nexus and should consider registration.",
      },
      {
        question: "Which states should I register in?",
        answer: "At minimum, register in your LLC's home state and any state where you buy inventory locally. For Amazon FBA sellers, consider registering in states where Amazon stores your inventory.",
      },
      {
        question: "What's the difference between reseller certificate and sales tax permit?",
        answer: "They're related but different. A sales tax permit allows you to collect sales tax from customers. A reseller certificate (issued with the permit) allows you to buy inventory tax-exempt. You typically get both when registering.",
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
    const { features, packages, faqs, categorySlug, metaTitle, metaDescription, comparisonFeatures, ...serviceFields } = serviceData as typeof servicesData[0] & { comparisonFeatures?: typeof llcFormationComparisonFeatures };

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
    console.log(`  ✓ ${service.name}`);

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

    // Create packages with new fields (need packages first for comparison features)
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
          // New fields
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
    console.log(`    - ${packages.length} packages`);

    // Create comparison table features if available
    if (comparisonFeatures && comparisonFeatures.length > 0) {
      for (let i = 0; i < comparisonFeatures.length; i++) {
        const feature = comparisonFeatures[i];

        // Create the master feature
        const featureAny = feature as { text: string; tooltip?: string; description?: string; tag?: string; tagType?: string; icon?: string; packages: Record<string, unknown> };
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

        // Create package feature mappings
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
      // Legacy: Create simple service features
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

  // Create legal pages
  console.log("\n📜 Creating legal pages...");
  const legalPages = [
    {
      slug: "terms",
      title: "Terms of Service",
      metaTitle: "Terms of Service | LLCPad",
      metaDescription: "Terms and conditions for using LLCPad services. Read our terms of service before using our LLC formation and business services.",
      content: `<h2>1. Acceptance of Terms</h2>
<p>By accessing and using LLCPad's services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>

<h2>2. Services Description</h2>
<p>LLCPad provides business formation services, including but not limited to:</p>
<ul>
<li>LLC Formation in all 50 US states</li>
<li>EIN Application assistance</li>
<li>Registered Agent services</li>
<li>Annual compliance reminders</li>
<li>Business document preparation</li>
</ul>

<h2>3. Not a Law Firm</h2>
<p><strong>Important:</strong> LLCPad is a business formation service company, NOT a law firm. We do not provide legal advice. The information provided through our services is for general informational purposes only and should not be construed as legal advice. For legal matters, please consult with a licensed attorney in your jurisdiction.</p>

<h2>4. User Responsibilities</h2>
<p>You are responsible for:</p>
<ul>
<li>Providing accurate and complete information</li>
<li>Maintaining the confidentiality of your account</li>
<li>Complying with all applicable laws and regulations</li>
<li>Keeping your business in good standing after formation</li>
</ul>

<h2>5. Payment Terms</h2>
<p>All fees are due at the time of order placement. Prices are subject to change without notice. State fees are determined by each state and are subject to change.</p>

<h2>6. Refund Policy</h2>
<p>Please refer to our <a href="/refund-policy">Refund Policy</a> for information about refunds and cancellations.</p>

<h2>7. Limitation of Liability</h2>
<p>LLCPad's liability is limited to the amount paid for services. We are not liable for any indirect, incidental, or consequential damages.</p>

<h2>8. Changes to Terms</h2>
<p>We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the new terms.</p>

<h2>9. Contact Information</h2>
<p>For questions about these Terms of Service, please contact us at support@llcpad.com</p>`,
    },
    {
      slug: "privacy",
      title: "Privacy Policy",
      metaTitle: "Privacy Policy | LLCPad",
      metaDescription: "LLCPad Privacy Policy - Learn how we collect, use, and protect your personal information when using our business formation services.",
      content: `<h2>1. Information We Collect</h2>
<p>We collect information that you provide directly to us, including:</p>
<ul>
<li><strong>Personal Information:</strong> Name, email address, phone number, mailing address</li>
<li><strong>Business Information:</strong> LLC name, business address, EIN, member information</li>
<li><strong>Payment Information:</strong> Credit card details, billing address</li>
<li><strong>Identity Documents:</strong> Passport or ID copies (for compliance purposes)</li>
</ul>

<h2>2. How We Use Your Information</h2>
<p>We use the information we collect to:</p>
<ul>
<li>Process your orders and form your business entities</li>
<li>Communicate with you about your orders</li>
<li>Send important updates and compliance reminders</li>
<li>Improve our services and customer experience</li>
<li>Comply with legal obligations</li>
</ul>

<h2>3. Information Sharing</h2>
<p>We may share your information with:</p>
<ul>
<li><strong>State Agencies:</strong> Required for filing your business documents</li>
<li><strong>IRS:</strong> For EIN applications</li>
<li><strong>Service Providers:</strong> Who assist in providing our services</li>
<li><strong>Legal Requirements:</strong> When required by law</li>
</ul>
<p>We do NOT sell your personal information to third parties.</p>

<h2>4. Data Security</h2>
<p>We implement appropriate security measures to protect your personal information, including:</p>
<ul>
<li>SSL encryption for all data transmission</li>
<li>Secure data storage with access controls</li>
<li>Regular security audits and updates</li>
</ul>

<h2>5. Your Rights</h2>
<p>You have the right to:</p>
<ul>
<li>Access your personal information</li>
<li>Request correction of inaccurate data</li>
<li>Request deletion of your data (subject to legal requirements)</li>
<li>Opt-out of marketing communications</li>
</ul>

<h2>6. Contact Us</h2>
<p>For privacy-related inquiries, please contact us at privacy@llcpad.com</p>`,
    },
    {
      slug: "refund-policy",
      title: "Refund Policy",
      metaTitle: "Refund Policy | LLCPad",
      metaDescription: "LLCPad Refund Policy - Learn about our refund and cancellation policy for LLC formation and business services.",
      content: `<h2>Our Commitment</h2>
<p>At LLCPad, we strive to provide excellent service. We understand that circumstances may change, and we've created this refund policy to be fair to our customers.</p>

<h2>Before Filing</h2>
<p>If your documents have NOT been filed with the state:</p>
<ul>
<li><strong>Full refund</strong> of LLCPad service fees</li>
<li>Simply contact us to cancel your order</li>
<li>Refunds processed within 5-7 business days</li>
</ul>

<h2>After Filing</h2>
<p>If your documents HAVE been filed with the state:</p>
<ul>
<li><strong>State filing fees are non-refundable</strong> (paid directly to the state)</li>
<li>LLCPad service fees may be partially refunded on a case-by-case basis</li>
<li>We cannot reverse filings made with state agencies</li>
</ul>

<h2>Non-Refundable Items</h2>
<p>The following are generally non-refundable:</p>
<ul>
<li>State filing fees (these go directly to the state)</li>
<li>Expedited processing fees once expedited service has begun</li>
<li>Registered Agent fees after service activation</li>
<li>Third-party fees (IRS, state agencies, etc.)</li>
</ul>

<h2>How to Request a Refund</h2>
<ol>
<li>Contact our support team at support@llcpad.com</li>
<li>Provide your order number</li>
<li>Explain the reason for your refund request</li>
<li>Our team will review and respond within 48 hours</li>
</ol>

<h2>Processing Time</h2>
<p>Approved refunds are processed within 5-7 business days. The time for the refund to appear in your account depends on your payment method and financial institution.</p>

<h2>Questions?</h2>
<p>If you have any questions about our refund policy, please contact us at support@llcpad.com</p>`,
    },
    {
      slug: "disclaimer",
      title: "Disclaimer",
      metaTitle: "Disclaimer | LLCPad",
      metaDescription: "Legal disclaimers for LLCPad services. Important information about our business formation services.",
      content: `<h2>Not a Law Firm</h2>
<p><strong>LLCPad is NOT a law firm and does not provide legal advice.</strong> We are a business formation document filing service. The information provided on this website and through our services is for general informational purposes only.</p>

<h2>No Attorney-Client Relationship</h2>
<p>Use of our services does not create an attorney-client relationship. For legal advice, please consult with a licensed attorney in your jurisdiction who can provide advice tailored to your specific situation.</p>

<h2>Accuracy of Information</h2>
<p>While we strive to provide accurate and up-to-date information, we make no representations or warranties about:</p>
<ul>
<li>The completeness or accuracy of information on this website</li>
<li>The suitability of our services for your specific needs</li>
<li>The outcomes of any business formation or filing</li>
</ul>

<h2>Third-Party Services</h2>
<p>We work with various government agencies and third-party service providers. We are not responsible for:</p>
<ul>
<li>Delays caused by state agencies</li>
<li>Changes in state filing requirements or fees</li>
<li>Actions or inactions of third-party service providers</li>
</ul>

<h2>Business Decisions</h2>
<p>The decision to form a business entity, the type of entity to form, and the state of formation are important decisions that should be made after careful consideration and, where appropriate, consultation with legal and tax professionals.</p>

<h2>Tax Advice</h2>
<p>We do not provide tax advice. Please consult with a qualified tax professional for advice on tax matters related to your business.</p>

<h2>Limitation of Liability</h2>
<p>To the maximum extent permitted by law, LLCPad shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.</p>

<h2>Contact Us</h2>
<p>If you have any questions about this disclaimer, please contact us at legal@llcpad.com</p>`,
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
    console.log(`  ✓ ${page.title}`);
  }

  // Create Header Configuration
  console.log("\n🎨 Creating header configuration...");

  // First, clean up existing header config
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
        { text: "Get Started", url: "/services/llc-formation", variant: "primary" }
      ]),
      showAuthButtons: true,
      loginText: "Sign In",
      loginUrl: "/login",
      registerText: "Get Started",
      registerUrl: "/services/llc-formation",
      searchEnabled: false,
      mobileBreakpoint: 1024,
      height: 80,
    },
  });
  console.log("  ✓ Header config created");

  // Create menu items for header
  const menuItems = [
    { label: "Home", url: "/", sortOrder: 0 },
    {
      label: "Services",
      url: "/services",
      sortOrder: 1,
      isMegaMenu: true,
      megaMenuColumns: 4,
    },
    { label: "Pricing", url: "/pricing", sortOrder: 2 },
    { label: "About", url: "/about", sortOrder: 3 },
    { label: "Blog", url: "/blog", sortOrder: 4 },
    { label: "Contact", url: "/contact", sortOrder: 5 },
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

    // Add mega menu categories for Services
    if (item.isMegaMenu) {
      const categories = [
        {
          categoryName: "Formation & Legal",
          categoryIcon: "building-2",
          categoryDesc: "Start your US business",
          children: [
            { label: "LLC Formation", url: "/services/llc-formation", badge: "Popular" },
            { label: "EIN Application", url: "/services/ein-application" },
            { label: "ITIN Application", url: "/services/itin-application" },
            { label: "Trademark Registration", url: "/services/trademark-registration", badge: "Popular" },
            { label: "DBA / Trade Name", url: "/services/dba-filing" },
            { label: "Operating Agreement", url: "/services/operating-agreement" },
          ],
        },
        {
          categoryName: "Compliance & Documents",
          categoryIcon: "shield",
          categoryDesc: "Keep your business compliant",
          children: [
            { label: "Registered Agent", url: "/services/registered-agent" },
            { label: "Annual Compliance", url: "/services/annual-report" },
            { label: "Virtual US Address", url: "/services/virtual-address" },
            { label: "Amendment Filing", url: "/services/amendment-filing" },
            { label: "Certificate of Good Standing", url: "/services/certificate-good-standing" },
            { label: "Apostille Service", url: "/services/apostille-service" },
          ],
        },
        {
          categoryName: "Amazon Services",
          categoryIcon: "shopping-cart",
          categoryDesc: "Sell on Amazon with confidence",
          children: [
            { label: "Amazon Seller Account", url: "/services/amazon-seller", badge: "Popular" },
            { label: "Brand Registry", url: "/services/brand-registry", badge: "Popular" },
            { label: "Category Ungating", url: "/services/category-ungating" },
            { label: "Listing Optimization", url: "/services/listing-optimization" },
            { label: "A+ Content Creation", url: "/services/a-plus-content" },
            { label: "Account Reinstatement", url: "/services/account-reinstatement" },
          ],
        },
        {
          categoryName: "Tax & Finance",
          categoryIcon: "calculator",
          categoryDesc: "Financial services",
          children: [
            { label: "Business Banking", url: "/services/business-banking", badge: "Popular" },
            { label: "Bookkeeping", url: "/services/bookkeeping" },
            { label: "Tax Filing", url: "/services/tax-filing" },
          ],
        },
      ];

      for (let i = 0; i < categories.length; i++) {
        const cat = categories[i];
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

        // Add children services
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
  console.log("  ✓ Header menu items created");

  // Create Footer Configuration (skip if already exists to preserve admin customizations)
  console.log("\n🦶 Creating footer configuration...");

  const existingFooter = await prisma.footerConfig.findFirst({ where: { isActive: true } });

  let footerConfig;
  if (existingFooter) {
    console.log("  ℹ Active footer config already exists, skipping creation to preserve customizations");
    footerConfig = existingFooter;
  } else {
    // Only clean up and create if no active footer exists
    await prisma.menuItem.deleteMany({ where: { footerWidgetId: { not: null } } });
    await prisma.footerWidget.deleteMany({});
    await prisma.footerConfig.deleteMany({});

    footerConfig = await prisma.footerConfig.create({
      data: {
        name: "Default Footer",
        isActive: true,
        layout: "MULTI_COLUMN",
        columns: 6,
        showSocialLinks: true,
        socialPosition: "brand",
        showContactInfo: true,
        contactPosition: "brand",
        bottomBarEnabled: true,
        showDisclaimer: true,
        disclaimerText: "LLCPad is not a law firm and does not provide legal advice. The information provided is for general informational purposes only.",
        showTrustBadges: false,
        paddingTop: 48,
        paddingBottom: 32,
      },
    });
    console.log("  ✓ Footer config created");

    // Create footer widgets
    // Widget 1: Brand (column 1-2)
    await prisma.footerWidget.create({
      data: {
        footerId: footerConfig.id,
        type: "BRAND",
        title: "LLCPad",
        showTitle: false,
        column: 1,
        sortOrder: 0,
      },
    });

    // Widget 2: Services (column 3)
    const servicesWidget = await prisma.footerWidget.create({
      data: {
        footerId: footerConfig.id,
        type: "LINKS",
        title: "Services",
        showTitle: true,
        column: 3,
        sortOrder: 0,
      },
    });

    const serviceLinks = [
      { label: "LLC Formation", url: "/services/llc-formation" },
      { label: "EIN Application", url: "/services/ein-application" },
      { label: "Amazon Seller Account", url: "/services/amazon-seller" },
      { label: "Registered Agent", url: "/services/registered-agent" },
      { label: "Virtual Address", url: "/services/virtual-address" },
      { label: "Business Banking", url: "/services/business-banking" },
    ];

    for (let i = 0; i < serviceLinks.length; i++) {
      await prisma.menuItem.create({
        data: {
          label: serviceLinks[i].label,
          url: serviceLinks[i].url,
          footerWidgetId: servicesWidget.id,
          sortOrder: i,
          target: "_self",
          isVisible: true,
          visibleOnMobile: true,
        },
      });
    }

    // Widget 3: Company (column 4)
    const companyWidget = await prisma.footerWidget.create({
      data: {
        footerId: footerConfig.id,
        type: "LINKS",
        title: "Company",
        showTitle: true,
        column: 4,
        sortOrder: 0,
      },
    });

    const companyLinks = [
      { label: "About Us", url: "/about" },
      { label: "Pricing", url: "/pricing" },
      { label: "Blog", url: "/blog" },
      { label: "FAQs", url: "/faq" },
      { label: "Contact", url: "/contact" },
      { label: "Testimonials", url: "/testimonials" },
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

    // Widget 4: Popular States (column 5)
    const statesWidget = await prisma.footerWidget.create({
      data: {
        footerId: footerConfig.id,
        type: "LINKS",
        title: "Popular States",
        showTitle: true,
        column: 5,
        sortOrder: 0,
      },
    });

    const stateLinks = [
      { label: "Wyoming LLC", url: "/llc/wyoming" },
      { label: "Delaware LLC", url: "/llc/delaware" },
      { label: "New Mexico LLC", url: "/llc/new-mexico" },
      { label: "Texas LLC", url: "/llc/texas" },
      { label: "Florida LLC", url: "/llc/florida" },
    ];

    for (let i = 0; i < stateLinks.length; i++) {
      await prisma.menuItem.create({
        data: {
          label: stateLinks[i].label,
          url: stateLinks[i].url,
          footerWidgetId: statesWidget.id,
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
      { label: "Privacy Policy", url: "/privacy" },
      { label: "Terms of Service", url: "/terms" },
      { label: "Refund Policy", url: "/refund-policy" },
      { label: "Disclaimer", url: "/disclaimer" },
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
    console.log("  ✓ Footer widgets created");
  } // End of else block for footer creation

  // Create brand color settings
  console.log("\n🎨 Creating brand color settings...");
  const brandSettings = [
    // Primary Brand Colors - Midnight Orange Theme
    { key: "brand_primary_color", value: "#F97316", type: "color" }, // Orange 500
    { key: "brand_primary_dark", value: "#EA580C", type: "color" }, // Orange 600
    { key: "brand_primary_light", value: "#FB923C", type: "color" }, // Orange 400
    { key: "brand_secondary_color", value: "#1E2642", type: "color" }, // Midnight Light
    { key: "brand_secondary_dark", value: "#0A0F1E", type: "color" }, // Midnight
    { key: "brand_secondary_light", value: "#2D3A5C", type: "color" }, // Midnight 700
    { key: "brand_accent_color", value: "#F97316", type: "color" }, // Orange 500 (same as primary)
    { key: "brand_accent_dark", value: "#C2410C", type: "color" }, // Orange 700
    { key: "brand_accent_light", value: "#FDBA74", type: "color" }, // Orange 300
    // Semantic Colors
    { key: "color_success", value: "#22C55E", type: "color" }, // Green 500
    { key: "color_warning", value: "#F59E0B", type: "color" },
    { key: "color_error", value: "#EF4444", type: "color" },
    { key: "color_info", value: "#3B82F6", type: "color" },
  ];

  for (const setting of brandSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, type: setting.type },
      create: setting,
    });
  }
  console.log("  ✓ Brand color settings created");

  // Create social media settings
  console.log("\n📱 Creating social media settings...");
  const socialSettings = [
    { key: "business.social.facebook", value: "https://facebook.com/llcpad", type: "url" },
    { key: "business.social.twitter", value: "https://x.com/llcpad", type: "url" },
    { key: "business.social.youtube", value: "https://youtube.com/@llcpad", type: "url" },
  ];

  for (const setting of socialSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, type: setting.type },
      create: setting,
    });
  }
  console.log("  ✓ Social media settings created");

  // Create Global FAQs (for /faq page and homepage)
  console.log("\n❓ Creating global FAQs...");
  await prisma.fAQ.deleteMany();
  const globalFaqs = [
    // General — About LLCPad as a platform
    {
      question: "What is LLCPad?",
      answer: "<p>LLCPad is a one-stop platform for international entrepreneurs to form and manage US LLCs. We handle everything from formation paperwork and EIN applications to registered agent services, business banking assistance, and Amazon seller account setup.</p>",
      category: "general",
      sortOrder: 0,
    },
    {
      question: "Who can use LLCPad's services?",
      answer: "<p>Our services are designed for <strong>international entrepreneurs</strong> — especially from Bangladesh, India, Pakistan, UAE, and other countries — who want to start a US-based business. Whether you're an e-commerce seller, freelancer, or startup founder, we can help you establish a legal US presence.</p>",
      category: "general",
      sortOrder: 1,
    },
    {
      question: "Do I need to be a US citizen to use LLCPad?",
      answer: "<p>No. <strong>US citizenship or residency is not required.</strong> Non-residents from any country can legally form and own a US LLC. You don't even need to visit the US — we handle everything remotely on your behalf.</p>",
      category: "general",
      sortOrder: 2,
    },
    {
      question: "How long does the entire process take?",
      answer: "<p>Timelines vary by service, but most formations are completed within <strong>1–5 business days</strong>. After placing your order, you can track real-time progress from your dashboard. We keep you updated at every step via email and notifications.</p>",
      category: "general",
      sortOrder: 3,
    },
    {
      question: "Is LLCPad a law firm?",
      answer: "<p><strong>No, LLCPad is not a law firm</strong> and does not provide legal advice. We are a business formation service that helps you file the necessary documents. For legal questions specific to your situation, we recommend consulting with a licensed attorney.</p>",
      category: "general",
      sortOrder: 4,
    },

    // Pricing & Payments
    {
      question: "What payment methods do you accept?",
      answer: "<p>We accept multiple payment methods for your convenience:</p><ul><li><strong>International:</strong> Visa, Mastercard, American Express via Stripe</li><li><strong>Bangladesh:</strong> bKash, Nagad, local bank cards via SSLCommerz</li><li><strong>Bank Transfer:</strong> Available for larger orders</li></ul><p>All payments are processed securely with 256-bit SSL encryption.</p>",
      category: "pricing",
      sortOrder: 0,
    },
    {
      question: "Do you offer refunds?",
      answer: "<p>Our refund policy depends on the stage of service:</p><ul><li><strong>Before filing:</strong> Full refund available</li><li><strong>After filing:</strong> Service fee may be non-refundable as government filings cannot be reversed, but state fees are not refundable</li><li><strong>Registered Agent:</strong> Pro-rated refund for unused months</li></ul><p>Please review our full refund policy or contact support for specific cases.</p>",
      category: "pricing",
      sortOrder: 1,
    },
    {
      question: "Can I pay in Bangladeshi Taka (BDT)?",
      answer: "<p><strong>Yes!</strong> We display prices in both USD and BDT. When you select SSLCommerz as your payment method, you'll be charged in BDT at the current exchange rate. This makes it convenient for our Bangladeshi customers.</p>",
      category: "pricing",
      sortOrder: 2,
    },

    // International
    {
      question: "I'm from Bangladesh. Can I form a US LLC?",
      answer: "<p><strong>Absolutely!</strong> Many of our clients are from Bangladesh. We specialize in helping Bangladeshi entrepreneurs form US LLCs. We offer:</p><ul><li>Support in Bangla via live chat and email</li><li>Payment via bKash, Nagad, and local banks through SSLCommerz</li><li>Pricing in BDT alongside USD</li><li>Step-by-step guidance tailored for BD entrepreneurs</li></ul>",
      category: "international",
      sortOrder: 0,
    },
    {
      question: "Do I need to travel to the US for any part of the process?",
      answer: "<p><strong>No.</strong> The entire process is handled remotely. You do not need to travel to the US to form your LLC, get an EIN, open a business bank account, or set up an Amazon seller account. Everything is managed online through your LLCPad dashboard.</p>",
      category: "international",
      sortOrder: 1,
    },
    {
      question: "Can I manage my US LLC from abroad?",
      answer: "<p><strong>Yes.</strong> A US LLC can be fully managed from anywhere in the world. You can manage your business remotely, access your US bank account online, file taxes electronically, and use our registered agent to receive official mail. Our virtual address and registered agent services ensure your LLC maintains a legitimate US presence.</p>",
      category: "international",
      sortOrder: 2,
    },

    // Account & Support
    {
      question: "How do I track my order progress?",
      answer: "<p>After placing an order, log in to your <strong>LLCPad dashboard</strong> to track progress in real-time. You'll see status updates for each step of the process. We also send email notifications whenever there's an important update on your order.</p>",
      category: "account",
      sortOrder: 0,
    },
    {
      question: "How can I contact support?",
      answer: "<p>You can reach us through multiple channels:</p><ul><li><strong>Live Chat:</strong> Available on every page for instant help</li><li><strong>Email:</strong> support@llcpad.com — we respond within 24 hours</li><li><strong>Support Tickets:</strong> Create a ticket from your dashboard for detailed inquiries</li></ul>",
      category: "account",
      sortOrder: 1,
    },
    {
      question: "Can I upgrade or add services to an existing order?",
      answer: "<p><strong>Yes.</strong> You can add additional services at any time from your dashboard. For example, if you initially ordered LLC formation only, you can later add EIN application, registered agent, or business banking assistance as separate orders.</p>",
      category: "account",
      sortOrder: 2,
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
  console.log(`  ✓ ${globalFaqs.length} global FAQs created`);

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
