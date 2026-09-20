import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("SIP shows reconciling yearly/monthly rows and exports the whole schedule", async ({
  page,
}) => {
  await page.goto("/tools/sip-calculator");
  await page.getByLabel("Monthly investment", { exact: true }).fill("100");
  await page.getByLabel("Assumed annual return (%)").fill("0");
  await page.getByLabel("Investment period (years)").fill("2");
  await page.getByRole("button", { name: "Calculate result" }).click();
  await expect(
    page
      .locator(".result-stats")
      .getByText("₹2,400.00", { exact: true })
      .first(),
  ).toBeVisible();
  const table = page.getByRole("table", { name: "Yearly growth schedule" });
  await expect(table.locator("tbody tr")).toHaveCount(2);
  await expect(table.locator("tbody tr").last()).toContainText("₹2,400.00");
  await page.getByRole("button", { name: "Monthly", exact: true }).click();
  await expect(
    page
      .getByRole("table", { name: "Monthly growth schedule" })
      .locator("tbody tr"),
  ).toHaveCount(12);
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByText("Rows 13–24 of 24")).toBeVisible();
  await expect(
    page.locator(".schedule-panel .detail-table tbody tr").last(),
  ).toContainText("₹2,400.00");
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download CSV" }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe("sip-calculator-monthly.csv");
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const csv = Buffer.concat(chunks).toString("utf8");
  expect(csv).toContain('"24","2300","100","0","2400"');
  expect(csv.split("\r\n")).toHaveLength(26);
});

test("invalid edits cannot leave a previous result available for copy or export", async ({
  page,
}) => {
  await page.goto("/tools/compound-interest-calculator");
  await page.getByRole("button", { name: "Calculate result" }).click();
  await expect(
    page.getByRole("button", { name: "Download CSV" }),
  ).toBeVisible();
  await page.getByLabel("Principal amount", { exact: true }).fill("-1");
  await expect(
    page.getByRole("button", { name: "Copy", exact: true }),
  ).toBeDisabled();
  await expect(page.getByRole("button", { name: "Download CSV" })).toHaveCount(
    0,
  );
  await page.getByRole("button", { name: "Calculate result" }).click();
  await expect(page.locator(".workspace").getByRole("alert")).toBeVisible();
  await page.getByLabel("Principal amount", { exact: true }).fill("1000");
  await page.getByLabel("Time period (years)").fill("1.1");
  await page.getByLabel("Annual interest rate (%)").fill("10");
  await page.getByLabel("Compounding frequency").selectOption("1");
  await page.getByRole("button", { name: "Calculate result" }).click();
  await expect(
    page.locator(".schedule-panel .detail-table tbody tr"),
  ).toHaveCount(2);
  await expect(
    page.locator(".schedule-panel .detail-table tbody tr").last(),
  ).toContainText("1.1");
  await expect(
    page.locator(".schedule-panel .detail-table tbody tr").last(),
  ).toContainText("₹1,110.53");
});

test("conversion tables, result interpretation and page guidance are accessible", async ({
  page,
}) => {
  await page.goto("/tools/weight-converter");
  await page.getByRole("button", { name: "Calculate result" }).click();
  await expect(page.getByRole("table").last()).toContainText("1,000");
  await expect(
    page.getByRole("heading", { name: "Understanding your result" }),
  ).toBeVisible();
  await page.getByText("Method & assumptions", { exact: true }).click();
  await expect(
    page.locator(".workspace-method details").first(),
  ).toHaveAttribute("open", "");
  const scan = await new AxeBuilder({ page }).analyze();
  expect(
    scan.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? ""),
    ),
  ).toEqual([]);
});

test("finance reports fit narrow screens and support dark mode and reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/tools/sip-calculator");
  await page.getByRole("button", { name: "Calculate result" }).click();
  await expect(page.getByRole("table").last()).toBeVisible();
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await page.setViewportSize({ width: 320, height: 740 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator(".result-details")).toHaveCSS(
    "animation-name",
    "none",
  );
  const scan = await new AxeBuilder({ page }).analyze();
  expect(
    scan.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? ""),
    ),
  ).toEqual([]);
});

test("tool-specific SEO and instructions are present before JavaScript runs", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/tools/sip-calculator");
  await expect(page).toHaveTitle(
    /SIP Calculator.*Monthly Investment.*Yearly Returns/,
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /monthly or yearly investment breakdown/,
  );
  await expect(
    page.getByRole("heading", { name: "How to use the sip calculator" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "SIP Calculator examples" }),
  ).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "http://localhost:3000/tools/sip-calculator",
  );
  const schemas = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  const application = schemas
    .map((schema) => JSON.parse(schema))
    .find((schema) => schema["@type"] === "WebApplication");
  expect(application.isAccessibleForFree).toBe(true);
  await page.goto("/tools/image-compressor");
  await expect(
    page.getByRole("heading", { name: "How to use the image compressor" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Compare the preview and output file size with the original.",
      { exact: false },
    ),
  ).toBeVisible();
  await context.close();
});
