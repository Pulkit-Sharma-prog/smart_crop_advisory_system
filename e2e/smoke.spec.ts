import { expect, test } from "@playwright/test";

test("home page smoke", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /AI-Powered Farming Decisions/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Dashboard/i })).toBeVisible();
});
