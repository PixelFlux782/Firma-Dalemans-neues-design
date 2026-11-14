import { expect, test } from "@playwright/test";
import sharp from "sharp";

for (const route of ["/produkte/artikel/seminarklapptisch-210c", "/produkte/artikel/rednerpult-typ-e", "/produkte/artikel/rednerpult-typ-ah", "/produkte/stapelstuehle/1021", "/produkte/stapelstuehle/buende", "/produkte/stapelstuehle/coburg", "/produkte/stapelstuehle/nuernberg", "/produkte/stapelstuehle/erfurt", "/produkte/sortiment/gleiter-bodenschutz", "/produkte/sortiment/muster-beratung", "/produkte/sortiment/klappstuehle"]) {
  test(`WP24 metadata, images and JSON-LD: ${route}`, async ({ request, browser }) => {
    const response = await request.get(route, { headers: { "User-Agent": "Googlebot" } });
    expect(response.status()).toBe(200);
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.route("**/*", r => r.abort());
    await page.setContent(await response.text());
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://dalemans.de${route}`);
    expect(await page.title()).toBeTruthy();
    await expect(page.locator('meta[name="description"]')).toHaveCount(1);
    const nodes = (await page.locator('script[type="application/ld+json"]').allTextContents()).flatMap(t => { const j = JSON.parse(t); return j["@graph"] ?? [j]; });
    expect(nodes.filter(n => n["@type"] === "BreadcrumbList")).toHaveLength(1);
    expect(nodes.filter(n => n["@type"] === "Product").length).toBeLessThanOrEqual(1);
    for (const product of nodes.filter(n => n["@type"] === "Product")) {
      expect(product.brand).toEqual({ "@type": "Brand", name: "Dalemans" });
      for (const image of product.image ?? []) expect((await request.get(new URL(image).pathname)).status()).toBe(200);
    }
    const ogMeta = page.locator('meta[property="og:image"]');
    const og = await ogMeta.count() ? await ogMeta.getAttribute("content") : null;
    if (og) {
      expect(og).not.toMatch(/\.png$/);
      const asset = await request.get(new URL(og).pathname);
      expect(asset.status()).toBe(200);
      expect((await sharp(await asset.body()).metadata()).width).toBeGreaterThan(400);
    }
    if (route.endsWith("seminarklapptisch-210c")) {
      expect(og).toContain("/t210.webp");
      expect(await page.locator('img').evaluateAll(imgs => imgs.map(i => i.getAttribute('src')).join(' '))).toContain("T210cdetail.webp");
    }
    await context.close();
  });
}
