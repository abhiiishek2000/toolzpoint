import { gzipSync } from "node:zlib";
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const cases = [
  ["word-counter", "Words"],
  ["json-formatter", "ToolzPoint"],
  ["percentage-calculator", "30"],
  ["age-calculator", "Years"],
  ["base64-encoder-decoder", "SGVsbG8"],
  ["url-encoder-decoder", "hello%20"],
  ["uuid-generator", "-"],
  ["slug-generator", "a-little-less"],
  ["utm-builder", "utm_source"],
  ["sip-calculator", "Estimated total"],
  ["nutrition-calculator", "Daily energy"],
  ["bmi-calculator", "Healthy weight"],
];
for (const [slug, expected] of cases)
  test(`${slug} produces a result`, async ({ page }) => {
    await page.goto(`/tools/${slug}`);
    const example = page.getByRole("button", { name: "Try an example" });
    if (await example.count()) await example.click();
    await page
      .getByRole("button", { name: /Run tool|Calculate result|Generate UUIDs/ })
      .click();
    await expect(page.locator(".workspace").getByRole("status")).toContainText(
      "Result ready",
    );
    const textarea = page.getByRole("textbox", { name: "Result output" });
    if (await textarea.count())
      await expect(textarea).toHaveValue(new RegExp(expected!));
    else await expect(page.locator(".result-stats")).toContainText(expected!);
    await expect(
      page.getByRole("button", { name: "Copy", exact: true }),
    ).toBeEnabled();
    await expect(page.locator("body")).not.toHaveJSProperty("scrollWidth", 0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
test("discovery, local favorite and history, reset, validation and accessibility", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("textbox", { name: "Find a tool", exact: true })
    .fill("json");
  await page.getByRole("link", { name: /JSON Formatter Format/ }).click();
  await page.getByRole("button", { name: "Save tool" }).click();
  await page.getByRole("textbox", { name: "Text input" }).fill("{invalid}");
  await page.getByRole("button", { name: "Run tool" }).click();
  await expect(page.locator(".workspace").getByRole("alert")).toBeVisible();
  await page.getByRole("button", { name: "Try an example" }).click();
  await page.getByRole("button", { name: "Run tool" }).click();
  await expect(page.locator(".workspace").getByRole("status")).toContainText(
    "Result ready",
  );
  const scan = await new AxeBuilder({ page }).analyze();
  expect(
    scan.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Text input" })).toHaveValue(
    "",
  );
  await page.goto("/tools?view=favorites");
  await expect(page.locator(".tool-card")).toHaveCount(1);
  await page.goto("/tools?view=recent");
  await expect(page.locator(".tool-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Clear history" }).click();
  await expect(page.locator(".tool-card")).toHaveCount(0);
});
test("homepage accessibility, theme, no overflow at 320 pixels", async ({
  page,
}) => {
  await page.goto("/");
  const scan = await new AxeBuilder({ page }).analyze();
  expect(
    scan.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.setViewportSize({ width: 320, height: 740 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("unknown routes, metadata and health endpoint", async ({
  page,
  request,
}) => {
  const response = await page.goto("/tools/unknown");
  expect(response?.status()).toBe(404);
  const health = await request.get("/api/health");
  expect((await health.json()).ok).toBe(true);
  expect(health.headers()["x-content-type-options"]).toBe("nosniff");
  await page.goto("/tools/word-counter");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "http://localhost:3000/tools/word-counter",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
});

test("initial tool JavaScript stays within the 170 KiB gzip budget", async ({
  page,
  request,
}) => {
  await page.goto("/tools/word-counter");
  const scripts = await page
    .locator("script[src]:not([nomodule])")
    .evaluateAll((nodes) => nodes.map((n) => (n as HTMLScriptElement).src));
  let bytes = 0;
  for (const url of new Set(scripts)) {
    const response = await request.get(url);
    bytes += gzipSync(await response.body()).length;
  }
  expect(bytes).toBeLessThanOrEqual(170 * 1024);
});
