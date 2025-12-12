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
    shortDesc: "Run multiple brands under one LLC. A DBA lets you accept payments, open bank accounts, and market your business under any name you choose - without forming a new company.",
    description: `
      <p>Want to launch a new brand without the hassle and cost of forming another LLC? A DBA (Doing Business As) is your answer. It's the simplest way to operate under a different name while keeping all the legal protection of your existing LLC.</p>

      <h3>What Exactly is a DBA?</h3>
      <p>A DBA - also called a fictitious name, trade name, or assumed name - is simply a registered alias for your business. Your LLC "ABC Holdings LLC" can do business as "Fresh Organic Foods" or "TechGadget Store" without any legal confusion.</p>

      <h3>Why Smart Business Owners Use DBAs</h3>
      <ul>
        <li><strong>Multiple Brands, One LLC:</strong> Run an Amazon store, a Shopify site, and a consulting practice - all under one LLC with different DBAs. Save thousands on formation fees and annual reports.</li>
        <li><strong>Professional Branding:</strong> "Smith & Johnson Marketing" sounds more professional than "SJ Holdings LLC" to potential clients.</li>
        <li><strong>Banking Flexibility:</strong> Open separate bank accounts for each DBA, making accounting and cash flow management much simpler.</li>
        <li><strong>Test New Markets:</strong> Launch a new product line under a fresh brand without committing to a whole new business entity.</li>
        <li><strong>Accept Payments Properly:</strong> Customers write checks to your business name, not your LLC's legal name. Without a DBA, banks won't accept them.</li>
      </ul>

      <h3>DBA vs. New LLC - Which Should You Choose?</h3>
      <p>Here's a simple rule: if the new business has significantly different liability risks or you want separate ownership, form a new LLC. If you just need a different public-facing name for marketing, a DBA is faster, cheaper, and easier to manage.</p>

      <h3>The Filing Process</h3>
      <p>DBA requirements vary by state and sometimes by county. Some states file at the state level, others require county filings, and a few need both. We handle the research and paperwork so you don't have to figure out the local rules.</p>
      <ol>
        <li>We verify your desired name is available</li>
        <li>Prepare and file the appropriate forms</li>
        <li>Handle any publication requirements (some states require newspaper publication)</li>
        <li>Deliver your official DBA certificate</li>
      </ol>

      <h3>How Long Does a DBA Last?</h3>
      <p>Most DBAs are valid for 5 years and need renewal. Some states like California require renewal every 5 years with a new filing fee. We'll remind you before expiration so your business name stays protected.</p>
    `,
    icon: FilePen,
    image: "/images/services/dba.jpg",
    startingPrice: 99,
    category: "formation" as ServiceCategory,
    popular: false,
    features: [
      "Name availability search",
      "State/county DBA filing",
      "Publication handling (if required)",
      "Certificate of registration",
      "Digital document delivery",
      "Renewal reminders",
    ],
    packages: [
      {
        name: "Standard",
        price: 99,
        description: "Complete DBA registration service",
        features: [
          "Name Availability Search",
          "State/County Filing",
          "DBA Certificate",
          "Digital Copies",
        ],
        notIncluded: ["Publication Fee"],
      },
      {
        name: "Complete",
        price: 149,
        description: "With publication handling",
        features: [
          "Everything in Standard",
          "Newspaper Publication",
          "Proof of Publication",
          "Priority Processing",
        ],
        notIncluded: [],
        popular: true,
      },
    ],
    faqs: [
      {
        question: "What's the difference between a DBA and forming a new LLC?",
        answer: "A DBA is just an alternate name for your existing LLC - it doesn't create a new legal entity or provide additional liability protection. It's faster (days vs weeks) and cheaper ($99 vs $200+) than forming a new LLC. Choose a DBA when you want a different public name; choose a new LLC when you need separate liability protection or different ownership.",
      },
      {
        question: "Can I open a bank account with my DBA name?",
        answer: "Yes! That's one of the main reasons to get a DBA. Once registered, you can open a business bank account under your DBA name, accept checks made out to that name, and process credit cards under your trade name.",
      },
      {
        question: "Do I need a DBA if my LLC name is the same as my business name?",
        answer: "No. If your LLC is registered as 'Joe's Pizza Shop LLC' and you operate as 'Joe's Pizza Shop,' you don't need a DBA. You only need one if you want to operate under a different name than your legal LLC name.",
      },
      {
        question: "How many DBAs can one LLC have?",
        answer: "There's no limit! Your single LLC can have multiple DBAs, each for a different brand or business line. Many entrepreneurs use this strategy to test new markets or run completely different businesses under one legal entity.",
      },
      {
        question: "Does a DBA protect my business name like a trademark?",
        answer: "No. A DBA only registers your right to use that name for business purposes in your state/county - it doesn't prevent others from using the same name elsewhere. For nationwide brand protection, you need a trademark registration.",
      },
    ],
  },
  {
    slug: "operating-agreement",
    name: "Operating Agreement",
    shortDesc: "Your LLC's rulebook - required by banks, protects you from partners, and proves you're a real business. Custom-drafted for single or multi-member LLCs.",
    description: `
      <p>Try opening a US bank account without an Operating Agreement - you'll be turned away at the door. This document isn't just paperwork; it's the rulebook that governs how your LLC operates, and banks, payment processors, and partners all want to see it.</p>

      <h3>Why Your LLC Absolutely Needs an Operating Agreement</h3>
      <ul>
        <li><strong>Banks Require It:</strong> Mercury, Relay, Chase, Bank of America - they all ask for your Operating Agreement during account opening. No agreement, no account. It's that simple.</li>
        <li><strong>Protects Your Limited Liability:</strong> Without an Operating Agreement, courts may decide your LLC isn't a "real" separate entity. This is called "piercing the corporate veil" - and it exposes your personal assets to business debts.</li>
        <li><strong>Prevents Partner Disputes:</strong> Who gets what percentage of profits? What happens if a member wants out? Who makes decisions? Without written rules, disagreements can destroy friendships and businesses.</li>
        <li><strong>Overrides Bad State Default Rules:</strong> If you don't have an Operating Agreement, your state's default LLC laws apply - and they might not be what you want. For example, some states split profits equally regardless of investment amounts.</li>
      </ul>

      <h3>What's Covered in Your Operating Agreement</h3>
      <ul>
        <li><strong>Ownership Percentages:</strong> Who owns what percentage of the LLC</li>
        <li><strong>Capital Contributions:</strong> How much each member invested</li>
        <li><strong>Profit & Loss Distribution:</strong> How money gets divided (doesn't have to match ownership!)</li>
        <li><strong>Management Structure:</strong> Member-managed (all owners run it) or Manager-managed (designated managers)</li>
        <li><strong>Voting Rights:</strong> How decisions are made, what requires unanimous consent</li>
        <li><strong>Adding/Removing Members:</strong> Process for bringing in new partners or buying out existing ones</li>
        <li><strong>Dissolution:</strong> What happens if the business closes</li>
      </ul>

      <h3>Single-Member vs. Multi-Member - Why It Matters</h3>
      <p><strong>Single-Member LLC:</strong> You might think "I'm the only owner, why do I need rules?" But an Operating Agreement proves to banks and courts that your LLC is a legitimate separate entity, not just you operating under a different name. It also sets up succession planning if something happens to you.</p>
      <p><strong>Multi-Member LLC:</strong> This is where things get critical. Your Operating Agreement is the contract between you and your partners. Get it wrong, and you're setting up future lawsuits. We've seen partnerships dissolve over disagreements that a good Operating Agreement would have prevented.</p>

      <h3>Member-Managed vs. Manager-Managed</h3>
      <p><strong>Member-Managed:</strong> All owners participate in daily operations and decision-making. Best for small LLCs where all members are actively involved.</p>
      <p><strong>Manager-Managed:</strong> Specific people (can be members or outsiders) handle operations while other members are passive investors. Better for LLCs with silent partners or outside investors.</p>
    `,
    icon: ScrollText,
    image: "/images/services/operating-agreement.jpg",
    startingPrice: 149,
    category: "formation" as ServiceCategory,
    popular: false,
    features: [
      "Customized to your specific LLC",
      "Single-member or multi-member versions",
      "Member-managed or manager-managed",
      "Profit distribution provisions",
      "Buy-sell and succession clauses",
      "Editable Word document",
    ],
    packages: [
      {
        name: "Standard",
        price: 149,
        description: "Custom Operating Agreement for your LLC",
        features: [
          "Customized Document",
          "All LLC Structures",
          "Digital Delivery (Word + PDF)",
          "1 Revision Round",
        ],
        notIncluded: ["Attorney Review"],
      },
      {
        name: "Premium",
        price: 249,
        description: "With attorney review - Best for partnerships",
        features: [
          "Everything in Standard",
          "Attorney Review & Feedback",
          "Unlimited Revisions",
          "15-Min Phone Consultation",
        ],
        notIncluded: [],
        popular: true,
      },
    ],
    faqs: [
      {
        question: "Is an Operating Agreement legally required?",
        answer: "Only a few states (like California, New York, Missouri) legally require it. But here's the thing - every bank requires one to open a business account. And without one, you risk losing your limited liability protection in court. So while it may not be 'required' by your state, it's required for actually running your business.",
      },
      {
        question: "Can I write my own Operating Agreement?",
        answer: "Technically yes, but we don't recommend it. A poorly drafted agreement can create more problems than having none at all. Ambiguous language leads to disputes, and missing clauses leave gaps that default to state law (which might not favor you). Our agreements are drafted based on thousands of LLCs and cover scenarios most people don't think about.",
      },
      {
        question: "I'm the only member - do I still need one?",
        answer: "Absolutely. Single-member Operating Agreements serve two critical purposes: (1) They prove to banks and the IRS that your LLC is a legitimate separate entity, and (2) They establish what happens to your LLC if you become incapacitated or pass away. Without one, your family may have difficulty accessing business accounts.",
      },
      {
        question: "Can I change my Operating Agreement later?",
        answer: "Yes! Operating Agreements can be amended at any time with member consent. Common amendments include adding new members, changing profit distributions, or updating management structure. We provide your document in editable format so you can make changes as your business evolves.",
      },
      {
        question: "What's the difference between Articles of Organization and Operating Agreement?",
        answer: "Articles of Organization is the public document filed with the state to legally create your LLC - it's very basic (just name, address, registered agent). The Operating Agreement is a private internal document that contains the detailed rules for how your LLC operates. Banks need both.",
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
    shortDesc: "Never worry about state deadlines again. We track your annual reports, file on time, and keep your LLC in good standing - so you don't wake up to penalties or a dissolved business.",
    description: `
      <p>Miss one annual report deadline and your LLC can lose its "good standing" status. Miss another, and some states will administratively dissolve your business entirely. For international entrepreneurs managing their US LLC from abroad, keeping track of different state deadlines is a nightmare we solve for you.</p>

      <h3>What Happens If You Miss Compliance Deadlines?</h3>
      <p>The consequences are real and expensive:</p>
      <ul>
        <li><strong>Late Fees:</strong> States charge penalty fees ranging from $25 to $200+ for late filings</li>
        <li><strong>Loss of Good Standing:</strong> Your LLC status changes to "not in good standing" - banks may freeze accounts, contracts become harder to sign</li>
        <li><strong>Administrative Dissolution:</strong> After continued non-compliance, states can dissolve your LLC without your consent</li>
        <li><strong>Loss of Name Protection:</strong> Someone else could register your business name while your LLC is dissolved</li>
        <li><strong>Personal Liability:</strong> Operating a dissolved LLC can expose you personally to business debts</li>
      </ul>

      <h3>What We Handle For You</h3>
      <ul>
        <li><strong>Annual Report Filing:</strong> We prepare and file your annual/biennial report before the deadline</li>
        <li><strong>Franchise Tax:</strong> States like Delaware and California require annual franchise tax payments - we handle the paperwork</li>
        <li><strong>Registered Agent Coordination:</strong> Ensure your registered agent information stays current</li>
        <li><strong>Address Updates:</strong> If your business address changes, we update state records</li>
        <li><strong>Good Standing Verification:</strong> We confirm your filing was accepted and your status is current</li>
      </ul>

      <h3>State-by-State Requirements (2025)</h3>
      <ul>
        <li><strong>Wyoming:</strong> Annual report due on anniversary date. $62 state fee (minimum). We file 30 days before deadline.</li>
        <li><strong>Delaware:</strong> Annual franchise tax due June 1st. $300 minimum. Miss it and you'll pay $200+ in penalties.</li>
        <li><strong>New Mexico:</strong> No annual report required! One of the reasons we recommend this state for low-maintenance LLCs.</li>
        <li><strong>Florida:</strong> Annual report due May 1st. $138.75 fee. Late fee of $400 kicks in immediately after deadline.</li>
        <li><strong>Texas:</strong> No annual report, but you must file a "No Tax Due" franchise tax report. Due May 15th.</li>
      </ul>

      <h3>How Our Service Works</h3>
      <ol>
        <li><strong>We Track Everything:</strong> Your deadlines are in our system with multiple reminder checkpoints</li>
        <li><strong>60-Day Notice:</strong> You'll get an email 60 days before any deadline</li>
        <li><strong>We Prepare & File:</strong> Our team handles the paperwork and submits on time</li>
        <li><strong>Confirmation:</strong> You receive proof of filing and updated good standing status</li>
      </ol>

      <h3>Peace of Mind for International Owners</h3>
      <p>When you're running your business from Bangladesh, India, or anywhere outside the US, the last thing you need is to track American state government deadlines. Different states, different dates, different requirements - we handle it all so you can focus on growing your business.</p>
    `,
    icon: Briefcase,
    image: "/images/services/compliance.jpg",
    startingPrice: 149,
    category: "compliance" as ServiceCategory,
    popular: false,
    features: [
      "Annual report preparation & filing",
      "Franchise tax filing assistance",
      "60/30/7 day deadline reminders",
      "Good standing verification",
      "State fee payment coordination",
      "Document storage & access",
    ],
    packages: [
      {
        name: "Annual",
        price: 149,
        description: "Complete annual compliance service (+ state fees)",
        features: [
          "Annual Report Filing",
          "Deadline Monitoring",
          "Email Reminders",
          "Good Standing Check",
        ],
        notIncluded: [],
      },
    ],
    faqs: [
      {
        question: "What's included in the $149 fee vs. state fees?",
        answer: "Our $149 fee covers the service - deadline tracking, document preparation, filing, and support. State fees (like Wyoming's $62 annual report fee or Delaware's $300 franchise tax) are separate and vary by state. We'll tell you the exact state fee before we file so there are no surprises.",
      },
      {
        question: "When is my annual report due?",
        answer: "It depends on your state. Wyoming reports are due on your LLC's formation anniversary. Delaware franchise tax is due June 1st. Some states use calendar year deadlines. When you sign up, we'll tell you your exact deadline and add it to our tracking system.",
      },
      {
        question: "What if I already missed a deadline?",
        answer: "Don't panic - most states allow late filing with penalties. The sooner you file, the lower the penalties. Contact us immediately and we'll assess the situation, calculate any late fees, and file as quickly as possible to restore your good standing.",
      },
      {
        question: "My state (New Mexico) has no annual report - do I still need this service?",
        answer: "New Mexico is one of the few states with no annual report requirement. If that's your only LLC and nothing has changed, you technically don't need annual compliance filing. However, you should still maintain your registered agent service and keep your Operating Agreement updated.",
      },
      {
        question: "What happens if my LLC loses good standing?",
        answer: "Losing good standing means your LLC is flagged for non-compliance. Banks may question your account, you might have trouble signing contracts, and continued non-compliance leads to administrative dissolution. The good news: it's usually fixable by filing the overdue reports and paying late fees.",
      },
    ],
  },
  {
    slug: "amendment-filing",
    name: "Amendment Filing",
    shortDesc: "Changed your LLC name, address, or ownership? File the official amendment with the state. Keep your records current and avoid compliance issues.",
    description: `
      <p>Your LLC isn't set in stone. Business names evolve, addresses change, partners come and go. When these changes happen, your state needs to know - that's what an amendment filing does. It officially updates your LLC's public record.</p>

      <h3>When You Need to File an Amendment</h3>
      <ul>
        <li><strong>LLC Name Change:</strong> Rebranding? Found a better name? Changing your LLC's legal name requires a state amendment. (Note: This is different from a DBA, which adds an alternate name without changing the legal name.)</li>
        <li><strong>Principal Address Change:</strong> Moving your business headquarters? The state needs the new address on file.</li>
        <li><strong>Registered Agent Change:</strong> Switching registered agent providers? An amendment updates your official agent of record.</li>
        <li><strong>Management Structure Change:</strong> Converting from member-managed to manager-managed (or vice versa).</li>
        <li><strong>Member/Manager Changes:</strong> Some states require amendments when ownership changes, especially if member names are on the Articles of Organization.</li>
        <li><strong>Purpose Statement Update:</strong> Expanding into new business activities that don't fit your original stated purpose.</li>
      </ul>

      <h3>Why Timely Amendments Matter</h3>
      <p>Operating with outdated state records creates real problems:</p>
      <ul>
        <li><strong>Bank Issues:</strong> Banks verify your LLC details against state records. Mismatches can freeze accounts or prevent new account openings.</li>
        <li><strong>Legal Vulnerability:</strong> If you're sued, outdated addresses mean you might miss service of process - leading to default judgments against you.</li>
        <li><strong>Contract Problems:</strong> Partners and vendors may question contracts signed with old information.</li>
        <li><strong>Compliance Flags:</strong> Some states penalize LLCs operating with incorrect information on file.</li>
      </ul>

      <h3>Our Amendment Process</h3>
      <ol>
        <li><strong>Review Current Records:</strong> We pull your current state filing to confirm what needs updating</li>
        <li><strong>Prepare Amendment:</strong> We draft the Articles of Amendment with the correct legal language</li>
        <li><strong>File with State:</strong> Submit to the Secretary of State with required fees</li>
        <li><strong>Confirmation:</strong> You receive the stamped/approved amendment for your records</li>
      </ol>

      <h3>Timeline & Fees</h3>
      <p>Most amendments are processed within 3-7 business days, though this varies by state. Wyoming is typically fastest (1-2 days), while states like California can take 2-3 weeks. Expedited processing is available in most states for an additional fee.</p>

      <h3>Name Change vs. DBA - Know the Difference</h3>
      <p>If you want to operate under a different name but keep your legal LLC name, you need a DBA (Doing Business As), not an amendment. An amendment actually changes your LLC's legal name on state records. Choose wisely - both have their uses.</p>
    `,
    icon: FilePen,
    image: "/images/services/amendment.jpg",
    startingPrice: 99,
    category: "compliance" as ServiceCategory,
    popular: false,
    features: [
      "Current filing review",
      "Amendment document preparation",
      "State filing & submission",
      "Stamped amendment certificate",
      "Updated document copies",
      "Record keeping assistance",
    ],
    packages: [
      {
        name: "Standard",
        price: 99,
        description: "Single amendment filing (+ state fees)",
        features: [
          "Document Preparation",
          "State Filing",
          "Amendment Certificate",
          "Digital Copies",
        ],
        notIncluded: ["Expedited Processing"],
      },
      {
        name: "Rush",
        price: 179,
        description: "Expedited processing where available",
        features: [
          "Everything in Standard",
          "Expedited State Processing",
          "Priority Handling",
          "Same-Day Submission",
        ],
        notIncluded: [],
        popular: true,
      },
    ],
    faqs: [
      {
        question: "How long does an amendment take to process?",
        answer: "Standard processing takes 3-7 business days in most states. Wyoming is often approved within 1-2 days, while California and New York can take 2-3 weeks. We offer expedited service where states allow it.",
      },
      {
        question: "Do I need to update my EIN after a name change?",
        answer: "No, your EIN stays the same even if you change your LLC name. However, you should notify the IRS of the name change by filing Form 8822-B or including the name change on your next tax return. We can help with this process.",
      },
      {
        question: "Can I change multiple things in one amendment?",
        answer: "Yes! You can bundle multiple changes (like name and address) into a single amendment filing, saving on state fees. Let us know all the changes you need and we'll include everything in one filing.",
      },
      {
        question: "What if I need to add or remove a member?",
        answer: "It depends on your state. Some states (like Wyoming) don't list members on the Articles of Organization, so no amendment is needed - just update your Operating Agreement. Other states require amendments for ownership changes. We'll advise based on your state's requirements.",
      },
      {
        question: "Will an amendment affect my existing contracts or bank accounts?",
        answer: "Your existing contracts remain valid, but you may need to notify the other parties of changes (especially name changes). Banks will need to update their records - bring your amendment certificate to update your account information.",
      },
    ],
  },
  {
    slug: "certificate-good-standing",
    name: "Certificate of Good Standing",
    shortDesc: "Official state proof that your LLC exists and is compliant. Required for bank accounts, business loans, contracts, and foreign qualification in other states.",
    description: `
      <p>A Certificate of Good Standing is basically your LLC's report card - it's an official state document proving your business exists, is properly registered, and has met all its compliance obligations. Banks, lenders, partners, and other states will ask for this document.</p>

      <h3>What Does "Good Standing" Actually Mean?</h3>
      <p>When a state says your LLC is in "good standing," they're confirming:</p>
      <ul>
        <li>Your LLC is currently registered and active (not dissolved or suspended)</li>
        <li>All annual reports have been filed on time</li>
        <li>All franchise taxes and fees have been paid</li>
        <li>There are no pending administrative actions against your LLC</li>
      </ul>

      <h3>When You'll Need This Certificate</h3>
      <ul>
        <li><strong>Opening Bank Accounts:</strong> Most banks require a recent Certificate of Good Standing (usually within 30-90 days) to verify your LLC is legitimate before opening business accounts.</li>
        <li><strong>Business Loans & Credit:</strong> Lenders want proof your business is in good standing before extending credit.</li>
        <li><strong>Foreign Qualification:</strong> Registering your LLC to do business in another state? That state will require a Certificate of Good Standing from your home state.</li>
        <li><strong>Major Contracts:</strong> Large clients, government contracts, and commercial leases often require good standing verification.</li>
        <li><strong>Business Sales:</strong> Buying or selling a business? Good standing certificates are standard in due diligence.</li>
        <li><strong>International Use:</strong> Using your LLC documents abroad often requires a Certificate of Good Standing with an apostille.</li>
      </ul>

      <h3>Different Names, Same Document</h3>
      <p>States call this document different things:</p>
      <ul>
        <li>Certificate of Good Standing (most states)</li>
        <li>Certificate of Existence (Texas, Arkansas)</li>
        <li>Certificate of Status (Arizona)</li>
        <li>Certificate of Fact (some states)</li>
        <li>Letter of Good Standing</li>
      </ul>
      <p>They all mean the same thing - we'll get you the right document for your state.</p>

      <h3>How Long is it Valid?</h3>
      <p>Certificates of Good Standing don't technically expire, but most requesting parties want a recent one:</p>
      <ul>
        <li>Banks typically want one issued within 30-90 days</li>
        <li>Foreign qualification usually requires within 30-60 days</li>
        <li>Some contracts may specify their own requirements</li>
      </ul>
      <p>If you need the certificate for a specific purpose, check their requirements before ordering.</p>

      <h3>Processing Time</h3>
      <p>Most states issue certificates within 1-3 business days. Some states offer same-day service for an additional fee. We'll advise on timing based on your state and urgency.</p>
    `,
    icon: FileCheck,
    image: "/images/services/good-standing.jpg",
    startingPrice: 49,
    category: "compliance" as ServiceCategory,
    popular: false,
    features: [
      "Official state-issued certificate",
      "Digital copy delivered by email",
      "Physical copy available",
      "Fast processing (1-3 days)",
      "Apostille service available",
      "Valid for banking & contracts",
    ],
    packages: [
      {
        name: "Standard",
        price: 49,
        description: "Digital certificate (+ state fees)",
        features: [
          "State Filing Request",
          "Digital Copy (PDF)",
          "Email Delivery",
          "Support",
        ],
        notIncluded: ["Physical Copy", "Apostille"],
      },
      {
        name: "With Apostille",
        price: 149,
        description: "For international use",
        features: [
          "Certificate Request",
          "Apostille Certification",
          "Physical Document",
          "International Shipping",
        ],
        notIncluded: [],
        popular: true,
      },
    ],
    faqs: [
      {
        question: "How quickly can I get a Certificate of Good Standing?",
        answer: "Most states process certificates within 1-3 business days. Some states like Wyoming offer same-day processing. If you need it urgently, let us know and we'll explore expedited options for your state.",
      },
      {
        question: "What if my LLC is NOT in good standing?",
        answer: "If your LLC has fallen out of good standing (missed reports, unpaid fees), you'll need to fix those issues before the state will issue a certificate. We can help identify what's needed to restore good standing, file the necessary documents, and then obtain your certificate.",
      },
      {
        question: "Do I need an apostille for my certificate?",
        answer: "Only if you're using the certificate outside the US in a country that's part of the Hague Apostille Convention. An apostille is an international authentication that makes your US document valid abroad. If you're using the certificate domestically (US banks, US contracts), you don't need an apostille.",
      },
      {
        question: "How long is a Certificate of Good Standing valid?",
        answer: "The certificate itself doesn't expire - it's a snapshot of your LLC's status on the date issued. However, most requesting parties (banks, other states) want a 'fresh' certificate, typically issued within 30-90 days. Check with whoever is requesting it for their specific requirements.",
      },
      {
        question: "Can I use this certificate to open a bank account?",
        answer: "Yes! A Certificate of Good Standing is one of the standard documents banks request when opening business accounts. Combined with your Articles of Organization, Operating Agreement, and EIN, it completes the typical document package banks need.",
      },
    ],
  },
  {
    slug: "llc-dissolution",
    name: "LLC Dissolution",
    shortDesc: "Close your LLC the right way. Stop annual fees, protect yourself from future liability, and get official closure from the state. Don't let an inactive LLC become a compliance nightmare.",
    description: `
      <p>Shutting down your LLC might seem as simple as just stopping operations - but it's not. Without proper dissolution, you'll keep owing annual fees, franchise taxes, and state reports for a business that no longer exists. We've seen people get hit with years of back fees for "zombie LLCs" they thought were closed.</p>

      <h3>Why You Can't Just Walk Away</h3>
      <p>Here's what happens if you abandon your LLC without dissolving it:</p>
      <ul>
        <li><strong>Ongoing Fees:</strong> State annual report fees and franchise taxes keep accumulating. Wyoming's $62/year becomes $620 after 10 years. Delaware's $300/year becomes $3,000.</li>
        <li><strong>Penalties:</strong> Late fees and penalties stack up on top of regular fees</li>
        <li><strong>Credit Impact:</strong> Some states report delinquent LLCs to credit bureaus</li>
        <li><strong>Legal Exposure:</strong> An un-dissolved LLC can still be sued, and you might not even know about it if you've moved on</li>
        <li><strong>Future Problems:</strong> Outstanding LLC obligations can surface during background checks, loan applications, or when forming new businesses</li>
      </ul>

      <h3>The Proper Dissolution Process</h3>
      <ol>
        <li><strong>Internal Resolution:</strong> Members vote to dissolve (documented in meeting minutes or written consent)</li>
        <li><strong>Settle Obligations:</strong> Pay off debts, close accounts, distribute remaining assets</li>
        <li><strong>Tax Clearance:</strong> File final tax returns, get tax clearance from state (required in some states)</li>
        <li><strong>File Articles of Dissolution:</strong> Submit official dissolution paperwork to the state</li>
        <li><strong>Notify IRS:</strong> Close your EIN account with the IRS</li>
        <li><strong>Cancel Permits & Licenses:</strong> Close out any business licenses or permits</li>
      </ol>

      <h3>What We Handle</h3>
      <ul>
        <li>Prepare and file Articles of Dissolution with the state</li>
        <li>Coordinate any required tax clearance documentation</li>
        <li>Terminate registered agent service</li>
        <li>Provide dissolution confirmation for your records</li>
        <li>Guide you on closing bank accounts and IRS notification</li>
      </ul>

      <h3>When Dissolution Makes Sense</h3>
      <ul>
        <li>You're no longer operating the business</li>
        <li>You've started a new LLC and don't need the old one</li>
        <li>The business has served its purpose (held a single project or property)</li>
        <li>Partnership dissolution - members going separate ways</li>
        <li>Business failed and you want clean closure</li>
      </ul>

      <h3>Alternative: Should You Keep It Dormant?</h3>
      <p>Some entrepreneurs prefer keeping their LLC dormant (inactive but still registered) rather than dissolving. This might make sense if annual fees are low (like Wyoming's $62) and you might use the LLC again in the future. We can advise on whether dissolution or dormancy makes more sense for your situation.</p>
    `,
    icon: FileX,
    image: "/images/services/dissolution.jpg",
    startingPrice: 149,
    category: "compliance" as ServiceCategory,
    popular: false,
    features: [
      "Articles of Dissolution preparation",
      "State filing & submission",
      "Tax clearance coordination",
      "Registered agent termination",
      "IRS closure guidance",
      "Dissolution confirmation",
    ],
    packages: [
      {
        name: "Standard",
        price: 149,
        description: "Complete dissolution service (+ state fees)",
        features: [
          "Articles of Dissolution",
          "State Filing",
          "Dissolution Certificate",
          "Closure Guidance",
        ],
        notIncluded: ["Tax Clearance Filing"],
      },
      {
        name: "Complete",
        price: 249,
        description: "With tax clearance assistance",
        features: [
          "Everything in Standard",
          "Tax Clearance Filing",
          "Final Return Guidance",
          "IRS EIN Closure Letter",
        ],
        notIncluded: [],
        popular: true,
      },
    ],
    faqs: [
      {
        question: "What happens to debts if I dissolve my LLC?",
        answer: "Dissolving your LLC doesn't erase debts. Before dissolution, you must settle all known obligations or make arrangements with creditors. If you dissolve with unpaid debts, creditors may be able to pursue members personally in some cases. Make sure debts are settled before filing for dissolution.",
      },
      {
        question: "Can I dissolve an LLC that's not in good standing?",
        answer: "In most states, yes - but you'll typically need to pay outstanding fees and penalties first to bring it into good standing before dissolution is accepted. Some states allow dissolution of non-compliant LLCs but may require back fees. We'll assess your situation and advise on the most cost-effective approach.",
      },
      {
        question: "How long does dissolution take?",
        answer: "The actual dissolution filing typically takes 1-2 weeks to process. However, if your state requires tax clearance, that can add several weeks depending on whether you have outstanding tax obligations to resolve.",
      },
      {
        question: "What's the difference between dissolution and administrative dissolution?",
        answer: "Voluntary dissolution is when you choose to close your LLC properly. Administrative dissolution is when the state forcibly closes your LLC for non-compliance (missed reports, unpaid fees). Administrative dissolution often comes with penalties and doesn't cleanly close your obligations. Always better to dissolve voluntarily.",
      },
      {
        question: "Do I need to cancel my EIN after dissolving?",
        answer: "You should notify the IRS that your LLC is closed, but the EIN itself is never 'cancelled' - it's permanently assigned. You'll send the IRS a letter requesting to close the EIN account. We provide guidance and a template letter as part of our service.",
      },
      {
        question: "Can I form a new LLC with the same name after dissolution?",
        answer: "Usually yes! Once your LLC is dissolved, the name becomes available again (after any state-specific waiting period, typically immediate to 120 days). You can then register a new LLC with that name. Some clients dissolve old LLCs specifically to re-register the name under a new entity.",
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
    shortDesc: "Make your US business documents valid internationally. Apostille certification is required for using LLC documents in 120+ countries for banking, contracts, and legal proceedings.",
    description: `
      <p>Planning to use your US business documents in another country? Most countries won't accept them without an apostille - an international certification that proves the document is authentic. Whether you're opening a foreign bank account, signing international contracts, or dealing with government agencies abroad, an apostille makes your US documents officially recognized.</p>

      <h3>What is an Apostille?</h3>
      <p>An apostille is a certificate issued by a US state authority (usually the Secretary of State) that authenticates the origin of a public document. It's recognized by all 120+ countries that are part of the Hague Apostille Convention.</p>
      <p>Think of it as a "super-notarization" for international use. Without it, foreign governments and institutions have no way to verify that your US document is legitimate.</p>

      <h3>When You Need an Apostille</h3>
      <ul>
        <li><strong>International Banking:</strong> Opening business accounts outside the US often requires apostilled LLC documents</li>
        <li><strong>Foreign Business Registration:</strong> Registering your US LLC to operate in another country</li>
        <li><strong>International Contracts:</strong> Some international partners require apostilled proof of your business existence</li>
        <li><strong>Legal Proceedings:</strong> Using US business documents in foreign courts or government proceedings</li>
        <li><strong>Real Estate:</strong> Buying or selling property abroad through your LLC</li>
        <li><strong>Government Filings:</strong> Submitting documents to foreign government agencies</li>
      </ul>

      <h3>Documents We Can Apostille</h3>
      <ul>
        <li><strong>Articles of Organization:</strong> Your LLC formation document</li>
        <li><strong>Certificate of Good Standing:</strong> Proof your LLC is active and compliant</li>
        <li><strong>Certificate of Formation:</strong> Official state acknowledgment of your LLC</li>
        <li><strong>Operating Agreement:</strong> Requires notarization first, then apostille</li>
        <li><strong>Amendment Certificates:</strong> Official name or structure changes</li>
        <li><strong>Corporate Resolutions:</strong> Board/member decisions (requires notarization)</li>
      </ul>

      <h3>The Apostille Process</h3>
      <ol>
        <li><strong>Document Review:</strong> We verify your document is apostille-eligible</li>
        <li><strong>Notarization (if needed):</strong> Some documents require notarization before apostille</li>
        <li><strong>State Submission:</strong> We submit to the appropriate Secretary of State</li>
        <li><strong>Apostille Issuance:</strong> State attaches the apostille certificate</li>
        <li><strong>Delivery:</strong> Physical document shipped to you via secure courier</li>
      </ol>

      <h3>Processing Time</h3>
      <p>Standard processing takes 5-10 business days depending on the state. Expedited service (where available) can reduce this to 1-3 days. International shipping typically adds 3-7 business days depending on destination.</p>

      <h3>Countries That Accept Apostilles</h3>
      <p>Over 120 countries accept apostilled documents, including all of Europe, Australia, India, UAE, Japan, South Korea, Brazil, Mexico, and many more. Notable exceptions include China, Canada, and Pakistan, which may require embassy legalization instead (a different process we can also assist with).</p>
    `,
    icon: Stamp,
    image: "/images/services/apostille.jpg",
    startingPrice: 99,
    category: "compliance" as ServiceCategory,
    popular: false,
    features: [
      "Secretary of State apostille",
      "Notarization included (if needed)",
      "All 50 states covered",
      "International courier shipping",
      "Tracking & insurance included",
      "Document verification",
    ],
    packages: [
      {
        name: "Standard",
        price: 99,
        description: "Per document, US delivery",
        features: [
          "Apostille Certificate",
          "State Processing",
          "Digital Copy",
          "US Shipping",
        ],
        notIncluded: ["International Shipping", "Rush Processing"],
      },
      {
        name: "International",
        price: 149,
        description: "Per document, global delivery",
        features: [
          "Everything in Standard",
          "DHL/FedEx International",
          "Full Tracking",
          "Shipping Insurance",
        ],
        notIncluded: [],
        popular: true,
      },
      {
        name: "Rush International",
        price: 199,
        description: "Expedited processing + global delivery",
        features: [
          "Everything in International",
          "Expedited State Processing",
          "Priority Handling",
          "Express Shipping",
        ],
        notIncluded: [],
      },
    ],
    faqs: [
      {
        question: "What's the difference between an apostille and notarization?",
        answer: "Notarization verifies signatures on a document - a notary confirms the person signing is who they claim to be. An apostille is a government certification that authenticates the document itself for international use. Some documents need both: first notarized, then apostilled.",
      },
      {
        question: "Does my country accept apostilles?",
        answer: "If your country is part of the Hague Apostille Convention (120+ countries), yes. This includes most of Europe, India, UAE, Australia, Japan, South Korea, and South America. Notable exceptions are China, Canada, and Pakistan, which require embassy legalization instead. Contact us and we'll verify for your specific country.",
      },
      {
        question: "Can I get an apostille on a copy of my document?",
        answer: "It depends on the state and document type. Some states apostille certified copies, others require the original document. In most cases, you'll need to obtain a new certified copy from the state (like a fresh Certificate of Good Standing) for apostille. We handle the entire process.",
      },
      {
        question: "How long is an apostilled document valid?",
        answer: "The apostille itself doesn't expire. However, the underlying document may have freshness requirements - for example, a Certificate of Good Standing apostilled today proves status as of today, not six months from now. Check with the requesting institution for their requirements.",
      },
      {
        question: "I need apostilles for multiple documents - is there a discount?",
        answer: "Yes! When processing multiple documents together, we can often reduce per-document costs since they're submitted and shipped together. Contact us with your full document list for a custom quote.",
      },
    ],
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
    shortDesc: "A real US street address for your business mail. Receive bank cards, Amazon correspondence, and important documents - all scanned and forwarded to you anywhere in the world.",
    description: `
      <p>Your US LLC needs a US address, but you live in Bangladesh, India, or somewhere else outside America. A virtual address solves this problem - you get a real street address in the US that receives your mail, scans it for you, and forwards physical items when needed.</p>

      <h3>Why You Need a Virtual US Address</h3>
      <ul>
        <li><strong>Receive Bank Cards & Documents:</strong> Your Mercury or Relay debit card needs to ship somewhere. Bank statements, tax documents, and important correspondence need a real address.</li>
        <li><strong>Amazon Seller Address:</strong> Amazon may send verification letters or important notices to your business address. You need to actually receive them.</li>
        <li><strong>Professional Presence:</strong> A US street address looks more professional than a foreign address on invoices, contracts, and your website.</li>
        <li><strong>Separate from Registered Agent:</strong> Your registered agent receives legal documents, but you shouldn't use that address for regular business mail. A virtual address handles everyday correspondence.</li>
        <li><strong>Package Receiving:</strong> Receive product samples, returned items, or business supplies at your US address.</li>
      </ul>

      <h3>What Makes Our Virtual Address Different</h3>
      <p>Not all virtual addresses work for business purposes. Some are flagged as "commercial mail receiving agencies" (CMRAs) and rejected by banks. Our addresses are:</p>
      <ul>
        <li><strong>Real Street Addresses:</strong> Not PO Boxes - actual physical locations</li>
        <li><strong>Bank-Friendly:</strong> Used by thousands of business owners for bank applications</li>
        <li><strong>Suite Numbers (Not PMB):</strong> Formatted as "Suite 101" not "PMB 101" - looks like a real office</li>
        <li><strong>Major Metro Locations:</strong> Addresses in business-friendly cities</li>
      </ul>

      <h3>How It Works</h3>
      <ol>
        <li><strong>Get Your Address:</strong> We assign you a real US street address with your own suite number</li>
        <li><strong>Mail Arrives:</strong> When mail arrives, we scan the envelope and notify you</li>
        <li><strong>You Decide:</strong> View the scan online. Choose to open & scan contents, forward physically, or shred</li>
        <li><strong>Content Scanning:</strong> We open the mail and scan the contents for you to view online</li>
        <li><strong>Forwarding:</strong> Need the physical document? We ship it to you anywhere in the world</li>
      </ol>

      <h3>Package Handling</h3>
      <p>We receive packages on your behalf. Small packages can be forwarded internationally. For larger items, we can consolidate multiple packages into one shipment to save on shipping costs.</p>

      <h3>What You Can Use This Address For</h3>
      <ul>
        <li>Business bank account correspondence</li>
        <li>Credit card and debit card shipping</li>
        <li>Amazon Seller Central address</li>
        <li>State business registrations</li>
        <li>IRS correspondence</li>
        <li>Business license applications</li>
        <li>Your website and marketing materials</li>
        <li>Supplier and vendor communication</li>
      </ul>
    `,
    icon: MapPin,
    image: "/images/services/virtual-address.jpg",
    startingPrice: 149,
    category: "compliance" as ServiceCategory,
    popular: false,
    features: [
      "Real US street address (not PO Box)",
      "Bank-friendly format (Suite #)",
      "Mail scanning & notification",
      "Online mailbox dashboard",
      "Package receiving",
      "International mail forwarding",
    ],
    packages: [
      {
        name: "Basic",
        price: 149,
        description: "Per year - Perfect for new LLCs",
        features: [
          "US Street Address",
          "Envelope Scanning",
          "Online Dashboard",
          "30 Mail Scans/month",
        ],
        notIncluded: ["Package Forwarding", "Check Deposit"],
      },
      {
        name: "Premium",
        price: 249,
        description: "Per year - Full mail management",
        features: [
          "Everything in Basic",
          "Unlimited Mail Scans",
          "Package Forwarding",
          "Check Deposit Service",
        ],
        notIncluded: [],
        popular: true,
      },
    ],
    faqs: [
      {
        question: "Is this address different from a registered agent address?",
        answer: "Yes! A registered agent address is specifically for receiving legal documents and state correspondence - it's a legal requirement. A virtual address is for your regular business mail: bank statements, credit cards, Amazon letters, vendor correspondence, etc. Most international LLC owners need both services.",
      },
      {
        question: "Can I use this address to open a bank account?",
        answer: "You can use this as your mailing address for bank correspondence (where they send cards and statements). However, most banks also require a personal residential address for KYC purposes. The virtual address works great for receiving your debit cards and bank mail.",
      },
      {
        question: "How quickly do you scan and notify me of new mail?",
        answer: "Mail received before 2 PM EST is typically scanned and uploaded the same business day. You'll receive an email notification whenever new mail arrives. Package notifications are sent within 2 hours of receipt.",
      },
      {
        question: "What happens if I receive a package?",
        answer: "We notify you immediately. You can then choose to: (1) Forward it to your international address, (2) Hold it for consolidation with other packages, or (3) Have us return it. Forwarding costs depend on package weight and destination.",
      },
      {
        question: "Can Amazon or banks tell it's a virtual address?",
        answer: "Our addresses use suite numbers (not PMB numbers) and are real street addresses at commercial buildings. They look and function like regular business addresses. Thousands of our clients use them successfully with Amazon and banks.",
      },
      {
        question: "What if I need to receive something urgently?",
        answer: "We offer express forwarding options. For urgent documents, we can scan and email content within hours, then ship physically via express courier (DHL/FedEx). Express shipping typically arrives within 3-5 business days internationally.",
      },
    ],
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
    shortDesc: "Unlock restricted Amazon categories and start selling high-profit products. We handle invoices, documentation, and applications for Grocery, Beauty, Toys, and more.",
    description: `
      <p>Amazon restricts certain categories to keep out low-quality sellers - but that also means less competition and higher profit margins for those who get approved. If you've found a profitable product only to see "You need approval to list in this category," we can help you get ungated.</p>

      <h3>Why Categories Are Restricted</h3>
      <p>Amazon gates categories for several reasons:</p>
      <ul>
        <li><strong>Customer Safety:</strong> Products like supplements, topicals, and baby items need quality controls</li>
        <li><strong>Brand Protection:</strong> Luxury goods and branded items require authenticity verification</li>
        <li><strong>Seasonal Demand:</strong> Toys get restricted before Q4 to prevent inexperienced sellers from ruining holiday inventory</li>
        <li><strong>Counterfeit Prevention:</strong> Categories with high counterfeit rates have stricter requirements</li>
      </ul>

      <h3>Most Requested Gated Categories (2025)</h3>
      <ul>
        <li><strong>Grocery & Gourmet Food:</strong> Growing rapidly - requires invoices from approved distributors</li>
        <li><strong>Health & Personal Care:</strong> One of the most profitable - needs proper documentation</li>
        <li><strong>Beauty:</strong> Huge market - requires invoices showing brand authorization</li>
        <li><strong>Topicals (Lotions, Creams):</strong> Within Beauty - additional requirements</li>
        <li><strong>Toys & Games:</strong> Restricted Q4, but approval lasts forever once obtained</li>
        <li><strong>Pet Supplies:</strong> Growing category - moderate requirements</li>
        <li><strong>Baby:</strong> Safety-focused - stricter documentation</li>
        <li><strong>Automotive:</strong> Parts need authenticity proof</li>
        <li><strong>Fine Jewelry:</strong> High-value - extensive verification</li>
      </ul>

      <h3>What's Required for Ungating?</h3>
      <p>Requirements vary by category, but typically include:</p>
      <ul>
        <li><strong>Professional Seller Account:</strong> Individual accounts can't get ungated in most categories</li>
        <li><strong>Invoices:</strong> Usually need 3 invoices from legitimate wholesalers/distributors showing 30+ units purchased</li>
        <li><strong>Product Images:</strong> Sometimes Amazon requests photos of actual inventory</li>
        <li><strong>Brand Letters:</strong> Some brands require authorization letters</li>
        <li><strong>Account Health:</strong> Good metrics and no policy violations help significantly</li>
      </ul>

      <h3>Our Ungating Process</h3>
      <ol>
        <li><strong>Category Assessment:</strong> We analyze current requirements for your target categories</li>
        <li><strong>Documentation Strategy:</strong> We identify what invoices/documents you need and from which suppliers</li>
        <li><strong>Invoice Guidance:</strong> We guide you on obtaining proper invoices that Amazon will accept</li>
        <li><strong>Application Preparation:</strong> We prepare your ungating application with all required elements</li>
        <li><strong>Submission & Follow-up:</strong> We submit and handle any back-and-forth with Amazon</li>
        <li><strong>Appeal (if needed):</strong> If initially denied, we prepare appeal documentation</li>
      </ol>

      <h3>Common Mistakes That Get Applications Denied</h3>
      <ul>
        <li>Invoices from non-approved suppliers or marketplaces (Amazon, eBay receipts don't count)</li>
        <li>Invoices with missing information (no address, no contact info)</li>
        <li>Product images that look like stock photos instead of actual inventory</li>
        <li>Quantity too low (Amazon wants to see you're a serious seller)</li>
        <li>Invoice dates too old (typically need to be within 180 days)</li>
      </ul>
    `,
    icon: Package,
    image: "/images/services/ungating.jpg",
    startingPrice: 149,
    category: "amazon" as ServiceCategory,
    popular: false,
    features: [
      "Category requirement analysis",
      "Invoice & documentation guidance",
      "Application preparation",
      "Submission handling",
      "Appeal support if denied",
      "Category-specific strategy",
    ],
    packages: [
      {
        name: "Single Category",
        price: 149,
        description: "One category ungating",
        features: [
          "Category Analysis",
          "Document Guidance",
          "Application Prep",
          "14-Day Support",
        ],
        notIncluded: ["Appeal Support"],
      },
      {
        name: "Multi-Category",
        price: 349,
        description: "Up to 3 categories - Best Value",
        features: [
          "3 Categories",
          "Priority Processing",
          "Appeal Support Included",
          "30-Day Support",
        ],
        notIncluded: [],
        popular: true,
      },
      {
        name: "Full Access",
        price: 599,
        description: "Up to 6 categories",
        features: [
          "6 Categories",
          "Dedicated Specialist",
          "Unlimited Appeals",
          "60-Day Support",
        ],
        notIncluded: [],
      },
    ],
    faqs: [
      {
        question: "What invoices does Amazon accept for ungating?",
        answer: "Amazon requires invoices from legitimate wholesalers or distributors (not retail receipts from Amazon, Walmart, etc.). Invoices must include supplier name/address/contact, your business name/address, itemized products with quantities (typically 30+ units), purchase date within 180 days, and must be on the supplier's letterhead or have their logo.",
      },
      {
        question: "How long does ungating take?",
        answer: "Once you have proper documentation, Amazon typically responds within 1-7 days. If approved, you can start listing immediately. If denied, we can appeal within 2-3 days. The whole process (including getting proper invoices) usually takes 2-4 weeks.",
      },
      {
        question: "What if I don't have invoices from approved suppliers?",
        answer: "We can guide you to suppliers whose invoices Amazon accepts. For some categories, we work with wholesale partners who provide invoices specifically for ungating purposes. This is a legitimate way to get proper documentation.",
      },
      {
        question: "Is ungating approval permanent?",
        answer: "Yes! Once you're approved for a category, it stays on your account permanently. You don't need to renew or reapply. That's why it's worth investing in proper ungating - it's a one-time barrier to a lifetime of selling opportunity.",
      },
      {
        question: "Can new seller accounts get ungated?",
        answer: "Yes, but some categories require account history (90+ days) or good performance metrics. We assess your account status and recommend which categories to target first. Often, starting with easier categories builds account credibility for harder ones.",
      },
      {
        question: "What's the difference between category ungating and brand ungating?",
        answer: "Category ungating lets you sell in an entire category (like Grocery or Beauty). Brand ungating lets you sell specific brands within categories you're already approved for. Some brands require separate approval even if you're category-approved. We handle both.",
      },
    ],
  },
  {
    slug: "product-listing-optimization",
    name: "Product Listing Optimization",
    shortDesc: "Turn browsers into buyers. We optimize your Amazon titles, bullets, descriptions, and backend keywords for higher rankings and better conversion rates.",
    description: `
      <p>Your product might be great, but if your listing doesn't show up in search or doesn't convince people to buy, it doesn't matter. Amazon SEO is different from Google - the algorithm cares about relevance AND sales velocity. We optimize both.</p>

      <h3>Why Listing Optimization Matters</h3>
      <ul>
        <li><strong>Visibility:</strong> 70% of Amazon shoppers never go past the first page of search results. If you're not ranking, you're invisible.</li>
        <li><strong>Conversion:</strong> The average Amazon conversion rate is 10-15%. Top listings convert at 20%+. That's double the sales from the same traffic.</li>
        <li><strong>PPC Efficiency:</strong> Better organic rankings mean lower ad costs. Why pay for clicks you could get free?</li>
        <li><strong>The Flywheel Effect:</strong> Better listings → More sales → Better rankings → Even more sales. It compounds.</li>
      </ul>

      <h3>What We Optimize</h3>

      <h4>Title Optimization</h4>
      <p>Your title is the most important ranking factor. We craft titles that:</p>
      <ul>
        <li>Include your primary keywords naturally (not stuffed)</li>
        <li>Follow Amazon's style guidelines for your category</li>
        <li>Communicate key benefits within the first 80 characters (mobile cutoff)</li>
        <li>Include brand name, size, quantity, and key differentiators</li>
      </ul>

      <h4>Bullet Points (Key Features)</h4>
      <p>Bullets sell your product. We write bullets that:</p>
      <ul>
        <li>Lead with benefits, support with features</li>
        <li>Include secondary keywords naturally</li>
        <li>Address common customer questions and objections</li>
        <li>Use formatting (CAPS for emphasis) strategically</li>
      </ul>

      <h4>Product Description</h4>
      <p>Often ignored but still valuable for:</p>
      <ul>
        <li>Additional keywords and long-tail phrases</li>
        <li>Storytelling and brand building</li>
        <li>Detailed specifications for technical products</li>
        <li>Cross-selling opportunities</li>
      </ul>

      <h4>Backend Search Terms</h4>
      <p>The hidden keywords customers never see but Amazon indexes:</p>
      <ul>
        <li>Synonyms and alternate spellings</li>
        <li>Common misspellings (yes, really)</li>
        <li>Spanish/other language terms (for US marketplace)</li>
        <li>Competitor brand names you can rank for</li>
      </ul>

      <h3>Our Process</h3>
      <ol>
        <li><strong>Keyword Research:</strong> We identify high-volume, relevant keywords using tools like Helium 10, Jungle Scout, and Amazon's own data</li>
        <li><strong>Competitor Analysis:</strong> We study top-ranking competitors to understand what's working</li>
        <li><strong>Content Creation:</strong> We write compelling copy that balances SEO with conversion</li>
        <li><strong>Implementation:</strong> We provide ready-to-upload content or implement directly</li>
        <li><strong>Tracking:</strong> We recommend tracking tools to monitor ranking improvements</li>
      </ol>

      <h3>Image Recommendations</h3>
      <p>While we don't create images, we provide detailed guidance on:</p>
      <ul>
        <li>Required main image specifications</li>
        <li>Recommended lifestyle and infographic images</li>
        <li>Competitor image analysis</li>
        <li>A+ Content image recommendations</li>
      </ul>
    `,
    icon: TrendingUp,
    image: "/images/services/listing-optimization.jpg",
    startingPrice: 149,
    category: "amazon" as ServiceCategory,
    popular: false,
    features: [
      "Deep keyword research",
      "Title optimization",
      "5 bullet points (key features)",
      "Product description",
      "Backend search terms",
      "Image recommendations",
    ],
    packages: [
      {
        name: "Single Listing",
        price: 149,
        description: "One product - Full optimization",
        features: [
          "Keyword Research",
          "Complete Listing Copy",
          "Backend Keywords",
          "1 Revision Round",
        ],
        notIncluded: ["Competitor Analysis"],
      },
      {
        name: "5-Pack",
        price: 549,
        description: "Five products - Most Popular",
        features: [
          "5 Full Optimizations",
          "Competitor Analysis",
          "Keyword Strategy Map",
          "Unlimited Revisions",
        ],
        notIncluded: [],
        popular: true,
      },
      {
        name: "10-Pack",
        price: 899,
        description: "Ten products - Best Value",
        features: [
          "10 Full Optimizations",
          "Category Strategy",
          "Priority Support",
          "30-Day Follow-up",
        ],
        notIncluded: [],
      },
    ],
    faqs: [
      {
        question: "How long until I see ranking improvements?",
        answer: "Amazon's algorithm typically takes 1-2 weeks to fully index and respond to listing changes. You may see initial movement within days, with full impact visible in 2-4 weeks. Results also depend on your sales velocity, reviews, and competition.",
      },
      {
        question: "Will you implement the changes or just provide the content?",
        answer: "Both options are available. We can provide optimized content for you to upload, or we can implement directly in your Seller Central account (requires temporary access). Most clients prefer we handle implementation to ensure everything is done correctly.",
      },
      {
        question: "What information do you need from me?",
        answer: "We need: (1) Your ASIN or product URL, (2) Any specific keywords you want to target, (3) Key product features and benefits, (4) Your target audience, and (5) Any brand guidelines or restrictions. A 15-minute kickoff call helps us understand your product and goals.",
      },
      {
        question: "Do you guarantee page 1 rankings?",
        answer: "We don't guarantee specific rankings because they depend on many factors outside listing optimization (reviews, price, competition, sales history). What we do guarantee is professionally optimized content following proven best practices that give you the best possible chance of ranking.",
      },
      {
        question: "Should I optimize listings before or after running PPC?",
        answer: "Before! Optimized listings convert better, which means your PPC spend is more efficient. Running ads to a poorly optimized listing wastes money. Optimize first, then advertise to maximize your ROI.",
      },
      {
        question: "How is this different from A+ Content?",
        answer: "Listing optimization covers your title, bullets, description, and backend keywords - the core elements every listing has. A+ Content (Enhanced Brand Content) is additional visual content below the description, available only to brand-registered sellers. We offer both services separately.",
      },
    ],
  },
  {
    slug: "a-plus-content",
    name: "A+ Content Creation",
    shortDesc: "Visual storytelling that sells. Transform your product page with professional A+ Content featuring comparison charts, lifestyle images, and brand story modules that boost conversions up to 10%.",
    description: `
      <p>A+ Content (formerly Enhanced Brand Content or EBC) replaces your plain text product description with a visually rich experience featuring images, comparison charts, and brand storytelling. Amazon's own data shows A+ Content increases conversions by 3-10% - that's significant when you're driving thousands of visitors.</p>

      <h3>What is A+ Content?</h3>
      <p>A+ Content appears below the bullet points and replaces the standard product description with a visual layout. It's exclusive to Brand Registry members and gives you space to:</p>
      <ul>
        <li>Show your product in action with lifestyle imagery</li>
        <li>Explain features with infographics and icons</li>
        <li>Compare product variations side-by-side</li>
        <li>Tell your brand story to build trust</li>
        <li>Address common questions visually</li>
      </ul>

      <h3>Why A+ Content Works</h3>
      <ul>
        <li><strong>Visual Processing:</strong> Humans process images 60,000x faster than text. A+ Content lets you communicate more, faster.</li>
        <li><strong>Mobile Dominance:</strong> Over 60% of Amazon shopping happens on mobile. A+ Content's visual format works better on small screens than walls of text.</li>
        <li><strong>Trust Building:</strong> Professional A+ Content signals "legitimate brand" - customers feel more confident buying.</li>
        <li><strong>Reduced Returns:</strong> Better product understanding means fewer "not what I expected" returns.</li>
        <li><strong>SEO Benefits:</strong> While A+ text isn't directly indexed, the improved conversion rate signals quality to Amazon's algorithm.</li>
      </ul>

      <h3>A+ Content Modules We Create</h3>
      <ul>
        <li><strong>Standard Image & Text:</strong> Product images with supporting text explanations</li>
        <li><strong>Comparison Charts:</strong> Compare your product variations or against competitors (without naming them)</li>
        <li><strong>Feature Highlights:</strong> Icon-based callouts of key product benefits</li>
        <li><strong>Brand Story:</strong> Tell your brand's origin, mission, and values</li>
        <li><strong>Technical Specifications:</strong> Detailed specs in an easy-to-scan format</li>
        <li><strong>FAQ Module:</strong> Pre-answer common customer questions</li>
      </ul>

      <h3>Our A+ Content Process</h3>
      <ol>
        <li><strong>Discovery Call:</strong> Understand your product, brand, and target customer</li>
        <li><strong>Competitor Analysis:</strong> Study what top competitors are doing in your category</li>
        <li><strong>Content Strategy:</strong> Plan which modules and messaging will be most effective</li>
        <li><strong>Design Creation:</strong> Our designers create custom graphics optimized for Amazon</li>
        <li><strong>Copy Writing:</strong> Compelling text that complements the visuals</li>
        <li><strong>Review & Revisions:</strong> You review, we refine until you're satisfied</li>
        <li><strong>Upload & Testing:</strong> We upload to Amazon and verify everything displays correctly</li>
      </ol>

      <h3>Premium A+ vs Standard A+</h3>
      <p>Amazon offers two tiers of A+ Content:</p>
      <ul>
        <li><strong>Basic A+ (What most sellers use):</strong> Limited module options, smaller images</li>
        <li><strong>Premium A+ (Previously A++ Content):</strong> Interactive modules, video, larger images - requires invitation or high sales volume</li>
      </ul>
      <p>We design for both tiers based on what your account has access to.</p>
    `,
    icon: Sparkles,
    image: "/images/services/a-plus-content.jpg",
    startingPrice: 199,
    category: "amazon" as ServiceCategory,
    popular: false,
    features: [
      "Professional graphic design",
      "Custom images & infographics",
      "Comparison charts",
      "Brand story module",
      "Mobile-optimized layout",
      "Upload & implementation",
    ],
    packages: [
      {
        name: "Standard",
        price: 199,
        description: "Essential A+ Content",
        features: [
          "5 Content Modules",
          "Template-Based Design",
          "Stock Image Enhancement",
          "1 Revision Round",
        ],
        notIncluded: ["Custom Graphics", "Brand Story"],
      },
      {
        name: "Premium",
        price: 349,
        description: "Full A+ experience - Most Popular",
        features: [
          "7 Content Modules",
          "Custom Graphic Design",
          "Brand Story Module",
          "Unlimited Revisions",
        ],
        notIncluded: [],
        popular: true,
      },
      {
        name: "Premium Plus",
        price: 549,
        description: "Complete brand experience",
        features: [
          "All Available Modules",
          "Premium Custom Graphics",
          "Video Integration (if eligible)",
          "A/B Testing Strategy",
        ],
        notIncluded: [],
      },
    ],
    faqs: [
      {
        question: "Do I need Brand Registry for A+ Content?",
        answer: "Yes, A+ Content is exclusively available to sellers enrolled in Amazon Brand Registry. If you don't have Brand Registry, we can help you get enrolled (you'll need a trademark - registered or pending).",
      },
      {
        question: "How much does A+ Content increase sales?",
        answer: "Amazon reports that A+ Content increases conversion rates by 3-10% on average. Results vary by product and category. Even a 5% conversion improvement can significantly impact your sales and organic ranking over time.",
      },
      {
        question: "What images do I need to provide?",
        answer: "Ideally, high-resolution product photos (at least 1500x1500 pixels), lifestyle images showing the product in use, and any brand assets (logo, brand colors). If you don't have professional photos, we can work with what you have or recommend photography services.",
      },
      {
        question: "How long does A+ Content creation take?",
        answer: "Standard projects take 5-7 business days from kickoff to delivery. Premium projects with custom graphics take 7-10 business days. Rush service is available for urgent needs.",
      },
      {
        question: "Can I use A+ Content on all my listings?",
        answer: "Yes! Once you have A+ Content created, you can apply it to any ASIN within your brand. Many sellers create a brand template and apply it across their entire catalog with minor product-specific modifications.",
      },
      {
        question: "Does A+ Content help with Amazon SEO?",
        answer: "The text in A+ Content isn't directly indexed by Amazon's search algorithm. However, the improved conversion rate that A+ Content provides does signal quality to Amazon, which can indirectly boost your organic ranking. The real value is in converting more of your existing traffic.",
      },
    ],
  },
  {
    slug: "ppc-campaign-setup",
    name: "PPC Campaign Setup",
    shortDesc: "Stop wasting money on Amazon ads. We set up properly structured PPC campaigns with researched keywords, strategic bids, and negative keyword lists that actually convert.",
    description: `
      <p>Amazon PPC can either drain your budget or fuel your growth - the difference is in the setup. Most sellers launch campaigns with Amazon's "automatic" settings and wonder why they're spending $30 to sell a $25 product. We build campaigns designed for profitability from day one.</p>

      <h3>Why PPC Setup Matters</h3>
      <ul>
        <li><strong>New Product Visibility:</strong> New products have no sales history, so they don't rank organically. PPC is the only way to get initial visibility and sales.</li>
        <li><strong>The Amazon Flywheel:</strong> PPC sales boost your organic ranking. Better ranking = more organic sales = even better ranking. It compounds.</li>
        <li><strong>Competitive Defense:</strong> If you're not advertising, your competitors are showing up on YOUR product page via Sponsored Display ads.</li>
        <li><strong>Data Collection:</strong> PPC generates valuable data about which keywords convert - use this to optimize your listings.</li>
      </ul>

      <h3>Campaign Types We Build</h3>

      <h4>Sponsored Products (The Foundation)</h4>
      <p>The most important campaign type for most sellers:</p>
      <ul>
        <li><strong>Automatic Campaigns:</strong> Let Amazon find keywords (we use these for discovery)</li>
        <li><strong>Manual Keyword Campaigns:</strong> Target specific keywords you choose (where the money is made)</li>
        <li><strong>ASIN Targeting:</strong> Show your ads on competitor product pages</li>
      </ul>

      <h4>Sponsored Brands (Brand Registry Required)</h4>
      <p>Banner ads at the top of search results:</p>
      <ul>
        <li>Feature your logo and multiple products</li>
        <li>Drive traffic to your Amazon Store</li>
        <li>Higher click-through rates than Sponsored Products</li>
      </ul>

      <h4>Sponsored Display</h4>
      <p>Retargeting and audience-based advertising:</p>
      <ul>
        <li>Target shoppers who viewed your products</li>
        <li>Target shoppers who viewed similar products</li>
        <li>Reach audiences on and off Amazon</li>
      </ul>

      <h3>Our PPC Setup Process</h3>
      <ol>
        <li><strong>Product & Market Analysis:</strong> Understand your margins, competition, and realistic ACoS targets</li>
        <li><strong>Keyword Research:</strong> Deep dive into high-intent keywords using Helium 10, Amazon Brand Analytics, and competitor research</li>
        <li><strong>Campaign Architecture:</strong> Build a logical structure (separate campaigns by match type, product, goal)</li>
        <li><strong>Bid Strategy:</strong> Set bids based on keyword value, competition, and your target ACoS</li>
        <li><strong>Negative Keywords:</strong> Block irrelevant searches from wasting budget from the start</li>
        <li><strong>Launch & Monitor:</strong> Implement campaigns and track initial performance</li>
      </ol>

      <h3>What "Good" PPC Looks Like (2025 Benchmarks)</h3>
      <ul>
        <li><strong>ACoS (Advertising Cost of Sale):</strong> 15-30% for established products, 40-60% acceptable for launches</li>
        <li><strong>TACoS (Total ACoS):</strong> Should decrease over time as organic sales increase</li>
        <li><strong>Click-Through Rate:</strong> 0.3-0.5% average, 0.5%+ is excellent</li>
        <li><strong>Conversion Rate:</strong> Should match or exceed your organic conversion rate</li>
      </ul>

      <h3>What We Don't Do (And Why)</h3>
      <p>We don't promise overnight success or guaranteed rankings. Amazon PPC is competitive and requires realistic expectations:</p>
      <ul>
        <li>New products need 2-4 weeks to gather enough data for optimization</li>
        <li>Some niches have high CPCs - we can't change market dynamics</li>
        <li>PPC can't fix a bad product or listing - those need to be addressed first</li>
      </ul>
    `,
    icon: Target,
    image: "/images/services/ppc-setup.jpg",
    startingPrice: 249,
    category: "amazon" as ServiceCategory,
    popular: false,
    features: [
      "Comprehensive keyword research",
      "Structured campaign architecture",
      "All campaign types setup",
      "Strategic bid management",
      "Negative keyword lists",
      "Performance tracking setup",
    ],
    packages: [
      {
        name: "Starter",
        price: 249,
        description: "Foundation campaigns for 1-3 products",
        features: [
          "3 Campaign Setup",
          "Keyword Research",
          "Negative Keywords",
          "Setup Guide & Training",
        ],
        notIncluded: ["Ongoing Management", "Sponsored Brands"],
      },
      {
        name: "Pro",
        price: 449,
        description: "Complete PPC foundation - Most Popular",
        features: [
          "10 Campaigns",
          "All Ad Types",
          "2-Week Optimization",
          "Weekly Performance Reports",
        ],
        notIncluded: ["Ongoing Management"],
        popular: true,
      },
      {
        name: "Launch",
        price: 699,
        description: "Full launch support with management",
        features: [
          "Unlimited Campaigns",
          "30-Day Management",
          "Daily Bid Optimization",
          "Bi-Weekly Strategy Calls",
        ],
        notIncluded: [],
      },
    ],
    faqs: [
      {
        question: "How much should I budget for Amazon PPC?",
        answer: "For new products, we recommend $30-50 per day per product during launch (first 4-8 weeks). Established products can often maintain visibility with $15-30/day. Your actual budget should be based on your profit margins and target ACoS - we help calculate this during setup.",
      },
      {
        question: "What's a good ACoS for my campaigns?",
        answer: "A 'good' ACoS depends on your profit margins. If your profit margin is 30%, an ACoS under 30% means you're profitable on ad sales. For launches, higher ACoS (even 50-70%) can be acceptable to drive initial sales and rankings. We help you understand your break-even ACoS.",
      },
      {
        question: "Do you provide ongoing management or just setup?",
        answer: "We offer both. Starter and Pro packages focus on setup and training so you can manage campaigns yourself. Our Launch package includes 30 days of active management. For ongoing management beyond that, we offer monthly management plans separately.",
      },
      {
        question: "How long until I see results from PPC?",
        answer: "You'll see impressions and clicks within hours of launch. However, meaningful data requires 2-4 weeks of running campaigns. Real optimization happens after we have enough conversion data to make informed decisions. Don't panic in week one - PPC is a medium-term strategy.",
      },
      {
        question: "Should I run PPC on a brand new product?",
        answer: "Yes, but with proper expectations. New products need PPC for initial visibility, but they'll have lower conversion rates until they get reviews. We structure new product campaigns differently - focusing on relevant, buyer-intent keywords with controlled budgets until the listing gains traction.",
      },
      {
        question: "What's the difference between automatic and manual campaigns?",
        answer: "Automatic campaigns let Amazon decide when to show your ads based on your listing content - good for keyword discovery but less control. Manual campaigns target specific keywords you choose - more control and typically better ROI once you know which keywords work. We use both strategically.",
      },
    ],
  },
  {
    slug: "account-reinstatement",
    name: "Account Reinstatement",
    shortDesc: "Suspended by Amazon? We've helped hundreds of sellers get reinstated. Professional Plan of Action writing with proven templates that Amazon's team responds to.",
    description: `
      <p>Waking up to an Amazon suspension email is terrifying. Your income stops, your inventory is stranded, and you don't know what you did wrong. Worse, sending the wrong appeal can make things worse. We've successfully reinstated hundreds of accounts - we know what Amazon wants to see.</p>

      <h3>Common Suspension Types We Handle</h3>

      <h4>Inauthentic Item Suspensions</h4>
      <p>The most common suspension for new sellers. Amazon believes (rightly or wrongly) that your products aren't genuine. We help you:</p>
      <ul>
        <li>Understand what triggered the complaint</li>
        <li>Gather proper documentation proving authenticity</li>
        <li>Write appeals that address Amazon's specific concerns</li>
      </ul>

      <h4>Performance-Based Suspensions</h4>
      <p>Order defect rate, late shipments, or cancellation rate too high? We help you:</p>
      <ul>
        <li>Identify the root causes of performance issues</li>
        <li>Create concrete action plans for improvement</li>
        <li>Present data showing you can meet Amazon's standards</li>
      </ul>

      <h4>Policy Violation Suspensions</h4>
      <p>Listing issues, restricted product violations, review manipulation, or other policy breaches:</p>
      <ul>
        <li>Determine exactly which policy was violated</li>
        <li>Address the violation directly with corrective actions</li>
        <li>Demonstrate understanding of Amazon's policies going forward</li>
      </ul>

      <h4>Linked Account Issues</h4>
      <p>Amazon thinks you're connected to another suspended account. Tricky but solvable:</p>
      <ul>
        <li>Identify how accounts may have been linked (shared IP, address, payment method)</li>
        <li>Prove your account is legitimately separate</li>
        <li>Navigate Amazon's verification requirements</li>
      </ul>

      <h4>Verification Failures</h4>
      <p>Failed identity verification, video call issues, or document rejection:</p>
      <ul>
        <li>Understand why verification failed</li>
        <li>Prepare proper documentation that meets Amazon's standards</li>
        <li>Guide you through re-verification process</li>
      </ul>

      <h3>What Makes a Successful Appeal</h3>
      <p>Amazon's Seller Performance team reviews thousands of appeals daily. Successful appeals share these traits:</p>
      <ul>
        <li><strong>Acknowledgment:</strong> Accept responsibility (even if you disagree)</li>
        <li><strong>Root Cause:</strong> Clearly identify WHY the problem happened</li>
        <li><strong>Immediate Actions:</strong> What you've already done to fix it</li>
        <li><strong>Preventive Measures:</strong> How you'll prevent it from happening again</li>
        <li><strong>Supporting Documentation:</strong> Invoices, photos, or evidence when required</li>
      </ul>

      <h3>Our Reinstatement Process</h3>
      <ol>
        <li><strong>Account Analysis:</strong> We review your suspension notice, account health, and history to understand exactly what went wrong</li>
        <li><strong>Document Collection:</strong> We identify what documentation is needed and help you gather it</li>
        <li><strong>POA Writing:</strong> We write a professional Plan of Action using proven templates and language</li>
        <li><strong>Submission:</strong> We submit through the proper channels (Seller Central, Appeal form, or escalation)</li>
        <li><strong>Follow-up:</strong> We monitor response and handle any additional appeals needed</li>
      </ol>

      <h3>Realistic Expectations</h3>
      <p>We're honest about reinstatement:</p>
      <ul>
        <li>Most accounts CAN be reinstated with the right approach</li>
        <li>Some violations (black hat tactics, repeated offenses) have lower success rates</li>
        <li>Amazon's timeline is 1-3 days per response, but complex cases take longer</li>
        <li>First appeal is most important - bad appeals can make reinstatement harder</li>
      </ul>
    `,
    icon: AlertTriangle,
    image: "/images/services/reinstatement.jpg",
    startingPrice: 399,
    category: "amazon" as ServiceCategory,
    popular: false,
    features: [
      "Detailed account analysis",
      "Professional POA writing",
      "Document preparation guidance",
      "Appeal submission",
      "Follow-up appeals included",
      "Prevention recommendations",
    ],
    packages: [
      {
        name: "Standard",
        price: 399,
        description: "Most suspension types",
        features: [
          "Account Analysis",
          "Plan of Action (POA)",
          "1 Appeal Round",
          "7-Day Support",
        ],
        notIncluded: ["Multiple Appeals", "Phone Consultation"],
      },
      {
        name: "Premium",
        price: 699,
        description: "Complex suspensions - Most Popular",
        features: [
          "Everything in Standard",
          "Up to 3 Appeal Rounds",
          "30-Day Support",
          "Prevention Strategy Session",
        ],
        notIncluded: [],
        popular: true,
      },
      {
        name: "Emergency",
        price: 999,
        description: "Priority handling for urgent cases",
        features: [
          "Same-Day Analysis",
          "Unlimited Appeals",
          "Dedicated Case Manager",
          "60-Day Support + Escalation",
        ],
        notIncluded: [],
      },
    ],
    faqs: [
      {
        question: "How long does reinstatement typically take?",
        answer: "Amazon typically responds to appeals within 1-3 business days. Simple cases (first offense, clear documentation) often resolve in 1-2 weeks. Complex cases (linked accounts, repeated violations) can take 3-6 weeks. Emergency cases get our fastest turnaround on POA preparation.",
      },
      {
        question: "Can you guarantee my account will be reinstated?",
        answer: "No one can guarantee reinstatement - anyone who promises 100% success is lying. However, our success rate is over 85% across all suspension types. Some cases (serious policy violations, repeat offenders, black hat tactics) have lower success rates regardless of how good the appeal is.",
      },
      {
        question: "Should I submit an appeal before contacting you?",
        answer: "If possible, NO. Your first appeal is the most important one. A bad first appeal can make reinstatement harder. If you've already submitted appeals and been denied, we can still help, but the case becomes more complex. Contact us before your first submission if you can.",
      },
      {
        question: "What documentation do I need to provide?",
        answer: "It depends on your suspension type. Inauthentic claims need invoices from authorized suppliers. Performance issues need operational improvement evidence. We'll tell you exactly what's needed after analyzing your case - don't send Amazon random documents hoping something works.",
      },
      {
        question: "Why did Amazon suspend my account with no warning?",
        answer: "Amazon doesn't always give warnings, especially for what they consider serious violations. Sometimes suspensions are triggered by competitor attacks, customer complaints, or automated systems. We help determine the actual cause and address it properly.",
      },
      {
        question: "What if my appeal gets rejected?",
        answer: "Rejection isn't the end. Our Premium and Emergency packages include multiple appeal rounds. We analyze Amazon's response, strengthen the POA, address their specific concerns, and resubmit. Many accounts are reinstated on second or third appeal with the right adjustments.",
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
    shortDesc: "Clean books, stress-free tax season. We categorize transactions, reconcile accounts, and prepare monthly financial statements - so you know exactly where your business stands.",
    description: `
      <p>Running an Amazon store or e-commerce business from abroad while trying to keep your books straight in a foreign tax system? It's a recipe for chaos. Our bookkeeping service handles the numbers so you can focus on growing your business - and when tax season comes, you're already prepared.</p>

      <h3>Why Professional Bookkeeping Matters</h3>
      <ul>
        <li><strong>Tax Compliance:</strong> The IRS doesn't care that you're based in Bangladesh. If you have a US LLC, you have US reporting obligations. Proper books make tax filing straightforward instead of a scramble.</li>
        <li><strong>Business Decisions:</strong> Are you actually profitable? Which products make money? What are your real margins? Without organized books, you're guessing.</li>
        <li><strong>Banking Requirements:</strong> Banks and lenders want to see financial statements. Messy books = no business loans.</li>
        <li><strong>Peace of Mind:</strong> Knowing your finances are handled properly lets you focus on what you're good at - building your business.</li>
      </ul>

      <h3>What Our Bookkeeping Includes</h3>

      <h4>Monthly Transaction Processing</h4>
      <ul>
        <li>Import transactions from all connected accounts (bank, PayPal, Stripe, Amazon)</li>
        <li>Categorize each transaction to the proper expense category</li>
        <li>Match deposits to income sources</li>
        <li>Flag unusual or unclear transactions for your review</li>
      </ul>

      <h4>Bank & Account Reconciliation</h4>
      <ul>
        <li>Ensure every transaction in your books matches your bank statements</li>
        <li>Identify and correct discrepancies</li>
        <li>Reconcile PayPal, Stripe, and payment processor accounts</li>
        <li>Track Amazon deposits against Seller Central data</li>
      </ul>

      <h4>Financial Statements</h4>
      <ul>
        <li><strong>Profit & Loss (Income Statement):</strong> See your revenue, expenses, and net profit</li>
        <li><strong>Balance Sheet:</strong> Snapshot of assets, liabilities, and equity</li>
        <li><strong>Cash Flow Statement:</strong> Where your money is coming from and going to</li>
      </ul>

      <h4>E-Commerce Specific Features</h4>
      <ul>
        <li>Amazon settlement report reconciliation</li>
        <li>FBA fee tracking and categorization</li>
        <li>Inventory cost tracking</li>
        <li>Multi-currency transaction handling</li>
        <li>Sales tax liability tracking</li>
      </ul>

      <h3>Tools We Support</h3>
      <p>We work with major accounting platforms:</p>
      <ul>
        <li><strong>QuickBooks Online:</strong> Most popular for US businesses</li>
        <li><strong>Xero:</strong> Great for international businesses</li>
        <li><strong>Wave:</strong> Free option for simpler businesses</li>
      </ul>
      <p>Don't have accounting software yet? We'll help you choose and set up the right platform.</p>
    `,
    icon: BookOpen,
    image: "/images/services/bookkeeping.jpg",
    startingPrice: 149,
    category: "tax-finance" as ServiceCategory,
    popular: false,
    features: [
      "Monthly transaction categorization",
      "Bank & account reconciliation",
      "Profit & Loss statement",
      "Balance sheet preparation",
      "Amazon seller report integration",
      "Year-end tax readiness",
    ],
    packages: [
      {
        name: "Starter",
        price: 149,
        description: "Per month - Up to 100 transactions",
        features: [
          "100 Monthly Transactions",
          "Bank Reconciliation",
          "Monthly P&L Report",
          "Email Support",
        ],
        notIncluded: ["Balance Sheet", "Dedicated Accountant"],
      },
      {
        name: "Growth",
        price: 299,
        description: "Per month - Up to 300 transactions",
        features: [
          "300 Monthly Transactions",
          "Full Financial Statements",
          "Amazon Report Integration",
          "Monthly Review Call",
        ],
        notIncluded: [],
        popular: true,
      },
      {
        name: "Scale",
        price: 499,
        description: "Per month - Unlimited transactions",
        features: [
          "Unlimited Transactions",
          "Dedicated Accountant",
          "Inventory Tracking",
          "Weekly Check-ins",
        ],
        notIncluded: [],
      },
    ],
    faqs: [
      {
        question: "What accounting software do you use?",
        answer: "We primarily work with QuickBooks Online and Xero. Both are cloud-based, so you can access your books anytime from anywhere. If you don't have accounting software yet, we recommend QuickBooks Online for most US-focused businesses.",
      },
      {
        question: "How do you handle Amazon seller accounts?",
        answer: "We integrate with your Amazon Seller Central to pull settlement reports. This lets us accurately track your Amazon revenue, fees, and deposits. We reconcile Amazon deposits to your bank account and categorize all the various fees properly.",
      },
      {
        question: "What if I have months of messy or missing bookkeeping?",
        answer: "We offer catch-up bookkeeping services. We'll reconstruct your books from bank statements, Amazon reports, and any documentation you have. Pricing depends on how far back we need to go and transaction volume. Contact us for a catch-up quote.",
      },
      {
        question: "Do you handle sales tax?",
        answer: "We track sales tax liability as part of bookkeeping. For actual sales tax filing (submitting returns to state tax authorities), that's a separate service. Many states have economic nexus laws that may require you to collect and remit sales tax.",
      },
      {
        question: "Will my books be ready for tax filing?",
        answer: "Yes! That's a core goal of our service. By year-end, your books will be reconciled, categorized, and ready to hand off to your tax preparer. We provide tax-ready reports and can communicate directly with your CPA if needed.",
      },
    ],
  },
  {
    slug: "tax-filing",
    name: "Tax Filing Service",
    shortDesc: "US LLC tax preparation for international owners. We handle Schedule C, Form 1065, state filings, and FBAR requirements. Stay compliant without understanding the US tax code yourself.",
    description: `
      <p>US tax law is complicated even for Americans - for international LLC owners, it's a maze of confusing forms, deadlines, and requirements. We prepare and file your LLC tax returns correctly, so you stay compliant without having to become a US tax expert.</p>

      <h3>Understanding LLC Taxation for Non-US Owners</h3>
      <p>Here's what most international entrepreneurs don't realize: how your LLC is taxed depends on several factors:</p>
      <ul>
        <li><strong>Single-Member LLC (Foreign Owned):</strong> Often treated as a "disregarded entity" for US tax purposes. If you have no US-source income, you may have minimal US tax obligations - but you likely still have informational filing requirements.</li>
        <li><strong>Multi-Member LLC:</strong> Taxed as a partnership by default. Requires Form 1065 and K-1s for each member, even if the members are all non-US persons.</li>
        <li><strong>S-Corp Election:</strong> Some LLCs elect S-Corp status for tax savings (not available for all international owners).</li>
      </ul>

      <h3>Key Tax Forms We Handle</h3>
      <ul>
        <li><strong>Form 5472:</strong> Required for foreign-owned single-member LLCs - reports transactions with foreign owners</li>
        <li><strong>Form 1120:</strong> Pro forma return filed with Form 5472 for foreign-owned LLCs</li>
        <li><strong>Form 1065:</strong> Partnership return for multi-member LLCs</li>
        <li><strong>Schedule K-1:</strong> Individual partner income allocation</li>
        <li><strong>Form 1040-NR:</strong> Non-resident individual return (if you have US-source income)</li>
        <li><strong>State Returns:</strong> Many states have separate filing requirements</li>
      </ul>

      <h3>Important Deadlines</h3>
      <ul>
        <li><strong>March 15:</strong> Partnership returns (Form 1065) due</li>
        <li><strong>April 15:</strong> Individual returns and Form 5472/1120 for single-member LLCs due</li>
        <li><strong>State Deadlines:</strong> Vary by state - we track all applicable deadlines</li>
      </ul>
      <p>Extensions are available, but we recommend filing on time to avoid potential issues with banks and compliance records.</p>

      <h3>What We Don't Do (And Why)</h3>
      <p>We're upfront about boundaries:</p>
      <ul>
        <li><strong>Not Tax Advice:</strong> We prepare returns based on your situation, but we're not providing legal tax advice. For complex tax planning, we recommend consulting a CPA or tax attorney.</li>
        <li><strong>Not FBAR Filing:</strong> If you have US bank accounts exceeding $10,000, you may need to file FBAR separately. We can refer you to specialists.</li>
        <li><strong>Not Audit Representation:</strong> If the IRS audits your return, you'll need a CPA or enrolled agent for representation. We can provide documents and explanations.</li>
      </ul>

      <h3>Our Tax Preparation Process</h3>
      <ol>
        <li><strong>Intake:</strong> You complete our tax questionnaire and upload financial documents</li>
        <li><strong>Review:</strong> We review your books and identify all filing requirements</li>
        <li><strong>Preparation:</strong> We prepare all required federal and state returns</li>
        <li><strong>Review Call:</strong> We walk through your returns and answer questions</li>
        <li><strong>E-Filing:</strong> We electronically file with the IRS and applicable states</li>
        <li><strong>Confirmation:</strong> You receive copies of all filed returns for your records</li>
      </ol>

      <h3>Common International Owner Situations</h3>
      <ul>
        <li><strong>Amazon Sellers:</strong> Amazon income is typically US-source, which creates filing obligations</li>
        <li><strong>Service Businesses:</strong> If work is performed outside the US for non-US clients, may not be US-source income</li>
        <li><strong>Dropshipping:</strong> Complex - depends on where value is created and customers are located</li>
      </ul>
      <p>We assess your specific situation during the intake process and advise on requirements.</p>
    `,
    icon: Calculator,
    image: "/images/services/tax-filing.jpg",
    startingPrice: 349,
    category: "tax-finance" as ServiceCategory,
    popular: false,
    features: [
      "Federal tax return preparation",
      "Form 5472 for foreign owners",
      "State tax filing (where required)",
      "E-filing with IRS",
      "Year-end review call",
      "IRS correspondence support",
    ],
    packages: [
      {
        name: "Basic",
        price: 349,
        description: "Single-member foreign-owned LLC",
        features: [
          "Form 5472 + 1120 Pro Forma",
          "Federal E-Filing",
          "Document Checklist",
          "Email Support",
        ],
        notIncluded: ["State Filing", "Phone Consultation"],
      },
      {
        name: "Standard",
        price: 549,
        description: "Multi-member LLC or with state filing",
        features: [
          "Form 1065 Partnership Return",
          "K-1s for All Members",
          "Federal + 1 State",
          "Tax Review Call",
        ],
        notIncluded: [],
        popular: true,
      },
      {
        name: "Complete",
        price: 799,
        description: "Complex situations & multi-state",
        features: [
          "All Required Returns",
          "Multi-State Filing",
          "Quarterly Estimate Calculations",
          "Year-Round Email Support",
        ],
        notIncluded: [],
      },
    ],
    faqs: [
      {
        question: "Do I need to file US taxes as a foreign LLC owner?",
        answer: "Almost always yes - at minimum, foreign-owned single-member LLCs must file Form 5472 (reporting transactions with foreign owners) with a pro forma Form 1120. Failure to file can result in a $25,000 penalty per year. Even if you owe no US taxes, the filing requirement exists.",
      },
      {
        question: "What is Form 5472 and why is it required?",
        answer: "Form 5472 reports 'reportable transactions' between a US LLC and its foreign owner. This includes capital contributions, distributions, and any payments between you and your LLC. It's filed with a pro forma Form 1120. The IRS uses this for information gathering, not necessarily taxation.",
      },
      {
        question: "When are LLC tax returns due?",
        answer: "For foreign-owned single-member LLCs: April 15th (Form 5472/1120). For multi-member LLCs: March 15th (Form 1065). Extensions are available, but filing on time is better for compliance records. We handle extension requests if needed.",
      },
      {
        question: "Do I owe US taxes on my Amazon income?",
        answer: "Amazon income from US customers is generally considered US-source income. However, for single-member LLCs owned by non-residents with no US presence beyond the LLC, tax treaty benefits may reduce or eliminate US tax liability. We assess your specific situation during preparation.",
      },
      {
        question: "What documents do I need to provide?",
        answer: "We'll need: your LLC formation documents, EIN confirmation, financial statements or bookkeeping records, Amazon settlement reports (if applicable), bank statements, and any other income/expense documentation. We provide a detailed checklist during onboarding.",
      },
      {
        question: "What happens if I haven't filed previous years?",
        answer: "Missing past filings is serious but fixable. We can prepare back returns and help you become compliant. The IRS penalty for missing Form 5472 is $25,000 per return, but voluntary disclosure and compliance can sometimes reduce penalties. The key is to fix it before the IRS contacts you.",
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
