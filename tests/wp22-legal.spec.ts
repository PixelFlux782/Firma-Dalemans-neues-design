import { expect, test } from "@playwright/test";

test.describe("WP22 rechtliche Inhalte", () => {
  test("stellt freigegebene Rechtstexte mit Inhaltsverzeichnis und internen Links dar", async ({ page }) => {
    await page.goto("/agb");
    await expect(page.getByRole("heading", { level: 1, name: /AGB/ })).toBeVisible();
    await expect(page.locator("article [role=note]")).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Inhaltsverzeichnis" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Datenschutzerklärung" }).first()).toHaveAttribute("href", "/datenschutz");

    await page.goto("/datenschutz");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Datenschutzerklärung");
    await expect(page.getByRole("navigation", { name: "Inhaltsverzeichnis" })).toBeVisible();
    await expect(page.locator('article a[href="/impressum"]').first()).toBeVisible();

    await page.goto("/impressum");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Impressum");
    await expect(page.locator("article [role=note]")).toHaveCount(0);
  });

  for (const width of [390, 1440]) {
    test(`prüft Navigation, Metadaten und Darstellung bei ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of ["/impressum", "/datenschutz", "/agb"]) {
        const response = await page.goto(path);
        expect(response?.status()).toBe(200);
        await expect(page.locator("h1")).toHaveCount(1);
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://dalemans.de${path}`);
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, follow");
        await expect(page.locator("article")).not.toContainText(/Entwurf|Freigabestatus|vor Veröffentlichung|redaktioneller Hinweis|TODO|FIXME|noch zu prüfen/i);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        for (const target of ["/impressum", "/datenschutz", "/agb"]) {
          await expect(page.getByRole("contentinfo").locator(`a[href="${target}"]`)).toBeVisible();
        }
        const toc = page.getByRole("navigation", { name: "Inhaltsverzeichnis" });
        if (path !== "/impressum") {
          const links = toc.locator("a");
          expect(await links.count()).toBeGreaterThan(0);
          for (const link of await links.all()) {
            const href = await link.getAttribute("href");
            await expect(page.locator(`[id="${href!.slice(1)}"]`)).toHaveCount(1);
          }
          await links.last().click();
          await expect(page.locator(`[id="${(await links.last().getAttribute("href"))!.slice(1)}"]`)).toBeInViewport();
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: `test-results/final-release${path}-${width}.png`, fullPage: true });
      }
    });
  }

  test("zeigt die Bestandswebseite dezent im responsiven Footer", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/datenschutz");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.goto("/");
    const legacyLink = page.getByRole("contentinfo").getByRole("link", { name: "Unsere bisherige Webseite" });
    await expect(legacyLink).toHaveAttribute("href", "https://stapelstuhl-klapptisch.de/");
    await expect(legacyLink).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
});
