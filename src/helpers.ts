import { BORDER_RADIUS, TRANSITIONS, EASING, NESTED_DISPLACEMENT, WINDOW_TOP_OFFSET } from './constants';
import type { Styles } from './styles';
import type { DrawerDirection } from './types';

export function isVertical(direction: DrawerDirection) {
  switch (direction) {
    case 'top':
    case 'bottom':
      return true;
    case 'left':
    case 'right':
      return false;
    default:
      return direction satisfies never;
  }
}

/** 1 when dragging towards the closed side moves along the positive axis (`bottom`, `right`), -1 otherwise. */
export function directionMultiplier(direction: DrawerDirection) {
  return direction === 'bottom' || direction === 'right' ? 1 : -1;
}

export function translate(direction: DrawerDirection, value: number) {
  return isVertical(direction) ? `translate3d(0, ${value}px, 0)` : `translate3d(${value}px, 0, 0)`;
}

/** The element's current translation along the drawer's axis, including one mid-transition. */
export function getTranslate(element: HTMLElement, direction: DrawerDirection) {
  const { transform } = window.getComputedStyle(element);
  if (!transform || transform === 'none') return 0;
  const matrix = new DOMMatrixReadOnly(transform);
  return isVertical(direction) ? matrix.m42 : matrix.m41;
}

/**
 * A parent drawer's transform behind a nested one: `pushedBack` is 1 while the nested drawer is open, 0 once it's
 * closed, and in between while it's dragged. `offset` is where the parent rests on its own, e.g. its snap point.
 */
export function nestedParentTransform(direction: DrawerDirection, pushedBack: number, offset: number) {
  const pushedBackScale = (window.innerWidth - NESTED_DISPLACEMENT) / window.innerWidth;
  const scale = 1 - pushedBack * (1 - pushedBackScale);
  return `scale(${scale}) ${translate(direction, offset - pushedBack * NESTED_DISPLACEMENT)}`;
}

export function dampenValue(v: number) {
  return 8 * (Math.log(v + 1) - 2);
}

/** Scale of the background wrapper while a drawer is open. */
export function getScale() {
  return (window.innerWidth - WINDOW_TOP_OFFSET) / window.innerWidth;
}

/** Scales the background wrapper and pushes it down by `offset`, e.g. `calc(env(safe-area-inset-top) + 14px)`. */
export function getWrapperTransform(direction: DrawerDirection, scale: number, offset: string) {
  return `scale(${scale}) ${isVertical(direction) ? `translate3d(0, ${offset}, 0)` : `translate3d(${offset}, 0, 0)`}`;
}

/** Styles that scale the `[data-vaul-drawer-wrapper]` background down behind an open drawer. */
export function getWrapperScaleStyles(direction: DrawerDirection): Styles {
  return {
    'border-radius': `${BORDER_RADIUS}px`,
    overflow: 'hidden',
    'transform-origin': isVertical(direction) ? 'top' : 'left',
    transform: getWrapperTransform(direction, getScale(), WRAPPER_OFFSET),
    'transition-property': 'transform, border-radius',
    'transition-duration': `${TRANSITIONS.DURATION}s`,
    'transition-timing-function': EASING,
  };
}

/** How far the scaled background sits below the top edge. */
export const WRAPPER_OFFSET = 'calc(env(safe-area-inset-top) + 14px)';

export function getWrapper() {
  return document.querySelector<HTMLElement>('[data-vaul-drawer-wrapper], [vaul-drawer-wrapper]');
}

// HTML input types that don't bring up the software keyboard.
const nonTextInputTypes = new Set([
  'checkbox',
  'radio',
  'range',
  'color',
  'file',
  'image',
  'button',
  'submit',
  'reset',
]);

export function isEditable(target: Element | null): target is HTMLElement {
  return (
    (target instanceof HTMLInputElement && !nonTextInputTypes.has(target.type)) ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}
