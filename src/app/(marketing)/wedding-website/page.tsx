import type { Metadata } from "next";
import Link from "next/link";
import { Check, Globe, Heart, Image as ImageIcon, Users } from "lucide-react";
import { ALL_THEMES } from "./_lib/themes";

export const metadata: Metadata = {
  title: "Wedding Website Builder — Free & Beautiful | Ceremoney",
  description: "Create a stunning wedding website in minutes. Choose from beautiful templates, share your love story, collect RSVPs, and more — all free.",
};

const FEATURES = [
  {
    icon: Globe,
    title: "Free custom website",
    desc: "Get a beautiful wedding website with a unique URL you can share with all your guests.",
  },
  {
    icon: Users,
    title: "Easy RSVP management",
    desc: "Guests RSVP online and you track responses in real time — no spreadsheets needed.",
  },
  {
    icon: ImageIcon,
    title: "Photo gallery & guestbook",
    desc: "Share your engagement photos and let guests upload memories and leave messages.",
  },
  {
    icon: Heart,
    title: "Tell your love story",
    desc: "Add your story, venue details, schedule, and registry all in one beautiful place.",
  },
];

const STEPS = [
  { step: "1", title: "Choose a template", desc: "Pick from our handcrafted designs — each fully customizable." },
  { step: "2", title: "Add your details", desc: "Names, date, venue, story, photos — set it up in minutes." },
  { step: "3", title: "Share with guests", desc: "Send your link and start collecting RSVPs instantly." },
];

export default function WeddingWebsitePage() {
  return (
    <div className="bg-background">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-4">
              Free wedding websites
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Your wedding website,{" "}
              <span className="text-primary">beautifully designed</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
              Create a stunning wedding website in minutes. Share your story, collect RSVPs, and keep your guests informed — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
              >
                Get started free
              </Link>
              <Link
                href="/wedding-website/themes"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-card border border-border text-foreground font-semibold rounded-xl hover:bg-muted transition-colors"
              >
                Browse templates
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              No credit card required · Free forever
            </p>
          </div>
        </div>
      </section>

      {/* ── Template Gallery ── */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">Choose your design</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Handcrafted templates for every style — from classic elegance to modern minimalism.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ALL_THEMES.map((theme) => (
              <Link
                key={theme.slug}
                href={`/wedding-website/themes?style=${theme.slug}`}
                className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300"
              >
                <div className="aspect-[3/4] overflow-hidden bg-muted">
                  <img
                    src={theme.imageUrl}
                    alt={theme.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <p className="font-semibold text-foreground">{theme.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{theme.tagline}</p>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
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
          <div className="text-center mt-8">
            <Link
              href="/wedding-website/themes"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              See all website designs →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">Everything you need</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              All the tools to create a wedding website your guests will love.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-card rounded-2xl border border-border p-6 hover:shadow-sm transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">Set up in minutes</h2>
            <p className="text-muted-foreground">Three simple steps to your perfect wedding website.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {STEPS.map((s, i) => (
              <div key={s.step} className="text-center relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-[calc(50%+2rem)] right-0 h-px bg-border" />
                )}
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What's included ── */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto bg-card rounded-3xl border border-border p-8 sm:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-3">Free, forever</h2>
              <p className="text-muted-foreground">Your wedding website includes everything below at no cost.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "Beautiful template design",
                "Custom wedding URL",
                "Online RSVP collection",
                "Guest guestbook & messages",
                "Photo gallery",
                "Venue & schedule details",
                "Countdown timer",
                "Mobile-friendly layout",
                "Registry links",
                "Our love story section",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm text-foreground/80">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-primary/5 border-t border-primary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to create your wedding website?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Join thousands of couples who chose Ceremoney to share their special day.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
            >
              Start for free
            </Link>
            <Link
              href="/wedding-website/search"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-card border border-border text-foreground font-semibold rounded-xl hover:bg-muted transition-colors"
            >
              Find a couple&apos;s website
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
