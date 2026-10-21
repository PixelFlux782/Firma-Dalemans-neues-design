import { expect, test } from "@playwright/test";
import {
  fabricCards,
  getPublishedGuides,
  hasVerifiedFabricCard,
  modelSpecific,
  standardTableDimensions,
  verificationNeeded,
} from "../src/lib/knowledge";
import type { GuideArticle } from "../src/lib/knowledge/types";
import { buildSearchIndex } from "../src/lib/search/index";

test.describe("Wissensbereich", () => {
  test("veröffentlicht ausschließlich freigegebene Ratgeber", () => {
    const guides = getPublishedGuides();
    expect(guides).toHaveLength(6);
    expect(guides.every((guide) => guide.status === "published")).toBe(true);
    expect(guides.map((guide) => guide.slug)).toEqual([
      "stapelstuehle-richtig-auswaehlen",
      "reihenverbinder-fuer-stapelstuehle",
      "transport-lagerung-pflege",
      "stoffe-und-bezuege",
      "klapptische-richtig-waehlen",
      "tischplatten-und-kanten",
    ]);
  });

  test("nimmt die veröffentlichten Ratgeber in die bestehende Suche auf", () => {
    const knowledgeDocuments = buildSearchIndex([], []).filter((document) => document.type === "knowledge");
    expect(knowledgeDocuments).toHaveLength(6);
    expect(knowledgeDocuments.map((document) => document.url)).toContain("/wissen/stoffe-und-bezuege");
  });

  test("hält die Stoffberatung knapp und beschreibt HPL eindeutig", () => {
    const guides = getPublishedGuides();
    const fabricGuide = guides.find((guide) => guide.slug === "stoffe-und-bezuege");
    const surfaceGuide = guides.find((guide) => guide.slug === "tischplatten-und-kanten");
    const fabricCopy = JSON.stringify(fabricGuide);
    const surfaceCopy = JSON.stringify(surfaceGuide);

    expect(fabricCopy).not.toContain("Stoffnachweis und kompletter Polsterstuhl");
    expect(fabricCopy).not.toContain("Ist Stoffgruppe 3 automatisch B1?");
    expect(surfaceCopy).toContain("HPL ist mindestens dreimal so belastbar");
    expect(surfaceCopy).toContain("mindestens zehnmal härter");
    expect(surfaceCopy).toContain("hohe Widerstandsdauer gegen Zigarettenglut");
    expect(surfaceCopy).toContain("Ja, immer.");
  });

  test("spricht in der Stapelstuhlberatung aus Unternehmenssicht", () => {
    const chairGuide = getPublishedGuides().find((guide) => guide.slug === "stapelstuehle-richtig-auswaehlen");
    const chairCopy = JSON.stringify(chairGuide);

    expect(chairCopy).toContain("Wir, die Firma Dalemans");
    expect(chairCopy).toContain("zufriedenen Kunden");
    expect(chairCopy).toContain("Von Anfang an an Reihenverbinder denken");
    expect(chairCopy).toContain("Mit Reihenverbinder beträgt die Stuhlbreite ca. 53 cm");
    expect(chairCopy).not.toMatch(/wird genannt|werden genannt|Lebensdauergarantie|unseriös/);
  });

  test("ist in Desktop- und Mobilnavigation erreichbar", async ({ page }) => {
    await page.goto("/wissen");
    await expect(page.getByRole("heading", { level: 1, name: "Gut entscheiden, bevor der Raum eingerichtet wird." })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Hauptnavigation" }).getByRole("link", { name: "Wissen", exact: true })).toHaveAttribute("aria-current", "page");

    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "Menü", exact: true }).click();
    await expect(page.getByRole("navigation", { name: "Mobile Hauptnavigation" }).getByRole("link", { name: "Wissen", exact: true })).toBeVisible();
  });

  test("zeigt die überarbeitete Unternehmenssprache und Tischhinweise im Browser", async ({ page }) => {
    await page.goto("/wissen/stapelstuehle-richtig-auswaehlen");
    await expect(page.getByRole("heading", { name: "Robuste Schalen und saubere Verarbeitung" })).toBeVisible();
    await expect(page.getByText(/Wir, die Firma Dalemans, empfehlen/)).toBeVisible();
    await expect(page.getByText("Viele unserer zufriedenen Kunden nutzen ihre Dalemans-Stühle seit Jahrzehnten.")).toBeVisible();

    await page.goto("/wissen/klapptische-richtig-waehlen#gestelle");
    await expect(page.getByRole("heading", { name: "Gestelltyp K1 für Reihen, Gestelltyp K3 bei häufiger Stirnseitennutzung" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Tischgestelle K1 und K3 ansehen" })).toHaveAttribute("href", "/produkte/tischfuesse-gestellteile");
    await expect(page.getByRole("link", { name: "Klapptisch Modell 310c ansehen", exact: true }).first()).toHaveAttribute("href", "/produkte/artikel/klapptisch-310c");
    await expect(page.getByRole("heading", { name: "Tischaufstellung im Raum ausprobieren" })).toBeVisible();
    await expect(page.getByText(/pauschale Traglast/)).toHaveCount(0);

    await page.goto("/wissen/tischplatten-und-kanten");
    await page.getByText("Ist HPL grundsätzlich besser als Melamin?").click();
    await expect(page.getByText(/Ja, immer\. HPL ist mindestens dreimal so belastbar/)).toBeVisible();
  });

  test("rendert alle Ratgeber über ihre internen Routen mit SEO und Breadcrumbs", async ({ page }) => {
    for (const guide of getPublishedGuides()) {
      await page.goto(`/wissen/${guide.slug}`);
      await expect(page.getByRole("heading", { level: 1, name: guide.title })).toBeVisible();
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/wissen/${guide.slug}$`));
      await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText("Wissen");
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

  test("verlinkt alle Themenkarten auf veröffentlichte Inhalte", async ({ page }) => {
    await page.goto("/wissen");
    for (const name of ["Stapelstühle", "Reihenbestuhlung", "Transport & Lagerung", "Pflege & Ersatzteile"]) {
      const card = page.getByRole("article").filter({ has: page.getByRole("heading", { name, exact: true }) });
      await expect(card.getByRole("link")).toHaveCount(1);
    }
  });

  test("hält Maße und Modell-210-Grenze in der zentralen Datenquelle korrekt", () => {
    expect(standardTableDimensions).toHaveLength(12);
    const ratio = (length: number, width: number) => standardTableDimensions.find((item) => item.length === length && item.width === width)?.ratioTwoToOne;
    expect(ratio(140, 70)).toBe(true);
    expect(ratio(150, 75)).toBe(true);
    expect(ratio(160, 80)).toBe(true);
    expect(ratio(160, 70)).toBe(false);
    expect(modelSpecific.table210.largestAdvertisedFormatCm).toEqual({ length: 140, width: 70 });
    expect(standardTableDimensions.filter((item) => item.length > 140).length).toBeGreaterThan(0);
  });

  test("veröffentlicht keine offenen Zertifikats- oder Traglastzusagen", () => {
    expect(verificationNeeded.gsCertificatesByChairModel).toBe(true);
    expect(verificationNeeded.b1CertificateByFabricAndUpholsteryAssembly).toBe(true);
    expect(verificationNeeded.staticTableLoad).toBe(true);
    const publicCopy = JSON.stringify(getPublishedGuides());
    expect(publicCopy).not.toContain("100 kg");
    expect(publicCopy).not.toContain("GS-geprüft");
    expect(publicCopy).not.toContain("35 Jahre");
    expect(publicCopy).not.toContain("Panikvorschrift");
  });

  test("verweist nur auf erreichbare interne Ziele", async ({ request }) => {
    const guides: readonly GuideArticle[] = getPublishedGuides();
    const hrefs = new Set(guides.flatMap((guide) => [
      ...guide.relatedLinks.map((link) => link.href),
      ...guide.body.flatMap((section) => [
        ...(section.link ? [section.link.href] : []),
        ...(section.links?.map((link) => link.href) ?? []),
      ]),
    ]));
    for (const href of hrefs) {
      const response = await request.get(href);
      expect(response.status(), href).toBeLessThan(400);
    }
  });

  test("bleibt auf allen Wissensrouten mobil und am Desktop ohne horizontalen Überlauf", async ({ page }) => {
    const routes = [
      "/wissen",
      "/wissen/stapelstuehle-richtig-auswaehlen",
      "/wissen/reihenverbinder-fuer-stapelstuehle",
      "/wissen/transport-lagerung-pflege",
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
