"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, addDays } from "date-fns";
import { tr } from "date-fns/locale";

interface Slot {
  time: string;
  available: boolean;
  price: number;
}

interface ReservationCalendarProps {
  courtId: number;
  courtSlug: string;
}

export default function ReservationCalendar({ courtId, courtSlug }: ReservationCalendarProps) {
  const router = useRouter();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));
  const [selectedDay, setSelectedDay] = useState(days[0]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSlots();
    setSelectedSlot(null);
  }, [selectedDay]);

  async function fetchSlots() {
    setLoading(true);
    try {
      const dateStr = format(selectedDay, "yyyy-MM-dd");
      const res = await fetch(`/api/courts/${courtId}/availability?date=${dateStr}`);
      const data = await res.json();
      setSlots(data.slots || []);
    } catch {
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }

  function handleBook() {
    if (!selectedSlot) return;
    const dateStr = format(selectedDay, "yyyy-MM-dd");
    router.push(`/rezervasyon/${courtId}/${dateStr}?slot=${selectedSlot}`);
  }

  return (
    <div className="space-y-5">
      {/* Day Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {days.map((day) => {
          const isSelected = format(day, "yyyy-MM-dd") === format(selectedDay, "yyyy-MM-dd");
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDay(day)}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-16 rounded-xl transition-all duration-200 ${
                isSelected
                  ? "bg-primary text-on-primary"
                  : "bg-surface-high text-on-surface-variant hover:bg-surface-highest"
              }`}
            >
              <span className="text-xs font-600 uppercase">
                {format(day, "EEE", { locale: tr })}
              </span>
              <span className="text-lg font-800 leading-none mt-1">
                {format(day, "d")}
              </span>
            </button>
          );
        })}
      </div>

      {/* Slots */}
      <div>
        <div className="text-sm text-on-surface-variant mb-3">
          {format(selectedDay, "d MMMM yyyy, EEEE", { locale: tr })} tarihinde müsait saatler:
        </div>

        {loading ? (
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-12 bg-surface-highest rounded-xl animate-pulse" />
            ))}
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-8 text-on-surface-variant">
            Bu gün için uygun saat yok.
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {slots.map((slot) => {
              const isSelected = selectedSlot === slot.time;
              return (
                <button
                  key={slot.time}
                  disabled={!slot.available}
                  onClick={() => setSelectedSlot(isSelected ? null : slot.time)}
                  className={`flex flex-col items-center justify-center h-14 rounded-xl text-xs font-600 transition-all duration-200 ${
                    !slot.available
                      ? "bg-surface-lowest text-on-surface-variant/40 cursor-not-allowed line-through"
                      : isSelected
                      ? "bg-primary text-on-primary scale-105"
                      : "bg-surface-high text-on-surface hover:bg-surface-highest hover:scale-105"
                  }`}
                >
                  <span>{slot.time}</span>
                  {slot.available && (
                    <span className={`text-[10px] mt-0.5 ${isSelected ? "text-on-primary/80" : "text-on-surface-variant"}`}>
                      ₺{slot.price}
                    </span>
                  )}
                  {!slot.available && <span className="text-[10px] mt-0.5">Dolu</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Book Button */}
      {selectedSlot && (
        <div className="bg-surface-high rounded-xl p-4 flex items-center justify-between animate-slide-up">
          <div>
            <div className="text-sm text-on-surface-variant">Seçilen Saat</div>
            <div className="font-display font-700 text-on-surface">
              {format(selectedDay, "d MMM", { locale: tr })} · {selectedSlot} - {String(Number(selectedSlot.split(":")[0]) + 1).padStart(2, "0")}:00
            </div>
          </div>
          <button onClick={handleBook} className="btn-primary py-3 px-6">
            Rezerve Et →
          </button>
        </div>
      )}
    </div>
  );
}
