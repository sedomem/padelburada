import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Padel Rehberi & Haberleri",
  description: "Padel hakkında rehberler, ipuçları, kort seçimi ve daha fazlası. PadelBurada Blog.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Header */}
      <div className="bg-surface-low py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display font-900 text-4xl sm:text-5xl text-on-surface mb-4">
            Padel <span className="text-primary">Blog</span>
          </h1>
          <p className="text-on-surface-variant text-lg max-w-xl mx-auto">
            Padel dünyasından rehberler, ipuçları ve haberler
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-on-surface-variant">Henüz blog yazısı yok.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post, i) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className={`group card hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 ${
                  i === 0 ? "sm:flex gap-6 items-start" : "sm:flex gap-5 items-start"
                }`}
              >
                {/* Cover */}
                <div className={`flex-shrink-0 rounded-xl overflow-hidden bg-surface-highest flex items-center justify-center ${
                  i === 0 ? "w-full sm:w-64 h-40" : "w-full sm:w-48 h-32"
                }`}>
                  {post.coverImage ? (
                    <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <span className="text-4xl">🎾</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 mt-4 sm:mt-0">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="badge bg-primary/20 text-primary text-xs">{tag}</span>
                    ))}
                  </div>
                  <h2 className={`font-display font-800 text-on-surface group-hover:text-primary transition-colors mb-2 ${i === 0 ? "text-xl" : "text-lg"}`}>
                    {post.title}
                  </h2>
                  <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-2 mb-3">
                    {post.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                    <span>✍️ {post.author}</span>
                    <span>•</span>
                    <span>📅 {formatDate(post.date)}</span>
                    <span>•</span>
                    <span>⏱ {post.readingTime} dk okuma</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
