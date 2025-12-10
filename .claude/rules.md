# LLCPad Project Rules

## Project Overview
This is a **US LLC Formation & Amazon Seller Services** website for international entrepreneurs (primarily from Bangladesh, India, Pakistan, UAE).

**Vision:** "Empower global entrepreneurs to launch legitimate US businesses and Amazon stores with zero complexity"

## Tech Stack (December 2025 - Latest Stable)

| Technology | Version | Notes |
|------------|---------|-------|
| Next.js | 16.0.7+ | App Router, Turbopack, React Compiler (⚠️ CVE-2025-66478 fix) |
| TypeScript | 5.9.x | Strict mode enabled |
| TailwindCSS | 4.1.x | CSS-native, zero config |
| shadcn/ui | Latest CLI | Use `npx shadcn@latest` |
| PostgreSQL | 18.x | Self-hosted on VPS |
| Prisma | 7.1.x | Rust-free, mapped enums |
| NextAuth.js | 5.x | Auth.js, Email/OTP/Google |
| Zod | 4.1.x | Schema validation |
| TanStack Query | 5.90.x | Server state management |

## Project Structure

```
llcpad/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (public)/           # Public pages (home, services, pricing)
│   │   ├── (auth)/             # Login, Register, Forgot password
│   │   ├── dashboard/          # Customer dashboard
│   │   ├── admin/              # Admin dashboard
│   │   └── api/                # API routes
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── forms/              # Form components
│   │   ├── layout/             # Header, Footer, Sidebar
│   │   └── sections/           # Homepage sections
│   ├── lib/
│   │   ├── db.ts               # Prisma client
│   │   ├── auth.ts             # NextAuth config
│   │   ├── stripe.ts           # Stripe config
│   │   ├── email.ts            # Resend config
│   │   └── utils.ts            # Helper functions
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript types
│   └── styles/                 # Global styles
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Seed data
├── public/                     # Static assets
├── emails/                     # React Email templates
├── docker-compose.yml          # Docker config for VPS
├── Dockerfile                  # App container
└── tests/                      # Test files
```

## Coding Standards

### General Rules
- Always use TypeScript with strict mode
- Use Zod for all form validation and API input validation
- Use TanStack Query for server state, Zustand for client state
- Follow Next.js 16 App Router conventions
- Use Server Components by default, Client Components only when needed
- Use `use cache` for data that can be cached

### Naming Conventions
- Files: kebab-case (`user-profile.tsx`)
- Components: PascalCase (`UserProfile`)
- Functions/Variables: camelCase (`getUserById`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
- Database tables: snake_case (`order_items`)

### Component Structure
```tsx
// 1. Imports
// 2. Types/Interfaces
// 3. Component
// 4. Export
```

### API Routes
- Use Route Handlers in `app/api/`
- Always validate input with Zod
- Return consistent JSON responses: `{ success: boolean, data?: T, error?: string }`

## Database Schema (Core Tables)

```prisma
// Users, Orders, Packages, Services, Documents, Payments, Blog, Testimonials
// See service_selling_website_plan.md for full schema
```

## Services Offered
1. US LLC Formation
2. EIN Application
3. Amazon Seller Account Creation
4. Amazon Brand Registry
5. Virtual US Address
6. Business Banking Assistance
7. Ongoing Compliance
8. Trademark Registration

## User Roles
- **Customer/Seller**: Basic access (dashboard, orders, documents)
- **Admin**: Full access (everything)
- **Content Manager**: Blog, Testimonials, FAQs only
- **Sales Agent**: Orders, Customer communication
- **Support Agent**: Orders, Tickets, Document status

## Payment Integration
- **Stripe**: International (USD, EUR, GBP)
- **SSLCommerz**: Bangladesh (BDT)
- Webhook handling required for both

## Key URLs Structure
- `/` - Homepage
- `/services/[slug]` - Individual service pages
- `/pricing` - Dynamic pricing page
- `/llc/[state]` - State-specific landing pages (SEO)
- `/blog/[slug]` - Blog posts
- `/dashboard` - Customer dashboard
- `/admin` - Admin dashboard

## Environment Variables Required
```
DATABASE_URL, AUTH_SECRET, AUTH_URL, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET,
STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET,
SSLCOMMERZ_STORE_ID, SSLCOMMERZ_STORE_PASSWORD,
CLOUDFLARE_R2_ACCESS_KEY, CLOUDFLARE_R2_SECRET_KEY, CLOUDFLARE_R2_BUCKET,
RESEND_API_KEY, NEXT_PUBLIC_GA_ID, SENTRY_DSN
```

## Important Notes
- This is NOT a law firm - always include disclaimers
- Target audience is primarily non-US residents
- Support both USD and BDT currency
- Mobile-first responsive design
- SEO is critical - use proper meta tags, schema markup
- All prices are editable from admin dashboard
- Document uploads must be secure (encrypted storage)

## Reference Document
For full project specifications, see: `service_selling_website_plan.md`
