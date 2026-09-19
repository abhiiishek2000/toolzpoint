import { textSchema } from "../shared";

export const textUtilitySlugs = [
  "character-counter",
  "lorem-ipsum-generator",
  "duplicate-line-remover",
  "remove-line-breaks",
  "text-sorter",
  "find-and-replace-text",
  "whitespace-remover",
  "text-reverser",
  "nato-phonetic-alphabet-converter",
  "rot13-caesar-cipher",
] as const;
const paragraph =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
const nato =
  "Alfa Bravo Charlie Delta Echo Foxtrot Golf Hotel India Juliett Kilo Lima Mike November Oscar Papa Quebec Romeo Sierra Tango Uniform Victor Whiskey X-ray Yankee Zulu".split(
    " ",
  );
function choice(
  value: string | undefined,
  options: string[],
  fallback: string,
) {
  const selected = value ?? fallback;
  if (!options.includes(selected)) throw new Error("Choose a valid option.");
  return selected;
}
export function runTextUtility(
  slug: string,
  raw: string,
  values: Record<string, string>,
): string | Record<string, number> {
  const input = textSchema.parse(raw);
  const lines = input.replace(/\r\n?/g, "\n").split("\n");
  switch (slug) {
    case "character-counter":
      return {
        "Unicode code points": [...input].length,
        "Without whitespace": [...input.replace(/\s/gu, "")].length,
        "UTF-16 code units": input.length,
        "UTF-8 bytes": new TextEncoder().encode(input).length,
      };
    case "lorem-ipsum-generator": {
      const count = Number(values.count ?? "3");
      if (!Number.isInteger(count) || count < 1 || count > 50)
        throw new Error("Enter 1–50 paragraphs.");
      return Array.from({ length: count }, () => paragraph).join("\n\n");
    }
    case "duplicate-line-remover":
      return [...new Set(lines)].join("\n");
    case "remove-line-breaks":
      return input.replace(/(?:\r\n|\r|\n)+/g, " ");
    case "text-sorter": {
      const order = choice(
        values.order,
        ["ascending", "descending", "length"],
        "ascending",
      );
      return lines
        .sort((a, b) =>
          order === "length"
            ? [...a].length - [...b].length
            : (a < b ? -1 : a > b ? 1 : 0) * (order === "descending" ? -1 : 1),
        )
        .join("\n");
    }
    case "find-and-replace-text": {
      const find = textSchema.parse(values.find ?? "");
      const replacement = textSchema.parse(values.replacement ?? "");
      if (!find) throw new Error("Enter text to find.");
      const pieces = input.split(find);
      if (
        input.length -
          (pieces.length - 1) * find.length +
          (pieces.length - 1) * replacement.length >
        100000
      )
        throw new Error(
          "Result exceeds 100,000 characters. Use a shorter replacement.",
        );
      return pieces.join(replacement);
    }
    case "whitespace-remover":
      return input.replace(/\s+/gu, " ").trim();
    case "text-reverser":
      return Array.from(
        new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(
          input,
        ),
        (s) => s.segment,
      )
        .reverse()
        .join("");
    case "nato-phonetic-alphabet-converter":
      return [...input]
        .map((c) =>
          /^[a-z]$/i.test(c)
            ? nato[c.toUpperCase().charCodeAt(0) - 65]!
            : /\s/u.test(c)
              ? "/"
              : c,
        )
        .join(" ");
    case "rot13-caesar-cipher": {
      const shift = Number(values.shift ?? "13");
      if (!Number.isInteger(shift) || shift < -25 || shift > 25)
        throw new Error("Enter an integer shift from -25 to 25.");
      return input.replace(/[a-z]/gi, (c) => {
        const base = c <= "Z" ? 65 : 97;
        return String.fromCharCode(
          base + ((c.charCodeAt(0) - base + shift + 26) % 26),
        );
      });
    }
    default:
      throw new Error("Unknown text utility.");
  }
}
