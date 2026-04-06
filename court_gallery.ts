"use client";
import { useState } from "react";
import Image from "next/image";

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200",
  "https://images.unsplash.com/photo-1526888935184-a82d2a4b7e67?w=1200",
  "https://images.unsplash.com/photo-1545809763-0a97e73a32c8?w=1200",
  "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=1200",
];

interface CourtGalleryProps {
  coverImageUrl?: string | null;
  courtName: string;
}

export default function CourtGallery({ coverImageUrl, courtName }: CourtGalleryProps) {
  const images = coverImageUrl
    ? [coverImageUrl, ...PLACEHOLDER_IMAGES.slice(0, 3)]
    : PLACEHOLDER_IMAGES;

  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-80 sm:h-96 rounded-2xl overflow-hidden">
        {/* Main image */}
        <div
          className="col-span-2 row-span-2 relative cursor-pointer group"
          onClick={() => setLightbox(true)}
        >
          <Image
            src={images[0]}
            alt={courtName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
        </div>
        {/* Thumbnails */}
        {images.slice(1, 5).map((img, i) => (
          <div
            key={i}
            className="relative cursor-pointer group"
            onClick={() => { setActive(i + 1); setLightbox(true); }}
          >
            <Image
              src={img}
              alt={`${courtName} ${i + 2}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            {i === 2 && images.length > 4 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-700">+{images.length - 4} foto</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-primary transition-colors"
            onClick={() => setLightbox(false)}
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-primary"
            onClick={(e) => { e.stopPropagation(); setActive((a) => Math.max(0, a - 1)); }}
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div
            className="relative w-full max-w-4xl h-[70vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image src={images[active]} alt={courtName} fill className="object-contain" />
          </div>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-primary"
            onClick={(e) => { e.stopPropagation(); setActive((a) => Math.min(images.length - 1, a + 1)); }}
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setActive(i); }}
                className={`w-2 h-2 rounded-full transition-all ${i === active ? "bg-primary w-6" : "bg-white/40"}`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
