import { expect, test } from "@playwright/test";

test("Raumplaner berücksichtigt Stuhlmaße und Seitengänge", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  await page.goto("/raumplaner");
  await expect(page.getByText("3D-Raumplaner · V0.3")).toBeVisible();
  await expect(page.getByLabel("Stuhlbreite")).toHaveValue("0.5");
  await expect(page.getByLabel("Stuhltiefe")).toHaveValue("0.55");
  await expect(page.getByLabel("Seitengang links")).toHaveValue("0.8");
  await expect(page.getByLabel("Seitengang rechts")).toHaveValue("0.8");
  await expect(page.getByText("270", { exact: true })).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible();

  await page.getByLabel("Tür aktiv").check();
  await page.getByLabel("Wand").selectOption("left");
  await page.getByLabel("Türposition").fill("8");
  await expect(page.getByTestId("chair-count")).not.toHaveText("270");
  await page.getByLabel("Tür aktiv").uncheck();
  await expect(page.getByTestId("chair-count")).toHaveText("270");

  await page.getByLabel("Hindernis aktiv").check();
  await page.getByLabel("Hindernis Y-Position").fill("7");
  await expect(page.getByTestId("chair-count")).not.toHaveText("270");
  await page.getByLabel("Hindernis X-Position").fill("20");
  await expect(page.getByText("Das Hindernis liegt außerhalb des Raumes.")).toBeVisible();
  await page.getByLabel("Hindernis aktiv").uncheck();

  await page.getByLabel("Stuhlbreite").fill("1");
  await expect(page.getByText("120", { exact: true })).toBeVisible();

  await page.getByLabel("Seitengang links").fill("5");
  await expect(page.getByText("60", { exact: true })).toBeVisible();
  await page.getByLabel("Seitengang rechts").fill("5");
  await page.getByLabel("Raumbreite").fill("4");
  await expect(page.getByText("Die Gangbreiten belegen die gesamte Raumbreite oder mehr.")).toBeVisible();
  await expect(page.getByText("0", { exact: true }).last()).toBeVisible();

  await page.getByRole("banner").getByRole("link", { name: /Startseite/ }).click();
  await expect(page).toHaveURL("/");
  expect(consoleErrors).toEqual([]);
});
