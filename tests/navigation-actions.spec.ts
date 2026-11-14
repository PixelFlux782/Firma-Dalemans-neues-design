import { expect, test } from "@playwright/test";

for (const width of [320, 768, 1024, 1440]) {
  test(`Only header provides global actions at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 950 });
    await page.goto("/produkte/artikel/buchablage-nachruesten");
    const nav = page.getByTestId("shop-navigation");
    const header = page.locator("header");
    await expect(nav.getByTestId("search-trigger")).toHaveCount(0);
    await expect(nav.getByTestId("cart-trigger")).toHaveCount(0);
    const search = header.getByTestId("search-trigger").filter({ visible: true });
    const cart = header.getByTestId("cart-trigger").filter({ visible: true });
    await expect(page.getByTestId("search-trigger").filter({ visible: true })).toHaveCount(1);
    await expect(page.getByTestId("cart-trigger").filter({ visible: true })).toHaveCount(1);
    await search.click();
    const overlay = page.getByTestId("search-overlay");
    await expect(overlay).toBeVisible();
    await overlay.getByPlaceholder("Produkt, Maß oder Artikelnummer").fill("Buchablage");
    await expect(overlay.getByRole("option").filter({ hasText: "Buchablage" }).first()).toBeVisible();
    await page.getByRole("button", { name: "Suche schließen" }).click();
    await page.getByRole("button", { name: "Zur Auswahl hinzufügen" }).click();
    const drawer = page.getByTestId("cart-drawer");
    await expect(drawer).toBeVisible();
    await expect(cart).toHaveAttribute("aria-label", /1 Artikel/);
    await drawer.getByRole("button", { name: /Menge .* erhöhen/ }).click();
    await expect(cart).toHaveAttribute("aria-label", /2 Artikel/);
    await page.getByRole("button", { name: "Warenkorb schließen" }).click();
    await cart.click();
    await expect(drawer).toBeVisible();
    await page.getByRole("button", { name: "Warenkorb schließen" }).click();
    if (width >= 1280) {
      for (const id of ["chairs", "tables", "gliders", "retrofit", "transport"]) {
        const button = nav.locator(`button[aria-controls="shop-flyout-${id}"]`);
        await button.hover();
        await expect(nav.locator(`#shop-flyout-${id}`)).toBeVisible();
        await page.keyboard.press("Escape");
      }
      await nav.getByRole("button", { name: "Gleiter", exact: true }).hover();
      await nav.getByRole("link", { name: "Alle Gleiter ansehen" }).click();
    } else {
      await nav.getByRole("button", { name: "Sortiment", exact: true }).click();
      const menu = page.getByRole("dialog", { name: "Sortiment" });
      await expect(menu.getByTestId("search-trigger")).toHaveCount(0);
      await expect(menu.getByTestId("cart-trigger")).toHaveCount(0);
      await menu.locator("summary").click();
      await menu.getByRole("link", { name: "Alle Gleiter ansehen" }).click();
    }
    await expect(page).toHaveURL(/\/sortiment\/gleiter-bodenschutz$/);
    await expect(header.getByTestId("cart-trigger").filter({ visible: true })).toHaveAttribute("aria-label", /2 Artikel/);
    await expect(page.getByTestId("search-trigger").filter({ visible: true })).toHaveCount(1);
    await expect(page.getByTestId("cart-trigger").filter({ visible: true })).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
