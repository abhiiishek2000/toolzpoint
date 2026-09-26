import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
// Never disallow "/" here: a blocked crawler can't read each page's robots
// meta tag, so previews stay out of the index via noindex, not robots.txt.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: new URL("/sitemap.xml", siteUrl).href,
  };
}
