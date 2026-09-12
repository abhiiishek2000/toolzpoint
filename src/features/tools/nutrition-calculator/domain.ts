import { z } from "zod";
import { numeric } from "../shared";
export const nutritionSchema = z
  .object({
    weight: numeric.min(30).max(300),
    height: numeric.min(120).max(230),
    age: numeric.int().min(18).max(100),
    sex: z.enum(["male", "female"]),
    activity: numeric.min(1.2).max(1.9),
    protein: numeric.min(10).max(35),
    fat: numeric.min(20).max(35),
  })
  .refine(
    (v) => 100 - v.protein - v.fat >= 45 && 100 - v.protein - v.fat <= 65,
    { message: "Choose a split with carbohydrate between 45% and 65%." },
  );
export function nutrition(input: z.input<typeof nutritionSchema>) {
  const v = nutritionSchema.parse(input);
  const resting =
    10 * v.weight + 6.25 * v.height - 5 * v.age + (v.sex === "male" ? 5 : -161);
  const calories = resting * v.activity;
  return {
    "Resting energy (kcal)": resting,
    "Daily energy (kcal)": calories,
    "Protein (g)": (calories * v.protein) / 100 / 4,
    "Fat (g)": (calories * v.fat) / 100 / 9,
    "Carbohydrate (g)": (calories * (100 - v.protein - v.fat)) / 100 / 4,
  };
}
