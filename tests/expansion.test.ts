import { describe, expect, it, vi } from "vitest";
import {
  runExpansion as run,
  secureIndex,
  expansionSlugs,
} from "../src/features/tools/expansion/domain";
import {
  expansionFields,
  expansionSamples,
} from "../src/components/expansion-fields";
import { tools, categories } from "../src/lib/tool-registry";
const defaults = (slug: string) =>
  Object.fromEntries(
    (expansionFields[slug] ?? []).map((f) => [f.key, f.value ?? ""]),
  );
it("covers every category and runs every new form with its defaults", () => {
  const added = tools.filter(
    (t) =>
      expansionSlugs.includes(t.slug) ||
      [
        "image-format-converter",
        "image-rotator-flipper",
        "rotate-pdf",
        "add-page-numbers-to-pdf",
      ].includes(t.slug),
  );
  expect(added).toHaveLength(27);
  expect(new Set(added.map((t) => t.category))).toEqual(
    new Set(categories.map((c) => c.name)),
  );
  for (const slug of expansionSlugs) {
    expect(tools.find((t) => t.slug === slug)?.reviewed).toBe(false);
    expect(
      run(slug, expansionSamples[slug] ?? "", defaults(slug)),
    ).toBeDefined();
  }
});
it.each([
  ["weight-converter", "1", "kg", "g", 1000],
  ["weight-converter", "1", "lb", "kg", 0.45359237],
  ["length-converter", "1", "m", "cm", 100],
  ["length-converter", "1", "inch", "cm", 2.54],
  ["speed-converter", "10", "m/s", "km/h", 36],
  ["speed-converter", "60", "mph", "km/h", 96.56064],
  ["data-storage-converter", "1", "KiB", "B", 1024],
  ["data-storage-converter", "1", "GB", "MB", 1000],
] as const)("%s converts %s %s to %s", (slug, value, from, to, expected) => {
  expect(
    (run(slug, "", { value, from, to }) as Record<string, number>)[
      `Result (${to})`
    ],
  ).toBeCloseTo(expected, 8);
});
it("converts bases exactly beyond Number precision and checks each digit", () => {
  expect(run("number-base-converter", "255", { from: "10", to: "16" })).toBe(
    "FF",
  );
  expect(run("number-base-converter", "-101", { from: "2", to: "10" })).toBe(
    "-5",
  );
  expect(
    run("number-base-converter", "9007199254740993", { from: "10", to: "16" }),
  ).toBe("20000000000001");
  expect(() =>
    run("number-base-converter", "102", { from: "2", to: "10" }),
  ).toThrow();
  expect(() =>
    run("number-base-converter", "1".repeat(257), { from: "2", to: "10" }),
  ).toThrow();
});
it("encodes UTF-8 binary and rejects malformed or non-UTF-8 bytes", () => {
  expect(run("binary-text-converter", "A", { mode: "encode" })).toBe(
    "01000001",
  );
  expect(
    run("binary-text-converter", "01001000 01101001", { mode: "decode" }),
  ).toBe("Hi");
  expect(run("binary-text-converter", "é", { mode: "encode" })).toBe(
    "11000011 10101001",
  );
  for (const input of ["010", "22222222", "11111111"])
    expect(() =>
      run("binary-text-converter", input, { mode: "decode" }),
    ).toThrow();
});
it("parses links without accepting unsafe schemes or credentials", () => {
  expect(run("url-parser", "https://example.com/a?q=1#top", {})).toEqual({
    Scheme: "https:",
    Host: "example.com",
    Port: "Default",
    Path: "/a",
    Query: "?q=1",
    Fragment: "#top",
  });
  expect(run("url-parser", "http://example.com:8080/", {})).toMatchObject({
    Scheme: "http:",
    Port: "8080",
  });
  for (const input of [
    "javascript:alert(1)",
    "https://user:secret@example.com",
    "https://example.com/" + "a".repeat(2048),
  ])
    expect(() => run("url-parser", input, {})).toThrow();
});
it("handles UTC dates, negative timestamps, and rejects normalized invalid dates", () => {
  expect(run("timestamp-converter", "0", { mode: "seconds" })).toBe(
    "1970-01-01T00:00:00.000Z",
  );
  expect(
    run("timestamp-converter", "2000-01-01T00:00:00Z", { mode: "iso" }),
  ).toEqual({ "Unix seconds": 946684800, "Unix milliseconds": 946684800000 });
  expect(run("timestamp-converter", "-1", { mode: "milliseconds" })).toBe(
    "1969-12-31T23:59:59.999Z",
  );
  for (const input of [
    "2026-02-30T00:00:00Z",
    "2026-01-01T24:00:00Z",
    "2026-01-01",
  ])
    expect(() => run("timestamp-converter", input, { mode: "iso" })).toThrow();
});
it("quotes CSV, escapes spreadsheet formulas, and rejects nested data", () => {
  expect(run("json-to-csv-converter", '[{"a":1},{"a":2}]', {})).toBe(
    '"a"\r\n"1"\r\n"2"',
  );
  expect(
    run("json-to-csv-converter", '[{"name":"Ada","note":"a,b"}]', {}),
  ).toBe('"name","note"\r\n"Ada","a,b"');
  expect(
    run(
      "json-to-csv-converter",
      '[{"x":"=1+1"},{"x":"a\\\"b"},{"y":null}]',
      {},
    ),
  ).toBe('"x","y"\r\n"\'=1+1",""\r\n"a""b",""\r\n"",""');
  expect(() => run("json-to-csv-converter", '[{"x":[]}]', {})).toThrow();
  expect(() => run("json-to-csv-converter", "[]", {})).toThrow();
});
it.each([
  [
    "tip-calculator",
    "",
    { bill: "100", tip: "15", people: "2" },
    { Tip: 15, Total: 115, "Per person": 57.5 },
  ],
  [
    "tip-calculator",
    "",
    { bill: "80", tip: "0", people: "4" },
    { Tip: 0, Total: 80, "Per person": 20 },
  ],
  [
    "average-calculator",
    "2,4,6,8",
    {},
    { Count: 4, Mean: 5, Median: 5, Minimum: 2, Maximum: 8 },
  ],
  [
    "average-calculator",
    "1 1 7",
    {},
    { Count: 3, Mean: 3, Median: 1, Minimum: 1, Maximum: 7 },
  ],
  ["ratio-calculator", "", { a: "12", b: "18" }, { "Simplified ratio": "2:3" }],
  ["ratio-calculator", "", { a: "0", b: "5" }, { "Simplified ratio": "0:1" }],
  [
    "simple-interest-calculator",
    "",
    { principal: "1000", rate: "5", years: "2" },
    { Interest: 100, "Final amount": 1100 },
  ],
  [
    "simple-interest-calculator",
    "",
    { principal: "500", rate: "4", years: "0.5" },
    { Interest: 10, "Final amount": 510 },
  ],
  [
    "roi-calculator",
    "",
    { cost: "1000", proceeds: "1200" },
    { "Net gain": 200, "ROI (%)": 20 },
  ],
  [
    "roi-calculator",
    "",
    { cost: "200", proceeds: "150" },
    { "Net gain": -50, "ROI (%)": -25 },
  ],
  [
    "break-even-calculator",
    "",
    { fixed: "1000", price: "25", variable: "15" },
    { "Whole units to break even": 100, "Revenue at those units": 2500 },
  ],
  [
    "break-even-calculator",
    "",
    { fixed: "101", price: "20", variable: "10" },
    { "Whole units to break even": 11, "Revenue at those units": 220 },
  ],
  [
    "bmr-calculator",
    "",
    { sex: "male", weight: "70", height: "175", age: "30" },
    { "Estimated resting energy (kcal/day)": 1648.75 },
  ],
  [
    "bmr-calculator",
    "",
    { sex: "female", weight: "60", height: "160", age: "30" },
    { "Estimated resting energy (kcal/day)": 1289 },
  ],
])("%s matches independent arithmetic", (slug, input, values, expected) => {
  expect(
    run(slug as string, input as string, values as Record<string, string>),
  ).toEqual(expected);
});
it("creates escaped same-origin sitemap XML and removes duplicate URLs", () => {
  const result = run(
    "sitemap-generator",
    "https://example.com/\nhttps://example.com/",
    {},
  ) as string;
  expect(result).toContain("<url><loc>https://example.com/</loc></url>");
  expect(result.match(/<url>/g)).toHaveLength(1);
  expect(
    run("sitemap-generator", "https://example.com/?a=1&b=2", {}),
  ).toContain("a=1&amp;b=2");
  for (const input of ["", "https://a.com\nhttps://b.com", "https://a.com/#x"])
    expect(() => run("sitemap-generator", input, {})).toThrow();
});
it("formats supplied hashtags without claiming to discover tags", () => {
  expect(run("hashtag-generator", "design, tools, #design", {})).toEqual({
    Hashtags: "#design #tools",
    Count: 2,
  });
  expect(run("hashtag-generator", "Hello-world, #hello_world", {})).toEqual({
    Hashtags: "#Helloworld #hello_world",
    Count: 2,
  });
});
it("uses deterministic injected draws to verify random tool bounds", () => {
  expect(
    run("pin-code-generator", "", { length: "4", count: "1" }, () => 0),
  ).toBe("0000");
  expect(
    run("pin-code-generator", "", { length: "6", count: "2" }, () => 9),
  ).toBe("999999\n999999");
  const draw = vi.fn().mockReturnValueOnce(1).mockReturnValueOnce(4);
  expect(run("dice-roller", "", { sides: "6", count: "2" }, draw)).toEqual({
    Rolls: "2, 5",
    Total: 7,
  });
  expect(run("dice-roller", "", { sides: "20", count: "1" }, () => 19)).toEqual(
    { Rolls: "20", Total: 20 },
  );
  expect(
    run(
      "random-number-generator",
      "",
      { min: "7", max: "7", count: "2" },
      () => 0,
    ),
  ).toBe("7\n7");
  expect(
    run(
      "random-number-generator",
      "",
      { min: "-2", max: "2", count: "1" },
      (size) => size - 1,
    ),
  ).toBe("2");
  expect(run("random-name-picker", "Alex", {}, () => 0)).toBe("Alex");
  expect(run("random-name-picker", "Alex\nSam", {}, () => 1)).toBe("Sam");
});
it("rejects biased remainder samples for random selection", () => {
  const spy = vi.spyOn(crypto, "getRandomValues");
  spy
    .mockImplementationOnce((array) => {
      (array as Uint32Array)[0] = 0xffffffff;
      return array;
    })
    .mockImplementationOnce((array) => {
      (array as Uint32Array)[0] = 19;
      return array;
    });
  try {
    expect(secureIndex(10)).toBe(9);
    expect(spy).toHaveBeenCalledTimes(2);
  } finally {
    spy.mockRestore();
  }
});
it("creates a bounded receipt draft with valid dates", () => {
  const values = defaults("receipt-maker");
  expect(run("receipt-maker", "", values)).toContain("Amount: INR 100.00");
  expect(run("receipt-maker", "", { ...values, reference: "R-002" })).toContain(
    "Receipt: R-002\nDate: 2026-09-19",
  );
  expect(() =>
    run("receipt-maker", "", { ...values, date: "2026-02-30" }),
  ).toThrow();
  expect(() =>
    run("receipt-maker", "", { ...values, payer: "A\nAmount: 0" }),
  ).toThrow();
});
describe("input bounds and validation", () => {
  it("bounds all new tool inputs", () => {
    for (const slug of expansionSlugs)
      expect(() => run(slug, "a".repeat(100001), defaults(slug))).toThrow();
  });
  it.each([
    ["weight-converter", "", { value: "Infinity", from: "kg", to: "g" }],
    ["weight-converter", "", { value: "1", from: "kg", to: "invalid" }],
    ["tip-calculator", "", { bill: "100", tip: "15", people: "0" }],
    ["average-calculator", "", {}],
    ["ratio-calculator", "", { a: "0", b: "0" }],
    ["roi-calculator", "", { cost: "0", proceeds: "100" }],
    [
      "break-even-calculator",
      "",
      { fixed: "100", price: "10", variable: "10" },
    ],
    [
      "bmr-calculator",
      "",
      { weight: "70", height: "175", age: "10", sex: "male" },
    ],
    ["pin-code-generator", "", { length: "3", count: "1" }],
    ["dice-roller", "", { sides: "6", count: "101" }],
    ["random-number-generator", "", { min: "5", max: "2", count: "1" }],
    ["random-name-picker", " ", {}],
  ])("%s rejects invalid values", (slug, input, values) =>
    expect(() =>
      run(slug as string, input as string, values as Record<string, string>),
    ).toThrow(),
  );
});
it("calculates monetary break-even thresholds in cents", () => {
  expect(
    run("break-even-calculator", "", {
      fixed: "1000",
      price: "0.30",
      variable: "0.20",
    }),
  ).toEqual({
    "Whole units to break even": 10000,
    "Revenue at those units": 3000,
  });
  expect(() =>
    run("break-even-calculator", "", {
      fixed: "10",
      price: "0.301",
      variable: "0.20",
    }),
  ).toThrow("decimal");
});
