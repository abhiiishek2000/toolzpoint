import { z } from "zod";
import { numeric, parseDate } from "../shared";
export const invoiceItemSchema = z.object({
  description: z.string().trim().min(1).max(200),
  quantity: numeric.min(0.01).max(1e6),
  price: numeric.min(0).max(1e9),
});
export type InvoiceItem = z.infer<typeof invoiceItemSchema>;
export function invoiceTotals(items: InvoiceItem[], taxRate: number) {
  numeric.min(0).max(100).parse(taxRate);
  if (!items.length) throw new Error("Add at least one line item.");
  for (const item of items) invoiceItemSchema.parse(item);
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0);
  const tax = (subtotal * taxRate) / 100;
  return { subtotal, tax, total: subtotal + tax };
}
export const invoiceSchema = z.object({
  businessName: z.string().trim().min(1).max(120),
  businessDetails: z.string().max(400).optional(),
  clientName: z.string().trim().min(1).max(120),
  clientDetails: z.string().max(400).optional(),
  invoiceNumber: z.string().trim().min(1).max(60),
  invoiceDate: z.string().trim().min(1).max(40),
  dueDate: z.string().max(40).optional(),
  currency: z.string().max(5).optional(),
  notes: z.string().max(500).optional(),
  taxRate: numeric.min(0).max(100),
  items: z.array(invoiceItemSchema).min(1).max(30),
});
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type InvoiceLogo = { bytes: Uint8Array };
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;
function detectLogoFormat(bytes: Uint8Array): "png" | "jpeg" {
  if (bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71)
    return "png";
  if (bytes[0] === 255 && bytes[1] === 216) return "jpeg";
  throw new Error("The logo must be a PNG or JPEG image.");
}
export async function generateInvoicePdf(
  input: InvoiceInput,
  logo?: InvoiceLogo,
) {
  const v = invoiceSchema.parse(input);
  const issued = parseDate(v.invoiceDate);
  if (v.dueDate && parseDate(v.dueDate) < issued)
    throw new Error("Due date must be on or after the invoice date.");
  const totals = invoiceTotals(v.items, v.taxRate);
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const { wrapText, wrapParagraphs, sanitizeForPdf } =
    await import("../../files/pdf-text");
  const { fitDimensions, imageDimensions } = await import("../../files/domain");
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const gray = rgb(0.45, 0.45, 0.48);
  const ink = rgb(0.1, 0.1, 0.15);
  const s = (value: string) => sanitizeForPdf(value, font);
  const so = (value: string | undefined) => (value ? s(value) : value);
  v.businessName = s(v.businessName);
  v.businessDetails = so(v.businessDetails);
  v.clientName = s(v.clientName);
  v.clientDetails = so(v.clientDetails);
  v.invoiceNumber = s(v.invoiceNumber);
  v.invoiceDate = s(v.invoiceDate);
  v.dueDate = so(v.dueDate);
  v.notes = so(v.notes);
  for (const item of v.items) item.description = s(item.description);
  const currency = s(v.currency?.trim() || "$");
  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;
  if (logo) {
    imageDimensions(logo.bytes);
    const format = detectLogoFormat(logo.bytes);
    const embedded =
      format === "png"
        ? await doc.embedPng(logo.bytes)
        : await doc.embedJpg(logo.bytes);
    const dims = fitDimensions(embedded.width, embedded.height, 140, 50);
    page.drawImage(embedded, {
      x: MARGIN,
      y: y - dims.height,
      width: dims.width,
      height: dims.height,
    });
    y -= dims.height + 18;
  }
  function ensureSpace(needed: number) {
    if (y - needed < MARGIN + 30) {
      page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
  }
  function text(
    value: string,
    x: number,
    options: {
      size?: number;
      bold?: boolean;
      color?: ReturnType<typeof rgb>;
    } = {},
  ) {
    page.drawText(value, {
      x,
      y,
      size: options.size ?? 10,
      font: options.bold ? bold : font,
      color: options.color ?? ink,
    });
  }
  function rightAlign(
    value: string,
    rightX: number,
    size: number,
    useBold = false,
  ) {
    const f = useBold ? bold : font;
    return rightX - f.widthOfTextAtSize(value, size);
  }
  text("INVOICE", MARGIN, { size: 24, bold: true });
  text(
    v.invoiceNumber,
    rightAlign(v.invoiceNumber, PAGE_WIDTH - MARGIN, 12, true),
    {
      size: 12,
      bold: true,
    },
  );
  y -= 22;
  const dateLine = `Date: ${v.invoiceDate}`;
  text(dateLine, rightAlign(dateLine, PAGE_WIDTH - MARGIN, 10), {
    size: 10,
    color: gray,
  });
  if (v.dueDate) {
    y -= 14;
    const dueLine = `Due: ${v.dueDate}`;
    text(dueLine, rightAlign(dueLine, PAGE_WIDTH - MARGIN, 10), {
      size: 10,
      color: gray,
    });
  }
  y -= 34;
  const colWidth = (PAGE_WIDTH - MARGIN * 2 - 24) / 2;
  const col2X = MARGIN + colWidth + 24;
  let fromY = y,
    toY = y;
  text("From", MARGIN, { size: 9, color: gray });
  fromY -= 14;
  for (const line of wrapText(v.businessName, bold, 12, colWidth)) {
    page.drawText(line, {
      x: MARGIN,
      y: fromY,
      size: 12,
      font: bold,
      color: ink,
    });
    fromY -= 15;
  }
  if (v.businessDetails)
    for (const line of wrapParagraphs(v.businessDetails, font, 10, colWidth)) {
      page.drawText(line, { x: MARGIN, y: fromY, size: 10, font, color: gray });
      fromY -= 13;
    }
  text("Bill To", col2X, { size: 9, color: gray });
  toY -= 14;
  for (const line of wrapText(v.clientName, bold, 12, colWidth)) {
    page.drawText(line, { x: col2X, y: toY, size: 12, font: bold, color: ink });
    toY -= 15;
  }
  if (v.clientDetails)
    for (const line of wrapParagraphs(v.clientDetails, font, 10, colWidth)) {
      page.drawText(line, { x: col2X, y: toY, size: 10, font, color: gray });
      toY -= 13;
    }
  y = Math.min(fromY, toY) - 26;
  const descWidth = 250;
  const colX = {
    desc: MARGIN,
    qty: MARGIN + 270,
    price: MARGIN + 330,
    amount: PAGE_WIDTH - MARGIN - 70,
  };
  ensureSpace(24);
  page.drawRectangle({
    x: MARGIN,
    y: y - 5,
    width: PAGE_WIDTH - MARGIN * 2,
    height: 20,
    color: rgb(0.93, 0.93, 0.97),
  });
  page.drawText("Description", {
    x: colX.desc + 6,
    y,
    size: 10,
    font: bold,
    color: ink,
  });
  page.drawText("Qty", { x: colX.qty, y, size: 10, font: bold, color: ink });
  page.drawText("Price", {
    x: colX.price,
    y,
    size: 10,
    font: bold,
    color: ink,
  });
  page.drawText("Amount", {
    x: colX.amount,
    y,
    size: 10,
    font: bold,
    color: ink,
  });
  y -= 24;
  for (const item of v.items) {
    const amount = item.quantity * item.price;
    const lines = wrapText(item.description, font, 10, descWidth);
    ensureSpace(14 * lines.length + 6);
    for (const [i, line] of lines.entries()) {
      page.drawText(line, { x: colX.desc + 6, y, size: 10, font, color: ink });
      if (i === 0) {
        page.drawText(String(item.quantity), {
          x: colX.qty,
          y,
          size: 10,
          font,
          color: ink,
        });
        const priceStr = `${currency}${item.price.toFixed(2)}`;
        page.drawText(priceStr, {
          x: rightAlign(priceStr, colX.amount - 20, 10),
          y,
          size: 10,
          font,
          color: ink,
        });
        const amountStr = `${currency}${amount.toFixed(2)}`;
        page.drawText(amountStr, {
          x: rightAlign(amountStr, PAGE_WIDTH - MARGIN, 10),
          y,
          size: 10,
          font,
          color: ink,
        });
      }
      y -= 14;
    }
    y -= 4;
  }
  ensureSpace(70);
  y -= 6;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_WIDTH - MARGIN, y },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.85),
  });
  y -= 20;
  function totalLine(label: string, value: string, useBold = false) {
    const size = useBold ? 13 : 10;
    page.drawText(label, {
      x: colX.price,
      y,
      size,
      font: useBold ? bold : font,
      color: useBold ? ink : gray,
    });
    page.drawText(value, {
      x: rightAlign(value, PAGE_WIDTH - MARGIN, size, useBold),
      y,
      size,
      font: useBold ? bold : font,
      color: ink,
    });
    y -= useBold ? 20 : 15;
  }
  totalLine("Subtotal", `${currency}${totals.subtotal.toFixed(2)}`);
  if (v.taxRate > 0)
    totalLine(`Tax (${v.taxRate}%)`, `${currency}${totals.tax.toFixed(2)}`);
  totalLine("Total", `${currency}${totals.total.toFixed(2)}`, true);
  if (v.notes) {
    ensureSpace(40);
    y -= 16;
    text("Notes", MARGIN, { size: 9, color: gray });
    y -= 14;
    for (const line of wrapParagraphs(
      v.notes,
      font,
      10,
      PAGE_WIDTH - MARGIN * 2,
    )) {
      ensureSpace(13);
      page.drawText(line, { x: MARGIN, y, size: 10, font, color: ink });
      y -= 13;
    }
  }
  return new Uint8Array(await doc.save());
}
