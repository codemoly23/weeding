import {
  Building2,
  FileText,
  ShoppingCart,
  MapPin,
  Landmark,
  Shield,
  BadgeCheck,
  Briefcase,
  FileCheck,
  Stamp,
  FilePen,
  FileX,
  Globe,
  Receipt,
  ScrollText,
  TrendingUp,
  Package,
  Sparkles,
  Target,
  AlertTriangle,
  Calculator,
  BookOpen,
  Users,
} from "lucide-react";

// Service categories for organization
export type ServiceCategory =
  | "formation"
  | "compliance"
  | "amazon"
  | "tax-finance";

export const serviceCategories = {
  formation: {
    name: "Formation & Legal",
    description: "Start and maintain your US business entity",
  },
  compliance: {
    name: "Compliance & Documents",
    description: "Keep your business in good standing",
  },
  amazon: {
    name: "Amazon Services",
    description: "Sell on Amazon with confidence",
  },
  "tax-finance": {
    name: "Tax & Finance",
    description: "Financial and tax services for your business",
  },
};

export const services = [
  // ========== FORMATION & LEGAL ==========
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
    startingPrice: 199,
    category: "formation" as ServiceCategory,
    popular: true,
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
        price: 199,
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
        price: 349,
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
        price: 549,
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
    startingPrice: 99,
    category: "formation" as ServiceCategory,
    popular: false,
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
        price: 99,
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
    slug: "itin-application",
    name: "ITIN Application",
    shortDesc: "Get your Individual Taxpayer Identification Number for US tax filing.",
    description: `
      <p>An Individual Taxpayer Identification Number (ITIN) is a tax processing number issued by the IRS for individuals who need to file US tax returns but aren't eligible for a Social Security Number.</p>

      <h3>Why You Need an ITIN</h3>
      <ul>
        <li>File US tax returns</li>
        <li>Claim tax treaty benefits</li>
        <li>Open certain bank accounts</li>
        <li>Apply for some business licenses</li>
        <li>Comply with IRS requirements</li>
      </ul>

      <h3>Our Process</h3>
      <p>We assist with W-7 form preparation, document certification through Certified Acceptance Agents (CAA), and IRS submission to ensure your ITIN application is processed correctly.</p>
    `,
    icon: FileCheck,
    image: "/images/services/itin-application.jpg",
    startingPrice: 199,
    category: "formation" as ServiceCategory,
    popular: false,
    features: [
      "W-7 form preparation",
      "Document review",
      "Certified Acceptance Agent support",
      "IRS submission",
      "Application tracking",
      "Support until approved",
    ],
    packages: [
      {
        name: "Standard",
        price: 199,
        description: "ITIN application assistance",
        features: [
          "W-7 Preparation",
          "Document Review",
          "IRS Submission",
          "Email Support",
        ],
        notIncluded: ["CAA Certification"],
      },
      {
        name: "Premium",
        price: 299,
        description: "Full-service with CAA",
        features: [
          "Everything in Standard",
          "CAA Document Certification",
          "Priority Processing",
          "Dedicated Support",
        ],
        notIncluded: [],
        popular: true,
      },
    ],
    faqs: [
      {
        question: "What is an ITIN used for?",
        answer: "An ITIN is primarily used for federal tax reporting purposes. It's required if you need to file US tax returns and don't have a Social Security Number.",
      },
      {
        question: "How long does ITIN application take?",
        answer: "The IRS typically processes ITIN applications within 7-11 weeks. During peak tax season, it may take longer.",
      },
    ],
  },
  {
    slug: "trademark-registration",
    name: "Trademark Registration",
    shortDesc: "Protect your brand with USPTO trademark registration.",
    description: `
      <p>A trademark protects your brand name, logo, or slogan from being used by others. Registering with the USPTO gives you nationwide protection and the right to use the ® symbol.</p>

      <h3>What We Provide</h3>
      <ul>
        <li>Comprehensive trademark search</li>
        <li>USPTO application filing</li>
        <li>Response to office actions</li>
        <li>Registration certificate</li>
        <li>Ongoing monitoring options</li>
      </ul>

      <h3>Why Register?</h3>
      <p>Trademark registration is essential for Amazon Brand Registry and provides legal protection against counterfeiters and competitors using similar branding.</p>
    `,
    icon: Stamp,
    image: "/images/services/trademark.jpg",
    startingPrice: 599,
    category: "formation" as ServiceCategory,
    popular: true,
    features: [
      "Comprehensive trademark search",
      "USPTO filing",
      "Office action response",
      "Registration certificate",
      "1-year monitoring",
      "Amazon Brand Registry ready",
    ],
    packages: [
      {
        name: "Basic",
        price: 599,
        description: "Trademark filing",
        features: [
          "Trademark Search",
          "USPTO Filing",
          "Email Support",
          "Digital Certificate",
        ],
        notIncluded: ["Office Action Response", "Monitoring"],
      },
      {
        name: "Standard",
        price: 799,
        description: "Complete trademark service",
        features: [
          "Everything in Basic",
          "Office Action Response",
          "Priority Support",
          "90-day Monitoring",
        ],
        notIncluded: ["1-Year Monitoring"],
        popular: true,
      },
      {
        name: "Premium",
        price: 999,
        description: "Full protection",
        features: [
          "Everything in Standard",
          "1-Year Monitoring",
          "Cease & Desist Templates",
          "Dedicated Attorney Review",
        ],
        notIncluded: [],
      },
    ],
    faqs: [
      {
        question: "How long does trademark registration take?",
        answer: "The USPTO typically takes 8-12 months to process a trademark application. We help expedite where possible and keep you updated throughout.",
      },
      {
        question: "Do I need a trademark for Amazon Brand Registry?",
        answer: "Yes, Amazon requires an active registered trademark or a pending trademark application with a serial number for Brand Registry enrollment.",
      },
    ],
  },
  {
    slug: "dba-filing",
    name: "DBA / Trade Name",
    shortDesc: "Register a 'Doing Business As' name for your LLC.",
    description: `
      <p>A DBA (Doing Business As), also known as a fictitious name or trade name, allows your LLC to operate under a different name than your registered business name.</p>

      <h3>Why Use a DBA?</h3>
      <ul>
        <li>Operate multiple brands under one LLC</li>
        <li>Create a more marketable business name</li>
        <li>Open bank accounts under the DBA name</li>
        <li>Accept payments under your trade name</li>
      </ul>
    `,
    icon: FilePen,
    image: "/images/services/dba.jpg",
    startingPrice: 99,
    category: "formation" as ServiceCategory,
    popular: false,
    features: [
      "Name availability search",
      "State DBA filing",
      "Certificate of registration",
      "Digital copies",
    ],
    packages: [
      {
        name: "Standard",
        price: 99,
        description: "DBA registration",
        features: [
          "Name Search",
          "State Filing",
          "Certificate",
          "Email Support",
        ],
        notIncluded: [],
      },
    ],
    faqs: [
      {
        question: "What's the difference between DBA and LLC?",
        answer: "An LLC is a legal business structure, while a DBA is just an alternate name your LLC can use. The DBA doesn't create a new legal entity.",
      },
    ],
  },
  {
    slug: "operating-agreement",
    name: "Operating Agreement",
    shortDesc: "Get a customized Operating Agreement for your LLC.",
    description: `
      <p>An Operating Agreement is a key document that outlines the ownership structure, management rules, and operating procedures of your LLC. While not always legally required, it's essential for opening bank accounts and protecting your business.</p>

      <h3>What's Included</h3>
      <ul>
        <li>Customized to your LLC structure</li>
        <li>Member/manager provisions</li>
        <li>Profit distribution rules</li>
        <li>Voting and decision-making procedures</li>
        <li>Buy-sell provisions</li>
      </ul>
    `,
    icon: ScrollText,
    image: "/images/services/operating-agreement.jpg",
    startingPrice: 149,
    category: "formation" as ServiceCategory,
    popular: false,
    features: [
      "Custom Operating Agreement",
      "Single or multi-member",
      "Member-managed or manager-managed",
      "Profit distribution terms",
      "Editable document",
    ],
    packages: [
      {
        name: "Standard",
        price: 149,
        description: "Custom Operating Agreement",
        features: [
          "Custom Document",
          "All LLC Types",
          "Digital Delivery",
          "1 Revision",
        ],
        notIncluded: ["Attorney Review"],
      },
      {
        name: "Premium",
        price: 249,
        description: "With legal review",
        features: [
          "Everything in Standard",
          "Attorney Review",
          "Unlimited Revisions",
          "Phone Consultation",
        ],
        notIncluded: [],
        popular: true,
      },
    ],
    faqs: [
      {
        question: "Is an Operating Agreement required?",
        answer: "Some states require it, but even when not required, banks typically need to see an Operating Agreement to open a business account.",
      },
    ],
  },

  // ========== COMPLIANCE & DOCUMENTS ==========
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
    category: "compliance" as ServiceCategory,
    popular: false,
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
    category: "compliance" as ServiceCategory,
    popular: false,
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
  {
    slug: "amendment-filing",
    name: "Amendment Filing",
    shortDesc: "Update your LLC information with the state.",
    description: `
      <p>When your business details change, you need to file an amendment with the state. This includes changes to your business name, registered agent, principal address, or member/manager information.</p>

      <h3>Common Amendments</h3>
      <ul>
        <li>Business name change</li>
        <li>Registered agent change</li>
        <li>Principal address change</li>
        <li>Member/manager changes</li>
        <li>Purpose statement updates</li>
      </ul>
    `,
    icon: FilePen,
    image: "/images/services/amendment.jpg",
    startingPrice: 99,
    category: "compliance" as ServiceCategory,
    popular: false,
    features: [
      "Amendment preparation",
      "State filing",
      "Updated documents",
      "Digital copies",
    ],
    packages: [
      {
        name: "Standard",
        price: 99,
        description: "Single amendment",
        features: [
          "Document Preparation",
          "State Filing",
          "Updated Certificate",
          "Digital Copies",
        ],
        notIncluded: [],
      },
    ],
    faqs: [
      {
        question: "When do I need to file an amendment?",
        answer: "You should file an amendment whenever there are changes to the information on your original Articles of Organization, such as name, address, or management structure.",
      },
    ],
  },
  {
    slug: "certificate-good-standing",
    name: "Certificate of Good Standing",
    shortDesc: "Get official proof that your LLC is in compliance.",
    description: `
      <p>A Certificate of Good Standing (also called Certificate of Existence or Status Certificate) is an official document from the state confirming your LLC is properly registered and compliant with all requirements.</p>

      <h3>When You Need It</h3>
      <ul>
        <li>Opening bank accounts</li>
        <li>Securing business loans</li>
        <li>Registering in other states</li>
        <li>Entering contracts</li>
        <li>Business license applications</li>
      </ul>
    `,
    icon: FileCheck,
    image: "/images/services/good-standing.jpg",
    startingPrice: 49,
    category: "compliance" as ServiceCategory,
    popular: false,
    features: [
      "Official state document",
      "Digital delivery",
      "Fast processing",
      "Apostille-ready",
    ],
    packages: [
      {
        name: "Standard",
        price: 49,
        description: "Certificate retrieval",
        features: [
          "State Request",
          "Digital Copy",
          "Email Delivery",
          "Support",
        ],
        notIncluded: ["Apostille"],
      },
      {
        name: "With Apostille",
        price: 149,
        description: "International use",
        features: [
          "State Request",
          "Apostille Service",
          "Physical Mail",
          "International Shipping",
        ],
        notIncluded: [],
        popular: true,
      },
    ],
    faqs: [],
  },
  {
    slug: "llc-dissolution",
    name: "LLC Dissolution",
    shortDesc: "Properly close your LLC and settle all obligations.",
    description: `
      <p>When you're ready to close your business, proper dissolution ensures you're no longer liable for state fees, taxes, and compliance requirements. We handle the paperwork to officially close your LLC.</p>

      <h3>Dissolution Process</h3>
      <ul>
        <li>Articles of Dissolution filing</li>
        <li>Final tax clearance assistance</li>
        <li>Registered agent termination</li>
        <li>Final state filing confirmation</li>
      </ul>
    `,
    icon: FileX,
    image: "/images/services/dissolution.jpg",
    startingPrice: 149,
    category: "compliance" as ServiceCategory,
    popular: false,
    features: [
      "Articles of Dissolution",
      "State filing",
      "Tax clearance guidance",
      "Final confirmation",
    ],
    packages: [
      {
        name: "Standard",
        price: 149,
        description: "LLC dissolution",
        features: [
          "Dissolution Filing",
          "State Submission",
          "Final Confirmation",
          "Support",
        ],
        notIncluded: [],
      },
    ],
    faqs: [
      {
        question: "Why should I formally dissolve my LLC?",
        answer: "Without formal dissolution, you may continue to owe state fees, annual reports, and franchise taxes even if you're not operating the business.",
      },
    ],
  },
  {
    slug: "multi-state-registration",
    name: "Multi-State Registration",
    shortDesc: "Register your LLC to do business in additional states.",
    description: `
      <p>If your LLC does business in states other than where it was formed, you may need to register as a "foreign LLC" in those states. This is called foreign qualification.</p>

      <h3>When You Need It</h3>
      <ul>
        <li>Physical presence in another state</li>
        <li>Employees in other states</li>
        <li>Significant business activity across state lines</li>
        <li>State-specific licenses required</li>
      </ul>
    `,
    icon: Globe,
    image: "/images/services/multi-state.jpg",
    startingPrice: 199,
    category: "compliance" as ServiceCategory,
    popular: false,
    features: [
      "Foreign qualification filing",
      "Certificate of Authority",
      "Registered agent in new state",
      "Compliance guidance",
    ],
    packages: [
      {
        name: "Standard",
        price: 199,
        description: "Per state registration",
        features: [
          "Foreign Qualification",
          "Certificate of Authority",
          "State Filing",
          "Support",
        ],
        notIncluded: ["Registered Agent"],
      },
      {
        name: "Complete",
        price: 299,
        description: "With registered agent",
        features: [
          "Everything in Standard",
          "1-Year Registered Agent",
          "Compliance Monitoring",
          "Priority Support",
        ],
        notIncluded: [],
        popular: true,
      },
    ],
    faqs: [],
  },
  {
    slug: "apostille-service",
    name: "Apostille Service",
    shortDesc: "Get your US documents certified for international use.",
    description: `
      <p>An apostille is an international certification that authenticates US documents for use in countries that are members of the Hague Apostille Convention. It's often required for using US business documents abroad.</p>

      <h3>Documents We Apostille</h3>
      <ul>
        <li>Articles of Organization</li>
        <li>Certificate of Good Standing</li>
        <li>Operating Agreement</li>
        <li>EIN confirmation letter</li>
        <li>Other corporate documents</li>
      </ul>
    `,
    icon: Stamp,
    image: "/images/services/apostille.jpg",
    startingPrice: 99,
    category: "compliance" as ServiceCategory,
    popular: false,
    features: [
      "Secretary of State apostille",
      "Document preparation",
      "International shipping",
      "Fast processing",
    ],
    packages: [
      {
        name: "Standard",
        price: 99,
        description: "Per document",
        features: [
          "Apostille Certificate",
          "State Processing",
          "Digital Copy",
          "US Shipping",
        ],
        notIncluded: ["International Shipping"],
      },
      {
        name: "International",
        price: 149,
        description: "With global shipping",
        features: [
          "Everything in Standard",
          "DHL/FedEx Shipping",
          "Tracking Number",
          "Insurance",
        ],
        notIncluded: [],
        popular: true,
      },
    ],
    faqs: [],
  },
  {
    slug: "reseller-certificate",
    name: "Reseller Certificate",
    shortDesc: "Get your sales tax exemption certificate for wholesale purchases.",
    description: `
      <p>A Reseller Certificate (also called Sales Tax Exemption Certificate or Resale Certificate) allows you to purchase inventory without paying sales tax, as you'll collect sales tax when you sell to end customers.</p>

      <h3>Benefits</h3>
      <ul>
        <li>Buy inventory tax-free</li>
        <li>Required by many wholesalers</li>
        <li>Essential for Amazon FBA sellers</li>
        <li>Save money on bulk purchases</li>
      </ul>
    `,
    icon: Receipt,
    image: "/images/services/reseller.jpg",
    startingPrice: 79,
    category: "compliance" as ServiceCategory,
    popular: false,
    features: [
      "State reseller permit",
      "Sales tax registration",
      "Certificate document",
      "Compliance guidance",
    ],
    packages: [
      {
        name: "Standard",
        price: 79,
        description: "Single state",
        features: [
          "State Registration",
          "Reseller Certificate",
          "Digital Copy",
          "Support",
        ],
        notIncluded: [],
      },
    ],
    faqs: [
      {
        question: "Do I need a reseller certificate for Amazon FBA?",
        answer: "While not strictly required, having a reseller certificate allows you to buy inventory from wholesalers without paying sales tax, increasing your profit margins.",
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
    category: "compliance" as ServiceCategory,
    popular: false,
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

  // ========== AMAZON SERVICES ==========
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
    startingPrice: 349,
    category: "amazon" as ServiceCategory,
    popular: true,
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
        price: 349,
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
        price: 549,
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
    slug: "brand-registry",
    name: "Amazon Brand Registry",
    shortDesc: "Protect your brand on Amazon with trademark and brand registry enrollment.",
    description: `
      <p>Amazon Brand Registry helps you protect your intellectual property and create an accurate, trusted experience for customers. We assist with the entire process from trademark to registry enrollment.</p>
    `,
    icon: BadgeCheck,
    image: "/images/services/brand-registry.jpg",
    startingPrice: 299,
    category: "amazon" as ServiceCategory,
    popular: true,
    features: [
      "Brand Registry enrollment",
      "A+ Content access",
      "Brand protection tools",
      "Sponsored Brands access",
    ],
    packages: [
      {
        name: "Registry Only",
        price: 299,
        description: "Brand Registry enrollment",
        features: [
          "Registry Application",
          "Verification Support",
          "A+ Content Access",
          "Brand Tools Setup",
        ],
        notIncluded: ["Trademark Filing"],
      },
      {
        name: "Complete Bundle",
        price: 799,
        description: "Trademark + Registry",
        features: [
          "USPTO Trademark Filing",
          "Brand Registry Enrollment",
          "A+ Content Setup",
          "Full Brand Protection",
        ],
        notIncluded: [],
        popular: true,
      },
    ],
    faqs: [
      {
        question: "Do I need a trademark for Brand Registry?",
        answer: "Yes, you need either a registered trademark or a pending application with a serial number to enroll in Amazon Brand Registry.",
      },
    ],
  },
  {
    slug: "category-ungating",
    name: "Category Ungating",
    shortDesc: "Get approved to sell in restricted Amazon categories.",
    description: `
      <p>Many profitable Amazon categories are restricted and require approval before you can sell. We help you prepare the necessary documentation and submit applications to get ungated quickly.</p>

      <h3>Popular Restricted Categories</h3>
      <ul>
        <li>Grocery & Gourmet Foods</li>
        <li>Health & Personal Care</li>
        <li>Beauty</li>
        <li>Toys & Games (seasonal)</li>
        <li>Automotive</li>
        <li>Watches</li>
      </ul>
    `,
    icon: Package,
    image: "/images/services/ungating.jpg",
    startingPrice: 149,
    category: "amazon" as ServiceCategory,
    popular: false,
    features: [
      "Category analysis",
      "Document preparation",
      "Application submission",
      "Appeal support if needed",
    ],
    packages: [
      {
        name: "Single Category",
        price: 149,
        description: "One category ungating",
        features: [
          "Category Analysis",
          "Document Prep",
          "Application",
          "Support",
        ],
        notIncluded: [],
      },
      {
        name: "Multi-Category",
        price: 349,
        description: "Up to 3 categories",
        features: [
          "3 Categories",
          "Priority Processing",
          "Appeal Support",
          "Strategy Guide",
        ],
        notIncluded: [],
        popular: true,
      },
    ],
    faqs: [
      {
        question: "Which categories require ungating?",
        answer: "Categories like Grocery, Beauty, Health & Personal Care, Toys (seasonal), and Automotive typically require approval. Requirements change, so we help you navigate the current rules.",
      },
    ],
  },
  {
    slug: "product-listing-optimization",
    name: "Product Listing Optimization",
    shortDesc: "Optimize your Amazon listings for maximum visibility and sales.",
    description: `
      <p>A well-optimized product listing can dramatically increase your visibility in Amazon search results and boost your conversion rate. Our experts optimize every element of your listing.</p>

      <h3>What We Optimize</h3>
      <ul>
        <li>Title with strategic keywords</li>
        <li>Bullet points highlighting benefits</li>
        <li>Product description</li>
        <li>Backend search terms</li>
        <li>Image recommendations</li>
      </ul>
    `,
    icon: TrendingUp,
    image: "/images/services/listing-optimization.jpg",
    startingPrice: 149,
    category: "amazon" as ServiceCategory,
    popular: false,
    features: [
      "Keyword research",
      "Title optimization",
      "Bullet point writing",
      "Description copywriting",
      "Backend keywords",
    ],
    packages: [
      {
        name: "Single Listing",
        price: 149,
        description: "One product optimization",
        features: [
          "Keyword Research",
          "Full Optimization",
          "Image Guidance",
          "1 Revision",
        ],
        notIncluded: [],
      },
      {
        name: "5-Pack",
        price: 549,
        description: "Five products",
        features: [
          "5 Listings",
          "Keyword Strategy",
          "Competitor Analysis",
          "Unlimited Revisions",
        ],
        notIncluded: [],
        popular: true,
      },
    ],
    faqs: [],
  },
  {
    slug: "a-plus-content",
    name: "A+ Content Creation",
    shortDesc: "Create stunning A+ Content (EBC) to boost conversions.",
    description: `
      <p>A+ Content (formerly Enhanced Brand Content) allows brand-registered sellers to add rich media to their product descriptions. Our design team creates compelling content that increases conversions by up to 10%.</p>

      <h3>What You Get</h3>
      <ul>
        <li>Professional content design</li>
        <li>Custom graphics and images</li>
        <li>Brand story module</li>
        <li>Comparison charts</li>
        <li>Mobile-optimized layout</li>
      </ul>
    `,
    icon: Sparkles,
    image: "/images/services/a-plus-content.jpg",
    startingPrice: 199,
    category: "amazon" as ServiceCategory,
    popular: false,
    features: [
      "Professional design",
      "Custom graphics",
      "Mobile optimization",
      "Brand storytelling",
      "Comparison modules",
    ],
    packages: [
      {
        name: "Standard",
        price: 199,
        description: "Basic A+ Content",
        features: [
          "5 Content Modules",
          "Stock Graphics",
          "1 Revision",
          "Upload Assistance",
        ],
        notIncluded: ["Custom Graphics"],
      },
      {
        name: "Premium",
        price: 349,
        description: "Full A+ experience",
        features: [
          "7 Content Modules",
          "Custom Graphics",
          "Brand Story",
          "Unlimited Revisions",
        ],
        notIncluded: [],
        popular: true,
      },
    ],
    faqs: [
      {
        question: "Do I need Brand Registry for A+ Content?",
        answer: "Yes, A+ Content is only available to sellers enrolled in Amazon Brand Registry.",
      },
    ],
  },
  {
    slug: "ppc-campaign-setup",
    name: "PPC Campaign Setup",
    shortDesc: "Launch profitable Amazon advertising campaigns.",
    description: `
      <p>Amazon PPC (Pay-Per-Click) advertising is essential for new product launches and maintaining visibility. Our experts set up optimized campaigns to maximize your ROI.</p>

      <h3>Campaign Types We Set Up</h3>
      <ul>
        <li>Sponsored Products</li>
        <li>Sponsored Brands</li>
        <li>Sponsored Display</li>
        <li>Product Targeting campaigns</li>
        <li>Category targeting campaigns</li>
      </ul>
    `,
    icon: Target,
    image: "/images/services/ppc-setup.jpg",
    startingPrice: 249,
    category: "amazon" as ServiceCategory,
    popular: false,
    features: [
      "Keyword research",
      "Campaign structure",
      "Bid optimization",
      "Negative keywords",
      "Performance guide",
    ],
    packages: [
      {
        name: "Starter",
        price: 249,
        description: "Basic campaign setup",
        features: [
          "3 Campaigns",
          "Keyword Research",
          "Initial Setup",
          "Strategy Guide",
        ],
        notIncluded: ["Ongoing Management"],
      },
      {
        name: "Pro",
        price: 449,
        description: "Complete PPC setup",
        features: [
          "10 Campaigns",
          "All Ad Types",
          "1-Month Optimization",
          "Weekly Reports",
        ],
        notIncluded: [],
        popular: true,
      },
    ],
    faqs: [
      {
        question: "How much should I budget for PPC?",
        answer: "We recommend starting with $20-50 per day per product. Our setup optimizes for efficiency, so your budget goes further.",
      },
    ],
  },
  {
    slug: "account-reinstatement",
    name: "Account Reinstatement",
    shortDesc: "Get your suspended Amazon account reinstated quickly.",
    description: `
      <p>A suspended Amazon account can devastate your business. Our experienced team has helped hundreds of sellers get reinstated by crafting effective Plans of Action (POA) and appeals.</p>

      <h3>Suspension Types We Handle</h3>
      <ul>
        <li>Performance-related suspensions</li>
        <li>Policy violations</li>
        <li>Inauthentic item claims</li>
        <li>Linked account issues</li>
        <li>Verification failures</li>
      </ul>
    `,
    icon: AlertTriangle,
    image: "/images/services/reinstatement.jpg",
    startingPrice: 399,
    category: "amazon" as ServiceCategory,
    popular: false,
    features: [
      "Account analysis",
      "Plan of Action writing",
      "Appeal submission",
      "Follow-up support",
      "Prevention guidance",
    ],
    packages: [
      {
        name: "Standard",
        price: 399,
        description: "Basic reinstatement",
        features: [
          "Account Analysis",
          "Plan of Action",
          "1 Appeal",
          "7-day Support",
        ],
        notIncluded: ["Multiple Appeals"],
      },
      {
        name: "Premium",
        price: 699,
        description: "Full reinstatement service",
        features: [
          "Everything in Standard",
          "Up to 3 Appeals",
          "30-day Support",
          "Prevention Strategy",
        ],
        notIncluded: [],
        popular: true,
      },
      {
        name: "Emergency",
        price: 999,
        description: "Priority handling",
        features: [
          "Same-Day Analysis",
          "Unlimited Appeals",
          "Dedicated Manager",
          "60-day Support",
        ],
        notIncluded: [],
      },
    ],
    faqs: [
      {
        question: "How long does reinstatement take?",
        answer: "Most reinstatements are resolved within 1-4 weeks, depending on the suspension type. Emergency cases get priority handling.",
      },
    ],
  },
  {
    slug: "fba-consultation",
    name: "FBA Consultation",
    shortDesc: "Expert guidance for your Amazon FBA business.",
    description: `
      <p>Get personalized advice from experienced Amazon sellers who've built successful FBA businesses. Whether you're just starting or scaling up, we provide actionable strategies.</p>

      <h3>Topics We Cover</h3>
      <ul>
        <li>Product selection strategies</li>
        <li>Sourcing and supplier negotiation</li>
        <li>Inventory management</li>
        <li>Pricing strategies</li>
        <li>Scaling operations</li>
      </ul>
    `,
    icon: Users,
    image: "/images/services/fba-consultation.jpg",
    startingPrice: 199,
    category: "amazon" as ServiceCategory,
    popular: false,
    features: [
      "1-on-1 consultation",
      "Custom strategy",
      "Action plan",
      "Follow-up support",
    ],
    packages: [
      {
        name: "Single Session",
        price: 199,
        description: "60-minute call",
        features: [
          "60-Min Video Call",
          "Strategy Discussion",
          "Action Items",
          "Recording",
        ],
        notIncluded: ["Follow-up"],
      },
      {
        name: "Coaching Package",
        price: 499,
        description: "3 sessions",
        features: [
          "3 Video Calls",
          "Email Support",
          "Resource Library",
          "30-Day Access",
        ],
        notIncluded: [],
        popular: true,
      },
    ],
    faqs: [],
  },

  // ========== TAX & FINANCE ==========
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
    category: "tax-finance" as ServiceCategory,
    popular: true,
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
    slug: "bookkeeping",
    name: "Bookkeeping Service",
    shortDesc: "Professional bookkeeping to keep your finances organized.",
    description: `
      <p>Keep your business finances organized with our monthly bookkeeping service. We track income, expenses, and prepare financial reports so you're always ready for tax season.</p>

      <h3>What's Included</h3>
      <ul>
        <li>Transaction categorization</li>
        <li>Bank reconciliation</li>
        <li>Monthly financial statements</li>
        <li>Expense tracking</li>
        <li>Tax-ready reports</li>
      </ul>
    `,
    icon: BookOpen,
    image: "/images/services/bookkeeping.jpg",
    startingPrice: 149,
    category: "tax-finance" as ServiceCategory,
    popular: false,
    features: [
      "Monthly bookkeeping",
      "Bank reconciliation",
      "Financial reports",
      "Tax preparation",
      "Dedicated bookkeeper",
    ],
    packages: [
      {
        name: "Starter",
        price: 149,
        description: "Per month (up to 50 transactions)",
        features: [
          "Transaction Categorization",
          "Bank Reconciliation",
          "Monthly P&L",
          "Email Support",
        ],
        notIncluded: ["Payroll"],
      },
      {
        name: "Growth",
        price: 299,
        description: "Per month (up to 200 transactions)",
        features: [
          "Everything in Starter",
          "Balance Sheet",
          "Quarterly Review Call",
          "Priority Support",
        ],
        notIncluded: [],
        popular: true,
      },
      {
        name: "Scale",
        price: 499,
        description: "Per month (unlimited transactions)",
        features: [
          "Everything in Growth",
          "Unlimited Transactions",
          "Monthly Review Call",
          "CFO Advisory",
        ],
        notIncluded: [],
      },
    ],
    faqs: [
      {
        question: "What accounting software do you use?",
        answer: "We work with QuickBooks, Xero, and Wave. We'll recommend the best option for your business size and needs.",
      },
    ],
  },
  {
    slug: "tax-filing",
    name: "Tax Filing Service",
    shortDesc: "US business tax preparation and filing for your LLC.",
    description: `
      <p>Stay compliant with US tax requirements with our tax filing service. We prepare and file the appropriate tax returns for your LLC, whether you're a single-member or multi-member LLC.</p>

      <h3>What's Included</h3>
      <ul>
        <li>Form 1065 (Partnership return)</li>
        <li>Form 1120-S (S-Corp election)</li>
        <li>Schedule C preparation</li>
        <li>State tax filings</li>
        <li>Tax planning advice</li>
      </ul>
    `,
    icon: Calculator,
    image: "/images/services/tax-filing.jpg",
    startingPrice: 349,
    category: "tax-finance" as ServiceCategory,
    popular: false,
    features: [
      "Federal tax return",
      "State tax return",
      "Tax planning",
      "E-filing",
      "IRS correspondence support",
    ],
    packages: [
      {
        name: "Basic",
        price: 349,
        description: "Single-member LLC",
        features: [
          "Schedule C",
          "Federal Filing",
          "E-File",
          "Email Support",
        ],
        notIncluded: ["State Filing"],
      },
      {
        name: "Standard",
        price: 549,
        description: "Multi-member or S-Corp",
        features: [
          "Form 1065 or 1120-S",
          "Federal + 1 State",
          "K-1 Preparation",
          "Tax Planning Call",
        ],
        notIncluded: [],
        popular: true,
      },
      {
        name: "Complete",
        price: 799,
        description: "Full tax service",
        features: [
          "All Returns",
          "Multi-State Filing",
          "Quarterly Estimates",
          "Year-Round Support",
        ],
        notIncluded: [],
      },
    ],
    faqs: [
      {
        question: "Do I need to file US taxes as a foreign LLC owner?",
        answer: "It depends on your situation. Single-member LLCs owned by non-residents typically don't have US tax obligations if they have no US-source income, but there may be informational filings required.",
      },
    ],
  },
];

export function getServiceBySlug(slug: string) {
  return services.find((s) => s.slug === slug);
}

export function getAllServiceSlugs() {
  return services.map((s) => s.slug);
}

export function getServicesByCategory(category: ServiceCategory) {
  return services.filter((s) => s.category === category);
}

export function getFeaturedServices() {
  return services.filter((s) => s.popular);
}
