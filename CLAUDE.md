# CLAUDE.md - LLCPad Project

## Quick Reference

**Project:** US LLC Formation & Amazon Seller Services Website (CodeCanyon CMS)
**Stack:** Next.js 16.0.7+ + TypeScript 5.9 + Tailwind 4.1 + PostgreSQL 18 + Prisma 7
**Security:** Must use Next.js 16.0.7+ (CVE-2025-66478 RCE fix)
**Target:** International entrepreneurs (BD, India, Pakistan, UAE)
**Deployment:** Single VPS (Hetzner/Contabo) - NOT microservices

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

---

## Caching & Performance Rules

### Server Component Caching

```tsx
// Use cache() for request memoization
import { cache } from 'react';

export const getService = cache(async (id: string) => {
  return await db.service.findUnique({ where: { id } });
});
```

### Data Cache with unstable_cache

```tsx
import { unstable_cache } from 'next/cache';

const getCachedServices = unstable_cache(
  async () => await db.service.findMany({ where: { published: true } }),
  ['services-cache'],
  { tags: ['services'], revalidate: 3600 }
);
```

### Revalidation

```tsx
// Time-based
export const revalidate = 3600; // 1 hour

// On-demand (after admin updates)
import { revalidatePath, revalidateTag } from 'next/cache';
revalidatePath('/services');
revalidateTag('services');
```

### Static vs Dynamic

```tsx
// Force static for marketing pages
export const dynamic = 'force-static';

// Force dynamic for user-specific pages
export const dynamic = 'force-dynamic';
```

---

## Web Design Guidelines

### Spacing System (4px base)

| Token | Value | Usage |
|-------|-------|-------|
| space-1 | 4px | Tight spacing |
| space-2 | 8px | Small gaps |
| space-4 | 16px | Default padding |
| space-6 | 24px | Section spacing |
| space-8 | 32px | Large gaps |

### Typography Scale

| Size | Value | Usage |
|------|-------|-------|
| text-sm | 14px | Secondary text |
| text-base | 16px | Body text |
| text-lg | 18px | Emphasized text |
| text-xl | 20px | Small headings |
| text-2xl | 24px | Section titles |
| text-4xl | 36px | Page titles |

### Color Contrast (WCAG AA)

- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum

### Touch Targets

- Minimum size: 44x44px
- Spacing between interactive elements: 8px+

### Animation Durations

- Micro-interactions: 100-200ms
- Small transitions: 200-300ms
- Medium transitions: 300-500ms

```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}
```

---

## Accessibility Checklist

- [ ] All images have descriptive alt text
- [ ] Form inputs have associated labels
- [ ] Color is not the only indicator of meaning
- [ ] Focus states are visible
- [ ] Page has proper heading hierarchy (h1 > h2 > h3)
- [ ] Interactive elements are keyboard accessible
- [ ] ARIA labels used where needed

---

## Database Best Practices

### Indexing (add to schema.prisma)

```prisma
model Service {
  id        String   @id @default(cuid())
  title     String
  slug      String   @unique
  published Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([published, createdAt(sort: Desc)])
  @@index([title])
}
```

### Connection Pooling

Already handled by Prisma. For high traffic, consider PgBouncer.

---

## NOT Applicable (CodeCanyon CMS)

These advanced patterns are NOT needed for this project:

- Database sharding
- Read replicas
- Kubernetes / container orchestration
- Microservices architecture
- Horizontal auto-scaling
- Redis cluster
- Message queues (BullMQ)
- Turborepo / monorepo

## Setup Later

- Docker deployment (VPS) - will configure at the end

---

## Git Commit Policy

**CRITICAL:** When creating git commits:
- NEVER add "Co-Authored-By: Claude" or any AI attribution
- NEVER add "Generated with Claude Code" or similar messages
- Only use the project owner's name and email (from git config)
- Keep commit messages clean and professional

---

## Important Business Rules

- Always include legal disclaimers (not a law firm)
- Support USD + BDT currencies
- Mobile-first, SEO optimized
- All prices editable from admin dashboard
