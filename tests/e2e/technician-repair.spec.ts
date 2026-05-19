import { expect, test } from "@playwright/test";

test("technician can open a unit page and submit repair", async ({
  page,
}) => {
  await page.goto("/units/BC01-CT-01");
  await page.getByRole("link", { name: /submit repair/i }).click();
  await page.getByLabel(/service date/i).fill("2026-05-18");
  await page.getByLabel(/issue detail/i).fill("water leak from drain pan");
  await page.getByRole("button", { name: /save repair/i }).click();
  await expect(page.getByText(/repair saved/i)).toBeVisible();
});
