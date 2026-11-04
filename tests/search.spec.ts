import { expect, test } from "@playwright/test";
import { localCollectionRecords, localProducts } from "../src/lib/commerce/providers/local-data";
import { buildSearchIndex } from "../src/lib/search/index";
import { normalizeSearchText } from "../src/lib/search/normalize";
import { searchIndex } from "../src/lib/search/search";

const documents = buildSearchIndex(localProducts, localCollectionRecords);

function search(query: string) {
  return searchIndex(documents, query, {
    limits: { products: 30, collections: 30, help: 30, knowledge: 30 },
  });
}

test.describe("deterministische Search-Logik", () => {
  test("rankt einen exakten Produkttitel am höchsten", () => {
    const result = search("Filzgelenkgleiter").groups.products[0];
    expect(result.document.id).toBe("local-product-felt-joint-1021");
    expect(result.matchKind).toBe("exact_title");
  });

  test("unterscheidet Titel-Prefix und Titel-Partial", () => {
    expect(search("Filz-Nagel").groups.products[0].matchKind).toBe("title_prefix");
    expect(search("Gestellgleiter").groups.products[0].document.url).toBe("/produkte/artikel/kunststoff-gestellgleiter");
    expect(search("Nagelgleiter").groups.products[0].matchKind).toBe("title_partial");
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

  test("promotet die persönliche Zuordnung bei beratungsnahen Suchanfragen", () => {
    const result = search("Foto Maße").groups.help[0];
    expect(result.document.id).toBe("help-personal-consultation");
    expect(result.document.url).toBe("/kontakt?anliegen=Shop-Beratung");
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
    await input.fill("Kunststoffgleiter Standard");
    await expect(page.getByRole("heading", { name: "Produkte", exact: true })).toBeVisible();
    await page.locator("[data-search-result='local-product-plastic-standard']").click();
    await expect(page).toHaveURL(/\/produkte\/artikel\/kunststoff-gestellgleiter$/);
  });

  test("zeigt bei exakter SKU den richtigen Variantentreffer zuerst", async ({ page }) => {
    await page.goto("/produkte");
    await page.getByRole("button", { name: "Suchen", exact: true }).click();
    await page.getByRole("combobox", { name: "Shop durchsuchen" }).fill("GSTGL");
    const firstResult = page.locator("[data-search-result]").first();
    await expect(firstResult).toHaveAttribute("data-search-result", "local-product-plastic-standard");
    await expect(firstResult).toContainText("GSTGL");
  });

  test("führt bei Beratungs-Suche prominent zur persönlichen Zuordnung", async ({ page }) => {
    await page.goto("/produkte");
    await page.getByRole("button", { name: "Suchen", exact: true }).click();
    await page.getByRole("combobox", { name: "Shop durchsuchen" }).fill("Foto Maße");
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
      await page.getByRole("button", { name: "Suche öffnen" }).click();
      await page.getByRole("combobox", { name: "Shop durchsuchen" }).fill("20 mm Kunststoff");
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
    await input.fill("GSTGL");
    await expect(page.locator("[data-search-result]").first()).toBeVisible();
    await input.press("ArrowDown");
    await expect(input).toHaveAttribute("aria-activedescendant", /search-option-/);
    await input.press("Escape");
    await expect(page.getByTestId("search-overlay")).toHaveCount(0);
    await expect(trigger).toBeFocused();

    await trigger.click();
    const reopenedInput = page.getByRole("combobox", { name: "Shop durchsuchen" });
    await reopenedInput.fill("GSTGL");
    await expect(page.locator("[data-search-result]").first()).toBeVisible();
    await reopenedInput.press("ArrowDown");
    await reopenedInput.press("Enter");
    await expect(page).toHaveURL(/\/produkte\/artikel\/kunststoff-gestellgleiter$/);
  });

  test("debounced schnelle Eingaben und cached identische Suchanfragen", async ({ page }) => {
    const queries: string[] = [];
    await page.route("**/api/search?*", async (route) => {
      const query = new URL(route.request().url()).searchParams.get("q") ?? "";
      if (query) queries.push(query);
      await route.continue();
    });
    await page.goto("/produkte");
    await page.getByRole("button", { name: "Suchen", exact: true }).click();
    const input = page.getByRole("combobox", { name: "Shop durchsuchen" });
    await input.pressSequentially("GSTGL", { delay: 25 });
    await expect(page.locator("[data-search-result='local-product-plastic-standard']")).toBeVisible();
    expect(queries).toEqual(["GSTGL"]);

    await input.fill("qxzv-991-niemals");
    await expect(page.getByTestId("search-no-results")).toBeVisible();
    await input.fill("GSTGL");
    await expect(page.locator("[data-search-result='local-product-plastic-standard']")).toBeVisible();
    expect(queries.filter((query) => query === "GSTGL")).toHaveLength(1);
  });

  test("liefert kompakte, cachebare API-Antworten ohne interne Indexfelder", async ({ request }) => {
    const response = await request.get("/api/search?q=gleiter");
    expect(response.ok()).toBe(true);
    expect(response.headers()["cache-control"]).toContain("public");
    expect(response.headers()["cdn-cache-control"]).toContain("s-maxage=3600");
    const body = await response.body();
    expect(body.byteLength).toBeLessThan(8_000);
    const payload = JSON.parse(body.toString("utf8"));
    for (const group of Object.values(payload.groups) as Array<Array<{ document: { fields: unknown[]; aliases: unknown[]; variantLabels: unknown[] } }>>) {
      for (const result of group) {
        expect(result.document.fields).toEqual([]);
        expect(result.document.aliases).toEqual([]);
        expect(result.document.variantLabels).toEqual([]);
      }
    }
  });
});
