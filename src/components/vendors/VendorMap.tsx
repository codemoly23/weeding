"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";

// Fix Leaflet default marker icons in Next.js
function fixLeafletIcons() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

interface VendorCard {
  id: string;
  slug: string;
  businessName: string;
  category: string;
  tagline: string | null;
  city: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  coverPhoto: string | null;
  startingPrice: number | null;
  currency: string;
  isFeatured: boolean;
  isVerified: boolean;
  slaHours: number | null;
  reviewCount: number;
  avgRating: number | null;
}

interface Props {
  vendors: VendorCard[];
}

function formatCategory(cat: string) {
  return cat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function VendorMap({ vendors }: Props) {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  const mapped = vendors.filter((v) => v.lat !== null && v.lng !== null);

  // Default center: first mapped vendor, or Europe
  const center: [number, number] =
    mapped.length > 0
      ? [mapped[0].lat as number, mapped[0].lng as number]
      : [54, 15];

  return (
    <MapContainer
      center={center}
      zoom={mapped.length > 0 ? 8 : 4}
      style={{ height: "600px", width: "100%", borderRadius: "1rem" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {mapped.map((v) => (
        <Marker key={v.id} position={[v.lat as number, v.lng as number]}>
          <Popup minWidth={200}>
            <div className="text-sm">
              <p className="font-semibold text-gray-900 text-base leading-tight">{v.businessName}</p>
              <p className="text-xs text-indigo-600 mt-0.5">{formatCategory(v.category)}</p>
              {v.city && (
                <p className="text-xs text-gray-500 mt-0.5">{v.city}{v.country ? `, ${v.country}` : ""}</p>
              )}
              {v.avgRating !== null && (
                <p className="text-xs text-amber-500 mt-1">★ {v.avgRating.toFixed(1)} ({v.reviewCount})</p>
              )}
              {v.startingPrice !== null && (
                <p className="text-xs text-gray-700 mt-0.5">
                  From {v.currency} {v.startingPrice.toLocaleString()}
                </p>
              )}
              <Link
                href={`/vendors/${v.slug}`}
                className="mt-2 inline-block rounded-lg bg-emerald-500 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-600"
              >
                View Profile
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
      {mapped.length === 0 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1000,
            background: "white",
            padding: "1rem 1.5rem",
            borderRadius: "0.75rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            pointerEvents: "none",
          }}
        >
          <p className="text-sm text-gray-500">No vendors with location data found.</p>
        </div>
      )}
    </MapContainer>
  );
}
