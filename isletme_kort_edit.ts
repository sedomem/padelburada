"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { courtSchema } from "@/lib/validations";
import toast from "react-hot-toast";
import type { z } from "zod";

type FormData = z.infer<typeof courtSchema>;

interface City { id: number; name: string; districts: { id: number; name: string }[] }

export default function CourtEditPage() {
  const params = useParams();
  const router = useRouter();
  const isNew = params.id === "yeni";
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState<number>(0);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(courtSchema),
    defaultValues: {
      courtType: "indoor", surface: "grass",
      hasParking: false, hasShower: false, hasRacketRental: false, hasLighting: false,
    },
  });

  const cityId = watch("cityId");

  useEffect(() => {
    fetchCities();
    if (!isNew) fetchCourt();
  }, []);

  async function fetchCities() {
    const res = await fetch("/api/cities");
    if (res.ok) setCities(await res.json());
  }

  async function fetchCourt() {
    const res = await fetch(`/api/courts/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      reset({
        name: data.name, description: data.description || "", address: data.address,
        cityId: data.cityId, districtId: data.districtId,
        lat: data.lat, lng: data.lng, courtType: data.courtType, surface: data.surface,
        hasParking: data.hasParking, hasShower: data.hasShower,
        hasRacketRental: data.hasRacketRental, hasLighting: data.hasLighting,
        minPriceHour: data.minPriceHour, maxPriceHour: data.maxPriceHour,
        phone: data.phone, website: data.website || "", email: data.email || "",
      });
    }
  }

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const url = isNew ? "/api/courts" : `/api/courts/${params.id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) { const e = await res.json(); toast.error(e.error || "Hata"); return; }
      toast.success(isNew ? "Kort eklendi! Admin onayı bekleniyor." : "Kort güncellendi");
      router.push("/isletme-paneli/kortlarim");
    } catch {
      toast.error("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  const districts = cities.find((c) => c.id === Number(cityId))?.districts || [];

  return (
    <div>
      <h1 className="font-display font-800 text-2xl text-on-surface mb-6">
        {isNew ? "Yeni Kort Ekle" : "Kortu Düzenle"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="card space-y-5">
          <h2 className="font-display font-700 text-lg text-on-surface">Temel Bilgiler</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-600 text-on-surface-variant mb-2">Kort Adı *</label>
              <input {...register("name")} className="input-field" placeholder="Kort adı" />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-600 text-on-surface-variant mb-2">Açıklama</label>
              <textarea {...register("description")} className="input-field min-h-[80px] resize-none" placeholder="Kort hakkında kısa açıklama" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-600 text-on-surface-variant mb-2">Adres *</label>
              <input {...register("address")} className="input-field" placeholder="Tam adres" />
              {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-600 text-on-surface-variant mb-2">Şehir *</label>
              <select {...register("cityId", { valueAsNumber: true })} className="input-field">
                <option value={0}>Şehir Seçin</option>
                {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.cityId && <p className="text-red-400 text-xs mt-1">Şehir seçin</p>}
            </div>
            <div>
              <label className="block text-sm font-600 text-on-surface-variant mb-2">İlçe *</label>
              <select {...register("districtId", { valueAsNumber: true })} className="input-field">
                <option value={0}>İlçe Seçin</option>
                {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              {errors.districtId && <p className="text-red-400 text-xs mt-1">İlçe seçin</p>}
            </div>
            <div>
              <label className="block text-sm font-600 text-on-surface-variant mb-2">Enlem (lat) *</label>
              <input {...register("lat", { valueAsNumber: true })} className="input-field" placeholder="41.0082" type="number" step="0.0001" />
              {errors.lat && <p className="text-red-400 text-xs mt-1">Enlem gerekli</p>}
            </div>
            <div>
              <label className="block text-sm font-600 text-on-surface-variant mb-2">Boylam (lng) *</label>
              <input {...register("lng", { valueAsNumber: true })} className="input-field" placeholder="28.9784" type="number" step="0.0001" />
              {errors.lng && <p className="text-red-400 text-xs mt-1">Boylam gerekli</p>}
            </div>
          </div>
        </div>

        {/* Court Details */}
        <div className="card space-y-5">
          <h2 className="font-display font-700 text-lg text-on-surface">Kort Detayları</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-600 text-on-surface-variant mb-2">Kort Tipi</label>
              <select {...register("courtType")} className="input-field">
                <option value="indoor">Kapalı</option>
                <option value="outdoor">Açık</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-600 text-on-surface-variant mb-2">Zemin</label>
              <select {...register("surface")} className="input-field">
                <option value="grass">Çim</option>
                <option value="cement">Beton</option>
                <option value="rubber">Kauçuk</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-600 text-on-surface-variant mb-2">Min. Fiyat (₺/saat) *</label>
              <input {...register("minPriceHour", { valueAsNumber: true })} className="input-field" type="number" placeholder="150" />
              {errors.minPriceHour && <p className="text-red-400 text-xs mt-1">Fiyat gerekli</p>}
            </div>
            <div>
              <label className="block text-sm font-600 text-on-surface-variant mb-2">Max. Fiyat (₺/saat) *</label>
              <input {...register("maxPriceHour", { valueAsNumber: true })} className="input-field" type="number" placeholder="300" />
              {errors.maxPriceHour && <p className="text-red-400 text-xs mt-1">Fiyat gerekli</p>}
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-600 text-on-surface-variant mb-3">Olanaklar</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: "hasParking", label: "🅿️ Park Yeri" },
                { key: "hasShower", label: "🚿 Duş" },
                { key: "hasRacketRental", label: "🎾 Raket" },
                { key: "hasLighting", label: "💡 Aydınlatma" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 p-3 bg-surface-highest rounded-xl cursor-pointer">
                  <input type="checkbox" {...register(key as any)} className="accent-primary" />
                  <span className="text-sm text-on-surface">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="card space-y-4">
          <h2 className="font-display font-700 text-lg text-on-surface">İletişim</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-600 text-on-surface-variant mb-2">Telefon *</label>
              <input {...register("phone")} className="input-field" placeholder="02xx xxx xx xx" />
              {errors.phone && <p className="text-red-400 text-xs mt-1">Telefon gerekli</p>}
            </div>
            <div>
              <label className="block text-sm font-600 text-on-surface-variant mb-2">Email</label>
              <input {...register("email")} type="email" className="input-field" placeholder="info@kort.com" />
            </div>
            <div>
              <label className="block text-sm font-600 text-on-surface-variant mb-2">Web Sitesi</label>
              <input {...register("website")} className="input-field" placeholder="https://..." />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary py-3 px-8 disabled:opacity-60">
            {loading ? "Kaydediliyor..." : (isNew ? "Kort Ekle" : "Kaydet")}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary py-3 px-6">
            İptal
          </button>
        </div>
      </form>
    </div>
  );
}
