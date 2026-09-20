import { PDFDocument } from "pdf-lib";
import { MAX_FILE_BYTES } from "./domain";
export type PdfInfo = {
  pages: number;
  size: number;
  title?: string;
  author?: string;
  pageDetails: {
    page: number;
    width: number;
    height: number;
    rotation: number;
  }[];
};
export async function inspectPdf(bytes: ArrayBuffer): Promise<PdfInfo> {
  if (!bytes.byteLength || bytes.byteLength > MAX_FILE_BYTES)
    throw new Error("Choose a non-empty PDF up to 20 MB.");
  const doc = await PDFDocument.load(bytes);
  const pages = doc.getPageCount();
  if (!pages || pages > 400) throw new Error("Use a PDF with 1–400 pages.");
  return {
    pages,
    size: bytes.byteLength,
    title: doc.getTitle(),
    author: doc.getAuthor(),
    pageDetails: doc.getPages().map((p, i) => ({
      page: i + 1,
      ...p.getSize(),
      rotation: p.getRotation().angle,
    })),
  };
}
