import { textSchema } from "../shared";
export function formatJson(input: string, minify = false) {
  textSchema.min(1, "Paste JSON first.").parse(input);
  try {
    const parsed: unknown = JSON.parse(input);
    return JSON.stringify(parsed, null, minify ? 0 : 2);
  } catch (e) {
    const m = e instanceof Error ? e.message : "Invalid JSON";
    const position = m.match(/position (\d+)/)?.[1];
    const offset = position ? Number(position) : input.length;
    const before = input.slice(0, offset);
    throw new Error(
      `Invalid JSON near line ${before.split("\n").length}, column ${(before.split("\n").at(-1)?.length ?? 0) + 1}. Check quotes, commas and brackets.`,
    );
  }
}
