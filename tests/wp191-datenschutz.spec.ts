import { expect, test } from "@playwright/test";

const LEGACY_PRICE_KEY = "dlmns-customer-price-mode";

test("Preispräferenz bleibt im React-State und entfernt alte dauerhafte Einträge", async ({ page }) => {
  await page.addInitScript(([key]) => localStorage.setItem(key, "private"), [LEGACY_PRICE_KEY]);
  await page.goto("/produkte");

  await expect(page.getByRole("button", { name: "Geschäftskunden · netto" })).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), LEGACY_PRICE_KEY)).toBeNull();

  await page.getByRole("button", { name: "Privatkunden · brutto" }).click();
  await expect(page.getByRole("button", { name: "Privatkunden · brutto" })).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate((key) => localStorage.getItem(key), LEGACY_PRICE_KEY)).toBeNull();

  await page.reload();
  await expect(page.getByRole("button", { name: "Geschäftskunden · netto" })).toHaveAttribute("aria-pressed", "true");
});

test("Formular-APIs lehnen fremde Origins vor der Verarbeitung ab", async ({ request }) => {
  const contact = await request.post("/api/contact", {
    headers: { origin: "https://example.invalid" },
    data: {},
  });
  expect(contact.status()).toBe(403);

  const inquiry = await request.post("/api/inquiry", {
    headers: { origin: "https://example.invalid" },
    data: {},
  });
  expect(inquiry.status()).toBe(403);
});

test("Produktion versendet ohne aktivierten verteilten Formularschutz nicht", async ({ page }) => {
  await page.goto("/");
  const response = await page.evaluate(async (data) => {
    const result = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return { status: result.status, body: await result.json() };
  }, {
      firstName: "Erika",
      lastName: "Musterfrau",
      email: "erika@example.test",
      phone: "",
      organization: "Test",
      subject: "Technischer Test",
      message: "Diese synthetische Anfrage darf nicht versendet werden.",
      submissionId: "wp191-test-request-0001",
      website: "",
  });
  expect(response.status).toBe(503);
  expect(response.body).toMatchObject({ error: expect.stringContaining("nicht verfügbar") });
});
