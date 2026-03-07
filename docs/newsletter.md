# Newsletter & Email Campaign System — Implementation Plan

## Context
The footer newsletter widget is UI-only (no backend). We need a full newsletter system: subscribe/unsubscribe flow, email campaigns with WYSIWYG editor, blog auto-email on publish, email templates, scheduling, and analytics (open/click tracking). Existing infrastructure: Nodemailer SMTP (`src/lib/email.ts`), Lead model for CRM, `Setting` key-value store for config.

**User decisions:** Store subscribers in Lead model (source=NEWSLETTER), single opt-in, full campaign system with analytics.

---

## Architectural Guidelines (from implementation-plan.md & theme.md)

> These rules apply to every feature in this system. Follow them strictly.

### Implementation Rules

| Rule | Description |
|------|-------------|
| **Full-Stack Implementation** | শুধু UI বানালে হবে না। Database + Backend API + Frontend সব একসাথে করতে হবে |
| **API Routes Only (No Server Actions)** | Data mutations সব `/api/*` route handlers দিয়ে হবে। Server Actions ব্যবহার করা যাবে না। কারণ: ভবিষ্যতে Mobile App, external services — সব same API call করবে |
| **Role-Based Access** | প্রতিটি admin API route এ `checkAdminOnly()` বা `checkAdminAccess()` check থাকতে হবে — কোনো admin route unprotected রাখা যাবে না |
| **Zod Validation** | প্রতিটি POST/PUT API route এ Zod schema দিয়ে input validate করতে হবে |
| **Consistent API Response** | Format: `{ success: boolean, data?: T, error?: string, details?: string }` |
| **Menu Updates** | নতুন page add করলে sidebar navigation তেও add করতে হবে |
| **Test After Each Phase** | প্রতিটি phase শেষ করার পর manually test করতে হবে + `npm run build` pass করতে হবে |

### Per-Feature Implementation Order

```
1️⃣ Database Schema Changes (prisma/schema.prisma)
   └─► 2️⃣ Run Migration (npx prisma migrate dev / db push)
       └─► 3️⃣ API Routes with Zod Validation
           └─► 4️⃣ Frontend Pages (admin UI)
               └─► 5️⃣ Sidebar/Navigation Updates
                   └─► 6️⃣ Email Templates & Notifications
                       └─► 7️⃣ Testing (all roles, edge cases, build check)
```

### Existing Patterns to Follow

| Pattern | Where to find reference |
|---------|----------------------|
| Admin auth check | `import { checkAdminOnly } from "@/lib/admin-auth"` — used in all `/api/admin/*` routes |
| Settings read/write | `getSetting()` / `setSetting()` from `src/lib/settings.ts` — key-value store in `Setting` model |
| Email sending | `sendEmail()` from `src/lib/email.ts` — Nodemailer SMTP, reads config from Setting model |
| Lead creation with dedup | `src/app/api/leads/route.ts` — checks existing lead by email, auto-scores, fires notification emails |
| Admin data table pages | `src/app/admin/leads/page.tsx` — example of paginated list with search, filters, bulk actions |
| CRUD API with Zod | `src/app/api/admin/footer/route.ts` — GET/POST/PUT with Zod validation schema |
| Rich text editor | `src/components/admin/ui/rich-text-editor.tsx` — SunEditor wrapper, reuse for campaign body editor |
| Sidebar nav items | `src/components/admin/sidebar.tsx` — static array, add "Marketing" section here |

### Theme System Integration

When implementing newsletter settings, keep in mind:
- Theme `data.json` includes footer config, color palette, widget defaults
- Newsletter settings should be exportable/importable with themes in future
- Newsletter subscription status is per-Lead (not per-theme), so subscriber data survives theme switches
- The `theme-importer.ts` may need updating later to include newsletter settings in theme data

---

## Phase A: Database Schema + Core Library (Foundation)

### Schema Changes (`prisma/schema.prisma`)

**1. Add `NEWSLETTER` to `LeadSource` enum**

**2. Add newsletter fields to `Lead` model:**
```prisma
newsletterSubscribed  Boolean   @default(false)
newsletterToken       String?   @unique    // HMAC unsubscribe token
newsletterUnsubAt     DateTime?
@@index([newsletterSubscribed])
```

**3. New enum + 3 models:**
```prisma
enum CampaignStatus { DRAFT, SCHEDULED, SENDING, SENT, CANCELLED, FAILED }

model EmailTemplate {
  id          String     @id @default(cuid())
  name        String
  subject     String
  body        String     // HTML string
  variables   String[]   // e.g. ["firstName", "email", "unsubscribeUrl"]
  isDefault   Boolean    @default(false)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  campaigns   EmailCampaign[]

  @@index([isDefault])
}

model EmailCampaign {
  id              String              @id @default(cuid())
  subject         String
  previewText     String?
  body            String              // HTML, supports {{firstName}} etc.
  templateId      String?
  template        EmailTemplate?      @relation(fields: [templateId], references: [id], onDelete: SetNull)
  status          CampaignStatus      @default(DRAFT)
  scheduledAt     DateTime?
  sentAt          DateTime?
  createdById     String?
  audienceFilter  Json?               // e.g. {"countries":["BD","IN"],"sources":["NEWSLETTER"]}
  totalRecipients Int                 @default(0)
  sentCount       Int                 @default(0)
  openCount       Int                 @default(0)
  clickCount      Int                 @default(0)
  blogPostId      String?             // if auto-triggered by blog publish
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt
  recipients      EmailCampaignRecipient[]

  @@index([status])
  @@index([scheduledAt])
  @@index([createdAt])
  @@index([blogPostId])
}

model EmailCampaignRecipient {
  id           String        @id @default(cuid())
  campaignId   String
  campaign     EmailCampaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  leadId       String
  email        String
  firstName    String
  status       String        @default("PENDING") // PENDING | SENT | FAILED | BOUNCED
  sentAt       DateTime?
  errorMessage String?
  openedAt     DateTime?
  openCount    Int           @default(0)
  clickedAt    DateTime?
  clickCount   Int           @default(0)
  unsubscribed Boolean       @default(false)
  createdAt    DateTime      @default(now())

  @@unique([campaignId, leadId])
  @@index([campaignId])
  @@index([leadId])
  @@index([status])
  @@index([email])
}
```

### Core Library Files (all new)

| File | Purpose |
|------|---------|
| `src/lib/newsletter/token.ts` | HMAC-based unsubscribe token generation/verification using `AUTH_SECRET` |
| `src/lib/newsletter/template-renderer.ts` | Replace `{{firstName}}`, `{{email}}`, `{{unsubscribeUrl}}` etc. in HTML |
| `src/lib/newsletter/email-wrapper.ts` | Wrap campaign body in branded HTML email layout + tracking pixel + unsubscribe footer |
| `src/lib/newsletter/campaign-sender.ts` | Batch processor: 50 emails/batch, 2s delay, injects tracking URLs, calls `sendEmail()` |
| `src/lib/newsletter/blog-auto-email.ts` | Creates campaign + recipients when blog post is published |
| `src/lib/newsletter/settings.ts` | Constants: `newsletter.autoEmail.enabled`, `newsletter.welcomeEmail.enabled`, etc. |
| `src/lib/newsletter/default-templates.ts` | 3 default templates: Welcome, Blog Notification, Announcement |

---

## Phase B: Subscribe/Unsubscribe Flow

### API Routes (new)

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/newsletter/subscribe` | POST | Public | `{email, firstName?}` → Create/update Lead with source=NEWSLETTER, newsletterSubscribed=true |
| `/api/newsletter/unsubscribe` | GET | Token | `?token=xxx` → Mark Lead unsubscribed, redirect to confirmation page |

### Subscribe Logic
1. Validate: `email` (required), `firstName` (optional, defaults to "Subscriber")
2. Look up existing Lead by email
3. **If exists and `newsletterSubscribed=true`**: return `{ success: true, alreadySubscribed: true }`
4. **If exists and `newsletterSubscribed=false`**: update `newsletterSubscribed=true`, clear `newsletterUnsubAt`, generate `newsletterToken`
5. **If not exists**: create new Lead with `source=NEWSLETTER`, `newsletterSubscribed=true`, generate token
6. If welcome email setting enabled, fire `sendWelcomeEmail()` non-blocking
7. Return `{ success: true }`

### Unsubscribe Logic
1. Find Lead where `newsletterToken = token`
2. If not found: redirect to `/newsletter/unsubscribed?status=invalid`
3. Update: `newsletterSubscribed=false`, `newsletterUnsubAt=now()`
4. Redirect to `/newsletter/unsubscribed?status=ok`

### Pages (new)
- `src/app/newsletter/unsubscribed/page.tsx` — "You've been unsubscribed" confirmation page

### Footer Widget Fix (`src/components/layout/footer.tsx`)
Wire the NEWSLETTER widget's `onSubmit` to POST `/api/newsletter/subscribe`. Add `useState` for email input, loading state, and success/error feedback message.

---

## Phase C: Campaign CRUD + Admin UI

### API Routes (new, all admin-auth)

| Route | Purpose |
|-------|---------|
| `/api/admin/campaigns` | GET (list with pagination) + POST (create draft) |
| `/api/admin/campaigns/[id]` | GET (detail with stats) + PUT (update draft only) + DELETE (draft/cancelled only) |
| `/api/admin/campaigns/[id]/send` | POST — build recipients from audienceFilter, start sending |
| `/api/admin/campaigns/[id]/process` | POST — process next batch (called by cron or admin) |
| `/api/admin/campaigns/[id]/preview` | POST `{email}` — send test email to specified address |
| `/api/admin/campaigns/process-scheduled` | POST — cron route, picks up scheduled + continues sending campaigns |
| `/api/admin/email-templates` | GET (list) + POST (create) |
| `/api/admin/email-templates/[id]` | GET + PUT + DELETE |
| `/api/admin/newsletter/stats` | GET — totalSubscribers, newThisMonth, unsubscribesThisMonth, topCountries |
| `/api/admin/newsletter/subscribers` | GET (paginated, searchable) + DELETE (bulk unsubscribe) |
| `/api/admin/newsletter/settings` | GET + POST — newsletter-specific settings via Setting model |

### Admin UI Pages (new)

| Page | Purpose |
|------|---------|
| `/admin/marketing/newsletter` | Subscriber overview: stats cards + subscriber table + export CSV |
| `/admin/marketing/campaigns` | Campaign list: subject, status badge, open/click rate, actions |
| `/admin/marketing/campaigns/new` | Create campaign: subject, body (RichTextEditor/SunEditor), audience filter, schedule |
| `/admin/marketing/campaigns/[id]` | Campaign detail + analytics: delivery/open/click rates, recipient table |
| `/admin/marketing/campaigns/[id]/edit` | Edit draft campaign |
| `/admin/marketing/templates` | Email template list + CRUD |
| `/admin/marketing/templates/[id]` | Edit template with RichTextEditor |

### Campaign Composer Features
- Subject & Preview Text inputs
- Email Body — reuse existing `RichTextEditor` (SunEditor) component
- Variable hints — display chip list: `{{firstName}}`, `{{email}}`, `{{unsubscribeUrl}}`, `{{siteUrl}}`
- Audience — checkboxes for sources + multi-select for countries + live "estimated recipients" counter
- Schedule — radio: "Send Now" or "Schedule for Later" (datetime-local picker)
- Actions — Save Draft / Preview (dialog with test email) / Send

### Sidebar Update (`src/components/admin/sidebar.tsx`)
Add "Marketing" section (Megaphone icon) with: Newsletter, Campaigns, Email Templates

---

## Phase D: Tracking & Analytics

### Tracking Routes (new, public, no auth)

| Route | Purpose |
|-------|---------|
| `/api/newsletter/track/open?r={recipientId}` | Returns 1x1 transparent GIF, increments openCount |
| `/api/newsletter/track/click?r={recipientId}&url={encoded}` | Increments clickCount, 302 redirects to actual URL |

### How Tracking Works
The `campaign-sender.ts` injects tracking into email HTML before sending:
- Appends `<img src="{APP_URL}/api/newsletter/track/open?r={recipientId}">` tracking pixel
- Rewrites all `<a href="URL">` to `<a href="{APP_URL}/api/newsletter/track/click?r={recipientId}&url={encodedURL}">`

### Analytics Calculations
- **Open rate** = `openCount / sentCount * 100` (underreported — many clients block images)
- **Click rate** = `uniqueClickedRecipients / sentCount * 100`
- **Delivery rate** = `sentCount / totalRecipients * 100`

### 1x1 Transparent GIF (tracking pixel response)
```ts
Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAEALAAAAAABAAEAAAICTAEAOw==", "base64")
```

---

## Phase E: Blog Auto-Email

### Modify: `src/app/api/admin/blog/[id]/route.ts`
In the PUT handler, when `status` changes to `PUBLISHED`:
```ts
if (body.status === "PUBLISHED" && existingPost?.status !== "PUBLISHED") {
  triggerBlogAutoEmail(id).catch(console.error); // fire and forget
}
```

### `triggerBlogAutoEmail()` Logic
1. Check setting: `newsletter.autoEmail.enabled === "true"`
2. Get all newsletter subscribers: `Lead WHERE newsletterSubscribed=true`
3. Create `EmailCampaign` with `status=SENDING`, `blogPostId`
4. Bulk create `EmailCampaignRecipient` rows
5. Kick off first batch via `processCampaignBatch()`

### Newsletter Settings (add to existing email settings page)
Modify: `src/app/admin/settings/email/page.tsx` — add "Newsletter" section:
- Enable blog auto-email toggle
- Enable welcome email on subscribe toggle
- Auto-email template selector
- Welcome email template selector

---

## Phase F: Background Jobs (VPS Cron)

### Cron setup (VPS)
```bash
*/5 * * * * curl -s -X POST http://localhost:3000/api/admin/campaigns/process-scheduled \
  -H "x-cron-secret: $CRON_SECRET" > /dev/null 2>&1
```

This handles:
1. Picking up `SCHEDULED` campaigns whose `scheduledAt <= now()`
2. Continuing `SENDING` campaigns (processes next batch of 50)

### Rate limiting
50 emails/batch, 2 second delay between batches = ~1,500 emails/min max.
Configurable via `newsletter.batch.size` and `newsletter.batch.delayMs` settings.

### Batch Sending Logic (`campaign-sender.ts`)
```
BATCH_SIZE = 50
BATCH_DELAY_MS = 2000

processCampaignBatch(campaignId):
  1. Load campaign + next BATCH_SIZE PENDING recipients
  2. For each recipient:
     a. Build personalized HTML (renderTemplate + wrapCampaignEmail)
     b. Inject tracking pixel URL
     c. Replace all <a href> with click-tracked redirects
     d. Call sendEmail()
     e. Update recipient status = "SENT" | "FAILED"
  3. Update campaign.sentCount
  4. If all recipients processed: status = "SENT", sentAt = now()
  5. Return { processed, errors, done }
```

For immediate sends from admin: send first batch inline, return 202, cron handles the rest.

---

## Template Variables

| Variable | Source |
|----------|--------|
| `{{firstName}}` | Lead.firstName |
| `{{email}}` | Lead.email |
| `{{unsubscribeUrl}}` | `/api/newsletter/unsubscribe?token={lead.newsletterToken}` |
| `{{siteUrl}}` | `NEXT_PUBLIC_APP_URL` |
| `{{companyName}}` | `email.from.name` setting |
| `{{blogTitle}}` | BlogPost.title (blog emails only) |
| `{{blogExcerpt}}` | BlogPost.excerpt |
| `{{blogUrl}}` | `/blog/${slug}` |
| `{{blogCoverImage}}` | BlogPost.coverImage |

---

## Default Email Templates (seeded)

### 1. Welcome Email
- Subject: "Welcome to {{companyName}}!"
- Body: Branded header, "You're now subscribed" message, "Explore our services" CTA
- Footer: Unsubscribe link

### 2. Blog Notification
- Subject: "New Post: {{blogTitle}}"
- Body: Cover image, title, excerpt, "Read the full post →" CTA
- Footer: Unsubscribe link

### 3. General Announcement
- Subject: "{{subject}}"
- Body: Generic content area, CTA button
- Footer: Unsubscribe link

---

## All File Paths

### New files to create

```
# Core library
src/lib/newsletter/token.ts
src/lib/newsletter/template-renderer.ts
src/lib/newsletter/email-wrapper.ts
src/lib/newsletter/campaign-sender.ts
src/lib/newsletter/blog-auto-email.ts
src/lib/newsletter/settings.ts
src/lib/newsletter/default-templates.ts

# Public API routes
src/app/api/newsletter/subscribe/route.ts
src/app/api/newsletter/unsubscribe/route.ts
src/app/api/newsletter/track/open/route.ts
src/app/api/newsletter/track/click/route.ts

# Public pages
src/app/newsletter/unsubscribed/page.tsx

# Admin API routes
src/app/api/admin/campaigns/route.ts
src/app/api/admin/campaigns/[id]/route.ts
src/app/api/admin/campaigns/[id]/send/route.ts
src/app/api/admin/campaigns/[id]/process/route.ts
src/app/api/admin/campaigns/[id]/preview/route.ts
src/app/api/admin/campaigns/process-scheduled/route.ts
src/app/api/admin/email-templates/route.ts
src/app/api/admin/email-templates/[id]/route.ts
src/app/api/admin/newsletter/stats/route.ts
src/app/api/admin/newsletter/subscribers/route.ts
src/app/api/admin/newsletter/settings/route.ts

# Admin UI pages
src/app/admin/marketing/newsletter/page.tsx
src/app/admin/marketing/campaigns/page.tsx
src/app/admin/marketing/campaigns/new/page.tsx
src/app/admin/marketing/campaigns/[id]/page.tsx
src/app/admin/marketing/campaigns/[id]/edit/page.tsx
src/app/admin/marketing/templates/page.tsx
src/app/admin/marketing/templates/[id]/page.tsx
```

### Existing files to modify

```
prisma/schema.prisma                          — Add NEWSLETTER to LeadSource, newsletter fields on Lead, 3 new models
src/components/layout/footer.tsx               — Wire NEWSLETTER widget form to subscribe API
src/app/api/admin/blog/[id]/route.ts           — Call triggerBlogAutoEmail() on publish
src/components/admin/sidebar.tsx               — Add Marketing section with Newsletter, Campaigns, Templates
src/app/admin/settings/email/page.tsx          — Add Newsletter settings section
```

---

## Implementation Order

1. **Phase A** — Schema migration + library files
2. **Phase B** — Subscribe/unsubscribe flow + footer widget wiring
3. **Phase C** — Campaign CRUD + admin UI pages
4. **Phase D** — Tracking (open pixel + click redirect)
5. **Phase E** — Blog auto-email integration
6. **Phase F** — Cron setup + default template seeding

---

## Verification Checklist

1. **Subscribe:** Footer widget → enter email → Lead created with `source=NEWSLETTER`, `newsletterSubscribed=true`
2. **Unsubscribe:** Click unsubscribe link in email → Lead marked `newsletterSubscribed=false` → confirmation page shown
3. **Campaign CRUD:** Create draft → edit → preview (test email to admin) → send → check recipient statuses in DB
4. **Tracking:** Open email → tracking pixel fires → `openCount` increments. Click link → redirects correctly → `clickCount` increments
5. **Blog auto-email:** Publish blog post → campaign auto-created → subscribers receive email
6. **Cron:** Schedule a campaign for 5 min from now → cron picks it up → sends
7. **Analytics:** Campaign detail page shows correct open/click rates

---

## Potential Challenges

| Challenge | Mitigation |
|-----------|------------|
| PostgreSQL enum ADD VALUE cannot rollback in transaction | Run enum migration separately or use `prisma migrate dev --create-only` and split |
| Large recipient inserts (5000+ subscribers) | Use `createMany` with chunks of 500 rows |
| SMTP rate limits | Configurable batch size/delay, default 50/2s |
| Email tracking blocked by privacy-focused clients | Document limitation in analytics UI |
| Cron not running after VPS restart | Add to `/etc/cron.d/llcpad`, store `newsletter.cron.lastRun` setting for monitoring |
