"use client";
import { useEffect, useRef, useState } from "react";
import { readList, writeList } from "@/lib/storage";
import { track } from "@/lib/analytics";
import { useLocalList, useLocalDate } from "@/lib/useLocalList";
import { Icon } from "./Icon";
import {
  expansionFields,
  expansionSamples,
  type WorkspaceField as Field,
} from "./expansion-fields";
const definitions: Record<string, Field[]> = {
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
const textTools = [
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
const randomTools = [
  "coin-flip",
  "password-generator",
  "uuid-generator",
  "pin-code-generator",
  "dice-roller",
  "random-number-generator",
  "random-name-picker",
  "lottery-number-generator",
];
const samples: Record<string, string> = {
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
function initialValues(slug: string) {
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
export default function ToolWorkspace({ slug }: { slug: string }) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    initialValues(slug),
  );
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("encode");
  const [scope, setScope] = useState("component");
  const [separator, setSeparator] = useState("-");
  const [unicode, setUnicode] = useState(false);
  const [minify, setMinify] = useState(false);
  const [caseMode, setCaseMode] = useState("upper");
  const [algorithm, setAlgorithm] = useState("SHA-256");
  const [result, setResult] = useState<
    string | Record<string, number | string> | null
  >(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [coinPhase, setCoinPhase] = useState<"idle" | "rolling" | "done">(
    "idle",
  );
  const [coinSpin, setCoinSpin] = useState(0);
  const [coinFace, setCoinFace] = useState<"Heads" | "Tails">("Heads");
  const [dicePhase, setDicePhase] = useState<"idle" | "rolling" | "done">(
    "idle",
  );
  const [diceFaces, setDiceFaces] = useState<number[]>([]);
  const [diceSides, setDiceSides] = useState(6);
  const favorite = useLocalList("favorites").includes(slug);
  const localDate = useLocalDate();
  const isText = textTools.includes(slug);
  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  useEffect(() => {
    track("tool_view", { toolSlug: slug });
  }, [slug]);
  function update(key: string, value: string) {
    setValues((v) => {
      if (slug === "bmi-calculator" && key === "units" && v.units !== value) {
        const toImperial = value === "imperial";
        return {
          ...v,
          units: value,
          weight: v.weight
            ? String(
                Number(v.weight) * (toImperial ? 1 / 0.45359237 : 0.45359237),
              )
            : "",
          height: v.height
            ? String(Number(v.height) * (toImperial ? 1 / 2.54 : 2.54))
            : "",
        };
      }
      return { ...v, [key]: value };
    });
    setError("");
    setNotice("");
    if (randomTools.includes(slug)) {
      setResult(null);
      setCoinPhase("idle");
      setDicePhase("idle");
    }
  }
  async function run() {
    if (busy) return;
    setBusy(true);
    const started = performance.now();
    setError("");
    setNotice("");
    track("tool_run_attempt", { toolSlug: slug, executionMode: "client" });
    try {
      const { executeTool } = await import("@/features/tools/runner");
      const output = await executeTool({
        slug,
        values,
        input,
        mode,
        scope,
        separator,
        unicode,
        minify,
        localDate,
        caseMode,
        algorithm,
      });
      if (
        slug === "coin-flip" &&
        Number(values.count) === 1 &&
        typeof output === "object" &&
        "Sequence" in output
      ) {
        const heads = output.Heads === 1;
        setCoinFace(heads ? "Heads" : "Tails");
        setCoinPhase("rolling");
        setCoinSpin((s) => s + 1800 + (heads ? 0 : 180));
        await sleep(900);
        setCoinPhase("done");
      } else {
        setCoinPhase("idle");
      }
      if (
        slug === "dice-roller" &&
        typeof output === "object" &&
        "Rolls" in output
      ) {
        const sides = Math.max(2, Math.round(Number(values.sides) || 6));
        const rolls = String(output.Rolls).split(", ").map(Number);
        if (rolls.length <= 12) {
          setDiceSides(sides);
          setDicePhase("rolling");
          const flicker = () =>
            setDiceFaces(
              rolls.map(() => 1 + Math.floor(Math.random() * sides)),
            );
          flicker();
          const start = performance.now();
          while (performance.now() - start < 600) {
            await sleep(70);
            flicker();
          }
          setDiceFaces(rolls);
          setDicePhase("done");
        } else {
          setDicePhase("idle");
        }
      } else if (slug === "dice-roller") {
        setDicePhase("idle");
      }
      setResult(output);
      writeList(
        "recents",
        [slug, ...readList("recents").filter((s) => s !== slug)].slice(0, 20),
      );
      track("tool_run_success", {
        toolSlug: slug,
        durationBucket: performance.now() - started < 100 ? "fast" : "slow",
      });
      setNotice("Result ready.");
    } catch (e) {
      setResult(null);
      setCoinPhase("idle");
      setDicePhase("idle");
      setError(
        e instanceof Error ? e.message : "Check your input and try again.",
      );
      track("tool_run_error", { toolSlug: slug, errorCode: "INVALID_INPUT" });
    } finally {
      setBusy(false);
    }
  }
  const liveRunId = useRef(0);
  useEffect(() => {
    if (randomTools.includes(slug) || busy) return;
    const id = ++liveRunId.current;
    const timeout = setTimeout(async () => {
      try {
        const { executeTool } = await import("@/features/tools/runner");
        const output = await executeTool({
          slug,
          values,
          input,
          mode,
          scope,
          separator,
          unicode,
          minify,
          localDate,
          caseMode,
          algorithm,
        });
        if (id !== liveRunId.current) return;
        setResult(output);
        setError("");
      } catch {
        // A live preview stays quiet on invalid input — the visible result
        // (if any) is left as the last valid one rather than flashing an
        // error on every keystroke. The Calculate/Run button still reports
        // errors normally.
      }
    }, 350);
    return () => clearTimeout(timeout);
  }, [
    slug,
    values,
    input,
    mode,
    scope,
    separator,
    unicode,
    minify,
    caseMode,
    algorithm,
    localDate,
    busy,
  ]);
  const currencyTools = [
    "sip-calculator",
    "emi-loan-calculator",
    "compound-interest-calculator",
  ];
  function display(value: number | string, key = "") {
    return typeof value === "number"
      ? new Intl.NumberFormat("en-US", {
          ...([
            "weight-converter",
            "length-converter",
            "speed-converter",
            "data-storage-converter",
          ].includes(slug)
            ? { maximumSignificantDigits: 15 }
            : {
                maximumFractionDigits: slug === "timestamp-converter" ? 3 : 2,
              }),
          ...(currencyTools.includes(slug)
            ? { style: "currency", currency: values.currency ?? "INR" }
            : {}),
        }).format(value) +
          (slug === "percentage-calculator" &&
          values.mode !== "of" &&
          key === "Result"
            ? "%"
            : "")
      : value;
  }
  const output =
    result === null
      ? ""
      : typeof result === "string"
        ? result
        : Object.entries(result)
            .map(([k, v]) => `${k}: ${display(v, k)}`)
            .join("\n");
  async function copy() {
    try {
      await navigator.clipboard.writeText(output);
      setNotice("Copied to clipboard.");
      track("result_copy", { toolSlug: slug });
    } catch {
      setNotice("Clipboard unavailable. Select and copy the result manually.");
    }
  }
  function reset() {
    setMode("encode");
    setScope("component");
    setSeparator("-");
    setUnicode(false);
    setMinify(false);
    setCaseMode("upper");
    setAlgorithm("SHA-256");
    setInput("");
    setValues(initialValues(slug));
    setResult(null);
    setError("");
    setNotice("Inputs reset.");
    setCoinPhase("idle");
    setDicePhase("idle");
  }
  return (
    <section className="workspace" aria-label="Tool workspace">
      <div className="workspace-top">
        <span>
          <Icon name="ShieldCheck" size={16} />
          Runs in your browser
        </span>
        <button
          className={`text-button save-button ${favorite ? "saved" : ""}`}
          aria-pressed={favorite}
          onClick={() => {
            const next = !favorite;
            writeList(
              "favorites",
              next
                ? [...readList("favorites").filter((s) => s !== slug), slug]
                : readList("favorites").filter((s) => s !== slug),
            );
            track("favorite_toggle", { toolSlug: slug, state: next });
          }}
        >
          <Icon name="Star" size={17} />
          {favorite ? "Saved" : "Save tool"}
        </button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
        noValidate
      >
        <fieldset
          disabled={busy}
          style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
        >
          <div className="workspace-body">
            <div className="input-pane">
              <div className="pane-heading">
                <h2>{isText ? "Your input" : "Your details"}</h2>
                {isText && (
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => {
                      setInput(samples[slug] ?? "");
                      setResult(null);
                      setError("");
                    }}
                  >
                    Try an example
                  </button>
                )}
              </div>
              {(slug === "base64-encoder-decoder" ||
                slug === "url-encoder-decoder") && (
                <div className="segmented">
                  {["encode", "decode"].map((v) => (
                    <button
                      key={v}
                      type="button"
                      aria-pressed={mode === v}
                      className={mode === v ? "selected" : ""}
                      onClick={() => setMode(v)}
                    >
                      {v === "encode" ? "Encode" : "Decode"}
                    </button>
                  ))}
                </div>
              )}
              {slug === "url-encoder-decoder" && (
                <label className="field">
                  Encoding scope
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                  >
                    <option value="component">URL component</option>
                    <option value="full">Full URL</option>
                  </select>
                </label>
              )}
              {slug === "json-formatter" && (
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={minify}
                    onChange={(e) => setMinify(e.target.checked)}
                  />
                  Minify output
                </label>
              )}
              {slug === "slug-generator" && (
                <div className="slug-options">
                  <label className="field">
                    Separator
                    <select
                      value={separator}
                      onChange={(e) => setSeparator(e.target.value)}
                    >
                      <option value="-">Hyphen (-)</option>
                      <option value="_">Underscore (_)</option>
                    </select>
                  </label>
                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={unicode}
                      onChange={(e) => setUnicode(e.target.checked)}
                    />
                    Keep Unicode letters
                  </label>
                </div>
              )}
              {slug === "text-case-converter" && (
                <label className="field">
                  Convert to
                  <select
                    value={caseMode}
                    onChange={(e) => setCaseMode(e.target.value)}
                  >
                    <option value="upper">UPPERCASE</option>
                    <option value="lower">lowercase</option>
                    <option value="title">Title Case</option>
                    <option value="sentence">Sentence case</option>
                    <option value="camel">camelCase</option>
                    <option value="snake">snake_case</option>
                    <option value="kebab">kebab-case</option>
                  </select>
                </label>
              )}
              {slug === "hash-generator" && (
                <label className="field">
                  Algorithm
                  <select
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value)}
                  >
                    <option value="SHA-1">SHA-1</option>
                    <option value="SHA-256">SHA-256</option>
                    <option value="SHA-384">SHA-384</option>
                    <option value="SHA-512">SHA-512</option>
                  </select>
                </label>
              )}
              {slug === "password-generator" && (
                <div className="slug-options">
                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={values.upper === "true"}
                      onChange={(e) =>
                        update("upper", e.target.checked ? "true" : "false")
                      }
                    />
                    Uppercase letters (A–Z)
                  </label>
                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={values.lower === "true"}
                      onChange={(e) =>
                        update("lower", e.target.checked ? "true" : "false")
                      }
                    />
                    Lowercase letters (a–z)
                  </label>
                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={values.numbers === "true"}
                      onChange={(e) =>
                        update("numbers", e.target.checked ? "true" : "false")
                      }
                    />
                    Numbers (0–9)
                  </label>
                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={values.symbols === "true"}
                      onChange={(e) =>
                        update("symbols", e.target.checked ? "true" : "false")
                      }
                    />
                    Symbols (!@#$…)
                  </label>
                </div>
              )}
              {isText && (
                <>
                  <label htmlFor="tool-input" className="field">
                    Text input
                  </label>
                  <textarea
                    id="tool-input"
                    className={slug === "json-formatter" ? "code-input" : ""}
                    value={input}
                    maxLength={100000}
                    aria-invalid={!!error}
                    aria-describedby={error ? "tool-error" : "input-limit"}
                    onChange={(e) => {
                      setInput(e.target.value);
                      setError("");
                      if (randomTools.includes(slug)) setResult(null);
                    }}
                    placeholder={
                      slug === "json-formatter"
                        ? "Paste your JSON here…"
                        : slug === "jwt-decoder"
                          ? "Paste your JWT here…"
                          : "Type or paste your text here…"
                    }
                    spellCheck={false}
                  />
                  <p className="input-limit" id="input-limit">
                    {input.length.toLocaleString()} / 100,000 characters
                  </p>
                </>
              )}
              {(definitions[slug]?.length ?? 0) > 0 && (
                <div className="fields-grid">
                  {(definitions[slug] ?? [])
                    .filter(
                      (f) =>
                        !(
                          slug === "body-fat-calculator" &&
                          f.key === "hip" &&
                          values.sex !== "female"
                        ),
                    )
                    .map((f) => (
                      <label
                        key={f.key}
                        className={`field ${f.key === "url" || f.key === "activity" || f.type === "textarea" ? "full-width" : ""}`}
                        htmlFor={f.key}
                      >
                        {f.label}
                        {slug === "bmi-calculator" &&
                        (f.key === "height" || f.key === "weight")
                          ? ` (${f.key === "height" ? (values.units === "imperial" ? "inches" : "cm") : values.units === "imperial" ? "lb" : "kg"})`
                          : ""}
                        {f.options ? (
                          <select
                            id={f.key}
                            value={values[f.key] ?? ""}
                            onChange={(e) => update(f.key, e.target.value)}
                          >
                            {f.options.map(([v, l]) => (
                              <option key={v} value={v}>
                                {l}
                              </option>
                            ))}
                          </select>
                        ) : f.type === "textarea" ? (
                          <textarea
                            id={f.key}
                            value={values[f.key] ?? ""}
                            rows={3}
                            aria-describedby={error ? "tool-error" : undefined}
                            onChange={(e) => update(f.key, e.target.value)}
                            maxLength={2000}
                          />
                        ) : (
                          <input
                            id={f.key}
                            type={f.type ?? "text"}
                            step="any"
                            value={
                              (f.key === "asOf" ||
                              (slug === "date-difference-calculator" &&
                                f.key === "end")
                                ? values[f.key] || localDate
                                : values[f.key]) ?? ""
                            }
                            aria-describedby={error ? "tool-error" : undefined}
                            onChange={(e) => update(f.key, e.target.value)}
                            maxLength={f.key === "url" ? 8192 : 200}
                          />
                        )}
                      </label>
                    ))}
                </div>
              )}
              {error && (
                <p id="tool-error" className="error-message" role="alert">
                  {error}
                </p>
              )}
              <div className="button-row">
                <button
                  className="button primary"
                  type="submit"
                  disabled={busy}
                >
                  {busy
                    ? "Working…"
                    : slug === "uuid-generator"
                      ? "Generate UUIDs"
                      : slug === "password-generator"
                        ? "Generate passwords"
                        : slug === "coin-flip"
                          ? "Flip"
                          : slug === "dice-roller"
                            ? "Roll"
                            : isText
                              ? "Run tool"
                              : "Calculate result"}
                  <Icon name="ArrowRight" size={17} />
                </button>
                <button className="button quiet" type="button" onClick={reset}>
                  <Icon name="RotateCcw" size={16} />
                  Reset
                </button>
              </div>
            </div>
            <div className="result-pane">
              <div className="pane-heading">
                <h2>Your result</h2>
                <button
                  type="button"
                  className="text-button"
                  disabled={result === null}
                  onClick={copy}
                >
                  <Icon name="Copy" size={16} />
                  Copy
                </button>
              </div>
              {coinPhase === "rolling" ? (
                <div className="result-empty">
                  <div className="coin-stage">
                    <div
                      className="coin"
                      style={{ transform: `rotateY(${coinSpin}deg)` }}
                    >
                      <div className="coin-face coin-face-heads">H</div>
                      <div className="coin-face coin-face-tails">T</div>
                    </div>
                  </div>
                  <span>Flipping…</span>
                </div>
              ) : dicePhase === "rolling" ? (
                <div className="result-empty">
                  <div className="dice-tray">
                    {diceFaces.map((face, i) => (
                      <div key={i} className="die is-rolling">
                        {face}
                      </div>
                    ))}
                  </div>
                  <span>Rolling…</span>
                </div>
              ) : result === null ? (
                <div className="result-empty">
                  <span className="result-empty-icon">
                    <Icon name="CheckCircle2" size={30} />
                  </span>
                  <p>A little input. A useful result.</p>
                  <span>Run the tool to see your result here.</span>
                </div>
              ) : typeof result === "string" ? (
                <textarea
                  className="result-text"
                  aria-label="Result output"
                  readOnly
                  value={result}
                />
              ) : (
                <>
                  {coinPhase === "done" && (
                    <div className="coin-stage coin-stage-done">
                      <div
                        className="coin"
                        style={{ transform: `rotateY(${coinSpin}deg)` }}
                      >
                        <div className="coin-face coin-face-heads">H</div>
                        <div className="coin-face coin-face-tails">T</div>
                      </div>
                      <strong className="coin-call">{coinFace}!</strong>
                    </div>
                  )}
                  {dicePhase === "done" && (
                    <div className="dice-tray dice-tray-done">
                      {diceFaces.map((face, i) =>
                        diceSides === 6 ? (
                          <div
                            key={i}
                            className="die die-pips"
                            data-face={face}
                          >
                            <span className="tl" />
                            <span className="tr" />
                            <span className="ml" />
                            <span className="c" />
                            <span className="mr" />
                            <span className="bl" />
                            <span className="br" />
                          </div>
                        ) : (
                          <div key={i} className="die">
                            {face}
                          </div>
                        ),
                      )}
                    </div>
                  )}
                  <dl className="result-stats">
                    {Object.entries(result).map(([k, v]) => (
                      <div key={k}>
                        <dt>{k}</dt>
                        <dd>{display(v, k)}</dd>
                      </div>
                    ))}
                  </dl>
                </>
              )}
              <p className="result-status" role="status" aria-live="polite">
                {notice}
              </p>
              {result !== null && slug === "json-formatter" && (
                <button
                  type="button"
                  className="text-button"
                  onClick={() => {
                    const blob = new Blob([output], {
                      type: "application/json",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "formatted.json";
                    a.click();
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                  }}
                >
                  <Icon name="Download" size={16} />
                  Download JSON
                </button>
              )}
            </div>
          </div>
        </fieldset>
      </form>
      <div className="workspace-bottom">
        <Icon name="ShieldCheck" size={15} />
        <span>Your input stays on this device. No uploads, no account.</span>
      </div>
    </section>
  );
}
