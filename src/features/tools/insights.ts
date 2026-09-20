import type { RunOptions } from "./runner";
import { addDays, parseDate, daysBetween } from "./shared";
import { convertCase } from "./text-case-converter/domain";
import { unitFactors, runExpansion } from "./expansion/domain";

export type InsightTable = {
  title: string;
  headers: string[];
  rows: (string | number)[][];
};
export type ToolInsight = {
  title: string;
  explanation: string;
  tables: InsightTable[];
  checks?: { label: string; value: string }[];
  comparison?: { before: string; after: string };
  preview?: { title: string; description: string; host: string };
};
const fmt = (value: number) =>
  new Intl.NumberFormat("en-US", { maximumSignificantDigits: 12 }).format(
    value,
  );
const lines = (text: string) => text.replace(/\r\n?/g, "\n").split("\n");
const nonempty = (text: string) =>
  lines(text)
    .map((line) => line.trim())
    .filter(Boolean);
const chars = (text: string) => [...text].length;
const words = (text: string) =>
  text.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu) ?? [];
const date = (start: string, offset: number) =>
  addDays(parseDate(start), offset).toISOString().slice(0, 10);
const frequency = (values: string[]) => {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1]);
};

// Every workspace tool has an explicit result design. There is intentionally no
// generic fallback: coverage tests fail when a new tool lacks its own report.
export function toolInsight(
  o: RunOptions,
  output: string | Record<string, number | string>,
): ToolInsight {
  const { slug, values: v, input } = o;
  const r = typeof output === "string" ? {} : output;
  const text = typeof output === "string" ? output : "";
  const n = (key: string) => Number(v[key]);
  const val = (key: string) => {
    if (r[key] === undefined)
      throw new Error(`Missing ${key} in ${slug} report.`);
    return r[key];
  };
  const table = (
    title: string,
    headers: string[],
    rows: (string | number)[][],
    explanation: string,
  ): ToolInsight => ({
    title,
    explanation,
    tables: [{ title, headers, rows }],
  });
  const compare = (
    title: string,
    explanation: string,
    rows: (string | number)[][],
  ): ToolInsight => ({
    ...table(title, ["Check", "Before", "After"], rows, explanation),
    comparison: { before: input.slice(0, 4000), after: text.slice(0, 4000) },
  });
  switch (slug) {
    case "word-counter": {
      const tokens = words(input);
      return table(
        "Word frequency breakdown",
        ["Word (case-insensitive)", "Occurrences", "Share of words (%)"],
        frequency(tokens.map((w) => w.toLocaleLowerCase("en")))
          .slice(0, 30)
          .map(([word, count]) => [word, count, (count / tokens.length) * 100]),
        "The 30 most frequent words help spot repetition. Counts use the same Unicode word boundaries as the main result; they are not SEO keyword-density targets.",
      );
    }
    case "character-counter":
      return table(
        "Where the characters come from",
        ["Character group", "Unicode code points"],
        [
          ["Letters", (input.match(/\p{L}/gu) ?? []).length],
          ["Numbers", (input.match(/\p{N}/gu) ?? []).length],
          ["Whitespace", (input.match(/\s/gu) ?? []).length],
          ["Punctuation", (input.match(/\p{P}/gu) ?? []).length],
          [
            "Symbols, emoji and combining marks",
            chars(input.replace(/[\p{L}\p{N}\s\p{P}]/gu, "")),
          ],
        ],
        "This breakdown counts Unicode code points. One visible emoji can contain several code points, UTF-16 units or UTF-8 bytes.",
      );
    case "json-formatter": {
      const parsed: unknown = JSON.parse(text);
      const entries: [string, unknown][] =
        parsed !== null && typeof parsed === "object"
          ? Object.entries(parsed)
          : [["(root)", parsed]];
      return table(
        "JSON structure explorer",
        ["Top-level key / index", "Type", "Preview"],
        entries
          .slice(0, 100)
          .map(([key, value]) => [
            key,
            value === null
              ? "null"
              : Array.isArray(value)
                ? "array"
                : typeof value,
            (JSON.stringify(value) ?? "undefined").slice(0, 160),
          ]),
        `Root type: ${parsed === null ? "null" : Array.isArray(parsed) ? "array" : typeof parsed}. Showing up to 100 top-level entries. Strings remain text and are never executed. Duplicate keys and large integer precision still need review.`,
      );
    }
    case "base64-encoder-decoder":
      return compare(
        "Base64 encoding inspection",
        `Operation: ${o.mode}. Base64 represents bytes, not encryption. The side-by-side preview shows at most 4,000 characters per side.`,
        [
          ["Unicode characters", chars(input), chars(text)],
          [
            "UTF-8 bytes",
            new TextEncoder().encode(input).length,
            new TextEncoder().encode(text).length,
          ],
        ],
      );
    case "url-encoder-decoder":
      return compare(
        "URL escape inspection",
        `${o.mode === "decode" ? "Decode" : "Encode"} in ${o.scope === "full" ? "full URL" : "component"} mode. Separators such as & and / behave differently between these modes. Preview limited to 4,000 characters.`,
        [
          ["Characters", chars(input), chars(text)],
          [
            "Percent-encoded byte groups",
            (input.match(/%[\da-f]{2}/gi) ?? []).length,
            (text.match(/%[\da-f]{2}/gi) ?? []).length,
          ],
        ],
      );
    case "binary-text-converter": {
      const decoded = v.mode === "decode" ? text : input;
      return table(
        "UTF-8 byte inspector",
        ["Byte position", "Decimal", "Hexadecimal", "Binary"],
        [...new TextEncoder().encode(decoded)]
          .slice(0, 128)
          .map((byte, i) => [
            i + 1,
            byte,
            byte.toString(16).padStart(2, "0").toUpperCase(),
            byte.toString(2).padStart(8, "0"),
          ]),
        "Showing the first 128 UTF-8 bytes. Multiple bytes can represent one character; this explains why non-English text and emoji produce longer binary output.",
      );
    }
    case "number-base-converter": {
      return table(
        "The same integer in common bases",
        ["Base", "Representation"],
        [2, 8, 10, 16, 36].map((base) => [
          base,
          String(runExpansion(slug, input, { ...v, to: String(base) })),
        ]),
        "Every representation uses exact integer arithmetic. Negative signs are preserved; fractions are not supported.",
      );
    }
    case "slug-generator":
      return compare(
        "URL slug review",
        `Separator: ${o.separator}. ${o.unicode ? "Unicode letters are retained." : "Unsupported characters are removed or normalized."} Check that names remain recognizable before using this as a permanent URL.`,
        [
          ["Characters", chars(input), chars(text)],
          [
            "Whitespace",
            (input.match(/\s/g) ?? []).length,
            (text.match(/\s/g) ?? []).length,
          ],
        ],
      );
    case "text-case-converter":
      return table(
        "Compare text case formats",
        ["Format", "Preview (first 300 characters)"],
        (
          [
            "upper",
            "lower",
            "title",
            "sentence",
            "camel",
            "snake",
            "kebab",
          ] as const
        ).map((mode) => [mode, convertCase(input, mode).slice(0, 300)]),
        `The main output uses ${o.caseMode} case. Compare alternative formats here; use the full main output when copying a long document.`,
      );
    case "lorem-ipsum-generator":
      return table(
        "Paragraph plan",
        ["Paragraph", "Words", "Characters"],
        text.split("\n\n").map((p, i) => [i + 1, words(p).length, chars(p)]),
        "The same placeholder paragraph is repeated. Use the per-paragraph sizes to test a layout, then replace the placeholder before publishing.",
      );
    case "duplicate-line-remover":
      return table(
        "Duplicate lines removed",
        [
          "Line (first 200 characters)",
          "Original occurrences",
          "Removed copies",
        ],
        frequency(lines(input))
          .filter(([, count]) => count > 1)
          .slice(0, 100)
          .map(([line, count]) => [
            line.slice(0, 200) || "(empty line)",
            count,
            count - 1,
          ]),
        "First occurrences stay in the original order. Matching is case-sensitive and includes whitespace. Showing up to 100 duplicate groups; an empty table means no duplicates.",
      );
    case "remove-line-breaks":
      return compare(
        "Line joining review",
        "Line-break groups become spaces. Check paragraph and word boundaries in the before/after preview (up to 4,000 characters).",
        [
          ["Lines", lines(input).length, lines(text).length],
          ["Characters", chars(input), chars(text)],
        ],
      );
    case "text-sorter":
      return table(
        "Sorted line order",
        ["Output position", "Original position", "Characters", "Line preview"],
        (() => {
          const original = lines(input).map((line, i) => ({
            line,
            i,
            used: false,
          }));
          return lines(text)
            .slice(0, 100)
            .map((line, i) => {
              const item = original.find(
                (entry) => !entry.used && entry.line === line,
              )!;
              item.used = true;
              return [i + 1, item.i + 1, chars(line), line.slice(0, 200)];
            });
        })(),
        `Order: ${v.order}. Showing the first 100 output lines with original positions, so you can verify how the order changed.`,
      );
    case "find-and-replace-text":
      return compare(
        "Replacement report",
        "Matches are literal and case-sensitive, including matches within words. The before/after preview is limited to 4,000 characters.",
        [
          [
            "Exact matches replaced",
            input.split(v.find!).length - 1,
            "All matches",
          ],
          ["Characters", chars(input), chars(text)],
        ],
      );
    case "whitespace-remover":
      return compare(
        "Whitespace cleanup report",
        "Runs of whitespace become one space and leading/trailing whitespace is removed. Review deliberate formatting in the preview (up to 4,000 characters).",
        [
          [
            "Whitespace code points",
            (input.match(/\s/gu) ?? []).length,
            (text.match(/\s/gu) ?? []).length,
          ],
          ["Characters", chars(input), chars(text)],
        ],
      );
    case "text-reverser":
      return compare(
        "Grapheme-safe reversal",
        "Visible character clusters are reversed as units. Combining marks and joined emoji remain together. Preview limited to 4,000 characters.",
        [
          [
            "Visible clusters",
            [
              ...new Intl.Segmenter("en", { granularity: "grapheme" }).segment(
                input,
              ),
            ].length,
            [
              ...new Intl.Segmenter("en", { granularity: "grapheme" }).segment(
                text,
              ),
            ].length,
          ],
          ["Code points", chars(input), chars(text)],
        ],
      );
    case "nato-phonetic-alphabet-converter": {
      const alphabet =
        "Alfa Bravo Charlie Delta Echo Foxtrot Golf Hotel India Juliett Kilo Lima Mike November Oscar Papa Quebec Romeo Sierra Tango Uniform Victor Whiskey X-ray Yankee Zulu".split(
          " ",
        );
      return table(
        "Letter-by-letter phonetic guide",
        ["Position", "Character", "Spoken word"],
        [...input]
          .slice(0, 100)
          .map((c, i) => [
            i + 1,
            c === " " ? "(space)" : c,
            /^[a-z]$/i.test(c)
              ? alphabet[c.toUpperCase().charCodeAt(0) - 65]!
              : "Unchanged",
          ]),
        "Showing the first 100 characters. Latin letters map to NATO phonetic words; other characters remain unchanged.",
      );
    }
    case "rot13-caesar-cipher":
      return table(
        "Cipher alphabet mapping",
        ["Original letter", "Shifted letter"],
        [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"].map((c, i) => [
          c,
          String.fromCharCode(65 + ((((i + n("shift")) % 26) + 26) % 26)),
        ]),
        `Shift: ${v.shift}. This substitution is reversible and unsuitable for protecting secrets. Non-Latin characters remain unchanged.`,
      );
    case "url-parser": {
      const url = new URL(input.trim());
      return table(
        "Query parameters in order",
        ["Position", "Parameter", "Decoded value"],
        [...url.searchParams]
          .slice(0, 200)
          .map(([key, value], i) => [i + 1, key, value]),
        "Duplicate parameter names are preserved. Values are decoded using URL query rules; no request is sent to this destination.",
      );
    }
    case "timestamp-converter": {
      const ms =
        v.mode === "iso"
          ? Date.parse(input.trim())
          : Number(input.trim()) * (v.mode === "seconds" ? 1000 : 1);
      return table(
        "Timestamp equivalents",
        ["Representation", "Value"],
        [
          ["Unix seconds", ms / 1000],
          ["Unix milliseconds", ms],
          ["UTC ISO", new Date(ms).toISOString()],
          [
            "UTC weekday",
            new Date(ms).toLocaleDateString("en-US", {
              weekday: "long",
              timeZone: "UTC",
            }),
          ],
        ],
        "All representations describe the same instant. UTC has no daylight-saving adjustment; seconds and milliseconds differ by 1,000.",
      );
    }
    case "json-to-csv-converter": {
      const data = JSON.parse(input) as Record<string, unknown>[];
      const headers = [...new Set(data.flatMap(Object.keys))];
      return table(
        "CSV column audit",
        ["Column", "Present values", "Missing / null values"],
        headers.map((header) => [
          header,
          data.filter(
            (row) => Object.hasOwn(row, header) && row[header] !== null,
          ).length,
          data.filter(
            (row) => !Object.hasOwn(row, header) || row[header] === null,
          ).length,
        ]),
        `${data.length} records and ${headers.length} columns. Formula-like values are escaped in the CSV output. Missing values become empty cells; review the column coverage before importing.`,
      );
    }
    case "uuid-generator":
      return table(
        "UUID batch inspection",
        ["UUID", "Version", "Variant", "Characters"],
        nonempty(text).map((uuid) => [
          uuid,
          uuid[14]!,
          /^[89ab]$/i.test(uuid[19]!) ? "RFC variant" : "Other",
          uuid.length,
        ]),
        "Each value is a cryptographically generated UUID v4. The fixed version and variant positions distinguish the format from a generic random string.",
      );
    case "hash-generator":
      return table(
        "Digest specification",
        ["Property", "Value"],
        [
          ["Algorithm", o.algorithm],
          ["Input UTF-8 bytes", new TextEncoder().encode(input).length],
          ["Hex characters", text.length],
          ["Digest bits", text.length * 4],
          ["Input whitespace", "Included exactly"],
        ],
        "The digest changes with every input byte. SHA-1 is retained for compatibility, not recommended for collision-resistant security uses. A plain digest is not a password-storage algorithm.",
      );
    case "jwt-decoder": {
      const parts = input.trim().split(".");
      const decode = (part: string): unknown =>
        JSON.parse(
          new TextDecoder().decode(
            Uint8Array.from(
              atob(part.replace(/-/g, "+").replace(/_/g, "/")),
              (c) => c.charCodeAt(0),
            ),
          ),
        );
      const rows: (string | number)[][] = [];
      for (const [section, part] of [
        ["Header", parts[0]!],
        ["Payload", parts[1]!],
      ]) {
        const decoded = decode(part!);
        const entries: [string, unknown][] =
          decoded !== null && typeof decoded === "object"
            ? Object.entries(decoded)
            : [["(root)", decoded]];
        entries
          .slice(0, 100)
          .forEach(([key, value]) =>
            rows.push([
              section!,
              key,
              (JSON.stringify(value) ?? "undefined").slice(0, 500),
              ["exp", "iat", "nbf"].includes(key) &&
              typeof value === "number" &&
              Number.isFinite(new Date(value * 1000).getTime())
                ? new Date(value * 1000).toISOString()
                : "—",
            ]),
          );
      }
      return table(
        "Unverified JWT claims",
        ["Section", "Claim", "Value", "UTC timestamp"],
        rows,
        "Signature NOT verified. Displayed claims and timestamps cannot establish identity, permissions, expiry enforcement or trust. Up to 100 claims per section are shown.",
      );
    }
    case "utm-builder": {
      const url = new URL(text);
      return table(
        "Campaign tracking parameters",
        ["Parameter", "Encoded value", "Readable value"],
        [...url.searchParams].map(([key, value]) => [
          key,
          encodeURIComponent(value),
          value,
        ]),
        `Destination: ${url.origin}${url.pathname}. Review source, medium and campaign naming before sharing. Existing query parameters are retained unless replaced by the campaign fields.`,
      );
    }
    case "meta-tag-generator":
      return {
        ...table(
          "Metadata field checks",
          ["Field", "Characters", "Value"],
          [
            ["Title", chars(v.title ?? ""), v.title ?? ""],
            ["Description", chars(v.description ?? ""), v.description ?? ""],
            ["Canonical URL", chars(v.url ?? ""), v.url ?? ""],
            ["Share image", chars(v.image ?? ""), v.image || "Not supplied"],
          ],
          "Preview is illustrative; search engines and social networks may use different snippets. Generated HTML is escaped text, never rendered as executable markup.",
        ),
        preview: {
          title: v.title!,
          description: v.description!,
          host: new URL(v.url!).hostname,
        },
      };
    case "open-graph-preview-generator":
      return {
        ...table(
          "Social preview truncation",
          ["Field", "Original characters", "Preview characters"],
          [
            [
              "Title",
              chars(v.title ?? ""),
              chars(String(val("Title (as shown, ~60 chars)"))),
            ],
            [
              "Description",
              chars(v.description ?? ""),
              chars(String(val("Description (as shown, ~155 chars)"))),
            ],
          ],
          "This is an illustrative link card. It does not fetch the page or check cached social metadata.",
        ),
        preview: {
          title: String(val("Title (as shown, ~60 chars)")),
          description: String(val("Description (as shown, ~155 chars)")),
          host: String(val("Display link")),
        },
      };
    case "sitemap-generator": {
      const source = nonempty(input).map((url) => new URL(url).href);
      return table(
        "Sitemap URL inventory",
        ["Position", "Canonicalized URL", "Input occurrences"],
        frequency(source).map(([url, count], i) => [i + 1, url, count]),
        "Duplicate URLs are emitted once. This inventory validates URL syntax and origin, not crawlability, HTTP status, canonical tags or search indexing.",
      );
    }
    case "hashtag-generator":
      return table(
        "Cleaned hashtag list",
        ["Position", "Hashtag", "Characters"],
        String(val("Hashtags"))
          .split(" ")
          .map((tag, i) => [i + 1, tag, chars(tag)]),
        "Exact duplicates are removed after cleaning. This is a formatting report, not popularity research or a promise of reach.",
      );
    case "social-media-character-counter": {
      const count = chars(input);
      return table(
        "Compare platform character budgets",
        ["Platform reference", "Limit", "Remaining", "Status"],
        Object.entries({
          X: 280,
          Threads: 500,
          Instagram: 2200,
          LinkedIn: 3000,
          Facebook: 63206,
        }).map(([platform, limit]) => [
          platform,
          limit,
          limit - count,
          count > limit
            ? `Remove ${count - limit} characters`
            : "Within reference limit",
        ]),
        "Uses Unicode code points. These are the tool's reference limits; account tiers, URLs and platform-specific counting can change the actual limit.",
      );
    }
    case "password-generator":
    case "pin-code-generator":
      return table(
        slug === "password-generator"
          ? "Password batch checks"
          : "PIN batch checks",
        ["Item", "Length", "Format check"],
        nonempty(text).map((entry, i) => [
          i + 1,
          chars(entry),
          slug === "pin-code-generator"
            ? /^\d+$/.test(entry)
              ? "Digits only; leading zeros retained"
              : "Check format"
            : "Random draw from selected character sets",
        ]),
        "Secrets are shown only in the main output, not repeated in this report. Selected character sets are allowed, not guaranteed to appear in each generated password. Copy to your password manager before resetting.",
      );
    case "password-strength-checker":
      return table(
        "Password characteristics, not a security guarantee",
        ["Check", "Observation"],
        [
          ["Unicode length", chars(input)],
          ["Distinct characters", new Set(input).size],
          [
            "Repeated characters",
            /(.)\1{2}/u.test(input)
              ? "Repeated run found"
              : "No run of 3 identical characters",
          ],
          [
            "Common patterns",
            /password|qwerty|123456|letmein|admin/i.test(input)
              ? "Predictable text found"
              : "No match in this small local pattern list",
          ],
          ["Breach database", "Not checked"],
          [
            "Randomness assumption",
            "The entropy estimate assumes independent random choices",
          ],
        ],
        "A human-chosen phrase can be predictable despite a high character-pool score. No password or hash is transmitted. Do not treat the score as approval to reuse a password.",
      );
    case "coin-flip":
      return table(
        "Coin flip distribution",
        [
          "Outcome",
          "Observed count",
          "Observed share (%)",
          "Expected share (%)",
        ],
        ["Heads", "Tails"].map((face) => [
          face,
          val(face),
          (Number(val(face)) / n("count")) * 100,
          50,
        ]),
        "Observed proportions can differ substantially from 50% in short runs. These counts describe this run and do not predict the next flip.",
      );
    case "dice-roller":
      return table(
        "Individual dice results",
        ["Die", "Roll", "Possible range"],
        String(val("Rolls"))
          .split(", ")
          .map((roll, i) => [i + 1, Number(roll), `1–${v.sides}`]),
        `The total adds ${v.count} independent dice. Expected average per die: ${fmt((n("sides") + 1) / 2)}; it is not a prediction of this roll.`,
      );
    case "random-number-generator":
      return table(
        "Random draw frequencies",
        ["Value", "Occurrences"],
        frequency(nonempty(text)),
        `Range ${v.min} to ${v.max}, inclusive. ${v.count} draws with replacement; repeats are allowed. The table groups equal results.`,
      );
    case "random-name-picker": {
      const names = nonempty(input);
      return table(
        "Name draw transparency",
        ["Entry", "Tickets in list", "Chance per draw (%)", "This draw"],
        frequency(names).map(([name, count]) => [
          name,
          count,
          (count / names.length) * 100,
          name === text ? "Selected" : "",
        ]),
        "Each nonempty input line is one ticket. Repeating a name increases its chance. Trimmed empty lines are ignored.",
      );
    }
    case "lottery-number-generator":
      return table(
        "Lottery draw pools",
        ["Pool", "Selected numbers", "Count", "Allowed range"],
        [
          ["Main", val("Main numbers"), n("mainCount"), `1–${v.mainMax}`],
          ...(n("bonusCount") > 0
            ? [
                [
                  "Bonus",
                  val("Bonus numbers"),
                  n("bonusCount"),
                  `1–${v.bonusMax}`,
                ],
              ]
            : []),
        ],
        "Numbers are unique within each pool. Main and bonus pools are independent, so the same number can appear in both. These picks do not improve winning odds.",
      );
    case "percentage-calculator":
      return table(
        "Percentage calculation breakdown",
        ["Input / operation", "Value"],
        [
          [
            "Calculation",
            v.mode === "of"
              ? "A percent of B"
              : v.mode === "is"
                ? "A as percent of B"
                : "Change from A to B",
          ],
          ["A", n("a")],
          ["B", n("b")],
          ["Result", val("Result")],
        ],
        "Use the substituted calculation below to verify the denominator. Percentage change uses the absolute starting value; percentage points are a different comparison.",
      );
    case "discount-calculator":
      return table(
        "Sale price comparison",
        ["Discount (%)", "Savings", "Sale price"],
        [...new Set([0, 10, 20, 25, 50, n("percentOff")])]
          .sort((a, b) => a - b)
          .map((rate) => [
            rate,
            (n("price") * rate) / 100,
            n("price") * (1 - rate / 100),
          ]),
        "Compare the same original price at common discount rates. Tax, shipping and stacked discounts are excluded.",
      );
    case "tip-calculator":
      return table(
        "Bill splitting ledger",
        ["Component", "Whole bill", "Per person"],
        [
          ["Before tip", n("bill"), n("bill") / n("people")],
          ["Tip", val("Tip"), Number(val("Tip")) / n("people")],
          ["Total", val("Total"), val("Per person")],
        ],
        `${v.people} people share the bill equally. Display rounding may leave a cent to allocate separately.`,
      );
    case "ratio-calculator": {
      const simplified = String(val("Simplified ratio")).split(":").map(Number);
      return table(
        "Equivalent ratios",
        ["Multiplier", "First side", "Second side"],
        [1, 2, 3, 5, 10].map((multiple) => [
          multiple,
          simplified[0]! * multiple,
          simplified[1]! * multiple,
        ]),
        `Original ratio ${v.a}:${v.b}. Dividing both sides by their greatest common divisor preserves the proportion.`,
      );
    }
    case "average-calculator": {
      const ns = input
        .trim()
        .split(/[\s,]+/)
        .map(Number)
        .sort((a, b) => a - b);
      return table(
        "Sorted distribution & frequency",
        ["Value", "Occurrences", "Contribution to sum"],
        frequency(ns.map(String))
          .sort((a, b) => Number(a[0]) - Number(b[0]))
          .slice(0, 200)
          .map(([value, count]) => [
            Number(value),
            count,
            Number(value) * count,
          ]),
        `Sum = ${fmt(ns.reduce((a, b) => a + b, 0))}. Mean = sum ÷ ${ns.length}. Median comes from the middle sorted value(s). Up to 200 distinct values are shown.`,
      );
    }
    case "gpa-calculator": {
      const scale: Record<string, number> = {
        "A+": 4,
        A: 4,
        "A-": 3.7,
        "B+": 3.3,
        B: 3,
        "B-": 2.7,
        "C+": 2.3,
        C: 2,
        "C-": 1.7,
        "D+": 1.3,
        D: 1,
        "D-": 0.7,
        F: 0,
      };
      return table(
        "Course-by-course GPA calculation",
        ["Course", "Grade", "Credits", "Grade points", "Weighted points"],
        nonempty(input).map((line, i) => {
          const [grade, credit] = line.split(",");
          const g = grade!.trim().toUpperCase();
          return [
            i + 1,
            g,
            Number(credit),
            scale[g]!,
            Number(credit) * scale[g]!,
          ];
        }),
        "GPA = total weighted points ÷ total credits. This 4.0 scale treats A+ and A as 4.0. Institution-specific rules may differ.",
      );
    }
    case "work-hours-calculator":
      return table(
        "Shift-by-shift timesheet",
        [
          "Shift",
          "Start",
          "End",
          "Day rollover",
          "Break minutes",
          "Worked hours",
        ],
        nonempty(input).map((line, i) => {
          const [start, end, brk = "0"] = line.split(",").map((s) => s.trim());
          const minutes = (s: string) =>
            Number(s.split(":")[0]) * 60 + Number(s.split(":")[1]);
          const overnight = minutes(end!) <= minutes(start!);
          return [
            i + 1,
            start!,
            end!,
            overnight ? "Next day" : "Same day",
            Number(brk),
            (minutes(end!) +
              (overnight ? 1440 : 0) -
              minutes(start!) -
              Number(brk)) /
              60,
          ];
        }),
        "Breaks are deducted from each shift. An end time equal to the start time means a 24-hour shift before breaks. This is clock arithmetic; no overtime rules are applied.",
      );
    case "quadratic-equation-solver":
      return table(
        "Quadratic solution steps",
        ["Step", "Substitution / result"],
        [
          ["Equation", `${v.a}x² + (${v.b})x + (${v.c}) = 0`],
          ["Discriminant b² − 4ac", val("Discriminant")],
          [
            "Root type",
            Number(val("Discriminant")) > 0
              ? "Two distinct real roots"
              : Number(val("Discriminant")) === 0
                ? "One repeated real root"
                : "Complex conjugate pair",
          ],
          ...Object.entries(r).filter(([key]) => key.startsWith("Root")),
        ],
        "Real roots use a numerically stable quadratic formula. Displayed values are rounded; substitution residuals can reflect floating-point rounding.",
      );
    case "roman-numeral-converter": {
      const roman = v.mode === "to-roman" ? text : input.trim().toUpperCase();
      const map: Record<string, number> = {
        M: 1000,
        D: 500,
        C: 100,
        L: 50,
        X: 10,
        V: 5,
        I: 1,
      };
      const tokens = roman.match(/CM|CD|XC|XL|IX|IV|[MDCLXVI]/g) ?? [];
      return table(
        "Roman numeral decomposition",
        ["Group", "Value"],
        tokens.map((token) => [
          token,
          token.length === 2 ? map[token[1]!]! - map[token[0]!]! : map[token]!,
        ]),
        "Subtractive pairs are grouped before addition. Only conventional notation for integers 1–3,999 is accepted.",
      );
    }
    case "age-calculator":
      return table(
        "Age timeline",
        ["Milestone", "Date / value"],
        [
          ["Birth date", v.birth!],
          ["Reference date", v.asOf || o.localDate],
          [
            "Elapsed calendar age",
            `${val("Years")} years, ${val("Months")} months, ${val("Days")} days`,
          ],
          [
            "Total elapsed days",
            daysBetween(parseDate(v.birth!), parseDate(v.asOf || o.localDate)),
          ],
          [
            "Next birthday",
            date(v.asOf || o.localDate, Number(val("Days until birthday"))),
          ],
        ],
        "Calendar age and elapsed days describe the same interval differently. Leap-day birthdays use the tool's February-end anniversary convention.",
      );
    case "date-difference-calculator":
      return table(
        "Date interval in different units",
        ["Measure", "Value"],
        [
          ["Start", v.start!],
          ["End", v.end!],
          ["Elapsed days (end minus start)", val("Total days")],
          ["Inclusive calendar dates", Number(val("Total days")) + 1],
          ["Elapsed hours at 24 hours per day", Number(val("Total days")) * 24],
        ],
        "Date-only arithmetic uses UTC to avoid daylight-saving shifts. Inclusive counting adds one because it counts both endpoint dates.",
      );
    case "timezone-converter":
      return table(
        "Time zone comparison",
        ["Time zone", "Local date and time"],
        [
          [v.from!, `${v.date} ${v.time}`],
          [v.to!, Object.values(r)[0]!],
        ],
        "Read both the date and the time. Daylight-saving transitions can make an input time ambiguous or nonexistent; the converter validates those cases.",
      );
    case "bmi-calculator": {
      const weight = n("weight") * (v.units === "imperial" ? 0.45359237 : 1);
      const height = (n("height") * (v.units === "imperial" ? 2.54 : 1)) / 100;
      return table(
        "Adult BMI reference bands",
        ["Category", "BMI range", "Your result"],
        [
          [
            "Underweight",
            "Below 18.5",
            Number(val("BMI")) < 18.5 ? "In this band" : "",
          ],
          [
            "Healthy weight",
            "18.5 to below 25",
            Number(val("BMI")) >= 18.5 && Number(val("BMI")) < 25
              ? "In this band"
              : "",
          ],
          [
            "Overweight",
            "25 to below 30",
            Number(val("BMI")) >= 25 && Number(val("BMI")) < 30
              ? "In this band"
              : "",
          ],
          [
            "Obesity",
            "30 and above",
            Number(val("BMI")) >= 30 ? "In this band" : "",
          ],
        ],
        `BMI = ${fmt(weight)} kg ÷ (${fmt(height)} m)². CDC adult screening bands apply from age 20. This does not measure body composition or diagnose health.`,
      );
    }
    case "nutrition-calculator":
    case "macro-calculator": {
      const calories =
        slug === "nutrition-calculator"
          ? Number(val("Daily energy (kcal)"))
          : n("calories");
      return table(
        "Macronutrient energy breakdown",
        [
          "Nutrient",
          "Energy share (%)",
          "Calories",
          "Calories per gram",
          "Grams",
        ],
        [
          [
            "Protein",
            n("protein"),
            (calories * n("protein")) / 100,
            4,
            val("Protein (g)"),
          ],
          ["Fat", n("fat"), (calories * n("fat")) / 100, 9, val("Fat (g)")],
          [
            "Carbohydrate",
            100 - n("protein") - n("fat"),
            (calories * (100 - n("protein") - n("fat"))) / 100,
            4,
            val("Carbohydrate (g)"),
          ],
        ],
        `${fmt(calories)} kcal are allocated across three nutrients. ${slug === "nutrition-calculator" ? `Daily energy = resting estimate ${fmt(Number(val("Resting energy (kcal)")))} × activity ${v.activity}.` : "This splits your supplied energy target; it does not determine whether that target suits you."}`,
      );
    }
    case "bmr-calculator":
      return table(
        "Resting energy equation terms",
        ["Mifflin–St Jeor term", "Contribution (kcal/day)"],
        [
          ["10 × weight (kg)", 10 * n("weight")],
          ["6.25 × height (cm)", 6.25 * n("height")],
          ["−5 × age (years)", -5 * n("age")],
          ["Selected sex coefficient", v.sex === "male" ? 5 : -161],
        ],
        "Add the four terms to reproduce the resting-energy estimate. BMR is not total daily expenditure or an individual calorie prescription.",
      );
    case "ideal-weight-calculator":
      return table(
        "Devine formula components",
        ["Component", "Value"],
        [
          ["Selected baseline (kg)", v.sex === "male" ? 50 : 45.5],
          ["Height above 152.4 cm (inches)", (n("height") - 152.4) / 2.54],
          ["Adjustment (kg)", ((n("height") - 152.4) / 2.54) * 2.3],
          ["Reference weight (kg)", val("Ideal weight (kg)")],
          ["Reference weight (lb)", val("Ideal weight (lb)")],
        ],
        "Baseline + 2.3 kg per inch above five feet. A negative adjustment is an extrapolation below five feet. This clinical reference is not a personal target.",
      );
    case "body-fat-calculator":
      return table(
        "Body-fat measurement audit",
        ["Measurement", "Centimeters"],
        [
          ["Height", n("height")],
          ["Waist", n("waist")],
          ["Neck", n("neck")],
          ...(v.sex === "female" ? [["Hip", n("hip")]] : []),
          [
            "Circumference term used",
            v.sex === "female"
              ? n("waist") + n("hip") - n("neck")
              : n("waist") - n("neck"),
          ],
        ],
        "The logarithmic circumference formula is sensitive to tape placement and units. Recheck these measurements before interpreting the estimate; the descriptive category is not a diagnosis.",
      );
    case "waist-hip-ratio-calculator":
      return table(
        "Waist-to-hip calculation",
        ["Term", "Value"],
        [
          ["Waist (cm)", n("waist")],
          ["Hip (cm)", n("hip")],
          ["Waist ÷ hip", val("Waist-to-hip ratio")],
          ["Selected reference", v.sex!],
        ],
        "Both measurements must use the same unit. The ratio is a screening measure and cannot establish an individual's health risk by itself.",
      );
    case "water-intake-calculator":
      return table(
        "Water estimate in common units",
        ["Unit / component", "Amount"],
        [
          ["Base model (weight × 35 mL)", n("weight") * 35],
          [
            "Activity multiplier",
            (
              { sedentary: 1, moderate: 1.1, active: 1.2 } as Record<
                string,
                number
              >
            )[v.activity!]!,
          ],
          ["Modeled total (mL)", Number(val("Daily water (liters)")) * 1000],
          ["250 mL glasses", val("Daily water (250ml glasses)")],
        ],
        "This is the tool's simplified weight-based model, not a clinical hydration guideline. Food, climate, medication and medical conditions can change fluid needs.",
      );
    case "heart-rate-zone-calculator":
      return table(
        "Training zone reference",
        ["Zone", "Percentage of predicted maximum", "Lower bpm", "Upper bpm"],
        [50, 60, 70, 80, 90].map((percent, i) => [
          i + 1,
          `${percent}–${percent + 10}%`,
          Math.round(((220 - n("age")) * percent) / 100),
          Math.round(((220 - n("age")) * (percent + 10)) / 100),
        ]),
        `Predicted maximum = 220 − ${v.age} = ${220 - n("age")} bpm. Adjacent zone boundaries overlap after rounding. These are descriptive ranges, not medical exercise clearance.`,
      );
    case "pregnancy-due-date-calculator":
      return table(
        "Pregnancy date calculation",
        ["Date / adjustment", "Value"],
        [
          ["First day of last period", v.lastPeriod!],
          ["Reference date", v.asOf || o.localDate],
          ["Standard interval", "280 days"],
          ["Cycle-length adjustment", `${n("cycleLength") - 28} days`],
          ["Estimated due date", val("Estimated due date")],
        ],
        "The due date adjusts the conventional 280-day interval for your reported cycle length. Weeks pregnant are counted from the period date. Ultrasound and clinical assessment may date a pregnancy differently.",
      );
    case "ovulation-calculator":
      return table(
        "Estimated cycle timeline",
        ["Event", "Date"],
        [
          ["Period began", v.lastPeriod!],
          ["Estimated fertile window begins", val("Fertile window start")],
          ["Estimated ovulation", val("Estimated ovulation day")],
          ["Estimated fertile window ends", val("Fertile window end")],
          ["Next expected period", val("Next expected period")],
        ],
        "This calendar model assumes ovulation 14 days before the next period. It cannot confirm ovulation and must not be used as contraception.",
      );
    case "sleep-cycle-calculator":
      return table(
        "Sleep window comparison",
        [
          "Cycles",
          "Modeled sleep hours",
          v.direction === "wake" ? "Go to bed" : "Wake up",
          "Sleep-onset allowance",
        ],
        [6, 5, 4, 3].map((cycles) => [
          cycles,
          cycles * 1.5,
          r[`${cycles} cycles (${(cycles * 1.5).toFixed(1)}h sleep)`]!,
          "14 minutes",
        ]),
        `Planning from ${v.time}. Times wrap across midnight. Real cycles vary; listing a short window does not mean it provides adequate sleep.`,
      );
    case "calories-burned-calculator":
      return table(
        "Activity energy by duration",
        ["Minutes", "Estimated kcal"],
        [...new Set([15, 30, 45, 60, n("minutes")])]
          .sort((a, b) => a - b)
          .map((minutes) => [
            minutes,
            (Number(val("MET value used")) * n("weight") * minutes) / 60,
          ]),
        `Same activity (${v.activity}), weight ${v.weight} kg and MET ${val("MET value used")}. This model includes resting expenditure during the activity; it is not a measurement of net exercise calories.`,
      );
    case "gst-calculator":
      return table(
        "Tax reconciliation",
        ["Component", "Amount"],
        [
          ["Base price", val("Base price")],
          ["GST", val("GST amount")],
          ["Total", val("Total price")],
          ["CGST (where applicable)", val("CGST + SGST (each)")],
          ["SGST (where applicable)", val("CGST + SGST (each)")],
        ],
        "CGST and SGST are an alternative split of the same GST amount, not additional taxes to add again. Confirm the actual tax treatment separately.",
      );
    case "roi-calculator":
      return table(
        "Investment proceeds reconciliation",
        ["Component", "Amount / percent"],
        [
          ["Original cost", n("cost")],
          ["Total proceeds", n("proceeds")],
          ["Net gain or loss", val("Net gain")],
          ["Total ROI (%)", val("ROI (%)")],
        ],
        "Proceeds must include the amounts you intend to count as returns. This total ROI is not annualized and does not include omitted fees or tax.",
      );
    case "break-even-calculator": {
      const units = Number(val("Whole units to break even"));
      return table(
        "Profit around break-even",
        ["Units sold", "Revenue", "Total cost", "Profit / loss"],
        [...new Set([Math.max(0, units - 1), units, units + 1])].map(
          (count) => [
            count,
            count * n("price"),
            n("fixed") + count * n("variable"),
            count * (n("price") - n("variable")) - n("fixed"),
          ],
        ),
        "The first whole-unit count with nonnegative profit covers fixed and variable costs. This comparison shows why rounding up matters.",
      );
    }
    case "net-worth-calculator":
      return table(
        "Assets and liabilities ledger",
        ["Type", "Description", "Amount", "Effect on net worth"],
        ["assets", "liabilities"].flatMap((key) =>
          nonempty(v[key] ?? "").map((line) => {
            const at = line.lastIndexOf(",");
            const amount = Number(line.slice(at + 1));
            return [
              key === "assets" ? "Asset" : "Liability",
              line.slice(0, at).trim(),
              amount,
              key === "assets" ? amount : -amount,
            ];
          }),
        ),
        "Net worth adds assets and subtracts liabilities. Use the same currency and valuation date throughout; no exchange-rate conversion is performed.",
      );
    case "receipt-maker":
      return table(
        "Receipt verification checklist",
        ["Field", "Value to verify"],
        [
          ["Reference", v.reference!],
          ["Payment date", v.date!],
          ["Payer", v.payer!],
          ["Payee", v.payee!],
          ["Amount and currency", `${v.currency} ${v.amount}`],
          ["Payment method", v.method!],
        ],
        "Check these details against the actual payment before issuing the draft. Creating a receipt does not confirm settlement.",
      );
    case "sip-calculator":
    case "compound-interest-calculator":
    case "savings-goal-calculator":
    case "fd-calculator":
    case "rd-calculator":
    case "emi-loan-calculator":
    case "mortgage-calculator":
    case "simple-interest-calculator":
    case "inflation-calculator":
      return table(
        (
          {
            "sip-calculator": "SIP assumption ledger",
            "compound-interest-calculator": "Compounding assumption ledger",
            "savings-goal-calculator": "Savings target assumptions",
            "fd-calculator": "Fixed deposit assumptions",
            "rd-calculator": "Recurring deposit assumptions",
            "emi-loan-calculator": "Loan repayment assumptions",
            "mortgage-calculator": "Mortgage payment components",
            "simple-interest-calculator": "Simple interest assumptions",
            "inflation-calculator": "Inflation scenario assumptions",
          } as Record<string, string>
        )[slug]!,
        ["Assumption", "Value"],
        Object.entries(v).map(([key, value]) => [
          (
            {
              monthly: "Monthly contribution",
              principal: "Starting principal",
              rate: "Annual rate (%)",
              years: "Years",
              months: "Months",
              current: "Current savings",
              goal: "Target balance",
              timing: "Deposit timing",
              currency: "Display currency",
              frequency: "Compounding periods per year",
              price: "Home price",
              down: "Down payment",
              tax: "Annual property tax",
              insurance: "Annual insurance",
              amount: "Starting amount",
            } as Record<string, string>
          )[key] ?? key,
          value,
        ]),
        "These are the inputs behind the current result. Use the period schedule to reconcile opening balance, cash flows, interest or cost increases, and closing balance.",
      );
    default: {
      if (unitFactors[slug] || slug === "temperature-converter")
        return table(
          "Conversion input audit",
          ["Property", "Value"],
          [
            ["Input", v.value!],
            ["From unit", v.from!],
            ["To unit", v.to!],
          ],
          "The reference table below expresses the same quantity in all supported units. Significant digits are retained for small conversions.",
        );
      throw new Error(`Missing individual result report for ${slug}.`);
    }
  }
}
