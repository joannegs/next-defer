import { expect, test } from '@playwright/test';

test('the component chunk is deferred and loaded only when the trigger is activated', async ({
  page,
}) => {
  const jsResponses: string[] = [];
  page.on('response', (response) => {
    if (response.url().endsWith('.js')) {
      jsResponses.push(response.url());
    }
  });

  await page.goto('/e2e/lazy-chunk');
  await expect(page.getByText('click to load')).toBeVisible();

  const chunksBeforeTrigger = [...jsResponses];

  await page.getByText('click to load').click();
  await expect(page.getByText('Loaded on e2e')).toBeVisible();

  const chunksAfterTrigger = jsResponses.filter((url) => !chunksBeforeTrigger.includes(url));
  expect(chunksAfterTrigger.length).toBeGreaterThan(0);
});
