import data from "./catalog-data.json";
export const categories = [
  {
    name: "Images",
    slug: "images",
    icon: "Image",
    description: "Compress, resize, and get your images ready to share.",
  },
  {
    name: "PDF tools",
    slug: "pdf",
    icon: "Files",
    description: "Combine documents and turn images into shareable PDFs.",
  },
  {
    name: "Text",
    slug: "text",
    icon: "Type",
    description: "Count, shape, and refine your words.",
  },
  {
    name: "Developer",
    slug: "developer",
    icon: "Code2",
    description: "Small utilities for your everyday development workflow.",
  },
  {
    name: "Calculators",
    slug: "calculators",
    icon: "Calculator",
    description: "Clear answers to everyday number questions.",
  },
  {
    name: "SEO & social",
    slug: "seo-social",
    icon: "Globe",
    description: "Prepare clean URLs and consistent campaign links.",
  },
  {
    name: "Finance",
    slug: "finance",
    icon: "TrendingUp",
    description: "Explore financial scenarios with visible assumptions.",
  },
  {
    name: "Health & nutrition",
    slug: "health-nutrition",
    icon: "HeartPulse",
    description: "Understand general estimates and their limitations.",
  },
  {
    name: "Converters",
    slug: "converters",
    icon: "Thermometer",
    description: "Turn one unit into another without the mental math.",
  },
  {
    name: "Security & privacy",
    slug: "security",
    icon: "KeyRound",
    description:
      "Generate and check the everyday basics of staying safe online.",
  },
  {
    name: "Random & fun",
    slug: "random-fun",
    icon: "Coins",
    description: "Coin flips, dice, and picks for quick decisions.",
  },
  {
    name: "Documents & design",
    slug: "documents",
    icon: "LayoutTemplate",
    description: "Fill in a form and download a ready-to-use document.",
  },
] as const;
export type ToolDefinition = (typeof data)[number];
export const tools: ToolDefinition[] = data;
export function getTool(slug: string) {
  return tools.find((t) => t.slug === slug && t.status === "published");
}
export function categoryFor(name: string) {
  return categories.find((c) => c.name === name);
}
export function searchTools(query: string, category = "All tools") {
  const q = query.trim().toLowerCase();
  return tools.filter(
    (t) =>
      (category === "All tools" || t.category === category) &&
      (!q ||
        [t.name, t.shortDescription, t.category, ...t.keywords]
          .join(" ")
          .toLowerCase()
          .includes(q)),
  );
}
