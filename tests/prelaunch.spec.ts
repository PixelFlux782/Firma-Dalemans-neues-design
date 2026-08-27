import { expect, test } from "@playwright/test";

const routes = [
  "/", "/produkte", "/shop", "/produkte/stapelstuehle",
  "/produkte/kategorien/klapptische", "/produkte/kategorien/transportwagen-zubehoer",
  "/produkte/stapelstuehle/1021", "/produkte/rednerpulte", "/raeume-planung",
  "/raeume-planung/raumplanung", "/beratung-service", "/sonderloesungen",
  "/sonderposten", "/firma", "/kontakt", "/impressum", "/datenschutz",
];

test("alle Sitemap-Routen laden ohne Browser- oder Netzwerkfehler", async ({ page, request }) => {
  test.setTimeout(90_000);
  const failures: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") failures.push(`Konsole: ${message.text()}`);
  });
  page.on("requestfailed", (request) => failures.push(`Request: ${request.url()}`));
  page.on("response", (response) => {
    if (response.status() >= 400) failures.push(`HTTP ${response.status()}: ${response.url()}`);
  });

  const sitemap = await (await request.get("/sitemap.xml")).text();
  const sitemapRoutes = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
  const allRoutes = [...new Set([...routes, ...sitemapRoutes])];

  for (const route of allRoutes) {
    const response = await page.goto(route, { waitUntil: "networkidle" });
    expect(response?.status(), route).toBe(200);
    await expect(page.locator("h1"), route).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]'), route).toHaveCount(1);
    expect(await page.title(), route).not.toBe("");
    expect(await page.locator("img:not([alt])").count(), route).toBe(0);
  }
  expect(failures).toEqual([]);
});

const mobileRoutes = [
  "/", "/produkte", "/shop", "/produkte/stapelstuehle",
  "/produkte/kategorien/klapptische", "/raeume-planung", "/sonderloesungen",
  "/sonderposten", "/firma", "/kontakt", "/shop/gleiter-bodenschutz",
  "/shop/produkt/kunststoff-gestellgleiter",
];

for (const width of [320, 360, 375, 390, 430, 768]) {
  test(`priorisierte Seiten ohne horizontalen Überlauf bei ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 600 ? 760 : 900 });
    for (const route of mobileRoutes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.locator("h1"), route).toHaveCount(1);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, route).toBeLessThanOrEqual(1);
    }
  });
}

test("mobile Buttons und Formularfelder bieten ausreichend große Touch-Ziele", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of mobileRoutes) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    const undersized = await page.locator("button, .btn-primary, .btn-secondary, .btn-on-dark, .btn-outline-dark, .form-input").evaluateAll((elements) =>
      elements
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          const style = window.getComputedStyle(element);
          return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden";
        })
        .filter((element) => element.getBoundingClientRect().height < 42)
        .map((element) => `${element.tagName.toLowerCase()}.${element.className}:${Math.round(element.getBoundingClientRect().height)}px`),
    );
    expect(undersized, route).toEqual([]);
  }
});

test("inhaltliche Seiten-Heroes besitzen konkrete Bildbeschreibungen", async ({ page }) => {
  const heroRoutes = [
    "/produkte", "/produkte/stapelstuehle", "/kontakt", "/firma",
    "/beratung-service", "/raeume-planung", "/sonderloesungen", "/sonderposten",
  ];
  for (const route of heroRoutes) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    const heroImage = page.locator('main img[alt]:not([alt=""])').first();
    await expect(heroImage, route).toHaveAttribute("alt", /\S.{10,}/);
  }
});

test("wichtige Unterseiten liefern BreadcrumbList-Daten", async ({ page }) => {
  for (const route of ["/produkte", "/shop", "/produkte/stapelstuehle", "/raeume-planung", "/kontakt", "/firma"]) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(jsonLd.some((entry) => entry.includes('"BreadcrumbList"')), route).toBe(true);
  }
});

test("mobile Navigation ist per Tastatur bedienbar", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const button = page.getByRole("button", { name: /Menü|Schließen/ });
  await button.click();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(button).toBeFocused();
  await expect(button).toHaveAttribute("aria-expanded", "false");
});

test("Shop ist in Desktop- und Mobile-Navigation erreichbar", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/shop");
  const desktopShopLink = page
    .getByRole("navigation", { name: "Hauptnavigation", exact: true })
    .getByRole("link", { name: "Shop", exact: true });
  await expect(desktopShopLink).toHaveAttribute("href", "/shop");
  await expect(desktopShopLink).toHaveAttribute("aria-current", "page");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Menü" }).click();
  const mobileShopLink = page
    .getByRole("navigation", { name: "Mobile Hauptnavigation" })
    .getByRole("link", { name: "Shop", exact: true });
  await expect(mobileShopLink).toHaveAttribute("href", "/shop");
  await expect(mobileShopLink).toHaveAttribute("aria-current", "page");
});

test("Kontaktformular zeigt eigene deutsche Feldfehler und aktualisiert sie", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/kontakt?anliegen=Beratung");

  const form = page.locator("form");
  const firstName = page.locator("input[name=firstName]");
  const lastName = page.locator("input[name=lastName]");
  const email = page.locator("input[name=email]");
  const phone = page.locator("input[name=phone]");
  const subject = page.locator("input[name=subject]");
  const message = page.locator("textarea[name=message]");

  await expect(form).toHaveAttribute("novalidate", "");
  await expect(subject).toHaveValue("Beratung");
  await expect(form.locator("[role=alert]")).toHaveCount(0);

  for (const field of [firstName, lastName, subject, message]) {
    await expect(field).toHaveAttribute("required", "");
  }
  await expect(page.locator("input[name=organization]")).not.toHaveAttribute("required", "");

  await subject.fill("");
  await page.getByRole("button", { name: "Anfrage senden" }).click();

  await expect(firstName).toBeFocused();
  await expect(page.locator("#firstName-error")).toHaveText("Bitte geben Sie Ihren Vornamen ein.");
  await expect(page.locator("#lastName-error")).toHaveText("Bitte geben Sie Ihren Nachnamen ein.");
  await expect(page.locator("#email-error")).toHaveText("Bitte geben Sie eine E-Mail-Adresse oder Telefonnummer an.");
  await expect(page.locator("#subject-error")).toHaveText("Bitte wählen Sie ein Anliegen aus.");
  await expect(page.locator("#message-error")).toHaveText("Bitte geben Sie eine Nachricht ein.");
  await expect(message).toHaveAttribute("aria-invalid", "true");
  await expect(message).toHaveAttribute("aria-describedby", "message-error");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

  await firstName.fill("Max");
  await lastName.fill("Mustermann");
  await subject.fill("Beratung");
  await email.fill("nicht-gueltig");
  await message.fill("test");

  await expect(page.locator("#firstName-error")).toHaveCount(0);
  await expect(firstName).toHaveAttribute("aria-invalid", "false");
  await expect(firstName).not.toHaveAttribute("aria-describedby", /.+/);
  await expect(page.locator("#email-error")).toHaveText("Bitte geben Sie eine gültige E-Mail-Adresse ein.");
  await expect(page.locator("#message-error")).toHaveText("Bitte beschreiben Sie Ihr Anliegen mit mindestens 10 Zeichen.");

  await message.fill("Ausreichend lange Nachricht");
  await expect(page.locator("#message-error")).toHaveCount(0);
  await expect(message).toHaveAttribute("aria-invalid", "false");

  await email.fill("");
  await phone.fill("+49 9342 9153-53");
  await expect(page.locator("#email-error")).toHaveCount(0);
});

test("Kontaktformular hält Feldfehler und Übermittlungsfehler getrennt", async ({ page }) => {
  await page.route("**/api/contact", async (route) => {
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({
        error: "Die Online-Übermittlung ist derzeit nicht eingerichtet. Bitte rufen Sie uns an oder schreiben Sie an info@dalemans.de.",
      }),
    });
  });
  await page.goto("/kontakt");

  await page.locator("input[name=firstName]").fill("Max");
  await page.locator("input[name=lastName]").fill("Mustermann");
  await page.locator("input[name=email]").fill("max@example.de");
  await page.locator("textarea[name=message]").fill("Bitte beraten Sie uns zu unserer geplanten Bestuhlung.");
  await page.getByRole("button", { name: "Anfrage senden" }).click();

  const transmissionError = page.locator("form > div > [role=alert]");
  await expect(transmissionError).toContainText("Online-Übermittlung ist derzeit nicht eingerichtet");
  await expect(transmissionError).toBeFocused();
  await expect(page.locator("#message-error")).toHaveCount(0);
});

test("Kontakt-API weist ungültige und übergroße Anfragen ab", async ({ request }) => {
  const invalid = await request.post("/api/contact", { data: {} });
  expect(invalid.status()).toBe(422);

  const missingContactMethod = await request.post("/api/contact", {
    data: {
      firstName: "Max",
      lastName: "Mustermann",
      subject: "Stapelstühle",
      message: "Bitte senden Sie uns ein Angebot.",
    },
  });
  expect(missingContactMethod.status()).toBe(422);

  const oversized = await request.post("/api/contact", {
    data: { message: "x".repeat(10_001) },
  });
  expect(oversized.status()).toBe(413);
});

test("grundlegende Accessibility-Struktur ist vorhanden", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await expect(page.locator("main#main-content")).toHaveCount(1);
  await expect(page.locator('a[href="#main-content"]')).toHaveCount(1);
  const imagesWithoutAlt = await page.locator("img:not([alt])").count();
  expect(imagesWithoutAlt).toBe(0);
});

test("Telefon, E-Mail und markengerechte 404 sind vorhanden", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('a[href="tel:+499342915353"]')).not.toHaveCount(0);
  await expect(page.locator('a[href="mailto:info@dalemans.de"]')).not.toHaveCount(0);
  const response = await page.goto("/nicht-vorhanden-prelaunch");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("nicht erreichbar");
});
