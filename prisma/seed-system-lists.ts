import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Countries data with phone codes and popular flags
const countries = [
  // Popular countries (for quick select)
  { value: "BD", label: "Bangladesh", code: "BD", icon: "🇧🇩", isPopular: true, metadata: { phoneCode: "+880", currency: "BDT" } },
  { value: "IN", label: "India", code: "IN", icon: "🇮🇳", isPopular: true, metadata: { phoneCode: "+91", currency: "INR" } },
  { value: "PK", label: "Pakistan", code: "PK", icon: "🇵🇰", isPopular: true, metadata: { phoneCode: "+92", currency: "PKR" } },
  { value: "AE", label: "United Arab Emirates", code: "AE", icon: "🇦🇪", isPopular: true, metadata: { phoneCode: "+971", currency: "AED" } },
  { value: "SA", label: "Saudi Arabia", code: "SA", icon: "🇸🇦", isPopular: true, metadata: { phoneCode: "+966", currency: "SAR" } },
  { value: "MY", label: "Malaysia", code: "MY", icon: "🇲🇾", isPopular: true, metadata: { phoneCode: "+60", currency: "MYR" } },
  { value: "SG", label: "Singapore", code: "SG", icon: "🇸🇬", isPopular: true, metadata: { phoneCode: "+65", currency: "SGD" } },
  { value: "GB", label: "United Kingdom", code: "GB", icon: "🇬🇧", isPopular: true, metadata: { phoneCode: "+44", currency: "GBP" } },
  { value: "US", label: "United States", code: "US", icon: "🇺🇸", isPopular: true, metadata: { phoneCode: "+1", currency: "USD" } },
  { value: "CA", label: "Canada", code: "CA", icon: "🇨🇦", isPopular: true, metadata: { phoneCode: "+1", currency: "CAD" } },
  // All other countries
  { value: "AF", label: "Afghanistan", code: "AF", icon: "🇦🇫", metadata: { phoneCode: "+93", currency: "AFN" } },
  { value: "AL", label: "Albania", code: "AL", icon: "🇦🇱", metadata: { phoneCode: "+355", currency: "ALL" } },
  { value: "DZ", label: "Algeria", code: "DZ", icon: "🇩🇿", metadata: { phoneCode: "+213", currency: "DZD" } },
  { value: "AR", label: "Argentina", code: "AR", icon: "🇦🇷", metadata: { phoneCode: "+54", currency: "ARS" } },
  { value: "AM", label: "Armenia", code: "AM", icon: "🇦🇲", metadata: { phoneCode: "+374", currency: "AMD" } },
  { value: "AU", label: "Australia", code: "AU", icon: "🇦🇺", metadata: { phoneCode: "+61", currency: "AUD" } },
  { value: "AT", label: "Austria", code: "AT", icon: "🇦🇹", metadata: { phoneCode: "+43", currency: "EUR" } },
  { value: "AZ", label: "Azerbaijan", code: "AZ", icon: "🇦🇿", metadata: { phoneCode: "+994", currency: "AZN" } },
  { value: "BH", label: "Bahrain", code: "BH", icon: "🇧🇭", metadata: { phoneCode: "+973", currency: "BHD" } },
  { value: "BE", label: "Belgium", code: "BE", icon: "🇧🇪", metadata: { phoneCode: "+32", currency: "EUR" } },
  { value: "BR", label: "Brazil", code: "BR", icon: "🇧🇷", metadata: { phoneCode: "+55", currency: "BRL" } },
  { value: "BG", label: "Bulgaria", code: "BG", icon: "🇧🇬", metadata: { phoneCode: "+359", currency: "BGN" } },
  { value: "KH", label: "Cambodia", code: "KH", icon: "🇰🇭", metadata: { phoneCode: "+855", currency: "KHR" } },
  { value: "CL", label: "Chile", code: "CL", icon: "🇨🇱", metadata: { phoneCode: "+56", currency: "CLP" } },
  { value: "CN", label: "China", code: "CN", icon: "🇨🇳", metadata: { phoneCode: "+86", currency: "CNY" } },
  { value: "CO", label: "Colombia", code: "CO", icon: "🇨🇴", metadata: { phoneCode: "+57", currency: "COP" } },
  { value: "HR", label: "Croatia", code: "HR", icon: "🇭🇷", metadata: { phoneCode: "+385", currency: "EUR" } },
  { value: "CY", label: "Cyprus", code: "CY", icon: "🇨🇾", metadata: { phoneCode: "+357", currency: "EUR" } },
  { value: "CZ", label: "Czech Republic", code: "CZ", icon: "🇨🇿", metadata: { phoneCode: "+420", currency: "CZK" } },
  { value: "DK", label: "Denmark", code: "DK", icon: "🇩🇰", metadata: { phoneCode: "+45", currency: "DKK" } },
  { value: "EG", label: "Egypt", code: "EG", icon: "🇪🇬", metadata: { phoneCode: "+20", currency: "EGP" } },
  { value: "EE", label: "Estonia", code: "EE", icon: "🇪🇪", metadata: { phoneCode: "+372", currency: "EUR" } },
  { value: "ET", label: "Ethiopia", code: "ET", icon: "🇪🇹", metadata: { phoneCode: "+251", currency: "ETB" } },
  { value: "FI", label: "Finland", code: "FI", icon: "🇫🇮", metadata: { phoneCode: "+358", currency: "EUR" } },
  { value: "FR", label: "France", code: "FR", icon: "🇫🇷", metadata: { phoneCode: "+33", currency: "EUR" } },
  { value: "GE", label: "Georgia", code: "GE", icon: "🇬🇪", metadata: { phoneCode: "+995", currency: "GEL" } },
  { value: "DE", label: "Germany", code: "DE", icon: "🇩🇪", metadata: { phoneCode: "+49", currency: "EUR" } },
  { value: "GH", label: "Ghana", code: "GH", icon: "🇬🇭", metadata: { phoneCode: "+233", currency: "GHS" } },
  { value: "GR", label: "Greece", code: "GR", icon: "🇬🇷", metadata: { phoneCode: "+30", currency: "EUR" } },
  { value: "HK", label: "Hong Kong", code: "HK", icon: "🇭🇰", metadata: { phoneCode: "+852", currency: "HKD" } },
  { value: "HU", label: "Hungary", code: "HU", icon: "🇭🇺", metadata: { phoneCode: "+36", currency: "HUF" } },
  { value: "IS", label: "Iceland", code: "IS", icon: "🇮🇸", metadata: { phoneCode: "+354", currency: "ISK" } },
  { value: "ID", label: "Indonesia", code: "ID", icon: "🇮🇩", metadata: { phoneCode: "+62", currency: "IDR" } },
  { value: "IR", label: "Iran", code: "IR", icon: "🇮🇷", metadata: { phoneCode: "+98", currency: "IRR" } },
  { value: "IQ", label: "Iraq", code: "IQ", icon: "🇮🇶", metadata: { phoneCode: "+964", currency: "IQD" } },
  { value: "IE", label: "Ireland", code: "IE", icon: "🇮🇪", metadata: { phoneCode: "+353", currency: "EUR" } },
  { value: "IL", label: "Israel", code: "IL", icon: "🇮🇱", metadata: { phoneCode: "+972", currency: "ILS" } },
  { value: "IT", label: "Italy", code: "IT", icon: "🇮🇹", metadata: { phoneCode: "+39", currency: "EUR" } },
  { value: "JP", label: "Japan", code: "JP", icon: "🇯🇵", metadata: { phoneCode: "+81", currency: "JPY" } },
  { value: "JO", label: "Jordan", code: "JO", icon: "🇯🇴", metadata: { phoneCode: "+962", currency: "JOD" } },
  { value: "KZ", label: "Kazakhstan", code: "KZ", icon: "🇰🇿", metadata: { phoneCode: "+7", currency: "KZT" } },
  { value: "KE", label: "Kenya", code: "KE", icon: "🇰🇪", metadata: { phoneCode: "+254", currency: "KES" } },
  { value: "KW", label: "Kuwait", code: "KW", icon: "🇰🇼", metadata: { phoneCode: "+965", currency: "KWD" } },
  { value: "LV", label: "Latvia", code: "LV", icon: "🇱🇻", metadata: { phoneCode: "+371", currency: "EUR" } },
  { value: "LB", label: "Lebanon", code: "LB", icon: "🇱🇧", metadata: { phoneCode: "+961", currency: "LBP" } },
  { value: "LT", label: "Lithuania", code: "LT", icon: "🇱🇹", metadata: { phoneCode: "+370", currency: "EUR" } },
  { value: "LU", label: "Luxembourg", code: "LU", icon: "🇱🇺", metadata: { phoneCode: "+352", currency: "EUR" } },
  { value: "MO", label: "Macau", code: "MO", icon: "🇲🇴", metadata: { phoneCode: "+853", currency: "MOP" } },
  { value: "MX", label: "Mexico", code: "MX", icon: "🇲🇽", metadata: { phoneCode: "+52", currency: "MXN" } },
  { value: "MD", label: "Moldova", code: "MD", icon: "🇲🇩", metadata: { phoneCode: "+373", currency: "MDL" } },
  { value: "MA", label: "Morocco", code: "MA", icon: "🇲🇦", metadata: { phoneCode: "+212", currency: "MAD" } },
  { value: "MM", label: "Myanmar", code: "MM", icon: "🇲🇲", metadata: { phoneCode: "+95", currency: "MMK" } },
  { value: "NP", label: "Nepal", code: "NP", icon: "🇳🇵", metadata: { phoneCode: "+977", currency: "NPR" } },
  { value: "NL", label: "Netherlands", code: "NL", icon: "🇳🇱", metadata: { phoneCode: "+31", currency: "EUR" } },
  { value: "NZ", label: "New Zealand", code: "NZ", icon: "🇳🇿", metadata: { phoneCode: "+64", currency: "NZD" } },
  { value: "NG", label: "Nigeria", code: "NG", icon: "🇳🇬", metadata: { phoneCode: "+234", currency: "NGN" } },
  { value: "NO", label: "Norway", code: "NO", icon: "🇳🇴", metadata: { phoneCode: "+47", currency: "NOK" } },
  { value: "OM", label: "Oman", code: "OM", icon: "🇴🇲", metadata: { phoneCode: "+968", currency: "OMR" } },
  { value: "PH", label: "Philippines", code: "PH", icon: "🇵🇭", metadata: { phoneCode: "+63", currency: "PHP" } },
  { value: "PL", label: "Poland", code: "PL", icon: "🇵🇱", metadata: { phoneCode: "+48", currency: "PLN" } },
  { value: "PT", label: "Portugal", code: "PT", icon: "🇵🇹", metadata: { phoneCode: "+351", currency: "EUR" } },
  { value: "QA", label: "Qatar", code: "QA", icon: "🇶🇦", metadata: { phoneCode: "+974", currency: "QAR" } },
  { value: "RO", label: "Romania", code: "RO", icon: "🇷🇴", metadata: { phoneCode: "+40", currency: "RON" } },
  { value: "RU", label: "Russia", code: "RU", icon: "🇷🇺", metadata: { phoneCode: "+7", currency: "RUB" } },
  { value: "RS", label: "Serbia", code: "RS", icon: "🇷🇸", metadata: { phoneCode: "+381", currency: "RSD" } },
  { value: "SK", label: "Slovakia", code: "SK", icon: "🇸🇰", metadata: { phoneCode: "+421", currency: "EUR" } },
  { value: "SI", label: "Slovenia", code: "SI", icon: "🇸🇮", metadata: { phoneCode: "+386", currency: "EUR" } },
  { value: "ZA", label: "South Africa", code: "ZA", icon: "🇿🇦", metadata: { phoneCode: "+27", currency: "ZAR" } },
  { value: "KR", label: "South Korea", code: "KR", icon: "🇰🇷", metadata: { phoneCode: "+82", currency: "KRW" } },
  { value: "ES", label: "Spain", code: "ES", icon: "🇪🇸", metadata: { phoneCode: "+34", currency: "EUR" } },
  { value: "LK", label: "Sri Lanka", code: "LK", icon: "🇱🇰", metadata: { phoneCode: "+94", currency: "LKR" } },
  { value: "SE", label: "Sweden", code: "SE", icon: "🇸🇪", metadata: { phoneCode: "+46", currency: "SEK" } },
  { value: "CH", label: "Switzerland", code: "CH", icon: "🇨🇭", metadata: { phoneCode: "+41", currency: "CHF" } },
  { value: "TW", label: "Taiwan", code: "TW", icon: "🇹🇼", metadata: { phoneCode: "+886", currency: "TWD" } },
  { value: "TH", label: "Thailand", code: "TH", icon: "🇹🇭", metadata: { phoneCode: "+66", currency: "THB" } },
  { value: "TR", label: "Turkey", code: "TR", icon: "🇹🇷", metadata: { phoneCode: "+90", currency: "TRY" } },
  { value: "UA", label: "Ukraine", code: "UA", icon: "🇺🇦", metadata: { phoneCode: "+380", currency: "UAH" } },
  { value: "UZ", label: "Uzbekistan", code: "UZ", icon: "🇺🇿", metadata: { phoneCode: "+998", currency: "UZS" } },
  { value: "VN", label: "Vietnam", code: "VN", icon: "🇻🇳", metadata: { phoneCode: "+84", currency: "VND" } },
  { value: "YE", label: "Yemen", code: "YE", icon: "🇾🇪", metadata: { phoneCode: "+967", currency: "YER" } },
];

// US States data
const usStates = [
  { value: "WY", label: "Wyoming", code: "WY", isPopular: true, metadata: { llcFee: 100, annualFee: 62, processingDays: "1-2" } },
  { value: "DE", label: "Delaware", code: "DE", isPopular: true, metadata: { llcFee: 90, annualFee: 300, processingDays: "3-5" } },
  { value: "NM", label: "New Mexico", code: "NM", isPopular: true, metadata: { llcFee: 50, annualFee: 0, processingDays: "3-5" } },
  { value: "FL", label: "Florida", code: "FL", isPopular: true, metadata: { llcFee: 125, annualFee: 138.75, processingDays: "5-7" } },
  { value: "TX", label: "Texas", code: "TX", isPopular: true, metadata: { llcFee: 300, annualFee: 0, processingDays: "5-7" } },
  { value: "AL", label: "Alabama", code: "AL", metadata: { llcFee: 200, annualFee: 100, processingDays: "5-7" } },
  { value: "AK", label: "Alaska", code: "AK", metadata: { llcFee: 250, annualFee: 100, processingDays: "10-15" } },
  { value: "AZ", label: "Arizona", code: "AZ", metadata: { llcFee: 50, annualFee: 0, processingDays: "5-7" } },
  { value: "AR", label: "Arkansas", code: "AR", metadata: { llcFee: 50, annualFee: 150, processingDays: "5-7" } },
  { value: "CA", label: "California", code: "CA", metadata: { llcFee: 70, annualFee: 800, processingDays: "5-7" } },
  { value: "CO", label: "Colorado", code: "CO", metadata: { llcFee: 50, annualFee: 10, processingDays: "5-7" } },
  { value: "CT", label: "Connecticut", code: "CT", metadata: { llcFee: 120, annualFee: 80, processingDays: "5-7" } },
  { value: "GA", label: "Georgia", code: "GA", metadata: { llcFee: 100, annualFee: 50, processingDays: "5-7" } },
  { value: "HI", label: "Hawaii", code: "HI", metadata: { llcFee: 50, annualFee: 15, processingDays: "5-7" } },
  { value: "ID", label: "Idaho", code: "ID", metadata: { llcFee: 100, annualFee: 0, processingDays: "5-7" } },
  { value: "IL", label: "Illinois", code: "IL", metadata: { llcFee: 150, annualFee: 75, processingDays: "5-7" } },
  { value: "IN", label: "Indiana", code: "IN", metadata: { llcFee: 95, annualFee: 50, processingDays: "5-7" } },
  { value: "IA", label: "Iowa", code: "IA", metadata: { llcFee: 50, annualFee: 60, processingDays: "5-7" } },
  { value: "KS", label: "Kansas", code: "KS", metadata: { llcFee: 160, annualFee: 55, processingDays: "5-7" } },
  { value: "KY", label: "Kentucky", code: "KY", metadata: { llcFee: 40, annualFee: 15, processingDays: "5-7" } },
  { value: "LA", label: "Louisiana", code: "LA", metadata: { llcFee: 100, annualFee: 35, processingDays: "5-7" } },
  { value: "ME", label: "Maine", code: "ME", metadata: { llcFee: 175, annualFee: 85, processingDays: "5-7" } },
  { value: "MD", label: "Maryland", code: "MD", metadata: { llcFee: 100, annualFee: 300, processingDays: "5-7" } },
  { value: "MA", label: "Massachusetts", code: "MA", metadata: { llcFee: 500, annualFee: 500, processingDays: "5-7" } },
  { value: "MI", label: "Michigan", code: "MI", metadata: { llcFee: 50, annualFee: 25, processingDays: "5-7" } },
  { value: "MN", label: "Minnesota", code: "MN", metadata: { llcFee: 155, annualFee: 0, processingDays: "5-7" } },
  { value: "MS", label: "Mississippi", code: "MS", metadata: { llcFee: 50, annualFee: 0, processingDays: "5-7" } },
  { value: "MO", label: "Missouri", code: "MO", metadata: { llcFee: 50, annualFee: 0, processingDays: "5-7" } },
  { value: "MT", label: "Montana", code: "MT", metadata: { llcFee: 70, annualFee: 20, processingDays: "5-7" } },
  { value: "NE", label: "Nebraska", code: "NE", metadata: { llcFee: 105, annualFee: 26, processingDays: "5-7" } },
  { value: "NV", label: "Nevada", code: "NV", metadata: { llcFee: 425, annualFee: 350, processingDays: "3-5" } },
  { value: "NH", label: "New Hampshire", code: "NH", metadata: { llcFee: 100, annualFee: 100, processingDays: "5-7" } },
  { value: "NJ", label: "New Jersey", code: "NJ", metadata: { llcFee: 125, annualFee: 75, processingDays: "5-7" } },
  { value: "NY", label: "New York", code: "NY", metadata: { llcFee: 200, annualFee: 25, processingDays: "5-7" } },
  { value: "NC", label: "North Carolina", code: "NC", metadata: { llcFee: 125, annualFee: 200, processingDays: "5-7" } },
  { value: "ND", label: "North Dakota", code: "ND", metadata: { llcFee: 135, annualFee: 50, processingDays: "5-7" } },
  { value: "OH", label: "Ohio", code: "OH", metadata: { llcFee: 99, annualFee: 0, processingDays: "5-7" } },
  { value: "OK", label: "Oklahoma", code: "OK", metadata: { llcFee: 100, annualFee: 25, processingDays: "5-7" } },
  { value: "OR", label: "Oregon", code: "OR", metadata: { llcFee: 100, annualFee: 100, processingDays: "5-7" } },
  { value: "PA", label: "Pennsylvania", code: "PA", metadata: { llcFee: 125, annualFee: 70, processingDays: "5-7" } },
  { value: "RI", label: "Rhode Island", code: "RI", metadata: { llcFee: 150, annualFee: 50, processingDays: "5-7" } },
  { value: "SC", label: "South Carolina", code: "SC", metadata: { llcFee: 110, annualFee: 0, processingDays: "5-7" } },
  { value: "SD", label: "South Dakota", code: "SD", metadata: { llcFee: 150, annualFee: 50, processingDays: "5-7" } },
  { value: "TN", label: "Tennessee", code: "TN", metadata: { llcFee: 300, annualFee: 300, processingDays: "5-7" } },
  { value: "UT", label: "Utah", code: "UT", metadata: { llcFee: 70, annualFee: 20, processingDays: "5-7" } },
  { value: "VT", label: "Vermont", code: "VT", metadata: { llcFee: 125, annualFee: 35, processingDays: "5-7" } },
  { value: "VA", label: "Virginia", code: "VA", metadata: { llcFee: 100, annualFee: 50, processingDays: "5-7" } },
  { value: "WA", label: "Washington", code: "WA", metadata: { llcFee: 200, annualFee: 60, processingDays: "5-7" } },
  { value: "WV", label: "West Virginia", code: "WV", metadata: { llcFee: 100, annualFee: 25, processingDays: "5-7" } },
  { value: "WI", label: "Wisconsin", code: "WI", metadata: { llcFee: 130, annualFee: 25, processingDays: "5-7" } },
  { value: "DC", label: "District of Columbia", code: "DC", metadata: { llcFee: 220, annualFee: 300, processingDays: "5-7" } },
];

// Currencies data
const currencies = [
  { value: "USD", label: "US Dollar", code: "USD", icon: "$", isPopular: true, metadata: { symbol: "$", decimals: 2 } },
  { value: "BDT", label: "Bangladeshi Taka", code: "BDT", icon: "৳", isPopular: true, metadata: { symbol: "৳", decimals: 2 } },
  { value: "INR", label: "Indian Rupee", code: "INR", icon: "₹", isPopular: true, metadata: { symbol: "₹", decimals: 2 } },
  { value: "PKR", label: "Pakistani Rupee", code: "PKR", icon: "₨", isPopular: true, metadata: { symbol: "₨", decimals: 2 } },
  { value: "AED", label: "UAE Dirham", code: "AED", icon: "د.إ", isPopular: true, metadata: { symbol: "د.إ", decimals: 2 } },
  { value: "EUR", label: "Euro", code: "EUR", icon: "€", isPopular: true, metadata: { symbol: "€", decimals: 2 } },
  { value: "GBP", label: "British Pound", code: "GBP", icon: "£", isPopular: true, metadata: { symbol: "£", decimals: 2 } },
  { value: "CAD", label: "Canadian Dollar", code: "CAD", icon: "C$", metadata: { symbol: "C$", decimals: 2 } },
  { value: "AUD", label: "Australian Dollar", code: "AUD", icon: "A$", metadata: { symbol: "A$", decimals: 2 } },
  { value: "SGD", label: "Singapore Dollar", code: "SGD", icon: "S$", metadata: { symbol: "S$", decimals: 2 } },
  { value: "MYR", label: "Malaysian Ringgit", code: "MYR", icon: "RM", metadata: { symbol: "RM", decimals: 2 } },
  { value: "SAR", label: "Saudi Riyal", code: "SAR", icon: "﷼", metadata: { symbol: "﷼", decimals: 2 } },
  { value: "QAR", label: "Qatari Riyal", code: "QAR", icon: "﷼", metadata: { symbol: "﷼", decimals: 2 } },
  { value: "CNY", label: "Chinese Yuan", code: "CNY", icon: "¥", metadata: { symbol: "¥", decimals: 2 } },
  { value: "JPY", label: "Japanese Yen", code: "JPY", icon: "¥", metadata: { symbol: "¥", decimals: 0 } },
  { value: "KRW", label: "South Korean Won", code: "KRW", icon: "₩", metadata: { symbol: "₩", decimals: 0 } },
];

// Business Types
const businessTypes = [
  { value: "ecommerce", label: "E-Commerce / Online Store" },
  { value: "dropshipping", label: "Dropshipping" },
  { value: "amazon_fba", label: "Amazon FBA" },
  { value: "saas", label: "SaaS / Software" },
  { value: "consulting", label: "Consulting / Professional Services" },
  { value: "freelance", label: "Freelancing" },
  { value: "real_estate", label: "Real Estate / Property" },
  { value: "import_export", label: "Import / Export" },
  { value: "digital_marketing", label: "Digital Marketing Agency" },
  { value: "content_creation", label: "Content Creation / YouTube" },
  { value: "cryptocurrency", label: "Cryptocurrency / Blockchain" },
  { value: "other", label: "Other" },
];

async function seedSystemLists() {
  console.log("🌱 Seeding system lists...\n");

  // Create Countries list
  console.log("🌍 Creating Countries list...");
  const countriesList = await prisma.systemList.upsert({
    where: { key: "countries" },
    update: {},
    create: {
      key: "countries",
      name: "Countries",
      description: "List of all countries with phone codes",
      type: "country",
      isEditable: false,
      isHierarchical: false,
    },
  });

  // Add country items
  for (let i = 0; i < countries.length; i++) {
    const country = countries[i];
    await prisma.systemListItem.upsert({
      where: { listId_value: { listId: countriesList.id, value: country.value } },
      update: {
        label: country.label,
        code: country.code,
        icon: country.icon,
        metadata: country.metadata,
        isPopular: country.isPopular || false,
        order: i,
      },
      create: {
        listId: countriesList.id,
        value: country.value,
        label: country.label,
        code: country.code,
        icon: country.icon,
        metadata: country.metadata,
        isPopular: country.isPopular || false,
        order: i,
      },
    });
  }
  console.log(`  ✓ ${countries.length} countries added\n`);

  // Create US States list
  console.log("🇺🇸 Creating US States list...");
  const statesList = await prisma.systemList.upsert({
    where: { key: "us_states" },
    update: {},
    create: {
      key: "us_states",
      name: "US States",
      description: "List of all US states with LLC fees",
      type: "state",
      isEditable: true,
      isHierarchical: false,
    },
  });

  // Add state items
  for (let i = 0; i < usStates.length; i++) {
    const state = usStates[i];
    await prisma.systemListItem.upsert({
      where: { listId_value: { listId: statesList.id, value: state.value } },
      update: {
        label: state.label,
        code: state.code,
        metadata: state.metadata,
        isPopular: state.isPopular || false,
        order: i,
      },
      create: {
        listId: statesList.id,
        value: state.value,
        label: state.label,
        code: state.code,
        metadata: state.metadata,
        isPopular: state.isPopular || false,
        order: i,
      },
    });
  }
  console.log(`  ✓ ${usStates.length} US states added\n`);

  // Create Currencies list
  console.log("💰 Creating Currencies list...");
  const currenciesList = await prisma.systemList.upsert({
    where: { key: "currencies" },
    update: {},
    create: {
      key: "currencies",
      name: "Currencies",
      description: "List of supported currencies",
      type: "currency",
      isEditable: false,
      isHierarchical: false,
    },
  });

  // Add currency items
  for (let i = 0; i < currencies.length; i++) {
    const currency = currencies[i];
    await prisma.systemListItem.upsert({
      where: { listId_value: { listId: currenciesList.id, value: currency.value } },
      update: {
        label: currency.label,
        code: currency.code,
        icon: currency.icon,
        metadata: currency.metadata,
        isPopular: currency.isPopular || false,
        order: i,
      },
      create: {
        listId: currenciesList.id,
        value: currency.value,
        label: currency.label,
        code: currency.code,
        icon: currency.icon,
        metadata: currency.metadata,
        isPopular: currency.isPopular || false,
        order: i,
      },
    });
  }
  console.log(`  ✓ ${currencies.length} currencies added\n`);

  // Create Business Types custom list
  console.log("📋 Creating Business Types list...");
  const businessTypesList = await prisma.customList.upsert({
    where: { key: "business_types" },
    update: {},
    create: {
      key: "business_types",
      name: "Business Types",
      description: "Common business types for LLC formation",
    },
  });

  // Add business type items
  for (let i = 0; i < businessTypes.length; i++) {
    const type = businessTypes[i];
    const existing = await prisma.customListItem.findFirst({
      where: { listId: businessTypesList.id, value: type.value },
    });

    if (!existing) {
      await prisma.customListItem.create({
        data: {
          listId: businessTypesList.id,
          value: type.value,
          label: type.label,
          order: i,
        },
      });
    }
  }
  console.log(`  ✓ ${businessTypes.length} business types added\n`);

  console.log("✅ System lists seeding completed!");
}

// Main execution
seedSystemLists()
  .catch((e) => {
    console.error("Error seeding system lists:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
