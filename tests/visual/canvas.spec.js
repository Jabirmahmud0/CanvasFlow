import { test, expect } from '@playwright/test';

test('Empty canvas state', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('empty-canvas.png');
});

test('Toolbar states', async ({ page }) => {
  await page.goto('/');
  const toolbar = page.locator('role=toolbar');
  await expect(toolbar).toHaveScreenshot('toolbar.png');
});
