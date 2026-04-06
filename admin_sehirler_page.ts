"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import slugify from "slugify";

interface City { id: number; name: string; slug: string; districts: { id: number; name: string; slug: string }[] }

export default function SehirlerPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCity, setNewCity] = useState("");
  const [newDistricts, setNewDistricts] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCities(); }, []);

  async function fetchCities() {
    const res = await fetch("/api/cities");
    if (res.ok) setCities(await res.json());
    setLoading(false);
  }

  async function addCity() {
    if (!newCity.trim()) return;
    setSaving(true);
    const slug = slugify(newCity, { lower: true, strict: true, locale: "tr" });
    const res = await fetch("/api/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCity.trim(), slug }),
    });
    if (res.ok) {
      toast.success("Şehir eklendi");
      setNewCity("");
      fetchCities();
    } else {
      toast.error("Eklenemedi");
    }
    setSaving(false);
  }

  async function addDistrict(cityId: number) {
    const name = newDistricts[cityId];
    if (!name?.trim()) return;
    const slug = slugify(name, { lower: true, strict: true, locale: "tr" });
    const res = await fetch(`/api/cities/${cityId}/districts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), slug }),
    });
    if (res.ok) {
      toast.success("İlçe eklendi");
      setNewDistricts((prev) => ({ ...prev, [cityId]: "" }));
      fetchCities();
    } else {
      toast.error("Eklenemedi");
    }
  }

  async function deleteCity(id: number) {
    if (!confirm("Şehri silmek istediğinizden emin misiniz? İlçeler ve bağlı kortlar da etkilenebilir.")) return;
    const res = await fetch(`/api/cities/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Şehir silindi"); fetchCities(); }
    else toast.error("Silinemedi");
  }

  if (loading) return (
    <div className="min-h-screen pt-24 max-w-4xl mx-auto px-4">
      <h1 className="font-display font-800 text-2xl text-on-surface mb-6">Şehirler & İlçeler</h1>
      <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-surface-high rounded-xl animate-pulse" />)}</div>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display font-800 text-2xl text-on-surface mb-6">Şehirler & İlçeler</h1>

        {/* Add City */}
        <div className="card mb-6">
          <h2 className="font-display font-700 text-on-surface mb-4">Yeni Şehir Ekle</h2>
          <div className="flex gap-3">
            <input
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCity()}
              placeholder="Şehir adı (örn: Bursa)"
              className="input-field flex-1"
            />
            <button onClick={addCity} disabled={saving || !newCity.trim()} className="btn-primary py-3 px-6 disabled:opacity-50">
              Ekle
            </button>
          </div>
        </div>

        {/* City List */}
        <div className="space-y-4">
          {cities.map((city) => (
            <div key={city.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display font-700 text-on-surface">{city.name}</h3>
                  <span className="text-on-surface-variant text-xs">{city.slug} · {city.districts.length} ilçe</span>
                </div>
                <button onClick={() => deleteCity(city.id)} className="text-red-400 hover:text-red-300 text-sm transition-colors">
                  Sil
                </button>
              </div>

              {/* Districts */}
              <div className="flex flex-wrap gap-2 mb-3">
                {city.districts.map((d) => (
                  <span key={d.id} className="badge bg-surface-highest text-on-surface-variant">{d.name}</span>
                ))}
              </div>

              {/* Add District */}
              <div className="flex gap-2">
                <input
                  value={newDistricts[city.id] || ""}
                  onChange={(e) => setNewDistricts((prev) => ({ ...prev, [city.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && addDistrict(city.id)}
                  placeholder="İlçe ekle..."
                  className="input-field flex-1 text-sm py-2"
                />
                <button
                  onClick={() => addDistrict(city.id)}
                  disabled={!newDistricts[city.id]?.trim()}
                  className="bg-surface-highest text-on-surface px-4 py-2 rounded-xl text-sm font-600 hover:bg-surface-high transition-colors disabled:opacity-40"
                >
                  + İlçe
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
