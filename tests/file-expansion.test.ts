import { expect, it } from "vitest";
import {
  PDFDocument,
  degrees,
  PDFArray,
  PDFRawStream,
  decodePDFRawStream,
} from "pdf-lib";
import { processFiles } from "../src/features/files/process";
import { rotationDegrees, type FileTask } from "../src/features/files/domain";
async function task(
  kind: FileTask["kind"],
  rotations = [0, 270],
): Promise<FileTask> {
  const doc = await PDFDocument.create();
  for (const rotation of rotations)
    doc.addPage([300, 400]).setRotation(degrees(rotation));
  return {
    id: 1,
    kind,
    files: [
      new File([new Uint8Array(await doc.save())], "sample.pdf", {
        type: "application/pdf",
      }),
    ],
    quality: 0.8,
    format: "image/png",
    maxWidth: 4096,
    maxHeight: 4096,
    rotation: 90,
  };
}
it("adds rotation to every page while preserving dimensions and page count", async () => {
  const result = await processFiles(await task("rotate-pdf"));
  const doc = await PDFDocument.load(await result.blob.arrayBuffer());
  expect(result.pages).toBe(2);
  expect(doc.getPages().map((p) => p.getRotation().angle)).toEqual([90, 0]);
  expect(doc.getPage(0).getSize()).toEqual({ width: 300, height: 400 });
});
it("writes the specified page-number text into PDF content streams", async () => {
  const result = await processFiles(
    await task("add-page-numbers-to-pdf", [0, 0]),
  );
  const doc = await PDFDocument.load(await result.blob.arrayBuffer());
  expect(doc.getPageCount()).toBe(2);
  for (const [index, page] of doc.getPages().entries()) {
    const contents = page.node.Contents();
    expect(contents).toBeInstanceOf(PDFArray);
    const streams = (contents as PDFArray)
      .asArray()
      .map((ref) => doc.context.lookup(ref) as PDFRawStream);
    const operators = streams
      .map((stream) =>
        new TextDecoder().decode(decodePDFRawStream(stream).decode()),
      )
      .join("\n");
    // PDF strings are hex-encoded; independently specified ASCII labels are 1 / 2 and 2 / 2.
    expect(operators).toContain(index === 0 ? "<31202F2032>" : "<32202F2032>");
    expect(operators).toContain(" Tj");
  }
});
it("numbers a single page and rejects excessive PDF pages and invalid rotation", async () => {
  expect(
    (await processFiles(await task("add-page-numbers-to-pdf", [0]))).pages,
  ).toBe(1);
  for (const kind of ["rotate-pdf", "add-page-numbers-to-pdf"] as const)
    await expect(
      processFiles(await task(kind, Array(201).fill(0))),
    ).rejects.toThrow("200");
  expect(() => rotationDegrees(45)).toThrow();
  expect(() => rotationDegrees(NaN)).toThrow();
  await expect(
    processFiles({ ...(await task("rotate-pdf")), rotation: 45 }),
  ).rejects.toThrow();
});
