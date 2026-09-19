import { z } from "zod";
import { textSchema } from "../shared";
export const caseModes = [
  "upper",
  "lower",
  "title",
  "sentence",
  "camel",
  "snake",
  "kebab",
] as const;
export type CaseMode = (typeof caseModes)[number];
function words(input: string) {
  return input
    .trim()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}
export function convertCase(input: string, mode: CaseMode) {
  textSchema.min(1, "Add some text first.").parse(input);
  z.enum(caseModes).parse(mode);
  switch (mode) {
    case "upper":
      return input.toUpperCase();
    case "lower":
      return input.toLowerCase();
    case "title":
      return input.replace(
        /\p{L}[\p{L}\p{N}'’]*/gu,
        (w) => w[0]!.toUpperCase() + w.slice(1).toLowerCase(),
      );
    case "sentence": {
      const lower = input.toLowerCase();
      return lower.replace(/(^\s*[a-z]|[.!?]\s+[a-z])/g, (m) =>
        m.toUpperCase(),
      );
    }
    case "camel":
    case "snake":
    case "kebab": {
      const w = words(input).map((x) => x.toLowerCase());
      if (!w.length) throw new Error("Add letters or numbers to convert.");
      if (mode === "camel")
        return w
          .map((x, i) => (i === 0 ? x : x[0]!.toUpperCase() + x.slice(1)))
          .join("");
      return w.join(mode === "snake" ? "_" : "-");
    }
  }
}
