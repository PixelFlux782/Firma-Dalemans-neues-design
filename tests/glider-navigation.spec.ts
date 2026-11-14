import { expect, test } from "@playwright/test";

for (const width of [1440, 390]) {
  test(`Gleiter navigation matches public assortment at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/produkte/sortiment/gleiter-bodenschutz");
    const products = await page.locator('#produkte article h2 a').evaluateAll(links => links.map(link => ({ label: link.textContent, href: link.getAttribute("href") })));
    expect(products).toHaveLength(5);
    const nav = page.getByTestId("shop-navigation");
    let menu;
    if (width >= 1280) {
      await nav.getByRole("button", { name: "Gleiter", exact: true }).hover();
      menu = page.locator("#shop-flyout-gliders");
    } else {
      await nav.getByRole("button", { name: "Sortiment", exact: true }).click();
      menu = page.getByRole("dialog", { name: "Sortiment" }).locator("details");
      await expect(menu.locator("summary")).toHaveText(/Gleiter/);
      await expect(menu.getByRole("link").first()).not.toBeVisible();
      await menu.locator("summary").focus();
      await page.keyboard.press("Enter");
    }
    await expect(menu.getByRole("link")).toHaveCount(products.length + 2);
    for (const product of products) {
      const link = menu.getByRole("link", { name: product.label!, exact: true });
      await expect(link).toHaveCount(1);
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute("href", product.href!);
    }
    await expect(menu.getByRole("link", { name: "Alle Gleiter ansehen" })).toHaveAttribute("href", "/produkte/sortiment/gleiter-bodenschutz");
    const finder = menu.getByRole("link", { name: "Passenden Gleiter finden" });
    await expect(finder).toHaveAttribute("href", "/produkte/gleiter-finder");
    await expect(menu).not.toContainText("DEV-");
    if (width >= 1280) await expect(menu).toHaveCSS("opacity", "1");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `tmp/glider-navigation-${width}.png`, fullPage: true });
    await finder.click();
    await expect(page).toHaveURL(/\/produkte\/gleiter-finder$/);
    await expect(page.locator("#shop-flyout-gliders")).toHaveCount(0);
    await expect(page.getByRole("dialog", { name: "Sortiment" })).toHaveCount(0);
  });
}
