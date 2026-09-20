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
  expect(added).toHaveLength(44);
  expect(new Set(added.map((t) => t.category))).toEqual(
    new Set(categories.map((c) => c.name)),
  );
  for (const slug of expansionSlugs) {
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
it.each([
  [
    "macro-calculator",
    { calories: "2000", protein: "30", fat: "30" },
    {
      "Protein (g)": 150,
      "Fat (g)": 66.666666666666671,
      "Carbohydrate (g)": 200,
    },
  ],
  [
    "macro-calculator",
    { calories: "2500", protein: "25", fat: "25" },
    {
      "Protein (g)": 156.25,
      "Fat (g)": 69.444444444444443,
      "Carbohydrate (g)": 312.5,
    },
  ],
])("%s matches independent arithmetic", (slug, values, expected) => {
  expect(run(slug, "", values)).toEqual(expected);
});
it("rejects a macro split that exceeds 100% combined", () => {
  expect(() =>
    run("macro-calculator", "", { calories: "2000", protein: "70", fat: "40" }),
  ).toThrow();
});
it("computes sleep-cycle bedtimes and wake times across midnight", () => {
  expect(
    run("sleep-cycle-calculator", "", { direction: "wake", time: "07:00" }),
  ).toEqual({
    "6 cycles (9.0h sleep)": "21:46",
    "5 cycles (7.5h sleep)": "23:16",
    "4 cycles (6.0h sleep)": "00:46",
    "3 cycles (4.5h sleep)": "02:16",
  });
  expect(
    run("sleep-cycle-calculator", "", { direction: "sleep", time: "23:00" }),
  ).toEqual({
    "6 cycles (9.0h sleep)": "08:14",
    "5 cycles (7.5h sleep)": "06:44",
    "4 cycles (6.0h sleep)": "05:14",
    "3 cycles (4.5h sleep)": "03:44",
  });
  expect(() =>
    run("sleep-cycle-calculator", "", { direction: "wake", time: "25:00" }),
  ).toThrow();
});
it.each([
  [
    "walking-4mph",
    "70",
    "30",
    { "Calories burned (kcal)": 175, "MET value used": 5 },
  ],
  [
    "running-6mph",
    "70",
    "45",
    { "Calories burned (kcal)": 514.5, "MET value used": 9.8 },
  ],
])(
  "calories-burned-calculator computes %s calories",
  (activity, weight, minutes, expected) => {
    expect(
      run("calories-burned-calculator", "", { activity, weight, minutes }),
    ).toEqual(expected);
  },
);
it("computes a mortgage payment split into principal/interest and tax/insurance", () => {
  expect(
    run("mortgage-calculator", "", {
      price: "300000",
      down: "60000",
      rate: "6",
      years: "30",
      tax: "0",
      insurance: "0",
    }),
  ).toMatchObject({ "Loan amount": 240000 });
  const withEscrow = run("mortgage-calculator", "", {
    price: "300000",
    down: "60000",
    rate: "6",
    years: "30",
    tax: "3600",
    insurance: "1200",
  }) as Record<string, number>;
  expect(withEscrow["Monthly principal & interest"]).toBeCloseTo(
    1438.9212603666167,
    6,
  );
  expect(withEscrow["Monthly tax & insurance"]).toBe(400);
  expect(withEscrow["Total monthly payment"]).toBeCloseTo(
    1838.9212603666167,
    6,
  );
  expect(() =>
    run("mortgage-calculator", "", {
      price: "100000",
      down: "100000",
      rate: "6",
      years: "30",
      tax: "0",
      insurance: "0",
    }),
  ).toThrow();
});
it("reuses quarterly compound interest for a fixed deposit", () => {
  const result = run("fd-calculator", "", {
    principal: "100000",
    rate: "7",
    years: "5",
  }) as Record<string, number>;
  expect(result["Maturity amount"]).toBeCloseTo(141477.81957557995, 5);
  expect(result["Interest earned"]).toBeCloseTo(41477.81957557995, 5);
});
it("simulates a recurring deposit with quarterly-compounded interest", () => {
  expect(
    run("rd-calculator", "", { monthly: "1000", rate: "8", months: "3" }),
  ).toEqual({
    "Maturity amount": 3060,
    "Total invested": 3000,
    "Interest earned": 60,
  });
  const sixMonths = run("rd-calculator", "", {
    monthly: "1000",
    rate: "8",
    months: "6",
  }) as Record<string, number>;
  expect(sixMonths["Maturity amount"]).toBeCloseTo(6181.2, 6);
  expect(sixMonths["Total invested"]).toBe(6000);
  expect(sixMonths["Interest earned"]).toBeCloseTo(181.2, 6);
});
it("projects a future equivalent value for inflation", () => {
  const result = run("inflation-calculator", "", {
    amount: "1000",
    rate: "6",
    years: "10",
  }) as Record<string, number>;
  expect(result["Future equivalent value"]).toBeCloseTo(1790.8476965428547, 6);
  expect(result["Additional amount needed"]).toBeCloseTo(790.8476965428547, 6);
});
it("sums assets and liabilities into a net worth", () => {
  expect(
    run("net-worth-calculator", "", {
      assets: "Savings, 500000\nCar, 300000",
      liabilities: "Home loan, 1200000\nCredit card, 15000",
    }),
  ).toEqual({
    "Total assets": 800000,
    "Total liabilities": 1215000,
    "Net worth": -415000,
  });
  expect(() =>
    run("net-worth-calculator", "", {
      assets: "Savings 500000",
      liabilities: "",
    }),
  ).toThrow();
});
it("weights grades by credits for a 4.0-scale GPA", () => {
  expect(run("gpa-calculator", "A,3\nB+,4\nA-,3", {})).toEqual({
    GPA: 3.63,
    "Total credits": 10,
  });
  expect(() => run("gpa-calculator", "Z,3", {})).toThrow();
  expect(() => run("gpa-calculator", "A,0", {})).toThrow();
});
it("solves quadratics with real, repeated, and complex roots", () => {
  expect(
    run("quadratic-equation-solver", "", { a: "1", b: "-3", c: "2" }),
  ).toEqual({ "Root 1": 2, "Root 2": 1, Discriminant: 1 });
  expect(
    run("quadratic-equation-solver", "", { a: "1", b: "-4", c: "4" }),
  ).toEqual({ Root: 2, Discriminant: 0 });
  expect(
    run("quadratic-equation-solver", "", { a: "1", b: "2", c: "5" }),
  ).toEqual({ "Root 1": "-1 + 2i", "Root 2": "-1 - 2i", Discriminant: -16 });
  expect(() =>
    run("quadratic-equation-solver", "", { a: "0", b: "2", c: "5" }),
  ).toThrow();
});
it("sums worked hours across shifts, handling overnight shifts", () => {
  expect(
    run("work-hours-calculator", "09:00,17:30,30\n09:00,18:00,60", {}),
  ).toEqual({ "Total hours": 16, "Total shifts": 2 });
  expect(run("work-hours-calculator", "22:00,06:00,30", {})).toEqual({
    "Total hours": 7.5,
    "Total shifts": 1,
  });
  expect(() => run("work-hours-calculator", "09:00,10:00,120", {})).toThrow();
});
it("converts wall-clock time between time zones independent of host time zone", () => {
  expect(
    run("timezone-converter", "", {
      date: "2026-01-15",
      time: "12:00",
      from: "Asia/Kolkata",
      to: "UTC",
    }),
  ).toEqual({ "Time in UTC": "2026-01-15 06:30" });
  expect(
    run("timezone-converter", "", {
      date: "2026-01-15",
      time: "06:30",
      from: "UTC",
      to: "America/New_York",
    }),
  ).toEqual({ "Time in America/New_York": "2026-01-15 01:30" });
  expect(
    run("timezone-converter", "", {
      date: "2026-07-15",
      time: "09:00",
      from: "America/Los_Angeles",
      to: "UTC",
    }),
  ).toEqual({ "Time in UTC": "2026-07-15 16:00" });
  expect(() =>
    run("timezone-converter", "", {
      date: "2026-01-15",
      time: "25:00",
      from: "UTC",
      to: "UTC",
    }),
  ).toThrow();
});
it("converts between integers and canonical Roman numerals", () => {
  expect(run("roman-numeral-converter", "1994", { mode: "to-roman" })).toBe(
    "MCMXCIV",
  );
  expect(run("roman-numeral-converter", "58", { mode: "to-roman" })).toBe(
    "LVIII",
  );
  expect(run("roman-numeral-converter", "3999", { mode: "to-roman" })).toBe(
    "MMMCMXCIX",
  );
  expect(run("roman-numeral-converter", "MCMXCIV", { mode: "to-number" })).toBe(
    "1994",
  );
  expect(() =>
    run("roman-numeral-converter", "4000", { mode: "to-roman" }),
  ).toThrow();
  expect(() =>
    run("roman-numeral-converter", "IIII", { mode: "to-number" }),
  ).toThrow();
});
it("truncates title and description to common social-share limits", () => {
  expect(
    run("open-graph-preview-generator", "", {
      title: "Short title",
      description: "Short description",
      url: "https://example.com/blog/post",
    }),
  ).toEqual({
    "Title (as shown, ~60 chars)": "Short title",
    "Description (as shown, ~155 chars)": "Short description",
    "Display link": "example.com",
  });
  const longTitle = "T".repeat(80);
  const truncated = run("open-graph-preview-generator", "", {
    title: longTitle,
    description: "",
    url: "https://example.com",
  }) as Record<string, string>;
  expect(truncated["Title (as shown, ~60 chars)"]).toHaveLength(60);
  expect(truncated["Title (as shown, ~60 chars)"]!.endsWith("…")).toBe(true);
  expect(() =>
    run("open-graph-preview-generator", "", {
      title: "",
      description: "",
      url: "https://example.com",
    }),
  ).toThrow();
});
it("counts characters against per-platform social limits", () => {
  expect(
    run("social-media-character-counter", "Hello world", { platform: "x" }),
  ).toEqual({ Characters: 11, Limit: 280, Remaining: 269 });
  expect(
    run("social-media-character-counter", "🚀🚀", { platform: "x" }),
  ).toEqual({ Characters: 2, Limit: 280, Remaining: 278 });
});
it("scores password strength from character-pool entropy", () => {
  expect(run("password-strength-checker", "Tr0ub4dor&3", {})).toEqual({
    Strength: "Strong",
    "Estimated entropy (bits)": 72.26841169164042,
    Length: 11,
  });
  expect(
    (run("password-strength-checker", "abc", {}) as Record<string, string>)
      .Strength,
  ).toBe("Weak");
  expect(
    (run("password-strength-checker", "password", {}) as Record<string, string>)
      .Strength,
  ).toBe("Weak");
  expect(() => run("password-strength-checker", "", {})).toThrow();
});
it("draws unique lottery numbers without replacement using injected randomness", () => {
  const draw = vi
    .fn()
    .mockReturnValueOnce(0)
    .mockReturnValueOnce(0)
    .mockReturnValueOnce(0);
  expect(
    run(
      "lottery-number-generator",
      "",
      { mainCount: "3", mainMax: "10", bonusCount: "0", bonusMax: "1" },
      draw,
    ),
  ).toEqual({ "Main numbers": "1, 2, 3" });
  expect(
    run(
      "lottery-number-generator",
      "",
      { mainCount: "2", mainMax: "5", bonusCount: "1", bonusMax: "3" },
      () => 0,
    ),
  ).toEqual({ "Main numbers": "1, 2", "Bonus numbers": "1" });
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
