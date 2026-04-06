"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function CourtDetailClient({ courtId }: { courtId: number }) {
  const { data: session } = useSession();
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  async function toggleFavorite() {
    if (!session) { toast.error("Favori eklemek için giriş yapın"); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/courts/${courtId}/favorite`, { method: "POST" });
      const data = await res.json();
      setFavorited(data.favorited);
      toast.success(data.favorited ? "Favorilere eklendi" : "Favorilerden çıkarıldı");
    } catch {
      toast.error("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-600 ${
        favorited
          ? "bg-primary text-on-primary"
          : "bg-surface-high text-on-surface-variant hover:bg-surface-highest"
      }`}
    >
      {favorited ? "♥ Favoride" : "♡ Favoriye Ekle"}
    </button>
  );
}
