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
  await expect(page.getByLabel("Türabstand")).toHaveValue("0.3");
  await page.getByLabel("Wand").selectOption("left");
  await page.getByLabel("Türposition").fill("8");
  await expect(page.getByTestId("chair-count")).not.toHaveText("270");
  const chairsAtDoor = Number(await page.getByTestId("chair-count").textContent());
  await page.getByLabel("Türabstand").fill("1");
  await expect.poll(async () => Number(await page.getByTestId("chair-count").textContent())).toBeLessThan(chairsAtDoor);
  await page.getByLabel("Tür aktiv").uncheck();
  await expect(page.getByTestId("chair-count")).toHaveText("270");

  await page.getByLabel("Hindernis aktiv").check();
  await expect(page.getByLabel("Hindernisabstand")).toHaveValue("0.3");
  await page.getByLabel("Hindernis Y-Position").fill("7");
  await expect(page.getByTestId("chair-count")).not.toHaveText("270");
  const chairsAtObstacle = Number(await page.getByTestId("chair-count").textContent());
  await page.getByLabel("Hindernisabstand").fill("1");
  await expect.poll(async () => Number(await page.getByTestId("chair-count").textContent())).toBeLessThan(chairsAtObstacle);
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

  await page.getByLabel("Raumbreite").fill("30");
  await page.getByLabel("Raumlänge").fill("40");
  await page.getByLabel("Stuhlbreite").fill("0.3");
  await page.getByLabel("Seitengang links").fill("0");
  await page.getByLabel("Seitengang rechts").fill("0");
  await expect(page.getByTestId("chair-count")).toHaveText("300");
  const canvas = page.locator("canvas");
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    await page.mouse.move(box.x + box.width * 0.65, box.y + box.height * 0.5);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.45, box.y + box.height * 0.4, { steps: 8 });
    await page.mouse.up();
    await page.mouse.wheel(0, -350);
  }

  await page.getByRole("banner").getByRole("link", { name: /Startseite/ }).click();
  await expect(page).toHaveURL("/");
  expect(consoleErrors).toEqual([]);
});
