"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDate, formatPrice, courtTypeLabel } from "@/lib/utils";
import toast from "react-hot-toast";

interface PendingCourt {
  id: number; name: string; courtType: string; isApproved: boolean; status: string;
  createdAt: string; minPriceHour: number;
  city: { name: string }; district: { name: string };
  owner: { fullName: string; email: string };
}
interface Stats {
  totalCourts: number; totalUsers: number; totalReservations: number; pendingCourts: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [pending, setPending] = useState<PendingCourt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats").then(r => r.json()),
      fetch("/api/admin/courts/pending").then(r => r.json()),
    ]).then(([s, p]) => {
      setStats(s); setPending(p); setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function approveCourt(id: number, approve: boolean) {
    const res = await fetch(`/api/admin/courts/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approve }),
    });
    if (res.ok) {
      toast.success(approve ? "Kort onaylandı ve yayına alındı" : "Kort reddedildi");
      setPending((prev) => prev.filter((c) => c.id !== id));
    } else {
      toast.error("İşlem başarısız");
    }
  }

  if (loading) return (
    <div className="min-h-screen pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-surface-high rounded-2xl animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-900 text-3xl text-on-surface">Admin Paneli</h1>
            <p className="text-on-surface-variant mt-1">Platform yönetim merkezi</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/kullanicilar" className="btn-secondary text-sm py-2 px-4">Kullanıcılar</Link>
            <Link href="/admin/sehirler" className="btn-secondary text-sm py-2 px-4">Şehirler</Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Toplam Kort", value: stats?.totalCourts || 0, icon: "🎾", color: "text-primary" },
            { label: "Toplam Kullanıcı", value: stats?.totalUsers || 0, icon: "👥", color: "text-blue-400" },
            { label: "Toplam Rezervasyon", value: stats?.totalReservations || 0, icon: "📅", color: "text-green-400" },
            { label: "Onay Bekleyen", value: stats?.pendingCourts || 0, icon: "⏳", color: "text-yellow-400" },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="card">
              <div className="text-2xl mb-2">{icon}</div>
              <div className={`font-display font-800 text-3xl ${color}`}>{value}</div>
              <div className="text-on-surface-variant text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Pending Courts */}
        <div>
          <h2 className="font-display font-700 text-xl text-on-surface mb-4">
            Onay Bekleyen Kortlar
            {pending.length > 0 && (
              <span className="ml-2 badge bg-yellow-500/20 text-yellow-400">{pending.length}</span>
            )}
          </h2>

          {pending.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-on-surface-variant">Onay bekleyen kort yok.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map((court) => (
                <div key={court.id} className="card flex flex-col sm:flex-row gap-4 items-start">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-display font-700 text-on-surface">{court.name}</h3>
                      <span className="badge bg-yellow-500/20 text-yellow-400 text-xs">Onay Bekliyor</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-on-surface-variant">
                      <span>📍 {court.district.name}, {court.city.name}</span>
                      <span>{courtTypeLabel(court.courtType)}</span>
                      <span>{formatPrice(court.minPriceHour)}/saat'ten</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-on-surface-variant">
                      <span>👤 {court.owner.fullName}</span>
                      <span>✉️ {court.owner.email}</span>
                      <span>📅 {formatDate(court.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Link href={`/kort/${court.id}`} className="btn-secondary text-sm py-2 px-3">
                      İncele
                    </Link>
                    <button
                      onClick={() => approveCourt(court.id, true)}
                      className="px-4 py-2 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-sm font-600"
                    >
                      ✓ Onayla
                    </button>
                    <button
                      onClick={() => approveCourt(court.id, false)}
                      className="px-4 py-2 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-600"
                    >
                      ✕ Reddet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
