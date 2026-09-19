import { expect, test } from "@playwright/test";
import {
  createLocalCartProvider,
  LOCAL_CART_STORAGE_KEY,
  normalizeCartQuantity,
  parsePersistedCart,
  type CartStorage,
} from "../src/lib/commerce/cart/local";
import { cartLineFromProduct } from "../src/lib/commerce/cart/lines";
import { localProducts } from "../src/lib/commerce/providers/local-data";
import type { CartInputLine } from "../src/lib/commerce/types";
import { recommendGliders } from "../src/lib/finder/recommend";
import type { FinderInput } from "../src/lib/finder/types";

class MemoryStorage implements CartStorage {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

function fixedLine(overrides: Partial<CartInputLine> = {}): CartInputLine {
  return {
    productId: "product-1",
    productHandle: "testprodukt",
    productTitle: "Testprodukt",
    variantId: "variant-1",
    variantTitle: "Standard",
    erpArticleNumber: "TEST-ERP-1",
    image: null,
    quantity: 1,
    unitPrice: { amount: "2.50", currencyCode: "EUR" },
    priceStatus: "fixed",
    priceDataStatus: "development",
    packSize: null,
    unitLabel: "Stück",
    minimumQuantity: 1,
    quantityStep: 1,
    availability: "in_stock",
    source: "product",
    ...overrides,
  };
}

function provider(storage = new MemoryStorage()) {
  let id = 0;
  return {
    cart: createLocalCartProvider({ storage, idFactory: () => `id-${++id}` }),
    storage,
  };
}

test.describe("provider-neutrale lokale Cart-Logik", () => {
  test("fügt Produkte hinzu und fasst dieselbe Variante zusammen", () => {
    const { cart } = provider();
    expect(cart.addLines([fixedLine()])).toMatchObject({ totalQuantity: 1 });
    const result = cart.addLines([fixedLine({ quantity: 2 })]);
    expect(result.lines).toHaveLength(1);
    expect(result.lines[0].quantity).toBe(3);
    expect(result.lines[0].lineTotal).toEqual({ amount: "7.50", currencyCode: "EUR" });
  });

  test("führt unterschiedliche Varianten desselben Produkts getrennt", () => {
    const { cart } = provider();
    const result = cart.addLines([
      fixedLine(),
      fixedLine({ variantId: "variant-2", variantTitle: "Alternative" }),
    ]);
    expect(result.lines.map((line) => line.variantId)).toEqual(["variant-1", "variant-2"]);
  });

  test("behält ERP-Artikelnummer und wechselt den Staffelpreis bei Mengenänderung", () => {
    const table = localProducts.find((product) => product.handle === "klapptisch-310c")!;
    const variant = table.variants.find((entry) => entry.erpArticleNumber === "T310C127")!;
    const { cart } = provider();
    const added = cart.addLines([cartLineFromProduct({ product: table, variant, quantity: 15 })]);
    expect(added.lines[0]).toMatchObject({ erpArticleNumber: "T310C127", unitPrice: { amount: "355.93" } });
    const updated = cart.updateLines([{ lineId: added.lines[0].id, quantity: 16 }]);
    expect(updated.lines[0]).toMatchObject({ erpArticleNumber: "T310C127", unitPrice: { amount: "345.25" } });
  });

  test("ordnet die verschobene Buche-310c-Zeile mit Staffelpreisen korrekt zu", () => {
    const table = localProducts.find((product) => product.handle === "klapptisch-310c")!;
    expect(table.variants.filter((entry) => entry.title.endsWith("Buche natur")).map((entry) => [
      entry.erpArticleNumber,
      entry.title,
      entry.priceTiers?.map((tier) => tier.price.amount),
    ])).toEqual([
      ["T310C127N", "120 × 70 cm · Buche natur", ["386.65", "375.05", "367.32"]],
      ["T310C128N", "120 × 80 cm · Buche natur", ["396.18", "384.29", "376.37"]],
      ["T310C147N", "140 × 70 cm · Buche natur", ["419.67", "407.08", "398.69"]],
      ["T310C148N", "140 × 80 cm · Buche natur", ["423.13", "410.44", "401.97"]],
      ["T310C157N", "150 × 70 cm · Buche natur", ["421.98", "409.32", "400.88"]],
      ["T310C1575N", "150 × 75 cm · Buche natur", ["425.26", "412.50", "404.00"]],
      ["T310C167N", "160 × 70 cm · Buche natur", ["424.44", "411.71", "403.22"]],
      ["T310C168N", "160 × 80 cm · Buche natur", ["426.25", "413.46", "404.94"]],
      ["T310C177N", "170 × 70 cm · Buche natur", ["427.89", "415.05", "406.50"]],
      ["T310C178N", "170 × 80 cm · Buche natur", ["440.87", "427.64", "418.83"]],
      ["T310C187N", "180 × 70 cm · Buche natur", ["427.89", "415.05", "406.50"]],
      ["T310C188N", "180 × 80 cm · Buche natur", ["440.87", "427.64", "418.83"]],
    ]);
    const variant = table.variants.find((entry) => entry.erpArticleNumber === "T310C127N")!;
    const { cart } = provider();
    const added = cart.addLines([cartLineFromProduct({ product: table, variant, quantity: 21 })]);
    expect(added.lines[0]).toMatchObject({ erpArticleNumber: "T310C127N", unitPrice: { amount: "367.32" } });
  });

  test("Preis-auf-Anfrage bleibt ohne Null-Euro-Position", () => {
    const chairs = localProducts.find((product) => product.handle === "klappstuehle")!;
    expect(chairs.variants[0].price).toBeNull();
    const { cart } = provider();
    expect(cart.addLines([cartLineFromProduct({ product: chairs, variant: chairs.variants[0], quantity: 4 })]).lines).toEqual([]);
  });

  test("erhöht, reduziert und setzt Mengen direkt", () => {
    const { cart } = provider();
    const added = cart.addLines([fixedLine({ quantity: 3 })]);
    const lineId = added.lines[0].id;
    expect(cart.updateLines([{ lineId, quantity: 4 }]).lines[0].quantity).toBe(4);
    expect(cart.updateLines([{ lineId, quantity: 2 }]).lines[0].quantity).toBe(2);
    expect(cart.updateLines([{ lineId, quantity: 9 }]).lines[0].quantity).toBe(9);
  });

  test("respektiert Mindestmenge und Packungsgröße", () => {
    expect(normalizeCartQuantity(1, 50, 50)).toBe(50);
    expect(normalizeCartQuantity(37, 50, 50)).toBe(50);
    expect(normalizeCartQuantity(51, 50, 50)).toBe(100);
    const { cart } = provider();
    const result = cart.addLines([fixedLine({ quantity: 37, minimumQuantity: 50, quantityStep: 50, packSize: 50 })]);
    expect(result.lines[0]).toMatchObject({ quantity: 50, packSize: 50 });
  });

  test("entfernt Positionen und leert den Warenkorb", () => {
    const { cart } = provider();
    const added = cart.addLines([fixedLine(), fixedLine({ variantId: "variant-2" })]);
    expect(cart.removeLines([added.lines[0].id]).lines).toHaveLength(1);
    expect(cart.clearCart()).toMatchObject({ lines: [], totalQuantity: 0 });
  });

  test("summiert feste Development-Preise deterministisch", () => {
    const { cart } = provider();
    const result = cart.addLines([
      fixedLine({ quantity: 4 }),
      fixedLine({ variantId: "variant-2", quantity: 2, unitPrice: { amount: "1.25", currencyCode: "EUR" } }),
    ]);
    expect(result.totals).toMatchObject({
      subtotalAmount: { amount: "12.50", currencyCode: "EUR" },
      pricedLineCount: 2,
      unpricedLineCount: 0,
    });
    expect(result.lines.every((line) => line.priceDataStatus === "development")).toBe(true);
  });

  test("führt Anfrage- und ab-Preise nicht irreführend als Kaufposition", () => {
    const { cart } = provider();
    expect(cart.addLines([fixedLine({ priceStatus: "on_request", unitPrice: null, availability: "on_request" })]).lines).toEqual([]);
    expect(cart.addLines([fixedLine({ priceStatus: "from" })]).lines).toEqual([]);
  });

  test("setzt beschädigte Persistenz und alte Versionen kontrolliert zurück", () => {
    expect(parsePersistedCart("{kaputt")).toBeNull();
    expect(parsePersistedCart(JSON.stringify({ version: 0, cartId: "alt", lines: [] }))).toBeNull();
    const storage = new MemoryStorage();
    storage.setItem(LOCAL_CART_STORAGE_KEY, "{kaputt");
    const { cart } = provider(storage);
    expect(cart.getCart().lines).toEqual([]);
    expect(storage.getItem(LOCAL_CART_STORAGE_KEY)).toBeNull();
  });

  test("übernimmt Finder-Bestellmengen 450 und 170 unverändert", () => {
    const cases: Array<{ input: FinderInput; expected: number }> = [
      {
        input: { itemType: "chair", frameShape: "round", dimensions: { diameter: 20 }, floorType: "carpet", itemCount: 100, reserveEnabled: true },
        expected: 450,
      },
      {
        input: { itemType: "chair", frameShape: "cantilever", dimensions: { width: 30, height: 15 }, floorType: "parquet", itemCount: 80, reserveEnabled: true },
        expected: 170,
      },
    ];

    for (const entry of cases) {
      const result = recommendGliders(localProducts, entry.input);
      expect(result.status).toBe("unique");
      if (result.status !== "unique") continue;
      const match = result.matches[0];
      const { cart } = provider();
      const added = cart.addLines([cartLineFromProduct({
        product: match.product,
        variant: match.variant,
        quantity: match.quantity.orderPieces,
        source: "glider_finder",
        finderContext: {
          itemCount: match.quantity.itemCount,
          requiredQuantity: match.quantity.requiredPieces,
          reserveQuantity: match.quantity.reservePieces,
          recommendedQuantity: match.quantity.recommendedPieces,
          orderQuantity: match.quantity.orderPieces,
        },
      })]);
      expect(added.lines[0].quantity).toBe(entry.expected);
      expect(added.lines[0].finderContext?.orderQuantity).toBe(entry.expected);
    }
  });
});

test.describe("DLMNS Cart Drawer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/shop");
    await page.evaluate(() => localStorage.clear());
  });

  test("Produktvariante hinzufügen, Menge ändern und entfernen", async ({ page }) => {
    await page.goto("/shop/produkt/filzgleiter-fuer-rundrohr?variant=local-variant-rf-20");
    await page.getByRole("button", { name: "In den Warenkorb" }).click();
    const drawer = page.getByTestId("cart-drawer");
    await expect(drawer).toBeVisible();
    await expect(drawer).toContainText("Filzgleiter für Rundrohr");
    await drawer.getByRole("button", { name: /Menge .* erhöhen/ }).click();
    await expect(drawer.getByLabel(/Menge für/)).toHaveValue("40");
    await drawer.getByRole("button", { name: /entfernen/ }).click();
    await expect(drawer).toContainText("Noch nichts ausgewählt.");
  });

  test("Tischvariante nutzt bei 16 Stück die zweite Staffel und persistiert die ERP-Nummer", async ({ page }) => {
    await page.goto("/shop/produkt/klapptisch-310c");
    await page.getByRole("button", { name: "140 × 70 cm" }).click();
    await expect(page.getByTestId("selected-variant")).toContainText("140 × 70 cm · ABS");
    await page.getByLabel("Bestellmenge").fill("16");
    await page.getByRole("button", { name: "In den Warenkorb" }).click();
    await expect(page.getByTestId("cart-drawer")).toContainText("372,50");
    const persisted = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null"), LOCAL_CART_STORAGE_KEY);
    expect(persisted.lines[0]).toMatchObject({ erpArticleNumber: "T310C147", quantity: 16, unitPrice: { amount: "372.50" } });
  });

  test("Buche-310c-Variante nutzt die korrigierte ERP-Zuordnung im Warenkorb", async ({ page }) => {
    await page.goto("/shop/produkt/klapptisch-310c");
    await page.getByRole("button", { name: "120 × 70 cm" }).click();
    await page.getByRole("button", { name: "Buche natur" }).click();
    await expect(page.getByTestId("selected-variant")).toContainText("120 × 70 cm · Buche natur");
    await page.getByLabel("Bestellmenge").fill("21");
    await page.getByRole("button", { name: "In den Warenkorb" }).click();
    await expect(page.getByTestId("cart-drawer")).toContainText("367,32");
    const persisted = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null"), LOCAL_CART_STORAGE_KEY);
    expect(persisted.lines[0]).toMatchObject({ erpArticleNumber: "T310C127N", quantity: 21, unitPrice: { amount: "367.32" } });
  });

  test("Finder legt die bereits berechneten 450 Stück in den Cart", async ({ page }) => {
    await page.goto("/shop/gleiter-finder?art=chair&form=round&d=20&boden=carpet&anzahl=100&reserve=1&schritt=ergebnis");
    await page.getByTestId("finder-add-to-cart").click();
    const drawer = page.getByTestId("cart-drawer");
    await expect(drawer.getByLabel(/Menge für/)).toHaveValue("450");
    await expect(drawer).toContainText("Bedarf 400, mit Reserve 420, bestellbar 450 Stück.");
  });

  test("Cart bleibt über Navigation und Reload erhalten", async ({ page }) => {
    await page.goto("/shop/produkt/filzgleiter-fuer-rundrohr?variant=local-variant-rf-20");
    await page.getByRole("button", { name: "In den Warenkorb" }).click();
    await page.getByRole("button", { name: "Warenkorb schließen" }).click();
    await page.goto("/firma");
    await expect(page.getByTestId("cart-trigger").first()).toContainText("20");
    await page.reload();
    await expect(page.getByTestId("cart-trigger").first()).toContainText("20");
  });

  test("Drawer ist bei 320 und 375 Pixel ohne horizontalen Überlauf nutzbar", async ({ page }) => {
    for (const width of [320, 375]) {
      await page.setViewportSize({ width, height: 720 });
      await page.goto("/shop");
      await page.getByTestId("cart-trigger").last().click();
      await expect(page.getByTestId("cart-drawer")).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      await page.keyboard.press("Escape");
    }
  });

  test("Escape schließt und gibt den Fokus an den Auslöser zurück", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const trigger = page.getByTestId("cart-trigger").first();
    await trigger.click();
    await expect(page.getByRole("button", { name: "Warenkorb schließen" })).toBeFocused();
    await expect(page.locator("#site-shell")).toHaveAttribute("aria-hidden", "true");
    await page.keyboard.press("Shift+Tab");
    await expect(page.getByRole("link", { name: "Gleiter-Finder starten" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Warenkorb schließen" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("cart-drawer")).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
});
