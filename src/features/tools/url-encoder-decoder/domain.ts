import { textSchema } from "../shared";
export function urlCode(input: string, decode = false, full = false) {
  textSchema.parse(input);
  try {
    return decode
      ? full
        ? decodeURI(input)
        : decodeURIComponent(input)
      : full
        ? encodeURI(input)
        : encodeURIComponent(input);
  } catch {
    throw new Error(
      "Invalid URL encoding. Check percent escapes and Unicode characters.",
    );
  }
}
