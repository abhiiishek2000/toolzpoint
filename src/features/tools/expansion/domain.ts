import { timezoneOptions } from "./timezones";
import { textSchema, parseDate, addDays, daysBetween } from "../shared";
import { nutrition } from "../nutrition-calculator/domain";
import { emiLoan } from "../emi-loan-calculator/domain";
import { compoundInterest } from "../compound-interest-calculator/domain";

export const unitFactors: Record<string, Record<string, number>> = {
  "weight-converter": {
    kg: 1,
    g: 0.001,
    lb: 0.45359237,
    oz: 0.028349523125,
    stone: 6.35029318,
  },
  "length-converter": {
    m: 1,
    cm: 0.01,
    mm: 0.001,
    km: 1000,
    inch: 0.0254,
    ft: 0.3048,
    mile: 1609.344,
  },
  "speed-converter": {
    "m/s": 1,
    "km/h": 1 / 3.6,
    mph: 0.44704,
    knot: 1852 / 3600,
  },
  "data-storage-converter": {
    B: 1,
    bit: 1 / 8,
    KB: 1e3,
    MB: 1e6,
    GB: 1e9,
    TB: 1e12,
    KiB: 1024,
    MiB: 1024 ** 2,
    GiB: 1024 ** 3,
    TiB: 1024 ** 4,
  },
  "volume-converter": {
    L: 1,
    mL: 0.001,
    "US gal": 3.785411784,
    "US qt": 0.946352946,
    "US cup": 0.2365882365,
    "US fl oz": 0.0295735295625,
    "UK gal": 4.54609,
    "m³": 1000,
  },
  "area-converter": {
    "m²": 1,
    "km²": 1e6,
    "cm²": 0.0001,
    "ft²": 0.09290304,
    acre: 4046.8564224,
    hectare: 10000,
    "mile²": 2589988.110336,
  },
};
export const expansionSlugs = [
  ...Object.keys(unitFactors),
  "number-base-converter",
  "binary-text-converter",
  "url-parser",
  "timestamp-converter",
  "json-to-csv-converter",
  "tip-calculator",
  "average-calculator",
  "ratio-calculator",
  "simple-interest-calculator",
  "roi-calculator",
  "break-even-calculator",
  "bmr-calculator",
  "macro-calculator",
  "sleep-cycle-calculator",
  "calories-burned-calculator",
  "sitemap-generator",
  "hashtag-generator",
  "pin-code-generator",
  "dice-roller",
  "random-number-generator",
  "random-name-picker",
  "receipt-maker",
  "mortgage-calculator",
  "fd-calculator",
  "rd-calculator",
  "inflation-calculator",
  "net-worth-calculator",
  "gpa-calculator",
  "quadratic-equation-solver",
  "work-hours-calculator",
  "timezone-converter",
  "roman-numeral-converter",
  "open-graph-preview-generator",
  "social-media-character-counter",
  "password-strength-checker",
  "lottery-number-generator",
  "business-days-calculator",
  "countdown-timer",
  "cagr-calculator",
  "sales-tax-calculator",
  "color-converter",
  "reading-time-calculator",
  "text-diff-checker",
  "dog-age-calculator",
  "magic-8-ball",
  "love-calculator",
];
export function secureIndex(size: number): number {
  if (!Number.isSafeInteger(size) || size < 1 || size > 2 ** 32)
    throw new Error("Invalid random range.");
  const ceiling = 2 ** 32 - (2 ** 32 % size);
  for (let attempt = 0; attempt < 1000; attempt++) {
    const sample = crypto.getRandomValues(new Uint32Array(1))[0]!;
    if (sample < ceiling) return sample % size;
  }
  throw new Error("Random generation failed. Please try again.");
}
const xml = (s: string) =>
  s.replace(
    /[<>&"']/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[c]!,
  );
function httpUrl(raw: string) {
  if (raw.length > 2048)
    throw new Error("Use URLs of at most 2,048 characters.");
  const url = new URL(raw);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password
  )
    throw new Error("Use an HTTP(S) URL without embedded credentials.");
  return url;
}
const ROMAN_TABLE: [number, string][] = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];
function toRomanNumeral(n: number) {
  let remaining = n;
  let result = "";
  for (const [value, symbol] of ROMAN_TABLE) {
    while (remaining >= value) {
      result += symbol;
      remaining -= value;
    }
  }
  return result;
}
export { timezoneOptions } from "./timezones";

// Finds the UTC instant that displays as `dateStr`/`timeStr` in `zone`. Uses
// Intl.DateTimeFormat.formatToParts and Date.UTC exclusively (never
// `new Date(someLocaleString)`, whose parsing depends on the host's own
// local time zone) so the result is correct regardless of where this code
// runs — the browser, a server, or a test runner in any time zone.
function zonedToUtc(dateStr: string, timeStr: string, zone: string) {
  const naive = new Date(`${dateStr}T${timeStr}:00Z`);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(naive);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );
  return new Date(naive.getTime() - (asUtc - naive.getTime()));
}
export function runExpansion(
  slug: string,
  raw: string,
  values: Record<string, string>,
  randomIndex = secureIndex,
): string | Record<string, string | number> {
  const input = textSchema.parse(raw);
  const str = (key: string) => textSchema.parse(values[key] ?? "");
  const num = (key: string, min = 0, max = 1e12, integer = false) => {
    const text = str(key);
    const n = Number(text);
    if (
      !text.trim() ||
      !Number.isFinite(n) ||
      n < min ||
      n > max ||
      (integer && !Number.isInteger(n))
    )
      throw new Error(
        `Enter ${key} between ${min} and ${max}${integer ? " (whole numbers only)" : ""}.`,
      );
    return n;
  };
  const option = (key: string, allowed: string[]) => {
    const value = str(key);
    if (!allowed.includes(value)) throw new Error(`Choose a valid ${key}.`);
    return value;
  };
  const factors = unitFactors[slug];
  if (factors) {
    const from = option("from", Object.keys(factors)),
      to = option("to", Object.keys(factors));
    return {
      [`Result (${to})`]: (num("value") * factors[from]!) / factors[to]!,
    };
  }
  switch (slug) {
    case "number-base-converter": {
      const from = num("from", 2, 36, true),
        to = num("to", 2, 36, true);
      const digits = input.trim().toLowerCase();
      if (!/^-?[0-9a-z]{1,256}$/.test(digits))
        throw new Error(
          "Enter up to 256 digits, with an optional minus sign and no base prefix.",
        );
      let n = 0n;
      for (const c of digits.replace(/^-/, "")) {
        const d = parseInt(c, 36);
        if (d >= from)
          throw new Error(`Digit ${c} is invalid in base ${from}.`);
        n = n * BigInt(from) + BigInt(d);
      }
      return (digits.startsWith("-") ? -n : n).toString(to).toUpperCase();
    }
    case "binary-text-converter": {
      if (option("mode", ["encode", "decode"]) === "encode")
        return Array.from(new TextEncoder().encode(input), (b) =>
          b.toString(2).padStart(8, "0"),
        ).join(" ");
      const bits = input.replace(/\s/g, "");
      if (!/^[01]*$/.test(bits) || bits.length % 8)
        throw new Error("Use complete 8-bit bytes containing only 0 and 1.");
      try {
        return new TextDecoder("utf-8", { fatal: true }).decode(
          Uint8Array.from(bits.match(/.{8}/g) ?? [], (b) => parseInt(b, 2)),
        );
      } catch {
        throw new Error("These bytes are not valid UTF-8 text.");
      }
    }
    case "url-parser": {
      const url = httpUrl(input.trim());
      return {
        Scheme: url.protocol,
        Host: url.hostname,
        Port: url.port || "Default",
        Path: url.pathname,
        Query: url.search || "None",
        Fragment: url.hash || "None",
      };
    }
    case "timestamp-converter": {
      if (option("mode", ["seconds", "milliseconds", "iso"]) === "iso") {
        if (
          !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(
            input.trim(),
          )
        )
          throw new Error(
            "Use a UTC ISO timestamp such as 2026-01-01T00:00:00Z.",
          );
        parseDate(input.trim().slice(0, 10));
        const n = Date.parse(input.trim());
        if (
          !Number.isFinite(n) ||
          new Date(n).toISOString().slice(0, 19) !== input.trim().slice(0, 19)
        )
          throw new Error("Enter a valid UTC time.");
        return { "Unix seconds": n / 1000, "Unix milliseconds": n };
      }
      if (!/^-?\d{1,15}$/.test(input.trim()))
        throw new Error("Enter an integer timestamp.");
      const ms = Number(input.trim()) * (values.mode === "seconds" ? 1000 : 1);
      if (Math.abs(ms) > 8640000000000000)
        throw new Error("Timestamp is outside the supported date range.");
      return new Date(ms).toISOString();
    }
    case "json-to-csv-converter": {
      const rows: unknown = JSON.parse(input);
      if (
        !Array.isArray(rows) ||
        rows.length < 1 ||
        rows.length > 1000 ||
        rows.some((r) => !r || typeof r !== "object" || Array.isArray(r))
      )
        throw new Error("Use an array of 1–1,000 flat objects.");
      const headers = [...new Set(rows.flatMap((r) => Object.keys(r)))];
      if (!headers.length || headers.length > 100)
        throw new Error("Use 1–100 distinct columns.");
      const cell = (v: unknown) => {
        if (v !== null && typeof v === "object")
          throw new Error("Nested objects and arrays are not supported.");
        let text = v === null || v === undefined ? "" : String(v);
        if (/^[\s]*[=+@-]/u.test(text) || /^[\t\r\n]/.test(text))
          text = "'" + text;
        return '"' + text.replace(/"/g, '""') + '"';
      };
      const result = [
        headers.map(cell).join(","),
        ...rows.map((r) =>
          headers.map((h) => cell(Object.hasOwn(r, h) ? r[h] : null)).join(","),
        ),
      ].join("\r\n");
      if (result.length > 1000000)
        throw new Error("CSV output exceeds 1,000,000 characters.");
      return result;
    }
    case "tip-calculator": {
      const bill = num("bill"),
        tip = (bill * num("tip", 0, 100)) / 100,
        people = num("people", 1, 1000, true);
      return {
        Tip: tip,
        Total: bill + tip,
        "Per person": (bill + tip) / people,
      };
    }
    case "average-calculator": {
      const parts = input.trim().split(/[\s,]+/);
      if (!input.trim() || parts.length > 10000)
        throw new Error(
          "Enter 1–10,000 numbers separated by spaces or commas.",
        );
      const ns = parts.map((p) => Number(p));
      if (
        parts.some((p) => !p) ||
        ns.some((n) => !Number.isFinite(n) || Math.abs(n) > 1e12)
      )
        throw new Error(
          "Use finite numbers between -1 trillion and 1 trillion.",
        );
      ns.sort((a, b) => a - b);
      const middle = Math.floor(ns.length / 2);
      return {
        Count: ns.length,
        Mean: ns.reduce((a, b) => a + b, 0) / ns.length,
        Median:
          ns.length % 2 ? ns[middle]! : (ns[middle - 1]! + ns[middle]!) / 2,
        Minimum: ns[0]!,
        Maximum: ns[ns.length - 1]!,
      };
    }
    case "ratio-calculator": {
      const a = num("a", 0, 1e9, true),
        b = num("b", 0, 1e9, true);
      if (!a && !b)
        throw new Error("At least one side must be greater than zero.");
      let x = a,
        y = b;
      while (y) [x, y] = [y, x % y];
      return { "Simplified ratio": `${a / x}:${b / x}` };
    }
    case "simple-interest-calculator": {
      const principal = num("principal"),
        interest =
          ((principal * num("rate", 0, 100)) / 100) * num("years", 0, 100);
      return { Interest: interest, "Final amount": principal + interest };
    }
    case "roi-calculator": {
      const cost = num("cost", 0.01),
        proceeds = num("proceeds");
      return {
        "Net gain": proceeds - cost,
        "ROI (%)": ((proceeds - cost) / cost) * 100,
      };
    }
    case "break-even-calculator": {
      const fixed = num("fixed"),
        price = num("price", 0.01),
        variable = num("variable");
      if (price <= variable)
        throw new Error("Price must exceed variable cost per unit.");
      const cents = (value: number) => {
        if (Number(value.toFixed(2)) !== value)
          throw new Error("Use amounts with at most two decimal places.");
        return Math.round(value * 100);
      };
      const units = Math.ceil(cents(fixed) / (cents(price) - cents(variable)));
      return {
        "Whole units to break even": units,
        "Revenue at those units": units * price,
      };
    }
    case "bmr-calculator": {
      const sex = option("sex", ["male", "female"]) as "male" | "female";
      const result = nutrition({
        weight: num("weight", 30, 300),
        height: num("height", 120, 230),
        age: num("age", 18, 100, true),
        sex,
        activity: 1.2,
        protein: 20,
        fat: 30,
      });
      return {
        "Estimated resting energy (kcal/day)": result["Resting energy (kcal)"],
      };
    }
    case "macro-calculator": {
      const calories = num("calories", 800, 10000);
      const protein = num("protein", 0, 100);
      const fat = num("fat", 0, 100);
      if (protein + fat > 100)
        throw new Error("Protein % and fat % must not exceed 100 combined.");
      return {
        "Protein (g)": (calories * protein) / 100 / 4,
        "Fat (g)": (calories * fat) / 100 / 9,
        "Carbohydrate (g)": (calories * (100 - protein - fat)) / 100 / 4,
      };
    }
    case "sleep-cycle-calculator": {
      const direction = option("direction", ["wake", "sleep"]);
      const time = str("time");
      const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
      if (!match) throw new Error("Enter a valid 24-hour time.");
      const base = Number(match[1]) * 60 + Number(match[2]);
      const FALL_ASLEEP = 14;
      const CYCLE = 90;
      const result: Record<string, string> = {};
      for (const cycles of [6, 5, 4, 3]) {
        const total = cycles * CYCLE + FALL_ASLEEP;
        const target =
          (((direction === "wake" ? base - total : base + total) % 1440) +
            1440) %
          1440;
        const hh = Math.floor(target / 60)
          .toString()
          .padStart(2, "0");
        const mm = (target % 60).toString().padStart(2, "0");
        const label = `${cycles} cycles (${((cycles * CYCLE) / 60).toFixed(1)}h sleep)`;
        result[label] = `${hh}:${mm}`;
      }
      return result;
    }
    case "calories-burned-calculator": {
      const met: Record<string, number> = {
        "walking-3mph": 3.5,
        "walking-4mph": 5.0,
        "running-5mph": 8.3,
        "running-6mph": 9.8,
        "running-8mph": 11.8,
        "cycling-leisure": 4.0,
        "cycling-moderate": 8.0,
        "swimming-moderate": 6.0,
        yoga: 2.5,
        "weight-training": 6.0,
        "jump-rope": 11.8,
        dancing: 4.8,
        hiking: 6.0,
      };
      const activity = option("activity", Object.keys(met));
      const weight = num("weight", 30, 300);
      const minutes = num("minutes", 1, 600);
      return {
        "Calories burned (kcal)": met[activity]! * weight * (minutes / 60),
        "MET value used": met[activity]!,
      };
    }
    case "sitemap-generator": {
      const lines = input
        .trim()
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (!lines.length || lines.length > 1000)
        throw new Error("Enter 1–1,000 HTTP(S) URLs, one per line.");
      const urls = [...new Set(lines.map((s) => httpUrl(s).href))];
      if (
        new Set(urls.map((s) => new URL(s).origin)).size !== 1 ||
        urls.some((s) => new URL(s).hash)
      )
        throw new Error("Use one origin and remove URL fragments.");
      return (
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        urls.map((s) => `  <url><loc>${xml(s)}</loc></url>`).join("\n") +
        "\n</urlset>"
      );
    }
    case "hashtag-generator": {
      const tags = [
        ...new Set(
          input
            .split(/[\s,]+/u)
            .map((t) => t.replace(/^#+/, "").replace(/[^\p{L}\p{N}_]/gu, ""))
            .filter(Boolean),
        ),
      ];
      if (tags.length > 1000) throw new Error("Use at most 1,000 tags.");
      if (!tags.length) throw new Error("Enter at least one word or hashtag.");
      return {
        Hashtags: tags.map((t) => "#" + t).join(" "),
        Count: tags.length,
      };
    }
    case "pin-code-generator": {
      const length = num("length", 4, 12, true),
        count = num("count", 1, 20, true);
      return Array.from({ length: count }, () =>
        Array.from({ length }, () => randomIndex(10)).join(""),
      ).join("\n");
    }
    case "dice-roller": {
      const count = num("count", 1, 100, true),
        sides = num("sides", 2, 1000, true);
      const rolls = Array.from({ length: count }, () => randomIndex(sides) + 1);
      return {
        Rolls: rolls.join(", "),
        Total: rolls.reduce((a, b) => a + b, 0),
      };
    }
    case "random-number-generator": {
      const min = num("min", -1e9, 1e9, true),
        max = num("max", -1e9, 1e9, true),
        count = num("count", 1, 100, true);
      if (max < min) throw new Error("Maximum must be at least the minimum.");
      return Array.from({ length: count }, () =>
        String(min + randomIndex(max - min + 1)),
      ).join("\n");
    }
    case "random-name-picker": {
      const names = input
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (
        !names.length ||
        names.length > 1000 ||
        names.some((s) => s.length > 200)
      )
        throw new Error(
          "Enter 1–1,000 names (up to 200 characters each), one per line.",
        );
      return names[randomIndex(names.length)]!;
    }
    case "receipt-maker": {
      const field = (key: string) => {
        const value = str(key).trim();
        if (!value || value.length > 200 || /[\r\n\x00-\x1f]/.test(value))
          throw new Error(`Enter ${key} as a single line of 1–200 characters.`);
        return value;
      };
      const date = field("date");
      parseDate(date);
      const currency = option("currency", ["INR", "USD", "EUR", "GBP"]);
      return `PAYMENT RECEIPT\nReceipt: ${field("reference")}\nDate: ${date}\nReceived from: ${field("payer")}\nReceived by: ${field("payee")}\nFor: ${field("description")}\nAmount: ${currency} ${num("amount", 0.01).toFixed(2)}\nPayment method: ${field("method")}\n\nDraft only — verify payment and details before issuing.`;
    }
    case "mortgage-calculator": {
      const price = num("price", 1);
      const down = num("down", 0);
      if (down >= price)
        throw new Error("Down payment must be less than the home price.");
      const loanAmount = price - down;
      const rate = num("rate", 0, 50);
      const years = num("years", 1, 40);
      const { "Monthly EMI": principalAndInterest } = emiLoan(
        loanAmount,
        rate,
        years,
      );
      const taxAndInsurance =
        num("tax", 0, 1e7) / 12 + num("insurance", 0, 1e7) / 12;
      return {
        "Loan amount": loanAmount,
        "Monthly principal & interest": principalAndInterest,
        "Monthly tax & insurance": taxAndInsurance,
        "Total monthly payment": principalAndInterest + taxAndInsurance,
      };
    }
    case "fd-calculator": {
      const principal = num("principal", 1);
      const rate = num("rate", 0, 50);
      const years = num("years", 0.1, 60);
      return compoundInterest(principal, rate, years, 4);
    }
    case "rd-calculator": {
      const monthly = num("monthly", 1);
      const rate = num("rate", 0, 50);
      const months = num("months", 1, 600, true);
      const quarterlyRate = rate / 100 / 4;
      let balance = 0;
      for (let m = 1; m <= months; m++) {
        balance += monthly;
        if (m % 3 === 0) balance *= 1 + quarterlyRate;
      }
      const invested = monthly * months;
      return {
        "Maturity amount": balance,
        "Total invested": invested,
        "Interest earned": balance - invested,
      };
    }
    case "inflation-calculator": {
      const amount = num("amount", 0.01);
      const rate = num("rate", 0, 100);
      const years = num("years", 0, 100);
      const future = amount * Math.pow(1 + rate / 100, years);
      return {
        "Future equivalent value": future,
        "Additional amount needed": future - amount,
        "Purchasing power in today’s money":
          amount / Math.pow(1 + rate / 100, years),
      };
    }
    case "net-worth-calculator": {
      const parseList = (key: string) => {
        const lines = str(key)
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        if (lines.length > 200)
          throw new Error(`Use at most 200 ${key} lines.`);
        let total = 0;
        for (const line of lines) {
          const idx = line.lastIndexOf(",");
          if (
            idx === -1 ||
            !line.slice(0, idx).trim() ||
            !line.slice(idx + 1).trim()
          )
            throw new Error(`Use "label, amount" for each ${key} line.`);
          const amount = Number(line.slice(idx + 1).trim());
          if (!Number.isFinite(amount) || amount < 0 || amount > 1e12)
            throw new Error(`Invalid amount in "${line}".`);
          total += amount;
        }
        return total;
      };
      const assets = parseList("assets");
      const liabilities = parseList("liabilities");
      return {
        "Total assets": assets,
        "Total liabilities": liabilities,
        "Net worth": assets - liabilities,
      };
    }
    case "gpa-calculator": {
      const scale: Record<string, number> = {
        "A+": 4.0,
        A: 4.0,
        "A-": 3.7,
        "B+": 3.3,
        B: 3.0,
        "B-": 2.7,
        "C+": 2.3,
        C: 2.0,
        "C-": 1.7,
        "D+": 1.3,
        D: 1.0,
        "D-": 0.7,
        F: 0.0,
      };
      const lines = input
        .trim()
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      if (!lines.length || lines.length > 60)
        throw new Error('Enter 1–60 lines as "Grade,Credits".');
      let points = 0,
        credits = 0;
      for (const line of lines) {
        const parts = line.split(",");
        if (parts.length !== 2)
          throw new Error(`Use "Grade,Credits" for "${line}".`);
        const grade = parts[0]!.trim().toUpperCase();
        const credit = Number(parts[1]!.trim());
        const gradePoints = scale[grade];
        if (gradePoints === undefined)
          throw new Error(`Unknown grade "${parts[0]!.trim()}".`);
        if (!Number.isFinite(credit) || credit <= 0 || credit > 20)
          throw new Error(`Invalid credits in "${line}".`);
        points += gradePoints * credit;
        credits += credit;
      }
      return { GPA: points / credits, "Total credits": credits };
    }
    case "quadratic-equation-solver": {
      const a = num("a", -1e9, 1e9);
      if (a === 0)
        throw new Error(
          "Coefficient a must not be zero for a quadratic equation.",
        );
      const b = num("b", -1e9, 1e9);
      const c = num("c", -1e9, 1e9);
      const discriminant = b * b - 4 * a * c;
      const round = (n: number) => Math.round(n * 10000) / 10000;
      if (discriminant > 0) {
        const sq = Math.sqrt(discriminant);
        const q = -0.5 * (b + (b >= 0 ? sq : -sq));
        return {
          "Root 1": b >= 0 ? c / q : q / a,
          "Root 2": b >= 0 ? q / a : c / q,
          Discriminant: discriminant,
        };
      }
      if (discriminant === 0) return { Root: -b / (2 * a), Discriminant: 0 };
      const real = round(-b / (2 * a));
      const imag = round(Math.sqrt(-discriminant) / (2 * Math.abs(a)));
      return {
        "Root 1": `${real} + ${imag}i`,
        "Root 2": `${real} - ${imag}i`,
        Discriminant: discriminant,
      };
    }
    case "work-hours-calculator": {
      const lines = input
        .trim()
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      if (!lines.length || lines.length > 31)
        throw new Error(
          'Enter 1–31 lines as "start,end" or "start,end,break minutes".',
        );
      const toMinutes = (t: string) => {
        const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(t);
        if (!m) throw new Error(`"${t}" is not a valid 24-hour time.`);
        return Number(m[1]) * 60 + Number(m[2]);
      };
      let totalMinutes = 0;
      for (const line of lines) {
        const parts = line.split(",").map((p) => p.trim());
        if (parts.length < 2 || parts.length > 3)
          throw new Error(
            `Use "start,end" or "start,end,break minutes" for "${line}".`,
          );
        const start = toMinutes(parts[0]!);
        let end = toMinutes(parts[1]!);
        if (end <= start) end += 24 * 60;
        const brk = parts[2] ? Number(parts[2]) : 0;
        if (!Number.isFinite(brk) || brk < 0 || brk > 720)
          throw new Error(`Invalid break minutes in "${line}".`);
        const worked = end - start - brk;
        if (worked < 0)
          throw new Error(`Break time exceeds shift length in "${line}".`);
        totalMinutes += worked;
      }
      return {
        "Total hours": totalMinutes / 60,
        "Total shifts": lines.length,
      };
    }
    case "timezone-converter": {
      const date = str("date").trim();
      parseDate(date);
      const time = str("time").trim();
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))
        throw new Error("Enter a valid 24-hour time.");
      const from = option("from", timezoneOptions);
      const to = option("to", timezoneOptions);
      const utc = zonedToUtc(date, time, from);
      if (!Number.isFinite(utc.getTime()))
        throw new Error("Enter a valid date and time.");
      const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: to,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).formatToParts(utc);
      const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
      return {
        [`Time in ${to}`]: `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}`,
      };
    }
    case "roman-numeral-converter": {
      const mode = option("mode", ["to-roman", "to-number"]);
      if (mode === "to-roman") {
        const n = Number(input.trim());
        if (!Number.isInteger(n) || n < 1 || n > 3999)
          throw new Error("Enter a whole number between 1 and 3999.");
        return toRomanNumeral(n);
      }
      const roman = input.trim().toUpperCase();
      if (!/^[MDCLXVI]+$/.test(roman))
        throw new Error(
          "Enter a valid Roman numeral using only M, D, C, L, X, V, I.",
        );
      const values: Record<string, number> = {
        M: 1000,
        D: 500,
        C: 100,
        L: 50,
        X: 10,
        V: 5,
        I: 1,
      };
      let total = 0;
      for (let i = 0; i < roman.length; i++) {
        const current = values[roman[i]!]!;
        const next = values[roman[i + 1] ?? ""] ?? 0;
        total += current < next ? -current : current;
      }
      if (total > 3999 || toRomanNumeral(total) !== roman)
        throw new Error("This isn't a valid Roman numeral.");
      return String(total);
    }
    case "open-graph-preview-generator": {
      const title = str("title").trim();
      if (!title || title.length > 200)
        throw new Error("Enter a title of 1–200 characters.");
      const description = str("description").trim();
      if (description.length > 500)
        throw new Error("Keep the description to at most 500 characters.");
      const url = httpUrl(str("url").trim());
      const truncate = (text: string, max: number) =>
        text.length > max ? text.slice(0, max - 1).trimEnd() + "…" : text;
      return {
        "Title (as shown, ~60 chars)": truncate(title, 60),
        "Description (as shown, ~155 chars)":
          truncate(description, 155) || "No description",
        "Display link": url.hostname,
      };
    }
    case "social-media-character-counter": {
      const limits: Record<string, number> = {
        x: 280,
        threads: 500,
        instagram: 2200,
        linkedin: 3000,
        facebook: 63206,
      };
      const platform = option("platform", Object.keys(limits));
      const limit = limits[platform]!;
      const count = [...input].length;
      return { Characters: count, Limit: limit, Remaining: limit - count };
    }
    case "password-strength-checker": {
      if (!input) throw new Error("Enter a password to check.");
      if (input.length > 1024)
        throw new Error("Use at most 1,024 characters for a password check.");
      let pool = 0;
      if (/[a-z]/.test(input)) pool += 26;
      if (/[A-Z]/.test(input)) pool += 26;
      if (/[0-9]/.test(input)) pool += 10;
      if (/[^a-zA-Z0-9]/.test(input)) pool += 33;
      const entropy = pool > 0 ? input.length * Math.log2(pool) : 0;
      const predictable =
        /password|qwerty|123456|letmein|admin/i.test(input) ||
        /^(.*?)\1{2,}$/u.test(input);
      const label =
        predictable || entropy < 28
          ? "Weak"
          : entropy < 36
            ? "Fair"
            : entropy < 60
              ? "Good"
              : "Strong";
      return {
        Strength: label,
        "Estimated entropy (bits)": entropy,
        Length: input.length,
      };
    }
    case "lottery-number-generator": {
      const mainCount = num("mainCount", 1, 20, true);
      const mainMax = num("mainMax", mainCount, 200, true);
      const bonusCount = num("bonusCount", 0, 10, true);
      const bonusMax =
        bonusCount > 0 ? num("bonusMax", bonusCount, 200, true) : 0;
      const drawUnique = (count: number, max: number) => {
        const pool = Array.from({ length: max }, (_, i) => i + 1);
        const picked: number[] = [];
        for (let i = 0; i < count; i++) {
          const idx = randomIndex(pool.length);
          picked.push(pool[idx]!);
          pool.splice(idx, 1);
        }
        return picked.sort((a, b) => a - b);
      };
      const result: Record<string, string> = {
        "Main numbers": drawUnique(mainCount, mainMax).join(", "),
      };
      if (bonusCount > 0)
        result["Bonus numbers"] = drawUnique(bonusCount, bonusMax).join(", ");
      return result;
    }
    case "business-days-calculator": {
      const start = parseDate(str("start").trim());
      const end = parseDate(str("end").trim());
      const totalDays = daysBetween(start, end);
      if (totalDays < 0)
        throw new Error("End date must be on or after the start date.");
      if (totalDays > 36500)
        throw new Error("Use a range of at most 100 years.");
      const holidayLines = str("holidays")
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (holidayLines.length > 366)
        throw new Error("Use at most 366 holiday dates.");
      const holidays = new Set(
        holidayLines.map((d) => {
          parseDate(d);
          return d;
        }),
      );
      let businessDays = 0;
      let holidaysExcluded = 0;
      for (let i = 0; i <= totalDays; i++) {
        const day = addDays(start, i);
        const weekday = day.getUTCDay();
        if (weekday === 0 || weekday === 6) continue;
        if (holidays.has(day.toISOString().slice(0, 10))) {
          holidaysExcluded++;
          continue;
        }
        businessDays++;
      }
      return {
        "Business days": businessDays,
        "Holidays excluded": holidaysExcluded,
        "Total calendar days": totalDays + 1,
      };
    }
    case "countdown-timer": {
      const toUtcMs = (dateKey: string, timeKey: string) => {
        const time = str(timeKey).trim();
        const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
        if (!match) throw new Error("Enter a valid 24-hour time.");
        const day = parseDate(str(dateKey).trim());
        return (
          day.getTime() + (Number(match[1]) * 60 + Number(match[2])) * 60000
        );
      };
      const fromMs = toUtcMs("fromDate", "fromTime");
      const targetMs = toUtcMs("targetDate", "targetTime");
      const diffMs = targetMs - fromMs;
      if (Math.abs(diffMs) > 100 * 365 * 86400000)
        throw new Error("Use two moments within 100 years of each other.");
      const totalSeconds = Math.floor(Math.abs(diffMs) / 1000);
      return {
        Direction:
          diffMs === 0
            ? "Same moment"
            : diffMs > 0
              ? "Time remaining until target"
              : "Time elapsed since target",
        Days: Math.floor(totalSeconds / 86400),
        Hours: Math.floor((totalSeconds % 86400) / 3600),
        Minutes: Math.floor((totalSeconds % 3600) / 60),
        Seconds: totalSeconds % 60,
      };
    }
    case "cagr-calculator": {
      const initial = num("initial", 0.01);
      const final = num("final", 0);
      const years = num("years", 0.1, 100);
      return {
        "CAGR (%)": (Math.pow(final / initial, 1 / years) - 1) * 100,
        "Total growth (%)": ((final - initial) / initial) * 100,
      };
    }
    case "sales-tax-calculator": {
      const mode = option("mode", ["exclusive", "inclusive"]);
      const rate = num("rate", 0, 100);
      if (mode === "inclusive") {
        const total = num("amount", 0);
        const base = total / (1 + rate / 100);
        return {
          "Base price": base,
          "Sales tax": total - base,
          "Total price": total,
        };
      }
      const base = num("amount", 0);
      const tax = (base * rate) / 100;
      return {
        "Base price": base,
        "Sales tax": tax,
        "Total price": base + tax,
      };
    }
    case "color-converter": {
      const raw = str("value").trim();
      const hexMatch = /^#?([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.exec(raw);
      const rgbMatch =
        /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*[\d.]+\s*)?\)$/i.exec(
          raw,
        );
      const hslMatch =
        /^hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*(?:,\s*[\d.]+\s*)?\)$/i.exec(
          raw,
        );
      let r: number, g: number, b: number;
      if (hexMatch) {
        let hex = hexMatch[1]!;
        if (hex.length === 3) hex = [...hex].map((c) => c + c).join("");
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
      } else if (rgbMatch) {
        [r, g, b] = [rgbMatch[1]!, rgbMatch[2]!, rgbMatch[3]!].map(Number) as [
          number,
          number,
          number,
        ];
        if ([r, g, b].some((v) => v > 255))
          throw new Error("RGB channel values must be 0–255.");
      } else if (hslMatch) {
        const h = Number(hslMatch[1]);
        const s = Number(hslMatch[2]) / 100;
        const l = Number(hslMatch[3]) / 100;
        if (h > 360 || s > 1 || l > 1)
          throw new Error("Enter a valid HSL color.");
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = l - c / 2;
        const [r1, g1, b1] =
          h < 60
            ? [c, x, 0]
            : h < 120
              ? [x, c, 0]
              : h < 180
                ? [0, c, x]
                : h < 240
                  ? [0, x, c]
                  : h < 300
                    ? [x, 0, c]
                    : [c, 0, x];
        r = Math.round((r1 + m) * 255);
        g = Math.round((g1 + m) * 255);
        b = Math.round((b1 + m) * 255);
      } else {
        throw new Error(
          "Enter a color as #rrggbb, rgb(r, g, b), or hsl(h, s%, l%).",
        );
      }
      const toHex = (v: number) => v.toString(16).padStart(2, "0");
      const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
      const [rn, gn, bn] = [r / 255, g / 255, b / 255];
      const max = Math.max(rn, gn, bn);
      const min = Math.min(rn, gn, bn);
      const l2 = (max + min) / 2;
      let h2 = 0;
      let s2 = 0;
      if (max !== min) {
        const d = max - min;
        s2 = l2 > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === rn) h2 = (gn - bn) / d + (gn < bn ? 6 : 0);
        else if (max === gn) h2 = (bn - rn) / d + 2;
        else h2 = (rn - gn) / d + 4;
        h2 *= 60;
      }
      return {
        Hex: hex,
        RGB: `rgb(${r}, ${g}, ${b})`,
        HSL: `hsl(${Math.round(h2)}, ${Math.round(s2 * 100)}%, ${Math.round(l2 * 100)}%)`,
      };
    }
    case "reading-time-calculator": {
      const wpm = num("wpm", 50, 1000, true);
      const tokens =
        input.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu) ?? [];
      if (!tokens.length)
        throw new Error("Enter some text to estimate its reading time.");
      const minutes = tokens.length / wpm;
      const totalSeconds = Math.round(minutes * 60);
      return {
        "Word count": tokens.length,
        "Reading time (minutes, rounded up)": Math.ceil(minutes),
        "Reading time (mm:ss)": `${Math.floor(totalSeconds / 60)}:${String(
          totalSeconds % 60,
        ).padStart(2, "0")}`,
      };
    }
    case "text-diff-checker": {
      const original = str("original");
      const changed = str("changed");
      if (original.length > 50000 || changed.length > 50000)
        throw new Error("Use at most 50,000 characters in each text.");
      const a = original.split(/\r?\n/);
      const b = changed.split(/\r?\n/);
      if (a.length > 2000 || b.length > 2000)
        throw new Error("Use at most 2,000 lines in each text.");
      const m = a.length;
      const n2 = b.length;
      const dp: number[][] = Array.from({ length: m + 1 }, () =>
        new Array(n2 + 1).fill(0),
      );
      for (let i = m - 1; i >= 0; i--)
        for (let j = n2 - 1; j >= 0; j--)
          dp[i]![j] =
            a[i] === b[j]
              ? dp[i + 1]![j + 1]! + 1
              : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
      let i = 0;
      let j = 0;
      let added = 0;
      let removed = 0;
      let unchanged = 0;
      while (i < m && j < n2) {
        if (a[i] === b[j]) {
          unchanged++;
          i++;
          j++;
        } else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) {
          removed++;
          i++;
        } else {
          added++;
          j++;
        }
      }
      removed += m - i;
      added += n2 - j;
      return {
        "Lines added": added,
        "Lines removed": removed,
        "Lines unchanged": unchanged,
        Identical: added === 0 && removed === 0 ? "Yes" : "No",
      };
    }
    case "dog-age-calculator": {
      const age = num("age", 0, 25);
      const size = option("size", ["small", "medium", "large", "giant"]);
      const perYear: Record<string, number> = {
        small: 4,
        medium: 4.5,
        large: 5,
        giant: 5.5,
      };
      const human =
        age <= 1
          ? age * 15
          : age <= 2
            ? 15 + (age - 1) * 9
            : 24 + (age - 2) * perYear[size]!;
      return {
        "Human age equivalent (years)": human,
        "Size category used": size[0]!.toUpperCase() + size.slice(1),
      };
    }
    case "magic-8-ball": {
      const answers = [
        "It is certain.",
        "It is decidedly so.",
        "Without a doubt.",
        "Yes, definitely.",
        "You may rely on it.",
        "As I see it, yes.",
        "Most likely.",
        "Outlook good.",
        "Yes.",
        "Signs point to yes.",
        "Reply hazy, try again.",
        "Ask again later.",
        "Better not tell you now.",
        "Cannot predict now.",
        "Concentrate and ask again.",
        "Don't count on it.",
        "My reply is no.",
        "My sources say no.",
        "Outlook not so good.",
        "Very doubtful.",
      ];
      return { Answer: answers[randomIndex(answers.length)]! };
    }
    case "love-calculator": {
      const name1 = str("name1").trim();
      const name2 = str("name2").trim();
      if (!name1 || !name2 || name1.length > 60 || name2.length > 60)
        throw new Error("Enter two names of 1–60 characters each.");
      const combined = [name1, name2]
        .map((n) => n.toLowerCase())
        .sort()
        .join("&");
      let hash = 0;
      for (const ch of combined) hash = (hash * 31 + ch.codePointAt(0)!) >>> 0;
      const score = hash % 101;
      const verdict =
        score >= 90
          ? "A rare match."
          : score >= 70
            ? "Great potential."
            : score >= 50
              ? "Worth exploring."
              : score >= 30
                ? "Could grow with effort."
                : "Opposites, maybe just friends.";
      return { "Compatibility (%)": score, Verdict: verdict };
    }
    default:
      throw new Error("This tool is unavailable.");
  }
}
