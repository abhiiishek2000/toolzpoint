import { z } from "zod";
import { parseDate, addDays, daysBetween } from "../shared";
export const pregnancySchema = z.object({
  lastPeriod: z.string(),
  cycleLength: z.number().int().min(20).max(45),
  asOf: z.string(),
});
export function pregnancyDueDate(
  lastPeriod: string,
  cycleLength: number,
  asOf: string,
) {
  pregnancySchema.parse({ lastPeriod, cycleLength, asOf });
  const lmp = parseDate(lastPeriod);
  const today = parseDate(asOf);
  if (lmp > today)
    throw new Error(
      "The first day of your last period must be on or before today.",
    );
  const gestationDays = daysBetween(lmp, today);
  if (gestationDays > 300)
    throw new Error(
      "That last period date is too far in the past for this estimate.",
    );
  const dueDate = addDays(lmp, 280 + (cycleLength - 28));
  const weeks = Math.floor(gestationDays / 7);
  const days = gestationDays % 7;
  const trimester =
    weeks < 13
      ? "1st trimester"
      : weeks < 27
        ? "2nd trimester"
        : "3rd trimester";
  return {
    "Estimated due date": dueDate.toISOString().slice(0, 10),
    "Weeks pregnant": weeks,
    "Days into that week": days,
    Trimester: trimester,
    "Days until due date": daysBetween(today, dueDate),
  };
}
