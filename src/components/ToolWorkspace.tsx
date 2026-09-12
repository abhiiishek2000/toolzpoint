"use client";
import { useEffect, useState } from "react";
import { readList, writeList } from "@/lib/storage";
import { track } from "@/lib/analytics";
import { useLocalList, useLocalDate } from "@/lib/useLocalList";
import { Icon } from "./Icon";
type Field = {
  key: string;
  label: string;
  type?: string;
  value?: string;
  options?: [string, string][];
};
const definitions: Record<string, Field[]> = {
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
};
const textTools = [
  "word-counter",
  "json-formatter",
  "base64-encoder-decoder",
  "url-encoder-decoder",
  "slug-generator",
];
const samples: Record<string, string> = {
  "word-counter":
    "Good tools make room for better ideas. Write something worth sharing.",
  "json-formatter":
    '{"project":"ToolzPoint","free":true,"tools":["JSON Formatter","Word Counter"]}',
  "base64-encoder-decoder": "Hello, world! 👋",
  "url-encoder-decoder": "hello world & good ideas",
  "slug-generator": "A Little Less Busy, A Lot More Done",
};
function initialValues(slug: string) {
  return Object.fromEntries(
    (definitions[slug] ?? []).map((f) => [f.key, f.value ?? ""]),
  );
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
  const [result, setResult] = useState<
    string | Record<string, number | string> | null
  >(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const favorite = useLocalList("favorites").includes(slug);
  const localDate = useLocalDate();
  const isText = textTools.includes(slug);
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
    setResult(null);
    setError("");
    setNotice("");
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
      const output = executeTool({
        slug,
        values,
        input,
        mode,
        scope,
        separator,
        unicode,
        minify,
        localDate,
      });
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
      setError(
        e instanceof Error ? e.message : "Check your input and try again.",
      );
      track("tool_run_error", { toolSlug: slug, errorCode: "INVALID_INPUT" });
    } finally {
      setBusy(false);
    }
  }
  function display(value: number | string, key = "") {
    return typeof value === "number"
      ? new Intl.NumberFormat("en-US", {
          maximumFractionDigits: 2,
          ...(slug === "sip-calculator"
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
    setInput("");
    setValues(initialValues(slug));
    setResult(null);
    setError("");
    setNotice("Inputs reset.");
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
                      onClick={() => {
                        setMode(v);
                        setResult(null);
                      }}
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
                    onChange={(e) => {
                      setScope(e.target.value);
                      setResult(null);
                    }}
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
                    onChange={(e) => {
                      setMinify(e.target.checked);
                      setResult(null);
                    }}
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
                      onChange={(e) => {
                        setSeparator(e.target.value);
                        setResult(null);
                      }}
                    >
                      <option value="-">Hyphen (-)</option>
                      <option value="_">Underscore (_)</option>
                    </select>
                  </label>
                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={unicode}
                      onChange={(e) => {
                        setUnicode(e.target.checked);
                        setResult(null);
                      }}
                    />
                    Keep Unicode letters
                  </label>
                </div>
              )}
              {isText ? (
                <>
                  <label htmlFor="tool-input" className="sr-only">
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
                      setResult(null);
                      setError("");
                    }}
                    placeholder={
                      slug === "json-formatter"
                        ? "Paste your JSON here…"
                        : "Type or paste your text here…"
                    }
                    spellCheck={false}
                  />
                  <p className="input-limit" id="input-limit">
                    {input.length.toLocaleString()} / 100,000 characters
                  </p>
                </>
              ) : (
                <div className="fields-grid">
                  {(definitions[slug] ?? []).map((f) => (
                    <label
                      key={f.key}
                      className={`field ${f.key === "url" || f.key === "activity" ? "full-width" : ""}`}
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
                      ) : (
                        <input
                          id={f.key}
                          type={f.type ?? "text"}
                          step="any"
                          value={
                            (f.key === "asOf"
                              ? values.asOf || localDate
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
              {result === null ? (
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
                <dl className="result-stats">
                  {Object.entries(result).map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{display(v, k)}</dd>
                    </div>
                  ))}
                </dl>
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
