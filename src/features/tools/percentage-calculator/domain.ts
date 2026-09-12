import { z } from "zod";
import { numeric } from "../shared";
export const percentageSchema = z.object({
  a: numeric,
  b: numeric,
  mode: z.enum(["of", "is", "change"]),
});
export function percentage(a: number, b: number, mode: "of" | "is" | "change") {
  percentageSchema.parse({ a, b, mode });
  if ((mode === "is" && b === 0) || (mode === "change" && a === 0))
    throw new Error("The starting or total value cannot be zero.");
  const value =
    mode === "of"
      ? (a * b) / 100
      : mode === "is"
        ? (a / b) * 100
        : ((b - a) / Math.abs(a)) * 100;
  if (!Number.isFinite(value)) throw new Error("The result is too large.");
  return value;
}
