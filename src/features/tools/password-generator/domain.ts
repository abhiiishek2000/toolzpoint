import { z } from "zod";
const passwordSchema = z.object({
  length: z.number().int().min(6).max(128),
  count: z.number().int().min(1).max(20),
  lower: z.boolean(),
  upper: z.boolean(),
  numbers: z.boolean(),
  symbols: z.boolean(),
});
const sets = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?",
} as const;
function defaultRandomIndex(max: number) {
  const range = 256 - (256 % max);
  let byte: number;
  do {
    byte = crypto.getRandomValues(new Uint8Array(1))[0]!;
  } while (byte >= range);
  return byte % max;
}
export function generatePasswords(
  input: z.input<typeof passwordSchema>,
  randomIndex: (max: number) => number = defaultRandomIndex,
) {
  const v = passwordSchema.parse(input);
  const alphabet = (["lower", "upper", "numbers", "symbols"] as const)
    .filter((k) => v[k])
    .map((k) => sets[k])
    .join("");
  if (!alphabet) throw new Error("Choose at least one character type.");
  return Array.from({ length: v.count }, () =>
    Array.from(
      { length: v.length },
      () => alphabet[randomIndex(alphabet.length)],
    ).join(""),
  ).join("\n");
}
