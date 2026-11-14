import { expect, test } from "@playwright/test";

for (const width of [1440, 390]) {
  test(`Reihenverbinder: Bilder, Layout und Anfrage bei ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/produkte/reihenverbinder");
    const cards = page.locator('section[aria-label="Arten der Reihenverbindung"] article');
    await expect(cards).toHaveCount(2);
    for (const card of await cards.all()) {
      const image = card.locator("img");
      await expect(image).toBeVisible();
      await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      await expect(image).toHaveCSS("object-fit", "contain");
      expect(await image.getAttribute("src")).toContain("/_next/image?");
      await expect(card.getByRole("link", { name: "Reihenverbinder anfragen" })).toHaveCount(1);
    }
    const first = await cards.nth(0).boundingBox();
    const second = await cards.nth(1).boundingBox();
    expect(first).toBeTruthy(); expect(second).toBeTruthy();
    if (width > 767) {
      expect(Math.abs(first!.y - second!.y)).toBeLessThan(2);
      expect(second!.x).toBeGreaterThan(first!.x + first!.width);
    } else {
      expect(second!.y).toBeGreaterThan(first!.y + first!.height);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `tmp/reihenverbinder-${width}.png`, fullPage: true });
    for (let i = 0; i < 2; i++) {
      const card = cards.nth(i);
      const title = await card.locator("h2").innerText();
      await card.getByRole("spinbutton").fill("24");
      const specs = await card.locator("dl").innerText();
      await card.getByRole("link", { name: "Reihenverbinder anfragen" }).click();
      await expect(page).toHaveURL(/\/kontakt\?/);
      await expect(page.locator('input[name="subject"]')).toHaveValue(new RegExp(title));
      const message = page.locator('textarea[name="message"]');

      const value = await message.inputValue();
      expect(value).toContain(title);
      expect(value).toContain("24");
      for (const spec of specs.split("\n").filter(Boolean)) expect(value).toContain(spec.trim());
      await page.goto("/produkte/reihenverbinder");
    }
    await expect(page.getByRole("heading", { name: "Bestand und Raum gemeinsam prüfen" })).toBeVisible();
    await expect(page.locator('a[href="/wissen/reihenverbinder-fuer-stapelstuehle"]')).toBeVisible();
  });
}

