import { parseDate, daysBetween } from "../shared";
function anniversary(base: Date, year: number) {
  const month = base.getUTCMonth();
  const day = Math.min(
    base.getUTCDate(),
    new Date(Date.UTC(year, month + 1, 0)).getUTCDate(),
  );
  return new Date(Date.UTC(year, month, day));
}
export function dateDifference(start: string, end: string) {
  const s = parseDate(start),
    e = parseDate(end);
  if (s > e)
    throw new Error("The start date must be on or before the end date.");
  const totalDays = daysBetween(s, e);
  let years = e.getUTCFullYear() - s.getUTCFullYear();
  if (anniversary(s, e.getUTCFullYear()) > e) years--;
  let cursor = anniversary(s, s.getUTCFullYear() + years);
  let months = 0;
  for (let i = 1; i <= 11; i++) {
    const year = cursor.getUTCFullYear();
    const month = cursor.getUTCMonth() + i;
    const next = new Date(
      Date.UTC(
        year,
        month,
        Math.min(
          s.getUTCDate(),
          new Date(Date.UTC(year, month + 1, 0)).getUTCDate(),
        ),
      ),
    );
    if (next > e) break;
    months = i;
  }
  cursor = new Date(
    Date.UTC(
      cursor.getUTCFullYear(),
      cursor.getUTCMonth() + months,
      Math.min(
        s.getUTCDate(),
        new Date(
          Date.UTC(
            cursor.getUTCFullYear(),
            cursor.getUTCMonth() + months + 1,
            0,
          ),
        ).getUTCDate(),
      ),
    ),
  );
  return {
    Years: years,
    Months: months,
    Days: daysBetween(cursor, e),
    "Total days": totalDays,
    "Total weeks": Math.floor(totalDays / 7),
  };
}
