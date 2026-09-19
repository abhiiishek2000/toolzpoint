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
};
