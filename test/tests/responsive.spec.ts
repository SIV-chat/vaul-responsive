import { expect, test } from '@playwright/test';
import { ANIMATION_DURATION } from './constants';
import { DESKTOP, MOBILE, openDrawer, runningAnimations, switchTo } from './helpers';

test.describe('Responsive presentation (the default)', () => {
  test('switches between drawer and dialog without remounting the content', async ({ page }) => {
    await page.goto('/responsive');
    await openDrawer(page);
    const content = page.getByTestId('content');
    await expect(content).toHaveAttribute('data-vaul-presentation', 'drawer');
    await expect(content).toHaveAttribute('data-vaul-drawer', '');

    await page.getByTestId('uncontrolled').fill('typed as a drawer');
    await content.evaluate((element) => ((element as HTMLElement & { marker?: boolean }).marker = true));

    await switchTo(page, 'dialog');
    await expect(content).toHaveAttribute('data-vaul-dialog', '');
    await expect(content).not.toHaveAttribute('data-vaul-drawer');
    await expect(page.getByTestId('uncontrolled')).toHaveValue('typed as a drawer');
    // The same DOM node, not a remounted copy.
    expect(await content.evaluate((element) => (element as HTMLElement & { marker?: boolean }).marker)).toBe(true);
    // No drawer transform left behind on the dialog.
    expect(await content.evaluate((element) => element.style.transform)).toBe('');
  });

  test('switches instantly, and still animates the next close and open', async ({ page }) => {
    await page.goto('/responsive');
    await openDrawer(page);

    await switchTo(page, 'dialog');
    expect(await runningAnimations(page)).toEqual([]);
    await switchTo(page, 'drawer');
    expect(await runningAnimations(page)).toEqual([]);

    await page.keyboard.press('Escape');
    expect(await runningAnimations(page)).toContain('content:slideToBottom');
    await expect(page.getByTestId('content')).not.toBeVisible();

    await page.getByTestId('trigger').click();
    expect(await runningAnimations(page)).toContain('content:slideFromBottom');
  });

  test('animates a dialog opened on a wide viewport', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/responsive');
    await page.getByTestId('trigger').click();
    await expect(page.getByTestId('content')).toHaveAttribute('data-vaul-presentation', 'dialog');
    expect(await runningAnimations(page)).toContain('content:vaulDialogIn');
  });

  test('switches a drawer with snap points and a scaled background instantly, back to its snap point', async ({
    page,
  }) => {
    await page.setViewportSize(MOBILE);
    await page.goto('/responsive-snap-points');
    await openDrawer(page);
    await page.waitForTimeout(ANIMATION_DURATION);
    const content = page.getByTestId('content');
    const before = await content.boundingBox();

    await switchTo(page, 'dialog');
    expect(await runningAnimations(page)).toEqual([]);
    await switchTo(page, 'drawer');
    expect(await runningAnimations(page)).toEqual([]);
    expect(await content.boundingBox()).toEqual(before);
  });
});
