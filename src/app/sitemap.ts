import type { MetadataRoute } from "next";
import { tools, categories } from "@/lib/tool-registry";
import { apps } from "@/lib/app-registry";
import { siteUrl, allowIndexing } from "@/lib/seo";
export default function sitemap(): MetadataRoute.Sitemap {
  if (!allowIndexing) return [];
  const reviewedTools = tools.filter((t) => t.reviewed);
  const reviewedApps = apps.filter((a) => a.reviewed);
  const siteLastModified = [...reviewedTools, ...reviewedApps]
    .map((item) => item.updatedAt)
    .sort()
    .at(-1);
  const staticPages = [
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
  ].map((path) => ({
    url: new URL(path, siteUrl).href,
    lastModified: siteLastModified,
  }));
  const toolPages = reviewedTools.map((t) => ({
    url: new URL(`/tools/${t.slug}`, siteUrl).href,
    lastModified: t.updatedAt,
  }));
  const appPages = reviewedApps.flatMap((a) => [
    {
      url: new URL(`/apps/${a.slug}`, siteUrl).href,
      lastModified: a.updatedAt,
    },
    {
      url: new URL(`/apps/${a.slug}/privacy`, siteUrl).href,
      lastModified: a.updatedAt,
    },
    {
      url: new URL(`/apps/${a.slug}/terms`, siteUrl).href,
      lastModified: a.updatedAt,
    },
  ]);
  return [...staticPages, ...toolPages, ...appPages];
}
