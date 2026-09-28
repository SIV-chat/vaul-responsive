import React from 'react';
import { KEYBOARD_FIELD_MARGIN, KEYBOARD_THRESHOLD } from './constants';
import { isEditable } from './helpers';
import { restoreStyles, setStyles } from './styles';

const KEYBOARD_STYLES = ['bottom', 'max-height', '--vaul-keyboard-inset', '--vaul-visible-height'] as const;

/**
 * How far `container` must scroll so `field` sits inside the part of it the keyboard leaves visible.
 * Positive scrolls down, negative up, 0 when the field is already visible. All edges are client coordinates.
 */
export function getFieldScrollDelta({
  field,
  container,
  visibleTop,
  visibleBottom,
  margin = KEYBOARD_FIELD_MARGIN,
}: {
  field: { top: number; bottom: number };
  container: { top: number; bottom: number };
  visibleTop: number;
  visibleBottom: number;
  margin?: number;
}) {
  const bandTop = Math.max(container.top, visibleTop) + margin;
  const bandBottom = Math.min(container.bottom, visibleBottom) - margin;
  // A field taller than the band keeps its top edge (and the caret's first line) in view.
  if (field.top < bandTop || bandBottom - bandTop < field.bottom - field.top) {
    return Math.round(field.top - bandTop);
  }
  if (field.bottom > bandBottom) return Math.round(field.bottom - bandBottom);
  return 0;
}

function findScrollContainer(field: HTMLElement, drawer: HTMLElement) {
  for (let node = field.parentElement; node; node = node.parentElement) {
    const { overflowY } = window.getComputedStyle(node);
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) return node;
    if (node === drawer) return null;
  }
  return null;
}

/**
 * Keeps a bottom drawer above the on-screen keyboard while one of its fields has focus.
 *
 * iOS Safari leaves the layout viewport at full height when the keyboard opens and only shrinks the visual
 * viewport (panning it down to reveal the field), so a `bottom: 0` drawer ends up behind the keyboard. Android
 * shrinks the layout viewport too, which moves the drawer by itself and makes the measured inset ~0 here.
 *
 * While the keyboard is up the drawer gets an inline `bottom` that rests it on the keyboard and a `max-height`
 * that fits the visible area, plus `--vaul-keyboard-inset` / `--vaul-visible-height` for custom layouts. The
 * focused field is then scrolled into view inside the drawer's own scroll container, so the page never pans.
 * Listeners exist only while `enabled`.
 */
export function useKeyboardAvoidance({
  enabled,
  drawerRef,
  topOffset,
}: {
  enabled: boolean;
  drawerRef: React.RefObject<HTMLDivElement | null>;
  /** Space kept free above the drawer, below the top safe area, in px. */
  topOffset: number;
}) {
  const [isKeyboardOpen, setIsKeyboardOpen] = React.useState(false);

  React.useEffect(() => {
    const viewport = window.visualViewport;
    if (!enabled || !viewport) return;

    let frame = 0;
    // The element the keyboard styles were written to, so cleanup restores exactly that one.
    let styledDrawer: HTMLElement | null = null;
    let revealedField: Element | null = null;
    let revealedGeometry = '';

    const clearKeyboardStyles = () => {
      restoreStyles(styledDrawer, KEYBOARD_STYLES);
      styledDrawer?.removeAttribute('data-vaul-keyboard');
      styledDrawer = null;
    };

    const apply = () => {
      frame = 0;
      const drawer = drawerRef.current;
      if (!drawer) return;
      // Pinch zoom shrinks the visual viewport without a keyboard.
      if (Math.abs(viewport.scale - 1) > 0.01) return;

      const field = document.activeElement;
      const hasFieldFocus = isEditable(field) && drawer.contains(field);
      const inset = Math.max(0, Math.round(window.innerHeight - viewport.height - viewport.offsetTop));
      const open = hasFieldFocus && inset > KEYBOARD_THRESHOLD;
      setIsKeyboardOpen(open);

      if (!open) {
        clearKeyboardStyles();
        revealedField = null;
        revealedGeometry = '';
        return;
      }

      const visibleHeight = Math.round(viewport.height);
      styledDrawer = drawer;
      setStyles(drawer, {
        bottom: `${inset}px`,
        'max-height': `calc(${visibleHeight}px - env(safe-area-inset-top, 0px) - ${topOffset}px)`,
        '--vaul-keyboard-inset': `${inset}px`,
        '--vaul-visible-height': `${visibleHeight}px`,
      });
      drawer.setAttribute('data-vaul-keyboard', 'open');

      // Only when the field or the geometry changed: revealing on every event would fight someone scrolling.
      const geometry = `${inset}|${visibleHeight}`;
      if (field === revealedField && geometry === revealedGeometry) return;
      revealedField = field;
      revealedGeometry = geometry;

      const container = findScrollContainer(field, drawer);
      if (!container) return;
      // Reading the rects forces layout with the styles written above, so the drawer is measured at its new size.
      const delta = getFieldScrollDelta({
        field: field.getBoundingClientRect(),
        container: container.getBoundingClientRect(),
        visibleTop: viewport.offsetTop,
        visibleBottom: viewport.offsetTop + viewport.height,
      });
      if (delta !== 0) container.scrollBy({ top: delta });
    };

    // The viewport fires at touch frequency while the keyboard animates; coalesce to one pass per frame.
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(apply);
    };

    schedule();
    viewport.addEventListener('resize', schedule);
    viewport.addEventListener('scroll', schedule);
    document.addEventListener('focusin', schedule);
    document.addEventListener('focusout', schedule);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      viewport.removeEventListener('resize', schedule);
      viewport.removeEventListener('scroll', schedule);
      document.removeEventListener('focusin', schedule);
      document.removeEventListener('focusout', schedule);
      clearKeyboardStyles();
      setIsKeyboardOpen(false);
    };
  }, [enabled, drawerRef, topOffset]);

  return isKeyboardOpen;
}
