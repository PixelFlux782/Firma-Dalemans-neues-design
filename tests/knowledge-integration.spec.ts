import { expect, test } from "@playwright/test";
import {
  getKnowledgeEntriesByOptionId,
  getKnowledgeEntryById,
} from "../src/lib/knowledge";
import { getKnowledgeOptionIdForProductOption } from "../src/lib/knowledge/product-options";

test.describe("Wissenszuordnung in Konfiguratoren", () => {
  test("ordnet die tatsächlichen Stoffgruppen ausschließlich zentralen Einträgen zu", () => {
    for (const group of [2, 3, 4]) {
      const optionId = getKnowledgeOptionIdForProductOption("Stoffgruppe", `Gruppe ${group}`);
      expect(optionId).toBe(`fabric-group-${group}`);
      expect(getKnowledgeEntriesByOptionId(optionId!)[0]?.id).toBe(`fabric-group-${group}`);
      expect(getKnowledgeEntryById(`fabric-group-${group}`)?.title).toBe(`Stoffgruppe ${group}`);
    }
  });

  test("öffnet jede Stoffgruppen-Vorschau, ohne Auswahl oder Preis zu verändern", async ({ page }) => {
    await page.goto("/produkte/stapelstuehle/1021");
    await page.getByRole("radio", { name: /Sitzpolster/ }).check({ force: true });
    await expect(page.getByRole("radio", { name: "Gruppe 2" })).toBeChecked();
    const originalPrice = await page.getByTestId("chair-price").textContent();

    for (const group of [2, 3, 4]) {
      const trigger = page.getByRole("button", { name: `Informationen zu Stoffgruppe ${group} öffnen` });
      await expect(trigger).toBeVisible();
      await trigger.click();
      const dialog = page.getByRole("dialog", { name: `Informationen zu Stoffgruppe ${group}` });
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole("heading", { name: `Stoffgruppe ${group}` })).toBeVisible();
      await expect(dialog.getByRole("link", { name: /Mehr erfahren/ })).toHaveAttribute(
        "href",
        `/wissen/stoffe-polster/stoffgruppe-${group}`,
      );
      await dialog.getByRole("button", { name: "Schließen" }).click();
      await expect(dialog).toHaveCount(0);
    }

    await expect(page.getByRole("radio", { name: "Gruppe 2" })).toBeChecked();
    await expect(page.getByTestId("chair-price")).toHaveText(originalPrice!);
  });

  test("schließt über Escape und Außenklick und führt den Fokus zurück", async ({ page }) => {
    await page.goto("/produkte/stapelstuehle/1021?polster=sitz&gruppe=3&reihe=nein");
    const trigger = page.getByRole("button", { name: "Informationen zu Stoffgruppe 3 öffnen" });
    await expect(trigger).toBeVisible();

    await trigger.click();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(trigger).toBeFocused();

    await trigger.click();
    await page.getByRole("button", { name: "Informationsansicht schließen" }).click({ position: { x: 2, y: 2 } });
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("radio", { name: "Gruppe 3" })).toBeChecked();
  });

  test("zeigt mobil ein bedienbares Bottom Sheet", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/produkte/stapelstuehle/1021?polster=sitz&gruppe=2&reihe=nein");
    await page.getByRole("button", { name: "Informationen zu Stoffgruppe 2 öffnen" }).click();
    const dialog = page.getByRole("dialog", { name: "Informationen zu Stoffgruppe 2" });
    await expect(dialog).toBeVisible();
    const box = await dialog.boundingBox();
    expect(box).not.toBeNull();
    expect(Math.abs((box?.y ?? 0) + (box?.height ?? 0) - 844)).toBeLessThanOrEqual(1);
    await dialog.getByRole("button", { name: "Schließen" }).click();
    await expect(dialog).toHaveCount(0);
  });

  test("lässt Tischkanten ohne Wissenseintrag unverändert und zeigt keinen falschen Trigger", async ({ page }) => {
    expect(getKnowledgeOptionIdForProductOption("Kantenart", "ABS")).toBe("table-edge-abs");
    expect(getKnowledgeEntriesByOptionId("table-edge-abs")).toHaveLength(0);
    expect(getKnowledgeEntriesByOptionId("table-edge-beech-natural")).toHaveLength(0);

    await page.goto("/produkte/artikel/klapptisch-310c");
    await expect(page.getByRole("button", { name: "Informationen zu Tischkante ABS öffnen" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Informationen zu Tischkante Buche natur öffnen" })).toHaveCount(0);
    await page.getByRole("button", { name: "Buche natur", exact: true }).click();
    await expect(page.getByTestId("selected-variant")).toContainText("Buche natur");
  });
});
