import { it, expect } from "vitest";
import { PDFDocument, degrees } from "pdf-lib";
import { runExpansion } from "../src/features/tools/expansion/domain";
import { inspectPdf } from "../src/features/files/inspect-pdf";
import { waistHipRatio } from "../src/features/tools/waist-hip-ratio-calculator/domain";
import { generateInvoicePdf } from "../src/features/tools/invoice-maker/domain";
it("preserves a small quadratic root despite cancellation and formats complex roots for negative a", () => {
  const roots = runExpansion("quadratic-equation-solver", "", {
    a: "1",
    b: "100000000",
    c: "1",
  }) as Record<string, number>;
  expect(roots["Root 1"]).toBeCloseTo(-0.00000001, 16);
  expect(roots["Root 2"]).toBeCloseTo(-100000000, 4);
  expect(
    runExpansion("quadratic-equation-solver", "", { a: "-1", b: "0", c: "-1" }),
  ).toMatchObject({ "Root 1": "0 + 1i", "Root 2": "0 - 1i" });
});
it("rejects impossible bonus pools before drawing and missing net worth values", () => {
  expect(() =>
    runExpansion("lottery-number-generator", "", {
      mainCount: "6",
      mainMax: "49",
      bonusCount: "3",
      bonusMax: "2",
    }),
  ).toThrow();
  for (const assets of ["Home,", ",100", "Home,   "])
    expect(() =>
      runExpansion("net-worth-calculator", "", { assets, liabilities: "" }),
    ).toThrow();
});
it("does not rate repeated/common patterns strong and bounds password analysis", () => {
  for (const input of ["Ab1!".repeat(12), "password123456789!"])
    expect(runExpansion("password-strength-checker", input, {})).toMatchObject({
      Strength: "Weak",
    });
  expect(() =>
    runExpansion("password-strength-checker", "x".repeat(1025), {}),
  ).toThrow();
});
it("uses WHO screening thresholds at both exact boundaries", () => {
  expect(waistHipRatio("male", 90, 100)["Screening reference"]).toBe(
    "At or above the increased-risk threshold",
  );
  expect(waistHipRatio("female", 85, 100)["Screening reference"]).toBe(
    "At or above the increased-risk threshold",
  );
  expect(waistHipRatio("female", 84.9, 100)["Screening reference"]).toBe(
    "Below the increased-risk threshold",
  );
});
it("inspects every PDF page, including different dimensions and rotation", async () => {
  const pdf = await PDFDocument.create();
  pdf.addPage([300, 400]);
  pdf.addPage([500, 200]).setRotation(degrees(90));
  const info = await inspectPdf(new Uint8Array(await pdf.save()).buffer);
  expect(info.pageDetails).toEqual([
    { page: 1, width: 300, height: 400, rotation: 0 },
    { page: 2, width: 500, height: 200, rotation: 90 },
  ]);
  await expect(inspectPdf(new ArrayBuffer(0))).rejects.toThrow();
  const long = await PDFDocument.create();
  for (let i = 0; i < 401; i++) long.addPage();
  await expect(
    inspectPdf(new Uint8Array(await long.save()).buffer),
  ).rejects.toThrow(/400/);
});
it("rejects impossible invoice dates and due dates before issue", async () => {
  const invoice = {
    businessName: "Studio",
    clientName: "Client",
    invoiceNumber: "1",
    invoiceDate: "2026-02-30",
    taxRate: 0,
    items: [{ description: "Work", quantity: 1, price: 100 }],
  };
  await expect(generateInvoicePdf(invoice)).rejects.toThrow(/calendar/);
  await expect(
    generateInvoicePdf({
      ...invoice,
      invoiceDate: "2026-03-01",
      dueDate: "2026-02-28",
    }),
  ).rejects.toThrow(/Due date/);
});

it("uses the displayed local date as the default date-difference endpoint", async () => {
  const { executeDetailedTool } =
    await import("../src/features/tools/result-details");
  const result = await executeDetailedTool({
    slug: "date-difference-calculator",
    values: { start: "2026-09-01", end: "" },
    input: "",
    mode: "encode",
    scope: "component",
    separator: "-",
    unicode: false,
    minify: false,
    localDate: "2026-09-20",
    caseMode: "upper",
    algorithm: "SHA-256",
  });
  expect(result.output).toMatchObject({ "Total days": 19 });
  expect(result.details.insight!.tables[0]!.rows).toContainEqual([
    "End",
    "2026-09-20",
  ]);
});
