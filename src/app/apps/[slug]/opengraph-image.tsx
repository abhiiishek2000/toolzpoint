import { ImageResponse } from "next/og";
import { apps, getApp } from "@/lib/app-registry";
export const alt = "ToolzPoint";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export function generateStaticParams() {
  return apps.map((a) => ({ slug: a.slug }));
}
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = getApp(slug);
  return new ImageResponse(
    <div
      style={{
        background: "#edf4ef",
        color: "#163e30",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 90,
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 40, opacity: 0.8 }}>
        {`toolzpoint.${a ? ` · ${a.platforms.join(", ")}` : ""}`}
      </div>
      <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>
        {a?.name ?? "ToolzPoint apps"}
      </div>
      <div style={{ fontSize: 30, marginTop: 35, maxWidth: 980 }}>
        {a?.tagline ?? "Standalone mobile apps by ToolzPoint."}
      </div>
    </div>,
    size,
  );
}
