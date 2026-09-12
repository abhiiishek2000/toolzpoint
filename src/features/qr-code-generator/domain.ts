export function validateQr(text: string) {
  if (!text.trim()) throw new Error("Enter text or a link for your QR code.");
  if (new TextEncoder().encode(text).length > 1000)
    throw new Error(
      "Use 1,000 UTF-8 bytes or fewer for a reliably sized code.",
    );
  return text;
}
export async function createQr(text: string, color = "#222348", size = 640) {
  validateQr(text);
  if (!/^#[0-9a-f]{6}$/i.test(color)) throw new Error("Choose a valid color.");
  if (![320, 640, 1280].includes(size))
    throw new Error("Choose one of the available sizes.");
  const QRCode = await import("qrcode");
  return QRCode.toDataURL(text, {
    width: size,
    margin: 4,
    errorCorrectionLevel: "M",
    color: { dark: color, light: "#ffffff" },
  });
}
