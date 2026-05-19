import { expect, test } from "@playwright/test";

test("technician can open a unit page and submit PM", async ({ page }) => {
  await page.goto("/units/BC01-CT-01");
  await page.getByRole("link", { name: /submit pm/i }).click();
  await page.getByLabel(/service date/i).fill("2026-05-18");
  await page.getByLabel(/technician name/i).fill("Somchai");
  await page.getByRole("button", { name: /save pm/i }).click();
  await expect(page.getByText(/pm saved/i)).toBeVisible();
});
