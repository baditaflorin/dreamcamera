import { expect, test } from "@playwright/test";

test("loads the static Dreamcamera shell", async ({ page }) => {
  await page.goto("/dreamcamera/");

  await expect(
    page.getByRole("heading", { name: "Dreamcamera" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Star" })).toHaveAttribute(
    "href",
    "https://github.com/baditaflorin/dreamcamera",
  );
  await expect(
    page.getByRole("link", { name: "Support", exact: true }),
  ).toHaveAttribute("href", "https://www.paypal.com/paypalme/florinbadita");
  await expect(page.getByText(/^v0\.1\.0$/)).toBeVisible();
  await expect(page.getByText(/^commit /)).toBeVisible();
  await expect(page.getByTestId("dream-surface")).toBeVisible();
});

test("switches visual modes before camera permission", async ({ page }) => {
  await page.goto("/dreamcamera/");

  const charcoal = page.getByRole("button", { name: "Charcoal" });
  await charcoal.click();
  await expect(charcoal).toHaveAttribute("aria-pressed", "true");
});
