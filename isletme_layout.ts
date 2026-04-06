"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/isletme-paneli", label: "Genel Bakış", icon: "📊" },
  { href: "/isletme-paneli/kortlarim", label: "Kortlarım", icon: "🎾" },
  { href: "/isletme-paneli/rezervasyonlar", label: "Rezervasyonlar", icon: "📅" },
  { href: "/isletme-paneli/takvim", label: "Müsaitlik", icon: "🗓" },
];

export default function IsletmePaneliLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="card mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <span className="text-primary text-lg">🏢</span>
                </div>
                <div>
                  <div className="font-display font-700 text-on-surface text-sm">İşletme Paneli</div>
                  <div className="text-on-surface-variant text-xs">Yönetim merkezi</div>
                </div>
              </div>
            </div>
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
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
