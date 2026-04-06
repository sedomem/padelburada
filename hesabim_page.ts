"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function HesabimPage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "" });

  useEffect(() => {
    if (session?.user) {
      setForm({
        fullName: session.user.name || "",
        phone: (session.user as any).phone || "",
      });
    }
  }, [session]);

  async function handleSave() {
    setLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      await update({ name: form.fullName });
      toast.success("Profil güncellendi");
    } catch {
      toast.error("Güncelleme başarısız");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-display font-800 text-2xl text-on-surface mb-6">Profilim</h1>

      <div className="card max-w-lg space-y-5">
        <div>
          <label className="block text-sm font-600 text-on-surface-variant mb-2">Ad Soyad</label>
          <input
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="input-field"
            placeholder="Adınız Soyadınız"
          />
        </div>

        <div>
          <label className="block text-sm font-600 text-on-surface-variant mb-2">Email</label>
          <input
            value={session?.user?.email || ""}
            disabled
            className="input-field opacity-50 cursor-not-allowed"
          />
          <p className="text-xs text-on-surface-variant mt-1">Email adresi değiştirilemez.</p>
        </div>

        <div>
          <label className="block text-sm font-600 text-on-surface-variant mb-2">Telefon</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="input-field"
            placeholder="05xx xxx xx xx"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="btn-primary py-3 px-6 disabled:opacity-60"
        >
          {loading ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>
    </div>
  );
}
