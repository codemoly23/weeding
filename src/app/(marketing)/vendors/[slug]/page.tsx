"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import dynamic from "next/dynamic";

const VendorSingleMap = dynamic(() => import("@/components/vendors/VendorSingleMap"), { ssr: false });
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle2,
  Calendar,
  Building2,
  Camera,
  Music,
  Flower2,
  Car,
  Scissors,
  CalendarHeart,
  Gem,
  UtensilsCrossed,
  Video,
  Shirt,
  Sparkles,
  Package,
  Clock,
  Instagram,
  Facebook,
  ChevronDown,
  BadgeCheck,
  Heart,
} from "lucide-react";

type VendorCategory =
  | "VENUE"
  | "PHOTOGRAPHY"
  | "VIDEOGRAPHY"
  | "CATERING"
  | "MUSIC_DJ"
  | "FLOWERS"
  | "DRESS_ATTIRE"
  | "RINGS"
  | "DECORATIONS"
  | "TRANSPORTATION"
  | "HAIR_MAKEUP"
  | "WEDDING_PLANNER"
  | "OTHER";

const CATEGORY_META: Record<VendorCategory, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  VENUE:          { label: "Venues",          icon: <Building2 className="w-5 h-5" />,      color: "text-accent",           bg: "bg-accent/10" },
  PHOTOGRAPHY:    { label: "Photography",     icon: <Camera className="w-5 h-5" />,          color: "text-accent",           bg: "bg-accent/10" },
  VIDEOGRAPHY:    { label: "Videography",     icon: <Video className="w-5 h-5" />,           color: "text-foreground/70",    bg: "bg-muted" },
  CATERING:       { label: "Catering",        icon: <UtensilsCrossed className="w-5 h-5" />, color: "text-foreground/70",    bg: "bg-muted" },
  MUSIC_DJ:       { label: "Music & DJ",      icon: <Music className="w-5 h-5" />,           color: "text-accent",           bg: "bg-accent/10" },
  FLOWERS:        { label: "Flowers",         icon: <Flower2 className="w-5 h-5" />,         color: "text-foreground/70",    bg: "bg-muted" },
  DRESS_ATTIRE:   { label: "Dress & Attire",  icon: <Shirt className="w-5 h-5" />,           color: "text-accent",           bg: "bg-accent/10" },
  RINGS:          { label: "Rings & Jewelry", icon: <Gem className="w-5 h-5" />,             color: "text-accent",           bg: "bg-accent/10" },
  DECORATIONS:    { label: "Decorations",     icon: <Sparkles className="w-5 h-5" />,        color: "text-foreground/70",    bg: "bg-muted" },
  TRANSPORTATION: { label: "Transportation",  icon: <Car className="w-5 h-5" />,             color: "text-foreground/70",    bg: "bg-muted" },
  HAIR_MAKEUP:    { label: "Hair & Makeup",   icon: <Scissors className="w-5 h-5" />,        color: "text-accent",           bg: "bg-accent/10" },
  WEDDING_PLANNER:{ label: "Wedding Planner", icon: <CalendarHeart className="w-5 h-5" />,   color: "text-primary",          bg: "bg-primary/5" },
  OTHER:          { label: "Other",           icon: <Package className="w-5 h-5" />,         color: "text-muted-foreground", bg: "bg-muted" },
};

interface Review {
  id: string;
  authorName: string;
  rating: number;
  comment: string | null;
  reply: string | null;
  createdAt: string;
}

interface AvailabilityEntry {
  id: string;
  date: string;
  status: "AVAILABLE" | "BOOKED" | "TENTATIVE";
  note: string | null;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface Vendor {
  id: string;
  slug: string;
  businessName: string;
  category: VendorCategory;
  description: string | null;
  tagline: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  pinterest: string | null;
  city: string | null;
  country: string;
  photos: string[];
  videoUrls: string[];
  startingPrice: number | null;
  maxPrice: number | null;
  currency: string;
  yearsInBusiness: number | null;
  languages: string[];
  lat: number | null;
  lng: number | null;
  isFeatured: boolean;
  isVerified: boolean;
  slaHours: number | null;
  faqItems: FaqItem[] | null;
  availability: AvailabilityEntry[];
  reviews: Review[];
  avgRating: number | null;
}

interface InquiryForm {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  message: string;
  budget: string;
}

const EVENT_TYPES = [
  "Wedding",
  "Engagement Party",
  "Bridal Shower",
  "Rehearsal Dinner",
  "Anniversary",
  "Other",
];

export default function VendorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: session } = useSession();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [linkedProjectId, setLinkedProjectId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [inquiryError, setInquiryError] = useState("");
  const [form, setForm] = useState<InquiryForm>({
    name: "",
    email: "",
    phone: "",
    eventType: "Wedding",
    eventDate: "",
    message: "",
    budget: "",
  });
  const [projects, setProjects] = useState<{ id: string; title: string }[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ authorName: "", rating: 5, comment: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const [calMonth, setCalMonth] = useState<Date>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // Auto-fill name/email when logged in
  useEffect(() => {
    if (session?.user) {
      setForm(prev => ({
        ...prev,
        name: prev.name || session.user?.name || "",
        email: prev.email || session.user?.email || "",
      }));
    }
  }, [session]);

  // Load couple's projects when logged in
  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/planner/projects")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.projects) setProjects(data.projects);
      })
      .catch(() => {});
  }, [session]);

  useEffect(() => {
    fetch(`/api/vendors/${slug}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => {
        if (data) setVendor(data.vendor);
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch(`/api/vendors/${slug}/save`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setIsSaved(data.saved); })
      .catch(() => {});
  }, [slug, session?.user?.id]);

  async function toggleSave() {
    if (!session?.user?.id) {
      window.location.href = `/login?returnTo=/vendors/${slug}`;
      return;
    }
    setSaveLoading(true);
    try {
      const res = await fetch(`/api/vendors/${slug}/save`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setIsSaved(data.saved);
      }
    } finally {
      setSaveLoading(false);
    }
  }

  function updateForm(field: keyof InquiryForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submitInquiry(e: React.FormEvent) {
    e.preventDefault();
    if (!vendor) return;
    setSubmitting(true);
    setInquiryError("");
    try {
      // If logged-in couple selected a project, use planner conversations API
      if (selectedProjectId && session?.user?.id) {
        const res = await fetch(`/api/planner/projects/${selectedProjectId}/conversations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vendorId: vendor.id,
            message: form.message || `Hi ${vendor.businessName}, I'm interested in your services for my ${form.eventType}.`,
          }),
        });
        if (!res.ok) {
          const d = await res.json();
          setInquiryError(d.error || "Failed to send. Please try again.");
          return;
        }
        setLinkedProjectId(selectedProjectId);
        setInquirySubmitted(true);
        return;
      }

      // Anonymous inquiry path
      const res = await fetch(`/api/vendors/${slug}/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          eventDate: form.eventDate || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setInquiryError(d.error || "Failed to send. Please try again.");
        return;
      }
      const data = await res.json();
      setConversationId(data.conversationId ?? null);
      setInquirySubmitted(true);
    } catch {
      setInquiryError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!vendor) return;
    setReviewSubmitting(true);
    setReviewError("");
    try {
      const res = await fetch(`/api/vendors/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewForm),
      });
      if (!res.ok) {
        const d = await res.json();
        setReviewError(d.error || "Failed to submit review.");
        return;
      }
      setReviewSubmitted(true);
      setShowReviewForm(false);
      setReviewForm({ authorName: "", rating: 5, comment: "" });
    } catch {
      setReviewError("Network error. Please try again.");
    } finally {
      setReviewSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (notFound || !vendor) {
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center gap-4">
        <div className="text-6xl">😔</div>
        <h1 className="text-2xl font-bold text-foreground">Vendor not found</h1>
        <Link href="/vendors" className="text-primary hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to directory
        </Link>
      </div>
    );
  }

  const meta = CATEGORY_META[vendor.category];
  const photos = vendor.photos.length > 0 ? vendor.photos : [];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Back nav */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/vendors"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Vendors
          </Link>
          <button
            onClick={toggleSave}
            disabled={saveLoading}
            title={isSaved ? "Unsave" : "Save vendor"}
            className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-60 ${
              isSaved
                ? "bg-accent/10 border-accent/30 text-accent hover:bg-accent/20"
                : "bg-card border-border text-muted-foreground hover:bg-muted/30"
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? "fill-accent text-accent" : ""}`} />
            {isSaved ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header card */}
            <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border">
              {/* Photo gallery */}
              {photos.length > 0 ? (
                <div className="relative h-72 sm:h-96 bg-foreground">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photos[photoIdx]}
                    alt={`${vendor.businessName} photo ${photoIdx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {photos.length > 1 && (
                    <>
                      <button
                        onClick={() => setPhotoIdx((i) => (i - 1 + photos.length) % photos.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setPhotoIdx((i) => (i + 1) % photos.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {photos.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setPhotoIdx(i)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              i === photoIdx ? "bg-card" : "bg-card/50"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  {/* Thumbnail strip */}
                  {photos.length > 1 && (
                    <div className="absolute bottom-0 left-0 right-0 flex gap-1 p-2 overflow-x-auto bg-gradient-to-t from-black/40">
                      {photos.slice(0, 8).map((photo, i) => (
                        <button
                          key={i}
                          onClick={() => setPhotoIdx(i)}
                          className={`shrink-0 w-12 h-10 rounded overflow-hidden border-2 transition-colors ${
                            i === photoIdx ? "border-white" : "border-transparent"
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photo} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className={`h-48 ${meta.bg} flex items-center justify-center`}>
                  <span className={`${meta.color}`}>
                    {meta.icon}
                  </span>
                </div>
              )}

              {/* Business info */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`${meta.bg} ${meta.color} text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1`}>
                        {meta.icon}
                        {meta.label}
                      </span>
                      {vendor.isFeatured && (
                        <span className="bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] text-xs font-medium px-2 py-0.5 rounded-full">
                          Featured
                        </span>
                      )}
                      {vendor.isVerified && (
                        <span className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
                          <BadgeCheck className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">{vendor.businessName}</h1>
                    {vendor.tagline && (
                      <p className="text-muted-foreground mt-1">{vendor.tagline}</p>
                    )}
                  </div>
                  {vendor.avgRating !== null && (
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-[var(--color-star)]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.round(vendor.avgRating!) ? "fill-[var(--color-star)]" : "fill-border text-border"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {vendor.avgRating.toFixed(1)} ({vendor.reviews.length} review{vendor.reviews.length !== 1 ? "s" : ""})
                      </p>
                    </div>
                  )}
                </div>

                {/* Quick info row */}
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                  {(vendor.city || vendor.country) && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-muted-foreground/60" />
                      {[vendor.city, vendor.country].filter(Boolean).join(", ")}
                    </span>
                  )}
                  {vendor.yearsInBusiness && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-muted-foreground/60" />
                      {vendor.yearsInBusiness} years in business
                    </span>
                  )}
                  {vendor.slaHours && (
                    <span className="flex items-center gap-1 text-[var(--color-success-text)] bg-[var(--color-success-bg)] px-2 py-0.5 rounded-full text-xs font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      Responds within {vendor.slaHours}h
                    </span>
                  )}
                  {vendor.startingPrice && (
                    <span className="font-semibold text-primary">
                      {vendor.currency} {vendor.startingPrice.toLocaleString()}
                      {vendor.maxPrice ? ` – ${vendor.maxPrice.toLocaleString()}` : "+"}
                    </span>
                  )}
                </div>

                {/* Contact links */}
                <div className="flex flex-wrap gap-3 mt-4">
                  {vendor.phone && (
                    <a
                      href={`tel:${vendor.phone}`}
                      className="flex items-center gap-1.5 text-sm text-foreground/80 hover:text-primary transition-colors"
                    >
                      <Phone className="w-4 h-4" /> {vendor.phone}
                    </a>
                  )}
                  {vendor.email && (
                    <a
                      href={`mailto:${vendor.email}`}
                      className="flex items-center gap-1.5 text-sm text-foreground/80 hover:text-primary transition-colors"
                    >
                      <Mail className="w-4 h-4" /> {vendor.email}
                    </a>
                  )}
                  {vendor.website && (
                    <a
                      href={vendor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-foreground/80 hover:text-primary transition-colors"
                    >
                      <Globe className="w-4 h-4" /> Website
                    </a>
                  )}
                  {vendor.instagram && (
                    <a
                      href={`https://instagram.com/${vendor.instagram.replace(/^@/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-foreground/80 hover:text-accent transition-colors"
                    >
                      <Instagram className="w-4 h-4" /> Instagram
                    </a>
                  )}
                  {vendor.facebook && (
                    <a
                      href={vendor.facebook.startsWith("http") ? vendor.facebook : `https://facebook.com/${vendor.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-foreground/80 hover:text-accent transition-colors"
                    >
                      <Facebook className="w-4 h-4" /> Facebook
                    </a>
                  )}
                  {vendor.pinterest && (
                    <a
                      href={vendor.pinterest.startsWith("http") ? vendor.pinterest : `https://pinterest.com/${vendor.pinterest}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-foreground/80 hover:text-accent transition-colors"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                      </svg>
                      Pinterest
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* About */}
            {vendor.description && (
              <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                <h2 className="text-lg font-semibold text-foreground mb-3">About</h2>
                <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">{vendor.description}</p>
              </div>
            )}

            {/* Languages */}
            {vendor.languages.length > 0 && (
              <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                <h2 className="text-lg font-semibold text-foreground mb-3">Languages Spoken</h2>
                <div className="flex flex-wrap gap-2">
                  {vendor.languages.map((lang) => (
                    <span key={lang} className="bg-muted text-foreground/80 px-3 py-1 rounded-full text-sm">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Availability Calendar */}
            {vendor.availability.length > 0 && (() => {
              const availMap = new Map(
                vendor.availability.map((a) => [a.date.slice(0, 10), a])
              );
              const year = calMonth.getFullYear();
              const month = calMonth.getMonth();
              const firstDay = new Date(year, month, 1).getDay();
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const today = new Date().toISOString().slice(0, 10);
              const cells: (number | null)[] = [
                ...Array(firstDay).fill(null),
                ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
              ];
              const statusColor = {
                AVAILABLE: "bg-[var(--color-success-bg)] text-[var(--color-success-text)] font-semibold",
                BOOKED: "bg-[var(--color-error-bg)] text-[var(--color-error-text)] line-through opacity-60",
                TENTATIVE: "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]",
              };
              return (
                <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-foreground">Availability</h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCalMonth(new Date(year, month - 1, 1))}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-medium text-foreground/80 min-w-[100px] text-center">
                        {calMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                      </span>
                      <button
                        onClick={() => setCalMonth(new Date(year, month + 1, 1))}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center mb-1">
                    {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
                      <div key={d} className="text-xs text-muted-foreground/60 font-medium py-1">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {cells.map((day, idx) => {
                      if (!day) return <div key={idx} />;
                      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                      const entry = availMap.get(dateStr);
                      const isToday = dateStr === today;
                      return (
                        <div
                          key={idx}
                          title={entry ? `${entry.status}${entry.note ? ": " + entry.note : ""}` : undefined}
                          className={`rounded-lg py-1.5 text-xs text-center transition-colors ${
                            entry
                              ? statusColor[entry.status]
                              : "text-muted-foreground hover:bg-muted/30"
                          } ${isToday ? "ring-2 ring-ring" : ""}`}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[var(--color-success-bg)] inline-block" />Available</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[var(--color-warning-bg)] inline-block" />Tentative</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[var(--color-error-bg)] inline-block" />Booked</span>
                  </div>
                </div>
              );
            })()}

            {/* FAQ */}
            {vendor.faqItems && vendor.faqItems.length > 0 && (
              <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4">Frequently Asked Questions</h2>
                <div className="space-y-2">
                  {vendor.faqItems.map((item, idx) => (
                    <div key={idx} className="border border-border rounded-xl overflow-hidden">
                      <button
                        onClick={() => setOpenFaqIdx(openFaqIdx === idx ? null : idx)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted/30 transition-colors"
                      >
                        <span>{item.question}</span>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground/60 shrink-0 transition-transform ${openFaqIdx === idx ? "rotate-180" : ""}`} />
                      </button>
                      {openFaqIdx === idx && (
                        <div className="px-4 pb-4 pt-1 text-sm text-muted-foreground leading-relaxed border-t border-border bg-muted/30">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Reviews{vendor.reviews.length > 0 ? ` (${vendor.reviews.length})` : ""}
                </h2>
                {!reviewSubmitted ? (
                  <button
                    onClick={() => setShowReviewForm((v) => !v)}
                    className="text-sm font-medium text-primary border border-primary/20 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors"
                  >
                    {showReviewForm ? "Cancel" : "Write a Review"}
                  </button>
                ) : (
                  <span className="text-sm text-[var(--color-success-text)] font-medium">✓ Review submitted!</span>
                )}
              </div>

              {/* Rating summary */}
              {vendor.reviews.length > 0 && vendor.avgRating !== null && (() => {
                const breakdown = [5, 4, 3, 2, 1].map((star) => ({
                  star,
                  count: vendor.reviews.filter((r) => r.rating === star).length,
                }));
                const maxCount = Math.max(...breakdown.map((b) => b.count), 1);
                const recommended = Math.round(
                  (vendor.reviews.filter((r) => r.rating >= 4).length / vendor.reviews.length) * 100
                );
                return (
                  <div className="flex flex-col sm:flex-row gap-6 mb-6 pb-6 border-b border-border">
                    {/* Score */}
                    <div className="text-center shrink-0">
                      <div className="text-5xl font-bold text-foreground">{vendor.avgRating.toFixed(1)}</div>
                      <div className="flex items-center justify-center gap-0.5 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round(vendor.avgRating!) ? "fill-[var(--color-star)] text-[var(--color-star)]" : "fill-border text-border"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Recommended by {recommended}% of couples
                      </p>
                    </div>
                    {/* Breakdown bars */}
                    <div className="flex-1 space-y-1.5">
                      {breakdown.map(({ star, count }) => (
                        <div key={star} className="flex items-center gap-2 text-xs">
                          <span className="w-6 text-right text-muted-foreground shrink-0">{star}★</span>
                          <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                            <div
                              className="h-2 bg-[var(--color-star)] rounded-full transition-all"
                              style={{ width: `${(count / maxCount) * 100}%` }}
                            />
                          </div>
                          <span className="w-4 text-muted-foreground shrink-0">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Write a Review form */}
              {showReviewForm && (
                <form onSubmit={submitReview} className="mb-6 p-4 bg-muted/30 rounded-xl border border-border space-y-3">
                  <p className="text-sm font-medium text-foreground">Share your experience</p>
                  {reviewError && (
                    <div className="text-sm text-[var(--color-error-text)] bg-[var(--color-error-bg)] border border-[var(--color-error-text)]/20 rounded-lg px-3 py-2">
                      {reviewError}
                    </div>
                  )}
                  {/* Star rating picker */}
                  <div>
                    <label className="block text-xs font-medium text-foreground/80 mb-1">Your Rating *</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                          className="p-0.5 focus:outline-none"
                        >
                          <Star
                            className={`w-7 h-7 transition-colors ${
                              star <= reviewForm.rating
                                ? "fill-[var(--color-star)] text-[var(--color-star)]"
                                : "fill-border text-border hover:fill-[var(--color-star)]/30 hover:text-[var(--color-star)]/50"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground/80 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={reviewForm.authorName}
                      onChange={(e) => setReviewForm((f) => ({ ...f, authorName: e.target.value }))}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground/80 mb-1">Review</label>
                    <textarea
                      rows={3}
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      placeholder="Tell others about your experience..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                  >
                    {reviewSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                  <p className="text-xs text-muted-foreground/60 text-center">Your review will appear after admin approval.</p>
                </form>
              )}

              {/* Review list */}
              {vendor.reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-4">
                  {vendor.reviews.map((review) => (
                    <div key={review.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-foreground">{review.authorName}</span>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < review.rating ? "fill-[var(--color-star)] text-[var(--color-star)]" : "fill-border text-border"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-muted-foreground text-sm">{review.comment}</p>
                      )}
                      {review.reply && (
                        <div className="mt-2 pl-3 border-l-2 border-primary/20">
                          <p className="text-xs text-muted-foreground mb-0.5">Vendor reply:</p>
                          <p className="text-muted-foreground text-sm">{review.reply}</p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {new Date(review.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Map */}
            {vendor.lat && vendor.lng && (
              <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4">Map</h2>
                <VendorSingleMap
                  lat={vendor.lat}
                  lng={vendor.lng}
                  name={vendor.businessName}
                  city={vendor.city}
                  country={vendor.country}
                  phone={vendor.phone}
                />
                <div className="mt-3 flex items-start gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 text-muted-foreground/60 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Location</p>
                    {vendor.city && (
                      <p className="text-muted-foreground">{[vendor.city, vendor.country].filter(Boolean).join(", ")}</p>
                    )}
                    {vendor.phone && <p className="text-muted-foreground">{vendor.phone}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Inquiry form sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                {inquirySubmitted ? (
                  <div className="text-center py-6">
                    <CheckCircle2 className="w-12 h-12 text-[var(--color-success-text)] mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-foreground mb-1">Message Sent!</h3>
                    <p className="text-muted-foreground text-sm">
                      {vendor.businessName} will get back to you shortly.
                    </p>
                    {linkedProjectId && (
                      <Link
                        href={`/planner/${linkedProjectId}/vendors`}
                        className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" /> View in your planner
                      </Link>
                    )}
                    {conversationId && !linkedProjectId && (
                      <Link
                        href={`/conversation/${conversationId}`}
                        className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" /> View Conversation
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setInquirySubmitted(false);
                        setConversationId(null);
                        setLinkedProjectId(null);
                        setForm({
                          name: session?.user?.name || "", email: session?.user?.email || "",
                          phone: "", eventType: "Wedding", eventDate: "", message: "", budget: "",
                        });
                      }}
                      className="mt-3 block text-primary text-sm hover:underline"
                    >
                      Send another inquiry
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-lg font-semibold text-foreground mb-1">Request Pricing</h2>
                    <p className="text-muted-foreground text-sm mb-4">
                      Get a personalized quote from {vendor.businessName}
                    </p>

                    {/* Project link — for logged-in couples */}
                    {projects.length > 0 && (
                      <div className="mb-4 p-3 bg-primary/5 border border-primary/10 rounded-lg">
                        <label className="block text-xs font-medium text-primary mb-1.5">
                          Link to your wedding project (optional)
                        </label>
                        <select
                          value={selectedProjectId}
                          onChange={e => setSelectedProjectId(e.target.value)}
                          className="w-full border border-primary/20 rounded-lg px-3 py-2 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="">— Send as anonymous inquiry —</option>
                          {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                          ))}
                        </select>
                        {selectedProjectId && (
                          <p className="text-[11px] text-primary mt-1.5">
                            Message will appear in your planner&apos;s Vendor Messages tab
                          </p>
                        )}
                      </div>
                    )}

                    {inquiryError && (
                      <div className="mb-4 p-3 bg-[var(--color-error-bg)] border border-[var(--color-error-text)]/20 text-[var(--color-error-text)] text-sm rounded-lg">
                        {inquiryError}
                      </div>
                    )}

                    <form onSubmit={submitInquiry} className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-foreground/80 mb-1">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => updateForm("name", e.target.value)}
                          className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground/80 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => updateForm("email", e.target.value)}
                          className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground/80 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => updateForm("phone", e.target.value)}
                          className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="+1 234 567 8900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground/80 mb-1">
                          Event Type *
                        </label>
                        <select
                          required
                          value={form.eventType}
                          onChange={(e) => updateForm("eventType", e.target.value)}
                          className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          {EVENT_TYPES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground/80 mb-1">
                          Event Date
                        </label>
                        <input
                          type="date"
                          value={form.eventDate}
                          onChange={(e) => updateForm("eventDate", e.target.value)}
                          className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground/80 mb-1">
                          Budget (optional)
                        </label>
                        <input
                          type="text"
                          value={form.budget}
                          onChange={(e) => updateForm("budget", e.target.value)}
                          className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="e.g. SEK 5,000–10,000"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground/80 mb-1">
                          Message *
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={form.message}
                          onChange={(e) => updateForm("message", e.target.value)}
                          className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                          placeholder="Tell them about your event and what you're looking for..."
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        {submitting ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        {submitting ? "Sending..." : "Send Inquiry"}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
