import { expect, test } from "@playwright/test";

test.describe("Wissenswelt", () => {
  test("ist in der Desktop-Navigation erreichbar und führt zu den Kategorien", async ({ page }) => {
    await page.goto("/wissen");

    await expect(page.getByRole("heading", { level: 1, name: "Wissen & Materialien" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Hauptnavigation" }).getByRole("link", { name: "Wissen", exact: true })).toHaveAttribute("aria-current", "page");

    await page.getByRole("link", { name: "Stoffe & Polster", exact: true }).first().click();
    await expect(page).toHaveURL(/\/wissen\/stoffe-polster$/);
    await expect(page.getByRole("link", { name: "Stoffgruppe 1", exact: true })).toBeVisible();
  });

  test("ist über die mobile Hauptnavigation erreichbar", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await page.getByRole("button", { name: "Menü", exact: true }).click();
    const mobileNavigation = page.getByRole("navigation", { name: "Mobile Hauptnavigation" });
    await expect(mobileNavigation.getByRole("link", { name: "Wissen", exact: true })).toBeVisible();
    await mobileNavigation.getByRole("link", { name: "Wissen", exact: true }).click();

    await expect(page).toHaveURL(/\/wissen$/);
    await expect(page.getByRole("heading", { level: 1, name: "Wissen & Materialien" })).toBeVisible();
  });

  test("rendert einen Wissensartikel aus dem zentralen Datenmodell", async ({ page }) => {
    await page.goto("/wissen/stoffe-polster/stoffgruppe-1");

    await expect(page.getByRole("heading", { level: 1, name: "Stoffgruppe 1" })).toBeVisible();
    await expect(page.getByText("Noch nicht bestätigte Angaben werden bewusst nicht dargestellt.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Beratung anfragen" }).last()).toHaveAttribute("href", /Beratung/);
  });
});
