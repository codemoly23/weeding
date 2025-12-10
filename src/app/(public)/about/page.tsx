import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  Globe,
  Award,
  Clock,
  Shield,
  Heart,
  Target,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about LLCPad - the trusted partner for international entrepreneurs starting US businesses. Over 10,000 LLCs formed for clients in 50+ countries.",
};

const stats = [
  { value: "10,000+", label: "LLCs Formed" },
  { value: "50+", label: "Countries Served" },
  { value: "4.9/5", label: "Customer Rating" },
  { value: "5+", label: "Years Experience" },
];

const values = [
  {
    icon: Shield,
    title: "Trust & Transparency",
    description:
      "No hidden fees, no surprises. We believe in clear communication and honest pricing.",
  },
  {
    icon: Zap,
    title: "Speed & Efficiency",
    description:
      "We know your time is valuable. Most formations are completed within 24-48 hours.",
  },
  {
    icon: Heart,
    title: "Customer First",
    description:
      "Your success is our success. Our support team is always ready to help you succeed.",
  },
  {
    icon: Target,
    title: "Expert Guidance",
    description:
      "Specialized knowledge in helping international entrepreneurs navigate US business formation.",
  },
];

const team = [
  {
    name: "Sarah Johnson",
    role: "Founder & CEO",
    bio: "Former corporate attorney with 15 years of experience in business formation.",
  },
  {
    name: "Michael Chen",
    role: "Head of Operations",
    bio: "Operations expert who has streamlined our filing process to industry-leading speeds.",
  },
  {
    name: "Priya Patel",
    role: "Customer Success Lead",
    bio: "Dedicated to ensuring every client has a smooth experience from start to finish.",
  },
  {
    name: "Ahmed Hassan",
    role: "International Relations",
    bio: "Helps clients from South Asia and Middle East navigate US business requirements.",
  },
];

export default function AboutPage() {
  return (
    <div className="py-16 lg:py-24">
      {/* Hero */}
      <section className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4">
            About LLCPad
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Empowering Global Entrepreneurs
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            We're on a mission to make US business formation accessible to
            entrepreneurs worldwide. No matter where you are, we help you
            establish a legitimate US presence with zero complexity.
          </p>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-primary sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="mt-24 bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold text-foreground">Our Story</h2>
            <div className="mt-6 space-y-4 text-muted-foreground">
              <p>
                LLCPad was founded in 2019 with a simple observation: while the
                US offers incredible business opportunities, the formation
                process was unnecessarily complicated for international
                entrepreneurs.
              </p>
              <p>
                Our founder, Sarah Johnson, spent years as a corporate attorney
                helping foreign clients establish US businesses. She saw
                firsthand how confusing and expensive the process could be,
                especially for those unfamiliar with the US legal system.
              </p>
              <p>
                That's why we built LLCPad — to provide a straightforward,
                affordable, and trustworthy service that handles all the
                complexity so you can focus on building your business.
              </p>
              <p>
                Today, we've helped over 10,000 entrepreneurs from more than 50
                countries establish their US presence. From solo e-commerce
                sellers to growing startups, we're proud to be part of their
                journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-foreground">Our Values</h2>
            <p className="mt-4 text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <Card key={value.title}>
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <value.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-foreground">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-foreground">
              Meet Our Team
            </h2>
            <p className="mt-4 text-muted-foreground">
              Dedicated professionals committed to your success
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <div className="mx-auto h-24 w-24 rounded-full bg-primary/10" />
                <h3 className="mt-4 font-semibold text-foreground">
                  {member.name}
                </h3>
                <p className="text-sm text-primary">{member.role}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-foreground">
              Ready to Get Started?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Join thousands of entrepreneurs who've trusted LLCPad with their
              US business formation.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/services/llc-formation">Start Your LLC</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
