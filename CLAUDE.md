# CLAUDE.md - Ceremoney Project

## Quick Reference

**Project:** Ceremoney — Multi-event Digital Planning Platform (SaaS)
**Stack:** Next.js 15 (App Router) + TypeScript 5.9 + Tailwind 4 + PostgreSQL + Prisma 7
**Target Markets:** Sweden (primary), Global English, Arabic (full RTL)
**Event Types:** Wedding, Baptism, Party, Corporate
**Deployment:** Vercel (Next.js frontend) + AWS ECS (API) + RDS + S3 + CloudFront

## Commands

```bash
# Development
npm run dev          # Start dev server (Turbopack)
npm run dev:socket   # Start Socket.io server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes to DB
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database

# shadcn/ui
npx shadcn@latest add [component]  # Add component
```

## Key Files

| File | Purpose |
|------|---------|
| `docs/Weedding plan/wedding planner DEVELOPMENT-PLAN.md` | Full project specification & phase status |
| `prisma/schema.prisma` | Database schema |
| `src/lib/auth.ts` | NextAuth configuration |
| `src/lib/db.ts` | Prisma client singleton |
| `src/lib/planner-storage.ts` | localStorage CRUD helpers for anonymous/local projects |

## Architecture Decisions

1. **App Router** — Next.js 15 App Router with Server Components
2. **Dual Mode** — Anonymous mode (localStorage) + Authenticated mode (DB/API)
3. **Real-time** — Socket.io for collaborative editing and live preview
4. **Canvas** — Konva.js for seating chart and invitation designer
5. **Payments** — Stripe (global) + Swish (Sweden) + Klarna (BNPL)
6. **Storage** — AWS S3 + CloudFront CDN (presigned URLs for direct upload)
7. **i18n** — next-intl with SE, EN, AR (full RTL support)
8. **State** — Zustand (client state) + TanStack React Query (server state)

## User Roles & Permissions

| Role | Access Level | Capabilities |
|------|-------------|-------------|
| `super_admin` | Full platform | All settings, financials, user management, vendor approvals |
| `admin` | Operational | User support, content moderation, vendor management |
| `vendor` | Own profile | Edit business profile, view inquiries, manage availability |
| `customer` | Own projects | Create/manage events, guests, website, billing |
| `collaborator` | Shared project | View/edit guest list (restricted; granted by host — Elite only) |
| `guest` | RSVP only | Submit RSVP; view seating info via QR |

## Pricing Tiers

| Plan | Price | Key Features |
|------|-------|-------------|
| Basic | Free | Event website, basic RSVP, checklist, vendor directory |
| Premium | 299 SEK/mo | Guest list, seating chart, custom domain, export PDF/XLS |
| Elite | 499 SEK/mo | Stationery engine, QR entrance, collaborators, SMS credits |
| Vendor | $19/mo | Business profile, directory listing, portfolio, reviews |
| White-Label | $120/mo | Custom subdomain, own branding, auto-premium projects |

---

## MANDATORY IMPLEMENTATION RULES

> These rules apply to **every single task** in every phase. No exceptions.

### Rule 1 — Codebase Analysis First (ALWAYS)

**Before writing a single line of code**, you MUST:

1. Read ALL relevant existing files — models, API routes, components, types, hooks, layouts, middleware, `prisma/schema.prisma`, `planner-storage.ts`
2. Understand existing patterns — how auth works, how API routes are structured, how localStorage dual-mode works
3. Identify what already exists and can be reused vs what needs to be created
4. Identify potential conflicts or breaking changes

> ❌ NEVER start implementing without reading the codebase first
> ✅ ALWAYS analyze before coding, every single time

### Rule 2 — Fullstack Implementation Only (NO UI Mockups)

Every task must be implemented **end-to-end, fully functional**:

| Layer | Required |
|-------|---------|
| DB schema (Prisma) | ✅ |
| Migration applied | ✅ |
| `npx prisma generate` run | ✅ |
| API routes (GET/POST/PUT/DELETE) | ✅ |
| Backend logic in `/lib` | ✅ |
| localStorage helpers in `planner-storage.ts` | ✅ |
| Frontend UI (all states) | ✅ |
| TypeScript types | ✅ |

> ❌ NEVER deliver a UI mockup or placeholder as a completed task
> ✅ ALWAYS support both anonymous (localStorage) and authenticated (API/DB) modes

### Rule 3 — Checklist Verification After Every Task

- [ ] DB schema updated in `prisma/schema.prisma`
- [ ] Migration applied
- [ ] `npx prisma generate` run
- [ ] API endpoints tested (GET, POST, PUT, DELETE)
- [ ] API returns 401 for unauthenticated requests where required
- [ ] localStorage helpers added to `planner-storage.ts`
- [ ] UI renders correctly — loading, error, empty, populated states
- [ ] Forms validate input and show error messages
- [ ] `npx tsc --noEmit` — zero TypeScript errors
- [ ] No `console.log` or debug statements
- [ ] Auth/permissions correct (local vs DB project)
- [ ] Mobile layout works (responsive)

### Rule 4 — Codebase Cleanup After Every Phase

1. Remove stub/placeholder pages replaced in this phase
2. Remove unused imports, variables, functions, components
3. Remove all `console.log` and debug statements
4. Remove dead code — commented-out blocks, TODO comments
5. `npx tsc --noEmit` — zero TypeScript errors
6. `npm run lint` — zero ESLint errors

### Rule 5 — Phase Status Tracking

Update `docs/Weedding plan/wedding planner DEVELOPMENT-PLAN.md` after each phase with:
- Status label: `⬜ NOT STARTED` / `🔄 IN PROGRESS` / `✅ IMPLEMENTATION DONE`
- Files created/modified
- Any deviations from original plan

---

## Caching & Performance Rules

### Server Component Caching

```tsx
import { cache } from 'react';

export const getEvent = cache(async (id: string) => {
  return await db.event.findUnique({ where: { id } });
});
```

### Data Cache with unstable_cache

```tsx
import { unstable_cache } from 'next/cache';

const getCachedVendors = unstable_cache(
  async () => await db.vendor.findMany({ where: { approved: true } }),
  ['vendors-cache'],
  { tags: ['vendors'], revalidate: 3600 }
);
```

### Revalidation

```tsx
// Time-based
export const revalidate = 3600;

// On-demand
import { revalidatePath, revalidateTag } from 'next/cache';
revalidatePath('/vendors');
revalidateTag('vendors');
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

### RTL Support (Arabic)

- Use `next-intl` for all i18n
- Test all layouts in RTL mode
- Typography: Inter (SE/EN), Cairo or IBM Plex Sans Arabic (AR)
- Never use directional CSS (left/right) — use logical properties (start/end)

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
- [ ] RTL layout tested for Arabic

---

## Database Best Practices

### Indexing

```prisma
model Event {
  id        String   @id @default(cuid())
  slug      String   @unique
  published Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([published, createdAt(sort: Desc)])
}
```

### Connection Pooling

Handled by Prisma. For high traffic, consider PgBouncer.

---

## Swedish Market Compliance

- **Swish** mobile payments for Swedish users
- **Klarna** BNPL/installment options
- **Auto PDF Kvitto** (receipts) with Org.nr, Moms (25% VAT), invoice number
- **Stripe Tax** or manual VAT calculation for Swedish users
- **Stripe Customer Portal** — users manage subscription, download invoices

---

## NOT Applicable

- Database sharding
- Kubernetes / container orchestration
- Microservices architecture
- Horizontal auto-scaling
- Redis cluster (Redis IS used — but single instance, not cluster)
- Turborepo / monorepo

## Setup Later

- Docker deployment (production) — will configure at the end

---

## Git Commit Policy

**CRITICAL:** When creating git commits:
- NEVER add "Co-Authored-By: Claude" or any AI attribution
- NEVER add "Generated with Claude Code" or similar messages
- Only use the project owner's name and email (from git config)
- Keep commit messages clean and professional

---

## Important Business Rules

- Support SEK (Sweden primary), USD (global), and BDT as needed
- Mobile-first, SEO optimized
- All prices editable from admin dashboard
- Swedish VAT (25% Moms) applied for Swedish users
- White-label subdomains: `weddings.CUSTOMER-DOMAIN.com`
