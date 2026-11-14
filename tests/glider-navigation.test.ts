import { expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { getGliderNavigation } from "../src/lib/commerce/glider-navigation";
import { getCollectionByHandle } from "../src/lib/commerce/service";
import { localProducts } from "../src/lib/commerce/providers/local-data";
import { commerceProductPath } from "../src/lib/product-routes";

it("maps the complete public collection once with real titles and detail routes", async () => {
  const collection = await getCollectionByHandle("gleiter-bodenschutz");
  const links = await getGliderNavigation();
  expect(links).toEqual(collection!.products.map(p => ({ label: p.title, href: commerceProductPath(p) })));
  expect(links).toHaveLength(5);
  expect(new Set(links.map(link => link.href)).size).toBe(links.length);
});

it("follows catalog additions, removal and publication blocking without maintaining menu data", async () => {
  const original = [...localProducts];
  const source = original.find(p => p.collectionHandles.includes("gleiter-bodenschutz"))!;
  const added = { ...source, id: "navigation-test", handle: "navigation-test", title: "Navigation test fixture" };
  try {
    localProducts.push(added);
    expect(await getGliderNavigation()).toContainEqual({ label: added.title, href: commerceProductPath(added) });
    for (const blockedVariant of [
      { ...source.variants[0], sku: "DEV-NAVIGATION" },
      { ...source.variants[0], priceDataStatus: "development" as const },
      { ...source.variants[0], finderAttributes: { ...source.variants[0].finderAttributes!, dataStatus: "development" as const } },
    ]) {
      added.variants = [blockedVariant];
      expect((await getGliderNavigation()).some(link => link.href === commerceProductPath(added))).toBe(false);
    }
    localProducts.splice(localProducts.indexOf(added), 1);
    expect((await getGliderNavigation()).some(link => link.href === commerceProductPath(added))).toBe(false);
  } finally { localProducts.splice(0, localProducts.length, ...original); }
});
