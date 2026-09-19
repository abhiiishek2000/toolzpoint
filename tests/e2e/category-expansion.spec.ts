import { expect, test } from "@playwright/test";
import { PDFDocument } from "pdf-lib";
import { readFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
const forms: [string, string][] = [
  ["binary-text-converter", "01001000"],
  ["url-parser", "example.com"],
  ["timestamp-converter", "1970-01-01"],
  ["json-to-csv-converter", '"Ada"'],
  ["tip-calculator", "57.5"],
  ["average-calculator", "Mean"],
  ["ratio-calculator", "2:3"],
  ["simple-interest-calculator", "1,100"],
  ["roi-calculator", "20"],
  ["break-even-calculator", "2,500"],
  ["bmr-calculator", "1,648.75"],
  ["sitemap-generator", "<urlset"],
  ["hashtag-generator", "#design #tools"],
  ["weight-converter", "1,000"],
  ["length-converter", "100"],
  ["speed-converter", "3.6"],
  ["data-storage-converter", "8"],
  ["number-base-converter", "FF"],
  ["pin-code-generator", ""],
  ["dice-roller", "Rolls"],
  ["random-number-generator", ""],
  ["random-name-picker", ""],
  ["receipt-maker", "Amount: INR 100.00"],
];
for (const [slug, expected] of forms)
  test(`${slug} works with sample inputs`, async ({ page }) => {
    await page.goto(`/tools/${slug}`);
    const workspace = page.locator(".workspace");
    const example = workspace.getByRole("button", { name: "Try an example" });
    if (await example.count()) await example.click();
    await workspace.locator('button[type="submit"]').click();
    await expect(workspace.getByRole("status")).toContainText("Result ready");
    const result = workspace.getByRole("textbox", { name: "Result output" });
    if (await result.count()) {
      const output = await result.inputValue();
      expect(output).toContain(expected);
      if (slug === "pin-code-generator")
        expect(output).toMatch(/^\d{6}(\n\d{6}){4}$/);
      if (slug === "random-number-generator")
        expect(
          output.split("\n").every((v) => Number(v) >= 1 && Number(v) <= 100),
        ).toBe(true);
      if (slug === "random-name-picker")
        expect(["Alex", "Sam", "Taylor"]).toContain(output);
    } else
      await expect(workspace.locator(".result-stats")).toContainText(expected);
    await expect(
      workspace.getByRole("button", { name: "Copy", exact: true }),
    ).toBeEnabled();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
    await workspace.getByRole("button", { name: "Reset", exact: true }).click();
    await expect(
      workspace.getByRole("button", { name: "Copy", exact: true }),
    ).toBeDisabled();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
test("receipt validation and form accessibility", async ({ page }) => {
  await page.goto("/tools/receipt-maker");
  await page.getByLabel("Received from", { exact: true }).fill("");
  await page.locator('.workspace button[type="submit"]').click();
  await expect(page.locator(".workspace").getByRole("alert")).toContainText(
    "payer",
  );
  const scan = await new AxeBuilder({ page }).analyze();
  expect(
    scan.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
});
for (const slug of ["image-format-converter", "image-rotator-flipper"])
  test(`${slug} downloads actual transformed pixels`, async ({ page }) => {
    await page.goto(`/tools/${slug}`);
    const input = await page.evaluate(() => {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 400;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ff0000";
      ctx.fillRect(0, 0, 400, 400);
      ctx.fillStyle = "#0000ff";
      ctx.fillRect(400, 0, 400, 400);
      return canvas.toDataURL().split(",")[1]!;
    });
    await page.getByLabel("Choose image files", { exact: true }).setInputFiles({
      name: "sample.png",
      mimeType: "image/png",
      buffer: Buffer.from(input, "base64"),
    });
    await page
      .getByRole("combobox", { name: "Save as", exact: true })
      .selectOption("image/png");
    await page
      .getByRole("button", {
        name:
          slug === "image-format-converter"
            ? "Convert image"
            : "Transform image",
        exact: true,
      })
      .click();
    await expect(
      page.locator(".creative-workspace").getByRole("status"),
    ).toContainText("ready to download");
    const pixels = await page
      .locator("a.download-result")
      .evaluate(async (a) => {
        const bitmap = await createImageBitmap(
          await (await fetch((a as HTMLAnchorElement).href)).blob(),
        );
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(bitmap, 0, 0);
        const values = {
          width: bitmap.width,
          height: bitmap.height,
          topLeft: [...ctx.getImageData(10, 10, 1, 1).data],
          far: [
            ...ctx.getImageData(bitmap.width - 10, bitmap.height - 10, 1, 1)
              .data,
          ],
        };
        bitmap.close();
        return values;
      });
    expect([pixels.width, pixels.height]).toEqual(
      slug === "image-format-converter" ? [800, 400] : [400, 800],
    );
    expect(pixels.topLeft).toEqual([255, 0, 0, 255]);
    expect(pixels.far).toEqual([0, 0, 255, 255]);
    if (slug === "image-format-converter") {
      await page
        .getByRole("combobox", { name: "Save as", exact: true })
        .selectOption("image/jpeg");
      await page
        .getByRole("button", { name: "Convert image", exact: true })
        .click();
      await expect(
        page.locator(".creative-workspace").getByRole("status"),
      ).toContainText("ready to download");
      const mime = await page
        .locator("a.download-result")
        .evaluate(
          async (a) =>
            (await (await fetch((a as HTMLAnchorElement).href)).blob()).type,
        );
      expect(mime).toBe("image/jpeg");
    }
    if (slug === "image-rotator-flipper") {
      await page
        .getByRole("combobox", { name: "Clockwise rotation", exact: true })
        .selectOption("0");
      await page
        .getByRole("combobox", { name: "Flip before rotation", exact: true })
        .selectOption("horizontal");
      await page
        .getByRole("button", { name: "Transform image", exact: true })
        .click();
      await expect(
        page.locator(".creative-workspace").getByRole("status"),
      ).toContainText("ready to download");
      const left = await page
        .locator("a.download-result")
        .evaluate(async (a) => {
          const bitmap = await createImageBitmap(
            await (await fetch((a as HTMLAnchorElement).href)).blob(),
          );
          const canvas = document.createElement("canvas");
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(bitmap, 0, 0);
          const pixel = [...ctx.getImageData(10, 10, 1, 1).data];
          bitmap.close();
          return pixel;
        });
      expect(left).toEqual([0, 0, 255, 255]);
    }
    const scan = await new AxeBuilder({ page }).analyze();
    expect(
      scan.violations.filter((v) =>
        ["serious", "critical"].includes(v.impact ?? ""),
      ),
    ).toEqual([]);
  });
for (const slug of ["rotate-pdf", "add-page-numbers-to-pdf"])
  test(`${slug} produces a valid PDF through the worker`, async ({ page }) => {
    const source = await PDFDocument.create();
    source.addPage([300, 400]);
    source.addPage([400, 500]);
    await page.goto(`/tools/${slug}`);
    await page.getByLabel("Choose PDF files", { exact: true }).setInputFiles({
      name: "sample.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from(await source.save()),
    });
    await page
      .getByRole("button", {
        name: slug === "rotate-pdf" ? "Rotate PDF" : "Add page numbers",
        exact: true,
      })
      .click();
    await expect(
      page.locator(".creative-workspace").getByRole("status"),
    ).toContainText("ready to download");
    const pending = page.waitForEvent("download");
    await page.getByRole("link", { name: "Download PDF" }).click();
    const download = await pending;
    const path = await download.path();
    const result = await PDFDocument.load(await readFile(path!));
    expect(result.getPageCount()).toBe(2);
    if (slug === "rotate-pdf")
      expect(result.getPages().map((p) => p.getRotation().angle)).toEqual([
        90, 90,
      ]);
    const scan = await new AxeBuilder({ page }).analyze();
    expect(
      scan.violations.filter((v) =>
        ["serious", "critical"].includes(v.impact ?? ""),
      ),
    ).toEqual([]);
  });
test("small unit conversions retain useful precision", async ({ page }) => {
  await page.goto("/tools/length-converter");
  await page
    .getByRole("combobox", { name: "From unit", exact: true })
    .selectOption("mm");
  await page
    .getByRole("combobox", { name: "To unit", exact: true })
    .selectOption("m");
  await page.locator('.workspace button[type="submit"]').click();
  await expect(page.locator(".result-stats")).toContainText("0.001");
});
