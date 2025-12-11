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
    shortDesc: "Launch your US business in 24-48 hours. No SSN required. Trusted by 10,000+ international entrepreneurs from Bangladesh, India, Pakistan & 50+ countries.",
    description: `
      <p>Launch your American business in 24-48 hours. We handle all the paperwork while you focus on growing your business. <strong>No US residency or SSN required</strong> - we've helped over 10,000 entrepreneurs from 50+ countries establish their US presence.</p>

      <h3>Why Form a US LLC?</h3>
      <p>A Limited Liability Company (LLC) is the most popular business structure for international entrepreneurs entering the US market:</p>
      <ul>
        <li><strong>Personal Asset Protection:</strong> Your personal assets (home, savings, investments) are legally separated from business liabilities. If your business faces a lawsuit or debt, your personal wealth stays protected.</li>
        <li><strong>Tax Flexibility:</strong> LLCs enjoy "pass-through" taxation without corporate double-taxation. Foreign owners of single-member LLCs with no US-source income often have minimal US tax obligations.</li>
        <li><strong>Global Credibility:</strong> A US LLC instantly boosts your business credibility. Accept payments through Stripe/PayPal, open US bank accounts, and sell on Amazon with confidence.</li>
        <li><strong>No Residency Required:</strong> Unlike many countries, the US allows non-residents to own and operate LLCs without a visa, green card, or SSN.</li>
      </ul>

      <h3>Which State Should You Choose?</h3>
      <ul>
        <li><strong>Wyoming (Most Popular for International Sellers):</strong> Zero state income tax, strongest privacy protections, lowest annual fees ($62/year), excellent asset protection laws. Best for e-commerce, online businesses, Amazon sellers.</li>
        <li><strong>Delaware:</strong> Home to 66% of Fortune 500 companies. Established Court of Chancery, investor-friendly laws. Best for startups seeking investment.</li>
        <li><strong>New Mexico:</strong> No annual report requirement, strong privacy, low formation cost. Best for small businesses wanting minimal maintenance.</li>
      </ul>

      <h3>Our Simple 4-Step Process</h3>
      <ol>
        <li><strong>Choose Your Package (5 minutes):</strong> Select the plan that fits your needs. We collect your business details through our simple online form.</li>
        <li><strong>We Prepare Your Documents (Same Day):</strong> Our team prepares your Articles of Organization, Operating Agreement, and all required filings.</li>
        <li><strong>State Filing (24-48 Hours):</strong> We submit your formation documents to the state. Most LLCs are approved within 24-48 hours.</li>
        <li><strong>Receive Your LLC Package:</strong> Get your stamped Articles of Organization, customized Operating Agreement, and lifetime digital document storage access.</li>
      </ol>

      <h3>Transparent Pricing - No Hidden Fees</h3>
      <p>Unlike competitors who hide fees, we believe in complete transparency. Our pricing includes our service fee plus state filing fees (varies by state: $100 Wyoming, $90 Delaware, $50 New Mexico). No hidden charges, no surprise upsells.</p>

      <h3>Why 10,000+ Entrepreneurs Choose LLCPad</h3>
      <ul>
        <li><strong>International Expertise:</strong> We specialize in helping non-US residents from Bangladesh, India, Pakistan, UAE and 50+ countries.</li>
        <li><strong>Speed:</strong> Same-day processing, 24-48 hour state approval in most states.</li>
        <li><strong>24/7 Support:</strong> Customer support via chat, email, and WhatsApp in your timezone.</li>
        <li><strong>100% Satisfaction Guarantee:</strong> 4.9/5 customer rating. If we make an error, we fix it free.</li>
      </ul>
    `,
    icon: Building2,
    image: "/images/services/llc-formation.jpg",
    startingPrice: 199,
    category: "formation" as ServiceCategory,
    popular: true,
    features: [
      "LLC formation in all 50 US states",
      "Articles of Organization filed with state",
      "Customized Operating Agreement included",
      "Free name availability search",
      "Lifetime digital document storage",
      "Compliance calendar with reminders",
      "24/7 customer support (chat, email, WhatsApp)",
      "100% satisfaction guarantee",
    ],
    packages: [
      {
        name: "Basic",
        price: 199,
        description: "Essential LLC formation for budget-conscious entrepreneurs",
        features: [
          "State LLC Filing",
          "Articles of Organization",
          "Operating Agreement",
          "Digital Document Storage",
        ],
        notIncluded: ["EIN Application", "Registered Agent", "Virtual Address"],
      },
      {
        name: "Standard",
        price: 349,
        description: "Most popular - Everything you need to start your US business",
        features: [
          "Everything in Basic",
          "EIN/Tax ID Application",
          "Registered Agent (1 Year)",
          "Priority Processing & Support",
        ],
        notIncluded: ["Virtual Address", "Business Banking"],
        popular: true,
      },
      {
        name: "Premium",
        price: 549,
        description: "All-inclusive package for serious entrepreneurs",
        features: [
          "Everything in Standard",
          "Virtual US Address (1 Year)",
          "Business Banking Assistance",
          "Amazon Seller Setup Guide",
        ],
        notIncluded: [],
      },
    ],
    faqs: [
      {
        question: "Can non-US residents form a US LLC?",
        answer: "Absolutely! US LLCs are available to anyone regardless of citizenship or residency. You don't need a visa, green card, SSN, or ITIN to form and operate a US LLC. We've helped entrepreneurs from Bangladesh, India, Pakistan, UAE, and 50+ other countries successfully form their US LLCs.",
      },
      {
        question: "Which state is best for my LLC - Wyoming or Delaware?",
        answer: "For most international entrepreneurs, Wyoming is the best choice. It offers zero state income tax, the lowest annual fees ($62/year), strongest privacy protections, and excellent asset protection laws. Delaware is better if you're seeking venture capital investment or planning to go public, as investors are familiar with Delaware corporate law.",
      },
      {
        question: "How long does LLC formation take?",
        answer: "Most LLCs are approved within 24-48 hours after we submit to the state. Wyoming and New Mexico are typically the fastest (often same-day). Some states like California may take 5-7 business days. We offer expedited processing options for faster approval where available.",
      },
      {
        question: "Do I need to visit the US to form an LLC?",
        answer: "No! The entire process can be completed 100% online from anywhere in the world. You never need to visit the US to form, operate, or maintain your LLC. We handle all paperwork and filings on your behalf.",
      },
      {
        question: "What documents will I receive after formation?",
        answer: "You'll receive: (1) Stamped Articles of Organization from the state, (2) Customized Operating Agreement, (3) LLC membership certificates, (4) Meeting minutes templates, (5) EIN confirmation (if included in your package), and (6) Compliance calendar for future deadlines.",
      },
      {
        question: "Can I open a US bank account with my LLC?",
        answer: "Yes! Your LLC documents (Articles of Organization, Operating Agreement, EIN) are exactly what banks need to open a business account. We partner with banks that offer remote account opening for international LLC owners without requiring a US visit.",
      },
      {
        question: "What are the ongoing requirements after forming my LLC?",
        answer: "Requirements vary by state. Wyoming requires an annual report ($62) due on the anniversary of formation. Delaware requires an annual tax ($300) due June 1st. New Mexico has no annual report. We provide a compliance calendar and send reminders before every deadline to keep your LLC in good standing.",
      },
      {
        question: "Is my personal information kept private?",
        answer: "Yes! Wyoming and New Mexico offer strong privacy protections - your name doesn't appear on public records. We also offer registered agent service which keeps your personal address off public documents, using our business address instead.",
      },
    ],
  },
  {
    slug: "ein-application",
    name: "EIN Application",
    shortDesc: "Get your EIN (Tax ID) without an SSN. Required for US bank accounts, Amazon seller accounts & tax filing. Fast processing for international business owners.",
    description: `
      <p>Your EIN is your business's Social Security Number. We handle the entire IRS application process, <strong>even without an SSN or ITIN</strong>. Essential for banking, Amazon selling, and tax compliance.</p>

      <h3>What is an EIN and Why Do You Need One?</h3>
      <p>An Employer Identification Number (EIN), also called a Federal Tax ID, is a unique 9-digit number assigned by the IRS to identify your business. Think of it as a Social Security Number for your company.</p>

      <h4>You Need an EIN To:</h4>
      <ul>
        <li><strong>Open a US Business Bank Account:</strong> Every US bank requires an EIN to open a business account. No EIN = No bank account.</li>
        <li><strong>Set Up Amazon Seller Account:</strong> Amazon requires an EIN during the seller verification process for LLC-owned accounts.</li>
        <li><strong>Accept Payments via Stripe/PayPal:</strong> Payment processors require your EIN for 1099 tax reporting.</li>
        <li><strong>File Business Taxes:</strong> The IRS uses your EIN to track your business tax obligations.</li>
        <li><strong>Hire Employees or Contractors:</strong> Required for payroll tax purposes and issuing 1099s.</li>
        <li><strong>Build Business Credit:</strong> Your EIN is linked to your business credit profile with Dun & Bradstreet.</li>
      </ul>

      <h3>The Challenge for International Applicants</h3>
      <p>The IRS online EIN application requires an SSN or ITIN, which most international entrepreneurs don't have. The alternative is a paper/fax application that requires correctly completed Form SS-4 and understanding of IRS procedures. We handle this complexity for you.</p>

      <h3>Our EIN Application Process</h3>
      <ol>
        <li><strong>Provide Your Information:</strong> Complete our simple form with your LLC details and responsible party information.</li>
        <li><strong>We Prepare Form SS-4:</strong> Our team prepares your IRS application with the correct elections and information.</li>
        <li><strong>IRS Submission:</strong> We submit your application via the appropriate channel (fax for international applicants).</li>
        <li><strong>Receive Your EIN:</strong> You'll receive your official EIN confirmation letter, ready for banking and business use.</li>
      </ol>

      <h3>Processing Timeline</h3>
      <ul>
        <li><strong>US Residents (with SSN):</strong> Same-day via IRS online system</li>
        <li><strong>International Applicants (without SSN):</strong> 4-6 weeks via IRS fax/mail process</li>
      </ul>
      <p><em>Note: We cannot speed up IRS processing times, but we ensure your application is error-free to avoid delays or rejections.</em></p>
    `,
    icon: FileText,
    image: "/images/services/ein-application.jpg",
    startingPrice: 99,
    category: "formation" as ServiceCategory,
    popular: false,
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
        features: [
          "SS-4 Form Preparation",
          "IRS Fax Submission",
          "Official EIN Letter",
          "Banking Verification Letter",
        ],
        notIncluded: [],
      },
    ],
    faqs: [
      {
        question: "Do I need an SSN or ITIN to get an EIN?",
        answer: "No! International business owners can obtain an EIN without an SSN or ITIN. The process is different (paper/fax application instead of online), but the result is the same - a valid EIN for your business. We handle this special process for you.",
      },
      {
        question: "How long does it take to get an EIN as a non-US resident?",
        answer: "For international applicants without an SSN, the IRS typically processes EIN applications within 4-6 weeks via their fax system. During peak periods, it may take slightly longer. We submit your application as quickly as possible and keep you updated on the status.",
      },
      {
        question: "Can I use my EIN immediately after receiving it?",
        answer: "Yes! Once you receive your EIN, it's immediately valid for all business purposes including opening bank accounts, registering with Amazon, setting up payment processors, and filing taxes.",
      },
      {
        question: "What information do I need to provide for the EIN application?",
        answer: "You'll need: (1) Your LLC's legal name and formation state, (2) LLC's US address (can be your registered agent address), (3) Responsible party's name and foreign address, (4) Type of business activities, and (5) Estimated number of employees (can be zero).",
      },
      {
        question: "Is the EIN the same as a Tax ID number?",
        answer: "Yes! EIN (Employer Identification Number), Federal Tax ID, and Tax ID Number all refer to the same thing - the 9-digit number assigned by the IRS to identify your business for tax purposes.",
      },
    ],
  },
  {
    slug: "itin-application",
    name: "ITIN Application",
    shortDesc: "Get your Individual Taxpayer Identification Number for US tax filing. Required for tax treaty benefits and certain bank accounts. CAA support available.",
    description: `
      <p>An Individual Taxpayer Identification Number (ITIN) is a tax processing number issued by the IRS for individuals who need to file US tax returns but aren't eligible for a Social Security Number.</p>

      <h3>Who Needs an ITIN?</h3>
      <ul>
        <li><strong>Have US Tax Filing Requirements:</strong> Rental income, investment income, or business income from US sources</li>
        <li><strong>Want Tax Treaty Benefits:</strong> Claim reduced withholding rates under your country's tax treaty with the US</li>
        <li><strong>Need to Open Certain Bank Accounts:</strong> Some banks require an ITIN or SSN for account holders</li>
        <li><strong>Are Filing US Tax Returns:</strong> Required for any non-resident filing federal tax returns</li>
      </ul>

      <h3>ITIN vs EIN - What's the Difference?</h3>
      <ul>
        <li><strong>EIN:</strong> For your business entity (LLC, Corporation). Used for business banking, Amazon accounts, business taxes.</li>
        <li><strong>ITIN:</strong> For you as an individual. Used for personal tax filing, tax treaty benefits, some personal banking needs.</li>
      </ul>
      <p><em>Most LLC owners need an EIN for their business. An ITIN is only needed if you have personal US tax obligations.</em></p>

      <h3>The Application Process</h3>
      <ol>
        <li><strong>Document Preparation:</strong> We help prepare your W-7 application form with accurate information.</li>
        <li><strong>Document Certification:</strong> Your passport must be certified. Our Premium plan includes CAA (Certified Acceptance Agent) certification so you don't have to mail your original passport.</li>
        <li><strong>IRS Submission:</strong> We submit your complete application package to the IRS.</li>
        <li><strong>Tracking & Support:</strong> We track your application and keep you updated until you receive your ITIN.</li>
      </ol>

      <h3>Processing Timeline</h3>
      <p>The IRS typically processes ITIN applications within 7-11 weeks. During peak tax season (January-April), processing may take longer.</p>
    `,
    icon: FileCheck,
    image: "/images/services/itin-application.jpg",
    startingPrice: 199,
    category: "formation" as ServiceCategory,
    popular: false,
    features: [
      "W-7 form preparation",
      "Document review & guidance",
      "Certified Acceptance Agent support",
      "IRS submission handling",
      "Application status tracking",
      "Support until ITIN received",
    ],
    packages: [
      {
        name: "Standard",
        price: 199,
        description: "ITIN application preparation (requires mailing passport to IRS)",
        features: [
          "W-7 Form Preparation",
          "Document Review",
          "IRS Submission",
          "Status Tracking",
        ],
        notIncluded: ["CAA Certification"],
      },
      {
        name: "Premium",
        price: 299,
        description: "Full-service with CAA - Keep your passport safe",
        features: [
          "Everything in Standard",
          "CAA Document Certification",
          "No Need to Mail Passport",
          "Priority Support",
        ],
        notIncluded: [],
        popular: true,
      },
    ],
    faqs: [
      {
        question: "What is an ITIN used for?",
        answer: "An ITIN is used for US federal tax reporting when you don't have a Social Security Number. It allows you to file US tax returns, claim tax treaty benefits (reduced withholding rates), and is sometimes required for bank accounts or other financial services.",
      },
      {
        question: "Do I need an ITIN to form an LLC or open a business bank account?",
        answer: "No! Most LLC owners only need an EIN (Employer Identification Number) for their business. An ITIN is for personal tax purposes. You can form an LLC, get an EIN, and open a business bank account without an ITIN.",
      },
      {
        question: "How long does ITIN application take?",
        answer: "The IRS typically processes ITIN applications within 7-11 weeks. During peak tax season (January-April), it may take longer. Proper document preparation is essential to avoid rejection and additional delays.",
      },
      {
        question: "What is a Certified Acceptance Agent (CAA)?",
        answer: "A CAA is authorized by the IRS to verify your identity documents. With our Premium plan, a CAA certifies your passport copy, so you don't have to mail your original passport to the IRS - keeping your travel documents safe.",
      },
    ],
  },
  {
    slug: "trademark-registration",
    name: "Trademark Registration",
    shortDesc: "Protect your brand with USPTO trademark registration. Required for Amazon Brand Registry. Stop copycats and counterfeiters. Comprehensive search + filing included.",
    description: `
      <p>A registered trademark gives you <strong>exclusive nationwide rights</strong> to your brand name, logo, or slogan. Stop copycats, qualify for Amazon Brand Registry, and build lasting brand value.</p>

      <h3>Why Register a Trademark?</h3>
      <ul>
        <li><strong>Legal Protection:</strong> Exclusive right to use your brand name/logo nationwide. Sue infringers in federal court with the power to recover damages.</li>
        <li><strong>Amazon Brand Registry:</strong> Required to enroll in Brand Registry, which unlocks A+ Content, brand protection tools, and Sponsored Brands advertising.</li>
        <li><strong>Deter Copycats:</strong> The ® symbol signals your trademark is federally registered, discouraging would-be infringers from copying your brand.</li>
        <li><strong>Business Value:</strong> Trademarks are valuable intellectual property assets that increase your company's worth and can be licensed or sold.</li>
        <li><strong>International Priority:</strong> US registration can be used to register in other countries through international treaties.</li>
      </ul>

      <h3>What Can Be Trademarked?</h3>
      <ul>
        <li>Brand names (e.g., "Nike", "Apple")</li>
        <li>Logos and design marks</li>
        <li>Slogans and taglines (e.g., "Just Do It")</li>
        <li>Product packaging (trade dress)</li>
      </ul>

      <h3>Our Trademark Process</h3>
      <ol>
        <li><strong>Comprehensive Search:</strong> We search USPTO database and common law sources to assess your trademark's availability and identify potential conflicts.</li>
        <li><strong>Classification Advice:</strong> We help you select the right trademark classes for your goods/services (USPTO fees apply per class).</li>
        <li><strong>Application Preparation:</strong> We prepare your USPTO application with proper specimens, descriptions, and legal basis.</li>
        <li><strong>Filing & Monitoring:</strong> We file your application and monitor its status through the examination process.</li>
        <li><strong>Office Action Response:</strong> If the USPTO raises objections, we prepare and file responses (Standard/Premium packages).</li>
        <li><strong>Registration:</strong> Once approved, you receive your federal trademark registration certificate.</li>
      </ol>

      <h3>Timeline & Expectations</h3>
      <ul>
        <li><strong>Application to Examination:</strong> 3-4 months</li>
        <li><strong>Examination to Publication:</strong> 2-3 months (if no office actions)</li>
        <li><strong>Publication to Registration:</strong> 2-3 months</li>
        <li><strong>Total Timeline:</strong> 8-12 months typically</li>
      </ul>
      <p><em>Good news for Amazon sellers: Amazon Brand Registry now accepts pending trademark applications with serial numbers, so you can enroll within weeks of filing!</em></p>
    `,
    icon: Stamp,
    image: "/images/services/trademark.jpg",
    startingPrice: 599,
    category: "formation" as ServiceCategory,
    popular: true,
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
        features: [
          "Comprehensive Search",
          "USPTO Filing (1 Class)",
          "Application Monitoring",
          "Digital Certificate",
        ],
        notIncluded: ["Office Action Response", "Monitoring"],
      },
      {
        name: "Standard",
        price: 799,
        description: "Complete trademark service - Most Popular",
        features: [
          "Everything in Basic",
          "Office Action Response",
          "Priority Support",
          "90-Day Monitoring",
        ],
        notIncluded: ["1-Year Monitoring"],
        popular: true,
      },
      {
        name: "Premium",
        price: 999,
        description: "Full protection with monitoring",
        features: [
          "Everything in Standard",
          "1-Year Trademark Monitoring",
          "Cease & Desist Templates",
          "Attorney Review",
        ],
        notIncluded: [],
      },
    ],
    faqs: [
      {
        question: "How long does trademark registration take?",
        answer: "The USPTO typically takes 8-12 months to fully process a trademark application. However, you can use your pending trademark serial number for Amazon Brand Registry enrollment within 2-3 months of filing. We keep you updated throughout the process.",
      },
      {
        question: "Do I need a trademark for Amazon Brand Registry?",
        answer: "Yes, you need either a registered trademark OR a pending application with a serial number to enroll in Amazon Brand Registry. Our service gets you that serial number within weeks of filing, so you don't have to wait for full registration.",
      },
      {
        question: "What if my trademark application is rejected?",
        answer: "If the USPTO issues an 'office action' (objection), our Standard and Premium packages include response preparation. Common issues include likelihood of confusion with existing marks, descriptiveness, or specimen problems. Many office actions can be successfully overcome with proper responses.",
      },
      {
        question: "Can I trademark a brand name that's similar to an existing one?",
        answer: "It depends on the industry and likelihood of confusion. If the existing use is in a completely different industry and unlikely to cause confusion, you may be able to register. Our comprehensive search assesses conflicts and advises on risks before you invest in an application.",
      },
      {
        question: "What's the difference between ™ and ®?",
        answer: "™ (trademark) can be used by anyone claiming rights to a mark - no registration required. ® (registered trademark) can ONLY be used after your mark is officially registered with the USPTO. Using ® without registration is illegal and can result in penalties.",
      },
      {
        question: "How much are USPTO filing fees?",
        answer: "USPTO filing fees are $250-$350 per class (category of goods/services) and are in addition to our service fee. Most businesses need 1-2 classes. We advise on the appropriate classes during the application process.",
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
    shortDesc: "Professional registered agent service in all 50 states. Same-day document scanning, online portal, compliance alerts. Keep your personal address private. Only $99/year.",
    description: `
      <p>Every US LLC is <strong>required by law</strong> to have a registered agent. We receive your legal documents, scan them instantly, and send you compliance reminders - so you never miss a deadline and your personal address stays private.</p>

      <h3>What is a Registered Agent?</h3>
      <p>A registered agent (also called statutory agent or resident agent) is a person or company designated to receive official documents on behalf of your LLC, including:</p>
      <ul>
        <li>Legal notices and lawsuit papers (service of process)</li>
        <li>State correspondence and annual report reminders</li>
        <li>Tax notices from state agencies</li>
        <li>Official government mail</li>
      </ul>

      <h3>Why You Need a Registered Agent</h3>
      <ul>
        <li><strong>Legal Requirement:</strong> Every state requires LLCs to maintain a registered agent with a physical address (not a PO Box) in the state of formation.</li>
        <li><strong>Privacy Protection:</strong> Without a registered agent, your personal home address appears on public records. Our address is listed instead.</li>
        <li><strong>Never Miss Documents:</strong> If you're outside the US, you can't reliably receive time-sensitive legal documents. We ensure nothing falls through the cracks.</li>
        <li><strong>Compliance Assurance:</strong> Missing a registered agent can result in your LLC losing good standing status, penalties, or administrative dissolution.</li>
      </ul>

      <h3>Our Registered Agent Service Includes</h3>
      <ul>
        <li>✓ <strong>Professional Address:</strong> Business address in your LLC's state on public records</li>
        <li>✓ <strong>Same-Day Scanning:</strong> Documents scanned and uploaded within hours of receipt</li>
        <li>✓ <strong>Online Portal:</strong> 24/7 access to all your documents from anywhere in the world</li>
        <li>✓ <strong>Compliance Alerts:</strong> Email reminders 60, 30, and 7 days before annual report deadlines</li>
        <li>✓ <strong>Mail Forwarding:</strong> Physical mail forwarding available upon request</li>
        <li>✓ <strong>Privacy Protection:</strong> Your personal address stays completely off public records</li>
      </ul>

      <h3>All 50 States Covered</h3>
      <p>We provide registered agent service in all 50 US states. Whether your LLC is in Wyoming, Delaware, New Mexico, or any other state, we've got you covered with the same reliable service.</p>
    `,
    icon: Shield,
    image: "/images/services/registered-agent.jpg",
    startingPrice: 99,
    category: "compliance" as ServiceCategory,
    popular: false,
    features: [
      "Available in all 50 US states",
      "Same-day document scanning",
      "24/7 online document portal",
      "Annual report deadline reminders",
      "Privacy protection (your address hidden)",
      "Mail forwarding available",
    ],
    packages: [
      {
        name: "Annual",
        price: 99,
        description: "Complete registered agent service per year",
        features: [
          "Registered Agent Service",
          "Same-Day Document Scanning",
          "Online Portal Access",
          "Compliance Alerts",
        ],
        notIncluded: [],
      },
    ],
    faqs: [
      {
        question: "Why do I need a registered agent if I'm outside the US?",
        answer: "A registered agent is legally required, and for international LLC owners, it's essential. We're always available during US business hours to receive documents, we scan everything immediately so you can access it online, and your personal address stays completely off public records.",
      },
      {
        question: "What happens if I don't have a registered agent?",
        answer: "Operating without a registered agent puts your LLC at serious risk. You could miss lawsuit notifications (resulting in default judgments), miss state deadlines (leading to penalties), or have your LLC administratively dissolved. Most states won't let you form an LLC without designating a registered agent.",
      },
      {
        question: "How quickly will I receive scanned documents?",
        answer: "We scan and upload documents to your online portal within the same business day of receipt, usually within a few hours. You'll receive an email notification immediately when new documents are available.",
      },
      {
        question: "Can I be my own registered agent?",
        answer: "Technically yes, if you have a physical address in the state and are available during business hours. However, for international LLC owners, this isn't practical. Using a professional registered agent ensures you never miss documents and keeps your personal address private.",
      },
      {
        question: "What's the difference between registered agent and virtual address?",
        answer: "A registered agent receives legal and government documents for your LLC - it's a legal requirement. A virtual address is a general business mailing address for everyday correspondence, packages, bank statements, etc. Many international clients use both services together.",
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
    shortDesc: "Professional Amazon seller account setup for international sellers. Document preparation, tax interview guidance, verification support. Avoid suspension risks and start selling faster.",
    description: `
      <p>Setting up an Amazon seller account as an international seller is tricky. <strong>One wrong step can lead to immediate suspension.</strong> Our experts guide you through every step for a smooth, successful launch.</p>

      <h3>Why Account Setup Matters</h3>
      <p>Amazon is strict about seller verification, especially for international sellers. Common mistakes that lead to immediate suspension include:</p>
      <ul>
        <li>Mismatched information between documents</li>
        <li>Incorrect business type selection</li>
        <li>Failed identity verification</li>
        <li>Tax interview (W-8BEN) errors</li>
        <li>Using unacceptable documents</li>
      </ul>
      <p><em>Once suspended, recovery is difficult and time-consuming. It's far better to get it right the first time.</em></p>

      <h3>Our Amazon Setup Service Includes</h3>
      <ul>
        <li><strong>Account Registration Guidance:</strong> Step-by-step assistance through Amazon's registration process</li>
        <li><strong>Document Preparation:</strong> We ensure all documents meet Amazon's requirements and are properly formatted</li>
        <li><strong>Tax Interview Support:</strong> Complete the W-8BEN-E correctly to avoid tax withholding issues</li>
        <li><strong>Verification Assistance:</strong> Help with identity and address verification steps</li>
        <li><strong>Seller Central Setup:</strong> Account settings, shipping templates, and initial configuration</li>
        <li><strong>Suspension Prevention:</strong> Best practices to keep your account safe</li>
      </ul>

      <h3>Documents You'll Need</h3>
      <ul>
        <li>LLC Formation Documents (Articles of Organization)</li>
        <li>EIN Confirmation Letter</li>
        <li>US Business Bank Account Statement</li>
        <li>Valid Passport or Government ID</li>
        <li>Utility Bill or Bank Statement for Address Verification</li>
        <li>Credit Card with International Billing</li>
      </ul>

      <h3>Account Types Explained</h3>
      <p><strong>Individual Plan:</strong> $0.99 per item sold. Best if selling fewer than 40 items/month.</p>
      <p><strong>Professional Plan:</strong> $39.99/month flat fee. Best for serious sellers - unlocks advertising, promotions, and Buy Box eligibility. We recommend this plan.</p>

      <h3>New Seller Benefits (2025)</h3>
      <p>Amazon currently offers new sellers valuable incentives:</p>
      <ul>
        <li>10% back on first $50,000 in branded sales</li>
        <li>$100 credit for shipping to Amazon fulfillment centers</li>
        <li>Free storage through FBA New Selection program</li>
        <li>Up to $1,000 credit for Sponsored Products ads</li>
      </ul>
    `,
    icon: ShoppingCart,
    image: "/images/services/amazon-seller.jpg",
    startingPrice: 349,
    category: "amazon" as ServiceCategory,
    popular: true,
    features: [
      "Step-by-step registration guidance",
      "Document preparation & review",
      "Tax interview (W-8BEN) assistance",
      "Seller Central configuration",
      "Suspension prevention guidance",
      "30-60 day support",
    ],
    packages: [
      {
        name: "Standard",
        price: 349,
        description: "Amazon account setup with verification support",
        features: [
          "Registration Guidance",
          "Document Preparation",
          "Tax Interview Help",
          "Seller Central Setup",
        ],
        notIncluded: ["Brand Registry", "Product Listings"],
      },
      {
        name: "Premium",
        price: 549,
        description: "Complete Amazon starter package",
        features: [
          "Everything in Standard",
          "Brand Registry Assistance",
          "5 Product Listings Optimized",
          "60-Day Priority Support",
        ],
        notIncluded: [],
        popular: true,
      },
    ],
    faqs: [
      {
        question: "What documents does Amazon accept for verification?",
        answer: "Amazon accepts: (1) Government-issued ID (passport preferred for international sellers), (2) Bank statement or credit card statement (within 90 days), (3) Utility bill for address verification (within 90 days). Documents must be in English or officially translated. We review your documents before submission to ensure they meet Amazon's requirements.",
      },
      {
        question: "Do I need an LLC to sell on Amazon?",
        answer: "No, you can sell as an individual. However, we strongly recommend forming an LLC because: (1) It protects your personal assets from business liability, (2) It looks more professional to customers and suppliers, (3) It's required for Amazon Brand Registry, (4) Banks prefer opening accounts for LLCs over individuals.",
      },
      {
        question: "How long does Amazon account approval take?",
        answer: "Most accounts are approved within 24-72 hours if all documents are correct. However, Amazon may request additional verification, which can extend the process to 1-2 weeks. Having properly prepared documents significantly speeds up approval.",
      },
      {
        question: "What is the tax interview and how do I complete it?",
        answer: "The tax interview is Amazon's process to collect your tax information for IRS reporting. As a foreign LLC owner, you'll complete Form W-8BEN-E. This determines if tax is withheld from your earnings. We guide you through each question to ensure it's completed correctly and you claim any applicable treaty benefits.",
      },
      {
        question: "Can my Amazon account get suspended during setup?",
        answer: "Yes, Amazon can suspend accounts during or immediately after registration if they detect issues like mismatched information, suspicious activity, or document problems. Our service helps you avoid these pitfalls by ensuring everything is correct before submission.",
      },
      {
        question: "Which Amazon marketplace should I start with?",
        answer: "We recommend starting with Amazon.com (US marketplace) as it's the largest and most profitable. Once established, you can expand to other marketplaces like UK, Canada, or Germany. Your LLC and EIN work for the US marketplace.",
      },
    ],
  },
  {
    slug: "brand-registry",
    name: "Amazon Brand Registry",
    shortDesc: "Protect your brand on Amazon. Unlock A+ Content, Sponsored Brands ads, and brand protection tools. Trademark guidance included. Fight counterfeiters effectively.",
    description: `
      <p>Unlock powerful brand tools on Amazon. A+ Content, Sponsored Brands advertising, and protection against counterfeiters. We handle the enrollment process from trademark to registry approval.</p>

      <h3>What is Amazon Brand Registry?</h3>
      <p>Amazon Brand Registry is a free program for brand owners with registered trademarks. It provides powerful tools to protect your brand and enhance your product listings, giving you a significant competitive advantage.</p>

      <h3>Brand Registry Benefits</h3>
      <ul>
        <li><strong>A+ Content (Enhanced Brand Content):</strong> Add enhanced images, comparison charts, and rich text to product descriptions. Studies show A+ Content increases conversion rates by up to 10%.</li>
        <li><strong>Sponsored Brands Ads:</strong> Create banner ads featuring your logo and multiple products at the top of search results. Not available to non-registered brands.</li>
        <li><strong>Amazon Stores:</strong> Build your own branded storefront within Amazon - a multi-page shopping experience for your brand.</li>
        <li><strong>Brand Protection:</strong> Report counterfeiters, remove unauthorized sellers, and control your brand representation with powerful IP protection tools.</li>
        <li><strong>Brand Analytics:</strong> Access powerful data on customer search terms, demographics, and repeat purchase behavior.</li>
        <li><strong>Amazon Vine:</strong> Get authentic reviews from trusted reviewers for new product launches.</li>
      </ul>

      <h3>Requirements for Brand Registry</h3>
      <ul>
        <li>Registered trademark OR pending application with serial number</li>
        <li>Trademark must be text-based or image-based mark with words</li>
        <li>Trademark must appear on your products or packaging</li>
        <li>Active Amazon seller account</li>
      </ul>

      <h3>Our Brand Registry Service</h3>
      <ol>
        <li><strong>Trademark Assessment:</strong> Review your trademark status and eligibility</li>
        <li><strong>Application Preparation:</strong> Compile all information needed for enrollment</li>
        <li><strong>Registry Submission:</strong> Submit your enrollment through Amazon Brand Registry portal</li>
        <li><strong>Verification Support:</strong> Guide you through Amazon's verification code process</li>
        <li><strong>Feature Setup:</strong> Help you access A+ Content, Brand Analytics, and protection tools</li>
      </ol>

      <h3>Complete Bundle: Trademark + Brand Registry</h3>
      <p>Don't have a trademark yet? Our Complete Bundle includes USPTO trademark filing with comprehensive search, plus Brand Registry enrollment once your trademark is pending/approved.</p>
    `,
    icon: BadgeCheck,
    image: "/images/services/brand-registry.jpg",
    startingPrice: 299,
    category: "amazon" as ServiceCategory,
    popular: true,
    features: [
      "Brand Registry enrollment",
      "A+ Content access setup",
      "Brand protection tools",
      "Sponsored Brands access",
      "Brand Analytics access",
      "Amazon Stores capability",
    ],
    packages: [
      {
        name: "Registry Only",
        price: 299,
        description: "For sellers who already have a trademark",
        features: [
          "Registry Application",
          "Verification Support",
          "A+ Content Setup",
          "Brand Tools Access",
        ],
        notIncluded: ["Trademark Filing"],
      },
      {
        name: "Complete Bundle",
        price: 799,
        description: "Trademark + Registry - Best Value",
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
        question: "Do I need a fully registered trademark for Brand Registry?",
        answer: "No! Amazon now accepts pending trademark applications with a serial number. This means you can enroll in Brand Registry within weeks of filing your trademark application, rather than waiting 8-12 months for full registration.",
      },
      {
        question: "What benefits does Brand Registry give me?",
        answer: "Brand Registry unlocks: A+ Content (enhanced product descriptions), Sponsored Brands ads, Amazon Stores, Brand Analytics, Amazon Vine reviews, and powerful tools to fight counterfeiters and hijackers. These tools can significantly increase your sales and protect your brand.",
      },
      {
        question: "How long does Brand Registry enrollment take?",
        answer: "Once you have a trademark (registered or pending with serial number), Brand Registry enrollment typically takes 1-2 weeks. Amazon will send a verification code to the trademark owner of record, which we'll help you complete.",
      },
      {
        question: "Can I use Brand Registry to remove competitors from my listings?",
        answer: "Brand Registry gives you tools to report intellectual property violations, but it doesn't automatically remove legitimate resellers. You can report counterfeiters and unauthorized use of your brand, and Amazon will investigate.",
      },
      {
        question: "What if I sell multiple brands?",
        answer: "You can enroll multiple brands in Brand Registry, each requiring its own trademark. We can help you file additional trademarks and enroll each brand separately.",
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
    shortDesc: "Open a US business bank account without visiting America. Partner banks welcome international LLC owners. Debit card, online banking, wire transfers included.",
    description: `
      <p>Opening a US bank account as a non-resident is challenging, but not impossible. We connect you with partner banks that welcome international entrepreneurs and allow <strong>100% remote account opening</strong>.</p>

      <h3>Why You Need a US Business Bank Account</h3>
      <ul>
        <li><strong>Amazon Seller Payouts:</strong> Amazon US deposits seller funds to US bank accounts only. Without one, you'd lose money on currency conversion and international transfer fees with services like Payoneer.</li>
        <li><strong>Payment Processors:</strong> Stripe, PayPal, and other US payment processors work best with US bank accounts.</li>
        <li><strong>Client Payments:</strong> US clients can pay you easily via ACH (free) instead of expensive wire transfers.</li>
        <li><strong>Business Credibility:</strong> A US bank account signals legitimacy to American customers and partners.</li>
        <li><strong>Debit Card Access:</strong> Pay for US services, subscriptions, and advertising directly.</li>
      </ul>

      <h3>The Challenge for International Entrepreneurs</h3>
      <p>Most traditional US banks (Chase, Bank of America, Wells Fargo) require:</p>
      <ul>
        <li>Physical visit to a branch</li>
        <li>US Social Security Number</li>
        <li>US residential address</li>
        <li>Extensive documentation</li>
      </ul>
      <p>These requirements make it nearly impossible for non-residents. Our solution changes that.</p>

      <h3>Our Partner Bank Solution</h3>
      <p>We've partnered with US banks and fintechs that:</p>
      <ul>
        <li>✓ Welcome international LLC owners</li>
        <li>✓ Allow 100% remote account opening (no US visit required)</li>
        <li>✓ Don't require SSN (EIN is sufficient)</li>
        <li>✓ Provide full banking features</li>
      </ul>

      <h3>What You'll Get</h3>
      <ul>
        <li>US Business Checking Account</li>
        <li>US Routing and Account Numbers</li>
        <li>Visa/Mastercard Debit Card (shipped internationally)</li>
        <li>Online and Mobile Banking</li>
        <li>ACH Transfers (receive payments free)</li>
        <li>Wire Transfer Capability</li>
        <li>Integration with Amazon, Stripe, PayPal</li>
      </ul>

      <h3>Our Service Includes</h3>
      <ol>
        <li><strong>Bank Matching:</strong> We recommend the best bank for your specific situation and business needs.</li>
        <li><strong>Document Preparation:</strong> We help prepare and organize all required documents.</li>
        <li><strong>Application Guidance:</strong> Step-by-step assistance through the application process.</li>
        <li><strong>Follow-up Support:</strong> Help addressing any bank questions or additional requirements.</li>
      </ol>
    `,
    icon: Landmark,
    image: "/images/services/business-banking.jpg",
    startingPrice: 199,
    category: "tax-finance" as ServiceCategory,
    popular: true,
    features: [
      "Partner bank introduction",
      "100% remote account opening",
      "No SSN required (EIN accepted)",
      "Application assistance",
      "Debit card shipped internationally",
      "Full online banking access",
    ],
    packages: [
      {
        name: "Standard",
        price: 199,
        description: "Complete banking assistance for international LLC owners",
        features: [
          "Bank Selection Guidance",
          "Application Assistance",
          "Document Preparation",
          "Follow-up Support",
        ],
        notIncluded: [],
      },
    ],
    faqs: [
      {
        question: "Can I really open a US bank account without visiting America?",
        answer: "Yes! Our partner banks allow 100% remote account opening for international LLC owners. The process is done online and via video verification call. You never need to set foot in the US.",
      },
      {
        question: "Which banks do you work with?",
        answer: "We work with several US banks and fintech companies that welcome international clients, including Mercury, Relay, and traditional banks with international programs. The specific recommendation depends on your business type, expected transaction volume, and specific needs.",
      },
      {
        question: "How long does account opening take?",
        answer: "Most accounts are opened within 3-7 business days after submitting all documents. Some banks can approve accounts in as little as 24-48 hours. Delays can occur if additional verification is needed.",
      },
      {
        question: "What are the account fees?",
        answer: "Fees vary by bank. Many of our partner banks offer free business accounts with no monthly fees. Some traditional banks charge $10-30/month with options to waive fees by maintaining minimum balances. We provide complete fee information during bank selection.",
      },
      {
        question: "Will I get a debit card?",
        answer: "Yes! All our partner banks provide Visa or Mastercard debit cards. Cards can be shipped internationally, though delivery times vary by location (typically 2-4 weeks for international delivery).",
      },
      {
        question: "Can I receive Amazon payouts to this account?",
        answer: "Absolutely! Our partner bank accounts work perfectly with Amazon Seller Central. You'll receive your Amazon disbursements directly to your US account, avoiding Payoneer's fees and getting better exchange rates.",
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
