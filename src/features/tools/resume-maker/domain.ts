import { z } from "zod";
export const resumeTemplateIds = ["classic", "modern", "minimal"] as const;
export type ResumeTemplateId = (typeof resumeTemplateIds)[number];
export const resumeEntrySchema = z.object({
  title: z.string().trim().min(1).max(150),
  subtitle: z.string().max(150).optional(),
  dates: z.string().max(60).optional(),
  location: z.string().max(100).optional(),
  bullets: z.array(z.string().trim().max(300)).max(8).optional(),
});
export type ResumeEntry = z.infer<typeof resumeEntrySchema>;
export const resumeSchema = z.object({
  template: z.enum(resumeTemplateIds),
  fullName: z.string().trim().min(1).max(100),
  title: z.string().max(120).optional(),
  email: z.string().max(100).optional(),
  phone: z.string().max(40).optional(),
  location: z.string().max(100).optional(),
  links: z.string().max(200).optional(),
  summary: z.string().max(600).optional(),
  experience: z.array(resumeEntrySchema).max(10).optional(),
  education: z.array(resumeEntrySchema).max(6).optional(),
  projects: z.array(resumeEntrySchema).max(6).optional(),
  skills: z.string().max(500).optional(),
  certifications: z.string().max(500).optional(),
  languages: z.string().max(300).optional(),
});
export type ResumeInput = z.infer<typeof resumeSchema>;
type Color = [number, number, number];
type TemplateStyle = {
  accent: Color;
  ink: Color;
  muted: Color;
  nameSize: number;
  sectionSize: number;
  bodySize: number;
  sectionStyle: "underline" | "bar" | "plain";
  nameColor: "ink" | "accent";
  sectionColor: "ink" | "accent" | "muted";
  sectionCase: "title" | "upper";
  headerDivider: "thin" | "thick" | "none";
  sectionGapAfter: number;
};
export const resumeTemplates: Record<
  ResumeTemplateId,
  { name: string; description: string }
> = {
  classic: {
    name: "Classic",
    description: "Black-and-white, ATS-friendly, underlined section headers.",
  },
  modern: {
    name: "Modern",
    description: "Accent-colored headers with a bold divider under your name.",
  },
  minimal: {
    name: "Minimal",
    description: "Quiet gray headers and generous whitespace.",
  },
};
const TEMPLATE_STYLES: Record<ResumeTemplateId, TemplateStyle> = {
  classic: {
    accent: [0.07, 0.41, 0.3],
    ink: [0.1, 0.1, 0.15],
    muted: [0.45, 0.45, 0.48],
    nameSize: 25,
    sectionSize: 12.5,
    bodySize: 10.5,
    sectionStyle: "underline",
    nameColor: "ink",
    sectionColor: "ink",
    sectionCase: "title",
    headerDivider: "thin",
    sectionGapAfter: 10,
  },
  modern: {
    accent: [0.07, 0.41, 0.3],
    ink: [0.1, 0.1, 0.15],
    muted: [0.45, 0.45, 0.48],
    nameSize: 27,
    sectionSize: 12,
    bodySize: 10.5,
    sectionStyle: "bar",
    nameColor: "accent",
    sectionColor: "accent",
    sectionCase: "upper",
    headerDivider: "thick",
    sectionGapAfter: 10,
  },
  minimal: {
    accent: [0.35, 0.35, 0.37],
    ink: [0.15, 0.15, 0.18],
    muted: [0.5, 0.5, 0.52],
    nameSize: 22,
    sectionSize: 10.5,
    bodySize: 10.5,
    sectionStyle: "plain",
    nameColor: "ink",
    sectionColor: "muted",
    sectionCase: "upper",
    headerDivider: "none",
    sectionGapAfter: 14,
  },
};
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;
export async function generateResumePdf(input: ResumeInput) {
  const v = resumeSchema.parse(input);
  const style = TEMPLATE_STYLES[v.template];
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const { wrapText, wrapParagraphs, sanitizeForPdf } =
    await import("../../files/pdf-text");
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique);
  const color = (c: Color) => rgb(c[0], c[1], c[2]);
  const ink = color(style.ink);
  const muted = color(style.muted);
  const accent = color(style.accent);
  const s = (value: string) => sanitizeForPdf(value, font);
  const so = (value: string | undefined) => (value ? s(value.trim()) : value);
  v.fullName = s(v.fullName);
  v.title = so(v.title);
  v.email = so(v.email);
  v.phone = so(v.phone);
  v.location = so(v.location);
  v.links = so(v.links);
  v.summary = so(v.summary);
  v.skills = so(v.skills);
  v.certifications = so(v.certifications);
  v.languages = so(v.languages);
  const cleanEntries = (entries?: ResumeEntry[]) =>
    (entries ?? [])
      .filter((e) => e.title.trim())
      .map((e) => ({
        title: s(e.title),
        subtitle: so(e.subtitle),
        dates: so(e.dates),
        location: so(e.location),
        bullets: (e.bullets ?? []).map((b) => s(b)).filter(Boolean),
      }));
  const experience = cleanEntries(v.experience);
  const education = cleanEntries(v.education);
  const projects = cleanEntries(v.projects);
  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;
  function ensureSpace(needed: number) {
    if (y - needed < MARGIN + 20) {
      page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
  }
  const contentWidth = PAGE_WIDTH - MARGIN * 2;
  const nameLines = wrapText(v.fullName, bold, style.nameSize, contentWidth);
  for (const line of nameLines) {
    page.drawText(line, {
      x: MARGIN,
      y,
      size: style.nameSize,
      font: bold,
      color: style.nameColor === "accent" ? accent : ink,
    });
    y -= style.nameSize + 4;
  }
  if (v.title) {
    page.drawText(v.title, { x: MARGIN, y, size: 13, font, color: muted });
    y -= 20;
  }
  const contactParts = [v.location, v.phone, v.email, v.links].filter(
    (p): p is string => !!p,
  );
  if (contactParts.length) {
    const contactLine = contactParts.join("   ·   ");
    for (const line of wrapText(contactLine, font, 10, contentWidth)) {
      page.drawText(line, { x: MARGIN, y, size: 10, font, color: muted });
      y -= 14;
    }
  }
  y -= 6;
  if (style.headerDivider !== "none") {
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_WIDTH - MARGIN, y },
      thickness: style.headerDivider === "thick" ? 2.5 : 1,
      color: style.headerDivider === "thick" ? accent : rgb(0.85, 0.85, 0.85),
    });
  }
  y -= 22;
  function sectionTitle(rawTitle: string) {
    const title =
      style.sectionCase === "upper" ? rawTitle.toUpperCase() : rawTitle;
    ensureSpace(26);
    const titleColor =
      style.sectionColor === "accent"
        ? accent
        : style.sectionColor === "muted"
          ? muted
          : ink;
    if (style.sectionStyle === "bar") {
      page.drawRectangle({
        x: MARGIN,
        y: y - 2,
        width: 4,
        height: style.sectionSize + 2,
        color: accent,
      });
      page.drawText(title, {
        x: MARGIN + 10,
        y,
        size: style.sectionSize,
        font: bold,
        color: titleColor,
      });
    } else {
      page.drawText(title, {
        x: MARGIN,
        y,
        size: style.sectionSize,
        font: bold,
        color: titleColor,
      });
    }
    y -= style.sectionStyle === "plain" ? 14 : 16;
    if (style.sectionStyle === "underline") {
      page.drawLine({
        start: { x: MARGIN, y },
        end: { x: PAGE_WIDTH - MARGIN, y },
        thickness: 0.75,
        color: rgb(0.85, 0.85, 0.85),
      });
      y -= 10;
    }
  }
  function paragraph(text: string) {
    for (const line of wrapParagraphs(
      text,
      font,
      style.bodySize,
      contentWidth,
    )) {
      ensureSpace(style.bodySize + 4);
      page.drawText(line, {
        x: MARGIN,
        y,
        size: style.bodySize,
        font,
        color: ink,
      });
      y -= style.bodySize + 4;
    }
  }
  function entryBlock(entry: ReturnType<typeof cleanEntries>[number]) {
    ensureSpace(style.bodySize + 14);
    const dateWidth = entry.dates
      ? bold.widthOfTextAtSize(entry.dates, style.bodySize) + 4
      : 0;
    for (const line of wrapText(
      entry.title,
      bold,
      style.bodySize + 1,
      contentWidth - dateWidth,
    )) {
      page.drawText(line, {
        x: MARGIN,
        y,
        size: style.bodySize + 1,
        font: bold,
        color: ink,
      });
      y -= style.bodySize + 5;
    }
    if (entry.dates) {
      page.drawText(entry.dates, {
        x: PAGE_WIDTH - MARGIN - (dateWidth - 4),
        y: y + style.bodySize + 5,
        size: style.bodySize,
        font,
        color: muted,
      });
    }
    const subLine = [entry.subtitle, entry.location]
      .filter(Boolean)
      .join(" — ");
    if (subLine) {
      for (const line of wrapText(
        subLine,
        italic,
        style.bodySize,
        contentWidth,
      )) {
        ensureSpace(style.bodySize + 4);
        page.drawText(line, {
          x: MARGIN,
          y,
          size: style.bodySize,
          font: italic,
          color: muted,
        });
        y -= style.bodySize + 4;
      }
    }
    for (const bullet of entry.bullets) {
      const lines = wrapText(bullet, font, style.bodySize, contentWidth - 14);
      ensureSpace(style.bodySize + 4);
      page.drawText("•", {
        x: MARGIN + 2,
        y,
        size: style.bodySize,
        font,
        color: ink,
      });
      for (const [i, line] of lines.entries()) {
        if (i > 0) ensureSpace(style.bodySize + 4);
        page.drawText(line, {
          x: MARGIN + 14,
          y,
          size: style.bodySize,
          font,
          color: ink,
        });
        y -= style.bodySize + 4;
      }
    }
    y -= 6;
  }
  function tagLine(items: string) {
    ensureSpace(style.bodySize + 4);
    for (const line of wrapText(items, font, style.bodySize, contentWidth)) {
      page.drawText(line, {
        x: MARGIN,
        y,
        size: style.bodySize,
        font,
        color: ink,
      });
      y -= style.bodySize + 4;
    }
  }
  if (v.summary) {
    sectionTitle("Summary");
    paragraph(v.summary);
    y -= style.sectionGapAfter;
  }
  if (experience.length) {
    sectionTitle("Experience");
    for (const entry of experience) entryBlock(entry);
    y -= style.sectionGapAfter;
  }
  if (education.length) {
    sectionTitle("Education");
    for (const entry of education) entryBlock(entry);
    y -= style.sectionGapAfter;
  }
  if (v.skills) {
    sectionTitle("Skills");
    tagLine(v.skills);
    y -= style.sectionGapAfter;
  }
  if (projects.length) {
    sectionTitle("Projects");
    for (const entry of projects) entryBlock(entry);
    y -= style.sectionGapAfter;
  }
  if (v.certifications) {
    sectionTitle("Certifications");
    for (const line of v.certifications
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean))
      tagLine(line);
    y -= style.sectionGapAfter;
  }
  if (v.languages) {
    sectionTitle("Languages");
    tagLine(v.languages);
  }
  return new Uint8Array(await doc.save());
}
