import { test, expect, type Page } from '@playwright/test';
import { ANIMATION_DURATION } from './constants';
import { DESKTOP, MOBILE, openDrawer, runningAnimations, switchTo } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/nested-drawers');
});

test.describe('Nested tests', () => {
  test('should open and close nested drawer', async ({ page }) => {
    await openDrawer(page);
    await page.getByTestId('nested-trigger').click();
    await page.waitForTimeout(ANIMATION_DURATION);
    await expect(page.getByTestId('nested-content')).toBeVisible();
    await page.getByTestId('nested-close').click();
    await page.waitForTimeout(ANIMATION_DURATION);
    await expect(page.getByTestId('nested-content')).not.toBeVisible();
    await await expect(page.getByTestId('content')).toBeVisible();
  });
});

test.describe('Nested drawers across a presentation switch', () => {
  const parentTransform = (page: Page) => page.getByTestId('content').evaluate((element) => element.style.transform);

  async function openNested(page: Page) {
    await page.getByTestId('nested-trigger').click();
    await page.waitForTimeout(ANIMATION_DURATION);
    await expect(page.getByTestId('nested-content')).toBeVisible();
  }

  test('pushes the parent back again after switching to a dialog and back', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto('/nested-drawers');
    await openDrawer(page);
    await openNested(page);
    const pushedBack = await parentTransform(page);
    expect(pushedBack).toContain('scale(');

    await switchTo(page, 'dialog');
    expect(await parentTransform(page)).toBe('');
    await switchTo(page, 'drawer');
    expect(await parentTransform(page)).toBe(pushedBack);
    expect(await runningAnimations(page)).toEqual([]);
  });

  test('pushes the parent back when a nested dialog switches to a drawer', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/nested-drawers');
    await openDrawer(page);
    await openNested(page);
    expect(await parentTransform(page)).toBe('');

    await switchTo(page, 'drawer');
    expect(await parentTransform(page)).toContain('scale(');
    expect(await runningAnimations(page)).toEqual([]);
  });
});

test.describe('Nested drawer parents', () => {
  const parentTransform = (page: Page) => page.getByTestId('content').evaluate((element) => element.style.transform);
  const pushedBack = /^scale\(0\.\d+\) /;

  test('push back from their snap point and stay there when the snap offsets change', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto('/nested-snap-points');
    await openDrawer(page);

    await page.getByTestId('nested-trigger').click();
    await page.waitForTimeout(ANIMATION_DURATION);
    expect(await parentTransform(page)).toMatch(pushedBack);
    // A '300px' snap point sits the window height minus 300px down; pushed back moves it 16px further up.
    expect(await parentTransform(page)).toContain(`translate3d(0px, ${MOBILE.height - 300 - 16}px, 0px)`);

    await page.setViewportSize({ width: MOBILE.width, height: 800 });
    await page.waitForTimeout(ANIMATION_DURATION);
    expect(await parentTransform(page)).toMatch(pushedBack);
    expect(await parentTransform(page)).toContain(`translate3d(0px, ${800 - 300 - 16}px, 0px)`);
  });

  test('follow a controlled nested drawer', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto('/nested-controlled');
    await openDrawer(page);

    await page.getByTestId('open-nested').click();
    await page.waitForTimeout(ANIMATION_DURATION);
    await expect(page.getByTestId('nested-content')).toBeVisible();
    expect(await parentTransform(page)).toMatch(pushedBack);

    await page.getByTestId('close-nested').click();
    await page.waitForTimeout(ANIMATION_DURATION);
    await expect(page.getByTestId('nested-content')).not.toBeVisible();
    expect(await parentTransform(page)).not.toMatch(pushedBack);
  });

  test('follow a nested drawer dismissed while the consumer passes its own onClose', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto('/nested-controlled');
    await openDrawer(page);

    await page.getByTestId('nested-trigger').click();
    await page.waitForTimeout(ANIMATION_DURATION);
    expect(await parentTransform(page)).toMatch(pushedBack);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(ANIMATION_DURATION);
    await expect(page.getByTestId('nested-content')).not.toBeVisible();
    await expect(page.getByTestId('close-count')).toHaveText('1');
    expect(await parentTransform(page)).not.toMatch(pushedBack);
  });
});
