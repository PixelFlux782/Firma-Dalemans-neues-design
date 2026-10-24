import { expect, test } from "@playwright/test";

const migratedAssets = [
  "/images/website/produkte-hero.webp",
  "/images/website/kontakt-hero.webp",
  "/images/website/gemeinderaum-alltag.webp",
  "/images/raumplaner/raeume-planung.webp",
  "/images/raumplaner/planung-cad.webp",
  "/images/unternehmen/stefan-dalemans.webp",
  "/images/unternehmen/hubert-dalemans.webp",
  "/images/unternehmen/schalenlager-montage.webp",
  "/images/referenzen/referenzraum-1.webp",
  "/images/referenzen/referenzraum-2.webp",
  "/images/kategorien/stapelstuehle-collage.webp",
  "/images/kategorien/klapptische-collage.webp",
  "/images/produkte/rednerpult-acrylglas-typ-a.webp",
  "/images/produkte/tischtransportwagen.webp",
  "/images/kategorien/stapelstuehle-bestuhlung.webp",
  "/images/produkte/seminarklapptisch-210c.webp",
  "/images/branding/dalemans-logo.webp",
  "/images/raumplaner/cad-entwicklung.webp",
  "/images/referenzen/gemeindesaal-referenz.webp",
  "/images/kategorien/klapptische-hero.webp",
] as const;

const compatibilityPaths = [
  "/neue bilder/produkte-hero.png",
  "/neue bilder/kontakt-hero.png",
  "/neue bilder/raum-im-alltag.png",
  "/neue bilder/Sonderlösungen/Räume-u-Planung.png",
  "/neue bilder/planung-schritt-3.png",
  "/neue bilder/stefan-dalemans-portrait.png",
  "/neue bilder/Hubert_Dalemans_gruender.png",
  "/neue bilder/Produktion-Lager/Schalenlager-Montage2.png",
  "/neue bilder/referenz1.png",
  "/neue bilder/referenz2.png",
  "/neue bilder/Stapelstühle/collage_stapelstuehle.png",
  "/neue bilder/Tische/Klapptisch-collage-detail.png",
  "/neue bilder/Rednerpulte/Rednerpult_Acrylglas_Plexiglas_TypA_1.png",
  "/neue bilder/Zubehör/Tischtransportwagen_03.png",
  "/neue bilder/Stapelstühle/hero-bestuhlung.png",
  "/neue bilder/Tische/t210_01.png",
  "/Logos/logo_transp.png",
  "/pictures/Über uns/CAD-Entwicklung.png",
  "/pictures/Über uns/Realisierte-11.jpg",
  "/neue bilder/Tische/hero-klapptische.png",
] as const;

test("alle 20 migrierten Bilder sind direkt auslieferbar", async ({ request }) => {
  for (const asset of migratedAssets) {
    const response = await request.get(encodeURI(asset));
    expect(response.status(), asset).toBe(200);
    expect(response.headers()["content-type"], asset).toContain("image/webp");
    expect((await response.body()).byteLength, asset).toBeGreaterThan(1_000);
  }
});

test("die 20 bisherigen öffentlichen Bild-URLs bleiben über Redirects kompatibel", async ({ request }) => {
  for (const asset of compatibilityPaths) {
    const response = await request.get(encodeURI(asset));
    expect(response.status(), asset).toBe(200);
    expect(response.url(), asset).toContain("/images/");
    expect(response.headers()["content-type"], asset).toContain("image/webp");
  }
});

for (const scenario of [
  { name: "Desktop", viewport: { width: 1440, height: 900 } },
  { name: "Mobile", viewport: { width: 390, height: 844 } },
] as const) {
  test(`${scenario.name}: Kernseiten rendern ohne defekte Bilder`, async ({ page }) => {
    await page.setViewportSize(scenario.viewport);
    const imageFailures: string[] = [];
    page.on("response", (response) => {
      if (response.request().resourceType() === "image" && response.status() >= 400) {
        imageFailures.push(`${response.status()} ${response.url()}`);
      }
    });
    page.on("requestfailed", (request) => {
      if (request.resourceType() === "image") imageFailures.push(`FAILED ${request.url()}`);
    });

    for (const route of [
      "/",
      "/produkte",
      "/firma",
      "/kontakt",
      "/raeume-planung",
      "/raeume-planung/raumplanung",
      "/raumloesungen/gemeindesaal",
      "/produkte/sortiment/klapptische",
      "/produkte/stapelstuehle",
      "/raumplaner",
    ]) {
      await page.goto(route, { waitUntil: "networkidle" });
      const broken = await page.locator("img").evaluateAll((images) => images
        .map((image) => image as HTMLImageElement)
        .filter((image) => image.complete && image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.getAttribute("src") || "unbekannt"));
      expect(broken, route).toEqual([]);
    }
    expect(imageFailures).toEqual([]);
  });
}

test("Produktzuordnung und Raumplaner-Branding verwenden die neuen Medienpfade", async ({ page }) => {
  await page.goto("/produkte/artikel/rednerpult-typ-a");
  await expect(page.locator('img[src*="rednerpult-acrylglas-typ-a.webp"]').first()).toBeVisible();

  await page.goto("/produkte");
  await expect(page.locator('img[src*="stapelstuehle-collage.webp"]').first()).toBeVisible();
  await expect(page.locator('img[src*="klapptische-collage.webp"]').first()).toBeVisible();

  await page.goto("/raumplaner");
  await expect(page.getByLabel("Dalemans Raumplaner").locator("img")).toHaveAttribute("src", /dalemans-logo\.webp/);
  await expect(page.getByRole("region", { name: "2D-Grundrisseditor" })).toBeVisible();
});
