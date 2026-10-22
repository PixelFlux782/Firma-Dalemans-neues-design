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

test("Klapptisch 310c verwendet eindeutige K3-Produktbilder, andere Tische bleiben unverändert", () => {
  const table310 = localPriceListProducts.find((product) => product.handle === "klapptisch-310c")!;
  const seminar210 = localPriceListProducts.find((product) => product.handle === "seminarklapptisch-210c")!;
  const trapezoid310 = localPriceListProducts.find((product) => product.handle === "trapez-klapptisch-310c")!;
  expect(table310.images.map((item) => item.url)).toEqual([
    "/images/curated/Tische/Klapptisch_Stapeltisch_t310ccolor_02.webp",
    "/neue%20bilder/Tische/klapptisch-310c/310c-01-hauptansicht.webp",
    "/neue%20bilder/Tische/klapptisch-310c/310c-02-perspektive.webp",
    "/neue%20bilder/Tische/klapptisch-310c/310c-03-seitenansicht.webp",
  ]);
  expect(table310.featuredImage).toEqual(table310.images[0]);
  expect(new Set(table310.images.map((item) => item.url)).size).toBe(table310.images.length);
  expect(seminar210.images.map((item) => item.url)).toEqual([
    "/images/curated/Tische/T210cdetail.webp",
    "/neue%20bilder/Tische/t210.png",
  ]);
  expect(seminar210.featuredImage).toEqual(seminar210.images[0]);
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
    await expect(page.getByRole("heading", { name: `Gestell ${model}`, exact: true })).toBeVisible();
  }
  await expect(page.locator("img[src*='Stapeltischgestelle-rund-und-vierkant']")).toHaveCount(0);
});

test("Ratgeberanker und 310c-Galerie zeigen die korrekten Gestellinhalte", async ({ page, request }) => {
  await page.goto("/wissen/klapptische-richtig-waehlen#gestelle");
  const section = page.locator("#gestelle");
  await expect(section.getByRole("heading", { name: "Das passende Gestell für Ihren Tisch" })).toBeVisible();
  await expect(section.getByAltText(/Klapptisch-Gestell K1/)).toBeVisible();
  await expect(section.getByAltText(/Klapptisch-Gestell K2/)).toBeVisible();
  await expect(section.getByAltText(/Klapptisch-Gestell K3/)).toBeVisible();
  expect(await page.evaluate(() => location.hash)).toBe("#gestelle");

  await page.goto("/produkte/artikel/klapptisch-310c");
  const gallery = page.getByLabel("Weitere Produktbilder");
  await expect(gallery.getByRole("button", { name: /Bild 1: Klapptisch Modell 310c$/ })).toBeVisible();
  await expect(gallery.getByRole("button", { name: /Bild 2: Klapptisch Modell 310c mit Gestell K3 in der Hauptansicht/ })).toBeVisible();
  await expect(gallery.getByRole("button", { name: /Bild 3: Klapptisch Modell 310c mit Gestell K3 aus erhöhter Perspektive/ })).toBeVisible();
  await expect(gallery.getByRole("button", { name: /Bild 4: Klapptisch Modell 310c mit Gestell K3 in seitlicher Perspektive/ })).toBeVisible();
  await expect(page.getByTestId("table-frame-order-note")).toContainText("K1 und K2 eignen sich für Tischreihen");
  await expect(page.getByRole("link", { name: "Gestelle vergleichen" })).toHaveAttribute("href", "#gestellberatung");
  const advice = page.locator("#gestellberatung");
  await expect(advice.getByRole("heading", { name: "Das passende Gestell für Ihren Tisch." })).toBeVisible();
  await expect(advice.getByRole("heading", { name: "Gestelle K1 und K2" })).toBeVisible();
  await expect(advice.getByRole("heading", { name: "Gestelle K3 und K4" })).toBeVisible();
  await expect(advice.getByText(/140 cm Länge ist K1 eine bewährte Wahl/)).toBeVisible();
  await expect(advice.getByAltText("Klappmechanik des Gestells K1 am Klapptisch 310c")).toBeVisible();
  await expect(advice.getByAltText("Beschlagdetail der Klappmechanik von Gestell K1 am Klapptisch 310c")).toBeVisible();

  for (const file of ["310c-01-hauptansicht.webp", "310c-02-perspektive.webp", "310c-03-seitenansicht.webp", "310c-04-eingeklappt.webp", "310c-05-klappmechanik.webp", "310c-06-beschlag-detail.webp"]) {
    expect((await request.get(`/neue%20bilder/Tische/klapptisch-310c/${file}`)).status(), file).toBe(200);
  }

  await page.goto("/produkte/artikel/seminarklapptisch-210c");
  const seminarGallery = page.getByLabel("Weitere Produktbilder");
  await expect(seminarGallery.getByRole("button", { name: /Bild 2: Seminarklapptisch Modell 210c in einer weiteren Ansicht/ })).toBeVisible();
  expect((await request.get("/neue%20bilder/Tische/t210.png")).status()).toBe(200);

  await page.goto("/produkte/artikel/trapez-klapptisch-310c");
  await expect(page.getByLabel("Weitere Produktbilder")).toHaveCount(0);
});
