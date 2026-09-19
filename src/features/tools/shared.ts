import { z } from "zod";
export const textSchema = z
  .string()
  .max(100000, "Use at most 100,000 characters.");
export const numeric = z.number().finite();
export function parseDate(s: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new Error("Enter a complete date.");
  const date = new Date(s + "T00:00:00Z");
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== s)
    throw new Error("Enter a valid calendar date.");
  return date;
}
export function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 86400000);
}
export function daysBetween(start: Date, end: Date) {
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}
