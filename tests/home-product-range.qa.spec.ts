import { expect, test } from "@playwright/test";

const categories = [
  ["Stapelstühle", "/produkte/stapelstuehle"],
  ["Klapptische", "/produkte/sortiment/klapptische"],
  ["Rednerpulte", "/produkte/sortiment/rednerpulte"],
  ["Zubehör & Transport", "/produkte/kategorien/transportwagen-zubehoer"],
] as const;

test("homepage assortment QA", async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");

    const section = page.getByRole("region", { name: "Für Räume, die sich verändern." });
    await expect(section).toBeVisible();
    await expect(section.getByRole("link", { name: /Alle Produkte/ })).toHaveAttribute("href", "/produkte");

    for (const [name, href] of categories) {
      const link = section.getByRole("link", { name: new RegExp(name) });
      await expect(link).toHaveAttribute("href", href);
      await link.scrollIntoViewIfNeeded();
      await expect.poll(() => link.locator("img").evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
    }

    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    await section.screenshot({ path: `test-results/home-product-range-${viewport.width}.png` });
  }
});
