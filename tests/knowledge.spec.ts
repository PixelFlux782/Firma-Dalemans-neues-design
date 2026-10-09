import { expect, test } from "@playwright/test";
import { fabricCards, getPublishedGuides, hasVerifiedFabricCard } from "../src/lib/knowledge";
import { buildSearchIndex } from "../src/lib/search/index";

test.describe("Wissensbereich", () => {
  test("veröffentlicht ausschließlich freigegebene Ratgeber", () => {
    const guides = getPublishedGuides();
    expect(guides).toHaveLength(3);
    expect(guides.every((guide) => guide.status === "published")).toBe(true);
    expect(guides.map((guide) => guide.slug)).toEqual([
      "stoffe-und-bezuege",
      "klapptische-richtig-waehlen",
      "tischplatten-und-kanten",
    ]);
  });

  test("nimmt die veröffentlichten Ratgeber in die bestehende Suche auf", () => {
    const knowledgeDocuments = buildSearchIndex([], []).filter((document) => document.type === "knowledge");
    expect(knowledgeDocuments).toHaveLength(3);
    expect(knowledgeDocuments.map((document) => document.url)).toContain("/wissen/stoffe-und-bezuege");
  });

  test("ist in Desktop- und Mobilnavigation erreichbar", async ({ page }) => {
    await page.goto("/wissen");
    await expect(page.getByRole("heading", { level: 1, name: "Gut entscheiden, bevor der Raum eingerichtet wird." })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Hauptnavigation" }).getByRole("link", { name: "Wissen", exact: true })).toHaveAttribute("aria-current", "page");

    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "Menü", exact: true }).click();
    await expect(page.getByRole("navigation", { name: "Mobile Hauptnavigation" }).getByRole("link", { name: "Wissen", exact: true })).toBeVisible();
  });

  test("rendert alle drei Ratgeber über ihre internen Routen", async ({ page }) => {
    for (const guide of getPublishedGuides()) {
      await page.goto(`/wissen/${guide.slug}`);
      await expect(page.getByRole("heading", { level: 1, name: guide.title })).toBeVisible();
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/wissen/${guide.slug}$`));
      await expect(page.getByRole("heading", { level: 2, name: "Kurz und konkret beantwortet." })).toBeVisible();
    }
  });

  test("zeigt bei ungeprüften Stoffkarten eine Alternative statt Download", async ({ page }) => {
    expect(fabricCards.every((card) => !hasVerifiedFabricCard(card))).toBe(true);
    await page.goto("/wissen/stoffkarten");
    await expect(page.getByRole("heading", { level: 1, name: "Stoffgruppen in Ruhe vergleichen." })).toBeVisible();
    await expect(page.getByRole("link", { name: "Stoffkarte herunterladen" })).toHaveCount(0);
    await expect(page.getByText("Stoffkarte wird geprüft")).toHaveCount(3);
    await expect(page.getByRole("link", { name: /Muster zu Stoffgruppe/ })).toHaveCount(3);
  });

  test("zeigt Themen ohne geprüften Beitrag ohne leere Detailroute", async ({ page }) => {
    await page.goto("/wissen");
    for (const name of ["Brandschutz & Sicherheit", "Transport & Lagerung", "Pflege & Ersatzteile"]) {
      const card = page.getByRole("article").filter({ has: page.getByRole("heading", { name }) });
      await expect(card.getByText("In redaktioneller Vorbereitung")).toBeVisible();
      await expect(card.getByRole("link")).toHaveCount(0);
    }
  });

  test("bleibt auf allen Wissensrouten mobil und am Desktop ohne horizontalen Überlauf", async ({ page }) => {
    const routes = [
      "/wissen",
      "/wissen/stoffe-und-bezuege",
      "/wissen/klapptische-richtig-waehlen",
      "/wissen/tischplatten-und-kanten",
      "/wissen/stoffkarten",
    ];

    for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 1000 }]) {
      await page.setViewportSize(viewport);
      for (const route of routes) {
        await page.goto(route);
        const dimensions = await page.evaluate(() => ({
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
        }));
        expect(dimensions.scrollWidth, `${route} bei ${viewport.width}px`).toBe(dimensions.clientWidth);
      }
    }
  });
});
