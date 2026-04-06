// components/HomeMap.tsx
"use client";
import dynamic from "next/dynamic";

const MapInner = dynamic(() => import("./Map"), { ssr: false, loading: () => (
  <div className="w-full h-full bg-surface-low rounded-2xl flex items-center justify-center">
    <div className="text-on-surface-variant">Harita yükleniyor...</div>
  </div>
)});

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

export default function HomeMap({ courts }: { courts: CourtMarker[] }) {
  return <MapInner courts={courts} center={[39.1, 34.8]} zoom={6} />;
}

// ----- components/Map.tsx -----
// (This file must be saved separately as components/Map.tsx)
