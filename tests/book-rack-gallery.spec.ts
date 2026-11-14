import { expect, test } from "@playwright/test";

for (const width of [1440, 390]) {
  test(`Book rack gallery and zoom at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 950 });
    await page.goto("/produkte/artikel/buchablage-nachruesten");
    const thumbs = page.locator('[aria-label="Weitere Produktbilder"] button');
    await expect(thumbs).toHaveCount(4);
    await expect(thumbs.nth(0)).toHaveAttribute("aria-pressed", "true");
    const urls = await thumbs.locator("img").evaluateAll(images => images.map(img => new URL(img.getAttribute("src")!, location.origin).searchParams.get("url")));
    expect(new Set(urls).size).toBe(4);
    expect(decodeURI(urls[0]!)).toBe("/images/curated/Zubehör/zubehör-buchablage-an-stuhl.webp");
    expect(decodeURI(urls[1]!)).toBe("/neue bilder/Zubehör/Buchabl03.JPG");
    expect(urls.map(url => decodeURI(url!))).not.toContain("/neue bilder/Zubehör/zubehör-buchablage.png");
    const alt = "Buchablage zum Nachrüsten – Detailansicht";
    await thumbs.nth(1).click();
    await expect(thumbs.nth(1)).toHaveAttribute("aria-pressed", "true");
    const active = page.getByAltText(alt, { exact: true }).filter({ visible: true });
    await expect(active).toHaveCSS("object-fit", "contain");
    await expect.poll(() => active.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    await page.getByRole("button", { name: "Produktbild vergrößern" }).click();
    const dialog = page.getByRole("dialog", { name: "Vergrößerte Produktansicht" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByAltText(alt)).toHaveCSS("object-fit", "contain");
    await expect.poll(() => dialog.locator("img").evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    await page.getByRole("button", { name: "Ansicht schließen" }).click();
    await expect(dialog).not.toBeVisible();
    await page.getByRole("button", { name: "Produktbild vergrößern" }).click();
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await thumbs.nth(0).click();
    await expect(thumbs.nth(0)).toHaveAttribute("aria-pressed", "true");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
