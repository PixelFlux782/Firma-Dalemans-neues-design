import { expect, test } from "@playwright/test";

test.describe("Premium-Navigation", () => {
  test("Desktop priorisiert fünf Kernziele und das Mega-Menü", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const primary = page.getByRole("navigation", { name: "Hauptnavigation", exact: true });
    await expect(primary.getByRole("link")).toHaveCount(5);
    for (const label of ["Produkte", "Shop", "Räume & Planung", "Beratung & Service", "Sonderlösungen"]) {
      await expect(primary.getByRole("link", { name: label, exact: true })).toBeVisible();
    }

    const more = primary.getByRole("button", { name: "Mehr", exact: true });
    await more.click();
    await expect(more).toHaveAttribute("aria-expanded", "true");
    const megaMenu = page.getByRole("navigation", { name: "Weitere Navigation" });
    await expect(megaMenu).toBeVisible();
    await expect(megaMenu.getByRole("link", { name: "Unternehmen & Geschichte" })).toHaveAttribute("href", "/firma");
    await expect(megaMenu.getByRole("link", { name: "Sonderposten" })).toHaveAttribute("href", "/sonderposten");
    await expect(megaMenu.getByRole("link", { name: "Kontakt", exact: true })).toHaveAttribute("href", "/kontakt");
    await expect(megaMenu.getByRole("link", { name: "+49 9342 9153-53" })).toHaveAttribute("href", "tel:+499342915353");
    await expect(megaMenu.getByRole("link", { name: "info@dalemans.de" })).toHaveAttribute("href", "mailto:info@dalemans.de");
    await megaMenu.getByRole("link", { name: "Unternehmen & Geschichte" }).click();
    await expect(page).toHaveURL(/\/firma$/);
    await expect(page.locator("#desktop-mega-menu")).toHaveCount(0);
  });

  test("Mega-Menü schließt per Escape, erneutem Klick und Outside Click", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const more = page.getByRole("button", { name: "Mehr", exact: true });

    await more.click();
    await page.keyboard.press("Escape");
    await expect(more).toHaveAttribute("aria-expanded", "false");
    await expect(more).toBeFocused();

    await more.click();
    await more.click();
    await expect(more).toHaveAttribute("aria-expanded", "false");

    await more.click();
    await page.mouse.click(10, 700);
    await expect(more).toHaveAttribute("aria-expanded", "false");
  });

  test("Mehr zeigt auf Sekundärseiten einen dezenten aktiven Zustand", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const route of ["/firma", "/sonderposten", "/kontakt"]) {
      await page.goto(route);
      await expect(page.getByRole("button", { name: "Mehr", exact: true })).toHaveClass(/text-premium-ink/);
    }
  });

  test("Mobile Navigation ist strukturiert und zeigt reale Kontaktwege", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const menuButton = page.getByRole("button", { name: "Menü", exact: true });
    await menuButton.click();

    const mobileNav = page.getByRole("navigation", { name: "Mobile Hauptnavigation" });
    const mobilePanel = page.locator("#mobile-nav");
    await expect(mobileNav.getByRole("link")).toHaveCount(5);
    await expect(page.getByText("Über Dalemans", { exact: true })).toBeVisible();
    await page.locator("summary").filter({ hasText: "Weitere Angebote" }).click();
    await expect(mobilePanel.getByRole("link", { name: "Sonderposten", exact: true })).toBeVisible();
    await expect(mobilePanel.getByRole("link", { name: "+49 9342 9153-53" })).toBeVisible();
    await expect(mobilePanel.getByRole("link", { name: "info@dalemans.de" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(menuButton).toBeFocused();
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });

  for (const width of [320, 375, 768, 1024, 1280, 1440]) {
    test(`Header bleibt bei ${width}px ohne horizontalen Overflow`, async ({ page }) => {
      await page.setViewportSize({ width, height: 820 });
      await page.goto("/");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      if (width >= 1280) {
        await expect(page.getByRole("navigation", { name: "Hauptnavigation", exact: true })).toBeVisible();
      } else {
        await expect(page.getByRole("button", { name: "Menü", exact: true })).toBeVisible();
      }
    });
  }
});
