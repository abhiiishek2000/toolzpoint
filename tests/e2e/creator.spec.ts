import { test, expect } from "@playwright/test";
import { PDFDocument } from "pdf-lib";
import AxeBuilder from "@axe-core/playwright";
async function imageBytes(
  page: import("@playwright/test").Page,
  format = "image/png",
) {
  return Buffer.from(
    await page.evaluate((format) => {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 400;
      const c = canvas.getContext("2d")!;
      c.fillStyle = "#5049df";
      c.fillRect(0, 0, 800, 400);
      c.fillStyle = "#d9f49c";
      c.fillRect(120, 80, 300, 200);
      return canvas.toDataURL(format).split(",")[1]!;
    }, format),
    "base64",
  );
}
for (const slug of ["image-compressor", "image-resizer", "images-to-pdf"])
  test(`${slug} processes and downloads local files`, async ({ page }) => {
    await page.goto(`/tools/${slug}`);
    const mime =
      slug === "image-compressor"
        ? "image/jpeg"
        : slug === "images-to-pdf"
          ? "image/webp"
          : "image/png";
    const buffer = await imageBytes(page, mime);
    await page
      .getByLabel("Choose image files", { exact: true })
      .setInputFiles({ name: "sample.png", mimeType: "image/png", buffer });
    await page
      .getByRole("button", { name: /Compress image|Resize image|Create PDF/ })
      .click();
    await expect(
      page.locator('.creative-workspace [role="status"]'),
    ).toContainText("ready to download", { timeout: 20000 });
    const download = page.waitForEvent("download");
    await page
      .getByRole("link", { name: /Download WEBP|Download PDF/ })
      .click();
    const file = await download;
    expect(file.suggestedFilename()).toMatch(/\.(webp|pdf)$/);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    const scan = await new AxeBuilder({ page }).analyze();
    expect(
      scan.violations.filter((v) =>
        ["serious", "critical"].includes(v.impact ?? ""),
      ),
    ).toEqual([]);
  });
test("merge PDFs in a chosen order with a downloadable result", async ({
  page,
}) => {
  const doc = await PDFDocument.create();
  doc.addPage();
  const bytes = Buffer.from(await doc.save());
  await page.goto("/tools/merge-pdf");
  await page.getByLabel("Choose PDF files", { exact: true }).setInputFiles([
    { name: "first.pdf", mimeType: "application/pdf", buffer: bytes },
    { name: "second.pdf", mimeType: "application/pdf", buffer: bytes },
  ]);
  await page.getByRole("button", { name: "Move file 2 up" }).click();
  await expect(page.locator(".file-list li").first()).toContainText(
    "second.pdf",
  );
  await page.getByRole("button", { name: "Merge PDFs", exact: true }).click();
  await expect(
    page.locator('.creative-workspace [role="status"]'),
  ).toContainText("ready to download", { timeout: 20000 });
  await expect(page.locator(".file-result-metrics")).toContainText("Pages2");
});
test("QR creator generates actual downloadable codes and validates empty input", async ({
  page,
}) => {
  await page.goto("/tools/qr-code-generator");
  await page
    .getByLabel("Link or text", { exact: true })
    .fill("https://example.com/creator");
  await page
    .getByRole("button", { name: "Create QR code", exact: true })
    .click();
  await expect(page.locator(".qr-paper img")).toHaveAttribute(
    "src",
    /^data:image\/png;base64,/,
  );
  const download = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download PNG" }).click();
  expect((await download).suggestedFilename()).toBe("toolzpoint-qr.png");
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page
    .getByRole("button", { name: "Create QR code", exact: true })
    .click();
  await expect(
    page.locator('.creative-workspace [role="alert"]'),
  ).toContainText("Enter text");
});
test("homepage quick QR and task filters work", async ({ page }) => {
  await page.goto("/");
  await page
    .getByLabel("Link or text", { exact: true })
    .fill("https://example.com/my-link");
  await page
    .getByRole("button", { name: "Create QR code", exact: true })
    .click();
  await expect(page.locator('.qr-creator [role="status"]')).toContainText(
    "ready to download",
  );
  await page.getByRole("button", { name: "Build & publish" }).click();
  await expect(page.locator(".launchpad .tool-card")).toHaveCount(6);
  await page
    .getByRole("textbox", { name: "Find a tool", exact: true })
    .fill("compress");
  await expect(page.locator(".launchpad .tool-card")).toHaveCount(1);
});
