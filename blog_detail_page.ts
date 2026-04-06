import { notFound } from "next/navigation";
import { getPostBySlug, getAllPosts } from "@/lib/blog";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import type { Metadata } from "next";

interface Props { params: { slug: string } }

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: "Yazı Bulunamadı" };
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const allPosts = getAllPosts();
  const related = allPosts.filter((p) => p.slug !== params.slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    author: { "@type": "Person", name: post.author },
    datePublished: post.date,
    publisher: {
      "@type": "Organization",
      name: "PadelBurada",
      url: "https://padelburada.com",
    },
    image: post.coverImage,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-on-surface-variant py-4">
            <Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-on-surface line-clamp-1">{post.title}</span>
          </div>

          {/* Header */}
          <div className="py-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span key={tag} className="badge bg-primary/20 text-primary">{tag}</span>
              ))}
            </div>
            <h1 className="font-display font-900 text-3xl sm:text-4xl text-on-surface mb-4 leading-tight">
              {post.title}
            </h1>
            <p className="text-on-surface-variant text-lg mb-6 leading-relaxed">{post.description}</p>
            <div className="flex items-center gap-4 text-sm text-on-surface-variant">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-on-primary font-700 text-xs">{post.author[0]}</span>
                </div>
                <span>{post.author}</span>
              </div>
              <span>•</span>
              <span>{formatDate(post.date)}</span>
              <span>•</span>
              <span>{post.readingTime} dk okuma</span>
            </div>
          </div>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="h-64 sm:h-80 rounded-2xl overflow-hidden mb-8">
              <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Content */}
          <article
            className="prose prose-invert max-w-none text-on-surface-variant
              prose-headings:font-display prose-headings:text-on-surface prose-headings:font-800
              prose-h2:text-2xl prose-h3:text-xl
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-on-surface
              prose-code:text-primary prose-code:bg-surface-high prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-surface-high prose-pre:rounded-xl
              prose-blockquote:border-primary prose-blockquote:text-on-surface-variant
              prose-li:text-on-surface-variant"
            dangerouslySetInnerHTML={{ __html: post.content || "" }}
          />

          {/* Share */}
          <div className="mt-12 pt-8 border-t border-outline-variant/10">
            <p className="text-on-surface-variant text-sm mb-4">Bu yazıyı paylaş:</p>
            <div className="flex gap-3">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://padelburada.com/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-sm py-2 px-4"
              >
                𝕏 Twitter
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://padelburada.com/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-sm py-2 px-4"
              >
                LinkedIn
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${post.title} - https://padelburada.com/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-sm py-2 px-4"
              >
                WhatsApp
              </a>
            </div>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div className="mt-12">
              <h2 className="font-display font-800 text-xl text-on-surface mb-6">Diğer Yazılar</h2>
              <div className="grid gap-4">
                {related.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/blog/${p.slug}`}
                    className="card hover:bg-surface-highest transition-colors group flex items-center gap-4"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-highest flex-shrink-0 flex items-center justify-center">
                      {p.coverImage
                        ? <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover" />
                        : <span className="text-2xl">🎾</span>}
                    </div>
                    <div>
                      <h3 className="font-display font-700 text-on-surface group-hover:text-primary transition-colors text-sm">{p.title}</h3>
                      <p className="text-on-surface-variant text-xs mt-1">{formatDate(p.date)} · {p.readingTime} dk</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link href="/blog" className="btn-secondary inline-block px-6 py-3">
              ← Tüm Yazılar
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
