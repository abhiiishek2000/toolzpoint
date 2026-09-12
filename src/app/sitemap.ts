import type { MetadataRoute } from "next";
import { tools, categories } from "@/lib/tool-registry";
import { siteUrl, allowIndexing } from "@/lib/seo";
export default function sitemap(): MetadataRoute.Sitemap {
  if (!allowIndexing) return [];
  return [
    "",
    "/tools",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/cookies",
    "/disclaimer",
    "/changelog",
    ...categories.map((c) => `/category/${c.slug}`),
    ...tools.filter((t) => t.reviewed).map((t) => `/tools/${t.slug}`),
  ].map((path) => ({
    url: new URL(path, siteUrl).href,
    lastModified: "2026-09-12",
  }));
}
