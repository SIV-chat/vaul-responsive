import { test, expect } from '@playwright/test';
import { ANIMATION_DURATION } from './constants';
import { openDrawer } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/without-scaled-background');
});

test.describe('Base tests', () => {
  test('should open drawer', async ({ page }) => {
    await expect(page.getByTestId('content')).not.toBeVisible();

    await page.getByTestId('trigger').click();

    await expect(page.getByTestId('content')).toBeVisible();
  });

  test('should close on background interaction', async ({ page }) => {
    await openDrawer(page);
    // Click on the background
    await page.mouse.click(0, 0);

    await page.waitForTimeout(ANIMATION_DURATION);
    await expect(page.getByTestId('content')).not.toBeVisible();
  });

  test('should close when `Drawer.Close` is clicked', async ({ page }) => {
    await openDrawer(page);

    await page.getByTestId('drawer-close').click();
    await page.waitForTimeout(ANIMATION_DURATION);
    await expect(page.getByTestId('content')).not.toBeVisible();
  });

  test('should close when controlled', async ({ page }) => {
    await openDrawer(page);

    await page.getByTestId('controlled-close').click();
    await page.waitForTimeout(ANIMATION_DURATION);
    await expect(page.getByTestId('content')).not.toBeVisible();
  });

  test('should be open by defafult when `defaultOpen` is true', async ({ page }) => {
    await page.goto('/default-open');

    await expect(page.getByTestId('content')).toBeVisible();
  });

  test('should close when dragged down', async ({ page }) => {
    await openDrawer(page);
    await page.hover('[data-vaul-drawer]');
    await page.mouse.down();
    await page.mouse.move(0, 800);
    await page.mouse.up();
    await page.waitForTimeout(ANIMATION_DURATION);
    await expect(page.getByTestId('content')).not.toBeVisible();
  });

  test('should not close when dragged up', async ({ page }) => {
    await openDrawer(page);
    await page.hover('[data-vaul-drawer]');
    await page.mouse.down();
    await page.mouse.move(0, -800);
    await page.mouse.up();
    await page.waitForTimeout(ANIMATION_DURATION);
    await expect(page.getByTestId('content')).toBeVisible();
  });
});

test('should close when dragged down and cancelled', async ({ page }) => {
  await openDrawer(page);
  await page.hover('[data-vaul-drawer]');
  await page.mouse.down();
  await page.mouse.move(0, 800);
  await page.dispatchEvent('[data-vaul-drawer]', 'contextmenu');
  await page.waitForTimeout(ANIMATION_DURATION);
  await expect(page.getByTestId('content')).not.toBeVisible();
});

test('should close when dragged by an SVG inside the content', async ({ page }) => {
  await openDrawer(page);
  await page.getByTestId('icon').hover();
  await page.mouse.down();
  await page.mouse.move(0, 800);
  await page.mouse.up();
  await page.waitForTimeout(ANIMATION_DURATION);
  await expect(page.getByTestId('content')).not.toBeVisible();
});

test('should stay open when a drag is flicked back up before release', async ({ page }) => {
  await openDrawer(page);
  const box = await page.getByTestId('content').boundingBox();
  if (!box) throw new Error('The drawer has no bounding box');
  const x = box.x + box.width / 2;
  let y = box.y + 100;

  await page.mouse.move(x, y);
  await page.mouse.down();
  // Slowly down by 180px, short of the close threshold...
  for (let i = 0; i < 6; i++) {
    y += 30;
    await page.mouse.move(x, y);
    await page.waitForTimeout(50);
  }
  await page.waitForTimeout(150);
  // ...then a quick flick back up, which still leaves the drag pointing down overall.
  for (let i = 0; i < 3; i++) {
    y -= 20;
    await page.mouse.move(x, y);
    await page.waitForTimeout(16);
  }
  await page.mouse.up();

  await page.waitForTimeout(ANIMATION_DURATION);
  await expect(page.getByTestId('content')).toBeVisible();
});
