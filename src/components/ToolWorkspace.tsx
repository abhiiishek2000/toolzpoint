"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { ResultDetails as Details } from "@/features/tools/result-details";
const DetailedResult = dynamic(() => import("./ResultDetails"));
import { readList, writeList } from "@/lib/storage";
import { track } from "@/lib/analytics";
import { useLocalList, useLocalDate } from "@/lib/useLocalList";
import { Icon } from "./Icon";
import {
  definitions,
  textTools,
  randomTools,
  samples,
  initialValues,
} from "./workspace-config";
const primaryResults: Record<string, string> = {
  "sip-calculator": "Estimated total",
  "compound-interest-calculator": "Maturity amount",
  "mortgage-calculator": "Total monthly payment",
  "gst-calculator": "Total price",
  "fd-calculator": "Maturity amount",
  "rd-calculator": "Maturity amount",
};
export default function ToolWorkspace({
  slug,
  how,
  limitations,
  resultGuide,
}: {
  slug: string;
  how: string;
  limitations: string;
  resultGuide: string;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    initialValues(slug),
  );
  const [autoRun, setAutoRun] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("encode");
  const [scope, setScope] = useState("component");
  const [separator, setSeparator] = useState("-");
  const [unicode, setUnicode] = useState(false);
  const [minify, setMinify] = useState(false);
  const [caseMode, setCaseMode] = useState("upper");
  const [algorithm, setAlgorithm] = useState("SHA-256");
  const [rawResult, setResult] = useState<
    string | Record<string, number | string> | null
  >(null);
  const [details, setDetails] = useState<Details | null>(null);
  const [resultKey, setResultKey] = useState("");
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
  const currentKey = JSON.stringify([
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
  ]);
  const result = resultKey === currentKey ? rawResult : null;
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
    setAutoRun(true);
    setBusy(true);
    const started = performance.now();
    setError("");
    setNotice("");
    track("tool_run_attempt", { toolSlug: slug, executionMode: "client" });
    try {
      const { executeDetailedTool } =
        await import("@/features/tools/result-details");
      const report = await executeDetailedTool({
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
      const output = report.output;
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
      setDetails(report.details);
      setResultKey(currentKey);
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
  useEffect(() => {
    if (!autoRun || randomTools.includes(slug) || busy) return;
    let active = true;
    const timeout = setTimeout(async () => {
      try {
        const { executeDetailedTool } =
          await import("@/features/tools/result-details");
        const report = await executeDetailedTool({
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
        if (!active) return;
        setResult(report.output);
        setDetails(report.details);
        setResultKey(currentKey);
        setError("");
      } catch {
        if (!active) return;
        setResult(null);
        setDetails(null);
      }
    }, 350);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [
    autoRun,
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
    currentKey,
  ]);
  const currencyTools = [
    "sip-calculator",
    "emi-loan-calculator",
    "compound-interest-calculator",
  ];
  function display(value: number | string, key = "") {
    return typeof value === "number"
      ? new Intl.NumberFormat(values.currency === "INR" ? "en-IN" : "en-US", {
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
            : slug === "temperature-converter"
              ? ` ${values.to === "K" ? "K" : `°${values.to}`}`
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
    setAutoRun(false);
    setShowPassword(false);
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
    <section
      className="workspace enhanced-workspace"
      aria-label="Tool workspace"
    >
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
        onChangeCapture={() => setAutoRun(true)}
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
                {(isText || slug === "meta-tag-generator") && (
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => {
                      setAutoRun(true);
                      setInput(samples[slug] ?? "");
                      if (slug === "meta-tag-generator")
                        setValues({
                          title: "A guide to local browser tools",
                          description:
                            "Learn how browser tools process text, calculate estimates and create files locally.",
                          url: "https://example.com/browser-tools",
                          image: "",
                          siteName: "Example",
                        });
                      setResult(null);
                      setError("");
                    }}
                  >
                    Try an example
                  </button>
                )}
              </div>
              <p className="input-guidance">
                {isText
                  ? "Paste your text or try the example. Adjust the options to compare results."
                  : randomTools.includes(slug)
                    ? "Choose your settings, then generate a fresh result."
                    : "Start with the example values below, then enter your own. Results update as you edit."}
              </p>
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
                  {slug === "password-strength-checker" ? (
                    <>
                      <input
                        id="tool-input"
                        type={showPassword ? "text" : "password"}
                        value={input}
                        maxLength={1024}
                        autoComplete="off"
                        spellCheck={false}
                        aria-invalid={!!error}
                        aria-describedby={error ? "tool-error" : "input-limit"}
                        onChange={(e) => {
                          setInput(e.target.value);
                          setError("");
                        }}
                      />
                      <button
                        type="button"
                        className="text-button"
                        aria-pressed={showPassword}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? "Hide password" : "Show password"}
                      </button>
                    </>
                  ) : (
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
                  )}
                  <p className="input-limit" id="input-limit">
                    {input.length.toLocaleString()} /{" "}
                    {slug === "password-strength-checker" ? "1,024" : "100,000"}{" "}
                    characters
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
            <div className="result-pane" aria-busy={busy}>
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
                  <p>
                    {error
                      ? "Check your input to continue"
                      : "Your result will appear here"}
                  </p>
                  <span>
                    {error
                      ? "Fix the details shown in the input panel and try again."
                      : "Enter valid details, or run the tool with the example values."}
                  </span>
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
                    {Object.entries(result)
                      .sort(
                        ([a], [b]) =>
                          Number(b === primaryResults[slug]) -
                          Number(a === primaryResults[slug]),
                      )
                      .map(([k, v]) => (
                        <div
                          key={k}
                          className={
                            typeof v === "string" ? "text-stat" : undefined
                          }
                        >
                          <dt>{k}</dt>
                          <dd>{display(v, k)}</dd>
                        </div>
                      ))}
                  </dl>
                </>
              )}
              {result !== null && (
                <>
                  {details?.text && (
                    <div className="output-metrics">
                      <span>
                        <strong>
                          {details.text.outputCharacters.toLocaleString()}
                        </strong>{" "}
                        output characters
                      </span>
                      <span>
                        <strong>
                          {details.text.outputLines.toLocaleString()}
                        </strong>{" "}
                        output lines
                      </span>
                      {isText && (
                        <span>
                          <strong>
                            {details.text.inputCharacters.toLocaleString()}
                          </strong>{" "}
                          input characters
                        </span>
                      )}
                    </div>
                  )}
                  <div className="result-explanation">
                    <h3>Understanding your result</h3>
                    <p>{resultGuide}</p>
                  </div>
                </>
              )}
              <p className="result-status" role="status" aria-live="polite">
                {result !== null || error ? notice : ""}
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
      {result !== null && details && (
        <DetailedResult
          details={details}
          slug={slug}
          currency={
            currencyTools.includes(slug)
              ? (values.currency ?? "INR")
              : undefined
          }
        />
      )}
      <div className="workspace-method">
        <details>
          <summary>Method & assumptions</summary>
          <p>{how}</p>
        </details>
        <details>
          <summary>Limits to keep in mind</summary>
          <p>{limitations}</p>
        </details>
      </div>
      <div className="workspace-bottom">
        <Icon name="ShieldCheck" size={15} />
        <span>Your input stays on this device. No uploads, no account.</span>
      </div>
    </section>
  );
}
