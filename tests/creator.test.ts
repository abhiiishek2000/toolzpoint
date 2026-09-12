import { it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import {
  imageDimensions,
  fitDimensions,
  validateFiles,
  savings,
} from "../src/features/files/domain";
import { processFiles } from "../src/features/files/process";
import { validateQr, createQr } from "../src/features/qr-code-generator/domain";
it("fits without stretching or upscaling", () => {
  expect(fitDimensions(2000, 1000, 1080, 1080)).toEqual({
    width: 1080,
    height: 540,
  });
  expect(fitDimensions(640, 480, 1920, 1920)).toEqual({
    width: 640,
    height: 480,
  });
  expect(() => fitDimensions(100, 100, 0, 100)).toThrow();
  expect(() => fitDimensions(100, 100, 9000, 100)).toThrow();
  expect(savings(100000, 60000)).toBe(40);
  expect(savings(100000, 120000)).toBe(-20);
});
it("rejects unsupported and oversized files before processing", () => {
  expect(() =>
    validateFiles(
      [{ name: "x.svg", size: 10, type: "image/svg+xml" }],
      "image",
    ),
  ).toThrow();
  expect(() =>
    validateFiles(
      [{ name: "x.jpg", size: 21 * 1024 * 1024, type: "image/jpeg" }],
      "image",
    ),
  ).toThrow();
  expect(() => validateFiles([], "pdf")).toThrow();
  expect(() =>
    validateFiles(
      Array.from({ length: 11 }, () => ({
        name: "x.pdf",
        size: 10,
        type: "application/pdf",
      })),
      "pdf",
      true,
    ),
  ).toThrow();
});
it("creates bounded static QR PNGs", async () => {
  expect(validateQr("https://example.com")).toBe("https://example.com");
  expect(() => validateQr("")).toThrow();
  expect(() => validateQr("😊".repeat(251))).toThrow();
  expect(await createQr("hello")).toMatch(/^data:image\/png;base64,/);
  await expect(createQr("hello", "#ffffff", 2)).rejects.toThrow();
});
it("merges page order and preserves distinct page geometry", async () => {
  const a = await PDFDocument.create();
  a.addPage([100, 200]);
  a.addPage([120, 220]);
  const b = await PDFDocument.create();
  b.addPage([300, 400]);
  const files = [
    new File([new Uint8Array(await a.save())], "a.pdf", {
      type: "application/pdf",
    }),
    new File([new Uint8Array(await b.save())], "b.pdf", {
      type: "application/pdf",
    }),
  ];
  const out = await processFiles({
    id: 1,
    kind: "merge-pdf",
    files,
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1920,
    format: "image/webp",
  });
  const merged = await PDFDocument.load(await out.blob.arrayBuffer());
  expect(merged.getPageCount()).toBe(3);
  expect(merged.getPages().map((p) => p.getWidth())).toEqual([100, 120, 300]);
});

it("checks declared image dimensions before allocating a bitmap", () => {
  const header = new Uint8Array(24);
  header.set([137, 80, 78, 71]);
  header.set([73, 72, 68, 82], 12);
  const v = new DataView(header.buffer);
  v.setUint32(16, 800);
  v.setUint32(20, 400);
  expect(imageDimensions(header)).toEqual({ width: 800, height: 400 });
  v.setUint32(16, 100000);
  v.setUint32(20, 100000);
  expect(() => imageDimensions(header)).toThrow("12 million");
  expect(() => imageDimensions(new Uint8Array(24))).toThrow("valid JPG");
});
