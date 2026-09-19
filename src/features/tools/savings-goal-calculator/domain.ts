import { z } from "zod";
import { numeric } from "../shared";
export const savingsGoalSchema = z.object({
  goal: numeric.min(1).max(1e10),
  current: numeric.min(0).max(1e10),
  months: numeric.int().min(1).max(600),
  rate: numeric.min(0).max(50),
});
export function savingsGoal(
  goal: number,
  current: number,
  months: number,
  rate: number,
): Record<string, number> {
  savingsGoalSchema.parse({ goal, current, months, rate });
  if (current >= goal)
    return {
      "Monthly deposit needed": 0,
      "Already funded by": current - goal,
    };
  const r = rate / 1200;
  const monthly =
    r === 0
      ? (goal - current) / months
      : (goal - current * Math.pow(1 + r, months)) /
        ((Math.pow(1 + r, months) - 1) / r);
  if (!Number.isFinite(monthly) || monthly < 0)
    throw new Error(
      "Your current savings and growth already exceed this goal within the timeframe.",
    );
  return { "Monthly deposit needed": monthly };
}
