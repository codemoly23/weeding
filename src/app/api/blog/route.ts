import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET published blog posts (public - no auth required)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Query params
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const orderBy = searchParams.get("orderBy") || "date";
    const orderDir = (searchParams.get("orderDir") || "desc") as "asc" | "desc";
    const exclude = searchParams.get("exclude");
    const search = searchParams.get("search");

    // Build where clause - always enforce PUBLISHED
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      status: "PUBLISHED",
    };

    // Filter by category slug
    if (category) {
      where.categories = {
        some: { slug: category },
      };
    }

    // Filter by tag
    if (tag) {
      where.tags = { has: tag };
    }

    // Exclude specific post
    if (exclude) {
      where.id = { not: exclude };
    }

    // Search by title
    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }

    // Build orderBy
    let orderByClause: Record<string, string> = {};
    switch (orderBy) {
      case "title":
        orderByClause = { title: orderDir };
        break;
      case "modified":
        orderByClause = { updatedAt: orderDir };
        break;
      case "date":
      default:
        orderByClause = { publishedAt: orderDir };
        break;
    }

    // Count total for pagination
    const total = await prisma.blogPost.count({ where });

    // Fetch posts
    let posts;
    if (orderBy === "random") {
      // Random ordering - fetch all IDs, shuffle, take limit
      const allIds = await prisma.blogPost.findMany({
        where,
        select: { id: true },
      });
      const shuffled = allIds.sort(() => Math.random() - 0.5);
      const selectedIds = shuffled.slice(offset, offset + limit).map((p) => p.id);

      posts = await prisma.blogPost.findMany({
        where: { id: { in: selectedIds } },
        include: {
          categories: {
            select: { id: true, name: true, slug: true },
          },
        },
      });
    } else {
      posts = await prisma.blogPost.findMany({
        where,
        orderBy: orderByClause,
        skip: offset,
        take: limit,
        include: {
          categories: {
            select: { id: true, name: true, slug: true },
          },
        },
      });
    }

    // Strip full content for list view (send excerpt only)
    const postsWithoutContent = posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      coverImage: post.coverImage,
      authorId: post.authorId,
      publishedAt: post.publishedAt,
      tags: post.tags,
      categories: post.categories,
      createdAt: post.createdAt,
    }));

    return NextResponse.json({
      posts: postsWithoutContent,
      total,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}
