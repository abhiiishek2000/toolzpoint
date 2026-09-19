import { z } from "zod";
import { parseDate, addDays } from "../shared";
export const ovulationSchema = z.object({
  lastPeriod: z.string(),
  cycleLength: z.number().int().min(20).max(45),
});
export function ovulation(lastPeriod: string, cycleLength: number) {
  ovulationSchema.parse({ lastPeriod, cycleLength });
  const lmp = parseDate(lastPeriod);
  const ovulationDay = addDays(lmp, cycleLength - 14);
  const fertileStart = addDays(ovulationDay, -5);
  const fertileEnd = addDays(ovulationDay, 1);
  const nextPeriod = addDays(lmp, cycleLength);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return {
    "Estimated ovulation day": fmt(ovulationDay),
    "Fertile window start": fmt(fertileStart),
    "Fertile window end": fmt(fertileEnd),
    "Next expected period": fmt(nextPeriod),
  };
}
