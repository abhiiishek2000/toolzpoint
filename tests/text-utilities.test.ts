import { expect, it } from "vitest";
import {
  runTextUtility as run,
  textUtilitySlugs,
} from "../src/features/tools/text-utilities/domain";
it("counts encoded lengths independently", () => {
  expect(run("character-counter", "😀 a", {})).toEqual({
    "Unicode code points": 3,
    "Without whitespace": 2,
    "UTF-16 code units": 4,
    "UTF-8 bytes": 6,
  });
});
it("produces a bounded number of complete placeholder paragraphs", () => {
  const one = run("lorem-ipsum-generator", "", { count: "1" }) as string;
  expect(one.split(/\s+/)).toHaveLength(19);
  expect(run("lorem-ipsum-generator", "", { count: "2" })).toBe(
    one + "\n\n" + one,
  );
  for (const count of ["", "0", "51", "1.5", "NaN"])
    expect(() => run("lorem-ipsum-generator", "", { count })).toThrow();
});
it.each([
  ["duplicate-line-remover", "red\r\nblue\rred", {}, "red\nblue"],
  ["duplicate-line-remover", "A\na\nA\n\n", {}, "A\na\n"],
  ["remove-line-breaks", "a\r\n\r\nb", {}, "a b"],
  ["remove-line-breaks", "Hello\nworld", {}, "Hello world"],
  ["text-sorter", "pear\napple", {}, "apple\npear"],
  ["text-sorter", "bbb\na\ncc", { order: "length" }, "a\ncc\nbbb"],
  ["text-sorter", "a\nb", { order: "descending" }, "b\na"],
  [
    "find-and-replace-text",
    "Hello world",
    { find: "world", replacement: "reader" },
    "Hello reader",
  ],
  ["find-and-replace-text", "aaa", { find: "aa", replacement: "b" }, "ba"],
  ["find-and-replace-text", "a.a", { find: ".", replacement: "$&" }, "a$&a"],
  ["whitespace-remover", "  a   b  ", {}, "a b"],
  ["whitespace-remover", "a\t\nb", {}, "a b"],
  ["text-reverser", "abc", {}, "cba"],
  ["text-reverser", "A😀B", {}, "B😀A"],
  ["text-reverser", "e\u0301👨‍👩‍👧", {}, "👨‍👩‍👧e\u0301"],
  ["nato-phonetic-alphabet-converter", "abc", {}, "Alfa Bravo Charlie"],
  ["nato-phonetic-alphabet-converter", "A B", {}, "Alfa / Bravo"],
  ["rot13-caesar-cipher", "Hello!", {}, "Uryyb!"],
  ["rot13-caesar-cipher", "Zebra", { shift: "1" }, "Afcsb"],
  ["rot13-caesar-cipher", "Abc", { shift: "-1" }, "Zab"],
])("%s transforms %s", (slug, input, values, expected) => {
  expect(
    run(slug as string, input as string, values as Record<string, string>),
  ).toBe(expected);
});
it("rejects invalid options and unbounded input or output", () => {
  for (const slug of textUtilitySlugs)
    expect(() => run(slug, "x".repeat(100001), {})).toThrow();
  expect(() => run("find-and-replace-text", "a", {})).toThrow();
  expect(() =>
    run("find-and-replace-text", "a".repeat(100000), {
      find: "a",
      replacement: "bb",
    }),
  ).toThrow();
  expect(() => run("text-sorter", "a", { order: "invalid" })).toThrow();
  expect(() => run("rot13-caesar-cipher", "a", { shift: "26" })).toThrow();
});
