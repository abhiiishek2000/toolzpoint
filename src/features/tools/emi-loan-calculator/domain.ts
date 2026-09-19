import { z } from "zod";
import { numeric } from "../shared";
export const emiSchema = z.object({
  principal: numeric.min(1).max(1e9),
  rate: numeric.min(0).max(50),
  years: numeric.min(1).max(40),
});
export function emiLoan(principal: number, rate: number, years: number) {
  emiSchema.parse({ principal, rate, years });
  const n = Math.round(years * 12);
  const r = rate / 12 / 100;
  const payment =
    r === 0
      ? principal / n
      : (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  if (!Number.isFinite(payment)) throw new Error("The result is too large.");
  const total = payment * n;
  return {
    "Monthly EMI": payment,
    "Total interest": total - principal,
    "Total payment": total,
  };
}
