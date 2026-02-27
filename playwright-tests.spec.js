import { test, expect } from '@playwright/test';

const APP_URL = 'http://localhost:4200';

const dismissBlockingModalIfPresent = async (page) => {
  const activeModal = page.locator('.ui.modal.visible.active');
  if (await activeModal.count()) {
    const doneButton = activeModal.getByRole('button', { name: 'Done' });
    if (await doneButton.count()) {
      await doneButton.first().click({ force: true });
    } else {
      const cancelButton = activeModal.getByRole('button', { name: 'Cancel' });
      if (await cancelButton.count()) {
        await cancelButton.first().click({ force: true });
      } else {
        await page.keyboard.press('Escape');
      }
    }
    await expect(page.locator('.ui.page.modals.dimmer.visible.active')).toHaveCount(0);
  }
};

const loadApp = async (page) => {
  await page.goto(APP_URL);
  await page.waitForSelector('.ui.button', { timeout: 15000 });
  await dismissBlockingModalIfPresent(page);
  await expect(page.getByRole('button', { name: 'Add Node' })).toBeVisible();
};

const openExportModal = async (page) => {
  await dismissBlockingModalIfPresent(page);
  await page.getByRole('button', { name: 'Download / Export' }).click();
  await expect(page.locator('.ui.modal.visible.active .header', { hasText: 'Export' })).toBeVisible();
};

const closeExportModal = async (page) => {
  await page.getByRole('button', { name: 'Done' }).click();
  await expect(page.locator('.ui.modal.visible.active .header', { hasText: 'Export' })).toHaveCount(0);
};

const openImportModal = async (page) => {
  await dismissBlockingModalIfPresent(page);
  await page.locator('div[role="listbox"]').first().click();
  await page.locator('div.item', { hasText: /^Import$/ }).first().click({ force: true });
  await expect(page.locator('.ui.modal.visible.active .header', { hasText: 'Import' })).toBeVisible();
};

test('UI smoke covers key app elements and dialogs', async ({ page }) => {
  await loadApp(page);

  await expect(page.getByRole('button', { name: 'Add Node' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add Text' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Draw' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Download / Export' })).toBeVisible();

  await openExportModal(page);
  for (const tabName of ['PNG', 'SVG', 'Cypher', 'JSON', 'URL', 'GraphQL']) {
    await expect(page.locator('.ui.secondary.menu .item', { hasText: new RegExp(`^${tabName}$`) })).toBeVisible();
  }
  await closeExportModal(page);

  await openImportModal(page);
  await expect(page.getByRole('button', { name: 'Choose File' })).toBeVisible();
  await expect(page.getByPlaceholder('Choose a file, or paste text here...')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Import' })).toBeDisabled();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.locator('.ui.modal.visible.active .header', { hasText: 'Import' })).toHaveCount(0);
});

test('Draw workflow and drawing inspector controls work', async ({ page }) => {
  await loadApp(page);

  await expect(page.getByText('Draw Type')).toBeVisible();
  await expect(page.getByText('Stroke Width')).toBeVisible();
  await expect(page.getByText('Stroke Color')).toBeVisible();
  await expect(page.getByText('Snap')).toBeVisible();

  await page.locator('button:has-text("Draw")').first().click();
  await expect(page.locator('button:has-text("Stop Drawing")').first()).toBeVisible();

  await page.mouse.click(260, 250);
  await page.mouse.click(390, 320);

  const stopDrawingButton = page.locator('button:has-text("Stop Drawing")').first();
  if (await stopDrawingButton.isVisible().catch(() => false)) {
    await stopDrawingButton.click();
  }

  if (await stopDrawingButton.isVisible().catch(() => false)) {
    await stopDrawingButton.click();
  }

  await openExportModal(page);
  await page.locator('.ui.secondary.menu .item', { hasText: /^JSON$/ }).click();
  const exportedJson = await page
    .locator('.ui.modal.visible.active textarea')
    .first()
    .inputValue();
  const parsed = JSON.parse(exportedJson);
  const drawingAnnotations = (parsed.annotations || []).filter(
    (annotation) => annotation.type === 'DRAWING' && (annotation.points || []).length >= 2
  );
  expect(drawingAnnotations.length).toBeGreaterThan(0);
  await closeExportModal(page);
});

test('Add Text create/edit is preserved through JSON export and import', async ({ page }) => {
  await loadApp(page);

  const annotationText = 'Coffee note text';

  await page.getByRole('button', { name: 'Add Text' }).click();
  await expect(page.getByRole('button', { name: 'Cancel Text' })).toBeVisible();

  await page.mouse.click(320, 240);
  await expect(page.getByText('Selection: 1 Annotation')).toBeVisible();

  const inspectorTextArea = page.locator('textarea').first();
  await expect(inspectorTextArea).toBeVisible();
  await inspectorTextArea.fill(annotationText);

  await openExportModal(page);
  await page.locator('.ui.secondary.menu .item', { hasText: /^JSON$/ }).click();
  const exportedJson = await page
    .locator('.ui.modal.visible.active textarea')
    .first()
    .inputValue();
  const parsedBeforeImport = JSON.parse(exportedJson);
  const textAnnotationsBeforeImport = (parsedBeforeImport.annotations || []).filter(
    (annotation) => annotation.type === 'TEXT' && annotation.text === annotationText
  );
  expect(textAnnotationsBeforeImport.length).toBeGreaterThan(0);
  await closeExportModal(page);

  await openImportModal(page);
  await page.getByPlaceholder('Choose a file, or paste text here...').fill(exportedJson);
  await page.getByRole('button', { name: 'Import' }).click();
  await expect(
    page.locator('.ui.modal.visible.active .header', { hasText: 'Import' })
  ).toHaveCount(0);

  await openExportModal(page);
  await page.locator('.ui.secondary.menu .item', { hasText: /^JSON$/ }).click();
  const jsonAfterImport = await page
    .locator('.ui.modal.visible.active textarea')
    .first()
    .inputValue();
  const parsedAfterImport = JSON.parse(jsonAfterImport);
  const textAnnotationsAfterImport = (parsedAfterImport.annotations || []).filter(
    (annotation) => annotation.type === 'TEXT' && annotation.text === annotationText
  );
  expect(textAnnotationsAfterImport.length).toBeGreaterThan(
    textAnnotationsBeforeImport.length
  );
  await closeExportModal(page);
});

test('Export includes PNG and JSON outputs', async ({ page }) => {
  await loadApp(page);
  await page.getByRole('button', { name: 'Add Node' }).click();

  await openExportModal(page);

  const pngDownloadLinks = page.locator('a[download$=".png"]');
  await expect(pngDownloadLinks).toHaveCount(3);
  await expect(pngDownloadLinks.first()).toHaveAttribute('href', /data:image\/png;base64,/);

  await page.locator('.ui.secondary.menu .item', { hasText: /^JSON$/ }).click();
  const jsonDownloadLink = page.locator('a[download$=".json"]');
  await expect(jsonDownloadLink).toBeVisible();
  await expect(jsonDownloadLink).toHaveAttribute('href', /data:application\/json;base64,/);

  const jsonText = await page
    .locator('.ui.modal.visible.active textarea')
    .first()
    .inputValue();
  const parsed = JSON.parse(jsonText);
  expect(Array.isArray(parsed.nodes)).toBeTruthy();
  expect(Array.isArray(parsed.relationships)).toBeTruthy();

  await closeExportModal(page);
});

test('Import JSON from export data updates the graph', async ({ page }) => {
  await loadApp(page);
  await page.getByRole('button', { name: 'Add Node' }).click();
  await expect(page.getByText(/nodes:\s*1/i)).toBeVisible();

  await openExportModal(page);
  await page.locator('.ui.secondary.menu .item', { hasText: /^JSON$/ }).click();
  const exportedJson = await page
    .locator('.ui.modal.visible.active textarea')
    .first()
    .inputValue();
  await closeExportModal(page);

  await openImportModal(page);
  await page.getByPlaceholder('Choose a file, or paste text here...').fill(exportedJson);
  await expect(page.getByRole('button', { name: 'Import' })).toBeEnabled();
  await page.getByRole('button', { name: 'Import' }).click();

  await expect(page.locator('.ui.modal.visible.active .header', { hasText: 'Import' })).toHaveCount(0);
  await expect(page.getByText(/nodes:\s*2/i)).toBeVisible();
});
