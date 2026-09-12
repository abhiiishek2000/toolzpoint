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
