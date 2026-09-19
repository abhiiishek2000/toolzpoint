import { z } from "zod";
export const metaTagSchema = z.object({
  title: z.string().trim().min(1).max(70),
  description: z.string().trim().min(1).max(200),
  url: z.string().url().max(2048),
  image: z.string().url().max(2048).optional(),
  siteName: z.string().trim().max(100).optional(),
});
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
export function metaTags(input: {
  title: string;
  description: string;
  url: string;
  image?: string;
  siteName?: string;
}) {
  const v = metaTagSchema.parse({
    title: input.title,
    description: input.description,
    url: input.url,
    image: input.image?.trim() || undefined,
    siteName: input.siteName?.trim() || undefined,
  });
  const title = escapeHtml(v.title);
  const description = escapeHtml(v.description);
  const url = escapeHtml(v.url);
  const lines = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${url}" />`,
  ];
  if (v.siteName)
    lines.push(
      `<meta property="og:site_name" content="${escapeHtml(v.siteName)}" />`,
    );
  if (v.image)
    lines.push(`<meta property="og:image" content="${escapeHtml(v.image)}" />`);
  lines.push(
    `<meta name="twitter:card" content="${v.image ? "summary_large_image" : "summary"}" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
  );
  if (v.image)
    lines.push(
      `<meta name="twitter:image" content="${escapeHtml(v.image)}" />`,
    );
  return lines.join("\n");
}
