import { expect, test } from "@playwright/test";

test("home page smoke", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("landing-hero-title")).toBeVisible();
  await expect(page.getByTestId("landing-primary-cta")).toBeVisible();
});
