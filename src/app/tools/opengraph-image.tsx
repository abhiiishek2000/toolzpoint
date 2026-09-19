import { ImageResponse } from "next/og";
export const alt = "ToolzPoint — All tools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
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
        Find the right tool.
      </div>
      <div style={{ fontSize: 30, marginTop: 35, maxWidth: 980 }}>
        Free browser tools for images, PDFs, calculators, finance, health, and
        documents. No sign-up.
      </div>
    </div>,
    size,
  );
}
