import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://padelburada.com";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/isletme-paneli", "/hesabim", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
