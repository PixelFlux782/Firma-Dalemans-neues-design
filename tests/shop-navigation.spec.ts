import { expect, test } from "@playwright/test";

test.describe("Shop-Schnellnavigation", () => {
  test("öffnet Desktop-Flyouts, navigiert und nutzt Search und Cart", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/shop");

    const nav = page.getByTestId("shop-navigation");
    await expect(nav).toBeVisible();

    const tables = nav.getByRole("button", { name: "Tische" });
    await tables.click();
    await expect(nav.getByRole("link", { name: "Modell 310" })).toBeVisible();

    await nav.getByRole("button", { name: "Suche" }).click();
    await expect(page.getByTestId("search-overlay")).toBeVisible();
    await page.getByRole("button", { name: "Suche schließen" }).click();

    await nav.locator("[data-testid='cart-trigger']:visible").click();
    await expect(page.getByTestId("cart-drawer")).toBeVisible();
    await page.getByRole("button", { name: "Warenkorb schließen" }).click();

    const chairs = nav.getByRole("button", { name: "Stühle" });
    await chairs.hover();
    await expect(nav.getByRole("link", { name: "Bünde", exact: true })).toBeVisible();
    await nav.getByRole("link", { name: "Bünde", exact: true }).click();
    await expect(page).toHaveURL(/\/produkte\/stapelstuehle\/buende/);
  });

  test("ist außerhalb des Shops nicht sichtbar", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("shop-navigation")).toHaveCount(0);
  });

  test("öffnet mobil das Sortiment und schließt nach Navigation", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/shop");

    const nav = page.getByTestId("shop-navigation");
    await nav.getByRole("button", { name: "Sortiment" }).click();
    const drawer = page.getByRole("dialog", { name: "Sortiment" });
    await expect(drawer).toBeVisible();
    await drawer.getByRole("link", { name: "Gleiter & Bodenschutz" }).click();
    await expect(page).toHaveURL(/\/shop\/gleiter-bodenschutz$/);
    await expect(drawer).toHaveCount(0);
  });

  test("unterstützt Tastatur und Escape", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/shop");

    const nav = page.getByTestId("shop-navigation");
    const chairs = nav.getByRole("button", { name: "Stühle" });
    await chairs.focus();
    await page.keyboard.press("ArrowDown");
    await expect(nav.getByRole("link", { name: "Stapelstühle", exact: true })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(chairs).toHaveAttribute("aria-expanded", "false");
  });
});
