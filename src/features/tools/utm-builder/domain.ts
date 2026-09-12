import { z } from "zod";
export const utmSchema = z.object({
  url: z.string().url().max(8192),
  source: z.string().trim().min(1).max(200),
  medium: z.string().trim().min(1).max(200),
  campaign: z.string().trim().min(1).max(200),
  term: z.string().max(200).optional(),
  content: z.string().max(200).optional(),
});
export function utm(input: z.input<typeof utmSchema>) {
  const values = utmSchema.parse(input);
  const url = new URL(values.url);
  if (
    !["https:", "http:"].includes(url.protocol) ||
    url.username ||
    url.password
  )
    throw new Error("Use an HTTP or HTTPS URL without embedded credentials.");
  for (const key of [
    "source",
    "medium",
    "campaign",
    "term",
    "content",
  ] as const) {
    const value = values[key]?.trim();
    if (value) url.searchParams.set(`utm_${key}`, value);
    else url.searchParams.delete(`utm_${key}`);
  }
  return url.toString();
}
