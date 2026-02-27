# Email System - Newsletter Removal & SMTP Consolidation

## Summary

The newsletter system has been completely removed. All email sending now uses the SMTP provider configured at `/admin/settings/email`. There is no longer a separate newsletter settings page or external newsletter provider integration (Brevo, Mailchimp).

## What Was Removed

### Pages & Routes Deleted
- `src/app/admin/settings/newsletter/page.tsx` — Admin newsletter settings page
- `src/app/api/newsletter/subscribe/route.ts` — Public newsletter subscription endpoint
- `src/app/api/admin/newsletter/stats/route.ts` — Admin newsletter stats endpoint
- `src/app/api/admin/newsletter/test/route.ts` — Admin Brevo connection test endpoint

### Database Changes
- **Removed model:** `NewsletterSubscriber` (email, name, status, source, subscribedAt, etc.)
- **Removed enum:** `NewsletterSubscriberStatus` (PENDING, ACTIVE, UNSUBSCRIBED, BOUNCED)
- **Removed enum value:** `NEWSLETTER_HERO` from `FooterLayout`
- **Removed enum value:** `NEWSLETTER` from `FooterWidgetType`
- **Removed fields from `FooterConfig`:**
  - `newsletterEnabled`
  - `newsletterTitle`
  - `newsletterSubtitle`
  - `newsletterProvider`
  - `newsletterFormAction`
- **Updated `sectionOrder` default:** from `["widgets", "newsletter", "trust", "bottom"]` to `["widgets", "trust", "bottom"]`

> **Note:** A Prisma migration is required after these schema changes: `npx prisma migrate dev`

### Code Changes

#### Sidebar (`src/components/admin/sidebar.tsx`)
- Removed "Newsletter" menu item from Settings section

#### Footer Component (`src/components/layout/footer.tsx`)
- Removed `EnhancedNewsletterForm` component
- Removed `NEWSLETTER` widget case from `FooterWidgetRenderer`
- Removed `NEWSLETTER_HERO` layout rendering
- Removed newsletter section from MINIMAL layout
- Removed newsletter widget handling from CENTERED layout
- Removed unused imports: `Send`, `CheckCircle`, `Loader2`, `Input`, `Button`

#### Footer Admin (`src/app/admin/appearance/footer/page.tsx`)
- Removed NEWSLETTER_HERO from layout options
- Removed NEWSLETTER from widget types selector
- Removed Newsletter settings tab (enable toggle, title, subtitle)
- Removed all NEWSLETTER widget preview renderers
- Removed newsletter fields from form data state and save payload

#### Types (`src/lib/header-footer/types.ts`)
- Removed `NEWSLETTER_HERO` from `FooterLayout` type
- Removed `NEWSLETTER` from `FooterWidgetType` type
- Removed `newsletter` fields from `FooterConfig` interface
- Removed `newsletter` object from `PublicFooterResponse` interface

#### Other Files
- `src/hooks/use-footer-config.ts` — Removed newsletter from default config
- `src/lib/theme/theme-exporter.ts` — Removed newsletter fields from footer export
- `src/lib/landing-blocks/types.ts` — Removed `newsletter` from `BlockType`
- `src/lib/page-builder/types.ts` — Removed `newsletter` from `WidgetType`
- `src/lib/data/footer-presets-data.ts` — Removed NEWSLETTER widgets from all 23 presets, removed `newsletterEnabled` field
- `src/app/api/footer/route.ts` — Removed newsletter from public API response
- `src/app/api/admin/footer/route.ts` — Removed newsletter from Zod schema
- `src/app/api/admin/footer/apply-preset/route.ts` — Removed NEWSLETTER from widget types
- `src/app/api/admin/footer/widgets/route.ts` — Removed NEWSLETTER from allowed widget types
- `prisma/seed.ts` — Removed newsletter seed data
- `prisma/seed-header-footer.ts` — Removed newsletter seed data
- `prisma/apply-enterprise-dark.ts` — Removed NEWSLETTER from widget type
- `src/lib/landing-blocks/registry.ts` — Updated description text

## Current Email Configuration

All email is now sent via SMTP, configured at:

**Admin Panel:** `/admin/settings/email`

This single page handles all email provider configuration using SMTP settings (host, port, username, password, from address).
