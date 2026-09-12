import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ToolzPoint",
    short_name: "ToolzPoint",
    description: "Free everyday tools, private by design.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8faf9",
    theme_color: "#116b50",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
