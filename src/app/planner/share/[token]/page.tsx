"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Calendar, MapPin, Users, CheckSquare, DollarSign, Store } from "lucide-react";

interface VenueInfo {
  type: "CEREMONY" | "RECEPTION";
  venueName: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  date: string | null;
  time: string | null;
}

interface VendorInfo {
  id: string;
  name: string;
  category: string;
}

interface SharedProject {
  title: string;
  eventType: string;
  eventDate: string | null;
  brideName: string | null;
  groomName: string | null;
  venues: VenueInfo[];
  vendors: VendorInfo[];
  guestCount: number;
  checklistTotal: number;
  checklistDone: number;
  budgetTotal: number;
}

function formatCategory(cat: string) {
  return cat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function SharePage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<SharedProject | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/planner/share/${token}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); return null; }
        return r.json();
      })
      .then((d) => { if (d) setData(d); })
      .catch(() => setNotFound(true));
  }, [token]);

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30">
        <div className="text-center space-y-3">
          <p className="text-4xl">💍</p>
          <h1 className="text-xl font-bold text-foreground">Link not found</h1>
          <p className="text-sm text-muted-foreground">This share link is no longer active or doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  const ceremony = data.venues.find((v) => v.type === "CEREMONY");
  const reception = data.venues.find((v) => v.type === "RECEPTION");
  const checklistPct = data.checklistTotal > 0
    ? Math.round((data.checklistDone / data.checklistTotal) * 100)
    : 0;
  const coupleNames = [data.brideName, data.groomName].filter(Boolean).join(" & ");
  const eventDateStr = data.eventDate
    ? new Date(data.eventDate).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-12 px-4 text-center">
        <p className="text-sm uppercase tracking-widest text-primary-foreground/70 mb-2">Wedding Planning</p>
        <h1 className="text-3xl font-bold mb-1">{coupleNames || data.title}</h1>
        {eventDateStr && (
          <p className="flex items-center justify-center gap-2 mt-3 text-primary-foreground/70 text-sm">
            <Calendar className="h-4 w-4" />
            {eventDateStr}
          </p>
        )}
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card rounded-2xl p-4 text-center shadow-sm border border-border">
            <Users className="h-5 w-5 text-primary-foreground/80 mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{data.guestCount}</p>
            <p className="text-xs text-muted-foreground">Guests</p>
          </div>
          <div className="bg-card rounded-2xl p-4 text-center shadow-sm border border-border">
            <CheckSquare className="h-5 w-5 text-primary-foreground/80 mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{checklistPct}%</p>
            <p className="text-xs text-muted-foreground">Checklist</p>
          </div>
          <div className="bg-card rounded-2xl p-4 text-center shadow-sm border border-border">
            <DollarSign className="h-5 w-5 text-primary-foreground/80 mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{data.vendors.length}</p>
            <p className="text-xs text-muted-foreground">Vendors</p>
          </div>
        </div>

        {/* Venues */}
        {(ceremony?.venueName || reception?.venueName) && (
          <div className="bg-card rounded-2xl p-5 shadow-sm border border-border space-y-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary-foreground/70" /> Venues
            </h2>
            {ceremony?.venueName && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-0.5">Ceremony</p>
                <p className="font-medium text-foreground">{ceremony.venueName}</p>
                {(ceremony.address || ceremony.city) && (
                  <p className="text-sm text-muted-foreground">{[ceremony.address, ceremony.city, ceremony.country].filter(Boolean).join(", ")}</p>
                )}
                {ceremony.time && <p className="text-sm text-muted-foreground">🕐 {ceremony.time}</p>}
              </div>
            )}
            {reception?.venueName && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-0.5">Reception</p>
                <p className="font-medium text-foreground">{reception.venueName}</p>
                {(reception.address || reception.city) && (
                  <p className="text-sm text-muted-foreground">{[reception.address, reception.city, reception.country].filter(Boolean).join(", ")}</p>
                )}
                {reception.time && <p className="text-sm text-muted-foreground">🕐 {reception.time}</p>}
              </div>
            )}
          </div>
        )}

        {/* Vendors */}
        {data.vendors.length > 0 && (
          <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
            <h2 className="font-semibold text-foreground flex items-center gap-2 mb-3">
              <Store className="h-4 w-4 text-primary" /> Vendors
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {data.vendors.map((v) => (
                <div key={v.id} className="rounded-xl border border-border bg-muted px-3 py-2">
                  <p className="text-sm font-medium text-foreground truncate">{v.name}</p>
                  <p className="text-xs text-muted-foreground">{formatCategory(v.category)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Checklist progress */}
        {data.checklistTotal > 0 && (
          <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
            <h2 className="font-semibold text-foreground flex items-center gap-2 mb-3">
              <CheckSquare className="h-4 w-4 text-[var(--color-success-text)]" /> Planning Progress
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all"
                  style={{ width: `${checklistPct}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-foreground shrink-0">
                {data.checklistDone}/{data.checklistTotal}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{checklistPct}% of planning tasks completed</p>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground/50 pb-4">
          Shared via Ceremoney · Read-only view
        </p>
      </div>
    </div>
  );
}
