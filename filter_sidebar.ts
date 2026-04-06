"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface City { id: number; name: string; slug: string; }
interface FilterSidebarProps { cities: City[]; }

export default function FilterSidebar({ cities }: FilterSidebarProps) {
  const router = useRouter();
  const sp = useSearchParams();

  const [city, setCity] = useState(sp.get("city") || "");
  const [courtType, setCourtType] = useState(sp.get("type") || "");
  const [minPrice, setMinPrice] = useState(Number(sp.get("minPrice") || 0));
  const [maxPrice, setMaxPrice] = useState(Number(sp.get("maxPrice") || 1000));
  const [amenities, setAmenities] = useState<string[]>(sp.get("amenities")?.split(",").filter(Boolean) || []);
  const [sort, setSort] = useState(sp.get("sort") || "rating");

  function toggleAmenity(key: string) {
    setAmenities((prev) =>
      prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key]
    );
  }

  function apply() {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (courtType) params.set("type", courtType);
    if (minPrice > 0) params.set("minPrice", String(minPrice));
    if (maxPrice < 1000) params.set("maxPrice", String(maxPrice));
    if (amenities.length) params.set("amenities", amenities.join(","));
    if (sort) params.set("sort", sort);
    router.push(`/kortlar?${params.toString()}`);
  }

  function reset() {
    setCity(""); setCourtType(""); setMinPrice(0); setMaxPrice(1000);
    setAmenities([]); setSort("rating");
    router.push("/kortlar");
  }

  const amenityOptions = [
    { key: "parking", label: "🅿️ Park Yeri" },
    { key: "shower", label: "🚿 Duş" },
    { key: "racket", label: "🎾 Raket Kiralama" },
    { key: "lighting", label: "💡 Aydınlatma" },
  ];

  return (
    <aside className="w-full lg:w-64 flex-shrink-0 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display font-700 text-on-surface">Filtrele</h3>
        <button onClick={reset} className="text-xs text-on-surface-variant hover:text-primary transition-colors">
          Temizle
        </button>
      </div>

      {/* City */}
      <div className="card p-4 space-y-3">
        <label className="block text-sm font-600 text-on-surface">Şehir</label>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="input-field text-sm"
        >
          <option value="">Tüm Şehirler</option>
          {cities.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Court Type */}
      <div className="card p-4 space-y-3">
        <label className="block text-sm font-600 text-on-surface">Kort Tipi</label>
        <div className="space-y-2">
          {[
            { val: "", label: "Tümü" },
            { val: "indoor", label: "Kapalı" },
            { val: "outdoor", label: "Açık" },
          ].map((opt) => (
            <label key={opt.val} className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                  courtType === opt.val ? "border-primary bg-primary" : "border-outline-variant"
                }`}
                onClick={() => setCourtType(opt.val)}
              >
                {courtType === opt.val && <div className="w-2 h-2 rounded-full bg-on-primary" />}
              </div>
              <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="card p-4 space-y-3">
        <label className="block text-sm font-600 text-on-surface">Fiyat Aralığı (₺/saat)</label>
        <div className="flex items-center justify-between text-xs text-on-surface-variant mb-2">
          <span>₺{minPrice}</span>
          <span>₺{maxPrice}{maxPrice === 1000 ? "+" : ""}</span>
        </div>
        <input
          type="range" min={0} max={1000} step={50}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-primary"
        />
      </div>

      {/* Amenities */}
      <div className="card p-4 space-y-3">
        <label className="block text-sm font-600 text-on-surface">Olanaklar</label>
        {amenityOptions.map((opt) => (
          <label key={opt.key} className="flex items-center gap-3 cursor-pointer group">
            <div
              className={`w-4 h-4 rounded flex items-center justify-center border-2 transition-all ${
                amenities.includes(opt.key) ? "bg-primary border-primary" : "border-outline-variant"
              }`}
              onClick={() => toggleAmenity(opt.key)}
            >
              {amenities.includes(opt.key) && (
                <svg className="w-3 h-3 text-on-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">{opt.label}</span>
          </label>
        ))}
      </div>

      {/* Sort */}
      <div className="card p-4 space-y-3">
        <label className="block text-sm font-600 text-on-surface">Sırala</label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="input-field text-sm"
        >
          <option value="rating">En Çok Puanlanan</option>
          <option value="price_asc">En Ucuz</option>
          <option value="price_desc">En Pahalı</option>
          <option value="newest">En Yeni</option>
        </select>
      </div>

      <button onClick={apply} className="btn-primary w-full text-center">
        Filtreleri Uygula
      </button>
    </aside>
  );
}
