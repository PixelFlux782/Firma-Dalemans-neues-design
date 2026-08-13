import { expect, test } from "@playwright/test";

const routes = [
  "/", "/produkte", "/produkte/kategorien/stapelstuehle",
  "/produkte/kategorien/klapptische", "/produkte/kategorien/transportwagen-zubehoer",
  "/produkte/stapelstuhl-mod-1021c", "/produkte/rednerpulte", "/raeume-planung",
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
  "/", "/produkte", "/produkte/kategorien/stapelstuehle",
  "/produkte/kategorien/klapptische", "/raeume-planung", "/sonderloesungen",
  "/sonderposten", "/firma", "/kontakt",
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
    "/produkte", "/produkte/kategorien/stapelstuehle", "/kontakt", "/firma",
    "/beratung-service", "/raeume-planung", "/sonderloesungen", "/sonderposten",
  ];
  for (const route of heroRoutes) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    const heroImage = page.locator(".products-hero-media img").first();
    await expect(heroImage, route).toHaveAttribute("alt", /\S.{10,}/);
  }
});

test("wichtige Unterseiten liefern BreadcrumbList-Daten", async ({ page }) => {
  for (const route of ["/produkte", "/produkte/kategorien/stapelstuehle", "/raeume-planung", "/kontakt", "/firma"]) {
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

test("Kontaktformular validiert lokal und sendet keine Nachricht", async ({ page }) => {
  await page.goto("/kontakt");
  await page.getByRole("button", { name: "Anfrage senden" }).click();
  await expect(page.locator("input[name=firstName]")).toBeFocused();
  for (const field of ["firstName", "lastName", "subject", "message"]) {
    await expect(page.locator(`[name=${field}]`)).toHaveAttribute("required", "");
  }
  await expect(page.locator("input[name=organization]")).not.toHaveAttribute("required", "");
  expect(await page.locator(":invalid").count()).toBeGreaterThan(0);

  await page.locator("input[name=firstName]").fill("Max");
  await page.locator("input[name=lastName]").fill("Mustermann");
  await page.locator("textarea[name=message]").fill("Bitte beraten Sie uns zu unserer geplanten Bestuhlung.");
  await page.getByRole("button", { name: "Anfrage senden" }).click();
  await expect(page.locator("form [role=alert]")).toContainText("E-Mail-Adresse oder Telefonnummer");
  await expect(page.locator("input[name=email]")).toBeFocused();
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
