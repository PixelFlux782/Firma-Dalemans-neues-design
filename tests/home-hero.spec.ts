import { expect, test } from "@playwright/test";

test("hero layout, links and slider across viewports", async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 820, height: 1180 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const hero = page.locator(".hero-architectural");
    await expect(hero.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(hero.getByRole("link", { name: /Beratung anfragen/ })).toHaveAttribute("href", "/kontakt?anliegen=Beratung");
    await expect(hero.getByRole("link", { name: "Produkte ansehen" })).toHaveAttribute("href", "/produkte/stapelstuehle");
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

test("development notice fades, dismisses, and is limited to one browser session", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("/");
  const notice = page.getByLabel("Entwicklungsstatus der Website");
  await expect(notice.locator(":scope > div[aria-hidden='false']")).toHaveClass(/opacity-100/);
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem("dlmns-development-notice-seen"))).toBeNull();
  await page.mouse.move(400, 400);
  await page.mouse.move(800, 600);
  await page.waitForTimeout(4100);
  await expect(notice).toBeVisible();
  await expect(notice).toHaveCount(0, { timeout: 6500 });
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem("dlmns-development-notice-seen"))).toBe("true");
  await page.reload();
  await expect(notice).toHaveCount(0);
  await context.close();

  const freshContext = await browser.newContext({ reducedMotion: "reduce" });
  const freshPage = await freshContext.newPage();
  await freshPage.setViewportSize({ width: 390, height: 844 });
  await freshPage.goto("/");
  const freshNotice = freshPage.getByLabel("Entwicklungsstatus der Website");
  await expect(freshNotice.locator(":scope > div[aria-hidden='false']")).toBeAttached();
  const noticeBox = await freshNotice.boundingBox();
  expect(noticeBox).not.toBeNull();
  expect(noticeBox!.y + noticeBox!.height).toBeLessThan(774);
  await expect(freshNotice.locator(":scope > div[aria-hidden='false']")).toHaveCSS("transition-property", "none");
  await freshPage.mouse.wheel(0, 100);
  await expect(freshNotice).toHaveCount(0);
  await freshContext.close();
});

test("development notice closes on deliberate interaction only", async ({ browser }) => {
  for (const interaction of ["scroll", "click", "touch", "keyboard"] as const) {
    const context = await browser.newContext({ hasTouch: interaction === "touch" });
    const page = await context.newPage();
    await page.goto("/");
    const notice = page.getByLabel("Entwicklungsstatus der Website");
    await expect(notice.locator(":scope > div[aria-hidden='false']")).toBeVisible();
    if (interaction === "scroll") await page.mouse.wheel(0, 100);
    if (interaction === "click") await page.mouse.click(10, 10);
    if (interaction === "touch") await page.touchscreen.tap(10, 10);
    if (interaction === "keyboard") await page.keyboard.press("Tab");
    await expect(notice).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => sessionStorage.getItem("dlmns-development-notice-seen"))).toBe("true");
    await context.close();
  }
});
