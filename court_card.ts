"use client";
import Image from "next/image";
import Link from "next/link";
import { formatPrice, courtTypeLabel, surfaceLabel } from "@/lib/utils";

interface Court {
  id: number;
  name: string;
  slug: string;
  courtType: string;
  surface: string;
  minPriceHour: number;
  maxPriceHour: number;
  avgRating: number;
  totalReviews: number;
  coverImageUrl: string | null;
  hasParking: boolean;
  hasShower: boolean;
  hasRacketRental: boolean;
  hasLighting: boolean;
  city: { name: string };
  district: { name: string };
}

export default function CourtCard({ court }: { court: Court }) {
  return (
    <Link
      href={`/kort/${court.slug}`}
      className="group block card p-0 overflow-hidden hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-48 bg-surface-highest overflow-hidden">
        {court.coverImageUrl ? (
          <Image
            src={court.coverImageUrl}
            alt={court.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-high">
            <span className="text-4xl">🎾</span>
          </div>
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-lowest/80 to-transparent" />
        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <span className={`badge ${court.courtType === "indoor" ? "bg-primary text-on-primary" : "bg-surface-high text-on-surface"}`}>
            {courtTypeLabel(court.courtType)}
          </span>
        </div>
        {/* Rating */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-surface-lowest/80 backdrop-blur px-2 py-1 rounded-full">
          <span className="text-primary text-xs">★</span>
          <span className="text-on-surface text-xs font-700">{court.avgRating.toFixed(1)}</span>
          <span className="text-on-surface-variant text-xs">({court.totalReviews})</span>
        </div>
        {/* Location */}
        <div className="absolute bottom-3 left-3">
          <span className="text-on-surface text-xs font-600 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {court.district.name}, {court.city.name}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display font-700 text-lg text-on-surface mb-3 group-hover:text-primary transition-colors line-clamp-1">
          {court.name}
        </h3>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mb-4">
          {court.hasParking && (
            <span className="text-xs text-on-surface-variant flex items-center gap-1">
              <span>🅿️</span> Park
            </span>
          )}
          {court.hasShower && (
            <span className="text-xs text-on-surface-variant flex items-center gap-1">
              <span>🚿</span> Duş
            </span>
          )}
          {court.hasRacketRental && (
            <span className="text-xs text-on-surface-variant flex items-center gap-1">
              <span>🎾</span> Raket
            </span>
          )}
          {court.hasLighting && (
            <span className="text-xs text-on-surface-variant flex items-center gap-1">
              <span>💡</span> Aydınlatma
            </span>
          )}
          <span className="text-xs text-on-surface-variant">
            {surfaceLabel(court.surface)}
          </span>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-on-surface-variant text-xs">Saatten</span>
            <div className="font-display font-800 text-xl text-primary">
              {formatPrice(court.minPriceHour)}
            </div>
          </div>
          <span className="text-sm font-600 text-on-surface bg-surface-highest px-4 py-2 rounded-full group-hover:bg-primary group-hover:text-on-primary transition-all duration-200">
            Rezerve Et →
          </span>
        </div>
      </div>
    </Link>
  );
}
