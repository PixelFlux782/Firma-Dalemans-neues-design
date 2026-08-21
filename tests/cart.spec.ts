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
