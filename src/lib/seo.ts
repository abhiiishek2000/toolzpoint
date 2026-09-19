import type { Metadata } from "next";
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
export const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";
export function metadata(
  title: string,
  description: string,
  path: string,
  index = true,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: { index: allowIndexing && index, follow: true },
    openGraph: {
      title,
      description,
      url: path,
      type: "website",
      siteName: "ToolzPoint",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
// A page that 404s must never inherit the layout's indexable default, even
// once global indexing is on — generateMetadata for a dynamic route should
// return this instead of {} when the requested item doesn't exist.
export const notFoundMetadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};
export function safeJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
