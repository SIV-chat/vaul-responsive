import { test, expect } from '@playwright/test';
import { openDrawer, runningAnimations } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/with-scaled-background');
});

test.describe('With scaled background', () => {
  test('should scale background', async ({ page }) => {
    await expect(page.locator('[data-vaul-drawer-wrapper]')).not.toHaveCSS('transform', '');

    await page.getByTestId('trigger').click();

    await expect(page.locator('[data-vaul-drawer-wrapper]')).toHaveCSS('transform', /matrix/);
  });

  test('should scale background when dragging', async ({ page }) => {
    await expect(page.locator('[data-vaul-drawer-wrapper]')).not.toHaveCSS('transform', '');

    await openDrawer(page);

    await page.hover('[data-vaul-drawer]');
    await page.mouse.down();
    await page.mouse.move(0, 100);

    await expect(page.locator('[data-vaul-drawer-wrapper]')).toHaveCSS('transform', /matrix/);

    await page.mouse.up();

    await expect(page.locator('[data-vaul-drawer-wrapper]')).not.toHaveCSS('transform', '');
  });

  test('animates the background back up after the drawer is dragged closed', async ({ page }) => {
    await openDrawer(page);

    await page.hover('[data-vaul-drawer]');
    await page.mouse.down();
    await page.mouse.move(0, 800);
    await page.mouse.up();

    await expect.poll(() => runningAnimations(page)).toContain('wrapper:transition');
  });
});
