import { z } from "zod";
import { numeric } from "../shared";
export const waterIntakeSchema = z.object({
  weight: numeric.min(20).max(300),
  activity: z.enum(["sedentary", "moderate", "active"]),
});
const multipliers = { sedentary: 1, moderate: 1.1, active: 1.2 } as const;
export function waterIntake(
  weight: number,
  activity: "sedentary" | "moderate" | "active",
) {
  waterIntakeSchema.parse({ weight, activity });
  const totalMl = weight * 35 * multipliers[activity];
  return {
    "Daily water (liters)": totalMl / 1000,
    "Daily water (250ml glasses)": totalMl / 250,
  };
}
