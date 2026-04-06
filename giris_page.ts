"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validations";
import Link from "next/link";
import toast from "react-hot-toast";
import type { z } from "zod";

type FormData = z.infer<typeof loginSchema>;

function GirisContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const [loading, setLoading] = useState(false);
  const error = sp.get("error");

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.ok) {
      toast.success("Giriş başarılı!");
      const callbackUrl = sp.get("callbackUrl") || "/";
      router.push(callbackUrl);
      router.refresh();
    } else {
      toast.error("Email veya şifre hatalı");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-on-primary font-display font-900 text-2xl">P</span>
          </div>
          <h1 className="font-display font-900 text-3xl text-on-surface">Giriş Yap</h1>
          <p className="text-on-surface-variant mt-2">Hesabına giriş yaparak devam et</p>
        </div>

        {(error === "yetkisiz") && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6 text-red-400 text-sm">
            Bu sayfaya erişim yetkiniz yok.
          </div>
        )}

        <div className="card space-y-5">
          <div>
            <label className="block text-sm font-600 text-on-surface-variant mb-2">Email</label>
            <input
              {...register("email")}
              type="email"
              className="input-field"
              placeholder="email@ornek.com"
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-600 text-on-surface-variant mb-2">Şifre</label>
            <input
              {...register("password")}
              type="password"
              className="input-field"
              placeholder="••••••••"
            />
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
                Giriş yapılıyor...
              </span>
            ) : "Giriş Yap"}
          </button>
        </div>

        <div className="text-center mt-6">
          <p className="text-on-surface-variant text-sm">
            Hesabın yok mu?{" "}
            <Link href="/kayit" className="text-primary hover:underline font-600">
              Üye Ol
            </Link>
          </p>
        </div>

        {/* Demo accounts */}
        <div className="mt-6 card p-4 space-y-2">
          <p className="text-xs font-600 text-on-surface-variant mb-3">🧪 Test Hesapları</p>
          {[
            { label: "Admin", email: "admin@admin.com", pass: "Admin123!" },
            { label: "İşletmeci", email: "isletmeci@padelburada.com", pass: "Owner123!" },
            { label: "Kullanıcı", email: "kullanici@padelburada.com", pass: "User123!" },
          ].map(({ label, email, pass }) => (
            <button
              key={label}
              type="button"
              onClick={async () => {
                setLoading(true);
                const result = await signIn("credentials", { email, password: pass, redirect: false });
                if (result?.ok) { toast.success(`${label} olarak giriş yapıldı`); router.push("/"); router.refresh(); }
                setLoading(false);
              }}
              className="w-full text-left px-3 py-2 bg-surface-highest rounded-lg hover:bg-surface-high transition-colors text-sm"
            >
              <span className="font-600 text-on-surface">{label}</span>
              <span className="text-on-surface-variant ml-2">{email}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function GirisPage() {
  return (
    <Suspense fallback={null}>
      <GirisContent />
    </Suspense>
  );
}
