import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check, ExternalLink } from "lucide-react";
import prisma from "@/lib/db";

interface DbTemplate {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  bg: string;
  font: string;
  tags: unknown;
  imageUrl: string;
  features: unknown;
  plannerTheme: string;
  plannerPrimary: string;
  plannerAccent: string;
  plannerFont: string;
  active: boolean;
  sortOrder: number;
}

interface NormalizedTemplate extends Omit<DbTemplate, "tags" | "features"> {
  tags: string[];
  features: string[];
}

function normalize(t: DbTemplate): NormalizedTemplate {
  return {
    ...t,
    tags: (t.tags as string[]) ?? [],
    features: (t.features as string[]) ?? [],
  };
}

interface Props {
  searchParams: Promise<{ style?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { style } = await searchParams;

  if (style) {
    const theme = await prisma.weddingTemplate.findFirst({ where: { slug: style, active: true } });
    if (theme) {
      return {
        title: `${theme.name} Wedding Website Template | Ceremoney`,
        description: theme.description,
      };
    }
  }

  return {
    title: "Wedding Website Templates — Free Designs | Ceremoney",
    description: "Browse beautiful wedding website templates. Find the perfect design for your special day and create your free wedding website in minutes.",
  };
}

export default async function ThemesPage({ searchParams }: Props) {
  const { style } = await searchParams;

  const allRaw = await prisma.weddingTemplate.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  const allTemplates = allRaw.map(normalize);
  const selectedTheme = style ? allTemplates.find((t) => t.slug === style) ?? null : null;

  // ── Detail view ──
  if (selectedTheme) {
    return (
      <div className="bg-background min-h-screen">
        {/* Back */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/wedding-website/themes"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              All templates
            </Link>
          </div>
        </div>

        {/* Hero */}
        <div
          className="py-16"
          style={{ backgroundColor: selectedTheme.accentColor + "40" }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
              {/* Info */}
              <div>
                <div className="flex gap-2 mb-4 flex-wrap">
                  {selectedTheme.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-semibold px-3 py-1 rounded-full border"
                      style={{
                        backgroundColor: selectedTheme.accentColor,
                        borderColor: selectedTheme.primaryColor + "30",
                        color: selectedTheme.primaryColor,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h1 className="text-4xl font-bold text-foreground mb-2">{selectedTheme.name}</h1>
                <p className="text-primary font-medium mb-4">{selectedTheme.tagline}</p>
                <p className="text-muted-foreground leading-relaxed mb-8">{selectedTheme.description}</p>

                <div className="space-y-2 mb-8">
                  {selectedTheme.features.map((f) => (
                    <div key={f} className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: selectedTheme.primaryColor + "20" }}
                      >
                        <Check className="w-3 h-3" style={{ color: selectedTheme.primaryColor }} />
                      </div>
                      <span className="text-sm text-foreground/80">{f}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/register?callbackUrl=${encodeURIComponent(`/planner/create?template=${style}`)}`}
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 font-semibold rounded-xl text-white transition-colors hover:opacity-90"
                    style={{ backgroundColor: selectedTheme.primaryColor }}
                  >
                    Use this template
                  </Link>
                  <Link
                    href="/wedding-website/themes"
                    className="inline-flex items-center justify-center px-8 py-3.5 bg-card border border-border text-foreground font-semibold rounded-xl hover:bg-muted transition-colors"
                  >
                    Browse all templates
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground mt-3">Free · No credit card required</p>
              </div>

              {/* Preview image */}
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-border">
                <div className="bg-muted px-4 py-2.5 flex items-center gap-2 border-b border-border">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 bg-background rounded-md px-3 py-1 text-xs text-muted-foreground flex items-center gap-1.5 ml-2">
                    <ExternalLink className="w-3 h-3" />
                    ceremoney.com/wedding/your-name
                  </div>
                </div>
                {selectedTheme.imageUrl ? (
                  <img
                    src={selectedTheme.imageUrl}
                    alt={`${selectedTheme.name} template preview`}
                    className="w-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-64 flex items-center justify-center"
                    style={{ backgroundColor: selectedTheme.accentColor }}
                  >
                    <span className="text-2xl font-bold" style={{ color: selectedTheme.primaryColor }}>
                      {selectedTheme.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Other templates */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-foreground mb-6 text-center">Other templates you might like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
              {allTemplates.filter((t) => t.slug !== style).slice(0, 3).map((theme) => (
                <Link
                  key={theme.slug}
                  href={`/wedding-website/themes?style=${theme.slug}`}
                  className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-md hover:border-primary/20 transition-all"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-muted">
                    {theme.imageUrl ? (
                      <img
                        src={theme.imageUrl}
                        alt={theme.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: theme.accentColor }}>
                        <span className="font-bold text-sm" style={{ color: theme.primaryColor }}>{theme.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm text-foreground">{theme.name}</p>
                    <p className="text-xs text-muted-foreground">{theme.tagline}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ── Gallery view ──
  return (
    <div className="bg-background min-h-screen">
      <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link
            href="/wedding-website"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Wedding Website
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Wedding Website Templates
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Handcrafted designs for every style. Pick your favourite and customize it to make it yours.
          </p>
        </div>
      </section>

      <section className="py-12 pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {allTemplates.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              No templates available yet. Check back soon.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {allTemplates.map((theme) => (
                <Link
                  key={theme.slug}
                  href={`/wedding-website/themes?style=${theme.slug}`}
                  className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-muted relative">
                    {theme.imageUrl ? (
                      <img
                        src={theme.imageUrl}
                        alt={theme.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: theme.accentColor }}>
                        <span className="font-bold" style={{ color: theme.primaryColor }}>{theme.name}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-foreground text-sm font-semibold px-4 py-2 rounded-lg shadow-md">
                        Preview template
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-foreground">{theme.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 mb-2">{theme.tagline}</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {theme.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-16 bg-card rounded-3xl border border-border p-10">
            <h2 className="text-2xl font-bold text-foreground mb-3">Ready to get started?</h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Create your free wedding website today and share your story with the world.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
            >
              Start for free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
