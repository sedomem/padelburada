"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { formatPrice, courtTypeLabel } from "@/lib/utils";
import toast from "react-hot-toast";

interface Court {
  id: number; name: string; slug: string; status: string;
  isApproved: boolean; courtType: string; minPriceHour: number;
  totalReviews: number; avgRating: number;
  city: { name: string }; district: { name: string };
}

const statusBadge: Record<string, string> = {
  active: "bg-primary/20 text-primary",
  pending: "bg-yellow-500/20 text-yellow-400",
  closed: "bg-red-500/20 text-red-400",
};
const statusLabel: Record<string, string> = {
  active: "Aktif", pending: "Beklemede", closed: "Kapalı",
};

export default function KortlarimPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/business/courts")
      .then((r) => r.json())
      .then((d) => { setCourts(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function deleteCourt(id: number) {
    if (!confirm("Kortu silmek istediğinizden emin misiniz?")) return;
    const res = await fetch(`/api/courts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCourts((prev) => prev.filter((c) => c.id !== id));
      toast.success("Kort silindi");
    } else {
      toast.error("Silinemedi");
    }
  }

  if (loading) return (
    <div>
      <h1 className="font-display font-800 text-2xl text-on-surface mb-6">Kortlarım</h1>
      <div className="space-y-4">{[1,2].map(i => <div key={i} className="h-24 bg-surface-high rounded-2xl animate-pulse" />)}</div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-800 text-2xl text-on-surface">Kortlarım</h1>
        <Link href="/isletme-paneli/kortlarim/yeni" className="btn-primary py-2 px-5 text-sm">
          + Yeni Kort Ekle
        </Link>
      </div>

      {courts.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🎾</div>
          <h3 className="font-display font-700 text-lg text-on-surface mb-2">Henüz kort eklemediniz</h3>
          <p className="text-on-surface-variant mb-6">İlk kortunuzu ekleyerek müşterilere ulaşın.</p>
          <Link href="/isletme-paneli/kortlarim/yeni" className="btn-primary inline-block px-6 py-3">Kort Ekle</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {courts.map((court) => (
            <div key={court.id} className="card flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-display font-700 text-on-surface">{court.name}</h3>
                  <span className={`badge ${statusBadge[court.status] || "bg-surface-high text-on-surface-variant"}`}>
                    {statusLabel[court.status] || court.status}
                  </span>
                  {!court.isApproved && (
                    <span className="badge bg-yellow-500/20 text-yellow-400 text-xs">⏳ Onay Bekliyor</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-on-surface-variant">
                  <span>📍 {court.district.name}, {court.city.name}</span>
                  <span>{courtTypeLabel(court.courtType)}</span>
                  <span>{formatPrice(court.minPriceHour)}/saat'ten</span>
                  <span>★ {court.avgRating.toFixed(1)} ({court.totalReviews} yorum)</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/isletme-paneli/kortlarim/${court.id}`} className="btn-secondary text-sm py-2 px-4">
                  Düzenle
                </Link>
                <Link href={`/kort/${court.slug}`} className="btn-secondary text-sm py-2 px-4">
                  Görüntüle
                </Link>
                <button
                  onClick={() => deleteCourt(court.id)}
                  className="text-sm px-4 py-2 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
