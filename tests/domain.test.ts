import { describe, it, expect } from "vitest";
import {
  wordCount,
  formatJson,
  base64,
  urlCode,
  slugify,
  percentage,
  age,
  uuids,
  utm,
  sip,
  bmi,
  nutrition,
  generatePasswords,
  flipCoins,
  emiLoan,
  compoundInterest,
  convertTemperature,
  discount,
  idealWeight,
  convertCase,
  hashText,
  decodeJwt,
  metaTags,
  dateDifference,
  pregnancyDueDate,
  ovulation,
  gst,
  waterIntake,
  bodyFat,
  waistHipRatio,
  heartRateZones,
  savingsGoal,
} from "../src/features/tools";
describe("word counter", () => {
  it("counts Unicode and contractions without markup interpretation", () => {
    expect(wordCount("Hello world!")).toEqual({
      Words: 2,
      Characters: 12,
      "Without spaces": 11,
      Sentences: 1,
      "Reading time (min)": 1,
    });
    expect(wordCount("don't re-enter café").Words).toBe(3);
    expect(wordCount("😊").Characters).toBe(1);
    expect(wordCount("").Sentences).toBe(0);
  });
  it("bounds input", () =>
    expect(() => wordCount("x".repeat(100001))).toThrow());
});
describe("JSON", () => {
  it("formats primitives and nested values", () => {
    expect(formatJson('{"a":[1,true]}')).toBe(
      '{\n  "a": [\n    1,\n    true\n  ]\n}',
    );
    expect(formatJson("null")).toBe("null");
    expect(formatJson("[1, 2]", true)).toBe("[1,2]");
  });
  it("reports syntax location and preserves text safely", () => {
    expect(() => formatJson('{\n"a":}')).toThrow(/line 2/);
    expect(formatJson('"<script>alert(1)</script>"')).toContain("<script>");
    expect(() => formatJson("")).toThrow();
  });
});
describe("encodings", () => {
  it("round-trips UTF-8", () => {
    for (const s of ["Hello", "✓", "你好 👋", ""])
      expect(base64(base64(s), true)).toBe(s);
    expect(base64("✓")).toBe("4pyT");
  });
  it("rejects malformed and non-UTF8 Base64", () => {
    for (const s of ["a", "====", "***=", "/w=="])
      expect(() => base64(s, true)).toThrow();
  });
  it("distinguishes component and full URI", () => {
    expect(urlCode("a&b")).toBe("a%26b");
    expect(urlCode("https://example.com/a b", false, true)).toBe(
      "https://example.com/a%20b",
    );
    expect(urlCode("%E2%9C%93", true)).toBe("✓");
    expect(() => urlCode("%XX", true)).toThrow();
  });
});
describe("slugs", () => {
  it("has explicit ASCII and Unicode policies", () => {
    expect(slugify(" Café & Crème! ")).toBe("cafe-creme");
    expect(slugify("Hello World", "_")).toBe("hello_world");
    expect(slugify("你好 世界", "-", true)).toBe("你好-世界");
    expect(slugify("你好")).toBe("");
  });
});
describe("percentages", () => {
  it("supports all modes and signed change", () => {
    expect(percentage(20, 150, "of")).toBe(30);
    expect(percentage(25, 100, "is")).toBe(25);
    expect(percentage(80, 100, "change")).toBe(25);
    expect(percentage(-100, -50, "change")).toBe(50);
  });
  it("rejects undefined and non-finite results", () => {
    expect(() => percentage(0, 1, "change")).toThrow();
    expect(() => percentage(1, 0, "is")).toThrow();
    expect(() => percentage(Infinity, 4, "of")).toThrow();
  });
});
describe("calendar age", () => {
  it("counts calendar dates and leap-day anniversaries", () => {
    expect(age("2000-01-15", "2026-09-12")).toMatchObject({
      Years: 26,
      Months: 7,
      Days: 28,
    });
    expect(age("2000-02-29", "2025-02-28")).toEqual({
      Years: 25,
      Months: 0,
      Days: 0,
      "Days until birthday": 0,
    });
    expect(age("2000-01-31", "2000-03-01")).toMatchObject({
      Years: 0,
      Months: 1,
      Days: 1,
    });
    expect(age("2000-02-29", "2024-02-28")).toMatchObject({
      Years: 23,
      Months: 11,
      Days: 30,
      "Days until birthday": 1,
    });
  });
  it("rejects invalid and inverted dates", () => {
    for (const pair of [
      ["2025-02-30", "2025-04-01"],
      ["2026-01-01", "2025-01-01"],
      ["not date", "2025-01-01"],
    ])
      expect(() => age(pair[0]!, pair[1]!)).toThrow();
  });
});
describe("UUIDs", () => {
  it("uses secure v4 identifiers with limits", () => {
    const list = uuids(100).split("\n");
    expect(new Set(list).size).toBe(100);
    for (const id of list)
      expect(id).toMatch(
        /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/,
      );
    expect(() => uuids(101)).toThrow();
    expect(() => uuids(1.5)).toThrow();
  });
});
describe("campaign links", () => {
  it("preserves existing query and fragment while replacing UTM", () => {
    const result = new URL(
      utm({
        url: "https://example.com/?x=1&utm_source=old&utm_term=old#top",
        source: "email",
        medium: "newsletter",
        campaign: "new launch",
      }),
    );
    expect(result.searchParams.get("x")).toBe("1");
    expect(result.searchParams.get("utm_source")).toBe("email");
    expect(result.searchParams.get("utm_campaign")).toBe("new launch");
    expect(result.searchParams.has("utm_term")).toBe(false);
    expect(result.hash).toBe("#top");
  });
  it("rejects active schemes and credentials", () => {
    for (const url of [
      "javascript:alert(1)",
      "https://user:password@example.com",
    ])
      expect(() =>
        utm({ url, source: "a", medium: "b", campaign: "c" }),
      ).toThrow();
  });
});
describe("SIP", () => {
  it("handles zero interest and contribution timing", () => {
    expect(sip(1000, 0, 10)).toEqual({
      "Invested amount": 120000,
      "Estimated returns": 0,
      "Estimated total": 120000,
    });
    expect(sip(1000, 12, 1, "end")["Estimated total"]).toBeCloseTo(
      12682.503,
      2,
    );
    expect(sip(1000, 12, 1, "start")["Estimated total"]).toBeCloseTo(
      12809.328,
      2,
    );
    expect(() => sip(-1, 10, 10)).toThrow();
  });
});
describe("adult health estimates", () => {
  it("classifies using unrounded BMI and age 20+", () => {
    expect(bmi(70, 175, 30).BMI).toBeCloseTo(22.857, 2);
    expect(bmi(100, 200, 30).Category).toBe("Overweight");
    expect(bmi(73.999, 200, 30).Category).toBe("Underweight");
    expect(() => bmi(70, 175, 19)).toThrow();
  });
  it("implements the published simplified resting-energy formula", () => {
    const result = nutrition({
      weight: 70,
      height: 175,
      age: 30,
      sex: "male",
      activity: 1.2,
      protein: 20,
      fat: 30,
    });
    expect(result["Resting energy (kcal)"]).toBe(1648.75);
    expect(result["Daily energy (kcal)"]).toBe(1978.5);
    expect(
      result["Protein (g)"] * 4 +
        result["Fat (g)"] * 9 +
        result["Carbohydrate (g)"] * 4,
    ).toBeCloseTo(1978.5);
    expect(() =>
      nutrition({
        weight: 70,
        height: 175,
        age: 17,
        sex: "male",
        activity: 1.2,
        protein: 20,
        fat: 30,
      }),
    ).toThrow();
    expect(() =>
      nutrition({
        weight: 70,
        height: 175,
        age: 30,
        sex: "male",
        activity: 1.2,
        protein: 35,
        fat: 35,
      }),
    ).toThrow();
  });
});
describe("password generator", () => {
  it("builds passwords from only the selected character sets", () => {
    let i = 0;
    const cyclic = (max: number) => i++ % max;
    const out = generatePasswords(
      {
        length: 10,
        count: 3,
        lower: true,
        upper: false,
        numbers: false,
        symbols: false,
      },
      cyclic,
    );
    const lines = out.split("\n");
    expect(lines).toHaveLength(3);
    for (const line of lines) {
      expect(line).toHaveLength(10);
      expect(line).toMatch(/^[a-z]+$/);
    }
  });
  it("requires a character set and bounds length and count", () => {
    expect(() =>
      generatePasswords({
        length: 10,
        count: 1,
        lower: false,
        upper: false,
        numbers: false,
        symbols: false,
      }),
    ).toThrow();
    expect(() =>
      generatePasswords({
        length: 200,
        count: 1,
        lower: true,
        upper: false,
        numbers: false,
        symbols: false,
      }),
    ).toThrow();
    expect(() =>
      generatePasswords({
        length: 10,
        count: 21,
        lower: true,
        upper: false,
        numbers: false,
        symbols: false,
      }),
    ).toThrow();
  });
});
describe("coin flip", () => {
  it("counts heads and tails from a deterministic sequence", () => {
    const sequence = [0.1, 0.9, 0.2, 0.8];
    let i = 0;
    const result = flipCoins(4, () => sequence[i++]!);
    expect(result).toEqual({
      Heads: 2,
      Tails: 2,
      Sequence: "Heads, Tails, Heads, Tails",
    });
  });
  it("omits the sequence above twenty flips and bounds the count", () => {
    const result = flipCoins(21, () => 0.1);
    expect(result.Sequence).toBeUndefined();
    expect(result.Heads).toBe(21);
    expect(() => flipCoins(0)).toThrow();
    expect(() => flipCoins(1001)).toThrow();
  });
});
describe("EMI loan calculator", () => {
  it("computes standard reducing-balance EMI", () => {
    const r = emiLoan(1000000, 8.5, 20);
    expect(r["Monthly EMI"]).toBeCloseTo(8678.232333655342, 6);
    expect(r["Total interest"]).toBeCloseTo(1082775.760077282, 3);
  });
  it("handles zero interest and rejects invalid input", () => {
    expect(emiLoan(120000, 0, 1)).toEqual({
      "Monthly EMI": 10000,
      "Total interest": 0,
      "Total payment": 120000,
    });
    expect(() => emiLoan(-1, 5, 5)).toThrow();
    expect(() => emiLoan(1000, 5, 0)).toThrow();
  });
});
describe("compound interest calculator", () => {
  it("compounds monthly and annually correctly", () => {
    const monthly = compoundInterest(100000, 8, 5, 12);
    expect(monthly["Maturity amount"]).toBeCloseTo(148984.5708301605, 3);
    expect(compoundInterest(1000, 10, 1, 1)).toEqual({
      "Maturity amount": 1100,
      "Interest earned": 100,
    });
  });
  it("rejects an unsupported frequency and out-of-range principal", () => {
    expect(() => compoundInterest(1000, 10, 1, 3 as 1)).toThrow();
    expect(() => compoundInterest(-5, 10, 1, 1)).toThrow();
  });
});
describe("temperature converter", () => {
  it("converts across Celsius, Fahrenheit, and Kelvin", () => {
    expect(convertTemperature(100, "C", "F")["Converted temperature"]).toBe(
      212,
    );
    expect(
      convertTemperature(98.6, "F", "C")["Converted temperature"],
    ).toBeCloseTo(37, 5);
    expect(
      convertTemperature(0, "C", "K")["Converted temperature"],
    ).toBeCloseTo(273.15, 5);
    expect(convertTemperature(25, "C", "C")["Converted temperature"]).toBe(25);
  });
  it("rejects temperatures below absolute zero", () => {
    expect(() => convertTemperature(-1, "K", "C")).toThrow();
    expect(() => convertTemperature(-300, "C", "F")).toThrow();
  });
});
describe("discount calculator", () => {
  it("computes sale price and savings", () => {
    expect(discount(1200, 25)).toEqual({
      "Sale price": 900,
      "You save": 300,
    });
    const d = discount(49.99, 10);
    expect(d["Sale price"]).toBeCloseTo(44.991, 3);
    expect(d["You save"]).toBeCloseTo(4.999, 3);
  });
  it("rejects out-of-range percentages and negative prices", () => {
    expect(() => discount(-1, 10)).toThrow();
    expect(() => discount(100, 101)).toThrow();
    expect(() => discount(100, -1)).toThrow();
  });
});
describe("ideal weight calculator", () => {
  it("applies the Devine formula by sex", () => {
    const m = idealWeight(180, "male");
    expect(m["Ideal weight (kg)"]).toBeCloseTo(74.99212598425197, 6);
    expect(m["Ideal weight (lb)"]).toBeCloseTo(165.3293374054153, 4);
    const f = idealWeight(165, "female");
    expect(f["Ideal weight (kg)"]).toBeCloseTo(56.90944881889763, 6);
  });
  it("bounds height to a plausible adult range", () => {
    expect(() => idealWeight(100, "male")).toThrow();
    expect(() => idealWeight(250, "female")).toThrow();
  });
});
describe("text case converter", () => {
  const sample = "ToolzPoint Makes Everyday Tasks Simple";
  it("converts across all seven modes", () => {
    expect(convertCase(sample, "upper")).toBe(
      "TOOLZPOINT MAKES EVERYDAY TASKS SIMPLE",
    );
    expect(convertCase(sample, "lower")).toBe(
      "toolzpoint makes everyday tasks simple",
    );
    expect(convertCase(sample, "title")).toBe(
      "Toolzpoint Makes Everyday Tasks Simple",
    );
    expect(
      convertCase("hello world. this is great! are you sure? yes.", "sentence"),
    ).toBe("Hello world. This is great! Are you sure? Yes.");
    expect(convertCase(sample, "camel")).toBe(
      "toolzpointMakesEverydayTasksSimple",
    );
    expect(convertCase(sample, "snake")).toBe(
      "toolzpoint_makes_everyday_tasks_simple",
    );
    expect(convertCase(sample, "kebab")).toBe(
      "toolzpoint-makes-everyday-tasks-simple",
    );
  });
  it("keeps apostrophes in Title Case and rejects unconvertible input", () => {
    expect(convertCase("don't stop believing", "title")).toBe(
      "Don't Stop Believing",
    );
    expect(() => convertCase("", "upper")).toThrow();
    expect(() => convertCase("!!!", "camel")).toThrow();
  });
});
describe("hash generator", () => {
  it("computes known SHA digests", async () => {
    const text = "The quick brown fox jumps over the lazy dog";
    expect(await hashText(text, "SHA-256")).toBe(
      "d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592",
    );
    expect(await hashText(text, "SHA-1")).toBe(
      "2fd4e1c67a2d28fced849ee1bb76e7391b93eb12",
    );
  });
  it("rejects empty input", async () => {
    await expect(hashText("", "SHA-256")).rejects.toThrow();
  });
});
describe("JWT decoder", () => {
  it("decodes header and payload as pretty JSON without verifying the signature", () => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    const out = decodeJwt(token);
    expect(out).toContain('"alg": "HS256"');
    expect(out).toContain('"name": "John Doe"');
    expect(out).toContain("SIGNATURE (not verified)");
  });
  it("rejects malformed tokens", () => {
    expect(() => decodeJwt("not.a.jwt")).toThrow();
    expect(() => decodeJwt("only.two")).toThrow();
  });
});
describe("meta tag generator", () => {
  it("builds escaped meta, Open Graph, and Twitter tags", () => {
    const out = metaTags({
      title: "ToolzPoint & Friends",
      description: "Free browser tools",
      url: "https://www.toolzpointt.com/",
      image: "https://www.toolzpointt.com/og.png",
      siteName: "ToolzPoint",
    });
    expect(out).toContain("<title>ToolzPoint &amp; Friends</title>");
    expect(out).toContain(
      '<meta property="og:image" content="https://www.toolzpointt.com/og.png" />',
    );
    expect(out).toContain(
      '<meta name="twitter:card" content="summary_large_image" />',
    );
  });
  it("omits optional tags and falls back to a summary card without an image", () => {
    const out = metaTags({
      title: "Title",
      description: "Description",
      url: "https://example.com/",
    });
    expect(out).not.toContain("og:image");
    expect(out).toContain('<meta name="twitter:card" content="summary" />');
  });
  it("rejects an invalid URL and an over-length title", () => {
    expect(() =>
      metaTags({
        title: "Title",
        description: "Description",
        url: "not-a-url",
      }),
    ).toThrow();
    expect(() =>
      metaTags({
        title: "x".repeat(71),
        description: "Description",
        url: "https://example.com/",
      }),
    ).toThrow();
  });
});
describe("date difference calculator", () => {
  it("matches the age calculator's calendar-diff algorithm", () => {
    expect(dateDifference("2026-01-01", "2026-09-19")).toEqual({
      Years: 0,
      Months: 8,
      Days: 18,
      "Total days": 261,
      "Total weeks": 37,
    });
    expect(dateDifference("2024-01-01", "2025-06-15")).toEqual({
      Years: 1,
      Months: 5,
      Days: 14,
      "Total days": 531,
      "Total weeks": 75,
    });
    expect(dateDifference("2026-03-15", "2026-03-15")).toEqual({
      Years: 0,
      Months: 0,
      Days: 0,
      "Total days": 0,
      "Total weeks": 0,
    });
  });
  it("rejects a start date after the end date", () => {
    expect(() => dateDifference("2026-05-01", "2026-01-01")).toThrow();
  });
});
describe("pregnancy due date calculator", () => {
  it("applies Naegele's rule adjusted for cycle length", () => {
    const r28 = pregnancyDueDate("2026-01-01", 28, "2026-01-01");
    expect(r28["Estimated due date"]).toBe("2026-10-08");
    const r30 = pregnancyDueDate("2026-01-01", 30, "2026-01-01");
    expect(r30["Estimated due date"]).toBe("2026-10-10");
  });
  it("reports weeks pregnant and trimester as of a later date", () => {
    const r = pregnancyDueDate("2026-01-01", 28, "2026-09-19");
    expect(r["Weeks pregnant"]).toBe(37);
    expect(r["Days into that week"]).toBe(2);
    expect(r.Trimester).toBe("3rd trimester");
  });
  it("rejects a last period after the comparison date", () => {
    expect(() => pregnancyDueDate("2026-09-19", 28, "2026-01-01")).toThrow();
  });
});
describe("ovulation calculator", () => {
  it("estimates ovulation day, fertile window, and next period", () => {
    const r = ovulation("2026-01-01", 28);
    expect(r["Estimated ovulation day"]).toBe("2026-01-15");
    expect(r["Fertile window start"]).toBe("2026-01-10");
    expect(r["Fertile window end"]).toBe("2026-01-16");
    expect(r["Next expected period"]).toBe("2026-01-29");
  });
});
describe("GST calculator", () => {
  it("adds and extracts GST consistently", () => {
    expect(gst(1000, 18, "exclusive")).toEqual({
      "Base price": 1000,
      "GST amount": 180,
      "CGST + SGST (each)": 90,
      "Total price": 1180,
    });
    const inclusive = gst(1180, 18, "inclusive");
    expect(inclusive["Base price"]).toBeCloseTo(1000, 6);
    expect(inclusive["GST amount"]).toBeCloseTo(180, 6);
  });
  it("rejects a negative rate or amount", () => {
    expect(() => gst(-1, 18, "exclusive")).toThrow();
    expect(() => gst(1000, -1, "exclusive")).toThrow();
  });
});
describe("water intake calculator", () => {
  it("scales the baseline by activity level", () => {
    const moderate = waterIntake(70, "moderate");
    expect(moderate["Daily water (liters)"]).toBeCloseTo(2.695, 3);
    expect(moderate["Daily water (250ml glasses)"]).toBeCloseTo(10.78, 2);
    const sedentary = waterIntake(60, "sedentary");
    expect(sedentary["Daily water (liters)"]).toBeCloseTo(2.1, 3);
  });
});
describe("body fat calculator", () => {
  it("applies the US Navy method by sex", () => {
    const male = bodyFat({ sex: "male", height: 175, waist: 85, neck: 38 });
    expect(male["Body fat (%)"]).toBeCloseTo(16.938, 2);
    expect(male.Category).toBe("Fitness");
    const female = bodyFat({
      sex: "female",
      height: 165,
      waist: 75,
      neck: 32,
      hip: 100,
    });
    expect(female["Body fat (%)"]).toBeCloseTo(29.93, 1);
    expect(female.Category).toBe("Average");
  });
  it("requires a hip measurement for women and a valid waist/neck gap", () => {
    expect(() =>
      bodyFat({ sex: "female", height: 165, waist: 75, neck: 32 }),
    ).toThrow();
    expect(() =>
      bodyFat({ sex: "male", height: 175, waist: 30, neck: 38 }),
    ).toThrow();
  });
});
describe("waist-to-hip ratio calculator", () => {
  it("classifies risk by sex-specific WHO thresholds", () => {
    expect(waistHipRatio("male", 80, 100)).toEqual({
      "Waist-to-hip ratio": 0.8,
      "WHO risk category": "Low risk",
    });
    expect(waistHipRatio("female", 90, 100)).toEqual({
      "Waist-to-hip ratio": 0.9,
      "WHO risk category": "High risk",
    });
  });
});
describe("heart rate zone calculator", () => {
  it("derives max heart rate and five percentage-based zones", () => {
    const r = heartRateZones(30);
    expect(r["Maximum heart rate (bpm)"]).toBe(190);
    expect(r["Zone 3 · Cardio (70–80%)"]).toBe("133–152 bpm");
    expect(r["Zone 5 · Peak (90–100%)"]).toBe("171–190 bpm");
  });
});
describe("savings goal calculator", () => {
  it("solves for the monthly deposit that reaches a target", () => {
    expect(
      savingsGoal(500000, 50000, 24, 6)["Monthly deposit needed"],
    ).toBeCloseTo(17444.27, 1);
    expect(savingsGoal(120000, 0, 12, 0)).toEqual({
      "Monthly deposit needed": 10000,
    });
  });
  it("reports zero deposit needed when already funded", () => {
    const r = savingsGoal(100000, 150000, 12, 5);
    expect(r["Monthly deposit needed"]).toBe(0);
    expect(r["Already funded by"]).toBe(50000);
  });
});
