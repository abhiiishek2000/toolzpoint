import { z } from "zod";
import { numeric } from "../shared";
export const sipSchema = z.object({
  monthly: numeric.min(1).max(1e8),
  rate: numeric.min(0).max(50),
  years: numeric.int().min(1).max(50),
  timing: z.enum(["start", "end"]),
});
export function sip(
  monthly: number,
  rate: number,
  years: number,
  timing: "start" | "end" = "start",
) {
  sipSchema.parse({ monthly, rate, years, timing });
  const n = years * 12,
    r = rate / 1200;
  const invested = monthly * n;
  const total =
    r === 0
      ? invested
      : ((monthly * Math.expm1(n * Math.log1p(r))) / r) *
        (timing === "start" ? 1 + r : 1);
  return {
    "Invested amount": invested,
    "Estimated returns": total - invested,
    "Estimated total": total,
  };
}
