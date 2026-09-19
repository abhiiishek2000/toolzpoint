import { it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import {
  imageDimensions,
  fitDimensions,
  validateFiles,
  savings,
  parsePageRange,
  parsePageOrder,
  watermarkOptions,
  centeredRotatedTextOrigin,
  paperSizeLabel,
  mmToPx,
  coverCropRect,
  hexToRgb,
  replaceBackground,
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

it("parses page ranges into sorted, deduplicated zero-based indices", () => {
  expect(parsePageRange("1-3, 5, 8-10", 12)).toEqual([0, 1, 2, 4, 7, 8, 9]);
  expect(parsePageRange("2", 5)).toEqual([1]);
  expect(parsePageRange("3,1,2", 5)).toEqual([0, 1, 2]);
  expect(() => parsePageRange("", 5)).toThrow();
  expect(() => parsePageRange("0", 5)).toThrow();
  expect(() => parsePageRange("6", 5)).toThrow(/does not exist/);
  expect(() => parsePageRange("abc", 5)).toThrow();
});
it("splits a PDF into a new document containing only the chosen pages", async () => {
  const doc = await PDFDocument.create();
  for (const size of [100, 200, 300, 400]) doc.addPage([size, size]);
  const file = new File([new Uint8Array(await doc.save())], "a.pdf", {
    type: "application/pdf",
  });
  const out = await processFiles({
    id: 1,
    kind: "split-pdf",
    files: [file],
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1920,
    format: "image/webp",
    pageRange: "1,3",
  });
  const split = await PDFDocument.load(await out.blob.arrayBuffer());
  expect(split.getPageCount()).toBe(2);
  expect(split.getPages().map((p) => p.getWidth())).toEqual([100, 300]);
  expect(out.pages).toBe(2);
});
it("parses an explicit page order, allowing repeats and any sequence", () => {
  expect(parsePageOrder("3,1,2", 5)).toEqual([2, 0, 1]);
  expect(parsePageOrder("1,1,2", 5)).toEqual([0, 0, 1]);
  expect(() => parsePageOrder("", 5)).toThrow();
  expect(() => parsePageOrder("0", 5)).toThrow();
  expect(() => parsePageOrder("6", 5)).toThrow(/does not exist/);
  expect(() => parsePageOrder("abc", 5)).toThrow();
  expect(() => parsePageOrder(Array(401).fill("1").join(","), 5)).toThrow();
});
it("rebuilds a PDF in a custom order, duplicating and dropping pages", async () => {
  const doc = await PDFDocument.create();
  for (const size of [100, 200, 300]) doc.addPage([size, size]);
  const file = new File([new Uint8Array(await doc.save())], "a.pdf", {
    type: "application/pdf",
  });
  const out = await processFiles({
    id: 1,
    kind: "organize-pdf-pages",
    files: [file],
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1920,
    format: "image/webp",
    pageOrder: "3,1,1",
  });
  const rebuilt = await PDFDocument.load(await out.blob.arrayBuffer());
  expect(rebuilt.getPages().map((p) => p.getWidth())).toEqual([300, 100, 100]);
  expect(out.pages).toBe(3);
});
it("validates watermark text length and opacity/font-size bounds", () => {
  expect(watermarkOptions(" DRAFT ", 0.2, 60)).toEqual({
    text: "DRAFT",
    opacity: 0.2,
    fontSize: 60,
  });
  expect(() => watermarkOptions("", 0.2, 60)).toThrow();
  expect(() => watermarkOptions("a".repeat(61), 0.2, 60)).toThrow();
  expect(() => watermarkOptions("DRAFT\nTEXT", 0.2, 60)).toThrow();
  expect(() => watermarkOptions("DRAFT", 0, 60)).toThrow();
  expect(() => watermarkOptions("DRAFT", 1.5, 60)).toThrow();
  expect(() => watermarkOptions("DRAFT", 0.2, 4)).toThrow();
  expect(() => watermarkOptions("DRAFT", 0.2, 500)).toThrow();
});
it("stamps a diagonal watermark on every page", async () => {
  const doc = await PDFDocument.create();
  doc.addPage([300, 400]);
  doc.addPage([300, 400]);
  const file = new File([new Uint8Array(await doc.save())], "a.pdf", {
    type: "application/pdf",
  });
  const out = await processFiles({
    id: 1,
    kind: "watermark-pdf",
    files: [file],
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1920,
    format: "image/webp",
    watermarkText: "CONFIDENTIAL",
    watermarkOpacity: 0.15,
    watermarkFontSize: 36,
  });
  const stamped = await PDFDocument.load(await out.blob.arrayBuffer());
  expect(stamped.getPageCount()).toBe(2);
  expect(out.pages).toBe(2);
});
it("centers rotated text about its own visual center", () => {
  const origin = centeredRotatedTextOrigin(100, 100, 40, 10, 0);
  expect(origin.x).toBeCloseTo(80, 5);
  expect(origin.y).toBeCloseTo(95, 5);
});
it("labels page sizes that match a common paper size", () => {
  expect(paperSizeLabel(595, 842)).toBe(" (A4)");
  expect(paperSizeLabel(612, 792)).toBe(" (US Letter)");
  expect(paperSizeLabel(842, 595)).toBe(" (A4)");
  expect(paperSizeLabel(123, 456)).toBe("");
});
it("converts millimeters to pixels at 300 DPI and bounds the range", () => {
  expect(mmToPx(35)).toBe(413);
  expect(mmToPx(45)).toBe(531);
  expect(mmToPx(50.8)).toBe(600);
  expect(mmToPx(25)).toBe(295);
  expect(() => mmToPx(5)).toThrow();
  expect(() => mmToPx(500)).toThrow();
});
it("crops centered to a target aspect ratio and applies zoom and vertical bias", () => {
  expect(coverCropRect(800, 1200, 413, 531)).toEqual({
    sx: 0,
    sy: 86,
    sWidth: 800,
    sHeight: 1029,
  });
  expect(coverCropRect(800, 1200, 413, 531, 1, -1)).toEqual({
    sx: 0,
    sy: 0,
    sWidth: 800,
    sHeight: 1029,
  });
  expect(coverCropRect(800, 1200, 413, 531, 1, 1)).toEqual({
    sx: 0,
    sy: 171,
    sWidth: 800,
    sHeight: 1029,
  });
  expect(coverCropRect(800, 1200, 413, 531, 2, 0)).toEqual({
    sx: 200,
    sy: 343,
    sWidth: 400,
    sHeight: 514,
  });
  expect(() => coverCropRect(800, 1200, 413, 531, 5)).toThrow();
  expect(() => coverCropRect(0, 1200, 413, 531)).toThrow();
});
it("parses a hex color and rejects malformed input", () => {
  expect(hexToRgb("#ff0080")).toEqual([255, 0, 128]);
  expect(hexToRgb("#FFFFFF")).toEqual([255, 255, 255]);
  expect(() => hexToRgb("blue")).toThrow();
  expect(() => hexToRgb("#fff")).toThrow();
});
it("fades a sampled border color toward a target while leaving the subject alone", () => {
  const w = 6,
    h = 6;
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const isCenter = x >= 2 && x <= 3 && y >= 2 && y <= 3;
      const v = isCenter ? 20 : 250;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
  const out = replaceBackground(data, w, h, [0, 0, 255]);
  const border = (0 * w + 0) * 4;
  const center = (2 * w + 2) * 4;
  expect([out[border], out[border + 1], out[border + 2]]).toEqual([0, 0, 255]);
  expect([out[center], out[center + 1], out[center + 2]]).toEqual([20, 20, 20]);
  expect(() => replaceBackground(data, 2, 2, [0, 0, 0])).toThrow("too small");
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
