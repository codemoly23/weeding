/**
 * Update SERVICE_DETAILS template with the new reference design
 * Run: node scripts/update-service-detail-template.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// ────────────────────────────────────────────────────────────
// IDs helper
// ────────────────────────────────────────────────────────────
function uid() {
  return `_${Math.random().toString(36).slice(2, 10)}`;
}
function sectionId() { return `section_${Date.now()}${uid()}`; }
function colId() { return `col_${Date.now()}${uid()}`; }
function widgetId() { return `widget_${Date.now()}${uid()}`; }

// ────────────────────────────────────────────────────────────
// Shared section factory
// ────────────────────────────────────────────────────────────
function section(layout, widgets, opts = {}) {
  const cols = layout === "1"
    ? [{ id: colId(), widgets }]
    : layout.split("-").map((_, i) => ({ id: colId(), widgets: widgets[i] || [] }));

  return {
    id: sectionId(),
    order: 0,
    layout,
    columns: cols,
    settings: {
      background: opts.background || "transparent",
      backgroundColor: opts.backgroundColor || "",
      backgroundType: opts.backgroundType || "none",
      paddingTop: opts.paddingTop ?? 0,
      paddingBottom: opts.paddingBottom ?? 0,
      fullWidth: opts.fullWidth || false,
      ...opts.extra,
    },
  };
}

function widget(type, settings, spacing = {}) {
  return { id: widgetId(), type, settings, ...(Object.keys(spacing).length ? { spacing } : {}) };
}

// ────────────────────────────────────────────────────────────
// STATE COMPARISON TABLE HTML
// ────────────────────────────────────────────────────────────
const stateComparisonHtml = `<div class="sc-wrap">
  <div class="sc-header">
    <div class="sc-eyebrow">State Comparison</div>
    <h2 class="sc-title">Wyoming vs Delaware vs New Mexico<br>for non-US residents</h2>
    <p class="sc-desc">Choosing the right state affects your annual costs, privacy, and banking access. Here's a real data comparison updated for 2026.</p>
  </div>
  <div class="sc-table-wrap">
    <table class="sc-table">
      <thead>
        <tr>
          <th>Feature</th>
          <th class="sc-recommended">Wyoming<span class="sc-rec-badge">Recommended</span></th>
          <th>Delaware</th>
          <th class="sc-nm">New Mexico<span class="sc-nm-badge">$0/yr After</span></th>
        </tr>
      </thead>
      <tbody>
        <tr><td>State Filing Fee</td><td class="sc-hi">$100</td><td>$90</td><td class="sc-hi">$50 (lowest)</td></tr>
        <tr class="sc-alt"><td>Annual Report</td><td class="sc-hi">$60/yr (annually)</td><td>None for LLCs</td><td class="sc-hi sc-green">None — ever</td></tr>
        <tr><td>Annual State Fee</td><td>$60/yr</td><td>$300/yr franchise tax</td><td class="sc-hi sc-green">$0/yr</td></tr>
        <tr class="sc-alt"><td>State Income Tax</td><td class="sc-hi">None</td><td>None for non-residents</td><td class="sc-hi">None for non-residents</td></tr>
        <tr><td>Privacy / Anonymity</td><td class="sc-check">✓ Members not public</td><td class="sc-check">✓ Members not public</td><td class="sc-check sc-hi">✓✓ Best — no public records</td></tr>
        <tr class="sc-alt"><td>Foreign Ownership</td><td class="sc-check">✓ Fully allowed</td><td class="sc-check">✓ Fully allowed</td><td class="sc-check">✓ Fully allowed</td></tr>
        <tr><td>Banking Acceptance</td><td class="sc-hi">Excellent (Mercury, Relay, Wise)</td><td>Excellent</td><td>Good (some banks less familiar)</td></tr>
        <tr class="sc-alt"><td>Amazon / Stripe</td><td class="sc-hi">✓ Widely accepted</td><td class="sc-check">✓ Accepted</td><td class="sc-check">✓ Accepted</td></tr>
        <tr><td>Best For</td><td class="sc-hi">Amazon sellers, e-commerce, freelancers</td><td>VC-funded startups</td><td>Privacy-first, holding companies</td></tr>
        <tr class="sc-alt"><td>Total Ongoing Cost/yr</td><td class="sc-hi sc-bold">~$60/yr</td><td class="sc-bold">~$300/yr</td><td class="sc-green sc-bold">$0/yr</td></tr>
      </tbody>
    </table>
  </div>
  <div class="sc-note">
    <strong class="sc-note-strong">Our recommendation:</strong> Wyoming for Amazon sellers and e-commerce (best bank/platform acceptance). New Mexico for privacy-first businesses and holding companies ($0 ongoing fees). Delaware only if you plan to raise VC funding.
  </div>
</div>`;

const stateComparisonCss = `
.sc-wrap{max-width:1160px;margin:0 auto;padding:80px 28px}
.sc-header{text-align:center;margin-bottom:48px}
.sc-eyebrow{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#e84c1e;margin-bottom:12px}
.sc-title{font-family:var(--font-heading,'Outfit',sans-serif);font-size:clamp(28px,4vw,42px);font-weight:800;letter-spacing:-0.025em;color:#0e1109;margin-bottom:14px;line-height:1.15}
.sc-desc{font-size:15px;color:#4b5249;max-width:560px;margin:0 auto;line-height:1.7}
.sc-table-wrap{overflow-x:auto;border-radius:16px;border:1.5px solid rgba(14,17,9,0.1);box-shadow:0 4px 24px rgba(0,0,0,0.04)}
.sc-table{width:100%;border-collapse:collapse;background:#fff}
.sc-table thead th{font-family:var(--font-heading,'Outfit',sans-serif);font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;padding:18px 22px;background:#1b3a2d;color:#faf8f4;text-align:left;position:relative}
.sc-table thead th:first-child{width:32%;border-radius:14px 0 0 0}
.sc-table thead th:last-child{border-radius:0 14px 0 0}
.sc-table tbody td{padding:14px 22px;border-bottom:1px solid rgba(14,17,9,0.06);font-size:13.5px;color:#1a1f16}
.sc-table tbody td:first-child{font-weight:600;color:#0e1109}
.sc-table tbody tr:last-child td{border-bottom:none}
.sc-table tbody tr:hover{background:rgba(27,58,45,0.02)}
.sc-alt{background:rgba(27,58,45,0.015)}
.sc-alt:hover{background:rgba(27,58,45,0.03) !important}
.sc-hi{background:rgba(27,58,45,0.04);font-weight:600;color:#1b3a2d}
.sc-check{color:#1b3a2d;font-weight:600}
.sc-green{color:#1b3a2d !important;font-weight:700 !important}
.sc-bold{font-family:var(--font-heading,'Outfit',sans-serif);font-weight:800}
.sc-recommended{position:relative}
.sc-rec-badge,.sc-nm-badge{position:absolute;top:-11px;left:50%;transform:translateX(-50%);font-size:9px;font-weight:700;padding:2px 10px;border-radius:999px;letter-spacing:.5px;text-transform:uppercase;white-space:nowrap}
.sc-rec-badge{background:#e84c1e;color:#fff}
.sc-nm-badge{background:#1b3a2d;color:#fff}
.sc-note{margin-top:24px;font-size:14px;color:#4b5249;max-width:680px;margin-left:auto;margin-right:auto;text-align:center;line-height:1.7}
.sc-note-strong{color:#1b3a2d}
@media(max-width:640px){.sc-table{min-width:560px}.sc-wrap{padding:60px 16px}}
`;

// ────────────────────────────────────────────────────────────
// WHY LLCPAD HTML
// ────────────────────────────────────────────────────────────
const whyHtml = `<div class="wl-wrap">
  <div class="wl-header">
    <div class="wl-eyebrow">Why LLCPad</div>
    <h2 class="wl-title">Built specifically for<br><em class="wl-em">international</em> founders</h2>
    <p class="wl-desc">We're not a generic incorporation service. We specialize exclusively in helping non-US entrepreneurs navigate every unique challenge.</p>
  </div>
  <div class="wl-grid">
    <div class="wl-card">
      <div class="wl-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg></div>
      <div><h4 class="wl-card-title">International Specialist</h4><p class="wl-card-desc">We handle the unique EIN, banking, and compliance challenges non-US owners face — from Form 5472 to ITIN to business bank approvals that other services can't solve.</p></div>
    </div>
    <div class="wl-card">
      <div class="wl-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
      <div><h4 class="wl-card-title">24-Hour Processing</h4><p class="wl-card-desc">Industry-leading speed. From order to delivered documents in one business day. Your LLC can be officially formed while you sleep.</p></div>
    </div>
    <div class="wl-card">
      <div class="wl-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg></div>
      <div><h4 class="wl-card-title">Dedicated Human Support</h4><p class="wl-card-desc">A real person assigned to your case — not a chatbot, not a ticket queue. Available via WhatsApp, email, and live chat in your timezone.</p></div>
    </div>
    <div class="wl-card">
      <div class="wl-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
      <div><h4 class="wl-card-title">100% Compliance Guaranteed</h4><p class="wl-card-desc">If we make an error, we fix it at zero cost — no questions asked, no time limit. Your filing gets done right. That's our guarantee.</p></div>
    </div>
    <div class="wl-card">
      <div class="wl-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg></div>
      <div><h4 class="wl-card-title">No Hidden Fees</h4><p class="wl-card-desc">The price you see is the price you pay. No surprise upsells, no yearly subscriptions, no fine print. One-time fees with clear value breakdowns.</p></div>
    </div>
    <div class="wl-card">
      <div class="wl-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg></div>
      <div><h4 class="wl-card-title">Client Dashboard</h4><p class="wl-card-desc">Track every milestone in real time. View your documents, check application status, and manage your compliance — all from one clean dashboard.</p></div>
    </div>
  </div>
</div>`;

const whyCss = `
.wl-wrap{max-width:1160px;margin:0 auto;padding:80px 28px;background:#fff}
.wl-header{text-align:center;margin-bottom:48px}
.wl-eyebrow{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#e84c1e;margin-bottom:12px}
.wl-title{font-family:var(--font-heading,'Outfit',sans-serif);font-size:clamp(28px,4vw,44px);font-weight:800;letter-spacing:-0.025em;color:#0e1109;margin-bottom:14px;line-height:1.15}
.wl-em{color:#e84c1e;font-style:normal}
.wl-desc{font-size:16px;color:#4b5249;max-width:560px;margin:0 auto;line-height:1.7}
.wl-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
.wl-card{display:flex;gap:18px;padding:26px;border-radius:14px;border:1.5px solid rgba(14,17,9,0.08);transition:all .3s;background:#fff}
.wl-card:hover{border-color:#1b3a2d;box-shadow:0 8px 32px rgba(27,58,45,0.08);transform:translateY(-2px)}
.wl-icon{width:46px;height:46px;border-radius:12px;background:rgba(232,76,30,0.08);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#e84c1e;transition:all .3s}
.wl-card:hover .wl-icon{background:#e84c1e;color:#fff;box-shadow:0 4px 16px rgba(232,76,30,0.2)}
.wl-card-title{font-family:var(--font-heading,'Outfit',sans-serif);font-size:15px;font-weight:700;color:#0e1109;margin-bottom:4px}
.wl-card-desc{font-size:13px;color:#4b5249;line-height:1.65}
@media(max-width:768px){.wl-grid{grid-template-columns:1fr}.wl-wrap{padding:60px 16px}}
`;

// ────────────────────────────────────────────────────────────
// FINAL CTA HTML
// ────────────────────────────────────────────────────────────
const finalCtaHtml = `<div class="fc-wrap">
  <div class="fc-glow-1"></div>
  <div class="fc-glow-2"></div>
  <div class="fc-inner">
    <h2 class="fc-title">Ready to launch your<br><em class="fc-em">US business?</em></h2>
    <p class="fc-desc">Join 1,200+ international entrepreneurs who've built their US business from home. No travel. No SSN. No confusion.</p>
    <div class="fc-actions">
      <a href="/contact" class="fc-btn-primary">Start My LLC &rarr;</a>
      <a href="/contact" class="fc-btn-secondary">Book Free Consultation</a>
    </div>
    <div class="fc-trust">
      <span class="fc-trust-item">✓ Filing accuracy guaranteed</span>
      <span class="fc-trust-item">✓ Filed in 24 hours</span>
      <span class="fc-trust-item">✓ 100% remote process</span>
    </div>
    <p class="fc-disclaimer">LLCPad is not a law firm and does not provide legal advice. We are a business formation service provider.</p>
  </div>
</div>`;

const finalCtaCss = `
.fc-wrap{background:#0f2318;padding:100px 28px;position:relative;overflow:hidden}
.fc-glow-1{position:absolute;top:-200px;right:-100px;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(232,76,30,0.12),transparent 65%);pointer-events:none;filter:blur(80px)}
.fc-glow-2{position:absolute;bottom:-150px;left:-80px;width:450px;height:450px;border-radius:50%;background:radial-gradient(circle,rgba(27,58,45,0.5),transparent 65%);pointer-events:none;filter:blur(60px)}
.fc-inner{position:relative;z-index:2;text-align:center;max-width:640px;margin:0 auto}
.fc-title{font-family:var(--font-heading,'Outfit',sans-serif);font-size:clamp(32px,5vw,52px);font-weight:900;color:#faf8f4;letter-spacing:-0.04em;line-height:1.1;margin-bottom:18px}
.fc-em{background:linear-gradient(135deg,#ff6a3d,#ff8a5c);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-style:normal}
.fc-desc{font-size:17px;color:rgba(250,248,244,0.5);max-width:520px;margin:0 auto 36px;line-height:1.75}
.fc-actions{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-bottom:28px}
.fc-btn-primary{display:inline-flex;align-items:center;gap:8px;padding:16px 34px;border-radius:10px;font-size:15px;font-weight:600;background:#e84c1e;color:#fff;text-decoration:none;transition:all .22s;font-family:inherit}
.fc-btn-primary:hover{background:#d13d10;transform:translateY(-2px);box-shadow:0 8px 24px rgba(232,76,30,0.35)}
.fc-btn-secondary{display:inline-flex;align-items:center;gap:8px;padding:16px 34px;border-radius:10px;font-size:15px;font-weight:600;background:transparent;color:#faf8f4;border:1.5px solid rgba(250,248,244,0.25);text-decoration:none;transition:all .22s;font-family:inherit}
.fc-btn-secondary:hover{background:rgba(250,248,244,0.08);border-color:rgba(250,248,244,0.5)}
.fc-trust{display:flex;gap:20px;justify-content:center;flex-wrap:wrap;margin-bottom:24px}
.fc-trust-item{font-size:12px;color:rgba(250,248,244,0.3);font-weight:600}
.fc-disclaimer{font-size:11px;color:rgba(250,248,244,0.15);line-height:1.6;max-width:480px;margin:0 auto}
@media(max-width:640px){.fc-actions{flex-direction:column;align-items:center}}
`;

// ────────────────────────────────────────────────────────────
// BUILD SECTIONS
// ────────────────────────────────────────────────────────────
const newSections = [
  // 1. Breadcrumb
  section("1", [
    widget("service-breadcrumb", {
      variant: "simple-text",
      separator: "chevron",
      showHome: true,
      homeLabel: "Home",
      showCategory: true,
      fontSize: "sm",
      alignment: "left",
    }),
  ], { paddingTop: 0, paddingBottom: 0 }),

  // 2. Service Hero (two-column)
  section("1", [
    widget("service-hero", {
      layout: "two-column",
      titleSource: "auto",
      subtitleSource: "auto",
      showCategoryBadge: true,
      categoryBadgeTag: "Most Popular",
      showPriceBadge: false,
      priceBadgeText: "From ${{service.startingPrice}}",
      showPriceHero: true,
      priceHeroNote: "+ state fee\nIncludes everything you need",
      primaryCtaText: "Get Started — ${{service.startingPrice}} + State Fee",
      primaryCtaLink: "/checkout/{{service.slug}}",
      showPriceInButton: false,
      showSecondaryButton: true,
      secondaryCtaText: "Book Free Consultation",
      secondaryCtaLink: "/contact",
      showTrustItems: true,
      trustItems: [
        { text: "Filing accuracy guaranteed" },
        { text: "Filed in 24 hours" },
        { text: "100% remote" },
      ],
      rightCardShow: true,
      rightCardTitle: "What You Get",
      rightCardAutoItems: true,
      rightCardStats: [
        { value: "1,200+", label: "Clients Served" },
        { value: "30+", label: "Countries" },
        { value: "4.9★", label: "Rating" },
      ],
      backgroundType: "none",
      textAlignment: "left",
      titleSize: "large",
      spacing: "md",
    }),
  ], { paddingTop: 0, paddingBottom: 0 }),

  // 3. What's Included (service-features, cards variant)
  section("1", [
    widget("service-features", {
      header: {
        show: true,
        heading: "Everything you need to legally form your US LLC",
        alignment: "center",
        description: "Every plan includes the foundational documents required by the state. Higher tiers add EIN, registered agent, and compliance services.",
      },
      columns: 3,
      variant: "cards",
      iconColor: "#1b3a2d",
      iconStyle: "circle-check",
      showIcons: true,
      showDescriptions: true,
    }),
  ], { paddingTop: 0, paddingBottom: 0 }),

  // 4. How It Works (process-steps)
  section("1", [
    widget("process-steps", {
      header: {
        show: true,
        badge: {
          show: true,
          text: "How It Works",
          style: "outline",
          bgColor: "transparent",
          textColor: "#1b3a2d",
          borderColor: "transparent",
          customFontSize: "12px",
          fontWeight: 700,
          letterSpacing: "1.5px",
          textTransform: "uppercase",
        },
        heading: {
          text: "From order to operational\nin 4 clean steps",
          highlightWords: "",
          highlightColor: "",
          size: "xl",
          color: "#0e1109",
          customFontSize: "clamp(28px,4vw,42px)",
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: "-0.025em",
        },
        description: { show: false, text: "", size: "md", color: "#64748b" },
        alignment: "center",
        marginBottom: 56,
      },
      steps: [
        {
          id: "step_ps_1",
          icon: "ClipboardList",
          title: "Fill Out Our 5-Minute Intake Form",
          description: "Tell us your desired business name, state of formation (we recommend Wyoming for most international entrepreneurs), and basic ownership information. No US address or SSN required.",
        },
        {
          id: "step_ps_2",
          icon: "Shield",
          title: "We Prepare & File Everything",
          description: "Our team drafts your Articles of Organization, Operating Agreement, and files directly with the state. For Professional+ plans, we also handle your EIN application and BOI filing.",
        },
        {
          id: "step_ps_3",
          icon: "Monitor",
          title: "Track Progress in Real Time",
          description: "Follow every milestone through your client dashboard. Get notified via email and WhatsApp the moment each step is completed — state approval, EIN receipt, document delivery.",
        },
        {
          id: "step_ps_4",
          icon: "Rocket",
          title: "Receive Documents & Launch",
          description: "Get all formation documents delivered digitally. Activate your US bank account, register on Amazon or TikTok Shop, connect Stripe — and start building your US revenue stream.",
        },
      ],
      layout: { type: "horizontal", columns: 4, gap: 0, verticalSpacing: 48 },
      stepNumber: {
        show: true,
        style: "circle",
        size: "sm",
        bgColor: "#e84c1e",
        textColor: "#ffffff",
        borderColor: "#e84c1e",
        position: "top-right",
      },
      stepIcon: {
        show: true,
        style: "circle-outline",
        size: "lg",
        bgColor: "#ffffff",
        iconColor: "#1b3a2d",
        borderColor: "rgba(14,17,9,0.1)",
        hoverAnimation: "none",
      },
      stepContent: {
        titleSize: "md",
        titleColor: "#0e1109",
        descriptionSize: "sm",
        descriptionColor: "#4b5249",
        alignment: "center",
        customTitleFontSize: "17px",
        titleFontWeight: 700,
        customDescFontSize: "13px",
        descLineHeight: 1.65,
      },
      connector: { show: false },
      card: { show: false, backgroundColor: "transparent", backgroundType: "solid", borderRadius: 0, borderWidth: 0, borderColor: "transparent", padding: 0, shadow: "none", hoverEffect: "none" },
      responsive: { tablet: { layout: "horizontal", columns: 2 }, mobile: { layout: "vertical", columns: 1 } },
      animation: { staggerDelay: 150, animateOnScroll: true },
      colors: { useTheme: false },
    }),
  ], { paddingTop: 0, paddingBottom: 0 }),

  // 5. State Comparison (custom-html)
  section("1", [
    widget("custom-html", {
      html: stateComparisonHtml,
      css: stateComparisonCss,
      js: "",
    }),
  ], { paddingTop: 0, paddingBottom: 0 }),

  // 6. Pricing Table
  section("1", [
    widget("pricing-table", {
      colors: { useTheme: true },
      header: {
        show: true,
        badge: {
          show: true,
          text: "Choose Your Package",
          style: "pill",
          bgColor: "rgba(232,76,30,0.1)",
          textColor: "#e84c1e",
          borderColor: "rgba(232,76,30,0.3)",
        },
        heading: {
          size: "xl",
          text: "Compare features and select the best plan for your business",
          color: "#0e1109",
          highlightColor: "#e84c1e",
          highlightWords: "",
        },
        alignment: "center",
        description: {
          show: true,
          size: "md",
          text: "One-time fees. No subscriptions. No hidden costs. Every plan includes state filing.",
          color: "#4b5249",
        },
        marginBottom: 40,
      },
      currency: { format: "symbol", primary: "USD", showBoth: false },
      stateFee: { label: "Select State", sortBy: "popular", enabled: true, position: "above-table" },
      viewMode: "comparison-table",
      animation: { enabled: true, type: "fade" },
      cardStyle: "minimal",
      ctaButtons: { text: "Get Started", link: "/checkout/{{service.slug}}" },
    }),
  ], { paddingTop: 0, paddingBottom: 0 }),

  // 7. Testimonials
  section("1", [
    widget("testimonials-carousel", {
      header: {
        show: true,
        badge: {
          show: true,
          text: "What Founders Say",
          style: "pill",
          bgColor: "transparent",
          textColor: "#ff6a3d",
          borderColor: "transparent",
          customFontSize: "12px",
          fontWeight: 700,
          letterSpacing: "1.5px",
          textTransform: "uppercase",
        },
        heading: {
          text: "Trusted by 1,200+ international\nentrepreneurs worldwide",
          highlightWords: "",
          highlightColor: "#ff6a3d",
          size: "xl",
          color: "#faf8f4",
          customFontSize: "clamp(28px,3.5vw,42px)",
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: "-0.025em",
        },
        description: {
          show: true,
          text: "Real reviews from real founders who formed their US LLCs with LLCPad.",
          size: "md",
          color: "rgba(250,248,244,0.45)",
          customFontSize: "15px",
          lineHeight: 1.7,
        },
        alignment: "center",
        marginBottom: 48,
      },
      viewMode: "carousel",
      testimonialType: "photo",
      dataSource: { limit: 6, sortBy: "sort-order", testimonialType: "all" },
      carouselView: {
        layout: "rail",
        effect: "slide",
        autoplay: true,
        autoplayDelay: 5000,
        loop: true,
        slidesPerView: 3,
        spaceBetween: 24,
        navigation: { arrows: { enabled: false }, dots: { enabled: true } },
        responsive: {
          mobile: { slidesPerView: 1 },
          tablet: { slidesPerView: 2 },
        },
      },
      card: {
        background: "rgba(255,255,255,0.05)",
        borderColor: "rgba(255,255,255,0.07)",
        borderRadius: 20,
        shadow: "none",
        padding: 28,
        starsColor: "#ff6a3d",
        textColor: "rgba(250,248,244,0.75)",
        authorNameColor: "#faf8f4",
        authorRoleColor: "rgba(250,248,244,0.4)",
      },
      sectionBackground: { type: "solid", color: "#1b3a2d" },
    }),
  ], { paddingTop: 0, paddingBottom: 0 }),

  // 8. Why LLCPad (custom-html)
  section("1", [
    widget("custom-html", {
      html: whyHtml,
      css: whyCss,
      js: "",
    }),
  ], { paddingTop: 0, paddingBottom: 0 }),

  // 9. FAQ
  section("1", [
    widget("faq", {
      style: "cards",
      header: {
        show: true,
        heading: "Got questions? We've got answers.",
        alignment: "center",
        description: "Everything international entrepreneurs ask about our services.",
      },
      source: "service",
      maxItems: 10,
      categories: [],
      accentColor: "#1b3a2d",
      expandFirst: true,
      allowMultipleOpen: false,
      showCategoryFilter: false,
    }),
  ], { paddingTop: 0, paddingBottom: 0 }),

  // 10. Related Services
  section("1", [
    widget("related-services", {
      header: {
        show: true,
        heading: "You Might Also Need",
        alignment: "center",
        description: "Explore other services that international entrepreneurs commonly pair with LLC formation.",
      },
      maxItems: 4,
      columns: 4,
      cardVariant: "minimal",
      showPrice: true,
      showDescription: true,
      showCategoryBadge: true,
      ctaText: "Learn More",
    }),
  ], { paddingTop: 0, paddingBottom: 0 }),

  // 11. Final CTA (custom-html)
  section("1", [
    widget("custom-html", {
      html: finalCtaHtml,
      css: finalCtaCss,
      js: "",
    }),
  ], { paddingTop: 0, paddingBottom: 0 }),
];

// ────────────────────────────────────────────────────────────
// UPDATE data.json
// ────────────────────────────────────────────────────────────
const dataPath = "public/themes/legal/data.json";
const data = JSON.parse(readFileSync(dataPath, "utf8"));

const spIndex = data.pages.findIndex((p) => p.templateType === "SERVICE_DETAILS");
if (spIndex === -1) {
  console.error("❌ SERVICE_DETAILS page not found in data.json");
  process.exit(1);
}

data.pages[spIndex].blocks = [
  {
    id: `block_${Date.now()}${uid()}`,
    type: "widget-page-sections",
    name: "Widget Page Sections",
    settings: newSections,
  },
];

writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log("✅ data.json updated with new SERVICE_DETAILS template");

// ────────────────────────────────────────────────────────────
// UPDATE DATABASE via Prisma
// ────────────────────────────────────────────────────────────
console.log("\n📦 Updating database...");

// Dynamic import for ESM compatibility
const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient();

try {
  // Find the active SERVICE_DETAILS template
  const page = await prisma.landingPage.findFirst({
    where: { templateType: "SERVICE_DETAILS", isTemplateActive: true },
    include: { blocks: true },
  });

  if (!page) {
    console.log("⚠️  No active SERVICE_DETAILS template found in database.");
    console.log("   Theme needs to be activated first, or create the page manually.");
  } else {
    // Find the widget-page-sections block
    const block = page.blocks.find((b) => b.type === "widget-page-sections");

    if (block) {
      await prisma.landingPageBlock.update({
        where: { id: block.id },
        data: { settings: newSections },
      });
      console.log(`✅ Database block ${block.id} updated successfully`);
    } else {
      // Create the block
      await prisma.landingPageBlock.create({
        data: {
          pageId: page.id,
          type: "widget-page-sections",
          name: "Widget Page Sections",
          order: 0,
          settings: newSections,
        },
      });
      console.log("✅ New widget-page-sections block created in database");
    }
    console.log(`\n🎉 SERVICE_DETAILS template updated! Visit /admin/appearance/pages/service-details to preview.`);
  }
} catch (err) {
  console.error("❌ Database update failed:", err.message);
} finally {
  await prisma.$disconnect();
}
