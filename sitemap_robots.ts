// app/sitemap.ts
import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getAllPosts } from "@/lib/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://padelburada.com";

  const courts = await prisma.court.findMany({
    where: { isApproved: true },
    select: { slug: true, updatedAt: true },
  }).catch(() => []);

  const posts = getAllPosts();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/kortlar`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/giris`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/kayit`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const courtRoutes: MetadataRoute.Sitemap = courts.map((c) => ({
    url: `${base}/kort/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const blogRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...courtRoutes, ...blogRoutes];
}

// ---- app/robots.ts ----
// Save separately as app/robots.ts
