"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CourtCard from "@/components/CourtCard";
import FilterSidebar from "@/components/FilterSidebar";
import dynamic from "next/dynamic";

const MapInner = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-surface-low rounded-2xl flex items-center justify-center">
      <span className="text-on-surface-variant">Harita yükleniyor...</span>
    </div>
  ),
});

interface Court {
  id: number; name: string; slug: string; courtType: string; surface: string;
  minPriceHour: number; maxPriceHour: number; avgRating: number; totalReviews: number;
  coverImageUrl: string | null; hasParking: boolean; hasShower: boolean;
  hasRacketRental: boolean; hasLighting: boolean; lat: number; lng: number;
  city: { name: string; slug: string }; district: { name: string };
}

interface City { id: number; name: string; slug: string; }

function KortlarContent() {
  const sp = useSearchParams();
  const [courts, setCourts] = useState<Court[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list" | "map">(
    (sp.get("view") as any) || "grid"
  );

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    setPage(1);
    fetchCourts(1);
  }, [sp.toString()]);

  async function fetchCities() {
    const res = await fetch("/api/cities");
    if (res.ok) setCities(await res.json());
  }

  async function fetchCourts(p = page) {
    setLoading(true);
    try {
      const params = new URLSearchParams(sp.toString());
      params.set("page", String(p));
      const res = await fetch(`/api/courts?${params.toString()}`);
      const data = await res.json();
      setCourts(data.courts || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } finally {
      setLoading(false);
    }
  }

  function handlePage(p: number) {
    setPage(p);
    fetchCourts(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const mapCourts = courts.map((c) => ({
    id: c.id, name: c.name, slug: c.slug, lat: c.lat, lng: c.lng,
    minPriceHour: c.minPriceHour, avgRating: c.avgRating,
    courtType: c.courtType, cityName: c.city.name,
  }));

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Header */}
      <div className="bg-surface-low border-b border-outline-variant/10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-display font-800 text-2xl text-on-surface">Kortlar</h1>
              <p className="text-on-surface-variant text-sm mt-1">
                {loading ? "Aranıyor..." : `${total} kort bulundu`}
              </p>
            </div>
            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-surface-high p-1 rounded-xl">
              {([
                { key: "grid", icon: "⊞" },
                { key: "list", icon: "☰" },
                { key: "map", icon: "🗺" },
              ] as const).map((v) => (
                <button
                  key={v.key}
                  onClick={() => setView(v.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-600 transition-all ${
                    view === v.key
                      ? "bg-primary text-on-primary"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {v.icon} {v.key === "grid" ? "Grid" : v.key === "list" ? "Liste" : "Harita"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          {view !== "map" && (
            <div className="hidden lg:block">
              <FilterSidebar cities={cities} />
            </div>
          )}

          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Mobile Filter */}
            {view !== "map" && (
              <div className="lg:hidden mb-4">
                <FilterSidebar cities={cities} />
              </div>
            )}

            {/* Map View */}
            {view === "map" && (
              <div className="h-[600px] rounded-2xl overflow-hidden">
                <MapInner courts={mapCourts} center={[39.1, 34.8]} zoom={6} height="100%" />
              </div>
            )}

            {/* Grid / List View */}
            {view !== "map" && (
              <>
                {loading ? (
                  <div className={`grid gap-6 ${view === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-72 bg-surface-high rounded-2xl animate-pulse" />
                    ))}
                  </div>
                ) : courts.length === 0 ? (
                  <div className="text-center py-24">
                    <div className="text-6xl mb-4">🎾</div>
                    <h3 className="font-display font-700 text-xl text-on-surface mb-2">Kort bulunamadı</h3>
                    <p className="text-on-surface-variant">Filtrelerinizi değiştirmeyi deneyin.</p>
                  </div>
                ) : (
                  <>
                    <div className={`grid gap-6 ${view === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                      {courts.map((court) => (
                        <CourtCard key={court.id} court={court} />
                      ))}
                    </div>

                    {/* Pagination */}
                    {pages > 1 && (
                      <div className="flex justify-center gap-2 mt-10">
                        <button
                          onClick={() => handlePage(page - 1)}
                          disabled={page === 1}
                          className="px-4 py-2 rounded-xl bg-surface-high text-on-surface disabled:opacity-30 hover:bg-surface-highest transition-colors"
                        >
                          ← Önceki
                        </button>
                        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                          <button
                            key={p}
                            onClick={() => handlePage(p)}
                            className={`w-10 h-10 rounded-xl font-600 text-sm transition-colors ${
                              p === page ? "bg-primary text-on-primary" : "bg-surface-high text-on-surface hover:bg-surface-highest"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                        <button
                          onClick={() => handlePage(page + 1)}
                          disabled={page === pages}
                          className="px-4 py-2 rounded-xl bg-surface-high text-on-surface disabled:opacity-30 hover:bg-surface-highest transition-colors"
                        >
                          Sonraki →
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KortlarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-20 flex items-center justify-center"><span className="text-on-surface-variant">Yükleniyor...</span></div>}>
      <KortlarContent />
    </Suspense>
  );
}
