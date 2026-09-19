import { z } from "zod";
import { numeric } from "../shared";
export const compoundInterestSchema = z.object({
  principal: numeric.min(1).max(1e9),
  rate: numeric.min(0).max(50),
  years: numeric.min(0.1).max(60),
  frequency: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(4),
    z.literal(12),
    z.literal(365),
  ]),
});
export function compoundInterest(
  principal: number,
  rate: number,
  years: number,
  frequency: 1 | 2 | 4 | 12 | 365,
) {
  compoundInterestSchema.parse({ principal, rate, years, frequency });
  const r = rate / 100;
  const amount = principal * Math.pow(1 + r / frequency, frequency * years);
  if (!Number.isFinite(amount)) throw new Error("The result is too large.");
  return {
    "Maturity amount": amount,
    "Interest earned": amount - principal,
  };
}
