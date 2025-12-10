import {
  Building2,
  FileText,
  ShoppingCart,
  MapPin,
  Landmark,
  Shield,
  BadgeCheck,
  Briefcase,
} from "lucide-react";

export const services = [
  {
    slug: "llc-formation",
    name: "LLC Formation",
    shortDesc: "Form your US LLC in any state with complete documentation and compliance support.",
    description: `
      <p>Starting a US Limited Liability Company (LLC) is the first step towards establishing your business presence in the United States. Our LLC formation service handles everything from preparing and filing your Articles of Organization to providing you with a comprehensive Operating Agreement.</p>

      <h3>What's Included</h3>
      <ul>
        <li>Preparation and filing of Articles of Organization</li>
        <li>Name availability search</li>
        <li>Custom Operating Agreement</li>
        <li>Digital document storage</li>
        <li>Compliance calendar reminders</li>
        <li>Free consultation with our team</li>
      </ul>

      <h3>Why Choose Us?</h3>
      <p>We specialize in helping international entrepreneurs navigate the US business formation process. Our team has helped over 10,000 business owners from 50+ countries establish their US presence.</p>

      <h3>Processing Time</h3>
      <p>Most LLC formations are completed within 24-48 hours after state filing. Some states offer expedited processing for faster approval.</p>
    `,
    icon: Building2,
    image: "/images/services/llc-formation.jpg",
    startingPrice: 149,
    features: [
      "LLC formation in all 50 states",
      "Articles of Organization preparation",
      "Operating Agreement included",
      "Name availability search",
      "Digital document storage",
      "Compliance calendar",
      "24/7 customer support",
      "100% satisfaction guarantee",
    ],
    packages: [
      {
        name: "Basic",
        price: 149,
        description: "Essential LLC formation",
        features: [
          "LLC Filing",
          "Articles of Organization",
          "Operating Agreement",
          "Digital Storage",
        ],
        notIncluded: ["EIN Application", "Registered Agent", "Virtual Address"],
      },
      {
        name: "Standard",
        price: 299,
        description: "Complete package",
        features: [
          "Everything in Basic",
          "EIN Application",
          "Registered Agent (1 Year)",
          "Priority Support",
        ],
        notIncluded: ["Virtual Address", "Business Banking"],
        popular: true,
      },
      {
        name: "Premium",
        price: 499,
        description: "All-inclusive",
        features: [
          "Everything in Standard",
          "Virtual US Address",
          "Business Banking Assistance",
          "Amazon Seller Setup Guide",
        ],
        notIncluded: [],
      },
    ],
    faqs: [
      {
        question: "Can non-US residents form a US LLC?",
        answer: "Yes! US LLCs are available to anyone regardless of citizenship or residency. You don't need to be a US citizen or resident to form and operate a US LLC.",
      },
      {
        question: "Which state should I choose?",
        answer: "Wyoming and Delaware are popular choices due to privacy protections and business-friendly laws. Wyoming has no state income tax, while Delaware has an established business court system.",
      },
      {
        question: "How long does formation take?",
        answer: "Most LLCs are approved within 24-48 hours. Wyoming and New Mexico are typically the fastest, while some states may take up to 5 business days.",
      },
    ],
  },
  {
    slug: "ein-application",
    name: "EIN Application",
    shortDesc: "Get your Employer Identification Number (Tax ID) for your US business.",
    description: `
      <p>An Employer Identification Number (EIN) is a unique 9-digit number assigned by the IRS to identify your business for tax purposes. It's essentially a Social Security Number for your business.</p>

      <h3>Why You Need an EIN</h3>
      <ul>
        <li>Open a US business bank account</li>
        <li>File business taxes</li>
        <li>Apply for Amazon seller account</li>
        <li>Hire employees</li>
        <li>Establish business credit</li>
      </ul>

      <h3>Our Process</h3>
      <p>We handle the entire EIN application process, including preparing all necessary documentation and submitting your application to the IRS. For international applicants without an SSN/ITIN, we use the appropriate forms and procedures.</p>
    `,
    icon: FileText,
    image: "/images/services/ein-application.jpg",
    startingPrice: 79,
    features: [
      "Complete EIN application",
      "SS-4 form preparation",
      "IRS submission",
      "EIN verification letter",
      "Fast processing",
      "Support for non-US residents",
    ],
    packages: [
      {
        name: "Standard",
        price: 79,
        description: "EIN application service",
        features: [
          "SS-4 Preparation",
          "IRS Submission",
          "EIN Letter",
          "Email Support",
        ],
        notIncluded: [],
      },
    ],
    faqs: [
      {
        question: "Do I need an SSN to get an EIN?",
        answer: "No! International business owners can obtain an EIN without an SSN or ITIN. We handle the special process required for foreign applicants.",
      },
      {
        question: "How long does it take?",
        answer: "For international applicants, the IRS typically issues EINs within 4-6 weeks via fax or mail. We expedite this process as much as possible.",
      },
    ],
  },
  {
    slug: "amazon-seller",
    name: "Amazon Seller Account",
    shortDesc: "Professional Amazon seller account setup with full verification support.",
    description: `
      <p>Setting up an Amazon seller account as an international seller requires careful preparation. Our service ensures your account is set up correctly from day one, minimizing the risk of suspension.</p>

      <h3>What We Provide</h3>
      <ul>
        <li>Professional seller account setup</li>
        <li>Document preparation and verification</li>
        <li>Tax interview assistance</li>
        <li>Seller Central walkthrough</li>
        <li>Best practices guide</li>
      </ul>
    `,
    icon: ShoppingCart,
    image: "/images/services/amazon-seller.jpg",
    startingPrice: 299,
    features: [
      "Account registration assistance",
      "Document verification support",
      "Tax interview guidance",
      "Seller Central setup",
      "Category ungating help",
      "30-day support",
    ],
    packages: [
      {
        name: "Standard",
        price: 299,
        description: "Amazon account setup",
        features: [
          "Account Registration",
          "Document Prep",
          "Tax Interview Help",
          "Basic Setup",
        ],
        notIncluded: ["Brand Registry", "Product Listing"],
      },
      {
        name: "Premium",
        price: 499,
        description: "Complete Amazon starter",
        features: [
          "Everything in Standard",
          "Brand Registry Assistance",
          "5 Product Listings",
          "60-day Support",
        ],
        notIncluded: [],
        popular: true,
      },
    ],
    faqs: [
      {
        question: "What documents do I need?",
        answer: "You'll need your LLC documents, EIN, US business bank account, valid passport, and utility bill for address verification.",
      },
    ],
  },
  {
    slug: "registered-agent",
    name: "Registered Agent",
    shortDesc: "Comply with state requirements with our reliable registered agent service.",
    description: `
      <p>Every LLC is required by law to have a registered agent - a person or company available during business hours to receive legal and official documents on behalf of your business.</p>

      <h3>Our Service Includes</h3>
      <ul>
        <li>Registered agent in your LLC's state</li>
        <li>Same-day document scanning</li>
        <li>Secure online document access</li>
        <li>Compliance reminders</li>
        <li>Mail forwarding options</li>
      </ul>
    `,
    icon: Shield,
    image: "/images/services/registered-agent.jpg",
    startingPrice: 99,
    features: [
      "State-compliant registered agent",
      "Same-day document scanning",
      "Online document portal",
      "Annual report reminders",
      "Privacy protection",
    ],
    packages: [
      {
        name: "Annual",
        price: 99,
        description: "Per year",
        features: [
          "Registered Agent Service",
          "Document Scanning",
          "Online Portal",
          "Compliance Alerts",
        ],
        notIncluded: [],
      },
    ],
    faqs: [
      {
        question: "Why do I need a registered agent?",
        answer: "It's a legal requirement in all 50 states. The registered agent receives important legal documents, tax notices, and annual report reminders.",
      },
    ],
  },
  {
    slug: "virtual-address",
    name: "Virtual US Address",
    shortDesc: "Get a real US business address for mail forwarding and business presence.",
    description: `
      <p>A virtual US address gives your business a professional American presence. Use it for business correspondence, bank applications, and Amazon seller verification.</p>

      <h3>Features</h3>
      <ul>
        <li>Real street address (not a PO Box)</li>
        <li>Mail scanning and forwarding</li>
        <li>Package receiving</li>
        <li>Use for business registration</li>
      </ul>
    `,
    icon: MapPin,
    image: "/images/services/virtual-address.jpg",
    startingPrice: 149,
    features: [
      "Real US street address",
      "Mail scanning",
      "Mail forwarding",
      "Package receiving",
      "Online mailbox access",
    ],
    packages: [
      {
        name: "Basic",
        price: 149,
        description: "Per year",
        features: [
          "US Street Address",
          "Mail Scanning",
          "Online Access",
          "30 Scans/month",
        ],
        notIncluded: ["Package Forwarding"],
      },
      {
        name: "Premium",
        price: 249,
        description: "Per year",
        features: [
          "Everything in Basic",
          "Unlimited Scans",
          "Package Forwarding",
          "Check Deposit",
        ],
        notIncluded: [],
        popular: true,
      },
    ],
    faqs: [],
  },
  {
    slug: "business-banking",
    name: "Business Banking",
    shortDesc: "Open a US business bank account with our partner banks remotely.",
    description: `
      <p>Opening a US business bank account as a non-resident can be challenging. We've partnered with banks that welcome international business owners and can open accounts remotely.</p>

      <h3>Our Service</h3>
      <ul>
        <li>Bank selection guidance</li>
        <li>Application assistance</li>
        <li>Document preparation</li>
        <li>Follow-up support</li>
      </ul>
    `,
    icon: Landmark,
    image: "/images/services/business-banking.jpg",
    startingPrice: 199,
    features: [
      "Partner bank introduction",
      "Remote account opening",
      "Application assistance",
      "Document preparation",
      "Debit card included",
    ],
    packages: [
      {
        name: "Standard",
        price: 199,
        description: "Banking assistance",
        features: [
          "Bank Introduction",
          "Application Help",
          "Document Prep",
          "Follow-up Support",
        ],
        notIncluded: [],
      },
    ],
    faqs: [
      {
        question: "Can I open a bank account remotely?",
        answer: "Yes! Our partner banks allow remote account opening for international LLC owners. Some may require a video call for verification.",
      },
    ],
  },
  {
    slug: "brand-registry",
    name: "Amazon Brand Registry",
    shortDesc: "Protect your brand on Amazon with trademark and brand registry assistance.",
    description: `
      <p>Amazon Brand Registry helps you protect your intellectual property and create an accurate, trusted experience for customers. We assist with the entire process from trademark to registry enrollment.</p>
    `,
    icon: BadgeCheck,
    image: "/images/services/brand-registry.jpg",
    startingPrice: 499,
    features: [
      "Trademark search",
      "USPTO filing assistance",
      "Brand Registry enrollment",
      "Brand protection tools",
    ],
    packages: [
      {
        name: "Standard",
        price: 499,
        description: "Brand protection",
        features: [
          "Trademark Search",
          "Filing Assistance",
          "Registry Enrollment",
          "Support",
        ],
        notIncluded: [],
      },
    ],
    faqs: [],
  },
  {
    slug: "compliance",
    name: "Annual Compliance",
    shortDesc: "Stay compliant with annual reports, renewals, and state filings.",
    description: `
      <p>Keep your LLC in good standing with our annual compliance service. We track deadlines and file required documents so you never miss a renewal.</p>

      <h3>What's Covered</h3>
      <ul>
        <li>Annual report filing</li>
        <li>Registered agent renewal</li>
        <li>Compliance monitoring</li>
        <li>State fee payment assistance</li>
      </ul>
    `,
    icon: Briefcase,
    image: "/images/services/compliance.jpg",
    startingPrice: 149,
    features: [
      "Annual report filing",
      "Deadline tracking",
      "Compliance alerts",
      "Good standing maintenance",
    ],
    packages: [
      {
        name: "Annual",
        price: 149,
        description: "Per year + state fees",
        features: [
          "Annual Report Filing",
          "Deadline Monitoring",
          "Compliance Alerts",
          "Support",
        ],
        notIncluded: [],
      },
    ],
    faqs: [],
  },
];

export function getServiceBySlug(slug: string) {
  return services.find((s) => s.slug === slug);
}

export function getAllServiceSlugs() {
  return services.map((s) => s.slug);
}
