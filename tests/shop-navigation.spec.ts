import { expect, test } from "@playwright/test";

test.describe("Shop-Schnellnavigation", () => {
  for (const width of [1280, 1920]) {
    test(`hält das Stühle-Flyout bei ${width}px sauber im Viewport`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/shop");

      const nav = page.getByTestId("shop-navigation");
      await expect(nav.getByRole("button", { name: "Shop", exact: true })).toHaveCount(0);

      await nav.getByRole("button", { name: "Stühle" }).click();
      const flyout = nav.locator("#shop-flyout-chairs");
      await expect(flyout).toBeVisible();

      const [flyoutBox, firstHeading, secondHeading, thirdHeading, ctaBox] = await Promise.all([
        flyout.boundingBox(),
        flyout.getByText("Stühle", { exact: true }).boundingBox(),
        flyout.getByText("Direkt zu Modellen", { exact: true }).boundingBox(),
        flyout.getByText("Passend dazu", { exact: true }).boundingBox(),
        flyout.getByRole("link", { name: "Alle Stühle ansehen" }).boundingBox(),
      ]);

      expect(flyoutBox).not.toBeNull();
      expect(firstHeading).not.toBeNull();
      expect(secondHeading).not.toBeNull();
      expect(thirdHeading).not.toBeNull();
      expect(ctaBox).not.toBeNull();
      expect(flyoutBox!.x).toBeGreaterThanOrEqual(0);
      expect(flyoutBox!.x + flyoutBox!.width).toBeLessThanOrEqual(width);
      expect(firstHeading!.x + firstHeading!.width).toBeLessThan(secondHeading!.x);
      expect(secondHeading!.x + secondHeading!.width).toBeLessThan(thirdHeading!.x);
      expect(ctaBox!.width).toBeGreaterThan(flyoutBox!.width - 50);
    });
  }

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
