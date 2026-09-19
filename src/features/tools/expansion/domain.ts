import { textSchema, parseDate } from "../shared";
import { nutrition } from "../nutrition-calculator/domain";

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
    default:
      throw new Error("This tool is unavailable.");
  }
}
