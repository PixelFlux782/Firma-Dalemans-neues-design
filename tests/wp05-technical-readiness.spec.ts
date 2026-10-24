import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

type AxeViolation = {
  id: string;
  impact: string | null;
  description: string;
  nodes: Array<{ target: string[]; failureSummary?: string }>;
};

type CspViolation = {
  blockedURI: string;
  effectiveDirective: string;
  violatedDirective: string;
};

const axePath = path.resolve("node_modules/axe-core/axe.min.js");

async function axeViolations(page: Page) {
  await page.addScriptTag({ path: axePath });
  return page.evaluate(async () => {
    const axe = (window as typeof window & {
      axe: {
        run: (context: Document, options: object) => Promise<{ violations: AxeViolation[] }>;
      };
    }).axe;
    const result = await axe.run(document, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
      },
    });
    return result.violations;
  });
}

test("CSP bleibt minimal und kritische Seiten erzeugen keine Report-only-Verletzung", async ({ page, request }) => {
  const response = await request.get("/");
  const policy = response.headers()["content-security-policy-report-only"];
  expect(policy).toBeTruthy();
  expect(policy).toContain("default-src 'self'");
  expect(policy).toContain("img-src 'self' data: blob:");
  expect(policy).toContain("font-src 'self' data:");
  expect(policy).toContain("connect-src 'self'");
  expect(policy).toContain("worker-src 'self' blob:");
  expect(policy).not.toContain("*");

  const violations: CspViolation[] = [];
  await page.exposeFunction("recordCspViolation", (violation: CspViolation) => violations.push(violation));
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (event) => {
      void (window as typeof window & {
        recordCspViolation: (violation: CspViolation) => Promise<void>;
      }).recordCspViolation({
        blockedURI: event.blockedURI,
        effectiveDirective: event.effectiveDirective,
        violatedDirective: event.violatedDirective,
      });
    });
  });

  for (const route of ["/", "/produkte", "/produkte/stapelstuehle/1021", "/anfrage", "/raumplaner"]) {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    if (route === "/raumplaner") {
      const editor = page.getByRole("region", { name: "2D-Grundrisseditor" });
      await editor.getByRole("button", { name: "3D", exact: true }).click();
      await expect(editor.getByLabel("3D-Raumansicht")).toBeVisible();
      await page.waitForTimeout(500);
    }
  }

  expect(violations).toEqual([]);
});

for (const viewport of [
  { name: "Desktop", width: 1440, height: 900 },
  { name: "Mobil", width: 390, height: 844 },
]) {
  test(`Axe meldet im Raumplaner keine WCAG-A/AA-Verletzung (${viewport.name})`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/raumplaner");
    await expect(page.getByRole("region", { name: "2D-Grundrisseditor" })).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
  });
}

test("Raumplaner-Werkzeuge und SVG-Bedienelemente sind per Tastatur erreichbar", async ({ page }) => {
  await page.goto("/raumplaner");
  const editor = page.getByRole("region", { name: "2D-Grundrisseditor" });
  const doors = editor.getByLabel("Werkzeuge", { exact: true }).getByRole("button", { name: "Türen" });
  await doors.focus();
  await doors.press("Enter");
  await expect(doors).toHaveAttribute("aria-pressed", "true");
  await expect(editor.getByRole("group", { name: "Türen Optionen" })).toBeVisible();
  await editor.getByRole("button", { name: "Werkzeugoptionen schließen" }).click();

  await editor.getByLabel("Werkzeuge", { exact: true }).getByRole("button", { name: "Raum" }).click();
  const canvas = editor.getByRole("img", { name: /Grundriss Zeichenfl/ });
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  const left = Math.round(box!.width * 0.24);
  const right = Math.round(box!.width * 0.68);
  const top = Math.round(box!.height * 0.3);
  const bottom = Math.round(box!.height * 0.76);
  for (const position of [
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom },
    { x: left, y: top },
  ]) await canvas.click({ position });

  const wallMeasurement = editor.getByRole("button", { name: /Wandlänge .* bearbeiten/ }).first();
  await wallMeasurement.focus();
  await wallMeasurement.press("Enter");
  await expect(editor.getByRole("textbox", { name: "Wandlänge in Metern" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(editor.getByRole("textbox", { name: "Wandlänge in Metern" })).toHaveCount(0);
});
