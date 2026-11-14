import { expect, test } from "@playwright/test";
import { StructuredData } from "../src/components/StructuredData";

test("JSON-LD cannot close its script element through catalog text", () => {
  const payload = "</script><script>alert(1)</script>";
  const html = StructuredData({ data: { name: payload } }).props.dangerouslySetInnerHTML.__html;
  expect(html).not.toContain("<");
  expect(JSON.parse(html)).toEqual({ name: payload });
});

for (const failure of ["access", "quota"]) {
  test(`price selection and inquiry cart survive storage ${failure} errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.addInitScript(kind => {
      if (kind === "access") Object.defineProperty(window, "localStorage", { get() { throw new DOMException("Blocked", "SecurityError"); } });
      else Storage.prototype.setItem = () => { throw new DOMException("Full", "QuotaExceededError"); };
    }, failure);
    await page.goto("/produkte/artikel/klapptisch-310c");
    await expect(page.locator('[data-price-status="fixed"]')).toContainText("355,93");
    await page.getByRole("button", { name: "Privatkunden · brutto" }).click();
    await expect(page.locator('[data-price-status="fixed"]')).toContainText("423,56");
    await page.getByRole("button", { name: "Geschäftskunden · netto" }).click();
    await expect(page.locator('[data-price-status="fixed"]')).toContainText("355,93");
    await page.getByRole("button", { name: "Zur Auswahl hinzufügen" }).click();
    const drawer = page.getByTestId("cart-drawer");
    await expect(drawer).toContainText("355,93");
    await drawer.getByRole("button", { name: /Menge .* erhöhen/ }).click();
    await expect(drawer.getByLabel(/Menge für/)).toHaveValue("2");
    expect(errors).toEqual([]);
  });
}
