import type { MetadataRoute } from "next";
import { tools, categories } from "@/lib/tool-registry";
import { apps } from "@/lib/app-registry";
import { siteUrl, allowIndexing } from "@/lib/seo";
export default function sitemap(): MetadataRoute.Sitemap {
  if (!allowIndexing) return [];
  return [
    "",
    "/tools",
    "/apps",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/cookies",
    "/disclaimer",
    "/changelog",
    ...categories.map((c) => `/category/${c.slug}`),
    ...tools.filter((t) => t.reviewed).map((t) => `/tools/${t.slug}`),
    ...apps
      .filter((a) => a.reviewed)
      .flatMap((a) => [
        `/apps/${a.slug}`,
        `/apps/${a.slug}/privacy`,
        `/apps/${a.slug}/terms`,
      ]),
  ].map((path) => ({
    url: new URL(path, siteUrl).href,
    lastModified: "2026-09-12",
  }));
}
