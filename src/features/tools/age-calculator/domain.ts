import { parseDate } from "../shared";
function anniversary(birth: Date, year: number) {
  const month = birth.getUTCMonth();
  const day = Math.min(
    birth.getUTCDate(),
    new Date(Date.UTC(year, month + 1, 0)).getUTCDate(),
  );
  return new Date(Date.UTC(year, month, day));
}
export function age(birth: string, asOf: string) {
  const b = parseDate(birth),
    d = parseDate(asOf);
  if (b > d)
    throw new Error("Birth date must be on or before the comparison date.");
  if (b.getUTCFullYear() < 1900)
    throw new Error("Use a birth date from 1900 onward.");
  let years = d.getUTCFullYear() - b.getUTCFullYear();
  if (anniversary(b, d.getUTCFullYear()) > d) years--;
  let cursor = anniversary(b, b.getUTCFullYear() + years);
  let months = 0;
  for (let i = 1; i <= 11; i++) {
    const year = cursor.getUTCFullYear();
    const month = cursor.getUTCMonth() + i;
    const next = new Date(
      Date.UTC(
        year,
        month,
        Math.min(
          b.getUTCDate(),
          new Date(Date.UTC(year, month + 1, 0)).getUTCDate(),
        ),
      ),
    );
    if (next > d) break;
    months = i;
  }
  const monthDate = new Date(
    Date.UTC(
      cursor.getUTCFullYear(),
      cursor.getUTCMonth() + months,
      Math.min(
        b.getUTCDate(),
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
  cursor = monthDate;
  let birthday = anniversary(b, d.getUTCFullYear());
  if (birthday < d) birthday = anniversary(b, d.getUTCFullYear() + 1);
  return {
    Years: years,
    Months: months,
    Days: Math.round((d.getTime() - cursor.getTime()) / 86400000),
    "Days until birthday": Math.round(
      (birthday.getTime() - d.getTime()) / 86400000,
    ),
  };
}
