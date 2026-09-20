import { z } from "zod";
import { numeric } from "../shared";
export const waistHipSchema = z.object({
  sex: z.enum(["male", "female"]),
  waist: numeric.min(40).max(200),
  hip: numeric.min(40).max(200),
});
export function waistHipRatio(
  sex: "male" | "female",
  waist: number,
  hip: number,
) {
  waistHipSchema.parse({ sex, waist, hip });
  const ratio = waist / hip;
  const threshold = sex === "male" ? 0.9 : 0.85;
  return {
    "Waist-to-hip ratio": ratio,
    "Reference threshold": threshold,
    "Screening reference":
      ratio >= threshold
        ? "At or above the increased-risk threshold"
        : "Below the increased-risk threshold",
  };
}
