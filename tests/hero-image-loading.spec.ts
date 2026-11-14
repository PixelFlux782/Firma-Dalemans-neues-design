import { expect, test } from '@playwright/test';

test('hero downloads only its initial slide and retains it while the next image loads', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  let releaseNext!: () => void;
  const nextImage = new Promise<void>(resolve => { releaseNext = resolve; });
  await page.route('**/_next/image?*', async route => {
    if (decodeURIComponent(route.request().url()).includes('stapelstuehle-hero.jpg')) await nextImage;
    await route.continue();
  });
  await page.goto('/');
  const carousel = page.getByRole('region', { name: /Dalemans Raumlösungen/ });
  await expect(carousel.locator('img')).toHaveCount(1);
  await expect.poll(() => carousel.locator('img').evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  await carousel.getByRole('button', { name: 'Nächstes Bild' }).click();
  await expect(carousel.locator('img')).toHaveCount(2);
  await expect(carousel.getByRole('button', { name: 'Bild 1 anzeigen' })).toHaveAttribute('aria-current', 'true');
  releaseNext();
  await expect(carousel.getByRole('button', { name: 'Bild 2 anzeigen' })).toHaveAttribute('aria-current', 'true');
});
