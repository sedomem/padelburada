"use client";
import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reservationSchema } from "@/lib/validations";
import { formatDate, formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import type { z } from "zod";

type FormData = z.infer<typeof reservationSchema>;

interface Court {
  id: number; name: string; slug: string; address: string;
  city: { name: string }; district: { name: string };
  minPriceHour: number; hasRacketRental: boolean;
}

function ReservationContent() {
  const params = useParams();
  const sp = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();

  const courtId = Number(params.courtId);
  const date = params.date as string;
  const slot = sp.get("slot") || "";
  const endHour = slot ? `${String(Number(slot.split(":")[0]) + 1).padStart(2, "0")}:00` : "";

  const [court, setCourt] = useState<Court | null>(null);
  const [slotPrice, setSlotPrice] = useState(0);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      playerCount: "2",
      cardNumber: "",
      cardExpiry: "",
      cardCvv: "",
      cardName: "",
      extraRacket: false,
      extraBalls: false,
      extraTowel: false,
      customerName: session?.user?.name || "",
      customerEmail: session?.user?.email || "",
    },
  });

  const extraRacket = watch("extraRacket");
  const extraBalls = watch("extraBalls");
  const extraTowel = watch("extraTowel");
  const playerCount = watch("playerCount");

  const extraCost = (extraRacket ? 50 : 0) + (extraBalls ? 30 : 0) + (extraTowel ? 20 : 0);
  const totalPrice = slotPrice + extraCost;

  useEffect(() => {
    fetchCourt();
    fetchSlotPrice();
    if (session?.user) {
      setValue("customerName", session.user.name || "");
      setValue("customerEmail", session.user.email || "");
    }
  }, [session]);

  async function fetchCourt() {
    const res = await fetch(`/api/courts/${courtId}`);
    if (res.ok) setCourt(await res.json());
  }

  async function fetchSlotPrice() {
    const res = await fetch(`/api/courts/${courtId}/availability?date=${date}`);
    if (res.ok) {
      const data = await res.json();
      const found = data.slots?.find((s: any) => s.time === slot);
      if (found) setSlotPrice(found.price);
    }
  }

  async function onSubmit(data: FormData) {
    setPaymentLoading(true);
    try {
      // 1. Payment
      const payRes = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardNumber: data.cardNumber, amount: totalPrice }),
      });
      const payData = await payRes.json();

      if (!payData.success) {
        toast.error(payData.message || "Ödeme başarısız");
        setPaymentLoading(false);
        return;
      }

      // 2. Create Reservation
      const resRes = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courtId,
          reservationDate: date,
          startTime: slot,
          endTime: endHour,
          totalPrice,
          playerCount: Number(data.playerCount),
          extraServices: {
            racket: data.extraRacket,
            balls: data.extraBalls,
            towel: data.extraTowel,
          },
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          paymentStatus: "paid",
          paymentId: payData.paymentId,
        }),
      });

      if (!resRes.ok) {
        const err = await resRes.json();
        toast.error(err.error || "Rezervasyon oluşturulamadı");
        return;
      }

      const reservation = await resRes.json();
      setStep(3);
      toast.success("Rezervasyonunuz oluşturuldu!");
    } catch {
      toast.error("Bir hata oluştu");
    } finally {
      setPaymentLoading(false);
    }
  }

  if (!court || !slot) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-on-surface-variant">Yükleniyor...</div>
      </div>
    );
  }

  // Step 3: Success
  if (step === 3) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4 text-center">
          <div className="card p-10">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-on-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-display font-900 text-2xl text-on-surface mb-2">Rezervasyon Onaylandı!</h1>
            <p className="text-on-surface-variant mb-6">
              Onay emaili <strong className="text-on-surface">{watch("customerEmail")}</strong> adresine gönderildi.
            </p>
            <div className="bg-surface-highest rounded-xl p-4 text-left space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Kort</span>
                <span className="text-on-surface font-600">{court.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Tarih</span>
                <span className="text-on-surface font-600">{formatDate(date)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Saat</span>
                <span className="text-on-surface font-600">{slot} — {endHour}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Toplam</span>
                <span className="text-primary font-700">{formatPrice(totalPrice)}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => router.push("/hesabim/rezervasyonlar")} className="flex-1 btn-secondary text-sm py-3">
                Rezervasyonlarım
              </button>
              <button onClick={() => router.push("/kortlar")} className="flex-1 btn-primary text-sm py-3">
                Kortlara Dön
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-6">
          <h1 className="font-display font-900 text-3xl text-on-surface">Rezervasyon</h1>
          <p className="text-on-surface-variant mt-1">{court.name} · {court.district.name}, {court.city.name}</p>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {[
            { n: 1, label: "Bilgiler" },
            { n: 2, label: "Ödeme" },
          ].map(({ n, label }) => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-700 transition-colors ${
                step >= n ? "bg-primary text-on-primary" : "bg-surface-high text-on-surface-variant"
              }`}>{n}</div>
              <span className={`text-sm font-600 ${step >= n ? "text-on-surface" : "text-on-surface-variant"}`}>{label}</span>
              {n < 2 && <div className="w-8 h-px bg-outline-variant/30 mx-1" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Step 1 */}
              {step === 1 && (
                <div className="card space-y-5">
                  <h2 className="font-display font-700 text-lg text-on-surface">Kişisel Bilgiler</h2>

                  <div>
                    <label className="block text-sm font-600 text-on-surface-variant mb-2">Ad Soyad *</label>
                    <input {...register("customerName")} className="input-field" placeholder="Adınız Soyadınız" />
                    {errors.customerName && <p className="text-red-400 text-xs mt-1">{errors.customerName.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-600 text-on-surface-variant mb-2">Email *</label>
                    <input {...register("customerEmail")} type="email" className="input-field" placeholder="email@ornek.com" />
                    {errors.customerEmail && <p className="text-red-400 text-xs mt-1">{errors.customerEmail.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-600 text-on-surface-variant mb-2">Telefon *</label>
                    <input {...register("customerPhone")} className="input-field" placeholder="05xx xxx xx xx" />
                    {errors.customerPhone && <p className="text-red-400 text-xs mt-1">{errors.customerPhone.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-600 text-on-surface-variant mb-2">Oyuncu Sayısı</label>
                    <div className="grid grid-cols-2 gap-3">
                      {["2", "4"].map((n) => (
                        <label key={n} className={`flex items-center justify-center gap-2 p-3 rounded-xl cursor-pointer border-2 transition-all ${
                          playerCount === n ? "border-primary bg-primary/10 text-primary" : "border-outline-variant/20 text-on-surface-variant hover:border-outline-variant/40"
                        }`}>
                          <input {...register("playerCount")} type="radio" value={n} className="sr-only" />
                          <span className="font-700">{n} Kişi</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Extra Services */}
                  <div>
                    <label className="block text-sm font-600 text-on-surface-variant mb-3">Ek Hizmetler</label>
                    <div className="space-y-2">
                      {[
                        { key: "extraRacket", label: "Raket Kiralama", price: 50 },
                        { key: "extraBalls", label: "Top Seti", price: 30 },
                        { key: "extraTowel", label: "Havlu", price: 20 },
                      ].map(({ key, label, price }) => (
                        <label key={key} className="flex items-center justify-between p-3 bg-surface-highest rounded-xl cursor-pointer hover:bg-surface-high transition-colors">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              {...register(key as any)}
                              className="w-4 h-4 accent-primary"
                            />
                            <span className="text-sm text-on-surface">{label}</span>
                          </div>
                          <span className="text-sm text-primary font-600">+{formatPrice(price)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button type="button" onClick={() => setStep(2)} className="btn-primary w-full py-3">
                    Ödemeye Geç →
                  </button>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div className="card space-y-5">
                  <div className="flex items-center gap-3 mb-2">
                    <button type="button" onClick={() => setStep(1)} className="text-on-surface-variant hover:text-on-surface transition-colors">
                      ← Geri
                    </button>
                    <h2 className="font-display font-700 text-lg text-on-surface">Ödeme Bilgileri</h2>
                  </div>

                  <div className="bg-surface-highest rounded-xl p-4 text-sm text-on-surface-variant">
                    💡 Test için <strong className="text-primary">4242 4242 4242 4242</strong> kartını kullanın.
                  </div>

                  <div>
                    <label className="block text-sm font-600 text-on-surface-variant mb-2">Kart Numarası *</label>
                    <input
                      {...register("cardNumber")}
                      className="input-field"
                      placeholder="4242 4242 4242 4242"
                      maxLength={19}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                        setValue("cardNumber", v.replace(/(.{4})/g, "$1 ").trim());
                      }}
                    />
                    {errors.cardNumber && <p className="text-red-400 text-xs mt-1">{errors.cardNumber.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-600 text-on-surface-variant mb-2">Kart Üzerindeki Ad *</label>
                    <input {...register("cardName")} className="input-field" placeholder="AD SOYAD" />
                    {errors.cardName && <p className="text-red-400 text-xs mt-1">{errors.cardName.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-600 text-on-surface-variant mb-2">Son Kul. Tarihi *</label>
                      <input
                        {...register("cardExpiry")}
                        className="input-field"
                        placeholder="AA/YY"
                        maxLength={5}
                        onChange={(e) => {
                          let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                          if (v.length >= 2) v = v.slice(0, 2) + "/" + v.slice(2);
                          setValue("cardExpiry", v);
                        }}
                      />
                      {errors.cardExpiry && <p className="text-red-400 text-xs mt-1">{errors.cardExpiry.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-600 text-on-surface-variant mb-2">CVV *</label>
                      <input {...register("cardCvv")} className="input-field" placeholder="123" maxLength={3} type="password" />
                      {errors.cardCvv && <p className="text-red-400 text-xs mt-1">{errors.cardCvv.message}</p>}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={paymentLoading}
                    className="btn-primary w-full py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {paymentLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        İşleniyor...
                      </span>
                    ) : (
                      `${formatPrice(totalPrice)} Öde & Rezerve Et`
                    )}
                  </button>

                  <p className="text-xs text-on-surface-variant text-center">
                    🔒 Ödeme güvenli simülasyon ortamında işlenir
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-2">
            <div className="card sticky top-24 space-y-4">
              <h3 className="font-display font-700 text-on-surface">Özet</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Kort</span>
                  <span className="text-on-surface font-600 text-right max-w-[140px] truncate">{court.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Tarih</span>
                  <span className="text-on-surface font-600">{formatDate(date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Saat</span>
                  <span className="text-on-surface font-600">{slot} — {endHour}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Oyuncu</span>
                  <span className="text-on-surface font-600">{playerCount} kişi</span>
                </div>
              </div>

              <div className="border-t border-outline-variant/10 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Kort Ücreti</span>
                  <span className="text-on-surface">{formatPrice(slotPrice)}</span>
                </div>
                {extraRacket && (
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Raket</span>
                    <span className="text-on-surface">+₺50</span>
                  </div>
                )}
                {extraBalls && (
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Top Seti</span>
                    <span className="text-on-surface">+₺30</span>
                  </div>
                )}
                {extraTowel && (
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Havlu</span>
                    <span className="text-on-surface">+₺20</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-outline-variant/10 pt-3 mt-2">
                  <span className="font-700 text-on-surface">Toplam</span>
                  <span className="font-800 text-xl text-primary">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <div className="bg-surface-highest rounded-xl p-3 text-xs text-on-surface-variant">
                ℹ️ Rezervasyon saatinden <strong>2 saat öncesine</strong> kadar ücretsiz iptal.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReservasyonPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 flex items-center justify-center text-on-surface-variant">Yükleniyor...</div>}>
      <ReservationContent />
    </Suspense>
  );
}
