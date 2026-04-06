"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";

// Fix default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const customIcon = new L.DivIcon({
  html: `<div style="width:32px;height:32px;background:linear-gradient(135deg,#C3F400,#ABD600);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #283500;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  className: "",
});

interface CourtMarker {
  id: number;
  name: string;
  slug: string;
  lat: number;
  lng: number;
  minPriceHour: number;
  avgRating: number;
  courtType: string;
  cityName: string;
}

interface MapProps {
  courts: CourtMarker[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

export default function Map({ courts, center = [39.1, 34.8], zoom = 6, height = "100%" }: MapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height, width: "100%", borderRadius: "12px" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {courts.map((court) => (
        <Marker key={court.id} position={[court.lat, court.lng]} icon={customIcon}>
          <Popup>
            <div style={{ minWidth: 180 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#E5E2E1", marginBottom: 4 }}>
                {court.name}
              </div>
              <div style={{ color: "#C4C9AC", fontSize: 12, marginBottom: 4 }}>
                {court.cityName} • {court.courtType === "indoor" ? "Kapalı" : "Açık"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ color: "#C3F400", fontSize: 12 }}>★ {court.avgRating.toFixed(1)}</span>
                <span style={{ color: "#C4C9AC", fontSize: 12 }}>₺{court.minPriceHour}/saat'ten</span>
              </div>
              <a
                href={`/kort/${court.slug}`}
                style={{
                  display: "block",
                  background: "linear-gradient(135deg,#C3F400,#ABD600)",
                  color: "#283500",
                  padding: "6px 12px",
                  borderRadius: 20,
                  textAlign: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Detay & Rezervasyon →
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
