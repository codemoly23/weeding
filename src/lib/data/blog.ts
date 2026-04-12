export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: {
    name: string;
    avatar: string;
  };
  category: string;
  tags: string[];
  publishedAt: string;
  readTime: number;
}

export const blogCategories = [
  { id: "wedding-planning", name: "Wedding Planning" },
  { id: "guest-management", name: "Guest Management" },
  { id: "vendors-venues", name: "Vendors & Venues" },
  { id: "inspiration", name: "Inspiration & Trends" },
  { id: "tips-guides", name: "Tips & Guides" },
];

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-create-wedding-guest-list-complete-guide",
    title: "How to Create Your Wedding Guest List: Complete Guide",
    excerpt:
      "Learn how to build and manage your wedding guest list stress-free, including tips on setting a budget, handling plus-ones, and collecting RSVPs with Ceremoney.",
    content: `
## Starting Your Guest List

Your wedding guest list is one of the first — and most important — decisions you will make. It shapes your venue choice, catering budget, and the overall feel of your day.

### Step 1: Set Your Target Number

Before inviting anyone, agree with your partner on a rough total. Consider:
- **Venue capacity**: Your venue has a maximum number of guests.
- **Budget per head**: Every additional guest increases catering, stationery, and seating costs.
- **Atmosphere**: Intimate weddings (under 50 guests) feel very different from large celebrations (150+).

A useful rule: start with a "must invite" list — immediate family and closest friends. Then add a "would love to invite" list and a "if budget allows" list.

### Step 2: Import Your Contacts

With Ceremoney, you can:
- Add guests one by one
- Import from a CSV or Excel spreadsheet
- Invite guests to register themselves through your event website

Each guest profile stores name, contact details, RSVP status, meal preference, and plus-one information.

### Step 3: Organize by Groups and Families

Group guests into families or categories (e.g., Bride's Family, Groom's Friends, Work Colleagues). This makes it easier to assign seating and track who has responded.

### Step 4: Send Save-the-Dates and Invitations

Use your Ceremoney event website to share your wedding details. Guests can RSVP online, and their responses sync instantly to your guest list.

### Step 5: Track RSVPs and Follow Up

Ceremoney sends automated RSVP reminders to guests who have not responded by your deadline. You can also manually update statuses for guests who prefer to reply by phone or post.

## Common Guest List Mistakes to Avoid

1. **Inviting obligation guests**: Only invite people you genuinely want there.
2. **Forgetting plus-ones**: Decide on a consistent plus-one policy early.
3. **Waiting too long to send invitations**: Send save-the-dates 6–12 months ahead.
4. **Not tracking dietary requirements**: Collect these with the RSVP to help your caterer.

## Guest List Size Guide

| Wedding Size | Guest Count | Typical Venue |
|---|---|---|
| Intimate | Under 30 | Private dining room, home |
| Small | 30–75 | Boutique venue, restaurant |
| Medium | 75–150 | Country house, hotel |
| Large | 150–300 | Grand hotel, manor |
| Grand | 300+ | Palace, large estate |

## Ready to Build Your Guest List?

Start managing your wedding guest list for free with Ceremoney.

[Get Started Free →](/register)
    `,
    coverImage: "/blog/wedding-guest-list.jpg",
    author: {
      name: "Sofia Lindgren",
      avatar: "/avatars/sofia.jpg",
    },
    category: "guest-management",
    tags: ["Guest List", "Planning", "RSVP"],
    publishedAt: "2025-03-15",
    readTime: 7,
  },
  {
    slug: "wedding-seating-chart-tips-guide",
    title: "Wedding Seating Chart Tips: How to Seat 100+ Guests Without the Stress",
    excerpt:
      "A practical guide to creating a wedding seating plan that keeps guests comfortable and avoids family drama. Includes a step-by-step approach using Ceremoney's seating chart editor.",
    content: `
## Why Seating Charts Matter

A thoughtful seating chart ensures that every guest has a great time. Poorly seated guests can feel isolated or uncomfortable, especially in large weddings with mixed social circles.

## Getting Started with Your Seating Plan

### 1. Confirm Your Final Guest Count First

Never start a seating plan until you have final RSVPs. Work with confirmed attendees only to avoid rearranging everything when last-minute cancellations arrive.

### 2. Map Out Your Venue

Draw a floor plan or use Ceremoney's visual seating editor to recreate your venue layout. Add tables with the correct shapes (round, rectangular, or mixed) and capacities.

### 3. Seat the VIPs First

Start with the head table or sweetheart table. Then seat immediate family on both sides, followed by the wedding party, close friends, and finally extended guests.

### 4. Apply the Comfort Rule

Seat guests with people they know or who share something in common — age group, profession, or social circle. Avoid seating feuding family members close together.

### 5. Account for Special Needs

- Place elderly guests near exits and restrooms.
- Seat guests with mobility issues at accessible tables.
- Keep children's tables near parents but away from the dance floor (or close to it — depends on your crowd!).

## Ceremoney's Drag-and-Drop Seating Editor

Our visual editor lets you:
- Build a realistic floor plan of your venue
- Add and label tables with names (e.g., "Table Rose" or "Table 7")
- Drag guest names from your list to seats
- See unassigned guests at a glance
- Export a PDF for your venue coordinator

Changes sync in real time, so you and your planner always see the latest version.

## Seating Chart Checklist

- [ ] All confirmed RSVPs are in the guest list
- [ ] Venue floor plan is mapped accurately
- [ ] VIP and family tables are assigned first
- [ ] No feuding guests seated together
- [ ] Accessibility needs are addressed
- [ ] Children and elderly guests have appropriate placement
- [ ] Table names or numbers match the venue cards
- [ ] PDF exported for venue and catering team

[Try the Seating Chart Editor →](/dashboard/seating)
    `,
    coverImage: "/blog/seating-chart.jpg",
    author: {
      name: "Erik Johansson",
      avatar: "/avatars/erik.jpg",
    },
    category: "wedding-planning",
    tags: ["Seating Chart", "Planning Tips", "Venue"],
    publishedAt: "2025-03-01",
    readTime: 6,
  },
  {
    slug: "how-to-choose-wedding-photographer-sweden",
    title: "How to Choose the Perfect Wedding Photographer in Sweden",
    excerpt:
      "Everything you need to know about finding, evaluating, and booking the right wedding photographer — including key questions to ask, pricing expectations, and how Ceremoney's vendor directory helps you compare photographers.",
    content: `
## Why Your Photographer Choice Matters

Your wedding photos are the lasting record of your day. Choosing the right photographer — one whose style aligns with your vision and who you feel comfortable around — is one of the most important vendor decisions you will make.

## Defining Your Photography Style

Before searching, decide what style of wedding photography you prefer:

- **Documentary / Reportage**: Candid, natural moments captured as they happen. Minimal posing.
- **Editorial / Fine Art**: Artistic, magazine-style images with careful composition and lighting.
- **Traditional**: Classic, formally posed portraits of family and the wedding party.
- **Bohemian**: Relaxed, outdoorsy, often with a warm or desaturated color palette.

Browse each photographer's full galleries — not just their highlights — to get a realistic picture of their work.

## Questions to Ask a Potential Photographer

1. Are you available on our wedding date?
2. Have you photographed at our venue before?
3. How many images will we receive, and in what format?
4. What is your backup plan if you become ill on the day?
5. How long does post-processing take, and how will we receive our photos?
6. Do you work alone or with a second shooter?
7. What are your travel fees if our venue is outside your local area?

## Understanding Wedding Photography Pricing in Sweden

Photography costs vary widely based on experience and coverage hours:

| Level | Estimated Price (SEK) |
|---|---|
| Emerging photographer | 10,000 – 20,000 |
| Experienced photographer | 20,000 – 45,000 |
| Premium / award-winning | 45,000 – 80,000+ |

Always request a written contract that specifies delivery timelines, copyright terms, and what happens if the photographer cancels.

## Using Ceremoney's Vendor Directory

Ceremoney's vendor marketplace lists verified photographers across Sweden. You can:
- Filter by location, style, and budget
- Read reviews from real couples
- Compare packages side by side
- Contact photographers directly from your dashboard

[Find Photographers in Our Directory →](/vendors/photographers)
    `,
    coverImage: "/blog/wedding-photographer.jpg",
    author: {
      name: "Anna Bergström",
      avatar: "/avatars/anna.jpg",
    },
    category: "vendors-venues",
    tags: ["Photography", "Vendors", "Sweden"],
    publishedAt: "2025-02-20",
    readTime: 8,
  },
  {
    slug: "creating-wedding-website-with-ceremoney",
    title: "How to Create a Beautiful Wedding Website with RSVP in Minutes",
    excerpt:
      "A step-by-step guide to setting up your Ceremoney event website, customizing it to match your wedding theme, and collecting RSVPs from all your guests online.",
    content: `
## Why You Need a Wedding Website

A personal wedding website replaces the need for a printed details card inside your invitation. It gives guests a single place to find all the information they need — ceremony location, dress code, accommodation, and how to RSVP.

## Setting Up Your Ceremoney Event Website

### Step 1: Choose a Template

Ceremoney offers a curated collection of wedding website templates. Each template is fully responsive (looks great on mobile and desktop) and customizable with your own colors and fonts.

### Step 2: Add Your Details

Fill in your event information:
- Wedding date, time, and location
- Ceremony and reception venue addresses
- Accommodation recommendations for out-of-town guests
- Dress code
- Gift registry links
- Your love story (optional but guests love it!)

### Step 3: Configure Your RSVP Form

Enable the built-in RSVP form and choose:
- RSVP deadline
- Whether to allow plus-ones
- Meal preference options
- Custom questions (e.g., song requests)

### Step 4: Set Privacy

Choose who can access your site:
- **Public**: Anyone with the link
- **Password-protected**: Guests enter a code you share in the invitation
- **Private**: Only invited guests who log in

### Step 5: Share with Guests

Copy your unique website link and include it in your invitations or save-the-dates. All RSVP responses automatically appear in your Ceremoney guest list.

## Website Tips

- Use your initials or names in the URL (e.g., \`anna-and-erik.ceremoney.com\`)
- Add a countdown timer to build excitement
- Update the site as details change — guests can check back anytime
- Export the RSVP data to share with your caterer or venue

[Create Your Free Wedding Website →](/register)
    `,
    coverImage: "/blog/wedding-website.jpg",
    author: {
      name: "Sofia Lindgren",
      avatar: "/avatars/sofia.jpg",
    },
    category: "tips-guides",
    tags: ["Wedding Website", "RSVP", "Getting Started"],
    publishedAt: "2025-02-10",
    readTime: 5,
  },
  {
    slug: "wedding-planning-checklist-12-months",
    title: "The Complete 12-Month Wedding Planning Checklist",
    excerpt:
      "From booking your venue 12 months out to your wedding-day emergency kit, this month-by-month checklist covers everything so nothing falls through the cracks.",
    content: `
## 12+ Months Before the Wedding

- Set your overall budget
- Agree on a rough guest count
- Choose your wedding date
- Book your ceremony and reception venue
- Start your Ceremoney account and create your event

## 9–12 Months Before

- Hire a wedding planner (optional)
- Book your photographer and videographer
- Research and shortlist caterers
- Book accommodation for out-of-town guests (room blocks)
- Begin dress/suit shopping

## 6–9 Months Before

- Send save-the-dates
- Book hair and makeup artists
- Book florist
- Book music (band or DJ)
- Arrange transportation
- Book officiant

## 4–6 Months Before

- Launch your Ceremoney event website
- Send formal invitations (collect RSVPs online)
- Finalize menu with caterer
- Arrange wedding cake
- Plan honeymoon

## 2–4 Months Before

- Chase outstanding RSVPs with Ceremoney's automated reminders
- Finalize guest list and start seating chart
- Organize ceremony readings and vows
- Purchase wedding rings
- Confirm all vendors in writing

## 1–2 Months Before

- Finalize and share seating chart with venue and catering
- Export guest list dietary requirements for caterer
- Arrange gifts and favours
- Create detailed day-of timeline
- Break in new shoes

## 1–2 Weeks Before

- Confirm arrival times with all vendors
- Prepare wedding-day emergency kit
- Distribute final seating chart to venue coordinator
- Delegate day-of tasks to bridal party

## Wedding Day

- Enjoy every moment — Ceremoney has handled the organization!

[Download as PDF →](/resources/checklist)
    `,
    coverImage: "/blog/wedding-checklist.jpg",
    author: {
      name: "Erik Johansson",
      avatar: "/avatars/erik.jpg",
    },
    category: "tips-guides",
    tags: ["Checklist", "Timeline", "Wedding Planning"],
    publishedAt: "2025-01-28",
    readTime: 9,
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getAllBlogSlugs(): string[] {
  return blogPosts.map((post) => post.slug);
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  return blogPosts.filter((post) => post.category === category);
}

export function getRecentBlogPosts(limit: number = 3): BlogPost[] {
  return [...blogPosts]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}
