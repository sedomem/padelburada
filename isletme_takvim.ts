"use client";
import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { tr } from "date-fns/locale";
import toast from "react-hot-toast";

interface Court { id: number; name: string }
interface Schedule { id: number; dayOfWeek: number; startTime: string; endTime: string; priceHour: number; isActive: boolean }

const DAY_NAMES = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

export default function TakvimPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<number | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Exception state
  const [exceptionDate, setExceptionDate] = useState("");
  const [exceptionClosed, setExceptionClosed] = useState(true);
  const [exceptionPrice, setExceptionPrice] = useState("");
  const [exceptionNote, setExceptionNote] = useState("");
  const [savingException, setSavingException] = useState(false);

  useEffect(() => {
    fetch("/api/business/courts")
      .then(r => r.json())
      .then(d => {
        setCourts(d);
        if (d.length > 0) setSelectedCourt(d[0].id);
      });
  }, []);

  useEffect(() => {
    if (selectedCourt) fetchSchedules();
  }, [selectedCourt]);

  async function fetchSchedules() {
    setLoading(true);
    const res = await fetch(`/api/business/courts/${selectedCourt}/schedules`);
    if (res.ok) setSchedules(await res.json());
    setLoading(false);
  }

  async function saveSchedules() {
    setSaving(true);
    const res = await fetch(`/api/business/courts/${selectedCourt}/schedules`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schedules }),
    });
    if (res.ok) toast.success("Takvim güncellendi");
    else toast.error("Güncelleme başarısız");
    setSaving(false);
  }

  async function saveException() {
    if (!exceptionDate) { toast.error("Tarih seçin"); return; }
    setSavingException(true);
    const res = await fetch(`/api/business/courts/${selectedCourt}/exceptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exceptionDate: exceptionDate,
        isClosed: exceptionClosed,
        priceHourOverride: exceptionPrice ? Number(exceptionPrice) : null,
        note: exceptionNote,
      }),
    });
    if (res.ok) {
      toast.success("Özel gün kaydedildi");
      setExceptionDate(""); setExceptionNote(""); setExceptionPrice("");
    } else {
      toast.error("Kaydedilemedi");
    }
    setSavingException(false);
  }

  function updateSchedule(dayOfWeek: number, field: keyof Schedule, value: any) {
    setSchedules(prev => {
      const existing = prev.find(s => s.dayOfWeek === dayOfWeek);
      if (existing) {
        return prev.map(s => s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s);
      } else {
        return [...prev, { id: 0, dayOfWeek, startTime: "09:00", endTime: "23:00", priceHour: 200, isActive: true, [field]: value }];
      }
    });
  }

  function getSchedule(day: number): Schedule {
    return schedules.find(s => s.dayOfWeek === day) || { id: 0, dayOfWeek: day, startTime: "09:00", endTime: "23:00", priceHour: 200, isActive: false };
  }

  if (!courts.length) return (
    <div className="text-center py-16">
      <h1 className="font-display font-800 text-2xl text-on-surface mb-4">Müsaitlik Yönetimi</h1>
      <p className="text-on-surface-variant">Önce bir kort eklemeniz gerekiyor.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="font-display font-800 text-2xl text-on-surface">Müsaitlik Yönetimi</h1>

      {/* Court Selector */}
      <div className="card">
        <label className="block text-sm font-600 text-on-surface-variant mb-2">Kort Seç</label>
        <select
          value={selectedCourt || ""}
          onChange={(e) => setSelectedCourt(Number(e.target.value))}
          className="input-field"
        >
          {courts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Weekly Schedule */}
      <div className="card">
        <h2 className="font-display font-700 text-lg text-on-surface mb-5">Haftalık Şablon</h2>
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-surface-highest rounded-xl animate-pulse" />)}</div>
        ) : (
          <div className="space-y-3">
            {DAY_NAMES.map((dayName, idx) => {
              const s = getSchedule(idx);
              return (
                <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${s.isActive ? "bg-surface-highest" : "bg-surface-lowest opacity-60"}`}>
                  {/* Toggle */}
                  <button
                    onClick={() => updateSchedule(idx, "isActive", !s.isActive)}
                    className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 ${s.isActive ? "bg-primary" : "bg-surface-high"}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full mx-0.5 transition-transform ${s.isActive ? "translate-x-5" : "translate-x-0"}`} />
                  </button>

                  {/* Day Name */}
                  <span className={`w-24 text-sm font-600 flex-shrink-0 ${s.isActive ? "text-on-surface" : "text-on-surface-variant"}`}>
                    {dayName}
                  </span>

                  {/* Times */}
                  <input
                    type="time"
                    value={s.startTime}
                    onChange={(e) => updateSchedule(idx, "startTime", e.target.value)}
                    disabled={!s.isActive}
                    className="bg-surface-high text-on-surface px-2 py-1 rounded-lg text-sm outline-none w-24 disabled:opacity-40"
                  />
                  <span className="text-on-surface-variant text-sm">—</span>
                  <input
                    type="time"
                    value={s.endTime}
                    onChange={(e) => updateSchedule(idx, "endTime", e.target.value)}
                    disabled={!s.isActive}
                    className="bg-surface-high text-on-surface px-2 py-1 rounded-lg text-sm outline-none w-24 disabled:opacity-40"
                  />

                  {/* Price */}
                  <div className="flex items-center gap-1 ml-auto">
                    <span className="text-on-surface-variant text-xs">₺</span>
                    <input
                      type="number"
                      value={s.priceHour}
                      onChange={(e) => updateSchedule(idx, "priceHour", Number(e.target.value))}
                      disabled={!s.isActive}
                      className="bg-surface-high text-on-surface px-2 py-1 rounded-lg text-sm outline-none w-20 disabled:opacity-40"
                      placeholder="200"
                    />
                    <span className="text-on-surface-variant text-xs">/saat</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button onClick={saveSchedules} disabled={saving} className="btn-primary mt-5 py-3 px-6 disabled:opacity-60">
          {saving ? "Kaydediliyor..." : "Takvimi Kaydet"}
        </button>
      </div>

      {/* Exception */}
      <div className="card">
        <h2 className="font-display font-700 text-lg text-on-surface mb-5">Özel Gün Ekle</h2>
        <p className="text-on-surface-variant text-sm mb-4">Belirli bir günü kapatın veya farklı fiyat belirleyin.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-600 text-on-surface-variant mb-2">Tarih</label>
            <input
              type="date"
              value={exceptionDate}
              min={format(addDays(new Date(), 1), "yyyy-MM-dd")}
              onChange={(e) => setExceptionDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-600 text-on-surface-variant mb-2">İşlem</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={exceptionClosed} onChange={() => setExceptionClosed(true)} className="accent-primary" />
                <span className="text-sm text-on-surface">Kapat</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={!exceptionClosed} onChange={() => setExceptionClosed(false)} className="accent-primary" />
                <span className="text-sm text-on-surface">Özel Fiyat</span>
              </label>
            </div>
          </div>

          {!exceptionClosed && (
            <div>
              <label className="block text-sm font-600 text-on-surface-variant mb-2">Özel Fiyat (₺/saat)</label>
              <input
                type="number"
                value={exceptionPrice}
                onChange={(e) => setExceptionPrice(e.target.value)}
                className="input-field"
                placeholder="250"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-600 text-on-surface-variant mb-2">Not (isteğe bağlı)</label>
            <input
              value={exceptionNote}
              onChange={(e) => setExceptionNote(e.target.value)}
              className="input-field"
              placeholder="Tatil, bakım vb."
            />
          </div>
        </div>

        <button onClick={saveException} disabled={savingException || !exceptionDate} className="btn-primary py-3 px-6 disabled:opacity-60">
          {savingException ? "Kaydediliyor..." : "Özel Günü Kaydet"}
        </button>
      </div>
    </div>
  );
}
