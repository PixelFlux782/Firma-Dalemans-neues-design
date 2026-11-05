import { expect, test } from "@playwright/test";

test("hero layout, links and slider across viewports", async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 820, height: 1180 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const hero = page.locator(".hero-architectural");
    await expect(hero.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(hero.getByRole("link", { name: /Beratung anfragen/ })).toHaveAttribute("href", "/kontakt?anliegen=Beratung");
    await expect(hero.getByRole("link", { name: "Produkte ansehen" })).toHaveAttribute("href", "/produkte");
    await expect(hero.getByRole("link", { name: /3D-Raumplaner ausprobieren/ })).toHaveAttribute("href", "/raumplaner");
    await expect(hero.getByRole("link", { name: /Direktkontakt/ })).toHaveAttribute("href", "tel:+499342915353");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    await page.screenshot({ path: `test-results/home-hero-${viewport.width}.png` });

    if (viewport.width === 1440) {
      for (const locator of [hero.getByRole("heading", { level: 1 }), hero.getByRole("link", { name: /Beratung anfragen/ }), hero.getByRole("link", { name: /Direktkontakt/ })]) {
        const box = await locator.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.y + box!.height).toBeLessThan(viewport.height);
      }
    }

    const carousel = hero.getByRole("region", { name: /Dalemans Raumlösungen/ });
    await carousel.getByRole("button", { name: "Nächstes Bild" }).click();
    await expect(carousel.getByRole("button", { name: "Bild 2 anzeigen" })).toHaveAttribute("aria-current", "true");
  }
});

test("production homepage omits the historical development notice", async ({ page, request }) => {
  const initialHtml = await (await request.get("/")).text();
  expect(initialHtml).not.toContain("Website in Entwicklung");

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.getByLabel("Entwicklungsstatus der Website")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "3D-Raumplaner ausprobieren", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Direktkontakt/ })).toBeVisible();
});
