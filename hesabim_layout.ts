"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

const navItems = [
  { href: "/hesabim", label: "Profilim", icon: "👤" },
  { href: "/hesabim/rezervasyonlar", label: "Rezervasyonlarım", icon: "📅" },
  { href: "/hesabim/favoriler", label: "Favorilerim", icon: "♥" },
  { href: "/hesabim/yorumlar", label: "Yorumlarım", icon: "⭐" },
];

export default function HesabimLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            {/* User Info */}
            <div className="card mb-4 text-center">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-3">
                <span className="font-display font-900 text-2xl text-on-primary">
                  {session?.user?.name?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
              <div className="font-display font-700 text-on-surface">{session?.user?.name}</div>
              <div className="text-on-surface-variant text-sm mt-1">{session?.user?.email}</div>
              <div className="mt-2">
                <span className="badge bg-primary/20 text-primary text-xs">
                  {(session?.user as any)?.role === "admin" ? "Admin"
                    : (session?.user as any)?.role === "business_owner" ? "İşletmeci"
                    : "Üye"}
                </span>
              </div>
            </div>

            {/* Nav */}
            <nav className="card p-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-600 transition-all ${
                    pathname === item.href
                      ? "bg-primary text-on-primary"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-highest"
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
