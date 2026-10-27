import { expect, test } from "@playwright/test";

test("Formular-APIs begrenzen tatsächliche Request-Bodies", async ({ request }) => {
  const oversized = JSON.stringify({ message: "x".repeat(36_000) });
  const contact = await request.post("/api/contact", {
    data: oversized,
    headers: { "content-type": "application/json" },
  });
  expect(contact.status()).toBe(413);

  const inquiry = await request.post("/api/inquiry", {
    data: oversized,
    headers: { "content-type": "application/json" },
  });
  expect(inquiry.status()).toBe(413);
});

test("Kontakt-API behandelt ungültiges JSON kontrolliert und Honeypot ohne Versand", async ({ request }) => {
  const invalid = await request.post("/api/contact", {
    data: "{",
    headers: { "content-type": "application/json" },
  });
  expect(invalid.status()).toBe(400);

  const honeypot = await request.post("/api/contact", {
    data: { website: "bot.example" },
  });
  expect(honeypot.status()).toBe(200);
  await expect(honeypot.json()).resolves.toEqual({ ok: true });
});

test("Security Header bleiben global im vorgesehenen Report-only-Modus", async ({ request }) => {
  const response = await request.get("/kontakt");
  const headers = response.headers();
  expect(headers["content-security-policy-report-only"]).toContain("default-src 'self'");
  expect(headers["content-security-policy"]).toBeUndefined();
  expect(headers["strict-transport-security"]).toBe("max-age=31536000");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
});

test("Kontaktformular sendet eine technische Anfragekennung und sperrt Doppelklicks", async ({ page }) => {
  const submissions: Array<Record<string, unknown>> = [];
  await page.route("**/api/contact", async (route) => {
    submissions.push(route.request().postDataJSON() as Record<string, unknown>);
    await new Promise((resolve) => setTimeout(resolve, 150));
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });
  await page.goto("/kontakt");
  await page.getByLabel(/^Vorname/).fill("Erika");
  await page.getByLabel(/^Nachname/).fill("Musterfrau");
  await page.getByLabel(/^E-Mail/).fill("erika@example.test");
  await page.getByLabel(/^Nachricht/).fill("Nicht versendete WP07-Testanfrage.");
  await page.getByRole("button", { name: "Anfrage senden" }).dblclick();
  await expect(page.getByText(/Vielen Dank/)).toBeVisible();
  expect(submissions).toHaveLength(1);
  expect(submissions[0].submissionId).toMatch(/^[a-zA-Z0-9_-]{16,100}$/);
});
