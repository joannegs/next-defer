import { expect, test } from '@playwright/test';

test('retry loads the component after the chunk fails once', async ({ page }) => {
  const initialChunks = new Set<string>();
  page.on('response', (response) => {
    if (response.url().endsWith('.js')) {
      initialChunks.add(response.url());
    }
  });

  await page.goto('/e2e/lazy-chunk');
  await expect(page.getByText('click to load')).toBeVisible();

  let blocking = true;
  let sawBlockedRequest = false;
  await page.route('**/*.js', async (route) => {
    const url = route.request().url();
    if (blocking && !initialChunks.has(url)) {
      sawBlockedRequest = true;
      await route.abort('failed');
      return;
    }
    await route.continue();
  });

  await page.getByText('click to load').click();
  await expect(page.getByText('failed to load')).toBeVisible();

  blocking = false;
  await page.getByRole('button', { name: 'retry' }).click();
  await expect(page.getByText('Loaded on e2e')).toBeVisible();

  expect(sawBlockedRequest).toBe(true);
});
