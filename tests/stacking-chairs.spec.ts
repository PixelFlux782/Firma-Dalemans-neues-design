import { expect, test } from "@playwright/test";
import { localStackingChairProducts } from "../src/lib/commerce/providers/local-stacking-chairs";
import {
  resolveChairVariant,
  type ChairConfiguration,
  type ChairFabricGroup,
} from "../src/lib/commerce/stacking-chairs";
import {
  CHAIR_ADDONS,
  chairAddonBySku,
  chairAddonPriceForQuantity,
  isChairAddonCompatible,
} from "../src/lib/commerce/chair-addons";
import { FABRIC_COLLECTIONS } from "../src/lib/fabrics";

const configurations: ChairConfiguration[] = [
  { upholstery: "none", rowConnector: false },
  { upholstery: "none", rowConnector: true },
  ...([2, 3, 4] as ChairFabricGroup[]).flatMap((fabricGroup) => [
    { upholstery: "seat" as const, fabricGroup, rowConnector: false },
    { upholstery: "seat" as const, fabricGroup, rowConnector: true },
    { upholstery: "seat-back" as const, fabricGroup, rowConnector: false },
    { upholstery: "seat-back" as const, fabricGroup, rowConnector: true },
  ]),
];

test.describe("provider-neutrales Stapelstuhlmodell", () => {
  test("enthält fünf Modelle und nur die in Export_Flo belegten Varianten", () => {
    expect(localStackingChairProducts.map((product) => product.stackingChair?.modelCode)).toEqual([
      "1021", "Bünde", "Coburg", "Nürnberg", "Erfurt",
    ]);
    expect(localStackingChairProducts.map((product) => product.variants.length)).toEqual([14, 14, 14, 14, 8]);
    expect(localStackingChairProducts.flatMap((product) => product.variants)).toHaveLength(64);
  });

  test("löst alle 14 Konfigurationen von Modell 1021 eindeutig auf", () => {
    const product = localStackingChairProducts.find((entry) => entry.handle === "1021");
    expect(product).toBeTruthy();
    if (!product) return;

    const ids = configurations.map((configuration) => resolveChairVariant(product, configuration)?.id);
    const prices = configurations.map((configuration) => resolveChairVariant(product, configuration)?.price?.amount);
    expect(ids.every(Boolean)).toBe(true);
    expect(new Set(ids).size).toBe(14);
    expect(prices).toEqual([
      "67.13", "70.75",
      "84.25", "87.88", "97.13", "100.75",
      "87.50", "91.13", "101.25", "104.88",
      "88.88", "92.50", "102.50", "106.13",
    ]);
    expect(resolveChairVariant(product, { upholstery: "none", fabricGroup: 2, rowConnector: false })).toBeNull();
  });

  test("ordnet allen Preisstufen die dokumentierten Mengengrenzen zu", () => {
    for (const product of localStackingChairProducts) {
      for (const variant of product.variants) {
        expect(variant.priceTiers).toHaveLength(3);
        expect(variant.priceTiers?.map((tier) => [tier.minimumQuantity, tier.maximumQuantity])).toEqual([[1, 100], [101, 250], [251, null]]);
        expect(variant.erpArticleNumber).toBeTruthy();
      }
    }
  });

  test("stellt für jedes gepolsterte Stuhlmodell ausschließlich die Gruppen 2, 3 und 4 bereit", () => {
    for (const product of localStackingChairProducts) {
      const upholsteredGroups = [...new Set(product.variants.flatMap((variant) => {
        const configuration = variant.selectedOptions.find((option) => option.name === "Stoffgruppe")?.value;
        return configuration ? [Number(configuration.replace("Gruppe ", ""))] : [];
      }))].sort();
      expect(upholsteredGroups, product.handle).toEqual([2, 3, 4]);
    }
    expect(FABRIC_COLLECTIONS.map((collection) => [collection.group, collection.name])).toEqual([
      [2, "Bondai"],
      [3, "Radio"], [3, "Pisa"], [3, "Xtreme"], [3, "X2"], [3, "King Flex"],
      [3, "King L"], [3, "Era"], [3, "Advantage"], [3, "Pulfero"],
      [4, "Pure"], [4, "Mini"],
    ]);
  });

  test("übernimmt sieben Erweiterungen und die Buchablagen-Staffeln aus Export_Flo", () => {
    expect(CHAIR_ADDONS.map((addon) => addon.sku)).toEqual([
      "APRV", "APGSTR22", "A1021FG", "A1021TG", "A1021BEI", "AP1021GRL", "BU1021C",
    ]);
    expect(chairAddonPriceForQuantity(chairAddonBySku("A1021FG")!, 251)?.amount).toBe("6.90");
    const bookTray = chairAddonBySku("BU1021C")!;
    expect([100, 101, 250, 251].map((quantity) =>
      chairAddonPriceForQuantity(bookTray, quantity)?.amount,
    )).toEqual(["27.50", "26.87", "26.87", "26.45"]);
  });

  test("kann Erweiterungen zentral auf Modelle und Varianten beschränken", () => {
    const product = localStackingChairProducts[0];
    const variant = product.variants[0];
    const restricted = {
      ...CHAIR_ADDONS[0],
      compatibleModels: ["1021"],
      compatibleVariants: [variant.id],
    };
    expect(isChairAddonCompatible(restricted, "1021", variant)).toBe(true);
    expect(isChairAddonCompatible(restricted, "Coburg", variant)).toBe(false);
    expect(isChairAddonCompatible(restricted, "1021", product.variants[1])).toBe(false);
  });

  test("erlaubt das Griffloch bei allen Modellen nur ungepolstert und mit Sitzpolster", () => {
    const grip = chairAddonBySku("AP1021GRL")!;
    for (const product of localStackingChairProducts) {
      const none = resolveChairVariant(product, { upholstery: "none", rowConnector: false });
      const seat = resolveChairVariant(product, { upholstery: "seat", fabricGroup: 2, rowConnector: false });
      const full = resolveChairVariant(product, { upholstery: "seat-back", fabricGroup: 2, rowConnector: false });
      expect(isChairAddonCompatible(grip, product.stackingChair?.modelCode, none), `${product.handle}: ungepolstert`).toBe(true);
      expect(isChairAddonCompatible(grip, product.stackingChair?.modelCode, seat), `${product.handle}: Sitzpolster`).toBe(true);
      expect(isChairAddonCompatible(grip, product.stackingChair?.modelCode, full), `${product.handle}: Vollpolster`).toBe(false);
    }
  });

  test("ordnet Variantenbilder über die ERP-Artikelnummern aus Export_Flo zu", () => {
    const expectedImages: Record<string, string | null> = {
      A1021ACO: "Stapelstuhl_1021_ungepolstert.png",
      A1021BCO2: "Stapelstuhl_1021_sitzpolster.png",
      A1021BCO3: "Stapelstuhl_1021_sitzpolster.png",
      A1021BCO4: "Stapelstuhl_1021_sitzpolster.png",
      A1021CCO2: "Stapelstuhl_1021_c_lila-stuhl.png",
      A1021CCO3: "Stapelstuhl_1021_c_lila-stuhl.png",
      A1021CCO4: "Stapelstuhl_1021_c_lila-stuhl.png",
      ABUNDACO: "Stapelstuhl_Buende_a.png",
      ABUNDBCO2: "Stapelstuhl_buende_sitzpolster.png",
      ABUNDBCO3: "Stapelstuhl_buende_sitzpolster.png",
      ABUNDBCO4: "Stapelstuhl_buende_sitzpolster.png",
      ABUNDCCO2: "Stapelstuhl_buende_c.png",
      ABUNDCCO3: "Stapelstuhl_buende_c.png",
      ABUNDCCO4: "Stapelstuhl_buende_c.png",
      ACOBUACO: "Stapelstuhl_Coburg_ungepolstert.png",
      ACOBUBCO2: "Stapelstuhl_Coburg_a.png",
      ACOBUBCO3: "Stapelstuhl_Coburg_a_mehrere-löcher.png",
      ACOBUBCO4: "Stapelstuhl_Coburg_a_ovales-griffloch.png",
      ACOBUCCO2: "Stapelstuhl_Coburg_sitz_rueckenpolster.png",
      ACOBUCCO3: "Stapelstuhl_Coburg_sitz_rueckenpolster.png",
      ACOBUCCO4: "Stapelstuhl_Coburg_sitz_rueckenpolster.png",
      ANURNACO: "Stapelstuhl_Nuernberg_a.png",
      ANURNBCO2: "Stapelstuhl_Nuernberg_a_GL.png",
      ANURNBCO3: "Stapelstuhl_Nuernberg_a_GL.png",
      ANURNBCO4: "Stapelstuhl_Nuernberg_a_GL.png",
      ANURNCCO2: "Stapelstuhl_Nuernberg_c.png",
      ANURNCCO3: "Stapelstuhl_Nuernberg_c_2.png",
      ANURNCCO4: "Stapelstuhl_Nuernberg_c_02.png",
      AERFUACO: "Stapelstuhl_Erfurt_a.png",
      AERFUBCO2: "Stapelstuhl_Erfurt_b.png",
      AERFUBCO3: "Stapelstuhl_Erfurt_b.png",
      AERFUBCO4: "Stapelstuhl_Erfurt_b.png",
    };

    const variantsByArticle = new Map(
      localStackingChairProducts
        .flatMap((product) => product.variants)
        .map((variant) => [variant.erpArticleNumber, variant]),
    );

    for (const [articleNumber, filename] of Object.entries(expectedImages)) {
      const variant = variantsByArticle.get(articleNumber);
      expect(variant, articleNumber).toBeTruthy();
      expect(variant?.image?.url ?? null, articleNumber).toBe(
        filename ? encodeURI(`/neue bilder/Stapelstühle/neu_beschriftet/${filename}`) : null,
      );
    }
  });

  test("ergänzt das zentral zugeordnete Bogengestell-Bild bei jedem Modell am Galerieende", () => {
    const bowFrameUrl = encodeURI("/neue bilder/Stapelstühle/reihenverbinder/Bogengestell_22_mm-optimiert.webp");
    for (const product of localStackingChairProducts) {
      expect(product.images.at(-1)?.url, product.handle).toBe(bowFrameUrl);
      expect(product.images.filter((image) => image.url === bowFrameUrl), product.handle).toHaveLength(1);
      expect(product.featuredImage?.url, product.handle).not.toBe(bowFrameUrl);
    }
  });
});

test.describe("Stapelstuhl-Hub", () => {
  test("zeigt genau fünf Modelle statt 70 Einzelkarten und verlinkt die Modellseiten", async ({ page }) => {
    await page.goto("/produkte/stapelstuehle");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Stapelstühle für flexible Räume.");
    await expect(page.getByRole("link", { name: "Modell ansehen" })).toHaveCount(5);
    for (const handle of ["1021", "buende", "coburg", "nuernberg", "erfurt"]) {
      await expect(page.locator(`a[href="/produkte/stapelstuehle/${handle}"]`).first()).toBeVisible();
    }
    await expect(page.getByTestId("chair-comparison")).toBeVisible();
  });

  test("Vergleich lässt bis zu drei Modelle per Tastatur auswählen", async ({ page }) => {
    await page.goto("/produkte/stapelstuehle");
    const coburg = page.getByRole("button", { name: /Coburg/ });
    await coburg.focus();
    await coburg.press("Space");
    await expect(coburg).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("chair-comparison").getByRole("heading", { name: "Coburg" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Nürnberg/ })).toBeDisabled();
  });
});

test.describe("Modell 1021 Konfigurator", () => {
  test("schaltet das Bogengestell-Bild bei allen Modellen automatisch und manuell ohne Reload", async ({ page }) => {
    for (const [index, handle] of ["1021", "buende", "coburg", "nuernberg", "erfurt"].entries()) {
      await page.setViewportSize(index === 4 ? { width: 360, height: 800 } : { width: 1280, height: 900 });
      await page.goto(`/produkte/stapelstuehle/${handle}`);
      const gallery = page.getByTestId("chair-gallery");
      const mainImage = gallery.locator(".product-visual__product img");
      const standardImageUrl = await mainImage.getAttribute("src");
      const standardImageAlt = await mainImage.getAttribute("alt");
      const bowFrame = page.getByRole("checkbox", { name: /Bogengestell, 22 mm/ });
      const bowFrameThumbnail = gallery.getByRole("button", { name: /Stapelstuhl mit Bogengestell aus 22-mm-Rohr/ });

      await expect(bowFrameThumbnail).toBeVisible();
      await bowFrame.check({ force: true });
      await expect(mainImage).toHaveAttribute("alt", "Stapelstuhl mit Bogengestell aus 22-mm-Rohr");
      await expect(bowFrameThumbnail).toHaveAttribute("aria-pressed", "true");

      await bowFrame.uncheck({ force: true });
      await expect(mainImage).toHaveAttribute("src", standardImageUrl ?? "");
      await expect(mainImage).toHaveAttribute("alt", standardImageAlt ?? "");

      await bowFrameThumbnail.click();
      await expect(mainImage).toHaveAttribute("alt", "Stapelstuhl mit Bogengestell aus 22-mm-Rohr");
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), handle).toBeLessThanOrEqual(1);
      await expect(page).toHaveURL(new RegExp(`/produkte/stapelstuehle/${handle}`));
    }
  });

  test("zeigt Stoffgruppen nur bei Polsterung und aktualisiert Variante und Preis", async ({ page }) => {
    await page.goto("/produkte/stapelstuehle/1021");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Modell 1021");
    await expect(page.getByTestId("fabric-group-selector")).toHaveCount(0);
    await expect(page.getByTestId("chair-price")).toContainText("67,13");

    const seatUpholstery = page.getByRole("radio", { name: /Sitzpolster/ });
    await seatUpholstery.focus();
    await seatUpholstery.press("Space");
    await expect(page.getByTestId("fabric-group-selector")).toBeVisible();
    const groupThree = page.getByRole("radio", { name: "Gruppe 3" });
    await groupThree.focus();
    await groupThree.press("Space");
    const withRowConnector = page.getByRole("checkbox", { name: /Reihenverbindung/ });
    await withRowConnector.focus();
    await withRowConnector.press("Space");
    await expect(page.getByTestId("selected-chair-variant")).toContainText("Sitzpolster · Gruppe 3 · Mit Reihenverbindung");
    await expect(page.getByTestId("chair-price")).toContainText("91,13");
    await expect.poll(() => {
      const params = new URL(page.url()).searchParams;
      return [params.get("polster"), params.get("gruppe"), params.get("reihe")];
    }).toEqual(["sitz", "3", "ja"]);
  });

  test("zeigt in allen Stoffgruppen die zentralen Kollektionen, aber nie Gruppen 5 oder 6", async ({ page }) => {
    await page.goto("/produkte/stapelstuehle/1021?polster=sitz&gruppe=2");
    await expect(page.locator('input[name="fabricGroup"]')).toHaveCount(3);
    await expect(page.locator('input[name="fabricGroup"][value="5"], input[name="fabricGroup"][value="6"]')).toHaveCount(0);

    await page.getByRole("button", { name: "Materialberater für Stoffgruppe 2 öffnen" }).click();
    const dialog = page.getByTestId("fabric-dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: /Bondai/ })).toBeVisible();

    await dialog.getByRole("button", { name: "Gruppe 3" }).click();
    for (const collection of ["Radio", "Pisa", "Xtreme", "X2", "King Flex", "King L", "Era", "Advantage", "Pulfero"]) {
      await expect(dialog.getByRole("button", { name: new RegExp(`^${collection}`) })).toBeVisible();
    }

    await dialog.getByRole("button", { name: "Gruppe 4" }).click();
    await expect(dialog.getByRole("button", { name: /^Pure/ })).toBeVisible();
    await expect(dialog.getByRole("button", { name: /^Mini/ })).toBeVisible();
  });

  test("behält Kollektion und Farbcode im Zustand und übernimmt sie in die Stoffmuster-Anfrage", async ({ page }) => {
    await page.goto("/produkte/stapelstuehle/1021?polster=sitz&gruppe=3");
    await page.getByRole("button", { name: "Materialberater für Stoffgruppe 3 öffnen" }).click();
    const dialog = page.getByTestId("fabric-dialog");
    await dialog.getByRole("button", { name: /^Xtreme/ }).click();
    await dialog.getByRole("button", { name: /Ocean.*Farbcode 3100/ }).click();
    await expect(page.getByTestId("selected-fabric")).toContainText("Xtreme · Ocean · 3100");
    await expect(page.getByRole("button", { name: "Mit Stoffauswahl bitte anfragen" })).toBeDisabled();
    await expect.poll(() => {
      const params = new URL(page.url()).searchParams;
      return [params.get("stoff"), params.get("farbe")];
    }).toEqual(["xtreme", "3100"]);

    await dialog.getByRole("link", { name: "Stoffmuster anfragen" }).click();
    await expect(page).toHaveURL(/\/kontakt\?.*#anfrage$/);
    await expect(page.locator("textarea[name=message]")).toHaveValue(/Modell: 1021[\s\S]*Stoffgruppe: 3[\s\S]*Stoffkollektion: Xtreme[\s\S]*Farbe: Ocean[\s\S]*Farbcode: 3100/);
  });

  test("öffnet alle zwölf Farbkarten ausschließlich über lokale PDF-Pfade", async ({ page }) => {
    const groups = [
      { group: 2, cards: [["Bondai", "bondai"]] },
      { group: 3, cards: [["Radio", "radio"], ["Pisa", "pisa"], ["Xtreme", "xtreme"], ["X2", "x2"], ["King Flex", "king-flex"], ["King L", "king-l"], ["Era", "era"], ["Advantage", "advantage"], ["Pulfero", "pulfero"]] },
      { group: 4, cards: [["Pure", "pure"], ["Mini", "mini"]] },
    ] as const;

    for (const { group, cards } of groups) {
      await page.goto(`/produkte/stapelstuehle/1021?polster=sitz&gruppe=${group}`);
      await page.getByRole("button", { name: `Materialberater für Stoffgruppe ${group} öffnen` }).click();
      const dialog = page.getByTestId("fabric-dialog");
      for (const [name, id] of cards) {
        await dialog.getByRole("button", { name: new RegExp(`^${name}`) }).click();
        await dialog.getByRole("button", { name: "Farbkarte & technische Daten öffnen" }).click();
        const preview = dialog.getByTestId("fabric-color-card-preview");
        const localPath = `/materials/fabrics/${id}.pdf`;
        const pdfResponse = await page.request.get(localPath);
        expect(pdfResponse.ok()).toBe(true);
        expect(pdfResponse.headers()["content-type"]).toContain("application/pdf");
        await expect(preview).toBeVisible();
        await expect(preview.getByTestId("fabric-color-card-document")).toHaveAttribute("src", localPath);
        for (const link of await preview.getByRole("link", { name: /neuem Tab öffnen/ }).all()) {
          await expect(link).toHaveAttribute("href", localPath);
        }
        await preview.getByRole("button", { name: "Farbkarte schließen und zum Materialberater zurückkehren" }).click();
      }
    }
  });

  test("behält Stoff- und Farbauswahl beim Zurückkehren aus der Farbkarte", async ({ page }) => {
    await page.goto("/produkte/stapelstuehle/1021?polster=sitz&gruppe=3");
    await page.getByRole("button", { name: "Materialberater für Stoffgruppe 3 öffnen" }).click();
    const dialog = page.getByTestId("fabric-dialog");
    await dialog.getByRole("button", { name: /^Xtreme/ }).click();
    await dialog.getByRole("button", { name: /Ocean.*Farbcode 3100/ }).click();

    await dialog.getByRole("button", { name: "Farbkarte & technische Daten öffnen" }).click();
    const preview = dialog.getByTestId("fabric-color-card-preview");
    await expect(preview).toBeVisible();
    await expect(preview.getByTestId("fabric-color-card-document")).toHaveAttribute("src", "/materials/fabrics/xtreme.pdf");
    await expect(preview.getByRole("link", { name: /In neuem Tab öffnen/ }).first()).toHaveAttribute("href", "/materials/fabrics/xtreme.pdf");
    await preview.getByRole("button", { name: "Farbkarte schließen und zum Materialberater zurückkehren" }).click();

    await expect(preview).not.toBeVisible();
    await expect(dialog.getByRole("button", { name: "Farbkarte & technische Daten öffnen" })).toBeFocused();
    await expect(dialog.getByRole("button", { name: /Ocean.*Farbcode 3100/ })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("selected-fabric")).toContainText("Xtreme · Ocean · 3100");
  });

  test("Materialdialog ist mobil bedienbar und schließt per Escape", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("/produkte/stapelstuehle/1021?polster=sitz&gruppe=4");
    const trigger = page.getByRole("button", { name: "Materialberater für Stoffgruppe 4 öffnen" });
    await trigger.click();
    await expect(page.getByTestId("fabric-dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("fabric-dialog")).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await expect(page.getByTestId("fabric-dialog")).toBeVisible();
    await page.mouse.click(8, 8);
    await expect(page.getByTestId("fabric-dialog")).not.toBeVisible();
    await expect(trigger).toBeFocused();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("Farbkartenvorschau ist mobil bedienbar und Escape führt zur Stoffauswahl zurück", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("/produkte/stapelstuehle/1021?polster=sitz&gruppe=4");
    await page.getByRole("button", { name: "Materialberater für Stoffgruppe 4 öffnen" }).click();
    const dialog = page.getByTestId("fabric-dialog");
    await dialog.getByRole("button", { name: /^Pure/ }).click();
    await dialog.getByRole("button", { name: "Farbkarte & technische Daten öffnen" }).click();
    await expect(dialog.getByTestId("fabric-color-card-preview")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog.getByTestId("fabric-color-card-preview")).not.toBeVisible();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: /^Pure/ })).toHaveAttribute("aria-pressed", "true");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("summiert Erweiterungen, reduziert sie wieder und berechnet Menge sowie Buchablagen-Staffeln", async ({ page }) => {
    await page.goto("/produkte/stapelstuehle/1021");
    const price = page.getByTestId("chair-price");
    const total = page.getByTestId("chair-total-price");
    const quantity = page.getByLabel("Menge", { exact: true });
    const felt = page.getByRole("checkbox", { name: /Filzgelenkgleiter/ });
    const carpet = page.getByRole("checkbox", { name: /Teppichboden-Gelenkgleiter/ });
    const bookTray = page.getByRole("checkbox", { name: /Buchablage aus Stahlblech/ });

    await expect(price).toContainText("67,13");
    await felt.check({ force: true });
    await expect(price).toContainText("74,03");
    await carpet.check({ force: true });
    await expect(price).toContainText("80,62");
    await felt.uncheck({ force: true });
    await expect(price).toContainText("73,72");
    await carpet.uncheck({ force: true });
    await bookTray.check({ force: true });

    for (const [amount, expectedUnitPrice, expectedTotal] of [
      [100, "94,63", "9.463,00"],
      [101, "92,92", "9.384,92"],
      [250, "92,92", "23.230,00"],
      [251, "90,89", "22.813,39"],
    ] as const) {
      await quantity.fill(String(amount));
      await expect(price).toContainText(expectedUnitPrice);
      await expect(total).toContainText(expectedTotal);
    }
  });

  test("entfernt ein gewähltes Griffloch beim Wechsel von Sitz- zu Vollpolster", async ({ page }) => {
    await page.goto("/produkte/stapelstuehle/1021?polster=sitz&gruppe=2");
    const grip = page.getByRole("checkbox", { name: /Griffloch im Rückenteil/ });
    await expect(grip).toBeVisible();
    await grip.check({ force: true });
    await expect(grip).toBeChecked();

    await page.locator('input[name="upholstery"][value="seat-back"]').check({ force: true });
    await expect(grip).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Angebot anfragen" })).not.toHaveAttribute("href", /Griffloch/);

    await page.locator('input[name="upholstery"][value="seat"]').check({ force: true });
    await expect(grip).toBeVisible();
    await expect(grip).not.toBeChecked();
  });

  test("validiert die Menge und übernimmt die Konfiguration in die Angebotsanfrage", async ({ page }) => {
    await page.goto("/produkte/stapelstuehle/1021?polster=sitz-ruecken&gruppe=4&reihe=ja");
    const quantity = page.getByLabel("Menge", { exact: true });
    await quantity.fill("80");
    await expect(quantity).toHaveValue("80");

    const quote = page.getByRole("link", { name: "Angebot anfragen" });
    await expect(quote).toHaveAttribute("href", /nachricht=.*Menge%3A\+80/);
    await quote.click();
    await expect(page).toHaveURL(/\/kontakt\?.*#anfrage$/);
    await expect(page.locator("textarea[name=message]")).toHaveValue(/Modell: 1021[\s\S]*Stoffgruppe: 4[\s\S]*Reihenverbindung: ja[\s\S]*Menge: 80/);
  });

  test("normalisiert ungültigen URL-Zustand auf eine gültige Grundausführung", async ({ page }) => {
    await page.goto("/produkte/stapelstuehle/1021?polster=falsch&gruppe=9&reihe=vielleicht");
    await expect(page.getByRole("radio", { name: /Ungepolstert/ })).toBeChecked();
    await expect(page.getByTestId("fabric-group-selector")).toHaveCount(0);
    await expect(page).toHaveURL(/polster=ungepolstert.*reihe=nein/);
    await expect(page).not.toHaveURL(/gruppe=/);
  });

  test("bleibt auf Desktop, Tablet und Mobile ohne horizontalen Überlauf", async ({ page }) => {
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 768, height: 900 },
      { width: 360, height: 800 },
    ]) {
      await page.setViewportSize(viewport);
      for (const route of ["/produkte/stapelstuehle", "/produkte/stapelstuehle/1021"]) {
        await page.goto(route, { waitUntil: "domcontentloaded" });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, `${route} at ${viewport.width}px`).toBeLessThanOrEqual(1);
      }
    }
  });

  test("liefert kanonische Metadaten und Product-/Breadcrumb-Daten", async ({ page }) => {
    await page.goto("/produkte/stapelstuehle/1021?polster=sitz&gruppe=2&reihe=ja");
    await expect(page.locator('link[rel="canonical"]').first()).toHaveAttribute("href", /\/produkte\/stapelstuehle\/1021$/);
    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(jsonLd.some((entry) => entry.includes('"@type":"Product"'))).toBe(true);
    expect(jsonLd.some((entry) => entry.includes('"@type":"BreadcrumbList"'))).toBe(true);
  });
});

test("alte Stapelstuhl-URLs leiten auf die neue kanonische Struktur", async ({ request }) => {
  const category = await request.get("/produkte/kategorien/stapelstuehle", { maxRedirects: 0 });
  expect(category.status()).toBe(308);
  expect(category.headers().location).toBe("/produkte/stapelstuehle");
  const model = await request.get("/produkte/stapelstuhl-mod-1021c", { maxRedirects: 0 });
  expect(model.status()).toBe(308);
  expect(model.headers().location).toBe("/produkte/stapelstuehle/1021");
});
