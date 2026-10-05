import { expect, Page } from '@playwright/test';
import { ANIMATION_DURATION } from './constants';

export async function openDrawer(page: Page) {
  await expect(page.getByTestId('content')).not.toBeVisible();
  await page.getByTestId('trigger').click();
  await page.waitForTimeout(ANIMATION_DURATION);
  await expect(page.getByTestId('content')).toBeVisible();
}

export const MOBILE = { width: 390, height: 844 };
export const DESKTOP = { width: 1024, height: 768 };

/** CSS animations and transitions running on test ids, e.g. `content:slideFromBottom` or `overlay:transition`. */
export function runningAnimations(page: Page) {
  return page.evaluate(() =>
    document.getAnimations().map((animation) => {
      const target = (animation.effect as KeyframeEffect | null)?.target as HTMLElement | null;
      const name = animation instanceof CSSAnimation ? animation.animationName : 'transition';
      return `${target?.dataset.testid}:${name}`;
    }),
  );
}

export async function switchTo(page: Page, presentation: 'drawer' | 'dialog') {
  await page.setViewportSize(presentation === 'dialog' ? DESKTOP : MOBILE);
  await expect(page.getByTestId('content')).toHaveAttribute('data-vaul-presentation', presentation);
}
