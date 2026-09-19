import { it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import {
  invoiceTotals,
  generateInvoicePdf,
  type InvoiceInput,
} from "../src/features/tools/invoice-maker/domain";
const sample: InvoiceInput = {
  businessName: "Acme Studio",
  businessDetails: "123 Market Street\nSpringfield, IL\nhello@acme.test",
  clientName: "Globex Corp",
  clientDetails: "500 Industrial Ave\nCapital City",
  invoiceNumber: "INV-1001",
  invoiceDate: "2026-09-19",
  dueDate: "2026-10-19",
  currency: "$",
  taxRate: 8,
  notes: "Thank you for your business.",
  items: [
    { description: "Website design", quantity: 1, price: 1200 },
    { description: "Hosting (annual)", quantity: 1, price: 150 },
    { description: "Consulting hours", quantity: 5, price: 90 },
  ],
};
it("computes subtotal, tax, and total from line items", () => {
  const totals = invoiceTotals(sample.items, sample.taxRate);
  expect(totals.subtotal).toBeCloseTo(1800, 5);
  expect(totals.tax).toBeCloseTo(144, 5);
  expect(totals.total).toBeCloseTo(1944, 5);
});
it("rejects an empty item list and an out-of-range tax rate", () => {
  expect(() => invoiceTotals([], 10)).toThrow();
  expect(() => invoiceTotals(sample.items, 150)).toThrow();
});
it("generates a loadable single-page PDF for a typical invoice", async () => {
  const bytes = await generateInvoicePdf(sample);
  const doc = await PDFDocument.load(bytes);
  expect(doc.getPageCount()).toBe(1);
  const page = doc.getPage(0);
  expect(page.getWidth()).toBeCloseTo(595.28, 1);
});
it("paginates when there are enough line items to overflow one page", async () => {
  const manyItems = Array.from({ length: 30 }, (_, i) => ({
    description: `Line item number ${i + 1} with a moderately long description`,
    quantity: 2,
    price: 25.5,
  }));
  const bytes = await generateInvoicePdf({ ...sample, items: manyItems });
  const doc = await PDFDocument.load(bytes);
  expect(doc.getPageCount()).toBeGreaterThan(1);
});
it("rejects invalid input", async () => {
  await expect(
    generateInvoicePdf({ ...sample, businessName: "" }),
  ).rejects.toThrow();
  await expect(generateInvoicePdf({ ...sample, items: [] })).rejects.toThrow();
});
it("does not crash on a rupee symbol or other characters outside WinAnsi", async () => {
  const bytes = await generateInvoicePdf({
    ...sample,
    currency: "₹",
    businessName: "अनन्या स्टूडियो / Ananya Studio",
    notes: "Emoji test 😀 and em dash — should not crash.",
  });
  const doc = await PDFDocument.load(bytes);
  expect(doc.getPageCount()).toBeGreaterThanOrEqual(1);
});
