import { expect, test } from "@playwright/test";
import { localProducts } from "../src/lib/commerce/providers/local-data";
import { developmentFinderFixtures } from "../src/lib/finder/development-fixtures";
import { recommendGliders } from "../src/lib/finder/recommend";
import {
  calculateFinderQuantity,
  calculateRequiredPieces,
  calculateReservePieces,
  roundToPackSize,
} from "../src/lib/finder/quantity";
import type { FinderInput } from "../src/lib/finder/types";

function input(overrides: Partial<FinderInput> = {}): FinderInput {
  return {
    itemType: "chair",
    frameShape: "round",
    dimensions: { diameter: 20 },
    floorType: "parquet",
    itemCount: 100,
    reserveEnabled: true,
    ...overrides,
  };
}

function expectVariant(result: ReturnType<typeof recommendGliders>, sku: string) {
  expect(result.status).toBe("unique");
  if (result.status !== "unique") throw new Error(`Erwarteter Treffer ${sku} fehlt.`);
  expect(result.matches[0].variant.sku).toBe(sku);
  return result.matches[0];
}

test.describe("deterministische Finder-Businesslogik", () => {
  test("bevorzugt bei Rundrohr 20 mm auf Parkett Filz", () => {
    const match = expectVariant(recommendGliders(localProducts, input()), "DEV-RF-20");
    expect(match.floorMatch).toBe("preferred");
    expect(match.quantity).toMatchObject({
      requiredPieces: 400,
      reservePieces: 20,
      recommendedPieces: 420,
      packSize: 20,
      packCount: 21,
      orderPieces: 420,
    });
  });

  test("bevorzugt bei demselben Rundrohr auf Teppich Kunststoff", () => {
    const match = expectVariant(recommendGliders(localProducts, input({ floorType: "carpet" })), "DEV-RK-20");
    expect(match.floorMatch).toBe("preferred");
    expect(match.quantity).toMatchObject({ packSize: 50, packCount: 9, orderPieces: 450 });
  });

  test("deckt Vierkant, Rechteck, Oval, Freischwinger und Tisch getrennt ab", () => {
    expectVariant(recommendGliders(localProducts, input({ frameShape: "square", dimensions: { width: 20, height: 20 }, floorType: "tile_stone" })), "DEV-SQ-20");
    expectVariant(recommendGliders(localProducts, input({ frameShape: "rectangular", dimensions: { width: 30, height: 15 }, floorType: "tile_stone" })), "DEV-REC-30-15");
    expectVariant(recommendGliders(localProducts, input({ frameShape: "oval", dimensions: { width: 30, height: 15 } })), "DEV-OV-30-15");
    expectVariant(recommendGliders(localProducts, input({ frameShape: "cantilever", dimensions: { width: 30, height: 15 } })), "DEV-CAN-30-15");
    expectVariant(recommendGliders(localProducts, input({ itemType: "table", dimensions: { diameter: 30 }, floorType: "tile_stone" })), "DEV-TR-30");
  });

  test("meldet den Rundrohr-Übergangsbereich 18,7–18,8 mm als multiple", () => {
    const result = recommendGliders(localProducts, input({ dimensions: { diameter: 18.75 } }));
    expect(result.status).toBe("multiple");
    if (result.status !== "multiple") return;
    expect(result.message).toBe("Dieses Maß liegt im Übergangsbereich. Zwei Varianten kommen infrage.");
    expect(result.matches.map((match) => match.variant.sku)).toEqual(["DEV-RF-18", "DEV-RF-20"]);
  });

  test("meldet die zusätzliche Vierkant-Grenze 20,5–20,6 mm als multiple", () => {
    const result = recommendGliders(localProducts, input({ frameShape: "square", dimensions: { width: 20.55, height: 20.55 }, floorType: "tile_stone" }));
    expect(result.status).toBe("multiple");
    if (result.status !== "multiple") return;
    expect(result.matches.map((match) => match.variant.sku)).toEqual(["DEV-SQ-20", "DEV-SQ-21"]);
  });

  test("liefert für Rundrohr 26 mm und Vierkant 32 × 32 mm no_match", () => {
    expect(recommendGliders(localProducts, input({ dimensions: { diameter: 26 } })).status).toBe("no_match");
    expect(recommendGliders(localProducts, input({ frameShape: "square", dimensions: { width: 32, height: 32 }, floorType: "tile_stone" })).status).toBe("no_match");
  });

  test("liefert bei unbekannter Form oder unbekanntem Boden uncertain", () => {
    expect(recommendGliders(localProducts, input({ frameShape: "unknown", dimensions: {} })).status).toBe("uncertain");
    expect(recommendGliders(localProducts, input({ floorType: "unknown" })).status).toBe("uncertain");
  });

  test("erlaubt im vorbereiteten Verified-only-Modus keine Development-Empfehlung", () => {
    expect(recommendGliders(localProducts, input(), { dataPolicy: "verified_only" }).status).toBe("no_match");
  });

  test("kennzeichnet alle simulierten Varianten als Development-Daten", () => {
    const variants = developmentFinderFixtures.flatMap((product) => product.variants);
    expect(variants).toHaveLength(16);
    expect(variants.every(({ attributes }) => attributes.dataStatus === "development")).toBe(true);
    expect(variants.every(({ attributes }) => Boolean(attributes.mountingType))).toBe(true);
    expect(variants.every(({ attributes }) => Object.keys(attributes.nominalDimensions).length > 0)).toBe(true);
    expect(variants.every(({ attributes }) => Object.keys(attributes.dimensionRanges).length > 0)).toBe(true);
  });

  test("berechnet Bedarf, Reserve und Packungsrundung transparent", () => {
    expect(calculateFinderQuantity({ itemCount: 50, glidersPerItem: 4, reserveEnabled: true, packSize: 20 })).toMatchObject({ requiredPieces: 200, reservePieces: 10, recommendedPieces: 210, packCount: 11, orderPieces: 220 });
    expect(calculateFinderQuantity({ itemCount: 120, glidersPerItem: 4, reserveEnabled: true, packSize: 50 })).toMatchObject({ requiredPieces: 480, reservePieces: 24, recommendedPieces: 504, packCount: 11, orderPieces: 550 });
    expect(calculateFinderQuantity({ itemCount: 80, glidersPerItem: 2, reserveEnabled: true, packSize: 10 })).toMatchObject({ requiredPieces: 160, reservePieces: 8, recommendedPieces: 168, packCount: 17, orderPieces: 170 });
  });

  test("unterstützt Reserve aus sowie einzelne Rechenbausteine", () => {
    expect(calculateRequiredPieces(100, 4)).toBe(400);
    expect(calculateReservePieces(400, true)).toBe(20);
    expect(calculateReservePieces(400, false)).toBe(0);
    expect(calculateFinderQuantity({ itemCount: 3, glidersPerItem: 4, reserveEnabled: false, packSize: 20 })).toMatchObject({ requiredPieces: 12, reservePieces: 0, recommendedPieces: 12, packCount: 1, orderPieces: 20 });
    expect(roundToPackSize(420, null)).toEqual({ packCount: null, orderPieces: 420 });
  });
});

test.describe("Gleiter-Finder im Browser", () => {
  test("führt vorwärts, zurück und zeigt verständliche Validierung", async ({ page }) => {
    await page.goto("/shop/gleiter-finder");
    await page.getByRole("button", { name: "Gleiter finden" }).click();
    await page.getByRole("button", { name: "Weiter" }).click();
    await expect(page.locator("#finder-error")).toHaveText("Bitte wählen Sie Stuhl oder Tisch aus.");
    await page.getByLabel("Stuhl", { exact: true }).check();
    await page.getByRole("button", { name: "Weiter" }).click();
    await expect(page.getByText("2 von 5", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Zurück" }).click();
    await expect(page.getByText("1 von 5", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Stuhl", { exact: true })).toBeChecked();
  });

  test("zeigt Filzempfehlung und transparente Packungsmenge", async ({ page }) => {
    await page.goto("/shop/gleiter-finder?art=chair&form=round&d=20&boden=parquet&anzahl=100&reserve=1&schritt=ergebnis");
    const result = page.getByTestId("finder-result");
    await expect(result).toHaveAttribute("data-status", "unique");
    await expect(result.getByRole("heading", { name: "Filzgleiter für Rundrohr" })).toBeVisible();
    await expect(result).toContainText("18,7–20,4 mm");
    await expect(result).toContainText("21 × 20");
    await expect(result).toContainText("Gesamt");
    await result.getByRole("link", { name: "Produkt ansehen" }).click();
    await expect(page).toHaveURL(/\/shop\/produkt\/filzgleiter-fuer-rundrohr\?variant=local-variant-rf-20/);
    await expect(page.getByTestId("selected-variant")).toContainText("Rundrohr 20 mm");
  });

  test("zeigt Teppich-Eingabe als Kunststoffempfehlung", async ({ page }) => {
    await page.goto("/shop/gleiter-finder?art=chair&form=round&d=20&boden=carpet&anzahl=100&reserve=1&schritt=ergebnis");
    const result = page.getByTestId("finder-result");
    await expect(result).toHaveAttribute("data-status", "unique");
    await expect(result.getByRole("heading", { name: "Kunststoffgleiter für Rundrohr" })).toBeVisible();
    await expect(result).toContainText("9 × 50");
    await expect(result).toContainText("450 Stück");
  });

  test("erklärt Multiple Match ohne automatische Auswahl", async ({ page }) => {
    await page.goto("/shop/gleiter-finder?art=chair&form=round&d=18.75&boden=parquet&anzahl=10&reserve=1&schritt=ergebnis");
    const result = page.getByTestId("finder-result");
    await expect(result).toHaveAttribute("data-status", "multiple");
    await expect(result).toContainText("Dieses Maß liegt im Übergangsbereich. Zwei Varianten kommen infrage.");
    await expect(result.getByRole("link", { name: "Produkt ansehen" })).toHaveCount(2);
  });

  test("stellt uncertain und no_match ohne Fake-Empfehlung dar", async ({ page }) => {
    await page.goto("/shop/gleiter-finder?art=chair&form=unknown&boden=unknown&anzahl=1&reserve=1&schritt=ergebnis");
    await expect(page.getByTestId("finder-result")).toHaveAttribute("data-status", "uncertain");
    await expect(page.getByRole("link", { name: "Persönlich fragen" }).first()).toBeVisible();
    await page.goto("/shop/gleiter-finder?art=chair&form=round&d=26&boden=tile_stone&anzahl=1&reserve=1&schritt=ergebnis");
    await expect(page.getByTestId("finder-result")).toHaveAttribute("data-status", "no_match");
    await expect(page.getByText("keine eindeutige Shop-Lösung", { exact: false }).first()).toBeVisible();
  });

  test("bleibt mobil in Mess- und Ergebnisansicht ohne horizontalen Überlauf", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    for (const route of [
      "/shop/gleiter-finder?art=chair&form=round&schritt=3",
      "/shop/gleiter-finder?art=chair&form=round&d=20&boden=parquet&anzahl=10&reserve=1&schritt=ergebnis",
    ]) {
      await page.goto(route);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, route).toBeLessThanOrEqual(1);
    }
  });
});
