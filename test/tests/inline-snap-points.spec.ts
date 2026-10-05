import { test, expect } from '@playwright/test';
import { ANIMATION_DURATION } from './constants';

test.beforeEach(async ({ page }) => {
  await page.goto('/inline-snap-points');
});

test('follows the pointer while the parent re-renders with new snap point arrays', async ({ page }) => {
  await page.waitForTimeout(ANIMATION_DURATION);
  const content = page.getByTestId('content');
  const start = (await content.boundingBox())!;
  const x = start.x + start.width / 2;
  const y = start.y + 20;

  await page.mouse.move(x, y);
  await page.mouse.down();
  for (let step = 1; step <= 8; step++) {
    await page.mouse.move(x, y - step * 15);
    // Long enough for the parent to re-render between moves.
    await page.waitForTimeout(60);
  }

  const during = (await content.boundingBox())!;
  await page.mouse.up();
  expect(start.y - during.y).toBeGreaterThan(100);
});
