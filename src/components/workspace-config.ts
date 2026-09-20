import {
  expansionFields,
  expansionSamples,
  type WorkspaceField as Field,
} from "./expansion-fields";
export const definitions: Record<string, Field[]> = {
  ...expansionFields,
  "lorem-ipsum-generator": [
    { key: "count", label: "Paragraphs (1–50)", type: "number", value: "3" },
  ],
  "text-sorter": [
    {
      key: "order",
      label: "Sort order",
      value: "ascending",
      options: [
        ["ascending", "Ascending (UTF-16 order)"],
        ["descending", "Descending (UTF-16 order)"],
        ["length", "Shortest first"],
      ],
    },
  ],
  "find-and-replace-text": [
    { key: "find", label: "Text to find", value: "world" },
    { key: "replacement", label: "Replacement text", value: "reader" },
  ],
  "rot13-caesar-cipher": [
    {
      key: "shift",
      label: "Letter shift (-25 to 25)",
      type: "number",
      value: "13",
    },
  ],
  "percentage-calculator": [
    {
      key: "mode",
      label: "Calculation",
      value: "of",
      options: [
        ["of", "What is A% of B?"],
        ["is", "A is what percentage of B?"],
        ["change", "Percentage change from A to B"],
      ],
    },
    { key: "a", label: "A", type: "number", value: "20" },
    { key: "b", label: "B", type: "number", value: "150" },
  ],
  "age-calculator": [
    { key: "birth", label: "Date of birth", type: "date", value: "2000-01-15" },
    { key: "asOf", label: "Age on date", type: "date" },
  ],
  "uuid-generator": [
    {
      key: "count",
      label: "Number of UUIDs (1–100)",
      type: "number",
      value: "5",
    },
  ],
  "utm-builder": [
    {
      key: "url",
      label: "Destination URL",
      type: "url",
      value: "https://example.com/",
    },
    { key: "source", label: "Campaign source", value: "newsletter" },
    { key: "medium", label: "Campaign medium", value: "email" },
    { key: "campaign", label: "Campaign name", value: "autumn_launch" },
    { key: "term", label: "Campaign term (optional)" },
    { key: "content", label: "Campaign content (optional)" },
  ],
  "sip-calculator": [
    {
      key: "monthly",
      label: "Monthly investment",
      type: "number",
      value: "5000",
    },
    {
      key: "rate",
      label: "Assumed annual return (%)",
      type: "number",
      value: "10",
    },
    {
      key: "years",
      label: "Investment period (years)",
      type: "number",
      value: "10",
    },
    {
      key: "timing",
      label: "Deposit timing",
      value: "start",
      options: [
        ["start", "Beginning of month"],
        ["end", "End of month"],
      ],
    },
    {
      key: "currency",
      label: "Display currency",
      value: "INR",
      options: [
        ["INR", "INR — Indian rupee"],
        ["USD", "USD — US dollar"],
        ["EUR", "EUR — Euro"],
        ["GBP", "GBP — British pound"],
      ],
    },
  ],
  "bmi-calculator": [
    {
      key: "units",
      label: "Units",
      value: "metric",
      options: [
        ["metric", "Metric (kg / cm)"],
        ["imperial", "Imperial (lb / inches)"],
      ],
    },
    { key: "weight", label: "Weight", type: "number", value: "70" },
    { key: "height", label: "Height", type: "number", value: "175" },
    { key: "age", label: "Age (20 or older)", type: "number", value: "30" },
  ],
  "nutrition-calculator": [
    { key: "weight", label: "Weight (kg)", type: "number", value: "70" },
    { key: "height", label: "Height (cm)", type: "number", value: "175" },
    { key: "age", label: "Age (18 or older)", type: "number", value: "30" },
    {
      key: "sex",
      label: "Formula sex coefficient",
      value: "male",
      options: [
        ["male", "Male coefficient"],
        ["female", "Female coefficient"],
      ],
    },
    {
      key: "activity",
      label: "Activity multiplier (approximate)",
      value: "1.2",
      options: [
        ["1.2", "1.2 — Sedentary"],
        ["1.375", "1.375 — Lightly active"],
        ["1.55", "1.55 — Moderately active"],
        ["1.725", "1.725 — Very active"],
        ["1.9", "1.9 — Extremely active"],
      ],
    },
    {
      key: "protein",
      label: "Protein (% of energy, 10–35)",
      type: "number",
      value: "20",
    },
    {
      key: "fat",
      label: "Fat (% of energy, 20–35)",
      type: "number",
      value: "30",
    },
  ],
  "password-generator": [
    {
      key: "length",
      label: "Password length (6–128)",
      type: "number",
      value: "16",
    },
    {
      key: "count",
      label: "Number of passwords (1–20)",
      type: "number",
      value: "5",
    },
  ],
  "coin-flip": [
    {
      key: "count",
      label: "Number of flips (1–1000)",
      type: "number",
      value: "1",
    },
  ],
  "emi-loan-calculator": [
    {
      key: "principal",
      label: "Loan amount",
      type: "number",
      value: "1000000",
    },
    {
      key: "rate",
      label: "Annual interest rate (%)",
      type: "number",
      value: "8.5",
    },
    { key: "years", label: "Loan tenure (years)", type: "number", value: "20" },
    {
      key: "currency",
      label: "Display currency",
      value: "INR",
      options: [
        ["INR", "INR — Indian rupee"],
        ["USD", "USD — US dollar"],
        ["EUR", "EUR — Euro"],
        ["GBP", "GBP — British pound"],
      ],
    },
  ],
  "compound-interest-calculator": [
    {
      key: "principal",
      label: "Principal amount",
      type: "number",
      value: "100000",
    },
    {
      key: "rate",
      label: "Annual interest rate (%)",
      type: "number",
      value: "8",
    },
    { key: "years", label: "Time period (years)", type: "number", value: "5" },
    {
      key: "frequency",
      label: "Compounding frequency",
      value: "12",
      options: [
        ["1", "Annually"],
        ["2", "Semi-annually"],
        ["4", "Quarterly"],
        ["12", "Monthly"],
        ["365", "Daily"],
      ],
    },
    {
      key: "currency",
      label: "Display currency",
      value: "INR",
      options: [
        ["INR", "INR — Indian rupee"],
        ["USD", "USD — US dollar"],
        ["EUR", "EUR — Euro"],
        ["GBP", "GBP — British pound"],
      ],
    },
  ],
  "temperature-converter": [
    { key: "value", label: "Value", type: "number", value: "100" },
    {
      key: "from",
      label: "From",
      value: "C",
      options: [
        ["C", "Celsius (°C)"],
        ["F", "Fahrenheit (°F)"],
        ["K", "Kelvin (K)"],
      ],
    },
    {
      key: "to",
      label: "To",
      value: "F",
      options: [
        ["C", "Celsius (°C)"],
        ["F", "Fahrenheit (°F)"],
        ["K", "Kelvin (K)"],
      ],
    },
  ],
  "discount-calculator": [
    { key: "price", label: "Original price", type: "number", value: "1200" },
    { key: "percentOff", label: "Discount (%)", type: "number", value: "25" },
  ],
  "ideal-weight-calculator": [
    { key: "height", label: "Height (cm)", type: "number", value: "170" },
    {
      key: "sex",
      label: "Sex",
      value: "male",
      options: [
        ["male", "Male"],
        ["female", "Female"],
      ],
    },
  ],
  "meta-tag-generator": [
    { key: "title", label: "Page title (max 70 characters)", value: "" },
    {
      key: "description",
      label: "Meta description (max 200 characters)",
      value: "",
    },
    { key: "url", label: "Page URL", type: "url", value: "" },
    {
      key: "image",
      label: "Share image URL (optional)",
      type: "url",
      value: "",
    },
    { key: "siteName", label: "Site name (optional)", value: "" },
  ],
  "date-difference-calculator": [
    { key: "start", label: "Start date", type: "date", value: "2026-01-01" },
    { key: "end", label: "End date", type: "date" },
  ],
  "pregnancy-due-date-calculator": [
    {
      key: "lastPeriod",
      label: "First day of last period",
      type: "date",
      value: "2026-07-01",
    },
    {
      key: "cycleLength",
      label: "Average cycle length (days)",
      type: "number",
      value: "28",
    },
    { key: "asOf", label: "Calculate as of", type: "date" },
  ],
  "ovulation-calculator": [
    {
      key: "lastPeriod",
      label: "First day of last period",
      type: "date",
      value: "2026-09-01",
    },
    {
      key: "cycleLength",
      label: "Average cycle length (days)",
      type: "number",
      value: "28",
    },
  ],
  "gst-calculator": [
    {
      key: "mode",
      label: "Calculation",
      value: "exclusive",
      options: [
        ["exclusive", "Add GST to a base price"],
        ["inclusive", "Extract GST from a total price"],
      ],
    },
    { key: "amount", label: "Amount", type: "number", value: "1000" },
    { key: "rate", label: "GST rate (%)", type: "number", value: "18" },
  ],
  "water-intake-calculator": [
    { key: "weight", label: "Weight (kg)", type: "number", value: "70" },
    {
      key: "activity",
      label: "Activity level",
      value: "moderate",
      options: [
        ["sedentary", "Sedentary"],
        ["moderate", "Moderate"],
        ["active", "Active"],
      ],
    },
  ],
  "body-fat-calculator": [
    {
      key: "sex",
      label: "Sex",
      value: "male",
      options: [
        ["male", "Male"],
        ["female", "Female"],
      ],
    },
    { key: "height", label: "Height (cm)", type: "number", value: "175" },
    { key: "waist", label: "Waist (cm)", type: "number", value: "85" },
    { key: "neck", label: "Neck (cm)", type: "number", value: "38" },
    {
      key: "hip",
      label: "Hip (cm, females only)",
      type: "number",
      value: "100",
    },
  ],
  "waist-hip-ratio-calculator": [
    {
      key: "sex",
      label: "Sex",
      value: "male",
      options: [
        ["male", "Male"],
        ["female", "Female"],
      ],
    },
    { key: "waist", label: "Waist (cm)", type: "number", value: "85" },
    { key: "hip", label: "Hip (cm)", type: "number", value: "100" },
  ],
  "heart-rate-zone-calculator": [
    { key: "age", label: "Age", type: "number", value: "30" },
  ],
  "savings-goal-calculator": [
    { key: "goal", label: "Savings goal", type: "number", value: "500000" },
    {
      key: "current",
      label: "Current savings",
      type: "number",
      value: "50000",
    },
    {
      key: "months",
      label: "Months to reach goal",
      type: "number",
      value: "24",
    },
    {
      key: "rate",
      label: "Assumed annual return (%)",
      type: "number",
      value: "6",
    },
  ],
};
export const textTools = [
  ...Object.keys(expansionSamples),
  "character-counter",
  "duplicate-line-remover",
  "remove-line-breaks",
  "text-sorter",
  "find-and-replace-text",
  "whitespace-remover",
  "text-reverser",
  "nato-phonetic-alphabet-converter",
  "rot13-caesar-cipher",

  "word-counter",
  "json-formatter",
  "base64-encoder-decoder",
  "url-encoder-decoder",
  "slug-generator",
  "text-case-converter",
  "hash-generator",
  "jwt-decoder",
];
// These produce a fresh random result each run, so recomputing them live
// while the user is still adjusting settings would be surprising (a
// password/roll changing before you've finished deciding on a length).
// They keep the explicit-button-only behavior; every other tool auto-runs.
export const randomTools = [
  "coin-flip",
  "password-generator",
  "uuid-generator",
  "pin-code-generator",
  "dice-roller",
  "random-number-generator",
  "random-name-picker",
  "lottery-number-generator",
];
export const samples: Record<string, string> = {
  ...expansionSamples,
  "character-counter": "Hello world!",
  "duplicate-line-remover": "red\nblue\nred",
  "remove-line-breaks": "Hello\nworld",
  "text-sorter": "pear\napple\nbanana",
  "find-and-replace-text": "Hello world!",
  "whitespace-remover": "  Hello   world!  ",
  "text-reverser": "Hello world!",
  "nato-phonetic-alphabet-converter": "Hello world!",
  "rot13-caesar-cipher": "Hello world!",

  "word-counter":
    "Good tools make room for better ideas. Write something worth sharing.",
  "json-formatter":
    '{"project":"ToolzPoint","free":true,"tools":["JSON Formatter","Word Counter"]}',
  "base64-encoder-decoder": "Hello, world! 👋",
  "url-encoder-decoder": "hello world & good ideas",
  "slug-generator": "A Little Less Busy, A Lot More Done",
  "text-case-converter": "ToolzPoint makes everyday tasks simple",
  "hash-generator": "The quick brown fox jumps over the lazy dog",
  "jwt-decoder":
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
};
export function initialValues(slug: string) {
  const base = Object.fromEntries(
    (definitions[slug] ?? []).map((f) => [f.key, f.value ?? ""]),
  );
  return slug === "password-generator"
    ? {
        ...base,
        lower: "true",
        upper: "true",
        numbers: "true",
        symbols: "false",
      }
    : base;
}
