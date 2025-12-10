import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { blogPosts, blogCategories, getRecentBlogPosts } from "@/lib/data/blog";
import { MultiJsonLd } from "@/components/seo/json-ld";
import { generateBreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Blog - LLC Formation Guides & Business Tips",
  description:
    "Expert guides on US LLC formation, EIN applications, Amazon selling, business banking, and tips for international entrepreneurs. Stay informed with LLCPad.",
  keywords: [
    "LLC formation blog",
    "business formation guides",
    "EIN guide",
    "Amazon seller tips",
    "international business",
    "Wyoming LLC guide",
  ],
  openGraph: {
    title: "Blog - LLC Formation Guides & Business Tips | LLCPad",
    description:
      "Expert guides on US LLC formation, EIN applications, Amazon selling, business banking, and tips for international entrepreneurs.",
  },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPage() {
  const featuredPost = blogPosts[0];
  const recentPosts = blogPosts.slice(1);

  const schemaData: Record<string, unknown>[] = [
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Blog", url: "/blog" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "LLCPad Blog",
      description:
        "Expert guides on US LLC formation, EIN applications, Amazon selling, and business tips for international entrepreneurs.",
      url: "https://llcpad.com/blog",
      publisher: {
        "@type": "Organization",
        name: "LLCPad",
        logo: {
          "@type": "ImageObject",
          url: "https://llcpad.com/logo.png",
        },
      },
    },
  ];

  return (
    <div className="py-16 lg:py-24">
      <MultiJsonLd data={schemaData} />

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            Resources
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            LLC Formation Guides & Tips
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Expert guides, tips, and insights for entrepreneurs starting their US
            business journey.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mx-auto mt-12 max-w-4xl">
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              href="/blog"
              className="rounded-full border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              All Posts
            </Link>
            {blogCategories.map((category) => (
              <Link
                key={category.id}
                href={`/blog?category=${category.id}`}
                className="rounded-full border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <div className="mx-auto mt-12 max-w-4xl">
            <Link href={`/blog/${featuredPost.slug}`}>
              <Card className="overflow-hidden transition-all hover:border-primary">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="relative aspect-video md:aspect-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
                    <div className="flex h-full items-center justify-center bg-muted p-8">
                      <span className="text-6xl font-bold text-primary/20">
                        {featuredPost.title.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center p-6">
                    <Badge variant="secondary" className="mb-4 w-fit">
                      Featured
                    </Badge>
                    <h2 className="text-2xl font-bold text-foreground">
                      {featuredPost.title}
                    </h2>
                    <p className="mt-4 text-muted-foreground">
                      {featuredPost.excerpt}
                    </p>
                    <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(featuredPost.publishedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {featuredPost.readTime} min read
                      </span>
                    </div>
                    <div className="mt-6">
                      <span className="inline-flex items-center gap-2 text-primary">
                        Read Article <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        )}

        {/* Recent Posts Grid */}
        <div className="mx-auto mt-16 max-w-6xl">
          <h2 className="mb-8 text-2xl font-bold">Recent Articles</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <Card className="h-full transition-all hover:border-primary">
                  <CardHeader className="pb-4">
                    <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                      <div className="flex h-full items-center justify-center">
                        <span className="text-4xl font-bold text-primary/20">
                          {post.title.charAt(0)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <Badge variant="outline" className="mb-3">
                      {blogCategories.find((c) => c.id === post.category)?.name ||
                        post.category}
                    </Badge>
                    <h3 className="line-clamp-2 text-lg font-semibold text-foreground">
                      {post.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {post.excerpt}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(post.publishedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readTime} min
                      </span>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Newsletter CTA */}
        <div className="mx-auto mt-16 max-w-2xl">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold">Stay Updated</h2>
              <p className="mt-2 text-muted-foreground">
                Get the latest guides and tips delivered to your inbox.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button>Subscribe</Button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                No spam. Unsubscribe at any time.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Browse by Category */}
        <div className="mx-auto mt-16 max-w-4xl">
          <h2 className="mb-6 text-center text-2xl font-bold">
            Browse by Category
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {blogCategories.map((category) => {
              const categoryPosts = blogPosts.filter(
                (p) => p.category === category.id
              );
              return (
                <Link key={category.id} href={`/blog?category=${category.id}`}>
                  <Card className="transition-all hover:border-primary">
                    <CardContent className="p-6">
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {categoryPosts.length} article
                        {categoryPosts.length !== 1 ? "s" : ""}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
