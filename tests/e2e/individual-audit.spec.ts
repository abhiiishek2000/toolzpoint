import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
async function accessible(page: import("@playwright/test").Page) {
  const scan = await new AxeBuilder({ page }).analyze();
  expect(
    scan.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
}
import { PDFDocument } from "pdf-lib";
import { readFileSync } from "node:fs";
const tools: { slug: string; shortDescription: string }[] = JSON.parse(
  readFileSync(
    new URL("../../src/lib/catalog-data.json", import.meta.url),
    "utf8",
  ),
);
import { imageDimensions } from "../../src/features/files/domain";
const fileSlugs = [
  "image-compressor",
  "image-resizer",
  "image-format-converter",
  "image-rotator-flipper",
  "rotate-pdf",
  "add-page-numbers-to-pdf",
  "merge-pdf",
  "images-to-pdf",
  "split-pdf",
  "organize-pdf-pages",
  "watermark-pdf",
  "passport-photo-maker",
  "social-media-image-resizer",
];
const special = [
  ...fileSlugs,
  "pdf-page-counter",
  "qr-code-generator",
  "invoice-maker",
  "biodata-maker",
  "resume-maker",
];
for (const tool of tools.filter((t) => !special.includes(t.slug)))
  test(`${tool.slug}: individual report, metadata, mobile fit and reset`, async ({
    page,
  }) => {
    await page.goto(`/tools/${tool.slug}`);
    await page.emulateMedia({ reducedMotion: "reduce" });
    const workspace = page.locator(".workspace");
    const example = workspace.getByRole("button", { name: "Try an example" });
    if (await example.count()) await example.click();
    await workspace.locator('button[type="submit"]').click();
    await expect(workspace.getByRole("status")).toContainText("Result ready");
    const report = workspace.getByRole("region", {
      name: "Detailed result report",
      exact: true,
    });
    await expect(report).toBeVisible();
    await expect(report.getByRole("table").first()).toBeVisible();
    expect(await report.innerText()).not.toMatch(
      /\b(?:NaN|undefined|Infinity)\b/,
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      `${tool.shortDescription}${tool.shortDescription.length > 120 ? " Free online." : " Free online, with examples. No sign-up or uploads."}`,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      new RegExp(`/tools/${tool.slug}$`),
    );
    await expect(page.locator("#tool-faq details")).toHaveCount(3);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await accessible(page);
    await workspace.getByRole("button", { name: "Reset", exact: true }).click();
    await expect(
      workspace.getByRole("button", { name: "Copy", exact: true }),
    ).toBeDisabled();
    await expect(report).toHaveCount(0);
  });
async function bytes(download: import("@playwright/test").Download) {
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}
for (const slug of fileSlugs)
  test(`${slug}: verified file and individual operation report`, async ({
    page,
  }) => {
    await page.goto(`/tools/${slug}`);
    const pdf = [
      "rotate-pdf",
      "add-page-numbers-to-pdf",
      "merge-pdf",
      "split-pdf",
      "organize-pdf-pages",
      "watermark-pdf",
    ].includes(slug);
    const doc = await PDFDocument.create();
    doc.addPage([300, 400]);
    doc.addPage([500, 600]);
    const pdfBytes = Buffer.from(await doc.save());
    const png = Buffer.from(
      await page.evaluate(() => {
        const canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 600;
        const c = canvas.getContext("2d")!;
        c.fillStyle = "#335599";
        c.fillRect(0, 0, 800, 600);
        c.fillStyle = "#ffeeaa";
        c.fillRect(100, 100, 300, 200);
        return canvas.toDataURL("image/png").split(",")[1]!;
      }),
      "base64",
    );
    const file = {
      name: pdf ? "first.pdf" : "sample.png",
      mimeType: pdf ? "application/pdf" : "image/png",
      buffer: pdf ? pdfBytes : png,
    };
    await page
      .getByLabel(pdf ? "Choose PDF files" : "Choose image files", {
        exact: true,
      })
      .setInputFiles(
        slug === "merge-pdf" ? [file, { ...file, name: "second.pdf" }] : [file],
      );
    if (slug === "split-pdf")
      await page.getByLabel("Pages", { exact: true }).fill("2");
    if (slug === "organize-pdf-pages")
      await page.getByLabel("New page order", { exact: true }).fill("2,1,2");
    await page.locator(".file-input-side fieldset .button.primary").click();
    await expect(
      page.locator(".file-preview-side .result-status"),
    ).toContainText("ready to download", { timeout: 20000 });
    await expect(page.locator(".file-preview-side table")).toBeVisible();
    const downloadEvent = page.waitForEvent("download");
    await page
      .getByRole("link", { name: /Download (PDF|WEBP|JPG|PNG)/ })
      .click();
    const output = await bytes(await downloadEvent);
    if (pdf || slug === "images-to-pdf") {
      const exported = await PDFDocument.load(output);
      const expected =
        slug === "merge-pdf"
          ? 4
          : slug === "organize-pdf-pages"
            ? 3
            : slug === "split-pdf" || slug === "images-to-pdf"
              ? 1
              : 2;
      expect(exported.getPageCount()).toBe(expected);
      if (slug === "rotate-pdf")
        expect(exported.getPages().map((p) => p.getRotation().angle)).toEqual([
          90, 90,
        ]);
      if (slug === "organize-pdf-pages")
        expect(exported.getPages().map((p) => p.getWidth())).toEqual([
          500, 300, 500,
        ]);
      if (slug === "split-pdf")
        expect(exported.getPage(0).getWidth()).toBe(500);
    } else {
      const dim = imageDimensions(output);
      expect(dim.width).toBeGreaterThan(0);
      expect(dim.height).toBeGreaterThan(0);
      if (slug === "image-rotator-flipper")
        expect(dim).toEqual({ width: 600, height: 800 });
      if (
        [
          "image-compressor",
          "image-resizer",
          "image-format-converter",
        ].includes(slug)
      )
        expect(dim).toEqual({ width: 800, height: 600 });
      await page.getByRole("button", { name: "Original", exact: true }).click();
      await expect(page.getByAltText("Original image preview")).toBeVisible();
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await accessible(page);
    await page.getByRole("button", { name: "Reset", exact: true }).click();
    await expect(
      page.getByRole("link", { name: /Download (PDF|WEBP|JPG|PNG)/ }),
    ).toHaveCount(0);
  });
test("pdf-page-counter: per-page information, copy and reset", async ({
  page,
}) => {
  const doc = await PDFDocument.create();
  doc.addPage([300, 400]);
  doc.addPage([500, 600]);
  await page.goto("/tools/pdf-page-counter");
  await page.getByLabel("Choose a PDF file").setInputFiles({
    name: "report.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from(await doc.save()),
  });
  await expect(
    page
      .getByRole("table", { name: "Page-by-page PDF inspection" })
      .locator("tbody tr"),
  ).toHaveCount(2);
  await expect(
    page.getByRole("table").locator("tbody tr").last(),
  ).toContainText("500");
  await expect(page.getByRole("button", { name: "Copy report" })).toBeEnabled();
  await accessible(page);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.getByRole("table")).toHaveCount(0);
});
test("qr-code-generator: inspect and verify PNG dimensions", async ({
  page,
}) => {
  await page.goto("/tools/qr-code-generator");
  await page
    .getByRole("button", { name: "Create QR code", exact: true })
    .click();
  await expect(
    page.getByRole("table", { name: "QR encoding and print specification" }),
  ).toContainText("640 × 640");
  const event = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download PNG" }).click();
  expect(imageDimensions(await bytes(await event))).toEqual({
    width: 640,
    height: 640,
  });
  await accessible(page);
  await page.getByLabel("Link or text", { exact: true }).fill("changed");
  await expect(
    page.getByRole("region", { name: "Detailed result report", exact: true }),
  ).toHaveCount(0);
});
for (const kind of ["invoice", "biodata", "resume"])
  test(`${kind}-maker: actual PDF export inspection and reset`, async ({
    page,
  }) => {
    await page.goto(`/tools/${kind}-maker`);
    if (kind === "invoice") {
      await page
        .getByLabel("Business name", { exact: true })
        .fill("Acme Studio");
      await page.getByLabel("Client name", { exact: true }).fill("Alex Client");
      await page
        .getByLabel("Item description", { exact: true })
        .fill("Design work");
      await page.getByLabel("Unit price", { exact: true }).fill("100");
    } else
      await page.getByLabel("Full name", { exact: true }).fill("Alex Example");
    const event = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Download PDF", exact: true })
      .click();
    const pdf = await PDFDocument.load(await bytes(await event));
    expect(pdf.getPageCount()).toBe(1);
    await expect(
      page.getByRole("region", { name: "Detailed result report", exact: true }),
    ).toContainText("PDF pages");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await accessible(page);
    await page.getByRole("button", { name: "Reset", exact: true }).click();
    await expect(
      page.getByRole("region", { name: "Detailed result report", exact: true }),
    ).toHaveCount(0);
  });
