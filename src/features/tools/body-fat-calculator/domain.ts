import { z } from "zod";
import { numeric } from "../shared";
export const bodyFatSchema = z.object({
  sex: z.enum(["male", "female"]),
  height: numeric.min(120).max(230),
  waist: numeric.min(40).max(200),
  neck: numeric.min(20).max(80),
  hip: numeric.min(40).max(200).optional(),
});
export function bodyFat(input: z.input<typeof bodyFatSchema>) {
  const v = bodyFatSchema.parse(input);
  let percent: number;
  if (v.sex === "male") {
    if (v.waist <= v.neck)
      throw new Error(
        "Waist measurement must be greater than neck measurement.",
      );
    percent =
      495 /
        (1.0324 -
          0.19077 * Math.log10(v.waist - v.neck) +
          0.15456 * Math.log10(v.height)) -
      450;
  } else {
    if (v.hip === undefined) throw new Error("Enter a hip measurement.");
    if (v.waist + v.hip <= v.neck)
      throw new Error("Waist plus hip must be greater than neck measurement.");
    percent =
      495 /
        (1.29579 -
          0.35004 * Math.log10(v.waist + v.hip - v.neck) +
          0.221 * Math.log10(v.height)) -
      450;
  }
  if (!Number.isFinite(percent) || percent < 2 || percent > 70)
    throw new Error(
      "These measurements give an implausible result. Double-check them in centimeters.",
    );
  const category =
    v.sex === "male"
      ? percent < 6
        ? "Essential fat"
        : percent < 14
          ? "Athletic"
          : percent < 18
            ? "Fitness"
            : percent < 25
              ? "Average"
              : "Above average"
      : percent < 14
        ? "Essential fat"
        : percent < 21
          ? "Athletic"
          : percent < 25
            ? "Fitness"
            : percent < 32
              ? "Average"
              : "Above average";
  return { "Body fat (%)": percent, Category: category };
}
