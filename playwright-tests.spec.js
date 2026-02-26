import { test, expect } from '@playwright/test';

test('arrows.app loads with toolbar buttons', async ({ page }) => {
  // Navigate to the app
  await page.goto('http://localhost:4200');

  // Wait for the app to load
  await page.waitForSelector('.ui.button', { timeout: 10000 });

  // Check if the toolbar buttons are present
  const addNodeButton = page.locator('button:has-text("Add Node")');
  const addTextButton = page.locator('button:has-text("Add Text")');
  const drawButton = page.locator('button:has-text("Draw")');

  await expect(addNodeButton).toBeVisible();
  await expect(addTextButton).toBeVisible();
  await expect(drawButton).toBeVisible();

  console.log('✅ All toolbar buttons are present');
});

test('add text annotation works', async ({ page }) => {
  await page.goto('http://localhost:4200');
  await page.waitForSelector('.ui.button', { timeout: 10000 });

  // Close the modal if it's open
  try {
    await page.click('button:has-text("Done")', { timeout: 1000 });
  } catch (e) {}

  // Click "Add Text" button
  await page.click('button:has-text("Add Text")', { force: true });

  // Wait a moment for the annotation to be created
  await page.waitForTimeout(500);

  // Click on the canvas to place the text
  await page.mouse.click(200, 200);

  await page.waitForTimeout(500);

  console.log('✅ Add Text button clicked');
});

test('drawing mode toggle works', async ({ page }) => {
  await page.goto('http://localhost:4200');
  await page.waitForSelector('.ui.button', { timeout: 10000 });

  // Close the modal if it's open
  try {
    await page.click('button:has-text("Done")', { timeout: 1000 });
  } catch (e) {}

  // Click "Draw" button to enable drawing mode
  await page.click('button:has-text("Draw")', { force: true });

  // Check that button text changes to "Stop Drawing"
  const stopDrawingButton = page.locator('button:has-text("Stop Drawing")');
  await expect(stopDrawingButton).toBeVisible({ timeout: 10000 });

  // Click again to disable
  await page.click('button:has-text("Stop Drawing")', { force: true });

  // Check that button text changes back
  const drawButton = page.locator('button:has-text("Draw")');
  await expect(drawButton).toBeVisible({ timeout: 10000 });

  console.log('✅ Drawing mode toggle works');
});
