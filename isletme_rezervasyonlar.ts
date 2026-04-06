"use client";
import { useState, useEffect } from "react";
import { formatDate, formatPrice, statusLabel } from "@/lib/utils";
import toast from "react-hot-toast";

interface Reservation {
  id: number; customerName: string; customerEmail: string; customerPhone: string;
  reservationDate: string; startTime: string; endTime: string;
  totalPrice: number; playerCount: number; status: string; paymentStatus: string;
  court: { name: string };
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  confirmed: "bg-primary/20 text-primary",
  cancelled: "bg-red-500/20 text-red-400",
  completed: "bg-blue-500/20 text-blue-400",
};

export default function IsletmeRezervasyonlarPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => { fetchReservations(); }, []);

  async function fetchReservations() {
    const res = await fetch("/api/business/reservations");
    if (res.ok) setReservations(await res.json());
    setLoading(false);
  }

  async function updateStatus(id: number, status: "confirmed" | "cancelled") {
    const res = await fetch(`/api/business/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success(status === "confirmed" ? "Onaylandı" : "İptal edildi");
      fetchReservations();
    } else {
      toast.error("İşlem başarısız");
    }
  }

  const filtered = filter === "all" ? reservations : reservations.filter((r) => r.status === filter);

  if (loading) return (
    <div>
      <h1 className="font-display font-800 text-2xl text-on-surface mb-6">Rezervasyonlar</h1>
      <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-28 bg-surface-high rounded-2xl animate-pulse" />)}</div>
    </div>
  );

  return (
    <div>
      <h1 className="font-display font-800 text-2xl text-on-surface mb-6">Rezervasyonlar</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: "all", label: "Tümü" },
          { key: "pending", label: "Bekleyen" },
          { key: "confirmed", label: "Onaylı" },
          { key: "cancelled", label: "İptal" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-full text-sm font-600 transition-all ${
              filter === key ? "bg-primary text-on-primary" : "bg-surface-high text-on-surface-variant hover:bg-surface-highest"
            }`}
          >
            {label}
            {key !== "all" && (
              <span className="ml-1.5 opacity-60">
                ({reservations.filter(r => r.status === key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">📅</div>
          <h3 className="font-display font-700 text-lg text-on-surface">Rezervasyon yok</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((res) => (
            <div key={res.id} className="card">
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-display font-700 text-on-surface">{res.court.name}</span>
                    <span className={`badge ${statusColors[res.status] || "bg-surface-high text-on-surface-variant"}`}>
                      {statusLabel(res.status)}
                    </span>
                    <span className="text-on-surface-variant text-xs">#{res.id}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-on-surface-variant">
                    <span>👤 {res.customerName}</span>
                    <span>📧 {res.customerEmail}</span>
                    <span>📞 {res.customerPhone}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-on-surface-variant">
                    <span>📅 {formatDate(res.reservationDate)}</span>
                    <span>🕐 {res.startTime} — {res.endTime}</span>
                    <span>👥 {res.playerCount} kişi</span>
                    <span className="text-primary font-600">{formatPrice(res.totalPrice)}</span>
                  </div>
                </div>
                {res.status === "pending" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => updateStatus(res.id, "confirmed")}
                      className="px-4 py-2 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-sm font-600"
                    >
                      ✓ Onayla
                    </button>
                    <button
                      onClick={() => updateStatus(res.id, "cancelled")}
                      className="px-4 py-2 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-600"
                    >
                      ✕ İptal
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
