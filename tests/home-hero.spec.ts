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

test("development notice is server-rendered and remains permanently visible", async ({ page, request }) => {
  const initialHtml = await (await request.get("/")).text();
  expect(initialHtml).toContain("Website in Entwicklung · Inhalte werden laufend ergänzt");

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const hero = page.locator(".hero-architectural");
  const notice = hero.getByLabel("Entwicklungsstatus der Website");
  const roomPlanner = hero.getByRole("link", { name: /3D-Raumplaner ausprobieren/ });
  const directContact = hero.getByRole("link", { name: /Direktkontakt/ });

  await expect(notice).toBeVisible();
  await expect(notice).toHaveText("Website in Entwicklung · Inhalte werden laufend ergänzt");
  await expect(notice.locator('[aria-hidden="true"]')).toHaveCount(1);
  const initialNoticeBox = await notice.boundingBox();
  expect(initialNoticeBox).not.toBeNull();
  const initialDocumentY = initialNoticeBox!.y + await page.evaluate(() => window.scrollY);
  expect((await roomPlanner.boundingBox())!.y).toBeLessThan((await notice.boundingBox())!.y);
  expect((await notice.boundingBox())!.y).toBeLessThan((await directContact.boundingBox())!.y);

  await page.waitForTimeout(5_200);
  await page.mouse.wheel(0, 100);
  await page.mouse.click(10, 10);
  await page.keyboard.press("Tab");
  await expect(notice).toBeVisible();
  const settledNoticeBox = await notice.boundingBox();
  expect(settledNoticeBox).not.toBeNull();
  expect(settledNoticeBox!.x).toBe(initialNoticeBox!.x);
  expect(settledNoticeBox!.width).toBe(initialNoticeBox!.width);
  expect(settledNoticeBox!.height).toBe(initialNoticeBox!.height);
  expect(settledNoticeBox!.y + await page.evaluate(() => window.scrollY)).toBe(initialDocumentY);
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem("dlmns-development-notice-seen"))).toBeNull();

  await page.reload();
  await expect(notice).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(notice).toBeVisible();
  const mobileNoticeBox = await notice.boundingBox();
  const mobileContactBox = await directContact.boundingBox();
  expect(mobileNoticeBox!.y + mobileNoticeBox!.height).toBeLessThan(844);
  expect(mobileContactBox!.y + mobileContactBox!.height).toBeLessThan(844);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
