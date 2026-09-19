import { it, expect } from "vitest";
import {
  tools,
  categories,
  getTool,
  searchTools,
} from "../src/lib/tool-registry";
import { safeJson } from "../src/lib/seo";
it("has one hundred unique published browser tools with complete content", () => {
  expect(tools).toHaveLength(100);
  expect(new Set(tools.map((t) => t.slug)).size).toBe(100);
  for (const t of tools) {
    expect(t.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    expect(t.execution).toBe("client");
    expect(categories.some((c) => c.name === t.category)).toBe(true);
    expect(t.intro.split(/\s+/).length).toBeGreaterThanOrEqual(60);
    expect(t.examples.length).toBeGreaterThanOrEqual(2);
    expect(t.faq.length).toBeGreaterThanOrEqual(3);
    expect(t.relatedSlugs.length).toBeGreaterThanOrEqual(4);
    for (const slug of t.relatedSlugs) {
      expect(getTool(slug)).toBeDefined();
      expect(slug).not.toBe(t.slug);
    }
    expect(typeof t.reviewed).toBe("boolean");
  }
});
it("searches and filters without matching unknown categories", () => {
  expect(searchTools("JSON").map((t) => t.slug)).toContain("json-formatter");
  expect(searchTools("", "Developer")).toHaveLength(9);
  expect(searchTools("zzzzz")).toHaveLength(0);
  expect(getTool("missing")).toBeUndefined();
});
it("escapes JSON-LD script boundaries", () => {
  expect(
    safeJson({ name: "</script><script>alert(1)</script>" }),
  ).not.toContain("<");
});
