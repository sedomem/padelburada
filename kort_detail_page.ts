import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice, courtTypeLabel, surfaceLabel } from "@/lib/utils";
import CourtGallery from "@/components/CourtGallery";
import ReservationCalendar from "@/components/ReservationCalendar";
import CourtCard from "@/components/CourtCard";
import StarRating from "@/components/ui/StarRating";
import CourtDetailClient from "./CourtDetailClient";
import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { formatDate } from "@/lib/utils";

const MapInner = dynamic(() => import("@/components/Map"), { ssr: false });

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const court = await prisma.court.findUnique({ where: { slug: params.slug }, include: { city: true } });
  if (!court) return { title: "Kort Bulunamadı" };
  return {
    title: `${court.name} — ${court.city.name} Padel Kort`,
    description: court.description || `${court.name} adresinde padel rezervasyonu yap. ${court.city.name}'da ${courtTypeLabel(court.courtType)} kort.`,
  };
}

export default async function CourtDetailPage({ params }: Props) {
  const court = await prisma.court.findUnique({
    where: { slug: params.slug, isApproved: true },
    include: {
      city: true,
      district: true,
      reviews: {
        include: { user: { select: { fullName: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      schedules: { where: { isActive: true } },
      owner: { select: { fullName: true, phone: true, email: true } },
    },
  });

  if (!court) notFound();

  const similar = await prisma.court.findMany({
    where: {
      cityId: court.cityId,
      isApproved: true,
      status: "active",
      id: { not: court.id },
    },
    include: { city: true, district: true },
    take: 3,
  });

  const mapCourt = [{
    id: court.id, name: court.name, slug: court.slug,
    lat: court.lat, lng: court.lng,
    minPriceHour: court.minPriceHour, avgRating: court.avgRating,
    courtType: court.courtType, cityName: court.city.name,
  }];

  const dayNames = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

  // Schema.org JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: court.name,
    description: court.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: court.address,
      addressLocality: court.city.name,
      addressCountry: "TR",
    },
    geo: { "@type": "GeoCoordinates", latitude: court.lat, longitude: court.lng },
    telephone: court.phone,
    aggregateRating: court.totalReviews > 0 ? {
      "@type": "AggregateRating",
      ratingValue: court.avgRating.toFixed(1),
      reviewCount: court.totalReviews,
    } : undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-on-surface-variant py-4">
            <a href="/" className="hover:text-primary transition-colors">Ana Sayfa</a>
            <span>/</span>
            <a href="/kortlar" className="hover:text-primary transition-colors">Kortlar</a>
            <span>/</span>
            <a href={`/kortlar?city=${court.city.slug}`} className="hover:text-primary transition-colors">{court.city.name}</a>
            <span>/</span>
            <span className="text-on-surface">{court.name}</span>
          </div>

          {/* Gallery */}
          <CourtGallery coverImageUrl={court.coverImageUrl} courtName={court.name} />

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT: Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title & Rating */}
              <div>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h1 className="font-display font-900 text-3xl sm:text-4xl text-on-surface mb-2">{court.name}</h1>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <StarRating rating={court.avgRating} size="md" />
                        <span className="font-700 text-on-surface">{court.avgRating.toFixed(1)}</span>
                        <span className="text-on-surface-variant text-sm">({court.totalReviews} yorum)</span>
                      </div>
                      <span className="text-on-surface-variant">•</span>
                      <span className="text-on-surface-variant text-sm flex items-center gap-1">
                        📍 {court.district.name}, {court.city.name}
                      </span>
                    </div>
                  </div>
                  {/* Favorite button — client component */}
                  <CourtDetailClient courtId={court.id} />
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-3">
                <span className="badge bg-primary/20 text-primary">{courtTypeLabel(court.courtType)}</span>
                <span className="badge bg-surface-high text-on-surface-variant">{surfaceLabel(court.surface)} Zemin</span>
                {court.hasParking && <span className="badge bg-surface-high text-on-surface-variant">🅿️ Park Yeri</span>}
                {court.hasShower && <span className="badge bg-surface-high text-on-surface-variant">🚿 Duş</span>}
                {court.hasRacketRental && <span className="badge bg-surface-high text-on-surface-variant">🎾 Raket Kiralama</span>}
                {court.hasLighting && <span className="badge bg-surface-high text-on-surface-variant">💡 Aydınlatma</span>}
              </div>

              {/* Description */}
              {court.description && (
                <div className="card">
                  <h2 className="font-display font-700 text-lg text-on-surface mb-3">Kort Hakkında</h2>
                  <p className="text-on-surface-variant leading-relaxed">{court.description}</p>
                </div>
              )}

              {/* Schedules & Prices */}
              <div className="card">
                <h2 className="font-display font-700 text-lg text-on-surface mb-4">Çalışma Saatleri & Fiyatlar</h2>
                <div className="space-y-2">
                  {court.schedules.map((s) => (
                    <div key={s.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-surface-highest flex items-center justify-center text-xs font-700 text-on-surface">
                          {dayNames[s.dayOfWeek]}
                        </span>
                        <span className="text-on-surface-variant text-sm">{s.startTime} — {s.endTime}</span>
                      </div>
                      <span className="font-700 text-primary">{formatPrice(s.priceHour)}/saat</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-outline-variant/10 flex items-center justify-between">
                  <span className="text-on-surface-variant text-sm">Fiyat aralığı</span>
                  <span className="font-700 text-on-surface">
                    {formatPrice(court.minPriceHour)} — {formatPrice(court.maxPriceHour)}/saat
                  </span>
                </div>
              </div>

              {/* Map */}
              <div className="card p-0 overflow-hidden">
                <div className="p-5">
                  <h2 className="font-display font-700 text-lg text-on-surface">Konum</h2>
                  <p className="text-on-surface-variant text-sm mt-1">{court.address}</p>
                </div>
                <div className="h-64">
                  <MapInner courts={mapCourt} center={[court.lat, court.lng]} zoom={15} height="100%" />
                </div>
              </div>

              {/* Reviews */}
              <div>
                <h2 className="font-display font-700 text-xl text-on-surface mb-6">
                  Yorumlar <span className="text-on-surface-variant font-400 text-base">({court.totalReviews})</span>
                </h2>

                {/* Avg rating visual */}
                <div className="card flex items-center gap-6 mb-6">
                  <div className="text-center">
                    <div className="font-display font-900 text-5xl text-primary">{court.avgRating.toFixed(1)}</div>
                    <StarRating rating={court.avgRating} size="sm" />
                    <div className="text-on-surface-variant text-xs mt-1">{court.totalReviews} yorum</div>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = court.reviews.filter((r) => r.rating === star).length;
                      const pct = court.totalReviews > 0 ? (count / court.totalReviews) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2 text-xs">
                          <span className="text-on-surface-variant w-2">{star}</span>
                          <div className="flex-1 h-1.5 bg-surface-highest rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-on-surface-variant w-4">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  {court.reviews.map((review) => (
                    <div key={review.id} className="card">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-highest flex items-center justify-center flex-shrink-0">
                          <span className="text-on-surface font-700 text-sm">
                            {review.user.fullName[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div>
                              <span className="font-600 text-on-surface text-sm">{review.user.fullName}</span>
                              {review.isVerifiedPurchase && (
                                <span className="ml-2 badge bg-primary/20 text-primary text-[10px]">✓ Doğrulanmış</span>
                              )}
                            </div>
                            <span className="text-on-surface-variant text-xs">{formatDate(review.createdAt)}</span>
                          </div>
                          <StarRating rating={review.rating} size="sm" />
                          {review.comment && (
                            <p className="text-on-surface-variant text-sm mt-2 leading-relaxed">{review.comment}</p>
                          )}
                          {review.ownerResponse && (
                            <div className="mt-3 bg-surface-highest rounded-xl p-3">
                              <p className="text-xs font-600 text-primary mb-1">İşletme Yanıtı:</p>
                              <p className="text-on-surface-variant text-sm">{review.ownerResponse}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {court.reviews.length === 0 && (
                    <div className="text-center py-8 text-on-surface-variant">Henüz yorum yok. İlk yorumu siz yapın!</div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: Reservation Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="card">
                  <h2 className="font-display font-700 text-lg text-on-surface mb-2">Rezervasyon Yap</h2>
                  <p className="text-on-surface-variant text-sm mb-5">Gün ve saat seçerek hemen rezerve et</p>
                  <ReservationCalendar courtId={court.id} courtSlug={court.slug} />
                </div>

                {/* Contact Info */}
                <div className="card mt-4 space-y-3">
                  <h3 className="font-display font-700 text-on-surface">İletişim</h3>
                  <a href={`tel:${court.phone}`} className="flex items-center gap-3 text-on-surface-variant hover:text-primary transition-colors text-sm">
                    <span>📞</span> {court.phone}
                  </a>
                  {court.email && (
                    <a href={`mailto:${court.email}`} className="flex items-center gap-3 text-on-surface-variant hover:text-primary transition-colors text-sm">
                      <span>✉️</span> {court.email}
                    </a>
                  )}
                  {court.website && (
                    <a href={court.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-on-surface-variant hover:text-primary transition-colors text-sm">
                      <span>🌐</span> Web Sitesi
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Similar Courts */}
          {similar.length > 0 && (
            <div className="mt-16">
              <h2 className="font-display font-800 text-2xl text-on-surface mb-6">Benzer Kortlar</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {similar.map((c) => <CourtCard key={c.id} court={c as any} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
