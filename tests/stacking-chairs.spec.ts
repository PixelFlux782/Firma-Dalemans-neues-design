import { expect, test } from "@playwright/test";
import { localStackingChairProducts } from "../src/lib/commerce/providers/local-stacking-chairs";
import {
  resolveChairVariant,
  type ChairConfiguration,
  type ChairFabricGroup,
} from "../src/lib/commerce/stacking-chairs";

const configurations: ChairConfiguration[] = [
  { upholstery: "none", rowConnector: false },
  { upholstery: "none", rowConnector: true },
  ...([2, 3, 4] as ChairFabricGroup[]).flatMap((fabricGroup) => [
    { upholstery: "seat" as const, fabricGroup, rowConnector: false },
    { upholstery: "seat" as const, fabricGroup, rowConnector: true },
    { upholstery: "seat-back" as const, fabricGroup, rowConnector: false },
    { upholstery: "seat-back" as const, fabricGroup, rowConnector: true },
  ]),
];

test.describe("provider-neutrales Stapelstuhlmodell", () => {
  test("enthält fünf Modelle und nur die in Export_Flo belegten Varianten", () => {
    expect(localStackingChairProducts.map((product) => product.stackingChair?.modelCode)).toEqual([
      "1021", "Bünde", "Coburg", "Nürnberg", "Erfurt",
    ]);
    expect(localStackingChairProducts.map((product) => product.variants.length)).toEqual([14, 14, 14, 14, 8]);
    expect(localStackingChairProducts.flatMap((product) => product.variants)).toHaveLength(64);
  });

  test("löst alle 14 Konfigurationen von Modell 1021 eindeutig auf", () => {
    const product = localStackingChairProducts.find((entry) => entry.handle === "1021");
    expect(product).toBeTruthy();
    if (!product) return;

    const ids = configurations.map((configuration) => resolveChairVariant(product, configuration)?.id);
    const prices = configurations.map((configuration) => resolveChairVariant(product, configuration)?.price?.amount);
    expect(ids.every(Boolean)).toBe(true);
    expect(new Set(ids).size).toBe(14);
    expect(prices).toEqual([
      "67.13", "70.75",
      "84.25", "87.88", "97.13", "100.75",
      "87.50", "91.13", "101.25", "104.88",
      "88.88", "92.50", "102.50", "106.13",
    ]);
    expect(resolveChairVariant(product, { upholstery: "none", fabricGroup: 2, rowConnector: false })).toBeNull();
  });

  test("ordnet allen Preisstufen die dokumentierten Mengengrenzen zu", () => {
    for (const product of localStackingChairProducts) {
      for (const variant of product.variants) {
        expect(variant.priceTiers).toHaveLength(3);
        expect(variant.priceTiers?.map((tier) => [tier.minimumQuantity, tier.maximumQuantity])).toEqual([[1, 100], [101, 250], [251, null]]);
        expect(variant.erpArticleNumber).toBeTruthy();
      }
    }
  });
});

test.describe("Stapelstuhl-Hub", () => {
  test("zeigt genau fünf Modelle statt 70 Einzelkarten und verlinkt die Modellseiten", async ({ page }) => {
    await page.goto("/produkte/stapelstuehle");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Stapelstühle für flexible Räume.");
    await expect(page.getByRole("link", { name: "Modell ansehen" })).toHaveCount(5);
    for (const handle of ["1021", "buende", "coburg", "nuernberg", "erfurt"]) {
      await expect(page.locator(`a[href="/produkte/stapelstuehle/${handle}"]`).first()).toBeVisible();
    }
    await expect(page.getByTestId("chair-comparison")).toBeVisible();
  });

  test("Vergleich lässt bis zu drei Modelle per Tastatur auswählen", async ({ page }) => {
    await page.goto("/produkte/stapelstuehle");
    const coburg = page.getByRole("button", { name: /Coburg/ });
    await coburg.focus();
    await coburg.press("Space");
    await expect(coburg).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("chair-comparison").getByRole("heading", { name: "Coburg" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Nürnberg/ })).toBeDisabled();
  });
});

test.describe("Modell 1021 Konfigurator", () => {
  test("zeigt Stoffgruppen nur bei Polsterung und aktualisiert Variante und Preis", async ({ page }) => {
    await page.goto("/produkte/stapelstuehle/1021");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Modell 1021");
    await expect(page.getByTestId("fabric-group-selector")).toHaveCount(0);
    await expect(page.getByTestId("chair-price")).toContainText("64,44");

    const seatUpholstery = page.getByRole("radio", { name: /Sitzpolster/ });
    await seatUpholstery.focus();
    await seatUpholstery.press("Space");
    await expect(page.getByTestId("fabric-group-selector")).toBeVisible();
    const groupThree = page.getByRole("radio", { name: "Gruppe 3" });
    await groupThree.focus();
    await groupThree.press("Space");
    const withRowConnector = page.getByRole("radio", { name: /Mit Reihenverbindung/ });
    await withRowConnector.focus();
    await withRowConnector.press("Space");
    await expect(page.getByTestId("selected-chair-variant")).toContainText("Sitzpolster · Gruppe 3 · Mit Reihenverbindung");
    await expect(page.getByTestId("chair-price")).toContainText("91,82");
    await expect.poll(() => {
      const params = new URL(page.url()).searchParams;
      return [params.get("polster"), params.get("gruppe"), params.get("reihe")];
    }).toEqual(["sitz", "3", "ja"]);
  });

  test("validiert die Menge und übernimmt die Konfiguration in die Angebotsanfrage", async ({ page }) => {
    await page.goto("/produkte/stapelstuehle/1021?polster=sitz-ruecken&gruppe=4&reihe=ja");
    const quantity = page.getByLabel("Menge", { exact: true });
    await quantity.fill("80");
    await expect(quantity).toHaveValue("80");

    const quote = page.getByRole("link", { name: "Angebot anfragen" });
    await expect(quote).toHaveAttribute("href", /nachricht=.*Menge%3A\+80/);
    await quote.click();
    await expect(page).toHaveURL(/\/kontakt\?.*#anfrage$/);
    await expect(page.locator("textarea[name=message]")).toHaveValue(/Modell: 1021[\s\S]*Stoffgruppe: 4[\s\S]*Reihenverbindung: ja[\s\S]*Menge: 80/);
  });

  test("normalisiert ungültigen URL-Zustand auf eine gültige Grundausführung", async ({ page }) => {
    await page.goto("/produkte/stapelstuehle/1021?polster=falsch&gruppe=9&reihe=vielleicht");
    await expect(page.getByRole("radio", { name: /Ungepolstert/ })).toBeChecked();
    await expect(page.getByTestId("fabric-group-selector")).toHaveCount(0);
    await expect(page).toHaveURL(/polster=ungepolstert.*reihe=nein/);
    await expect(page).not.toHaveURL(/gruppe=/);
  });

  test("bleibt auf Desktop, Tablet und Mobile ohne horizontalen Überlauf", async ({ page }) => {
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 768, height: 900 },
      { width: 360, height: 800 },
    ]) {
      await page.setViewportSize(viewport);
      for (const route of ["/produkte/stapelstuehle", "/produkte/stapelstuehle/1021"]) {
        await page.goto(route, { waitUntil: "domcontentloaded" });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, `${route} at ${viewport.width}px`).toBeLessThanOrEqual(1);
      }
    }
  });

  test("liefert kanonische Metadaten und Product-/Breadcrumb-Daten", async ({ page }) => {
    await page.goto("/produkte/stapelstuehle/1021?polster=sitz&gruppe=2&reihe=ja");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/produkte\/stapelstuehle\/1021$/);
    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(jsonLd.some((entry) => entry.includes('"@type":"Product"'))).toBe(true);
    expect(jsonLd.some((entry) => entry.includes('"@type":"BreadcrumbList"'))).toBe(true);
  });
});

test("alte Stapelstuhl-URLs leiten auf die neue kanonische Struktur", async ({ request }) => {
  const category = await request.get("/produkte/kategorien/stapelstuehle", { maxRedirects: 0 });
  expect(category.status()).toBe(308);
  expect(category.headers().location).toBe("/produkte/stapelstuehle");
  const model = await request.get("/produkte/stapelstuhl-mod-1021c", { maxRedirects: 0 });
  expect(model.status()).toBe(308);
  expect(model.headers().location).toBe("/produkte/stapelstuehle/1021");
});
