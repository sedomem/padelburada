"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/validations";
import Link from "next/link";
import toast from "react-hot-toast";
import type { z } from "zod";

type FormData = z.infer<typeof registerSchema>;

function KayitContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const [loading, setLoading] = useState(false);
  const defaultRole = sp.get("role") || "user";

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, role: defaultRole }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Kayıt başarısız");
        return;
      }

      toast.success("Hesap oluşturuldu! Giriş yapılıyor...");

      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.ok) {
        router.push(defaultRole === "business" ? "/isletme-paneli" : "/");
        router.refresh();
      }
    } catch {
      toast.error("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-on-primary font-display font-900 text-2xl">P</span>
          </div>
          <h1 className="font-display font-900 text-3xl text-on-surface">
            {defaultRole === "business" ? "İşletme Hesabı Oluştur" : "Üye Ol"}
          </h1>
          <p className="text-on-surface-variant mt-2">
            {defaultRole === "business"
              ? "Kortunu ekle, yönet, büyüt."
              : "Binlerce padel kortunu keşfet."}
          </p>
        </div>

        {defaultRole === "business" && (
          <div className="bg-primary/10 rounded-xl px-4 py-3 mb-6 text-sm text-primary">
            🏢 İşletme hesabı oluşturuyorsunuz. Kayıt sonrası kortlarınızı ekleyebilirsiniz.
          </div>
        )}

        <div className="card space-y-5">
          <div>
            <label className="block text-sm font-600 text-on-surface-variant mb-2">Ad Soyad *</label>
            <input {...register("fullName")} className="input-field" placeholder="Adınız Soyadınız" />
            {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-600 text-on-surface-variant mb-2">Email *</label>
            <input {...register("email")} type="email" className="input-field" placeholder="email@ornek.com" />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-600 text-on-surface-variant mb-2">Telefon</label>
            <input {...register("phone")} className="input-field" placeholder="05xx xxx xx xx" />
          </div>

          <div>
            <label className="block text-sm font-600 text-on-surface-variant mb-2">Şifre *</label>
            <input {...register("password")} type="password" className="input-field" placeholder="En az 8 karakter" />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="btn-primary w-full py-3 text-base disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Hesap oluşturuluyor...
              </span>
            ) : "Hesap Oluştur"}
          </button>

          <p className="text-xs text-on-surface-variant text-center">
            Kayıt olarak{" "}
            <Link href="/kullanim-sartlari" className="text-primary hover:underline">Kullanım Şartları</Link>
            'nı kabul etmiş olursunuz.
          </p>
        </div>

        <div className="text-center mt-6">
          <p className="text-on-surface-variant text-sm">
            Zaten hesabın var mı?{" "}
            <Link href="/giris" className="text-primary hover:underline font-600">Giriş Yap</Link>
          </p>
          {defaultRole !== "business" && (
            <p className="text-on-surface-variant text-sm mt-2">
              İşletme sahibi misin?{" "}
              <Link href="/kayit?role=business" className="text-primary hover:underline font-600">İşletme Hesabı Oluştur</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function KayitPage() {
  return (
    <Suspense fallback={null}>
      <KayitContent />
    </Suspense>
  );
}
