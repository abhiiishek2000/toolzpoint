import { textSchema } from "../shared";
export function base64(input: string, decode = false) {
  textSchema.parse(input);
  if (decode) {
    const s = input.replace(/\s/g, "");
    if (
      s.length % 4 !== 0 ||
      !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
        s,
      )
    )
      throw new Error("Enter valid padded Base64.");
    try {
      return new TextDecoder("utf-8", { fatal: true }).decode(
        Uint8Array.from(atob(s), (c) => c.charCodeAt(0)),
      );
    } catch {
      throw new Error("This is not valid UTF-8 Base64 text.");
    }
  }
  let bytes = "";
  for (const n of new TextEncoder().encode(input))
    bytes += String.fromCharCode(n);
  return btoa(bytes);
}
