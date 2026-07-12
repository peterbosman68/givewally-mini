import type { MetadataRoute } from "next";

// Blokkeer alles voor zoekmachines; er wordt bewust geen sitemap gegenereerd.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
