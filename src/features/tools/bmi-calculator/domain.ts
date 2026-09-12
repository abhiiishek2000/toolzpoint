import { z } from "zod";
import { numeric } from "../shared";
export const bmiSchema = z.object({
  weight: numeric.min(20).max(500),
  height: numeric.min(100).max(250),
  age: numeric.int().min(20).max(120),
});
export function bmi(weight: number, height: number, years: number) {
  bmiSchema.parse({ weight, height, age: years });
  const value = weight / (height / 100) ** 2;
  return {
    BMI: value,
    Category:
      value < 18.5
        ? "Underweight"
        : value < 25
          ? "Healthy weight"
          : value < 30
            ? "Overweight"
            : "Obesity",
  };
}
