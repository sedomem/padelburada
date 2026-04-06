import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import CourtCard from "@/components/CourtCard";
import HomeSearch from "@/components/HomeSearch";
import HomeMap from "@/components/HomeMap";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PadelBurada — Türkiye'nin Padel Kort Platformu",
  description: "İstanbul, Ankara, İzmir ve tüm Türkiye'deki padel kortlarını bul, karşılaştır ve rezervasyon yap.",
};

const CITIES = [
  { name: "İstanbul", slug: "istanbul", emoji: "🌉", count: 2 },
  { name: "Ankara", slug: "ankara", emoji: "🏛️", count: 2 },
  { name: "İzmir", slug: "izmir", emoji: "🌊", count: 2 },
];

export default async function HomePage() {
  const featuredCourts = await prisma.court.findMany({
    where: { isApproved: true, status: "active" },
    include: { city: true, district: true },
    orderBy: { avgRating: "desc" },
    take: 6,
  });

  const mapCourts = featuredCourts.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    lat: c.lat,
    lng: c.lng,
    minPriceHour: c.minPriceHour,
    avgRating: c.avgRating,
    courtType: c.courtType,
    cityName: c.city.name,
  }));

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-surface via-surface-low to-surface" />
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "radial-gradient(circle at 50% 50%, #C3F400 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-surface-high px-4 py-2 rounded-full mb-8">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-on-surface-variant text-sm font-600">Türkiye genelinde 6+ kort</span>
          </div>

          <h1 className="font-display font-900 text-5xl sm:text-6xl lg:text-7xl text-on-surface mb-6 leading-none tracking-tight">
            KORTUNU BUL,
            <br />
            <span className="text-primary">OYUNA KATIL</span>
          </h1>

          <p className="text-on-surface-variant text-lg sm:text-xl max-w-2xl mx-auto mb-12 font-400">
            Türkiye'nin her yerindeki padel kortlarını keşfet. Anında rezervasyon yap, değerlendir ve paylaş.
          </p>

          <HomeSearch />

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {["Açık Kort", "Kapalı Kort", "Raket Kiralama", "Park Yeri"].map((tag) => (
              <span key={tag} className="badge bg-surface-high text-on-surface-variant">
                ✓ {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* CITY SHORTCUTS */}
      <section className="py-16 bg-surface-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-3xl mb-2">Şehre Göre Keşfet</h2>
          <p className="text-on-surface-variant mb-8">Bulunduğun şehirdeki kortları hızlıca bul</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CITIES.map((city) => (
              <Link
                key={city.slug}
                href={`/kortlar?city=${city.slug}`}
                className="group card hover:bg-surface-highest transition-all duration-300 hover:-translate-y-1 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{city.emoji}</span>
                  <div>
                    <div className="font-display font-700 text-lg text-on-surface group-hover:text-primary transition-colors">{city.name}</div>
                    <div className="text-on-surface-variant text-sm">{city.count} kort</div>
                  </div>
                </div>
                <svg className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* MAP */}
      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-title text-3xl mb-2">Harita Görünümü</h2>
              <p className="text-on-surface-variant">Yakınındaki kortları haritada gör</p>
            </div>
            <Link href="/kortlar?view=map" className="btn-secondary text-sm py-2 px-4 hidden sm:flex">
              Tam Harita →
            </Link>
          </div>
          <div className="h-[450px] rounded-2xl overflow-hidden">
            <HomeMap courts={mapCourts} />
          </div>
        </div>
      </section>

      {/* FEATURED COURTS */}
      <section className="py-16 bg-surface-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-title text-3xl mb-2">Öne Çıkan Kortlar</h2>
              <p className="text-on-surface-variant">En çok tercih edilen padel kortları</p>
            </div>
            <Link href="/kortlar" className="btn-secondary text-sm py-2 px-4 hidden sm:flex">
              Tümünü Gör →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourts.map((court) => (
              <CourtCard key={court.id} court={court as any} />
            ))}
          </div>
          <div className="text-center mt-8 sm:hidden">
            <Link href="/kortlar" className="btn-secondary inline-block">Tüm Kortları Gör →</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-900 text-4xl sm:text-5xl text-on-surface mb-4">
            İşletmeni <span className="text-primary">Platforma</span> Ekle
          </h2>
          <p className="text-on-surface-variant text-lg mb-8 max-w-2xl mx-auto">
            Padel kortunu PadelBurada'ya ekle, binlerce oyuncuya ulaş. Rezervasyon yönetimi, istatistikler ve daha fazlası.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/kayit?role=business" className="btn-primary text-base px-8 py-4">
              İşletmeni Kaydet
            </Link>
            <Link href="/kortlar" className="btn-secondary text-base px-8 py-4">
              Kortları Keşfet
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-surface-lowest py-12 border-t border-outline-variant/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-gradient rounded-lg flex items-center justify-center">
                  <span className="text-on-primary font-display font-900 text-sm">P</span>
                </div>
                <span className="font-display font-800 text-xl">Padel<span className="text-primary">Burada</span></span>
              </div>
              <p className="text-on-surface-variant text-sm">Türkiye'nin padel kort platformu.</p>
            </div>
            <div>
              <h4 className="font-600 text-on-surface mb-3 text-sm">Platform</h4>
              <div className="space-y-2">
                <Link href="/kortlar" className="block text-on-surface-variant text-sm hover:text-primary transition-colors">Kortlar</Link>
                <Link href="/blog" className="block text-on-surface-variant text-sm hover:text-primary transition-colors">Blog</Link>
                <Link href="/kayit" className="block text-on-surface-variant text-sm hover:text-primary transition-colors">Kayıt Ol</Link>
              </div>
            </div>
            <div>
              <h4 className="font-600 text-on-surface mb-3 text-sm">İşletmeler</h4>
              <div className="space-y-2">
                <Link href="/kayit?role=business" className="block text-on-surface-variant text-sm hover:text-primary transition-colors">Kortunu Ekle</Link>
                <Link href="/isletme-paneli" className="block text-on-surface-variant text-sm hover:text-primary transition-colors">İşletme Paneli</Link>
              </div>
            </div>
            <div>
              <h4 className="font-600 text-on-surface mb-3 text-sm">Şehirler</h4>
              <div className="space-y-2">
                {CITIES.map((c) => (
                  <Link key={c.slug} href={`/kortlar?city=${c.slug}`} className="block text-on-surface-variant text-sm hover:text-primary transition-colors">{c.name}</Link>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-outline-variant/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-on-surface-variant text-sm">© 2024 PadelBurada. Tüm hakları saklıdır.</p>
            <div className="flex gap-4 text-sm">
              <Link href="/gizlilik" className="text-on-surface-variant hover:text-primary transition-colors">Gizlilik</Link>
              <Link href="/kullanim-sartlari" className="text-on-surface-variant hover:text-primary transition-colors">Kullanım Şartları</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
