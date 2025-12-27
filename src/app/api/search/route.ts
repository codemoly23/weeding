import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { blogPosts as staticBlogPosts } from "@/lib/data/blog";

// Search result types
interface SearchResult {
  type: "service" | "blog" | "faq" | "page" | "legal";
  id: string;
  title: string;
  description?: string;
  url: string;
  category?: string;
  image?: string;
  popular?: boolean;
}

interface SearchResponse {
  results: SearchResult[];
  query: string;
  total: number;
}

// GET /api/search?q=query&limit=10
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q")?.trim() || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    if (!query || query.length < 2) {
      return NextResponse.json({
        results: [],
        query,
        total: 0,
      });
    }

    const searchTerm = `%${query}%`;
    const results: SearchResult[] = [];

    // Search Services (highest priority) - including full description
    const services = await prisma.service.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { shortDesc: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { slug: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        category: {
          select: { name: true },
        },
      },
      take: 8,
      orderBy: [
        { isPopular: "desc" },
        { sortOrder: "asc" },
      ],
    });

    services.forEach((service) => {
      results.push({
        type: "service",
        id: service.id,
        title: service.name,
        description: service.shortDesc?.slice(0, 120) + (service.shortDesc && service.shortDesc.length > 120 ? "..." : ""),
        url: `/services/${service.slug}`,
        category: service.category?.name || "Services",
        image: service.image || undefined,
        popular: service.isPopular,
      });
    });

    // Search Blog Posts (including content)
    // Debug: Log query
    console.log("Searching blogs for:", query);

    const blogPosts = await prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { excerpt: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
          { slug: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        coverImage: true,
        tags: true,
      },
      take: 10,
      orderBy: { publishedAt: "desc" },
    });

    console.log("Blog posts found from DB:", blogPosts.length);

    blogPosts.forEach((post) => {
      results.push({
        type: "blog",
        id: post.id,
        title: post.title,
        description: post.excerpt?.slice(0, 120) + (post.excerpt && post.excerpt.length > 120 ? "..." : ""),
        url: `/blog/${post.slug}`,
        category: "Blog",
        image: post.coverImage || undefined,
      });
    });

    // Also search static blog posts (from src/lib/data/blog.ts)
    const queryLowerForBlog = query.toLowerCase();
    const matchingStaticPosts = staticBlogPosts.filter((post) => {
      return (
        post.title.toLowerCase().includes(queryLowerForBlog) ||
        post.excerpt.toLowerCase().includes(queryLowerForBlog) ||
        post.content.toLowerCase().includes(queryLowerForBlog) ||
        post.slug.toLowerCase().includes(queryLowerForBlog) ||
        post.tags.some((tag) => tag.toLowerCase().includes(queryLowerForBlog)) ||
        post.category.toLowerCase().includes(queryLowerForBlog)
      );
    });

    console.log("Static blog posts found:", matchingStaticPosts.length);

    matchingStaticPosts.forEach((post) => {
      // Avoid duplicates if already added from DB
      if (!results.some((r) => r.type === "blog" && r.url === `/blog/${post.slug}`)) {
        results.push({
          type: "blog",
          id: `static-${post.slug}`,
          title: post.title,
          description: post.excerpt.slice(0, 120) + (post.excerpt.length > 120 ? "..." : ""),
          url: `/blog/${post.slug}`,
          category: post.category,
          image: post.coverImage || undefined,
        });
      }
    });

    // Search FAQs
    const faqs = await prisma.fAQ.findMany({
      where: {
        isActive: true,
        OR: [
          { question: { contains: query, mode: "insensitive" } },
          { answer: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        question: true,
        answer: true,
        category: true,
      },
      take: 4,
      orderBy: { sortOrder: "asc" },
    });

    faqs.forEach((faq) => {
      // Strip HTML tags from answer for preview
      const plainAnswer = faq.answer.replace(/<[^>]*>/g, "");
      results.push({
        type: "faq",
        id: faq.id,
        title: faq.question,
        description: plainAnswer.slice(0, 100) + (plainAnswer.length > 100 ? "..." : ""),
        url: `/faq#${faq.id}`,
        category: faq.category || "FAQ",
      });
    });

    // Search Legal Pages (including content)
    const legalPages = await prisma.legalPage.findMany({
      where: {
        isActive: true,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { slug: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        metaDescription: true,
      },
      take: 5,
    });

    legalPages.forEach((page) => {
      results.push({
        type: "legal",
        id: page.id,
        title: page.title,
        description: page.metaDescription || undefined,
        url: `/${page.slug}`,
        category: "Legal",
      });
    });

    // Search Static Pages (hardcoded but common)
    const staticPages = [
      { title: "Home", url: "/", keywords: ["home", "main", "start"] },
      { title: "Pricing", url: "/pricing", keywords: ["pricing", "price", "cost", "package", "plan"] },
      { title: "About Us", url: "/about", keywords: ["about", "company", "team", "who"] },
      { title: "Contact", url: "/contact", keywords: ["contact", "support", "help", "reach", "email", "phone"] },
      { title: "Blog", url: "/blog", keywords: ["blog", "article", "news", "post"] },
      { title: "FAQ", url: "/faq", keywords: ["faq", "question", "help", "support"] },
      { title: "Dashboard", url: "/dashboard", keywords: ["dashboard", "account", "my account", "orders"] },
    ];

    const queryLower = query.toLowerCase();
    staticPages.forEach((page) => {
      if (
        page.title.toLowerCase().includes(queryLower) ||
        page.keywords.some((kw) => kw.includes(queryLower) || queryLower.includes(kw))
      ) {
        // Check if already added
        if (!results.some((r) => r.url === page.url)) {
          results.push({
            type: "page",
            id: page.url,
            title: page.title,
            url: page.url,
            category: "Pages",
          });
        }
      }
    });

    // Sort results: services first, then by relevance (exact match > starts with > contains)
    results.sort((a, b) => {
      // Priority by type
      const typeOrder = { service: 0, page: 1, blog: 2, faq: 3, legal: 4 };
      const typeDiff = typeOrder[a.type] - typeOrder[b.type];
      if (typeDiff !== 0) return typeDiff;

      // Popular services first
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;

      // Exact match first
      const aExact = a.title.toLowerCase() === queryLower;
      const bExact = b.title.toLowerCase() === queryLower;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      // Starts with query
      const aStarts = a.title.toLowerCase().startsWith(queryLower);
      const bStarts = b.title.toLowerCase().startsWith(queryLower);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      return 0;
    });

    // Limit total results
    const limitedResults = results.slice(0, limit);

    const response: SearchResponse = {
      results: limitedResults,
      query,
      total: results.length,
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed", results: [], query: "", total: 0 },
      { status: 500 }
    );
  }
}
