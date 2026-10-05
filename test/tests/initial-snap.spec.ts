import { expect, test } from '@playwright/test';
import { ANIMATION_DURATION } from './constants';

test.beforeEach(async ({ page }) => {
  await page.goto('/initial-snap');
});

test.describe('Initial-snap', () => {
  test('should be open and snapped on initial load', async ({ page }) => {
    await page.waitForTimeout(ANIMATION_DURATION);

    await expect(page.getByTestId('content')).toBeVisible();
    await expect(page.getByTestId('active-snap-index')).toHaveText('1');
  });

  //   test('should snap to next snap point when dragged up', async ({ page }) => {
  //     snapTo(page, 2);

  //     await expect(page.getByTestId('active-snap-index')).toHaveText('2');
  //   });

  //   test('should snap to last snap point when dragged up', async ({ page }) => {
  //     snapTo(page, 3);

  //     await expect(page.getByTestId('active-snap-index')).toHaveText('3');
  //   });

  //   test('should snap to 0 when dragged down', async ({ page }) => {
  //     snapTo(page, 0);

  //     await expect(page.getByTestId('active-snap-index')).toHaveText('0');
  //   });
});
