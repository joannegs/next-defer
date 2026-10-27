import { expect, test } from '@playwright/test';

test('hydration and keyboard interaction', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/');
  await expect(page.getByText('Loaded on idle')).toBeVisible();

  expect(errors).toEqual([]);
});

test('the "interaction" trigger is activated via keyboard (focus + Enter)', async ({ page }) => {
  await page.goto('/');

  const trigger = page.getByRole('button', { name: 'click here to load' });
  await trigger.focus();
  await trigger.press('Enter');

  await expect(page.getByText('Loaded on interaction')).toBeVisible();
});
