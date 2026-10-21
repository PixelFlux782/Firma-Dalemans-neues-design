import { expect, test } from "@playwright/test";
import { localPriceListProducts } from "../src/lib/commerce/providers/local-price-list-products";
import { getProductBySlug } from "../src/lib/products";

const frameRoot = "/neue%20bilder/Gestelle/Gestelltypen/";
const frameFiles = [
  "Klapptisch_Gestell_K1-optimiert.webp",
  "Klapptisch_Gestell_K2-optimiert.webp",
  "T_Klapptisch_Gestell_K3_Standard-optimiert.webp",
  "Klapptisch_Gestell_K5-optimiert.webp",
  "Klapptisch_Gestell_K9-optimiert.webp",
  "Klapptisch_Gestell_K10-optimiert.webp",
] as const;

test("Gestellprodukt verwendet nur die eindeutigen K1-, K2-, K3-, K5-, K9- und K10-Bilder", () => {
  const product = getProductBySlug("tischfuesse-gestellteile")!;
  const images = [product.image, ...(product.additionalImages ?? []).map((item) => item.image)];
  expect(images).toHaveLength(frameFiles.length);
  expect(new Set(images).size).toBe(images.length);
  expect(images.every((path) => path.startsWith(frameRoot))).toBe(true);
  for (const file of frameFiles) expect(images.some((path) => path.endsWith(file))).toBe(true);
  expect(images.some((path) => path.includes("Stapeltischgestelle-rund-und-vierkant"))).toBe(false);
  expect(images.some((path) => path.includes("Vorschau-Kontaktbogen") || path.includes("Tgest-"))).toBe(false);
});

test("nur der nachweislich kompatible Klapptisch 310c erhält konkrete Gestellbilder", () => {
  const table310 = localPriceListProducts.find((product) => product.handle === "klapptisch-310c")!;
  const seminar210 = localPriceListProducts.find((product) => product.handle === "seminarklapptisch-210c")!;
  const trapezoid310 = localPriceListProducts.find((product) => product.handle === "trapez-klapptisch-310c")!;
  expect(table310.images.map((item) => item.url)).toEqual([
    "/images/curated/Tische/Klapptisch_Stapeltisch_t310ccolor_02.webp",
    `${frameRoot}Klapptisch_Gestell_K1-optimiert.webp`,
    `${frameRoot}T_Klapptisch_Gestell_K3_Standard-optimiert.webp`,
  ]);
  expect(seminar210.images).toHaveLength(1);
  expect(trapezoid310.images).toHaveLength(1);
});

test("Gestellberatung ist vollständig, verlinkt und lädt alle Bilder", async ({ page, request }) => {
  for (const file of frameFiles) {
    const response = await request.get(`${frameRoot}${file}`);
    expect(response.status(), file).toBe(200);
    expect(response.headers()["content-type"], file).toContain("image/webp");
  }

  await page.goto("/produkte/tischfuesse-gestellteile");
  await expect(page.getByRole("heading", { name: "Das passende Gestell für Ihren Tisch" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "K1 oder K2 für lange Tischreihen." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "K3 oder K4 für mehr Beinfreiheit." })).toBeVisible();
  await expect(page.getByText("Abgebildet ist ausschließlich das Gestell K3.", { exact: false })).toBeVisible();
  await expect(page.getByRole("link", { name: "Gestellratgeber lesen" })).toHaveAttribute("href", "/wissen/klapptische-richtig-waehlen#gestelle");
  await expect(page.getByRole("link", { name: "Persönlich beraten lassen" }).last()).toHaveAttribute("href", "/kontakt?anliegen=Tischgestellberatung");
  for (const model of ["K1", "K2", "K3", "K5", "K9", "K10"]) {
    await expect(page.getByRole("heading", { name: `Gestell ${model}` })).toBeVisible();
  }
  await expect(page.locator("img[src*='Stapeltischgestelle-rund-und-vierkant']")).toHaveCount(0);
});

test("Ratgeberanker und 310c-Galerie zeigen die korrekten Gestellinhalte", async ({ page }) => {
  await page.goto("/wissen/klapptische-richtig-waehlen#gestelle");
  const section = page.locator("#gestelle");
  await expect(section.getByRole("heading", { name: "Das passende Gestell für Ihren Tisch" })).toBeVisible();
  await expect(section.getByAltText(/Klapptisch-Gestell K1/)).toBeVisible();
  await expect(section.getByAltText(/Klapptisch-Gestell K2/)).toBeVisible();
  await expect(section.getByAltText(/Klapptisch-Gestell K3/)).toBeVisible();
  expect(await page.evaluate(() => location.hash)).toBe("#gestelle");

  await page.goto("/produkte/artikel/klapptisch-310c");
  const gallery = page.getByLabel("Weitere Produktbilder");
  await expect(gallery.getByRole("button", { name: /Bild 1: Klapptisch Modell 310c/ })).toBeVisible();
  await expect(gallery.getByRole("button", { name: /Bild 2: Klapptisch-Gestell K1/ })).toBeVisible();
  await expect(gallery.getByRole("button", { name: /Bild 3: Klapptisch-Gestell K3/ })).toBeVisible();
  await expect(page.getByText(/Für Reihenaufstellungen empfehlen wir in der Regel K1 oder K2/)).toBeVisible();

  for (const handle of ["seminarklapptisch-210c", "trapez-klapptisch-310c"]) {
    await page.goto(`/produkte/artikel/${handle}`);
    await expect(page.getByLabel("Weitere Produktbilder")).toHaveCount(0);
  }
});
