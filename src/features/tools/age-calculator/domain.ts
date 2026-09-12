function dateValue(s: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new Error("Enter a complete date.");
  const date = new Date(s + "T00:00:00Z");
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== s)
    throw new Error("Enter a valid calendar date.");
  return date;
}
function anniversary(birth: Date, year: number) {
  const month = birth.getUTCMonth();
  const day = Math.min(
    birth.getUTCDate(),
    new Date(Date.UTC(year, month + 1, 0)).getUTCDate(),
  );
  return new Date(Date.UTC(year, month, day));
}
export function age(birth: string, asOf: string) {
  const b = dateValue(birth),
    d = dateValue(asOf);
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
