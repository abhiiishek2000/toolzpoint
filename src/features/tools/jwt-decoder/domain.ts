import { textSchema } from "../shared";
function decodePart(part: string, name: string) {
  try {
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = new TextDecoder("utf-8", { fatal: true }).decode(
      Uint8Array.from(atob(padded), (c) => c.charCodeAt(0)),
    );
    return JSON.stringify(JSON.parse(json), null, 2);
  } catch {
    throw new Error(`The ${name} is not valid Base64URL-encoded JSON.`);
  }
}
export function decodeJwt(input: string) {
  textSchema.min(1, "Paste a JWT first.").parse(input);
  const parts = input.trim().split(".");
  if (parts.length !== 3)
    throw new Error(
      "A JWT has three dot-separated parts: header, payload, and signature.",
    );
  const header = decodePart(parts[0]!, "header");
  const payload = decodePart(parts[1]!, "payload");
  return `HEADER\n${header}\n\nPAYLOAD\n${payload}\n\nSIGNATURE (not verified)\n${parts[2]}`;
}
