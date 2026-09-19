import { it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import {
  generateBiodataPdf,
  type BiodataInput,
} from "../src/features/tools/biodata-maker/domain";
const TINY_PNG = Uint8Array.from(
  atob(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  ),
  (c) => c.charCodeAt(0),
);
const sample: BiodataInput = {
  fullName: "Ananya Sharma",
  dateOfBirth: "1998-04-12",
  timeOfBirth: "6:45 AM",
  placeOfBirth: "Jaipur, Rajasthan",
  height: "5'4\"",
  complexion: "Fair",
  bloodGroup: "B+",
  religion: "Hindu",
  caste: "",
  education: "M.Tech, Computer Science",
  occupation: "Software Engineer",
  income: "₹12,00,000 per annum",
  fatherName: "Rajesh Sharma (Business)",
  motherName: "Sunita Sharma (Homemaker)",
  siblings: "One younger brother, studying engineering",
  address: "42 Lake View Colony, Jaipur",
  phone: "+91 98765 43210",
  email: "ananya.sharma@example.com",
};
it("generates a loadable biodata PDF with only the filled sections", async () => {
  const bytes = await generateBiodataPdf(sample);
  const doc = await PDFDocument.load(bytes);
  expect(doc.getPageCount()).toBe(1);
});
it("omits blank optional fields without throwing", async () => {
  const minimal: BiodataInput = { fullName: "Jordan Lee" };
  const bytes = await generateBiodataPdf(minimal);
  const doc = await PDFDocument.load(bytes);
  expect(doc.getPageCount()).toBe(1);
});
it("embeds an optional photo", async () => {
  const bytes = await generateBiodataPdf({
    ...sample,
    photo: { bytes: TINY_PNG, type: "image/png" },
  });
  const doc = await PDFDocument.load(bytes);
  expect(doc.getPageCount()).toBe(1);
});
it("rejects a missing full name", async () => {
  await expect(generateBiodataPdf({ fullName: "" })).rejects.toThrow();
});
it("does not crash on a rupee symbol or other characters outside WinAnsi", async () => {
  const bytes = await generateBiodataPdf({
    fullName: "अनन्या Sharma 😀",
    income: "₹12,00,000 per annum",
  });
  const doc = await PDFDocument.load(bytes);
  expect(doc.getPageCount()).toBeGreaterThanOrEqual(1);
});
it("paginates when there is enough content to overflow one page", async () => {
  const pad = (max: number) => "word ".repeat(Math.floor(max / 5));
  const bytes = await generateBiodataPdf({
    fullName: "A Very Long Full Name That Wraps Across Multiple Lines Indeed",
    dateOfBirth: pad(40),
    timeOfBirth: pad(40),
    placeOfBirth: pad(100),
    height: pad(40),
    complexion: pad(40),
    bloodGroup: pad(10),
    religion: pad(60),
    caste: pad(60),
    education: pad(200),
    occupation: pad(150),
    income: pad(60),
    fatherName: pad(150),
    motherName: pad(150),
    siblings: pad(300),
    address: pad(300),
    phone: pad(40),
    email: pad(100),
  });
  const doc = await PDFDocument.load(bytes);
  expect(doc.getPageCount()).toBeGreaterThan(1);
});
