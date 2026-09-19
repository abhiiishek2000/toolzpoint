import { it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import {
  generateResumePdf,
  resumeTemplateIds,
  type ResumeInput,
} from "../src/features/tools/resume-maker/domain";
const sample: ResumeInput = {
  template: "classic",
  fullName: "Ada Lovelace",
  title: "Senior Software Engineer",
  email: "ada@example.com",
  phone: "+1 555 0100",
  location: "London, UK",
  links: "linkedin.com/in/ada",
  summary:
    "Engineer with a decade of experience building analytical engines and writing the first published computer program.",
  experience: [
    {
      title: "Lead Engineer",
      subtitle: "Analytical Engines Ltd",
      dates: "2020 – Present",
      location: "London, UK",
      bullets: [
        "Designed the punched-card control system used across three product lines.",
        "Mentored a team of six engineers.",
      ],
    },
  ],
  education: [
    {
      title: "Mathematics",
      subtitle: "University of London",
      dates: "2015 – 2019",
    },
  ],
  skills: "Algorithm design, Mathematics, Technical writing",
  projects: [{ title: "Bernoulli Number Algorithm", dates: "2018" }],
  certifications: "Certified Analytical Engineer",
  languages: "English, French",
};
it("generates a loadable PDF for every template", async () => {
  for (const template of resumeTemplateIds) {
    const bytes = await generateResumePdf({ ...sample, template });
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(1);
  }
});
it("generates a minimal one-section resume without optional fields", async () => {
  const bytes = await generateResumePdf({
    template: "modern",
    fullName: "Sam Rivera",
  });
  const doc = await PDFDocument.load(bytes);
  expect(doc.getPageCount()).toBe(1);
});
it("paginates a long resume across multiple pages", async () => {
  const manyBullets = Array.from(
    { length: 8 },
    (_, i) =>
      `Delivered project number ${i + 1} on time and under budget with a cross-functional team.`,
  );
  const experience = Array.from({ length: 8 }, (_, i) => ({
    title: `Role ${i + 1}`,
    subtitle: `Company ${i + 1}`,
    dates: "2018 – 2019",
    bullets: manyBullets,
  }));
  const bytes = await generateResumePdf({ ...sample, experience });
  const doc = await PDFDocument.load(bytes);
  expect(doc.getPageCount()).toBeGreaterThan(1);
});
it("rejects a missing name or a blank experience title", async () => {
  await expect(
    generateResumePdf({ ...sample, fullName: "" }),
  ).rejects.toThrow();
  await expect(
    generateResumePdf({ ...sample, experience: [{ title: "   " }] }),
  ).rejects.toThrow();
});
it("does not crash when a title has no WinAnsi-renderable characters", async () => {
  const bytes = await generateResumePdf({
    ...sample,
    experience: [{ title: "🚀" }, { title: "Real Role" }],
  });
  const doc = await PDFDocument.load(bytes);
  expect(doc.getPageCount()).toBeGreaterThanOrEqual(1);
});
it("does not crash on characters outside WinAnsi", async () => {
  const bytes = await generateResumePdf({
    ...sample,
    fullName: "अनन्या शर्मा / Ananya Sharma",
    summary: "Emoji test 😀 and em dash — should not crash.",
  });
  const doc = await PDFDocument.load(bytes);
  expect(doc.getPageCount()).toBeGreaterThanOrEqual(1);
});
