export interface FAQ {
  question: string;
  answer: string;
  category: string;
}

export const faqCategories = [
  { id: "llc-formation", name: "LLC Formation" },
  { id: "ein", name: "EIN & Taxes" },
  { id: "banking", name: "Business Banking" },
  { id: "amazon", name: "Amazon Seller" },
  { id: "international", name: "International Clients" },
  { id: "pricing", name: "Pricing & Payments" },
];

export const faqs: FAQ[] = [
  // LLC Formation
  {
    question: "What is an LLC and why do I need one?",
    answer:
      "An LLC (Limited Liability Company) is a business structure that protects your personal assets from business debts and lawsuits. It combines the liability protection of a corporation with the tax flexibility of a partnership. You need an LLC to separate your personal and business finances, build credibility, and protect yourself legally.",
    category: "llc-formation",
  },
  {
    question: "Do I need to be a US citizen to form an LLC?",
    answer:
      "No, you do not need to be a US citizen or resident to form an LLC in the United States. International entrepreneurs from any country can form a US LLC. You'll need a registered agent with a US address (which we provide) and can manage your LLC from anywhere in the world.",
    category: "llc-formation",
  },
  {
    question: "Which state should I form my LLC in?",
    answer:
      "For most international entrepreneurs and online businesses, we recommend Wyoming due to its low fees ($100 filing, $60/year annual), strong privacy protections, no state income tax, and business-friendly laws. Delaware is preferred for businesses seeking venture capital. New Mexico is the most affordable option with just $50 filing and no annual fees.",
    category: "llc-formation",
  },
  {
    question: "How long does it take to form an LLC?",
    answer:
      "Standard LLC formation typically takes 3-5 business days after we submit your documents to the state. With our expedited service, most states can process your LLC in 1-2 business days. You'll receive your formation documents via email as soon as they're ready.",
    category: "llc-formation",
  },
  {
    question: "What documents will I receive after forming my LLC?",
    answer:
      "You'll receive: Articles of Organization (state-filed formation document), Operating Agreement (internal governance document), EIN Confirmation Letter (if ordered), Registered Agent Acceptance, and all state filing receipts. All documents are delivered digitally to your dashboard and can be downloaded anytime.",
    category: "llc-formation",
  },
  {
    question: "What is a Registered Agent and do I need one?",
    answer:
      "A Registered Agent is a person or company designated to receive legal documents and official correspondence on behalf of your LLC. Every state requires LLCs to have a registered agent with a physical address in the state of formation. We provide registered agent service as part of our Standard and Premium packages.",
    category: "llc-formation",
  },
  {
    question: "Can I be my own Registered Agent?",
    answer:
      "Technically yes, but only if you have a physical address in the state where your LLC is formed and are available during business hours. For international clients or those without a US address, using a professional registered agent service is required and recommended for privacy.",
    category: "llc-formation",
  },
  {
    question: "What is an Operating Agreement?",
    answer:
      "An Operating Agreement is an internal document that outlines how your LLC will be run, including ownership percentages, profit distribution, voting rights, and management structure. While not all states require it, having one is essential for maintaining liability protection and is often required by banks to open a business account.",
    category: "llc-formation",
  },

  // EIN & Taxes
  {
    question: "What is an EIN and do I need one?",
    answer:
      "An EIN (Employer Identification Number) is a 9-digit tax ID number issued by the IRS for your business, similar to a Social Security Number for individuals. You need an EIN to open a business bank account, hire employees, file business taxes, and establish business credit. We strongly recommend getting an EIN for every LLC.",
    category: "ein",
  },
  {
    question: "How long does it take to get an EIN?",
    answer:
      "For US residents with an SSN/ITIN, EINs can be obtained instantly online. For international clients without an SSN/ITIN, we submit your application via fax to the IRS, and it typically takes 4-6 weeks to receive your EIN. We'll notify you as soon as it's ready.",
    category: "ein",
  },
  {
    question: "Do I need an ITIN to get an EIN?",
    answer:
      "No, you do not need an ITIN (Individual Tax Identification Number) to obtain an EIN for your LLC. International clients without an SSN or ITIN can still get an EIN - we handle this process through a special IRS fax application procedure.",
    category: "ein",
  },
  {
    question: "What taxes does a US LLC need to pay?",
    answer:
      "By default, single-member LLCs are taxed as 'disregarded entities' and multi-member LLCs as partnerships. This means profits pass through to your personal tax return. For non-US owners without US-sourced income, you may have minimal or no US tax liability. We recommend consulting a tax professional for your specific situation.",
    category: "ein",
  },
  {
    question: "Do I need to file US taxes if I don't live in the US?",
    answer:
      "It depends on your business activities. If your LLC earns US-sourced income (income from US customers or US-based activities), you may have US tax filing obligations. If all your income is from outside the US, you may only need to file informational returns. Consult a tax professional for advice specific to your situation.",
    category: "ein",
  },

  // Business Banking
  {
    question: "Can non-US residents open a US business bank account?",
    answer:
      "Yes! Many US banks now offer business accounts to non-US residents with a US LLC. Some banks require an in-person visit, while others like Mercury, Relay, and certain credit unions allow remote account opening. Our Premium package includes assistance with the bank account opening process.",
    category: "banking",
  },
  {
    question: "Which banks do you recommend for international LLC owners?",
    answer:
      "For international clients, we recommend Mercury (online bank, easy remote opening), Relay (no monthly fees, remote opening), and certain credit unions. Traditional banks like Chase or Bank of America typically require an in-person visit but offer more services. Your best option depends on your specific needs.",
    category: "banking",
  },
  {
    question: "What documents do I need to open a business bank account?",
    answer:
      "Typically you'll need: Articles of Organization, Operating Agreement, EIN Confirmation Letter, valid passport or government ID, proof of business address, and sometimes a business plan or website. Banks may have additional requirements - we'll guide you through the specific requirements for your chosen bank.",
    category: "banking",
  },
  {
    question: "Do I need to visit the US to open a bank account?",
    answer:
      "Not necessarily. Several banks and fintech companies (Mercury, Relay, Brex) allow international LLC owners to open accounts entirely online. Traditional banks like Chase, Bank of America, and Wells Fargo typically require an in-person visit to a US branch.",
    category: "banking",
  },

  // Amazon Seller
  {
    question: "Do I need a US LLC to sell on Amazon?",
    answer:
      "While not strictly required, having a US LLC provides significant benefits for Amazon sellers: better access to Amazon lending, easier payment processing, professional business image, liability protection, and simpler tax reporting. Most successful international Amazon sellers operate through a US LLC.",
    category: "amazon",
  },
  {
    question: "Can I use my US LLC to sell on Amazon from outside the US?",
    answer:
      "Yes! A US LLC can be used to sell on Amazon.com and other Amazon marketplaces from anywhere in the world. You'll need an EIN, a US bank account (or supported international bank), and proper tax documentation. We help set up everything you need to start selling.",
    category: "amazon",
  },
  {
    question: "What do I need to set up an Amazon seller account with a US LLC?",
    answer:
      "To create an Amazon Professional Seller account with your US LLC, you'll need: EIN, business bank account or credit card, valid phone number, government-issued ID, and Articles of Organization. Our Amazon Seller Setup service guides you through the entire registration process.",
    category: "amazon",
  },
  {
    question: "How do I receive payments from Amazon as an international seller?",
    answer:
      "Amazon can deposit funds to your US business bank account directly. Alternatively, you can use payment services like Payoneer or WorldFirst that provide US bank details. With a US LLC and business bank account, you'll have the smoothest payment experience.",
    category: "amazon",
  },

  // International Clients
  {
    question: "Can I manage my US LLC from my home country?",
    answer:
      "Yes, you can manage your US LLC entirely from your home country. All communication with state agencies goes through your registered agent (us), you can conduct business online, and banking can be done remotely with the right bank. You don't need to visit the US to run your LLC.",
    category: "international",
  },
  {
    question: "What address will my LLC have?",
    answer:
      "Your LLC will have two addresses: 1) Registered Agent Address - our address in the state of formation for receiving legal documents, and 2) Principal Business Address - can be your home country address or a US virtual address (included in Premium package) for a more professional appearance.",
    category: "international",
  },
  {
    question: "Do I need a US phone number for my LLC?",
    answer:
      "A US phone number is helpful but not required for LLC formation. However, you'll need one for Amazon seller registration and some bank accounts. Virtual US phone numbers are available through services like Google Voice, OpenPhone, or Grasshopper at low monthly costs.",
    category: "international",
  },
  {
    question: "Is my information public when I form an LLC?",
    answer:
      "This depends on the state. Wyoming, Delaware, and New Mexico do not require member names in public filings, providing privacy protection. Our registered agent address is used for public records, keeping your personal address private. For maximum privacy, we recommend Wyoming.",
    category: "international",
  },

  // Pricing & Payments
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express) and debit cards through Stripe. For clients in Bangladesh, we also accept bKash, Nagad, and local bank transfers through SSLCommerz. All payments are secure and processed through encrypted connections.",
    category: "pricing",
  },
  {
    question: "Are there any hidden fees?",
    answer:
      "No hidden fees! Our pricing is completely transparent. The price you see includes our full service fee. State filing fees are listed separately and paid at checkout. We don't charge extra for document delivery, customer support, or standard processing.",
    category: "pricing",
  },
  {
    question: "What's included in each package?",
    answer:
      "Basic ($149): LLC formation, name check, Articles of Organization, digital documents. Standard ($249): Everything in Basic plus EIN, Operating Agreement, Registered Agent (1 year), Banking Resolution. Premium ($399): Everything in Standard plus bank account assistance, virtual address, annual report filing, express processing.",
    category: "pricing",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes, we offer a 30-day satisfaction guarantee. If you're not happy with our service before we file with the state, we'll provide a full refund of our service fee. After state filing, refunds are limited to our service fee only (state fees are non-refundable as they go directly to the government).",
    category: "pricing",
  },
  {
    question: "What are state filing fees?",
    answer:
      "State filing fees are government charges required to register your LLC and are paid directly to the state. These vary by state: Wyoming $100, Delaware $140, New Mexico $50, Texas $300. These fees are separate from our service fees and are clearly shown during checkout.",
    category: "pricing",
  },
];

export function getFAQsByCategory(category: string): FAQ[] {
  return faqs.filter((faq) => faq.category === category);
}

export function getAllFAQs(): FAQ[] {
  return faqs;
}

export function searchFAQs(query: string): FAQ[] {
  const lowercaseQuery = query.toLowerCase();
  return faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(lowercaseQuery) ||
      faq.answer.toLowerCase().includes(lowercaseQuery)
  );
}
