import { expect, test } from "@playwright/test";

test("Startseite enthält keinen Entwicklungsstatus", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/Website in Entwicklung/i)).toHaveCount(0);
});

test("Produktübersicht veröffentlicht keine Kategorie ohne Bild", async ({ page }) => {
  await page.goto("/produkte");
  await expect(page.getByText("Bild folgt", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Klappstühle", exact: true })).toHaveCount(0);
});

test("Knowledge-Preview hat für fehlende Inhalte einen neutralen Fallback", async ({ request }) => {
  const response = await request.get("/api/knowledge/preview?optionId=table-edge-abs");
  expect(response.status()).toBe(200);
  await expect(response.json()).resolves.toEqual({ entry: null });
});

test("HTML-Antworten enthalten die vorgesehenen Security Header", async ({ request }) => {
  const response = await request.get("/");
  const headers = response.headers();
  expect(headers["content-security-policy-report-only"]).toContain("default-src 'self'");
  expect(headers["strict-transport-security"]).toBe("max-age=31536000");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["permissions-policy"]).toBe("camera=(), geolocation=(), microphone=()");
  expect(headers["cross-origin-opener-policy"]).toBe("same-origin");
});
