import { expect, test } from "@playwright/test";

test("Raumplaner verwaltet mehrere Türen und Hindernisse", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  await page.goto("/raumplaner");
  await expect(page.getByText("3D-Raumplaner · V0.3")).toBeVisible();
  await expect(page.getByTestId("chair-count")).toHaveText("270");
  await expect(page.locator("canvas")).toBeVisible();

  await page.getByRole("button", { name: /Tür Inaktiv/ }).click();
  const addDoor = page.getByRole("button", { name: /\+ Tür/ });
  await addDoor.click(); await addDoor.click(); await addDoor.click();
  await page.getByLabel("Tür 1 Wand").selectOption("left");
  await page.getByLabel("Tür 2 Wand").selectOption("front");
  await page.getByLabel("Tür 3 Wand").selectOption("right");
  await page.getByLabel("Tür 1 Position").fill("8");
  await page.getByLabel("Tür 2 Position").fill("3");
  const chairsWithDoors = Number(await page.getByTestId("chair-count").textContent());
  expect(chairsWithDoors).toBeLessThan(270);

  await page.getByRole("button", { name: "Position in 3D setzen" }).nth(1).click();
  await expect(page.getByText(/Türposition wählen/)).toBeVisible();
  const doorCanvas = await page.locator("canvas").boundingBox();
  if (doorCanvas) {
    for (let y = 0.15; y <= 0.85 && await page.getByText(/Türposition wählen/).isVisible(); y += 0.1) {
      for (let x = 0.1; x <= 0.9 && await page.getByText(/Türposition wählen/).isVisible(); x += 0.1) await page.mouse.click(doorCanvas.x + doorCanvas.width * x, doorCanvas.y + doorCanvas.height * y);
    }
  }
  await expect(page.getByText(/Türposition wählen/)).toBeHidden();
  await page.getByRole("button", { name: "Tür 2 entfernen" }).click();
  await expect(page.getByLabel("Tür 1 Position")).toHaveValue("8");
  await expect(page.getByLabel("Tür 2 Wand")).toHaveValue("right");

  await page.getByRole("button", { name: /Hindernis Inaktiv/ }).click();
  const addObstacle = page.getByRole("button", { name: /\+ Hindernis/ });
  await addObstacle.click(); await addObstacle.click(); await addObstacle.click();
  await page.getByLabel("Hindernis 1 X-Position").fill("-3");
  await page.getByLabel("Hindernis 1 Y-Position").fill("4");
  await page.getByLabel("Hindernis 2 X-Position").fill("0");
  await page.getByLabel("Hindernis 2 Y-Position").fill("7");
  expect(Number(await page.getByTestId("chair-count").textContent())).toBeLessThan(chairsWithDoors);

  await page.getByRole("button", { name: "Position in 3D setzen" }).last().click();
  await expect(page.getByText(/Position für Hindernis wählen/)).toBeVisible();
  const obstacleCanvas = await page.locator("canvas").boundingBox();
  if (obstacleCanvas) await page.mouse.click(obstacleCanvas.x + obstacleCanvas.width / 2, obstacleCanvas.y + obstacleCanvas.height / 2);
  await expect(page.getByText(/Position für Hindernis wählen/)).toBeHidden();
  await page.getByRole("button", { name: "Hindernis 2 entfernen" }).click();
  await expect(page.getByLabel("Hindernis 1 X-Position")).toHaveValue("-3");

  await page.getByRole("button", { name: "Tür 1", exact: true }).click();
  await expect(page.getByLabel("Tür 1 Position")).toBeHidden();
  await page.getByRole("button", { name: "Tür 1", exact: true }).click();
  await expect(page.getByLabel("Tür 1 Position")).toBeVisible();

  const box = await page.locator("canvas").boundingBox();
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
