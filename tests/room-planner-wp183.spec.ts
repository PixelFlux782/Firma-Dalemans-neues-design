import { expect, test, type Page } from "@playwright/test";

const HELP_KEY = "dlmns-room-planner-help-v1";

async function returningVisitor(page: Page) {
  await page.addInitScript(([key]) => localStorage.setItem(key, JSON.stringify({ onboardingSeen: true, dismissed: [] })), [HELP_KEY]);
}

test("WP18.3 zeigt Erstnutzern ein kompaktes, überspringbares Onboarding", async ({ page }, testInfo) => {
  await page.goto("/raumplaner");
  const onboarding = page.getByRole("dialog", { name: /Einführung: Raum zeichnen/ });
  await expect(onboarding).toBeVisible();
  await expect(onboarding).toContainText("Schritt 1 von 4");
  await expect(page.getByRole("button", { name: "Raum", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.screenshot({ path: testInfo.outputPath("onboarding-desktop.png"), fullPage: true });
  await onboarding.getByRole("button", { name: "Überspringen" }).click();
  await expect(onboarding).toHaveCount(0);
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? "{}").onboardingSkipped, HELP_KEY)).toBe(true);
});

test("WP18.3 führt durch vier reale Werkzeugschritte und lässt sich erneut starten", async ({ page }) => {
  await returningVisitor(page);
  await page.goto("/raumplaner");
  await page.getByRole("button", { name: "Hilfe zum Raumplaner" }).click();
  await page.getByRole("button", { name: "Einführung erneut starten" }).click();
  const onboarding = page.getByRole("dialog", { name: /Einführung:/ });
  await expect(onboarding).toContainText("Raum zeichnen");
  await onboarding.getByRole("button", { name: "Weiter" }).click();
  await expect(onboarding).toContainText("Raum vorbereiten");
  await expect(page.getByRole("button", { name: "Türen", exact: true })).toHaveAttribute("aria-pressed", "true");
  await onboarding.getByRole("button", { name: "Weiter" }).click();
  await expect(onboarding).toContainText("Bestuhlung planen");
  await expect(page.getByRole("button", { name: "Tische", exact: true })).toHaveAttribute("aria-pressed", "true");
  await onboarding.getByRole("button", { name: "Weiter" }).click();
  await expect(onboarding).toContainText("Anpassen und ausgeben");
  await onboarding.getByRole("button", { name: "Loslegen" }).click();
  await expect(onboarding).toHaveCount(0);
});

test("WP18.3 zeigt Werkzeughilfe passend und nach dem Schließen nicht erneut automatisch", async ({ page }) => {
  await returningVisitor(page);
  await page.goto("/raumplaner");
  await page.getByRole("button", { name: "Türen", exact: true }).click();
  const help = page.getByRole("dialog", { name: "Raum zeichnen" });
  await expect(help).toContainText("Beginne damit, deinen Raum zu zeichnen");
  await help.getByRole("button", { name: "Hilfe schließen" }).click();
  await page.getByRole("button", { name: "Gänge", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Raum zeichnen" })).toHaveCount(0);
});

test("WP18.3 erklärt Tisch-Snapping, Tischbereiche und freie Bestuhlung fachlich korrekt", async ({ page }) => {
  await returningVisitor(page);
  await page.goto("/raumplaner");
  const openHelp = async (name: string) => {
    await page.getByRole("button", { name: "Hilfe zum Raumplaner" }).click();
    await page.getByRole("button", { name, exact: true }).click();
  };
  await openHelp("Tische verbinden");
  await expect(page.getByRole("dialog", { name: "Tische magnetisch verbinden" })).toContainText("Alt gedrückt");
  await page.getByRole("button", { name: "Hilfe schließen" }).click();
  await openHelp("Tischbereiche");
  await expect(page.getByRole("dialog", { name: "Tischbereich zeichnen" })).toContainText("mindestens drei Eckpunkte");
  await page.getByRole("button", { name: "Hilfe schließen" }).click();
  await openHelp("Bereich einrichten");
  await expect(page.getByRole("dialog", { name: "Tischbereich einrichten" })).toContainText("Tischen und passenden Stühlen");
  await page.getByRole("button", { name: "Hilfe schließen" }).click();
  await openHelp("Freie Fläche");
  await expect(page.getByRole("dialog", { name: "Freie Fläche bestuhlen" })).toContainText("außerhalb vorhandener Tischbereiche");
});

test("WP18.3 Hilfe bleibt in 2D und 3D erreichbar und Escape schließt nur die Hilfe", async ({ page }) => {
  await returningVisitor(page);
  await page.goto("/raumplaner");
  const helpButton = page.getByRole("button", { name: "Hilfe zum Raumplaner" });
  await expect(helpButton).toBeVisible();
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await expect(helpButton).toBeVisible();
  await helpButton.click();
  await expect(page.getByRole("dialog", { name: "Kurzanleitung" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Kurzanleitung" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "3D", exact: true })).toHaveAttribute("aria-pressed", "true");
});

test("WP18.3 Öffnen der Hilfe erzeugt keine Canvas-Interaktion", async ({ page }) => {
  await returningVisitor(page);
  await page.goto("/raumplaner");
  const canvas = page.getByRole("img", { name: "Grundriss Zeichenfläche" });
  await expect(canvas.locator("[data-point-id]")).toHaveCount(0);
  await page.getByRole("button", { name: "Hilfe zum Raumplaner" }).click();
  await page.getByRole("dialog", { name: "Kurzanleitung" }).click({ position: { x: 20, y: 20 } });
  await expect(canvas.locator("[data-point-id]")).toHaveCount(0);
});

test("WP18.3 ist mobil bedienbar und respektiert reduzierte Bewegung", async ({ page }, testInfo) => {
  await returningVisitor(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/raumplaner");
  await page.getByRole("button", { name: "Hilfe zum Raumplaner" }).click();
  const dialog = page.getByRole("dialog", { name: "Kurzanleitung" });
  await expect(dialog).toBeVisible();
  const box = await dialog.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  await dialog.getByRole("button", { name: "Raum zeichnen" }).click();
  const animation = page.locator('[data-animation="room"]');
  await expect(animation).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("help-mobile-reduced-motion.png"), fullPage: true });
  expect(await animation.locator("path").first().evaluate(element => getComputedStyle(element).animationName)).toBe("none");
});
