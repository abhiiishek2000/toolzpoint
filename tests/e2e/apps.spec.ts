import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("apps directory links to the app page, which links to privacy and terms", async ({
  page,
}) => {
  await page.goto("/apps");
  await page.getByRole("link", { name: /CashyAi/ }).click();
  await expect(page).toHaveURL(/\/apps\/cashyai$/);
  await expect(
    page.getByRole("heading", { name: "CashyAi", level: 1 }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Get it on Google Play" }),
  ).toHaveAttribute("href", /play\.google\.com/);
  await page.getByRole("link", { name: "Privacy Policy" }).first().click();
  await expect(page).toHaveURL(/\/apps\/cashyai\/privacy$/);
  await expect(
    page.getByRole("heading", { name: "Privacy Policy", level: 1 }),
  ).toBeVisible();
  await expect(page.getByText("drive.appdata")).toBeVisible();
  await page.goto("/apps/cashyai/terms");
  await expect(
    page.getByRole("heading", { name: "Terms and Conditions", level: 1 }),
  ).toBeVisible();
});
test("Wend policy pages carry the health and medical-device disclosures", async ({
  page,
}) => {
  await page.goto("/apps/wend");
  await expect(
    page.getByRole("heading", { name: "Wend", level: 1 }),
  ).toBeVisible();
  await expect(page.getByText("Coming soon to Google Play")).toBeVisible();
  await page.goto("/apps/wend/privacy");
  await expect(
    page.getByRole("heading", { name: "Privacy Policy", level: 1 }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Health Connect Permissions policy" }),
  ).toBeVisible();
  await expect(page.getByText("is not a medical device").first()).toBeVisible();
  await page.goto("/apps/wend/terms");
  await page.getByRole("link", { name: "Privacy Policy" }).click();
  await expect(page).toHaveURL(/\/apps\/wend\/privacy$/);
});
test("app page accessibility and no overflow at 320 pixels", async ({
  page,
}) => {
  await page.goto("/apps/cashyai");
  const scan = await new AxeBuilder({ page }).analyze();
  expect(
    scan.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
  await page.setViewportSize({ width: 320, height: 740 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("unreviewed app pages stay noindex", async ({ page }) => {
  await page.goto("/apps/cashyai");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
});
