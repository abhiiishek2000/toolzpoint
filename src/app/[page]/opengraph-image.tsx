import { ImageResponse } from "next/og";
import { pages } from "./page";
export const alt = "ToolzPoint";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export function generateStaticParams() {
  return Object.keys(pages).map((page) => ({ page }));
}
export default async function Image({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const p = pages[page];
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
        toolzpoint.
      </div>
      <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>
        {p?.title ?? "ToolzPoint"}
      </div>
      <div style={{ fontSize: 30, marginTop: 35, maxWidth: 980 }}>
        {p?.lead ?? "Free everyday tools, private by design."}
      </div>
    </div>,
    size,
  );
}
