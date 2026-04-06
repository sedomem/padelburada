"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatDate, formatPrice, statusLabel, paymentStatusLabel } from "@/lib/utils";

interface Reservation {
  id: number;
  reservationDate: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  playerCount: number;
  status: string;
  paymentStatus: string;
  customerName: string;
  createdAt: string;
  court: { name: string; slug: string; city: { name: string }; district: { name: string } };
}

export default function RezervasyonlarPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<number | null>(null);

  useEffect(() => { fetchReservations(); }, []);

  async function fetchReservations() {
    const res = await fetch("/api/reservations");
    if (res.ok) setReservations(await res.json());
    setLoading(false);
  }

  async function cancelReservation(id: number) {
    if (!confirm("Rezervasyonu iptal etmek istediğinizden emin misiniz?")) return;
    setCancelling(id);
    try {
      const res = await fetch(`/api/reservations/${id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Kullanıcı tarafından iptal edildi" }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success("Rezervasyon iptal edildi");
      fetchReservations();
    } catch {
      toast.error("Bir hata oluştu");
    } finally {
      setCancelling(null);
    }
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    confirmed: "bg-primary/20 text-primary",
    cancelled: "bg-red-500/20 text-red-400",
    completed: "bg-blue-500/20 text-blue-400",
  };

  if (loading) {
    return (
      <div>
        <h1 className="font-display font-800 text-2xl text-on-surface mb-6">Rezervasyonlarım</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-surface-high rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display font-800 text-2xl text-on-surface mb-6">
        Rezervasyonlarım <span className="text-on-surface-variant font-400 text-lg">({reservations.length})</span>
      </h1>

      {reservations.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">📅</div>
          <h3 className="font-display font-700 text-lg text-on-surface mb-2">Henüz rezervasyonunuz yok</h3>
          <p className="text-on-surface-variant mb-6">Bir padel kortu bulup rezervasyon yapın!</p>
          <Link href="/kortlar" className="btn-primary inline-block px-6 py-3">Kortları Keşfet</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((res) => {
            const canCancel = res.status !== "cancelled" && res.status !== "completed";
            const reservationDateTime = new Date(res.reservationDate);
            const [h] = res.startTime.split(":").map(Number);
            reservationDateTime.setHours(h, 0, 0, 0);
            const hoursUntil = (reservationDateTime.getTime() - Date.now()) / (1000 * 60 * 60);
            const withinPolicy = hoursUntil >= 2;

            return (
              <div key={res.id} className="card flex flex-col sm:flex-row gap-4">
                {/* Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <Link
                      href={`/kort/${res.court.slug}`}
                      className="font-display font-700 text-lg text-on-surface hover:text-primary transition-colors"
                    >
                      {res.court.name}
                    </Link>
                    <span className={`badge ${statusColors[res.status] || "bg-surface-high text-on-surface-variant"}`}>
                      {statusLabel(res.status)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-on-surface-variant">
                    <span>📅 {formatDate(res.reservationDate)}</span>
                    <span>🕐 {res.startTime} — {res.endTime}</span>
                    <span>👥 {res.playerCount} kişi</span>
                    <span>📍 {res.court.district.name}, {res.court.city.name}</span>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-700 text-primary text-lg">{formatPrice(res.totalPrice)}</span>
                    <span className={`badge text-xs ${
                      res.paymentStatus === "paid" ? "bg-primary/20 text-primary"
                      : res.paymentStatus === "refunded" ? "bg-blue-500/20 text-blue-400"
                      : "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {paymentStatusLabel(res.paymentStatus)}
                    </span>
                    <span className="text-on-surface-variant text-xs">#{res.id}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col gap-2 justify-end">
                  <Link href={`/kort/${res.court.slug}`} className="btn-secondary text-sm py-2 px-4 text-center">
                    Korta Git
                  </Link>
                  {canCancel && withinPolicy && (
                    <button
                      onClick={() => cancelReservation(res.id)}
                      disabled={cancelling === res.id}
                      className="text-sm px-4 py-2 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    >
                      {cancelling === res.id ? "İptal ediliyor..." : "İptal Et"}
                    </button>
                  )}
                  {canCancel && !withinPolicy && (
                    <span className="text-xs text-on-surface-variant px-3 py-2 text-center">
                      İptal süresi geçti
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
