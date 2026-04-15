"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function fixLeafletIcons() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

interface Props {
  lat: number;
  lng: number;
  name: string;
  city?: string | null;
  country?: string | null;
  phone?: string | null;
}

export default function VendorSingleMap({ lat, lng, name, city, country, phone }: Props) {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={13}
      style={{ height: "300px", width: "100%", borderRadius: "0.75rem" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]}>
        <Popup>
          <div className="text-sm">
            <p className="font-semibold text-gray-900">{name}</p>
            {(city || country) && (
              <p className="text-xs text-gray-500 mt-0.5">
                {[city, country].filter(Boolean).join(", ")}
              </p>
            )}
            {phone && <p className="text-xs text-gray-500 mt-0.5">{phone}</p>}
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
