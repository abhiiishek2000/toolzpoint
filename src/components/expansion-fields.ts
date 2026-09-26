import { timezoneOptions } from "../features/tools/expansion/timezones";
export type WorkspaceField = {
  key: string;
  label: string;
  type?: string;
  value?: string;
  options?: [string, string][];
};
const number = (key: string, label: string, value: string): WorkspaceField => ({
  key,
  label,
  value,
  type: "number",
});
const select = (
  key: string,
  label: string,
  value: string,
  options: string[],
): WorkspaceField => ({
  key,
  label,
  value,
  options: options.map((v) => [v, v]),
});
const conversion = (units: string[]) => [
  number("value", "Value (0–1 trillion)", "1"),
  select("from", "From unit", units[0]!, units),
  select("to", "To unit", units[1]!, units),
];
export const expansionFields: Record<string, WorkspaceField[]> = {
  "weight-converter": conversion(["kg", "g", "lb", "oz", "stone"]),
  "length-converter": conversion(["m", "cm", "mm", "km", "inch", "ft", "mile"]),
  "speed-converter": conversion(["m/s", "km/h", "mph", "knot"]),
  "data-storage-converter": conversion([
    "B",
    "bit",
    "KB",
    "MB",
    "GB",
    "TB",
    "KiB",
    "MiB",
    "GiB",
    "TiB",
  ]),
  "number-base-converter": [
    number("from", "From base (2–36)", "10"),
    number("to", "To base (2–36)", "16"),
  ],
  "binary-text-converter": [
    select("mode", "Conversion mode", "encode", ["encode", "decode"]),
  ],
  "timestamp-converter": [
    select("mode", "Input format", "seconds", [
      "seconds",
      "milliseconds",
      "iso",
    ]),
  ],
  "tip-calculator": [
    number("bill", "Bill amount", "100"),
    number("tip", "Tip (%)", "15"),
    number("people", "People (1–1,000)", "2"),
  ],
  "ratio-calculator": [
    number("a", "First side (whole number)", "12"),
    number("b", "Second side (whole number)", "18"),
  ],
  "simple-interest-calculator": [
    number("principal", "Principal", "1000"),
    number("rate", "Annual interest (%)", "5"),
    number("years", "Years", "2"),
  ],
  "roi-calculator": [
    number("cost", "Total cost", "1000"),
    number("proceeds", "Total proceeds", "1200"),
  ],
  "break-even-calculator": [
    number("fixed", "Fixed costs", "1000"),
    number("price", "Price per unit", "25"),
    number("variable", "Variable cost per unit", "15"),
  ],
  "bmr-calculator": [
    number("weight", "Weight (kg)", "70"),
    number("height", "Height (cm)", "175"),
    number("age", "Age (18–100 years)", "30"),
    select("sex", "Sex used in formula", "male", ["male", "female"]),
  ],
  "macro-calculator": [
    number("calories", "Daily calories (kcal)", "2000"),
    number("protein", "Protein (% of calories)", "30"),
    number("fat", "Fat (% of calories)", "30"),
  ],
  "sleep-cycle-calculator": [
    {
      key: "direction",
      label: "I'm planning around",
      value: "wake",
      options: [
        ["wake", "A wake-up time"],
        ["sleep", "A bedtime"],
      ],
    },
    { key: "time", label: "Time", type: "time", value: "07:00" },
  ],
  "calories-burned-calculator": [
    {
      key: "activity",
      label: "Activity",
      value: "walking-4mph",
      options: [
        ["walking-3mph", "Walking (3 mph, moderate)"],
        ["walking-4mph", "Walking (4 mph, brisk)"],
        ["running-5mph", "Running (5 mph)"],
        ["running-6mph", "Running (6 mph)"],
        ["running-8mph", "Running (8 mph)"],
        ["cycling-leisure", "Cycling, leisure (under 10 mph)"],
        ["cycling-moderate", "Cycling, moderate (12–13.9 mph)"],
        ["swimming-moderate", "Swimming, moderate effort"],
        ["yoga", "Yoga"],
        ["weight-training", "Weight training, vigorous"],
        ["jump-rope", "Jump rope"],
        ["dancing", "Dancing (general)"],
        ["hiking", "Hiking, cross-country"],
      ],
    },
    number("weight", "Weight (kg)", "70"),
    number("minutes", "Duration (minutes)", "30"),
  ],
  "pin-code-generator": [
    number("length", "PIN length (4–12)", "6"),
    number("count", "Number of PINs (1–20)", "5"),
  ],
  "dice-roller": [
    number("sides", "Sides per die (2–1,000)", "6"),
    number("count", "Number of dice (1–100)", "2"),
  ],
  "random-number-generator": [
    number("min", "Minimum (inclusive)", "1"),
    number("max", "Maximum (inclusive)", "100"),
    number("count", "Numbers to generate (1–100)", "5"),
  ],
  "receipt-maker": [
    { key: "reference", label: "Receipt reference", value: "R-001" },
    { key: "date", label: "Payment date", type: "date", value: "2026-09-19" },
    { key: "payer", label: "Received from", value: "Alex" },
    { key: "payee", label: "Received by", value: "Sample Studio" },
    { key: "description", label: "Payment for", value: "Design services" },
    number("amount", "Amount received", "100"),
    select("currency", "Currency", "INR", ["INR", "USD", "EUR", "GBP"]),
    { key: "method", label: "Payment method", value: "Bank transfer" },
  ],
  "mortgage-calculator": [
    number("price", "Home price", "300000"),
    number("down", "Down payment", "60000"),
    number("rate", "Annual interest rate (%)", "6"),
    number("years", "Loan term (years)", "30"),
    number("tax", "Annual property tax (optional)", "0"),
    number("insurance", "Annual home insurance (optional)", "0"),
  ],
  "fd-calculator": [
    number("principal", "Deposit amount", "100000"),
    number("rate", "Annual interest rate (%)", "7"),
    number("years", "Tenure (years)", "5"),
  ],
  "rd-calculator": [
    number("monthly", "Monthly deposit", "5000"),
    number("rate", "Annual interest rate (%)", "7"),
    number("months", "Tenure (months)", "12"),
  ],
  "inflation-calculator": [
    number("amount", "Amount today", "100000"),
    number("rate", "Annual inflation rate (%)", "6"),
    number("years", "Years", "10"),
  ],
  "net-worth-calculator": [
    {
      key: "assets",
      label: "Assets (one per line: label, amount)",
      type: "textarea",
      value: "Savings account, 500000\nCar, 300000",
    },
    {
      key: "liabilities",
      label: "Liabilities (one per line: label, amount)",
      type: "textarea",
      value: "Home loan, 1200000",
    },
  ],
  "quadratic-equation-solver": [
    number("a", "a (coefficient of x²)", "1"),
    number("b", "b (coefficient of x)", "-3"),
    number("c", "c (constant)", "2"),
  ],
  "timezone-converter": [
    { key: "date", label: "Date", type: "date", value: "2026-09-19" },
    { key: "time", label: "Time (24-hour)", type: "time", value: "12:00" },
    select("from", "From time zone", timezoneOptions[0]!, timezoneOptions),
    select("to", "To time zone", timezoneOptions[1]!, timezoneOptions),
  ],
  "roman-numeral-converter": [
    {
      key: "mode",
      label: "Direction",
      value: "to-roman",
      options: [
        ["to-roman", "Number → Roman numeral"],
        ["to-number", "Roman numeral → Number"],
      ],
    },
  ],
  "open-graph-preview-generator": [
    {
      key: "title",
      label: "Page title",
      value: "A Little Less Busy, A Lot More Done",
    },
    {
      key: "description",
      label: "Meta description",
      type: "textarea",
      value:
        "ToolzPoint is a set of free, browser-based utilities that run entirely on your device.",
    },
    {
      key: "url",
      label: "Page URL",
      type: "url",
      value: "https://example.com/",
    },
  ],
  "social-media-character-counter": [
    {
      key: "platform",
      label: "Platform",
      value: "x",
      options: [
        ["x", "X / Twitter (280)"],
        ["threads", "Threads (500)"],
        ["instagram", "Instagram caption (2,200)"],
        ["linkedin", "LinkedIn post (3,000)"],
        ["facebook", "Facebook post (63,206)"],
      ],
    },
  ],
  "lottery-number-generator": [
    number("mainCount", "Main numbers to draw (1–20)", "6"),
    number("mainMax", "Main number pool (1–200)", "49"),
    number("bonusCount", "Bonus numbers (0–10)", "1"),
    number("bonusMax", "Bonus number pool (1–200)", "10"),
  ],
  "volume-converter": conversion([
    "L",
    "mL",
    "US gal",
    "US qt",
    "US cup",
    "US fl oz",
    "UK gal",
    "m³",
  ]),
  "area-converter": conversion([
    "m²",
    "km²",
    "cm²",
    "ft²",
    "acre",
    "hectare",
    "mile²",
  ]),
  "business-days-calculator": [
    { key: "start", label: "Start date", type: "date", value: "2026-09-01" },
    { key: "end", label: "End date", type: "date", value: "2026-09-30" },
    {
      key: "holidays",
      label: "Holidays to exclude (optional, one YYYY-MM-DD date per line)",
      type: "textarea",
      value: "",
    },
  ],
  "countdown-timer": [
    {
      key: "targetDate",
      label: "Target date",
      type: "date",
      value: "2027-01-01",
    },
    {
      key: "targetTime",
      label: "Target time (24-hour)",
      type: "time",
      value: "00:00",
    },
    { key: "fromDate", label: "From date", type: "date", value: "2026-09-26" },
    {
      key: "fromTime",
      label: "From time (24-hour)",
      type: "time",
      value: "00:00",
    },
  ],
  "cagr-calculator": [
    number("initial", "Initial value", "100000"),
    number("final", "Final value", "200000"),
    number("years", "Years", "5"),
  ],
  "sales-tax-calculator": [
    {
      key: "mode",
      label: "Calculation",
      value: "exclusive",
      options: [
        ["exclusive", "Add tax to a base price"],
        ["inclusive", "Extract tax from a total price"],
      ],
    },
    number("amount", "Amount", "100"),
    number("rate", "Sales tax rate (%)", "8"),
  ],
  "color-converter": [
    {
      key: "value",
      label: "Color (hex, rgb(), or hsl())",
      value: "#3B82F6",
    },
  ],
  "reading-time-calculator": [
    {
      key: "wpm",
      label: "Reading speed",
      value: "200",
      options: [
        ["130", "130 wpm — reading aloud"],
        ["150", "150 wpm — careful reading"],
        ["200", "200 wpm — average adult"],
        ["250", "250 wpm — fast reading"],
      ],
    },
  ],
  "text-diff-checker": [
    {
      key: "original",
      label: "Original text",
      type: "textarea",
      value:
        "The quick brown fox jumps over the lazy dog.\nToolzPoint tools run in your browser.",
    },
    {
      key: "changed",
      label: "Changed text",
      type: "textarea",
      value:
        "The quick brown fox leaps over a lazy dog.\nToolzPoint tools run in your browser.",
    },
  ],
  "dog-age-calculator": [
    number("age", "Dog's age (years)", "3"),
    {
      key: "size",
      label: "Size category",
      value: "medium",
      options: [
        ["small", "Small (up to 20 lb)"],
        ["medium", "Medium (21–50 lb)"],
        ["large", "Large (51–90 lb)"],
        ["giant", "Giant (over 90 lb)"],
      ],
    },
  ],
  "magic-8-ball": [
    {
      key: "question",
      label: "Your question (optional)",
      value: "Will today be a good day?",
    },
  ],
  "love-calculator": [
    { key: "name1", label: "First name", value: "Alex" },
    { key: "name2", label: "Second name", value: "Sam" },
  ],
};
export const expansionSamples: Record<string, string> = {
  "number-base-converter": "255",
  "binary-text-converter": "Hello",
  "url-parser": "https://example.com:8080/docs?q=hello#intro",
  "timestamp-converter": "0",
  "json-to-csv-converter":
    '[ {"name":"Ada", "score":10}, {"name":"Lin", "score":20} ]',
  "average-calculator": "2, 4, 6, 8",
  "sitemap-generator": "https://example.com/\nhttps://example.com/about",
  "hashtag-generator": "design, tools, #design",
  "random-name-picker": "Alex\nSam\nTaylor",
  "gpa-calculator": "A,3\nB+,4\nA-,3",
  "work-hours-calculator": "09:00,17:30,30\n09:00,18:00,60",
  "roman-numeral-converter": "1994",
  "social-media-character-counter": "Check out our new feature! 🚀",
  "password-strength-checker": "Tr0ub4dor&3",
  "reading-time-calculator":
    "ToolzPoint is a collection of free, browser-based utilities built for everyday tasks like counting words, converting units, and generating documents. Every calculation runs directly on your device, so your text and files are never uploaded to a server. This sample paragraph exists purely to demonstrate how the reading time calculator estimates the minutes needed to read a piece of text at a chosen words-per-minute pace, whether you are checking a blog post, an email, or a script before you publish it.",
};
