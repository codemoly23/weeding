import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";
import prisma from "@/lib/db";
import { formatDistanceToNow } from "date-fns";

// Fallback blog posts if database is empty - slugs must match lib/data/blog.ts
const fallbackPosts = [
  {
    id: "1",
    title: "How to Create Your Wedding Guest List: Complete Guide",
    slug: "how-to-create-wedding-guest-list-complete-guide",
    excerpt:
      "Learn how to build and manage your wedding guest list stress-free, including tips on setting a budget, handling plus-ones, and collecting RSVPs with Ceremoney.",
    coverImage: "/images/blog/wedding-guest-list.jpg",
    tags: ["Guest List", "Planning", "RSVP"],
    publishedAt: new Date("2025-03-15"),
  },
  {
    id: "2",
    title: "Wedding Seating Chart Tips: How to Seat 100+ Guests Without the Stress",
    slug: "wedding-seating-chart-tips-guide",
    excerpt:
      "A practical guide to creating a wedding seating plan that keeps guests comfortable and avoids family drama.",
    coverImage: "/images/blog/seating-chart.jpg",
    tags: ["Seating Chart", "Planning Tips", "Venue"],
    publishedAt: new Date("2025-03-01"),
  },
  {
    id: "3",
    title: "How to Create a Beautiful Wedding Website with RSVP in Minutes",
    slug: "creating-wedding-website-with-ceremoney",
    excerpt:
      "A step-by-step guide to setting up your Ceremoney event website, customizing it to match your wedding theme, and collecting RSVPs from all your guests online.",
    coverImage: "/images/blog/wedding-website.jpg",
    tags: ["Wedding Website", "RSVP", "Getting Started"],
    publishedAt: new Date("2025-02-10"),
  },
];

async function getBlogPosts() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        tags: true,
        publishedAt: true,
      },
    });

    if (posts.length === 0) {
      return fallbackPosts;
    }

    return posts;
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return fallbackPosts;
  }
}

export async function BlogSection() {
  const posts = await getBlogPosts();

  // Don't render if no posts
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <Badge variant="secondary" className="mb-4">
              Blog
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Latest Insights & Guides
            </h2>
            <p className="mt-2 text-muted-foreground">
              Expert tips, inspiration, and step-by-step guides for engaged couples and wedding planners
            </p>
          </div>
          <Button className="group" variant="outline" asChild>
            <Link href="/blog">
              View All Posts
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {/* Blog Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card className="group h-full overflow-hidden transition-all hover:shadow-lg">
                {/* Cover Image */}
                <div className="aspect-video overflow-hidden bg-muted">
                  {post.coverImage ? (
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      width={400}
                      height={225}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                      <span className="text-4xl font-bold text-primary/30">
                        {post.title.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                <CardContent className="p-5">
                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                      {post.tags.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Date */}
                  {post.publishedAt && (
                    <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(post.publishedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
