import { ImageResponse } from "next/og";
export const alt = "ToolzPoint — Small tools. Big difference.";
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
      <div style={{ fontSize: 30, marginBottom: 50 }}>toolzpoint.</div>
      <div style={{ fontSize: 85, fontWeight: 700 }}>Small tools.</div>
      <div style={{ fontSize: 85, fontWeight: 700 }}>Big difference.</div>
      <div style={{ fontSize: 28, marginTop: 35 }}>
        Free tools. No sign-up. Your inputs stay in your browser.
      </div>
    </div>,
    size,
  );
}
