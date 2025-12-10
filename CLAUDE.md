# CLAUDE.md - LLCPad Project

## Quick Reference

**Project:** US LLC Formation & Amazon Seller Services Website
**Stack:** Next.js 16.0.7+ + TypeScript 5.9 + Tailwind 4.1 + PostgreSQL 18 + Prisma 7
**Security:** ⚠️ Must use Next.js 16.0.7+ (CVE-2025-66478 RCE fix)
**Target:** International entrepreneurs (BD, India, Pakistan, UAE)

## Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests

# Database
npx prisma generate  # Generate Prisma client
npx prisma migrate dev   # Run migrations
npx prisma studio    # Open Prisma Studio
npx prisma db seed   # Seed database

# shadcn/ui
npx shadcn@latest add [component]  # Add component
```

## Key Files

| File | Purpose |
|------|---------|
| `service_selling_website_plan.md` | Full project specification |
| `prisma/schema.prisma` | Database schema |
| `src/lib/auth.ts` | NextAuth configuration |
| `src/lib/db.ts` | Prisma client singleton |

## Architecture Decisions

1. **App Router** - Use Next.js 16 App Router with Server Components
2. **VPS Hosting** - Self-hosted on Hetzner/Contabo (not Vercel)
3. **Dual Payment** - Stripe (international) + SSLCommerz (Bangladesh)
4. **File Storage** - Cloudflare R2 for document uploads

## Services

- LLC Formation, EIN, Registered Agent
- Amazon Seller Account, Brand Registry
- Virtual Address, Business Banking
- Compliance, Trademark

## User Roles

`customer` | `admin` | `content_manager` | `sales_agent` | `support_agent`

## Important

- Always include legal disclaimers (not a law firm)
- Support USD + BDT currencies
- Mobile-first, SEO optimized
- All prices editable from admin dashboard
