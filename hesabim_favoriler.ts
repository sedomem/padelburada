// app/hesabim/favoriler/page.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import CourtCard from "@/components/CourtCard";
import toast from "react-hot-toast";

export default function FavorilerPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/favorites")
      .then((r) => r.json())
      .then((d) => { setFavorites(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function removeFavorite(courtId: number) {
    await fetch(`/api/courts/${courtId}/favorite`, { method: "POST" });
    setFavorites((prev) => prev.filter((f) => f.court.id !== courtId));
    toast.success("Favorilerden çıkarıldı");
  }

  if (loading) return (
    <div>
      <h1 className="font-display font-800 text-2xl text-on-surface mb-6">Favorilerim</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[1,2].map(i => <div key={i} className="h-72 bg-surface-high rounded-2xl animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="font-display font-800 text-2xl text-on-surface mb-6">
        Favorilerim <span className="text-on-surface-variant font-400 text-lg">({favorites.length})</span>
      </h1>
      {favorites.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">♡</div>
          <h3 className="font-display font-700 text-lg text-on-surface mb-2">Favori kortunuz yok</h3>
          <p className="text-on-surface-variant mb-6">Beğendiğiniz kortları favorilerinize ekleyin.</p>
          <Link href="/kortlar" className="btn-primary inline-block px-6 py-3">Kortları Keşfet</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {favorites.map((fav) => (
            <div key={fav.court.id} className="relative">
              <CourtCard court={fav.court} />
              <button
                onClick={() => removeFavorite(fav.court.id)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500/80 text-white flex items-center justify-center hover:bg-red-500 transition-colors text-sm z-10"
                title="Favoriden çıkar"
              >✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
