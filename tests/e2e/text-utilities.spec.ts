import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const tools = [
  "character-counter",
  "lorem-ipsum-generator",
  "duplicate-line-remover",
  "remove-line-breaks",
  "text-sorter",
  "find-and-replace-text",
  "whitespace-remover",
  "text-reverser",
  "nato-phonetic-alphabet-converter",
  "rot13-caesar-cipher",
];
for (const slug of tools)
  test(`${slug} runs and resets`, async ({ page }) => {
    await page.goto(`/tools/${slug}`);
    const example = page.getByRole("button", { name: "Try an example" });
    if (await example.count()) await example.click();
    await page.locator('.workspace button[type="submit"]').click();
    await expect(page.locator(".workspace").getByRole("status")).toContainText(
      "Result ready",
    );
    await expect(
      page.getByRole("button", { name: "Copy", exact: true }),
    ).toBeEnabled();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
    await page.getByRole("button", { name: "Reset", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Copy", exact: true }),
    ).toBeDisabled();
  });
test("replacement validation and accessibility", async ({ page }) => {
  await page.goto("/tools/find-and-replace-text");
  await page.getByLabel("Text to find", { exact: true }).fill("");
  await page.locator('.workspace button[type="submit"]').click();
  await expect(page.locator(".workspace").getByRole("alert")).toContainText(
    "Enter text to find",
  );
  const scan = await new AxeBuilder({ page }).analyze();
  expect(
    scan.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
});
