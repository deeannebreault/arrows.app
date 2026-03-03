import { chromium } from '@playwright/test';

const APP_URL = 'http://localhost:4200';
const OUTPUT_DIR = 'screenshots';

const main = async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1365, height: 768 } });

  await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);

  await page.screenshot({ path: `${OUTPUT_DIR}/01-main-ui.png`, fullPage: true });

  const doneButton = page.getByRole('button', { name: 'Done' });
  if (await doneButton.count()) {
    await doneButton.first().click({ force: true });
    await page.waitForTimeout(500);
  }

  await page.screenshot({ path: `${OUTPUT_DIR}/02-main-canvas.png`, fullPage: true });

  await page.getByRole('button', { name: 'Draw' }).click({ force: true });
  await page.mouse.click(260, 220);
  await page.mouse.click(420, 260);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUTPUT_DIR}/03-draw-line-mode.png`, fullPage: true });

  await page.getByRole('button', { name: 'Download / Export' }).click({ force: true });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUTPUT_DIR}/04-export-modal.png`, fullPage: true });

  const exportDone = page.getByRole('button', { name: 'Done' });
  if (await exportDone.count()) {
    await exportDone.first().click({ force: true });
    await page.waitForTimeout(300);
  }

  await page.locator('div[role="listbox"]').first().click();
  await page.locator('div.item', { hasText: /^Import$/ }).first().click({ force: true });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUTPUT_DIR}/05-import-modal.png`, fullPage: true });

  await browser.close();
  console.log(`Saved screenshots to ${OUTPUT_DIR}/`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
