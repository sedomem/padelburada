"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { formatPrice } from "@/lib/utils";

interface Stats {
  totalCourts: number;
  totalReservations: number;
  totalRevenue: number;
  pendingReservations: number;
  weeklyData: { day: string; reservations: number; revenue: number }[];
  hourlyData: { hour: string; count: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-high px-3 py-2 rounded-xl text-sm">
      <p className="text-on-surface-variant">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-600">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function IsletmePaneliPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/business/stats")
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-surface-high rounded-2xl animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-800 text-2xl text-on-surface">Genel Bakış</h1>
          <p className="text-on-surface-variant text-sm mt-1">Hoş geldiniz, {session?.user?.name}</p>
        </div>
        <Link href="/isletme-paneli/kortlarim/yeni" className="btn-primary py-2 px-5 text-sm">
          + Kort Ekle
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Toplam Kort", value: stats?.totalCourts || 0, icon: "🎾", color: "text-primary" },
          { label: "Toplam Rezervasyon", value: stats?.totalReservations || 0, icon: "📅", color: "text-blue-400" },
          { label: "Bekleyen", value: stats?.pendingReservations || 0, icon: "⏳", color: "text-yellow-400" },
          { label: "Toplam Gelir", value: formatPrice(stats?.totalRevenue || 0), icon: "💰", color: "text-green-400" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="card">
            <div className="text-2xl mb-2">{icon}</div>
            <div className={`font-display font-800 text-2xl ${color}`}>{value}</div>
            <div className="text-on-surface-variant text-sm mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      {stats?.weeklyData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-display font-700 text-on-surface mb-4">Haftalık Rezervasyonlar</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="day" tick={{ fill: "#C4C9AC", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#C4C9AC", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="reservations" name="Rezervasyon" fill="#C3F400" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="font-display font-700 text-on-surface mb-4">En Yoğun Saatler</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="hour" tick={{ fill: "#C4C9AC", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#C4C9AC", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Rezervasyon" fill="#ABD600" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: "/isletme-paneli/kortlarim", label: "Kortlarımı Yönet", desc: "Kort bilgilerini düzenle" },
          { href: "/isletme-paneli/rezervasyonlar", label: "Rezervasyonları Gör", desc: "Gelen rezervasyonları yönet" },
          { href: "/isletme-paneli/takvim", label: "Müsaitlik Ayarla", desc: "Çalışma saatlerini düzenle" },
        ].map(({ href, label, desc }) => (
          <Link key={href} href={href} className="card hover:bg-surface-highest transition-colors group">
            <div className="font-display font-700 text-on-surface group-hover:text-primary transition-colors">{label}</div>
            <div className="text-on-surface-variant text-sm mt-1">{desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
