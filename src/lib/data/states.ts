export interface StateBasic {
  code: string;
  name: string;
  fee: number;
  annualFee: number;
  processingTime: string;
  popular: boolean;
}

export interface StateLandingPage extends StateBasic {
  slug: string;
  tagline: string;
  description: string;
  benefits: Array<{ title: string; description: string }>;
  requirements: string[];
  faqs: Array<{ question: string; answer: string }>;
  metaTitle: string;
  metaDescription: string;
}

export const states: StateBasic[] = [
  { code: "WY", name: "Wyoming", fee: 100, annualFee: 60, processingTime: "1-2 days", popular: true },
  { code: "DE", name: "Delaware", fee: 140, annualFee: 300, processingTime: "2-3 days", popular: true },
  { code: "NM", name: "New Mexico", fee: 50, annualFee: 0, processingTime: "1-2 days", popular: true },
  { code: "TX", name: "Texas", fee: 300, annualFee: 0, processingTime: "3-5 days", popular: false },
  { code: "FL", name: "Florida", fee: 125, annualFee: 138, processingTime: "2-3 days", popular: false },
  { code: "NV", name: "Nevada", fee: 425, annualFee: 350, processingTime: "2-3 days", popular: false },
  { code: "CA", name: "California", fee: 70, annualFee: 800, processingTime: "3-5 days", popular: false },
  { code: "NY", name: "New York", fee: 200, annualFee: 25, processingTime: "5-7 days", popular: false },
  { code: "WA", name: "Washington", fee: 200, annualFee: 60, processingTime: "3-5 days", popular: false },
  { code: "CO", name: "Colorado", fee: 50, annualFee: 10, processingTime: "2-3 days", popular: false },
];

export const stateLandingPages: StateLandingPage[] = [
  {
    code: "WY",
    name: "Wyoming",
    slug: "wyoming",
    fee: 100,
    annualFee: 60,
    processingTime: "3-5 business days",
    popular: true,
    tagline: "The Most Business-Friendly State in America",
    description: `Wyoming is consistently ranked as the #1 state for LLC formation, especially for international entrepreneurs and small business owners. With no state income tax, strong privacy protections, and the lowest annual fees in the country ($60/year), Wyoming offers the perfect environment for your business to thrive.

Wyoming was the first state to create the LLC business structure in 1977, and it has continued to refine its business laws to be the most favorable for business owners.`,
    benefits: [
      { title: "No State Income Tax", description: "Wyoming has no personal or corporate income tax, allowing you to keep more of your profits." },
      { title: "Strong Privacy Protection", description: "Wyoming doesn't require member names to be listed publicly, protecting your identity." },
      { title: "Lowest Annual Fees", description: "At just $60/year, Wyoming has the lowest LLC annual report fee in the nation." },
      { title: "Asset Protection", description: "Wyoming's charging order protection shields your personal assets from business creditors." },
      { title: "No Franchise Tax", description: "Unlike Delaware, Wyoming has no franchise tax regardless of your company's size." },
      { title: "Fast Processing", description: "Standard filings are processed in 3-5 days, with 1-day expedited options available." },
    ],
    requirements: [
      "Unique LLC name ending in 'LLC' or 'Limited Liability Company'",
      "Registered agent with Wyoming physical address",
      "Articles of Organization filed with Secretary of State",
      "Operating Agreement (recommended but not required to file)",
      "Annual report due on the first day of the anniversary month",
    ],
    faqs: [
      { question: "Do I need to live in Wyoming to form an LLC there?", answer: "No, you don't need to live in Wyoming or even be a US citizen to form a Wyoming LLC. You just need a registered agent with a physical address in Wyoming, which we provide as part of our service." },
      { question: "How long does it take to form a Wyoming LLC?", answer: "Standard processing takes 3-5 business days. With our expedited service, your LLC can be formed in 1 business day." },
      { question: "What is Wyoming's annual report fee?", answer: "Wyoming charges a flat $60 annual report fee for LLCs, which is due on the first day of the month in which you formed your LLC. This is the lowest annual fee in the nation." },
      { question: "Can I use my Wyoming LLC to do business in other states?", answer: "Yes, your Wyoming LLC can do business anywhere in the US. If you have a physical presence in another state, you may need to register as a foreign LLC there." },
      { question: "Does Wyoming require an Operating Agreement?", answer: "While Wyoming doesn't require you to file an Operating Agreement with the state, it's highly recommended to have one. We include a customizable Operating Agreement with all our packages." },
    ],
    metaTitle: "Wyoming LLC Formation | Form Your WY LLC in 24 Hours",
    metaDescription: "Start your Wyoming LLC today. No state income tax, strong privacy, lowest annual fees ($60/year). Perfect for international entrepreneurs. From $149 + $100 state fee.",
  },
  {
    code: "DE",
    name: "Delaware",
    slug: "delaware",
    fee: 140,
    annualFee: 300,
    processingTime: "3-5 business days",
    popular: true,
    tagline: "The Corporate Capital of America",
    description: `Delaware is home to more than 65% of Fortune 500 companies and is renowned for its sophisticated business laws and Court of Chancery. If you're planning to raise venture capital, go public, or build a large corporation, Delaware is often the preferred choice.

Delaware's Court of Chancery is a specialized business court with judges (not juries) who are experts in corporate law. This provides predictability and efficiency in resolving business disputes.`,
    benefits: [
      { title: "Court of Chancery", description: "Specialized business court with expert judges and decades of case law precedent." },
      { title: "Investor Preferred", description: "VCs and investors are familiar with Delaware law, making fundraising easier." },
      { title: "Privacy Protection", description: "Member and manager names don't need to be disclosed in formation documents." },
      { title: "Flexible Business Laws", description: "Delaware's LLC Act allows maximum flexibility in structuring your company." },
      { title: "No Sales Tax", description: "Delaware has no sales tax, beneficial for e-commerce businesses." },
      { title: "Same-Day Filing", description: "Delaware offers same-day expedited filing for urgent business needs." },
    ],
    requirements: [
      "Unique LLC name including 'LLC', 'L.L.C.', or 'Limited Liability Company'",
      "Registered agent with Delaware physical address",
      "Certificate of Formation filed with Division of Corporations",
      "Annual tax of $300 due by June 1st each year",
      "No Operating Agreement filing required",
    ],
    faqs: [
      { question: "Why do so many companies incorporate in Delaware?", answer: "Delaware offers sophisticated business laws, a specialized Court of Chancery, and decades of legal precedent that provides predictability. It's especially popular with companies planning to raise venture capital or go public." },
      { question: "What is Delaware's annual franchise tax?", answer: "Delaware LLCs pay a flat $300 annual tax due by June 1st each year. This is higher than Wyoming ($60) or New Mexico ($0), making it less ideal for small businesses." },
      { question: "Is Delaware good for small businesses?", answer: "While Delaware has excellent business laws, the $300 annual tax makes it less cost-effective for small businesses. Wyoming or New Mexico are often better choices for small LLCs." },
      { question: "Can non-US residents form a Delaware LLC?", answer: "Yes, non-US residents can form a Delaware LLC. You don't need to be a US citizen or resident. You just need a registered agent in Delaware." },
      { question: "How fast can I form a Delaware LLC?", answer: "Standard processing takes 3-5 business days. Delaware offers same-day filing for an additional fee." },
    ],
    metaTitle: "Delaware LLC Formation | Form Your DE LLC Today",
    metaDescription: "Form your Delaware LLC with the corporate capital of America. Court of Chancery expertise, investor-friendly laws. From $149 + $140 state fee.",
  },
  {
    code: "NM",
    name: "New Mexico",
    slug: "new-mexico",
    fee: 50,
    annualFee: 0,
    processingTime: "3-5 business days",
    popular: true,
    tagline: "The Most Affordable LLC State",
    description: `New Mexico offers the lowest-cost LLC formation in the United States with a filing fee of just $50 and NO annual report requirement. This makes it an excellent choice for entrepreneurs on a budget or those starting multiple LLCs.

While New Mexico may not have the brand recognition of Delaware or the comprehensive protections of Wyoming, it provides solid LLC protections at an unbeatable price.`,
    benefits: [
      { title: "Lowest Filing Fee", description: "At just $50, New Mexico has the lowest LLC filing fee in the nation." },
      { title: "No Annual Report", description: "New Mexico LLCs have no annual report requirement, saving time and money." },
      { title: "Privacy Protection", description: "Member names are not required in formation documents, protecting your privacy." },
      { title: "No State Income Tax on LLCs", description: "Pass-through LLCs don't pay state income tax at the entity level." },
      { title: "Simple Maintenance", description: "With no annual report, maintaining your New Mexico LLC is effortless." },
      { title: "International Friendly", description: "Non-US residents can easily form and maintain a New Mexico LLC." },
    ],
    requirements: [
      "Unique LLC name containing 'LLC', 'L.L.C.', or 'Limited Liability Company'",
      "Registered agent with New Mexico physical address",
      "Articles of Organization filed with Secretary of State",
      "No annual report required",
      "Operating Agreement recommended but not filed with state",
    ],
    faqs: [
      { question: "Why is New Mexico so affordable?", answer: "New Mexico has positioned itself as a business-friendly state with minimal fees to attract entrepreneurs. The $50 filing fee and no annual report requirement make it the most affordable state for LLC formation." },
      { question: "Is there really no annual fee in New Mexico?", answer: "Correct! New Mexico LLCs have no annual report requirement and no annual franchise tax. Once you form your LLC, there are no ongoing state fees to maintain it." },
      { question: "Is New Mexico good for privacy?", answer: "Yes, New Mexico offers good privacy protection. Member names are not required in the Articles of Organization, keeping your identity private from public records." },
      { question: "Can I use a New Mexico LLC for Amazon FBA?", answer: "Yes, many Amazon sellers use New Mexico LLCs for their business. The low cost and simple maintenance make it popular with e-commerce entrepreneurs." },
      { question: "What are the downsides of a New Mexico LLC?", answer: "New Mexico doesn't have the same legal precedent as Delaware or the comprehensive asset protection of Wyoming. However, for most small businesses, these differences are minimal." },
    ],
    metaTitle: "New Mexico LLC Formation | Lowest Cost LLC - Only $50",
    metaDescription: "Form your New Mexico LLC for just $50 state fee with NO annual report. The most affordable LLC in America. Perfect for budget-conscious entrepreneurs.",
  },
];

export const popularStates = states.filter((s) => s.popular);

export function getStateByCode(code: string) {
  return states.find((s) => s.code === code);
}

export function getStateByName(name: string) {
  return states.find((s) => s.name.toLowerCase() === name.toLowerCase().replace("-", " "));
}

export function getStateLandingPageBySlug(slug: string): StateLandingPage | undefined {
  return stateLandingPages.find((s) => s.slug === slug);
}

export function getAllStateLandingSlugs(): string[] {
  return stateLandingPages.map((s) => s.slug);
}
