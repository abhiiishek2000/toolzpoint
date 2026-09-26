import { describe, expect, it } from "vitest";
import { tools } from "../src/lib/tool-registry";
import { initialValues, samples } from "../src/components/workspace-config";
import { executeDetailedTool } from "../src/features/tools/result-details";
export const specialTools = [
  "image-compressor",
  "image-resizer",
  "image-format-converter",
  "image-rotator-flipper",
  "rotate-pdf",
  "add-page-numbers-to-pdf",
  "merge-pdf",
  "images-to-pdf",
  "split-pdf",
  "organize-pdf-pages",
  "watermark-pdf",
  "passport-photo-maker",
  "social-media-image-resizer",
  "pdf-page-counter",
  "qr-code-generator",
  "invoice-maker",
  "biodata-maker",
  "resume-maker",
];
const generic = tools.filter((t) => !specialTools.includes(t.slug));
describe("individual result coverage", () => {
  it("accounts for exactly 112 tools", () => {
    expect(generic).toHaveLength(94);
    expect(specialTools).toHaveLength(18);
    expect(tools).toHaveLength(112);
  });
  for (const tool of generic)
    it(`${tool.slug} renders a complete bounded individual report`, async () => {
      const values = initialValues(tool.slug);
      for (const key of ["asOf", "end", "date"])
        if (key in values && !values[key]) values[key] = "2026-09-20";
      if (tool.slug === "meta-tag-generator")
        Object.assign(values, {
          title: "Example page",
          description: "A description of the example page.",
          url: "https://example.com/page",
        });
      const result = await executeDetailedTool({
        slug: tool.slug,
        values,
        input: samples[tool.slug] ?? "",
        mode: "encode",
        scope: "component",
        separator: "-",
        unicode: false,
        minify: false,
        localDate: "2026-09-20",
        caseMode: "upper",
        algorithm: "SHA-256",
      });
      expect(result.details.insight?.title).toBeTruthy();
      expect(result.details.insight?.explanation.length).toBeGreaterThan(30);
      for (const table of result.details.insight!.tables) {
        expect(table.rows.length).toBeLessThanOrEqual(1000);
        for (const row of table.rows) {
          expect(row).toHaveLength(table.headers.length);
          for (const cell of row) {
            expect(cell).toBeDefined();
            if (typeof cell === "number")
              expect(Number.isFinite(cell), `${tool.slug}: ${row}`).toBe(true);
          }
        }
      }
    });
});
