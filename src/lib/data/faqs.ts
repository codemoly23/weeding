export interface FAQ {
  question: string;
  answer: string;
  category: string;
}

export const faqCategories = [
  { id: "planning", name: "Wedding Planning" },
  { id: "guest-management", name: "Guest Management" },
  { id: "vendors", name: "Vendors & Venues" },
  { id: "event-website", name: "Event Website & RSVP" },
  { id: "pricing", name: "Pricing & Payments" },
];

export const faqs: FAQ[] = [
  // Wedding Planning
  {
    question: "What is Ceremoney and how does it help me plan my wedding?",
    answer:
      "Ceremoney is a Swedish wedding planning SaaS that helps couples and professional wedding planners organize every aspect of their big day. From managing your guest list and seating charts to creating a beautiful event website with RSVP, coordinating vendors, and tracking your budget — Ceremoney keeps everything in one place so you can focus on celebrating.",
    category: "planning",
  },
  {
    question: "Can I use Ceremoney for events other than weddings?",
    answer:
      "Yes! While Ceremoney is optimized for weddings, it works great for other celebrations such as engagement parties, anniversary celebrations, birthday milestones, and corporate events. The guest management, seating, and event website tools are flexible enough for any gathering.",
    category: "planning",
  },
  {
    question: "How far in advance should I start planning my wedding with Ceremoney?",
    answer:
      "We recommend starting as early as possible — ideally 12 to 18 months before your wedding date. This gives you plenty of time to book popular venues and vendors, send save-the-dates, collect RSVPs, and finalize your seating chart. Ceremoney's timeline and checklist features help you stay on track every step of the way.",
    category: "planning",
  },
  {
    question: "Can professional wedding planners use Ceremoney for multiple clients?",
    answer:
      "Absolutely. Our White-Label plan is designed specifically for professional wedding planners and event companies. You can manage unlimited client events under your own brand, invite clients to collaborate in real time, and present a polished, branded experience. Contact us for a White-Label demo.",
    category: "planning",
  },
  {
    question: "Does Ceremoney support Arabic (RTL) and Swedish?",
    answer:
      "Yes. Ceremoney fully supports Swedish as the primary language and includes right-to-left (RTL) layout support for Arabic-speaking couples and planners. You can switch language preferences from your account settings.",
    category: "planning",
  },

  // Guest Management
  {
    question: "How do I add guests to my guest list?",
    answer:
      "You can add guests one by one, import them from a spreadsheet (CSV/Excel), or let guests register themselves through your event website. Each guest entry supports name, contact details, dietary requirements, plus-one status, and RSVP response. You can also group guests into families for easier management.",
    category: "guest-management",
  },
  {
    question: "How does the seating chart work?",
    answer:
      "Our drag-and-drop seating editor lets you create a visual floor plan of your venue, add tables with custom names and capacities, and assign guests to seats. The system automatically flags conflicts such as unassigned guests or overfilled tables. Changes sync in real time so your planner or partner always sees the latest version.",
    category: "guest-management",
  },
  {
    question: "Can I track dietary requirements and meal preferences?",
    answer:
      "Yes. Each guest profile includes a dietary requirements field where you can record preferences such as vegetarian, vegan, gluten-free, halal, or custom notes. You can export a summary report for your catering team directly from the guest list.",
    category: "guest-management",
  },
  {
    question: "How many guests can I manage on each plan?",
    answer:
      "The Basic (free) plan supports up to 50 guests. The Premium plan supports up to 300 guests, and the Elite plan is unlimited. White-Label planners also enjoy unlimited guests across all their client events. You can upgrade your plan at any time as your guest list grows.",
    category: "guest-management",
  },

  // Vendors & Venues
  {
    question: "Does Ceremoney have a vendor directory?",
    answer:
      "Yes. Our vendor marketplace lists photographers, venues, florists, caterers, musicians, and other wedding professionals. You can browse by category, location, and budget, read reviews from real couples, and contact vendors directly. Vendors listed in our directory are verified by the Ceremoney team.",
    category: "vendors",
  },
  {
    question: "Can I invite my own vendors to collaborate in Ceremoney?",
    answer:
      "Yes. You can invite any vendor to your event workspace using their email address, even if they are not listed in our directory. They will receive a limited-access view to see relevant details — such as the seating chart for a caterer or the timeline for a photographer — without accessing your entire event.",
    category: "vendors",
  },
  {
    question: "How do I compare venue options?",
    answer:
      "Use the Venue Comparison tool to add multiple venues side by side and compare capacity, pricing, location, amenities, and guest reviews. You can save your shortlist and share it with your partner or planner to make a collaborative decision.",
    category: "vendors",
  },

  // Event Website & RSVP
  {
    question: "Can I create a wedding website with Ceremoney?",
    answer:
      "Yes! Every Ceremoney account includes a beautiful, customizable event website. Choose from our curated templates, add your love story, ceremony details, accommodation suggestions, gift registry links, and photo gallery. Guests can RSVP directly through the website, and their responses sync instantly to your guest list.",
    category: "event-website",
  },
  {
    question: "Is my event website public or private?",
    answer:
      "You decide. Your event website can be fully public (accessible to anyone with the link), password-protected (guests enter a code you share with them), or private (visible only to invited guests who log in). The privacy setting can be changed at any time from your website settings.",
    category: "event-website",
  },
  {
    question: "Can guests RSVP online?",
    answer:
      "Yes. Your event website includes a built-in RSVP form where guests can confirm attendance, specify their meal preference, add a plus-one, and leave a personal message. RSVP responses are collected in real time and reflected immediately in your guest list and seating chart. You can also set an RSVP deadline and send automated reminders to guests who have not responded.",
    category: "event-website",
  },
  {
    question: "What happens if a guest does not have internet access?",
    answer:
      "We understand that not all guests, especially older family members, are comfortable with online forms. You can always manually update RSVP statuses on their behalf directly in the guest list. You can also print a PDF version of your guest list and seating chart for offline reference.",
    category: "event-website",
  },

  // Pricing & Payments
  {
    question: "What payment methods does Ceremoney accept?",
    answer:
      "We accept all major credit and debit cards (Visa, Mastercard, American Express) via Stripe. For customers in Sweden we also support Swish for easy mobile payments. All transactions are processed securely and prices are shown in SEK by default, with multi-currency support available on Premium and Elite plans.",
    category: "pricing",
  },
  {
    question: "Is there a free plan?",
    answer:
      "Yes. The Basic plan is free forever and includes one active event, up to 50 guests, a customizable event website with RSVP, and access to our vendor directory. When you are ready for more features — such as unlimited guests, advanced seating charts, and priority support — you can upgrade to Premium or Elite at any time.",
    category: "pricing",
  },
  {
    question: "What is included in each paid plan?",
    answer:
      "Premium (399 SEK/month or 3,499 SEK/year): Up to 300 guests, unlimited seating charts, custom domain for your event website, vendor collaboration, and priority support. Elite (799 SEK/month or 6,999 SEK/year): Unlimited guests, multiple events, advanced analytics, export tools, and dedicated account manager. White-Label: Custom pricing for professional planners — contact us for a quote.",
    category: "pricing",
  },
  {
    question: "Can I cancel or get a refund?",
    answer:
      "You can cancel your subscription at any time from your account settings — no long-term contracts. If you cancel within 14 days of your first paid subscription (for new customers), we offer a full refund. After the 14-day window, you retain access until the end of your current billing period, after which your account reverts to the free Basic plan.",
    category: "pricing",
  },
  {
    question: "Is VAT (Moms) included in the prices?",
    answer:
      "Prices shown on the website are exclusive of Swedish VAT (Moms at 25%). VAT is added at checkout based on your billing country. Business customers in the EU with a valid VAT number can apply for reverse charge. A proper VAT invoice is generated for every transaction and available to download from your billing settings.",
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
