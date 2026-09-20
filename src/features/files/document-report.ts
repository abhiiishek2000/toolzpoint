import { PDFDocument } from "pdf-lib";
import type { ToolInsight } from "../tools/insights";
export async function documentReport(
  bytes: Uint8Array,
  kind: "invoice" | "biodata" | "resume",
  details: Record<string, string | number>,
): Promise<ToolInsight> {
  const doc = await PDFDocument.load(bytes);
  const title = {
    invoice: "Invoice export verification",
    biodata: "Biodata sharing review",
    resume: "Resume export inspection",
  }[kind];
  const advice = {
    invoice:
      "Match line items, tax, parties and payment dates against your records. Exporting an invoice does not record a payment.",
    biodata:
      "Review each included personal detail and photo before sharing. Empty optional fields are omitted from the PDF.",
    resume:
      "Check contact details, dates and section order in the PDF. Templates do not guarantee applicant-tracking-system results.",
  }[kind];
  return {
    title,
    explanation: `${advice} This report describes the last export. Standard PDF fonts can replace unsupported glyphs; open the downloaded file to check spelling and pagination.`,
    tables: [
      {
        title,
        headers: ["Check", "Exported value"],
        rows: [
          ...Object.entries(details),
          ["PDF pages", doc.getPageCount()],
          ["File bytes", bytes.byteLength],
          ["Page format", "A4 portrait"],
          ["Processing", "Created locally in your browser"],
        ],
      },
    ],
  };
}
