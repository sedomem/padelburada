"use client";
import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const role = (session?.user as any)?.role;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-outline-variant/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-gradient rounded-lg flex items-center justify-center">
              <span className="text-on-primary font-display font-900 text-sm">P</span>
            </div>
            <span className="font-display font-800 text-xl text-on-surface">
              Padel<span className="text-primary">Burada</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/kortlar" className={`text-sm font-600 transition-colors ${pathname === "/kortlar" ? "text-primary" : "text-on-surface-variant hover:text-on-surface"}`}>
              Kortlar
            </Link>
            <Link href="/blog" className={`text-sm font-600 transition-colors ${pathname.startsWith("/blog") ? "text-primary" : "text-on-surface-variant hover:text-on-surface"}`}>
              Blog
            </Link>
            {role === "business_owner" || role === "admin" ? (
              <Link href="/isletme-paneli" className={`text-sm font-600 transition-colors ${pathname.startsWith("/isletme-paneli") ? "text-primary" : "text-on-surface-variant hover:text-on-surface"}`}>
                İşletme Paneli
              </Link>
            ) : null}
            {role === "admin" && (
              <Link href="/admin" className={`text-sm font-600 transition-colors ${pathname.startsWith("/admin") ? "text-primary" : "text-on-surface-variant hover:text-on-surface"}`}>
                Admin
              </Link>
            )}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-surface-high px-4 py-2 rounded-full hover:bg-surface-highest transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-on-primary text-xs font-700">
                      {session.user?.name?.[0]?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <span className="text-sm font-600 text-on-surface max-w-[100px] truncate">
                    {session.user?.name}
                  </span>
                  <svg className="w-4 h-4 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-12 w-48 bg-surface-high rounded-xl py-2 shadow-2xl shadow-black/50 z-50">
                    <Link href="/hesabim" className="block px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-highest transition-colors" onClick={() => setUserMenuOpen(false)}>
                      Hesabım
                    </Link>
                    <Link href="/hesabim/rezervasyonlar" className="block px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-highest transition-colors" onClick={() => setUserMenuOpen(false)}>
                      Rezervasyonlarım
                    </Link>
                    <Link href="/hesabim/favoriler" className="block px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-highest transition-colors" onClick={() => setUserMenuOpen(false)}>
                      Favorilerim
                    </Link>
                    <hr className="my-1 border-outline-variant/20" />
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-surface-highest transition-colors"
                    >
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/giris" className="text-sm font-600 text-on-surface-variant hover:text-on-surface transition-colors px-4 py-2">
                  Giriş Yap
                </Link>
                <Link href="/kayit" className="btn-primary text-sm py-2 px-5">
                  Üye Ol
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-on-surface-variant hover:text-on-surface"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-surface-low border-t border-outline-variant/10 px-4 py-4 space-y-3">
          <Link href="/kortlar" className="block text-sm font-600 text-on-surface-variant hover:text-primary py-2" onClick={() => setMobileOpen(false)}>Kortlar</Link>
          <Link href="/blog" className="block text-sm font-600 text-on-surface-variant hover:text-primary py-2" onClick={() => setMobileOpen(false)}>Blog</Link>
          {session ? (
            <>
              <Link href="/hesabim" className="block text-sm font-600 text-on-surface-variant hover:text-primary py-2" onClick={() => setMobileOpen(false)}>Hesabım</Link>
              {(role === "business_owner" || role === "admin") && (
                <Link href="/isletme-paneli" className="block text-sm font-600 text-on-surface-variant hover:text-primary py-2" onClick={() => setMobileOpen(false)}>İşletme Paneli</Link>
              )}
              {role === "admin" && (
                <Link href="/admin" className="block text-sm font-600 text-on-surface-variant hover:text-primary py-2" onClick={() => setMobileOpen(false)}>Admin</Link>
              )}
              <button onClick={() => signOut()} className="block text-sm font-600 text-red-400 py-2">Çıkış Yap</button>
            </>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link href="/giris" className="flex-1 text-center btn-secondary text-sm py-2" onClick={() => setMobileOpen(false)}>Giriş Yap</Link>
              <Link href="/kayit" className="flex-1 text-center btn-primary text-sm py-2" onClick={() => setMobileOpen(false)}>Üye Ol</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
