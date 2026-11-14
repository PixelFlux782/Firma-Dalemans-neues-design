import { expect, test } from "@playwright/test";
import { localCollectionRecords, localProducts } from "../src/lib/commerce/providers/local-data";
import { publicCommerceProducts } from "../src/lib/commerce/publication";
import { buildSearchIndex } from "../src/lib/search/index";
import { normalizeSearchText } from "../src/lib/search/normalize";
import { searchIndex } from "../src/lib/search/search";

const documents = buildSearchIndex(localProducts, localCollectionRecords);

function search(query: string) {
  return searchIndex(documents, query, {
    limits: { products: 30, collections: 30, help: 30, knowledge: 30 },
  });
}

test.describe("deterministische Search-Logik einschließlich isolierter DEV-Fixtures", () => {
  test("rankt einen exakten Produkttitel am höchsten", () => {
    const result = search("Filzgelenkgleiter").groups.products[0];
    expect(result.document.id).toBe("local-product-felt-joint-1021");
    expect(result.matchKind).toBe("exact_title");
  });

  test("unterscheidet Titel-Prefix und Titel-Partial", () => {
    expect(search("Kunststoffgleiter").groups.products[0].matchKind).toBe("title_prefix");
    expect(search("Winkelgleiter").groups.products[0].document.url).toBe("/produkte/artikel/filz-winkelgleiter");
    expect(search("Winkelgleiter").groups.products[0].matchKind).toBe("title_partial");
  });

  test("rankt eine exakte SKU vor allen anderen Treffern", () => {
    const results = search("DEV-RF-20").groups.products;
    expect(results[0].document.url).toBe("/produkte/artikel/filzgleiter-fuer-rundrohr");
    expect(results[0].matchKind).toBe("exact_sku");
    expect(results[0].matchedVariant?.sku).toBe("DEV-RF-20");
    expect(results[0].score).toBeGreaterThan(results[1]?.score ?? 0);
  });

  test("findet Stuhlgleiter und Fußkappe über zentrale Synonyme", () => {
    expect(search("stuhlgleiter").groups.products.length).toBeGreaterThan(0);
    expect(search("Fußkappe").groups.products[0].matchKind).toBe("synonym");
  });

  test("findet Collections getrennt von Produkten", () => {
    const result = search("Transport & Lagerung").groups.collections[0];
    expect(result.document.id).toBe("local-collection-transport-lagerung");
    expect(result.document.url).toBe("/produkte/sortiment/transport-lagerung");
  });

  test("nennt eine passende Variante bei Variantensuche", () => {
    const result = search("Rundrohr 20 mm").groups.products.find(
      (entry) => entry.document.url === "/produkte/artikel/filzgleiter-fuer-rundrohr",
    );
    expect(result?.matchedVariant?.sku).toBe("DEV-RF-20");
  });

  test("nutzt strukturierte Maße unabhängig von der Wortreihenfolge", () => {
    const result = search("20 mm rund").groups.products[0];
    expect(result.document.url).toBe("/produkte/artikel/filzgleiter-fuer-rundrohr");
    expect(result.matchedVariant?.sku).toBe("DEV-RF-20");
  });

  test("findet den Development-Alias aus dem Commerce-Modell", () => {
    const result = search("Development Rundgleiter").groups.products[0];
    expect(result.document.url).toBe("/produkte/artikel/filzgleiter-fuer-rundrohr");
    expect(result.matchKind).toBe("alias");
  });

  test("normalisiert Großschreibung, Umlaute, Bindestriche und Leerzeichen", () => {
    expect(normalizeSearchText("  MÖBEL--Gleiter  ")).toBe("mobel gleiter");
    expect(search("MOBELGLEITER").groups.products.length).toBeGreaterThan(0);
    expect(search("stuhl-gleiter").groups.products.length).toBeGreaterThan(0);
  });

  test("toleriert eine einfache Tippvariante", () => {
    expect(search("Filzgelenkgleitr").groups.products[0].document.title).toBe("Filzgelenkgleiter");
  });

  test("liefert bei absurden Suchbegriffen deterministisch keine Treffer", () => {
    const result = search("qxzv-991-niemals");
    expect(result.total).toBe(0);
    expect(result.groups).toEqual({ products: [], collections: [], help: [], knowledge: [] });
  });

  test("veröffentlicht Beratung und keine Finder-Hilfe", () => {
    const published = buildSearchIndex(publicCommerceProducts(localProducts, "production"), localCollectionRecords);
    expect(published.some((entry) => entry.url.includes("gleiter-finder"))).toBe(false);
    expect(searchIndex(published, "Beratung").groups.help.some((entry) => entry.document.url.startsWith("/kontakt"))).toBe(true);
    expect(searchIndex(published, "DEV-RF-20").groups.products).toHaveLength(0);
  });

  test("kann Development-Dokumente für verified_only ausfiltern", () => {
    expect(searchIndex(documents, "DEV-RF-20", { dataPolicy: "verified_only" }).groups.products).toHaveLength(0);
  });
});

test.describe("DLMNS Predictive Search", () => {
  test("öffnet am Desktop, sucht während der Eingabe und öffnet ein Produkt", async ({ page }) => {
    await page.goto("/produkte");
    await page.getByRole("button", { name: "Suchen", exact: true }).click();
    const input = page.getByRole("combobox", { name: "Shop durchsuchen" });
    await expect(input).toBeFocused();
    await input.fill("gleiter");
    await expect(page.getByRole("heading", { name: "Produkte", exact: true })).toBeVisible();
    await page.locator("[data-search-result='local-product-felt-joint-1021']").click();
    await expect(page).toHaveURL(/\/produkte\/artikel\/filzgelenkgleiter-modell-1021$/);
  });

  test("zeigt bei exakter SKU den richtigen Variantentreffer zuerst", async ({ page }) => {
    await page.goto("/produkte");
    await page.getByRole("button", { name: "Suchen", exact: true }).click();
    await page.getByRole("combobox", { name: "Shop durchsuchen" }).fill("A1021FG");
    const firstResult = page.locator("[data-search-result]").first();
    await expect(firstResult).toHaveAttribute("data-search-result", "local-product-felt-joint-1021");
    await expect(firstResult).toContainText("A1021FG");
  });

  test("führt bei Beratungsbedarf zur persönlichen Beratung", async ({ page }) => {
    await page.goto("/produkte");
    await page.getByRole("button", { name: "Suchen", exact: true }).click();
    await page.getByRole("combobox", { name: "Shop durchsuchen" }).fill("Beratung");
    await expect(page.locator("[data-search-result='help-personal-consultation']")).toBeVisible();
  });

  test("macht aus null Treffern keine Sackgasse", async ({ page }) => {
    await page.goto("/produkte");
    await page.getByRole("button", { name: "Suchen", exact: true }).click();
    await page.getByRole("combobox", { name: "Shop durchsuchen" }).fill("qxzv-991-niemals");
    const emptyState = page.getByTestId("search-no-results");
    await expect(emptyState).toContainText("Nichts Passendes gefunden?");
    await expect(emptyState.getByRole("link", { name: "Gleiter persönlich zuordnen" })).toBeVisible();
    await expect(emptyState.getByRole("link", { name: "Persönlich fragen" })).toBeVisible();
  });

  test("öffnet mit Enter die URL-basierte Suchseite mit noindex", async ({ page }) => {
    await page.goto("/produkte");
    await page.getByRole("button", { name: "Suchen", exact: true }).click();
    const input = page.getByRole("combobox", { name: "Shop durchsuchen" });
    await input.fill("gleiter");
    await input.press("Enter");
    await expect(page).toHaveURL(/\/produkte\/suche\?q=gleiter$/);
    await expect(page.getByRole("heading", { name: "Ergebnisse für „gleiter“" })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  for (const width of [320, 375]) {
    test(`bleibt bei ${width}px ohne horizontalen Overflow nutzbar`, async ({ page }) => {
      await page.setViewportSize({ width, height: 720 });
      await page.goto("/produkte");
      await page.getByRole("button", { name: "Suchen öffnen", exact: true }).click();
      await page.getByRole("combobox", { name: "Shop durchsuchen" }).fill("Filzgelenkgleiter");
      await expect(page.getByTestId("search-overlay")).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await expect(page.locator("[data-search-result]").first()).toBeVisible();
    });
  }

  test("unterstützt Pfeiltasten, Enter, Escape und Fokusrückgabe", async ({ page }) => {
    await page.goto("/produkte");
    const trigger = page.getByRole("button", { name: "Suchen", exact: true });
    await trigger.click();
    const input = page.getByRole("combobox", { name: "Shop durchsuchen" });
    await input.fill("A1021FG");
    await expect(page.locator("[data-search-result]").first()).toBeVisible();
    await input.press("ArrowDown");
    await expect(input).toHaveAttribute("aria-activedescendant", /search-option-/);
    await input.press("Escape");
    await expect(page.getByTestId("search-overlay")).toHaveCount(0);
    await expect(trigger).toBeFocused();

    await trigger.click();
    const reopenedInput = page.getByRole("combobox", { name: "Shop durchsuchen" });
    await reopenedInput.fill("A1021FG");
    await expect(page.locator("[data-search-result]").first()).toBeVisible();
    await reopenedInput.press("ArrowDown");
    await reopenedInput.press("Enter");
    await expect(page).toHaveURL(/\/produkte\/artikel\/filzgelenkgleiter-modell-1021$/);
  });
});
