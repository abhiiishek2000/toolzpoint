import type { PDFFont } from "pdf-lib";
const PDF_TEXT_REPLACEMENTS: Record<string, string> = {
  "₹": "Rs.",
  "₩": "KRW",
  "₽": "RUB",
};
// pdf-lib's standard 14 fonts only encode WinAnsi (Latin-1 plus a handful of
// extras), so anything outside that — the rupee sign, Devanagari, CJK,
// emoji — throws when measured or drawn. Swap a few common symbols for an
// ASCII equivalent, then drop anything else this font can't render rather
// than crashing the whole document.
export function sanitizeForPdf(text: string, font: PDFFont) {
  let result = "";
  for (const ch of text) {
    const replacement = PDF_TEXT_REPLACEMENTS[ch];
    if (replacement !== undefined) {
      result += replacement;
      continue;
    }
    try {
      font.widthOfTextAtSize(ch, 10);
      result += ch;
    } catch {
      // drop characters this font cannot encode
    }
  }
  return result;
}
export function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const lines: string[] = [];
  let current = words[0]!;
  for (const word of words.slice(1)) {
    const candidate = `${current} ${word}`;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  lines.push(current);
  return lines;
}
export function wrapParagraphs(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
) {
  return text
    .split("\n")
    .flatMap((line) =>
      line.trim() ? wrapText(line, font, size, maxWidth) : [""],
    );
}
