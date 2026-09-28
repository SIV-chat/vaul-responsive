import { expect, test } from '@playwright/test';
import { openDrawer } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/responsive');
});

test.describe('Responsive presentation', () => {
  test('switches between drawer and dialog without remounting the content', async ({ page }) => {
    await openDrawer(page);
    const content = page.getByTestId('content');
    await expect(content).toHaveAttribute('data-vaul-presentation', 'drawer');
    await expect(content).toHaveAttribute('data-vaul-drawer', '');

    await page.getByTestId('uncontrolled').fill('typed as a drawer');
    await content.evaluate((element) => ((element as HTMLElement & { marker?: boolean }).marker = true));

    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(content).toHaveAttribute('data-vaul-presentation', 'dialog');
    await expect(content).toHaveAttribute('data-vaul-dialog', '');
    await expect(content).not.toHaveAttribute('data-vaul-drawer');
    await expect(page.getByTestId('uncontrolled')).toHaveValue('typed as a drawer');
    // The same DOM node, not a remounted copy.
    expect(await content.evaluate((element) => (element as HTMLElement & { marker?: boolean }).marker)).toBe(true);
    // No drawer transform left behind on the dialog.
    expect(await content.evaluate((element) => element.style.transform)).toBe('');
  });
});
