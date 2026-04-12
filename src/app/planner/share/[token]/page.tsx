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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-purple-50">
        <div className="text-center space-y-3">
          <p className="text-4xl">💍</p>
          <h1 className="text-xl font-bold text-gray-800">Link not found</h1>
          <p className="text-sm text-gray-500">This share link is no longer active or doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-purple-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-200 border-t-rose-500" />
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
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-rose-500 to-purple-600 text-white py-12 px-4 text-center">
        <p className="text-sm uppercase tracking-widest text-rose-100 mb-2">Wedding Planning</p>
        <h1 className="text-3xl font-bold mb-1">{coupleNames || data.title}</h1>
        {eventDateStr && (
          <p className="flex items-center justify-center gap-2 mt-3 text-rose-100 text-sm">
            <Calendar className="h-4 w-4" />
            {eventDateStr}
          </p>
        )}
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
            <Users className="h-5 w-5 text-rose-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-800">{data.guestCount}</p>
            <p className="text-xs text-gray-500">Guests</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
            <CheckSquare className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-800">{checklistPct}%</p>
            <p className="text-xs text-gray-500">Checklist</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
            <DollarSign className="h-5 w-5 text-indigo-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-800">{data.vendors.length}</p>
            <p className="text-xs text-gray-500">Vendors</p>
          </div>
        </div>

        {/* Venues */}
        {(ceremony?.venueName || reception?.venueName) && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-rose-400" /> Venues
            </h2>
            {ceremony?.venueName && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-rose-400 mb-0.5">Ceremony</p>
                <p className="font-medium text-gray-800">{ceremony.venueName}</p>
                {(ceremony.address || ceremony.city) && (
                  <p className="text-sm text-gray-500">{[ceremony.address, ceremony.city, ceremony.country].filter(Boolean).join(", ")}</p>
                )}
                {ceremony.time && <p className="text-sm text-gray-500">🕐 {ceremony.time}</p>}
              </div>
            )}
            {reception?.venueName && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-0.5">Reception</p>
                <p className="font-medium text-gray-800">{reception.venueName}</p>
                {(reception.address || reception.city) && (
                  <p className="text-sm text-gray-500">{[reception.address, reception.city, reception.country].filter(Boolean).join(", ")}</p>
                )}
                {reception.time && <p className="text-sm text-gray-500">🕐 {reception.time}</p>}
              </div>
            )}
          </div>
        )}

        {/* Vendors */}
        {data.vendors.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
              <Store className="h-4 w-4 text-purple-400" /> Vendors
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {data.vendors.map((v) => (
                <div key={v.id} className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                  <p className="text-sm font-medium text-gray-800 truncate">{v.name}</p>
                  <p className="text-xs text-gray-400">{formatCategory(v.category)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Checklist progress */}
        {data.checklistTotal > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
              <CheckSquare className="h-4 w-4 text-emerald-400" /> Planning Progress
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all"
                  style={{ width: `${checklistPct}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-700 shrink-0">
                {data.checklistDone}/{data.checklistTotal}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">{checklistPct}% of planning tasks completed</p>
          </div>
        )}

        <p className="text-center text-xs text-gray-300 pb-4">
          Shared via Ceremoney · Read-only view
        </p>
      </div>
    </div>
  );
}
