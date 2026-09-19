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
  const risk =
    sex === "male"
      ? ratio < 0.9
        ? "Low risk"
        : ratio < 1.0
          ? "Moderate risk"
          : "High risk"
      : ratio < 0.8
        ? "Low risk"
        : ratio < 0.85
          ? "Moderate risk"
          : "High risk";
  return { "Waist-to-hip ratio": ratio, "WHO risk category": risk };
}
