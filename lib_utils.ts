import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "d MMMM yyyy", { locale: tr });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "d MMMM yyyy HH:mm", { locale: tr });
}

export function generateTimeSlots(startTime: string, endTime: string): string[] {
  const slots: string[] = [];
  const [startH] = startTime.split(":").map(Number);
  const [endH] = endTime.split(":").map(Number);
  for (let h = startH; h < endH; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
  }
  return slots;
}

export function getNext7Days(): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }
  return days;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function courtTypeLabel(type: string): string {
  return type === "indoor" ? "Kapalı" : "Açık";
}

export function surfaceLabel(surface: string): string {
  const map: Record<string, string> = {
    grass: "Çim",
    cement: "Beton",
    rubber: "Kauçuk",
  };
  return map[surface] || surface;
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: "Beklemede",
    confirmed: "Onaylandı",
    cancelled: "İptal Edildi",
    completed: "Tamamlandı",
  };
  return map[status] || status;
}

export function paymentStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: "Ödeme Bekliyor",
    paid: "Ödendi",
    failed: "Başarısız",
    refunded: "İade Edildi",
  };
  return map[status] || status;
}
