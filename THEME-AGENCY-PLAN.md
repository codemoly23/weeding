# Digital Marketing Agency Theme - Implementation Plan

## Theme Overview

| Field | Value |
|-------|-------|
| **Theme ID** | `agency` |
| **Theme Name** | Digital Marketing Agency |
| **Category** | `digital-agency` |
| **Service Count** | 8 |
| **Version** | 1.0 |
| **Description** | Complete digital marketing agency website with 8 services, portfolio showcase, case studies, team profiles, 12+ pages, testimonials, blog, and conversion-optimized layouts. |

---

## Theme Structure

```
public/themes/agency/
├── meta.json          # Theme metadata
├── data.json          # Full theme data (auto-exported)
└── thumbnail.jpg      # Theme preview image
```

---

## Color Palette

### Light Mode
| Token | Hex | Usage |
|-------|-----|-------|
| background | `#FFFFFF` | Page background |
| foreground | `#0B1120` | Primary text |
| card | `#FFFFFF` | Card backgrounds |
| card-foreground | `#0B1120` | Card text |
| primary | `#6366F1` | Indigo - CTAs, links, brand |
| primary-foreground | `#FFFFFF` | Text on primary |
| secondary | `#0B1120` | Dark navy - headers, accents |
| secondary-foreground | `#FFFFFF` | Text on secondary |
| muted | `#F1F5F9` | Muted backgrounds |
| muted-foreground | `#64748B` | Muted text |
| accent | `#8B5CF6` | Violet - secondary accent |
| accent-foreground | `#FFFFFF` | Text on accent |
| destructive | `#EF4444` | Error/destructive |
| border | `#E2E8F0` | Borders |
| ring | `#6366F1` | Focus ring |

### Dark Mode
| Token | Hex | Usage |
|-------|-----|-------|
| background | `#0B1120` | Dark navy background |
| foreground | `#F8FAFC` | Light text |
| card | `#131B2E` | Dark card background |
| card-foreground | `#F8FAFC` | Card text |
| primary | `#818CF8` | Lighter indigo |
| primary-foreground | `#FFFFFF` | Text on primary |
| secondary | `#1E293B` | Dark secondary |
| secondary-foreground | `#F8FAFC` | Text on secondary |
| muted | `#1E293B` | Muted dark |
| muted-foreground | `#94A3B8` | Muted text |
| accent | `#A78BFA` | Lighter violet |
| accent-foreground | `#FFFFFF` | Text on accent |
| destructive | `#EF4444` | Error |
| border | `#1E293B` | Dark borders |
| ring | `#818CF8` | Focus ring |

**Design Rationale:** Indigo/violet palette is the top trend for agency websites in 2025-2026. Professional, modern, and energetic - perfect for digital marketing.

---

## Pages (14 Total)

### System Pages (7) — Already exist, content will be replaced

| # | Page | Slug | Template Type | Description |
|---|------|------|---------------|-------------|
| 1 | **Home** | `home` | HOME | Main landing page, conversion-focused |
| 2 | **Services** | `services` | SERVICES_LIST | Service listing with filter cards |
| 3 | **Service Details** | `service` | SERVICE_DETAILS | Individual service page template |
| 4 | **About** | `about` | ABOUT | Agency story, mission, values, timeline |
| 5 | **Blog** | `blog-list` | BLOG_LIST | Blog listing with categories |
| 6 | **Contact** | `contact` | CONTACT | Contact form, map, office info |
| 7 | **FAQ** | `faq` | FAQ | Frequently asked questions |

### Custom Pages (7) — New pages for agency theme

| # | Page | Slug | Description |
|---|------|------|-------------|
| 8 | **Portfolio** | `portfolio` | Filterable project showcase grid |
| 9 | **Case Study** | `case-study` | Detailed case study template |
| 10 | **Team** | `team` | Team members with profiles |
| 11 | **Pricing** | `pricing` | Service packages & pricing tiers |
| 12 | **Careers** | `careers` | Job listings & company culture |
| 13 | **Free Audit** | `free-audit` | Lead generation landing page |
| 14 | **Industries** | `industries` | Industry verticals we serve |

---

## Page Layouts — Detailed Block Structure

### Page 1: HOME (Slug: `home`)

| Block # | Widget Type | Section Name | Content |
|---------|-------------|--------------|---------|
| 1 | `hero-content` | **Hero Section** | Headline: "We Grow Brands Through Digital Innovation" / Subheadline: "Data-driven digital marketing agency helping ambitious brands achieve measurable growth through SEO, PPC, Social Media & Content Marketing." / CTA: "Get Free Audit" + "View Our Work" / Background: gradient (indigo → violet) with abstract pattern overlay |
| 2 | `logo-cloud` | **Trusted By** | 8 client logos (grayscale on hover color) / Title: "Trusted by 150+ Brands Worldwide" |
| 3 | `service-list` | **Our Services** | 6 service cards with icons / Title: "What We Do" / Subtitle: "Full-spectrum digital marketing services to fuel your growth" / Layout: 3-column grid |
| 4 | `stats-section` | **Stats Counter** | 4 animated counters: "500+ Projects" / "150+ Clients" / "98% Retention" / "$50M+ Revenue Generated" / Background: dark (secondary color) |
| 5 | `image` + `text-block` | **About Preview** | Split layout (1-2): Agency image left, "Why Choose Us" text right / 3 bullet points with icons: Data-Driven, Transparent, Results-Focused / CTA: "Learn More About Us" |
| 6 | `image-slider` | **Featured Work** | 4-6 portfolio items as slider / Title: "Our Latest Work" / Each slide: project image, client name, category, result metric / CTA: "View All Projects" |
| 7 | `process-steps` | **How We Work** | 5 steps: Discovery → Strategy → Execution → Optimization → Reporting / Layout: horizontal with numbered icons / Subtitle: "Our Proven 5-Step Process" |
| 8 | `testimonials-carousel` | **Client Testimonials** | 6 testimonials / carousel mode / Card style: glassmorphism / With avatar, name, title, company, rating |
| 9 | `team-grid` | **Meet The Team** | 4 key team members / Title: "The People Behind Your Growth" / With photo, name, role, social links |
| 10 | `blog-post-grid` | **Latest Insights** | 3 recent blog posts / Title: "From Our Blog" / Card style with image, category, title, excerpt, date |
| 11 | `trust-badges` | **Certifications** | Google Partner, Meta Business Partner, HubSpot Certified, Clutch Top Agency / Title: "Certified & Recognized" |
| 12 | `cta-banner` | **CTA Section** | Headline: "Ready to Grow Your Business?" / Text: "Get a free comprehensive digital audit of your online presence." / CTA: "Get Your Free Audit" / Background: gradient (indigo → violet) |
| 13 | `faq-accordion` | **FAQ** | 6 common questions / Title: "Frequently Asked Questions" |
| 14 | `newsletter` | **Newsletter** | "Stay Updated with Digital Marketing Tips" / Email input + Subscribe button |

---

### Page 2: SERVICES LIST (Slug: `services`)

| Block # | Widget Type | Content |
|---------|-------------|---------|
| 1 | `hero-content` | Title: "Our Services" / Subtitle: "Comprehensive digital marketing solutions tailored to your business goals" / Background: subtle gradient |
| 2 | `service-list` | All 8 services as cards / Filterable by category / Each card: icon, title, short description, starting price, "Learn More" link |
| 3 | `process-steps` | "How It Works" — 4 steps: Consult → Plan → Execute → Report |
| 4 | `cta-banner` | "Not Sure Which Service You Need?" / CTA: "Get Free Consultation" |

---

### Page 3: SERVICE DETAILS (Slug: `service`)
*Uses service-specific widgets that auto-populate from database*

| Block # | Widget Type | Content |
|---------|-------------|---------|
| 1 | `service-breadcrumb` | Home > Services > [Service Name] |
| 2 | `service-hero` | Service title, description, starting price, CTA |
| 3 | `service-features` | Key features grid with icons |
| 4 | `service-description` | Full rich-text description |
| 5 | `service-process` | Service-specific process steps |
| 6 | `service-pricing` | Package pricing cards / comparison table |
| 7 | `service-deliverables` | What client receives |
| 8 | `service-faq` | Service-specific FAQs |
| 9 | `service-testimonials` | Related testimonials |
| 10 | `related-services` | 3 related services |
| 11 | `service-cta` | "Ready to Get Started?" CTA |

---

### Page 4: ABOUT (Slug: `about`)

| Block # | Widget Type | Content |
|---------|-------------|---------|
| 1 | `hero-content` | Title: "About Us" / Subtitle: "We're a team of passionate digital marketers on a mission to transform businesses" |
| 2 | `text-block` + `image` | Split layout — Agency story / "Founded in 2018, we started with a simple belief..." / Image of team/office |
| 3 | `stats-section` | 4 stats: Years in Business, Team Members, Projects Delivered, Client Satisfaction Rate |
| 4 | `heading` + `text-block` | "Our Mission & Values" / 4 value cards: Innovation, Transparency, Results, Partnership |
| 5 | `timeline` | Company milestones / 2018: Founded → 2019: First 50 clients → 2020: Remote team expansion → 2021: International clients → 2022: 100+ team → 2023: Agency awards → 2024: AI integration |
| 6 | `team-grid` | Full team grid / 8-12 team members with photos, names, roles, social links |
| 7 | `trust-badges` | Awards & certifications |
| 8 | `cta-banner` | "Want to Join Our Team?" / CTA: "View Open Positions" |

---

### Page 5: BLOG LIST (Slug: `blog-list`)

| Block # | Widget Type | Content |
|---------|-------------|---------|
| 1 | `hero-content` | Title: "Blog & Insights" / Subtitle: "Expert tips, industry news, and digital marketing strategies" |
| 2 | `blog-featured-post` | Featured/latest blog post — large card |
| 3 | `blog-post-grid` | All posts grid / Category filter tabs / Pagination / 3-column masonry layout |
| 4 | `newsletter` | "Subscribe for Weekly Marketing Tips" |

---

### Page 6: CONTACT (Slug: `contact`)

| Block # | Widget Type | Content |
|---------|-------------|---------|
| 1 | `hero-content` | Title: "Get In Touch" / Subtitle: "Let's discuss how we can help your business grow" |
| 2 | `contact-form` + `text-block` | Split layout — Contact form (left) / Contact info, address, social links (right) |
| 3 | `map` | Office location Google Map embed |
| 4 | `faq-accordion` | 4 contact-related FAQs ("What's your typical response time?", "Do you offer free consultations?", etc.) |

---

### Page 7: FAQ (Slug: `faq`)

| Block # | Widget Type | Content |
|---------|-------------|---------|
| 1 | `hero-content` | Title: "Frequently Asked Questions" / Subtitle: "Everything you need to know about our services" |
| 2 | `faq-accordion` | All FAQs grouped by category: General, SEO, PPC, Social Media, Pricing, Process |
| 3 | `cta-banner` | "Still Have Questions?" / CTA: "Contact Us" |

---

### Page 8: PORTFOLIO (Slug: `portfolio`) — NEW

| Block # | Widget Type | Content |
|---------|-------------|---------|
| 1 | `hero-content` | Title: "Our Work" / Subtitle: "Results-driven campaigns that speak for themselves" |
| 2 | `heading` + `feature-grid` | Filterable portfolio grid (SEO / PPC / Social / Branding / Web / Content) / Each item: thumbnail, client, category, key metric / Hover effect: overlay with details / Masonry layout |
| 3 | `stats-section` | "Our Impact in Numbers" / 4 aggregate stats |
| 4 | `cta-banner` | "Want Results Like These?" / CTA: "Start Your Project" |

---

### Page 9: CASE STUDY (Slug: `case-study`) — NEW

| Block # | Widget Type | Content |
|---------|-------------|---------|
| 1 | `hero-content` | Client name, industry tag, hero image |
| 2 | `text-block` | "The Challenge" — Problem statement |
| 3 | `text-block` | "Our Strategy" — Approach and methodology |
| 4 | `text-block` + `image` | "The Execution" — What was done with visuals |
| 5 | `stats-section` | "The Results" — Bold metrics (+340% Organic Traffic, 5x ROI, etc.) |
| 6 | `testimonials-carousel` | Client testimonial quote |
| 7 | `cta-banner` | "Ready for Similar Results?" / CTA: "Let's Talk" |

---

### Page 10: TEAM (Slug: `team`) — NEW

| Block # | Widget Type | Content |
|---------|-------------|---------|
| 1 | `hero-content` | Title: "Meet Our Team" / Subtitle: "A collective of strategists, creatives, and data enthusiasts" |
| 2 | `team-grid` | Leadership team (4) — CEO, CTO, CMO, COO / Large cards with bio |
| 3 | `team-grid` | Department heads & specialists (8+) / Smaller grid cards |
| 4 | `stats-section` | Team stats: Average years experience, certifications held, countries represented |
| 5 | `cta-banner` | "We're Hiring!" / CTA: "Join Our Team" |

---

### Page 11: PRICING (Slug: `pricing`) — NEW

| Block # | Widget Type | Content |
|---------|-------------|---------|
| 1 | `hero-content` | Title: "Transparent Pricing" / Subtitle: "No hidden fees. Choose the plan that fits your business." |
| 2 | `pricing-table` | 3 tiers: Starter ($999/mo), Growth ($2,499/mo), Enterprise (Custom) / Feature comparison matrix / Popular badge on Growth |
| 3 | `faq-accordion` | Pricing FAQs (6): "What's included?", "Can I upgrade?", "Contract length?", etc. |
| 4 | `testimonials-carousel` | 3 testimonials focused on ROI/value |
| 5 | `cta-banner` | "Need a Custom Quote?" / CTA: "Contact Us" |

---

### Page 12: CAREERS (Slug: `careers`) — NEW

| Block # | Widget Type | Content |
|---------|-------------|---------|
| 1 | `hero-content` | Title: "Join Our Team" / Subtitle: "Build the future of digital marketing with us" |
| 2 | `text-block` + `image` | "Life at [Agency Name]" — Culture, values, perks |
| 3 | `feature-grid` | Benefits grid: Remote Work, Health Insurance, Learning Budget, Team Retreats, Flexible Hours, Stock Options |
| 4 | `text-block` | "Open Positions" section with job listings (placeholder content) |
| 5 | `testimonials-carousel` | Employee testimonials |
| 6 | `cta-banner` | "Don't See Your Role?" / CTA: "Send Us Your Resume" |

---

### Page 13: FREE AUDIT (Slug: `free-audit`) — NEW (Lead Gen Landing Page)

| Block # | Widget Type | Content |
|---------|-------------|---------|
| 1 | `hero-content` | Title: "Get Your Free Digital Marketing Audit" / Subtitle: "Discover untapped opportunities in your online presence" / No navigation (clean landing page) |
| 2 | `feature-grid` | "What You'll Get" — 6 items: SEO Analysis, Competitor Audit, Social Media Review, PPC Analysis, Website Speed Test, Action Plan |
| 3 | `lead-form` | Audit request form: Name, Email, Phone, Website URL, Monthly Budget, Primary Goal |
| 4 | `process-steps` | "How It Works" — 3 steps: Submit Form → We Analyze → Get Report |
| 5 | `stats-section` | "Trusted by 500+ Businesses" with trust stats |
| 6 | `testimonials-carousel` | 3 short testimonials |

---

### Page 14: INDUSTRIES (Slug: `industries`) — NEW

| Block # | Widget Type | Content |
|---------|-------------|---------|
| 1 | `hero-content` | Title: "Industries We Serve" / Subtitle: "Specialized marketing strategies for your industry" |
| 2 | `feature-grid` | Industry cards (8): E-Commerce, SaaS/Tech, Healthcare, Real Estate, Finance, Education, Hospitality, Professional Services / Each with icon, name, brief description |
| 3 | `stats-section` | Cross-industry results stats |
| 4 | `cta-banner` | "Don't see your industry?" / CTA: "Let's Talk" |

---

## Services (8 Total)

### Service Categories (3)

| Category | Slug | Icon | Services |
|----------|------|------|----------|
| **Core Marketing** | `core-marketing` | `Target` | SEO, PPC, Social Media Marketing, Content Marketing |
| **Creative & Development** | `creative-development` | `Palette` | Web Design & Development, Branding & Identity |
| **Growth & Analytics** | `growth-analytics` | `TrendingUp` | Email Marketing & Automation, Analytics & CRO |

---

### Service 1: Search Engine Optimization (SEO)

| Field | Value |
|-------|-------|
| **Slug** | `seo` |
| **Name** | Search Engine Optimization |
| **Short Desc** | Dominate search rankings with data-driven SEO strategies that drive organic traffic and revenue |
| **Icon** | `Search` |
| **Category** | `core-marketing` |
| **Starting Price** | $799/mo |
| **Is Popular** | true |

**Packages:**

| Package | Price/mo | Features |
|---------|----------|----------|
| **Starter** | $799 | Technical SEO audit, On-page optimization (up to 10 pages), Keyword research (50 keywords), Monthly reporting, Google Business Profile setup |
| **Growth** *(Popular)* | $1,499 | Everything in Starter + Content strategy, Link building (10/mo), Competitor analysis, Bi-weekly reporting, Schema markup |
| **Enterprise** | $2,999 | Everything in Growth + Unlimited pages, Link building (25/mo), Dedicated account manager, Weekly reporting, International SEO, Custom dashboards |

**FAQs (5):**
1. How long does it take to see SEO results? — Typically 3-6 months for significant results...
2. Do you guarantee first page rankings? — No ethical SEO agency can guarantee specific rankings...
3. What SEO tools do you use? — We use Ahrefs, SEMrush, Screaming Frog, Google Search Console...
4. Do you follow Google guidelines? — Absolutely. We only use white-hat techniques...
5. How do you report on SEO progress? — Monthly reports with traffic, rankings, conversions...

---

### Service 2: Pay-Per-Click Advertising (PPC)

| Field | Value |
|-------|-------|
| **Slug** | `ppc-advertising` |
| **Name** | Pay-Per-Click Advertising |
| **Short Desc** | Maximize ROI with targeted PPC campaigns across Google, Meta, and LinkedIn |
| **Icon** | `MousePointerClick` |
| **Category** | `core-marketing` |
| **Starting Price** | $999/mo |
| **Is Popular** | true |

**Packages:**

| Package | Price/mo | Features |
|---------|----------|----------|
| **Starter** | $999 | 1 platform (Google Ads), Up to $5K ad spend management, Keyword research, Ad copywriting, Monthly reporting |
| **Growth** *(Popular)* | $1,999 | 2 platforms, Up to $15K ad spend, A/B testing, Landing page recommendations, Bi-weekly reporting, Remarketing setup |
| **Enterprise** | $3,999 | All platforms, Unlimited ad spend, Custom landing pages, Weekly reporting, Conversion tracking, Dedicated strategist |

**FAQs (5):**
1. What platforms do you manage? — Google Ads, Meta (Facebook/Instagram), LinkedIn, TikTok, Microsoft Ads
2. What's the minimum ad budget? — We recommend at least $2,000/month in ad spend...
3. How quickly can PPC deliver results? — Unlike SEO, PPC can drive traffic within days...
4. Do you handle ad creative? — Yes, our team creates ad copy and designs...
5. How do you optimize campaigns? — Continuous A/B testing, bid management, negative keywords...

---

### Service 3: Social Media Marketing

| Field | Value |
|-------|-------|
| **Slug** | `social-media-marketing` |
| **Name** | Social Media Marketing |
| **Short Desc** | Build brand awareness and engage your audience across all social platforms |
| **Icon** | `Share2` |
| **Category** | `core-marketing` |
| **Starting Price** | $699/mo |

**Packages:**

| Package | Price/mo | Features |
|---------|----------|----------|
| **Starter** | $699 | 2 platforms, 12 posts/month, Content calendar, Community management, Monthly reporting |
| **Growth** *(Popular)* | $1,299 | 4 platforms, 20 posts/month, Story/Reel creation, Influencer outreach, Bi-weekly reporting, Paid social management |
| **Enterprise** | $2,499 | All platforms, 30+ posts/month, Video production, Influencer campaigns, UGC strategy, Weekly reporting |

**FAQs (4):**
1. Which social platforms do you manage? — Instagram, Facebook, LinkedIn, TikTok, X, Pinterest, YouTube
2. Do you create the content? — Yes, including graphics, videos, captions, and hashtag strategy
3. Can you handle negative comments? — Yes, community management includes reputation monitoring...
4. Do you use scheduling tools? — Yes, we use industry-leading tools for optimal posting times...

---

### Service 4: Content Marketing

| Field | Value |
|-------|-------|
| **Slug** | `content-marketing` |
| **Name** | Content Marketing |
| **Short Desc** | Attract, engage, and convert with high-quality content that tells your brand story |
| **Icon** | `FileText` |
| **Category** | `core-marketing` |
| **Starting Price** | $899/mo |

**Packages:**

| Package | Price/mo | Features |
|---------|----------|----------|
| **Starter** | $899 | 4 blog posts/month, Content strategy, SEO optimization, Keyword research, Content calendar |
| **Growth** *(Popular)* | $1,699 | 8 blog posts/month, 1 whitepaper/ebook, Email newsletter, Infographics, Social media snippets |
| **Enterprise** | $3,299 | 12+ blog posts/month, Video scripts, Podcast content, Case studies, Comprehensive content hub |

**FAQs (4):**
1. What types of content do you create? — Blog posts, whitepapers, ebooks, case studies, infographics, video scripts...
2. How do you ensure content quality? — Expert writers, editorial process, industry research, SEO optimization...
3. Can you write for technical industries? — Yes, we have writers specialized in tech, healthcare, finance...
4. How do you measure content performance? — Traffic, engagement, lead generation, conversion tracking...

---

### Service 5: Web Design & Development

| Field | Value |
|-------|-------|
| **Slug** | `web-design` |
| **Name** | Web Design & Development |
| **Short Desc** | Beautiful, fast, conversion-optimized websites that turn visitors into customers |
| **Icon** | `Monitor` |
| **Category** | `creative-development` |
| **Starting Price** | $2,999 |
| **Is Popular** | true |

**Packages:**

| Package | Price | Features |
|---------|-------|----------|
| **Landing Page** | $2,999 | Single page design, Mobile responsive, Contact form, SEO setup, 2 revision rounds |
| **Business Website** *(Popular)* | $7,999 | Up to 10 pages, CMS integration, Blog setup, Analytics, 3 revision rounds, 30 days support |
| **E-Commerce** | $14,999 | Full online store, Payment integration, Product management, Inventory system, 60 days support |

**FAQs (4):**
1. What platforms do you build on? — WordPress, Next.js, Shopify, Webflow, custom solutions...
2. How long does a website project take? — Landing pages: 2-3 weeks, Business sites: 4-8 weeks, E-commerce: 8-12 weeks
3. Do you provide hosting? — We can recommend and set up hosting, or work with your existing provider
4. Is training included? — Yes, we provide CMS training so your team can update content

---

### Service 6: Branding & Identity

| Field | Value |
|-------|-------|
| **Slug** | `branding` |
| **Name** | Branding & Identity |
| **Short Desc** | Create a memorable brand identity that resonates with your audience and stands out |
| **Icon** | `Fingerprint` |
| **Category** | `creative-development` |
| **Starting Price** | $1,999 |

**Packages:**

| Package | Price | Features |
|---------|-------|----------|
| **Essential** | $1,999 | Logo design (3 concepts), Color palette, Typography selection, Basic brand guidelines |
| **Professional** *(Popular)* | $4,999 | Everything in Essential + Brand strategy, Stationery design, Social media templates, Brand guidelines document |
| **Complete** | $9,999 | Everything in Professional + Brand messaging, Packaging design, Brand video, Brand launch strategy |

**FAQs (4):**
1. How many logo concepts do you provide? — Minimum 3 initial concepts with unlimited revisions on the chosen direction
2. What's included in brand guidelines? — Logo usage, colors, typography, voice & tone, imagery style, dos & don'ts
3. Can you rebrand an existing business? — Absolutely, we handle full rebrands including transition strategy
4. Do you do packaging design? — Yes, in our Complete package or as an add-on service

---

### Service 7: Email Marketing & Automation

| Field | Value |
|-------|-------|
| **Slug** | `email-marketing` |
| **Name** | Email Marketing & Automation |
| **Short Desc** | Nurture leads and drive repeat business with personalized email campaigns |
| **Icon** | `Mail` |
| **Category** | `growth-analytics` |
| **Starting Price** | $599/mo |

**Packages:**

| Package | Price/mo | Features |
|---------|----------|----------|
| **Starter** | $599 | 4 campaigns/month, Template design, List management, Basic automation (welcome series), Monthly reporting |
| **Growth** *(Popular)* | $1,199 | 8 campaigns/month, A/B testing, Advanced automation, Segmentation, Lead scoring, Bi-weekly reporting |
| **Enterprise** | $2,299 | Unlimited campaigns, Custom workflows, CRM integration, Dynamic content, Deliverability optimization, Weekly reporting |

**FAQs (4):**
1. What email platforms do you work with? — Mailchimp, HubSpot, Klaviyo, ActiveCampaign, ConvertKit...
2. Can you help with our existing email list? — Yes, we audit, clean, segment, and optimize existing lists
3. What's a typical open rate you achieve? — Industry-dependent, but our clients average 25-35% open rates
4. Do you handle GDPR/CAN-SPAM compliance? — Yes, all campaigns are fully compliant with regulations

---

### Service 8: Analytics & Conversion Rate Optimization

| Field | Value |
|-------|-------|
| **Slug** | `analytics-cro` |
| **Name** | Analytics & CRO |
| **Short Desc** | Transform data into actionable insights and optimize every touchpoint for conversions |
| **Icon** | `BarChart3` |
| **Category** | `growth-analytics` |
| **Starting Price** | $999/mo |

**Packages:**

| Package | Price/mo | Features |
|---------|----------|----------|
| **Starter** | $999 | GA4 setup & configuration, Monthly analytics report, Basic heatmap analysis, 2 A/B tests/month |
| **Growth** *(Popular)* | $1,999 | Everything in Starter + Custom dashboards, User journey mapping, 5 A/B tests/month, Funnel analysis |
| **Enterprise** | $3,999 | Everything in Growth + Predictive analytics, Personalization, Unlimited A/B tests, Attribution modeling, Revenue tracking |

**FAQs (4):**
1. What analytics tools do you use? — GA4, Hotjar, Mixpanel, Looker Studio, Optimizely...
2. How do you run A/B tests? — We identify hypotheses, design variants, run tests with statistical significance...
3. What conversion rate improvement can I expect? — Typical improvements range from 20-50% within 3-6 months
4. Do you provide real-time dashboards? — Yes, custom dashboards updated in real-time with key metrics

---

## Header Configuration

| Field | Value |
|-------|-------|
| **Name** | Agency Header |
| **Layout** | `DEFAULT` |
| **Sticky** | true |
| **Transparent** | false |
| **Top Bar** | false |
| **Logo Position** | LEFT |
| **Logo Max Height** | 48 |
| **Show Auth Buttons** | true |
| **Login Text** | "Sign In" |
| **Register Text** | "Free Audit" |
| **Register URL** | `/free-audit` |
| **Search Enabled** | false |
| **Height** | 72 |

### Menu Items

| # | Label | URL | Mega Menu? | Children |
|---|-------|-----|------------|----------|
| 1 | Home | `/` | No | — |
| 2 | Services | `/services` | Yes | (see below) |
| 3 | Portfolio | `/portfolio` | No | — |
| 4 | About | `/about` | No | Sub-items: Our Story, Team, Careers |
| 5 | Blog | `/blog` | No | — |
| 6 | Contact | `/contact` | No | — |

### Services Mega Menu Structure

| Category | Icon | Services |
|----------|------|----------|
| **Core Marketing** | `Target` | SEO, PPC Advertising, Social Media Marketing, Content Marketing |
| **Creative & Development** | `Palette` | Web Design & Development, Branding & Identity |
| **Growth & Analytics** | `TrendingUp` | Email Marketing & Automation, Analytics & CRO |

### About Sub-Menu

| Label | URL |
|-------|-----|
| Our Story | `/about` |
| Our Team | `/team` |
| Careers | `/careers` |

### CTA Button

```json
[{
  "text": "Get Free Audit",
  "url": "/free-audit",
  "variant": "primary"
}]
```

---

## Footer Configuration

| Field | Value |
|-------|-------|
| **Layout** | `MULTI_COLUMN` |
| **Columns** | 5 |
| **Background** | Secondary color (dark navy) |

### Footer Widgets

| Widget | Column | Type | Content |
|--------|--------|------|---------|
| **Brand** | 1 | BRAND | Agency logo, tagline: "Data-driven digital marketing agency helping brands grow through innovation and strategy.", social links (LinkedIn, X, Instagram, Facebook, YouTube) |
| **Services** | 2 | LINKS | SEO, PPC, Social Media, Content Marketing, Web Design, Branding, Email Marketing, Analytics & CRO |
| **Company** | 3 | LINKS | About Us, Our Team, Portfolio, Case Studies, Careers, Blog, Contact |
| **Resources** | 4 | LINKS | Free Audit, FAQ, Pricing, Industries, Privacy Policy, Terms of Service |
| **Newsletter** | 5 | NEWSLETTER | Title: "Get Marketing Tips" / "Subscribe for weekly insights and strategies" / Email input + Subscribe button |

### Bottom Bar
- Copyright: "© 2024 [Agency Name]. All rights reserved."
- Links: Privacy Policy, Terms of Service, Sitemap

---

## Demo Content

### Blog Categories (6)

| Category | Slug | Description |
|----------|------|-------------|
| SEO | `seo` | Search engine optimization tips and strategies |
| PPC | `ppc` | Pay-per-click advertising insights |
| Social Media | `social-media` | Social media marketing trends and tips |
| Content Strategy | `content-strategy` | Content marketing and copywriting |
| Web Design | `web-design` | Design trends, UX, and development |
| Industry News | `industry-news` | Digital marketing industry updates |

### Blog Posts (6 Demo Posts)

| # | Title | Category | Excerpt |
|---|-------|----------|---------|
| 1 | "10 SEO Trends That Will Dominate 2025" | SEO | The SEO landscape is evolving rapidly. Here are the top trends every marketer needs to know... |
| 2 | "How to Reduce Your Google Ads CPC by 40%" | PPC | Discover proven strategies to lower your cost-per-click while maintaining quality traffic... |
| 3 | "The Complete Guide to Instagram Reels for Business" | Social Media | Instagram Reels have become a powerhouse for brand visibility. Here's how to leverage them... |
| 4 | "Why Your Content Strategy Needs a Hub-and-Spoke Model" | Content Strategy | Learn how organizing content around pillar pages can boost your SEO and user engagement... |
| 5 | "Website Redesign Checklist: 25 Things You Can't Miss" | Web Design | Planning a redesign? Use this comprehensive checklist to ensure nothing falls through the cracks... |
| 6 | "AI in Digital Marketing: What's Real and What's Hype" | Industry News | Separating the signal from the noise on how AI is actually changing marketing workflows... |

---

### Testimonials (8 Demo)

| # | Name | Company | Role | Rating | Content |
|---|------|---------|------|--------|---------|
| 1 | Sarah Mitchell | TechFlow Inc. | CEO | 5 | "They increased our organic traffic by 340% in just 6 months. The ROI has been incredible." |
| 2 | James Rodriguez | CloudScale | Marketing Director | 5 | "Our PPC campaigns went from bleeding money to generating 5x ROAS. These guys know their stuff." |
| 3 | Emily Chen | StyleHub | Founder | 5 | "The social media strategy they built took our brand from invisible to industry-recognized in one year." |
| 4 | David Kim | FinanceFirst | VP Marketing | 5 | "Their content marketing approach tripled our inbound leads. Quality work, every single time." |
| 5 | Lisa Thompson | GreenLeaf Co. | CMO | 5 | "The website they built us isn't just beautiful — it converts. Our lead gen increased by 200%." |
| 6 | Michael Brown | DataSync | CTO | 4 | "Transparent reporting, proactive communication, and genuine expertise. Best agency partnership we've had." |
| 7 | Rachel Green | UrbanEats | Owner | 5 | "From branding to social media, they handled everything. Our online presence has never been stronger." |
| 8 | Alex Turner | Momentum SaaS | Growth Lead | 5 | "The analytics and CRO work doubled our trial-to-paid conversion rate. Data-driven results at their finest." |

---

### FAQs (20 Demo) — Grouped by Category

**General (6):**
1. What services does your agency offer?
2. How much do your services cost?
3. How long are your contracts?
4. Do you work with businesses outside the US?
5. How do I get started?
6. What makes you different from other agencies?

**SEO (3):**
7. How long does SEO take to show results?
8. Do you guarantee first-page rankings?
9. What's included in an SEO audit?

**PPC (3):**
10. What's the minimum ad budget you recommend?
11. Which advertising platforms do you manage?
12. How do you track PPC conversions?

**Social Media (3):**
13. Which social platforms should my business be on?
14. How often should we post on social media?
15. Can you manage both organic and paid social?

**Pricing (3):**
16. Do you offer custom packages?
17. What payment methods do you accept?
18. Is there a setup fee?

**Process (2):**
19. What does the onboarding process look like?
20. How do you report on results?

---

### Team Members (8 Demo)

| # | Name | Role | Bio |
|---|------|------|-----|
| 1 | Alex Morgan | CEO & Founder | 15+ years in digital marketing. Previously led marketing at Fortune 500 companies. |
| 2 | Priya Sharma | Chief Marketing Officer | Award-winning strategist specializing in brand growth and omnichannel marketing. |
| 3 | Marcus Johnson | Head of SEO | Google-certified with 10+ years of SEO experience across 200+ clients. |
| 4 | Sophie Williams | Head of PPC | Former Google Ads specialist. Managed $50M+ in ad spend. |
| 5 | Daniel Lee | Creative Director | Led brand identity projects for global brands. Design award winner. |
| 6 | Emma Davis | Head of Content | Published author and content strategist with expertise in B2B and B2C. |
| 7 | Ryan Patel | Lead Developer | Full-stack developer specializing in high-performance marketing websites. |
| 8 | Olivia Martinez | Head of Analytics | Data scientist turned marketer. Expert in GA4, Looker, and attribution modeling. |

---

### Legal Pages (4)

| Page | Slug |
|------|------|
| Privacy Policy | `privacy` |
| Terms of Service | `terms` |
| Refund Policy | `refund-policy` |
| Cookie Policy | `cookie-policy` |

---

## Implementation Steps

### Phase 1: Theme Foundation
1. Create `public/themes/agency/` directory
2. Create `meta.json` with theme metadata
3. Create `data.json` with full theme data following `ThemeData` interface

### Phase 2: Color Palette
4. Define light/dark mode color palettes in `data.json` → `colorPalette`

### Phase 3: Header & Footer
5. Define `headerConfig` in data.json (layout, CTA, etc.)
6. Define `menuItems` with mega menu structure for services
7. Define `footerConfig` with 5-column layout
8. Define `footerWidgets` (brand, services, company, resources, newsletter)

### Phase 4: Services
9. Create 3 `serviceCategories` in data.json
10. Create 8 `services` with packages, features, FAQs
11. Define comparison features for pricing table

### Phase 5: Pages
12. Create all 7 system pages with blocks (home, services, service, about, blog-list, contact, faq)
13. Create 7 custom pages with blocks (portfolio, case-study, team, pricing, careers, free-audit, industries)

### Phase 6: Demo Content
14. Create 6 `blogCategories`
15. Create 6 demo `blogs` posts
16. Create 8 `testimonials`
17. Create 20 `faqs` grouped by category
18. Create 4 `legalPages` with placeholder content

### Phase 7: Settings
19. Set `settings` for business name, tagline, contact info, social links
20. Set widget presets for agency-specific defaults

### Phase 8: Testing
21. Import theme via admin panel
22. Verify all pages render correctly
23. Test responsive layouts (desktop/tablet/mobile)
24. Verify header/footer/menu changes
25. Test dark mode color palette

---

## File Changes Summary

| File/Path | Action | Description |
|-----------|--------|-------------|
| `public/themes/agency/meta.json` | **CREATE** | Theme metadata |
| `public/themes/agency/data.json` | **CREATE** | Full theme data (all content above) |
| `public/themes/agency/thumbnail.jpg` | **CREATE** | Theme preview screenshot |

**No code changes needed** — the existing theme system handles import/export. The entire theme is defined through `data.json` following the `ThemeData` interface structure.

---

## Key Differences from Legal Theme

| Aspect | Legal Theme | Agency Theme |
|--------|-------------|--------------|
| **Color** | Orange (#F97316) | Indigo (#6366F1) |
| **Services** | 7 (LLC, EIN, ITIN...) | 8 (SEO, PPC, Social...) |
| **Menu CTA** | "Get Started" → LLC Formation | "Free Audit" → Lead Gen Page |
| **Mega Menu** | 4 categories (Formation, Compliance, Amazon, Tax) | 3 categories (Core, Creative, Growth) |
| **Custom Pages** | None | 7 (Portfolio, Case Study, Team, Pricing, Careers, Free Audit, Industries) |
| **Hero Style** | Business/corporate | Modern/gradient/animated |
| **Tone** | Professional/legal | Energetic/results-driven |
| **Target CTA** | "Get Started" | "Get Free Audit" |
| **Footer** | 6 columns | 5 columns with newsletter |
| **Social Proof** | Trust badges (states) | Case study metrics, certifications |
