import { z } from "zod";
export const biodataSchema = z.object({
  fullName: z.string().trim().min(1).max(100),
  dateOfBirth: z.string().max(40).optional(),
  timeOfBirth: z.string().max(40).optional(),
  placeOfBirth: z.string().max(100).optional(),
  height: z.string().max(40).optional(),
  complexion: z.string().max(40).optional(),
  bloodGroup: z.string().max(10).optional(),
  religion: z.string().max(60).optional(),
  caste: z.string().max(60).optional(),
  education: z.string().max(200).optional(),
  occupation: z.string().max(150).optional(),
  income: z.string().max(60).optional(),
  fatherName: z.string().max(150).optional(),
  motherName: z.string().max(150).optional(),
  siblings: z.string().max(300).optional(),
  address: z.string().max(300).optional(),
  phone: z.string().max(40).optional(),
  email: z.string().max(100).optional(),
  photo: z
    .object({ bytes: z.instanceof(Uint8Array), type: z.string() })
    .optional(),
});
export type BiodataInput = z.infer<typeof biodataSchema>;
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;
export async function generateBiodataPdf(input: BiodataInput) {
  const v = biodataSchema.parse(input);
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const { wrapText, sanitizeForPdf } = await import("../../files/pdf-text");
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(0.1, 0.1, 0.15);
  const gray = rgb(0.45, 0.45, 0.48);
  v.fullName = sanitizeForPdf(v.fullName, font);
  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;
  function ensureSpace(needed: number) {
    if (y - needed < MARGIN + 20) {
      page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
  }
  let photoBoxWidth = 0;
  if (v.photo) {
    const isPng = v.photo.type.includes("png");
    const embedded = isPng
      ? await doc.embedPng(v.photo.bytes)
      : await doc.embedJpg(v.photo.bytes);
    const boxW = 110,
      boxH = 140;
    const scale = Math.min(boxW / embedded.width, boxH / embedded.height);
    const w = embedded.width * scale,
      h = embedded.height * scale;
    page.drawImage(embedded, {
      x: PAGE_WIDTH - MARGIN - w,
      y: y - h,
      width: w,
      height: h,
    });
    photoBoxWidth = boxW + 20;
  }
  const nameLines = wrapText(
    v.fullName,
    bold,
    22,
    PAGE_WIDTH - MARGIN * 2 - photoBoxWidth,
  );
  for (const line of nameLines) {
    page.drawText(line, { x: MARGIN, y, size: 22, font: bold, color: ink });
    y -= 26;
  }
  page.drawText("Biodata", { x: MARGIN, y, size: 12, font, color: gray });
  y -= 30;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_WIDTH - MARGIN, y },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.85),
  });
  y -= 26;
  const labelWidth = 150;
  const valueWidth = PAGE_WIDTH - MARGIN * 2 - labelWidth;
  function section(title: string, rows: [string, string | undefined][]) {
    const filled = rows.filter(([, value]) => value?.trim());
    if (!filled.length) return;
    ensureSpace(30);
    page.drawText(title, { x: MARGIN, y, size: 13, font: bold, color: ink });
    y -= 20;
    for (const [label, value] of filled) {
      const lines = wrapText(
        sanitizeForPdf(value!.trim(), font),
        font,
        11,
        valueWidth,
      );
      ensureSpace(16 * lines.length);
      page.drawText(label, { x: MARGIN, y, size: 11, font: bold, color: gray });
      for (const [i, line] of lines.entries()) {
        page.drawText(line, {
          x: MARGIN + labelWidth,
          y: y - i * 16,
          size: 11,
          font,
          color: ink,
        });
      }
      y -= 16 * lines.length + 4;
    }
    y -= 12;
  }
  section("Personal Details", [
    ["Date of Birth", v.dateOfBirth],
    ["Time of Birth", v.timeOfBirth],
    ["Place of Birth", v.placeOfBirth],
    ["Height", v.height],
    ["Complexion", v.complexion],
    ["Blood Group", v.bloodGroup],
    ["Religion", v.religion],
    ["Caste / Community", v.caste],
    ["Education", v.education],
    ["Occupation", v.occupation],
    ["Annual Income", v.income],
  ]);
  section("Family Details", [
    ["Father's Name", v.fatherName],
    ["Mother's Name", v.motherName],
    ["Siblings", v.siblings],
  ]);
  section("Contact Details", [
    ["Address", v.address],
    ["Phone", v.phone],
    ["Email", v.email],
  ]);
  return new Uint8Array(await doc.save());
}
