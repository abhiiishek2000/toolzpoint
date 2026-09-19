import { z } from "zod";
import { numeric } from "../shared";
export const idealWeightSchema = z.object({
  height: numeric.min(140).max(230),
  sex: z.enum(["male", "female"]),
});
export function idealWeight(height: number, sex: "male" | "female") {
  idealWeightSchema.parse({ height, sex });
  const inchesOver5ft = (height - 152.4) / 2.54;
  const base = sex === "male" ? 50 : 45.5;
  const kg = base + 2.3 * inchesOver5ft;
  return {
    "Ideal weight (kg)": kg,
    "Ideal weight (lb)": kg / 0.45359237,
  };
}
