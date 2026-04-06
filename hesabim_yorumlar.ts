"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import StarRating from "@/components/ui/StarRating";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  court: { name: string; slug: string };
}

export default function YorumlarPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/reviews")
      .then((r) => r.json())
      .then((d) => { setReviews(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function deleteReview(id: number) {
    if (!confirm("Yorumu silmek istediğinizden emin misiniz?")) return;
    const res = await fetch("/api/reviews", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId: id }),
    });
    if (res.ok) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success("Yorum silindi");
    } else {
      toast.error("Silinemedi");
    }
  }

  if (loading) return (
    <div>
      <h1 className="font-display font-800 text-2xl text-on-surface mb-6">Yorumlarım</h1>
      <div className="space-y-4">
        {[1,2].map(i => <div key={i} className="h-28 bg-surface-high rounded-2xl animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="font-display font-800 text-2xl text-on-surface mb-6">
        Yorumlarım <span className="text-on-surface-variant font-400 text-lg">({reviews.length})</span>
      </h1>
      {reviews.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">⭐</div>
          <h3 className="font-display font-700 text-lg text-on-surface mb-2">Henüz yorum yapmadınız</h3>
          <p className="text-on-surface-variant">Gittiğiniz kortları değerlendirin.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="card flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <Link href={`/kort/${review.court.slug}`} className="font-display font-700 text-on-surface hover:text-primary transition-colors">
                  {review.court.name}
                </Link>
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} size="sm" />
                  <span className="text-on-surface-variant text-xs">{formatDate(review.createdAt)}</span>
                </div>
                {review.comment && <p className="text-on-surface-variant text-sm">{review.comment}</p>}
              </div>
              <button
                onClick={() => deleteReview(review.id)}
                className="text-red-400 hover:text-red-300 text-sm flex-shrink-0 transition-colors"
              >
                Sil
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
