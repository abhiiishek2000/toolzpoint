import { z } from "zod";
export function flipCoins(count: number, random: () => number = Math.random) {
  z.number().int().min(1).max(1000).parse(count);
  const flips = Array.from({ length: count }, () =>
    random() < 0.5 ? "Heads" : "Tails",
  );
  const heads = flips.filter((f) => f === "Heads").length;
  const result: Record<string, string | number> = {
    Heads: heads,
    Tails: count - heads,
  };
  if (count <= 20) result.Sequence = flips.join(", ");
  return result;
}
