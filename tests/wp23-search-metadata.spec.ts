import { expect, test } from "@playwright/test";
import sharp from "sharp";

const routes = ["/", "/produkte/stapelstuehle", "/produkte/sortiment/klapptische", "/produkte/sortiment/rednerpulte", "/produkte/kategorien/transportwagen-zubehoer"];

for (const route of routes) {
  test(`server HTML exposes consistent search metadata: ${route}`, async ({ request, browser }) => {
    const response = await request.get(route, { headers: { "User-Agent": "Googlebot" } });
    expect(response.status()).toBe(200);
    // Parse the delivered HTML with scripting disabled: no hydration can add metadata.
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.route("**/*", r => r.abort());
    await page.setContent(await response.text());
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    expect(new URL((await page.locator('link[rel="canonical"]').getAttribute("href"))!).href).toBe(`https://dalemans.de${route}`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /max-image-preview:large/);
    await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute("content", /noindex/);
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute("href", "/favicon.png");
    const image = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(image).toMatch(/^https:\/\/dalemans.de\//);
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute("content", image!);
    const asset = await request.get(new URL(image!).pathname);
    expect(asset.status()).toBe(200);
    expect((await sharp(await asset.body()).metadata()).width).toBeGreaterThan(400);
    const data = await page.locator('script[type="application/ld+json"]').allTextContents();
    const nodes = data.flatMap(text => { const json = JSON.parse(text); return json["@graph"] ?? [json]; });
    if (route === "/") {
      await expect(page).toHaveTitle("Dalemans – Stapelstühle & Klapptische seit 1994");
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", "Stapelstühle, Klapptische und Raumplanung für Gemeinden, Kirchen und Vereine. Seit 1994 Ihr Partner für langlebige Ausstattung und persönliche Beratung.");
      expect(nodes.filter(n => n["@type"] === "Organization")).toHaveLength(1);
      expect(nodes.filter(n => n["@type"] === "WebSite")).toHaveLength(1);
      const org = nodes.find(n => n["@type"] === "Organization");
      expect(org.url).toBe("https://dalemans.de/");
      expect((await request.get(new URL(org.logo).pathname)).status()).toBe(200);
    } else {
      const crumbs = nodes.filter(n => n["@type"] === "BreadcrumbList");
      expect(crumbs).toHaveLength(1);
      expect(crumbs[0].itemListElement.at(-1).item).toBe(`https://dalemans.de${route}`);
    }
    if (route === "/produkte/stapelstuehle") expect(image).toContain("/images/kategorien/stapelstuehle-bestuhlung.webp");
    await context.close();
  });
}

test("favicon and robots are publicly crawlable", async ({ request }) => {
  const response = await request.get("/favicon.png");
  expect(response.status()).toBe(200);
  const icon = await sharp(await response.body()).metadata();
  expect(icon.width).toBe(96);
  expect(icon.height).toBe(96);
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Allow: /");
  expect(robots).not.toMatch(/Disallow: \/\s/);
  expect(robots).toContain("Sitemap: https://dalemans.de/sitemap.xml");
});
