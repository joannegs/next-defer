import { expect, test } from '@playwright/test';

test('the "viewport" trigger fires once the section scrolls into view', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('waiting for the section to enter the viewport')).toBeVisible();

  await page.getByText('waiting for the section to enter the viewport').scrollIntoViewIfNeeded();

  await expect(page.getByText('Loaded on viewport')).toBeVisible();
});
