import React from 'react';
import { isIOS } from './browser';
import {
  BORDER_RADIUS,
  DRAG_CLASS,
  OPACITY_TRANSITION,
  TRANSFORM_TRANSITION,
  VELOCITY_THRESHOLD,
  VELOCITY_WINDOW_MS,
} from './constants';
import {
  dampenValue,
  directionMultiplier,
  getScale,
  getTranslate,
  getWrapper,
  getWrapperScaleStyles,
  getWrapperTransform,
  isVertical,
  WRAPPER_OFFSET,
  translate,
} from './helpers';
import { setStyles } from './styles';
import { useLatestRef, useStableCallback } from './use-latest-ref';
import type { useSnapPoints } from './use-snap-points';
import type { DrawerDirection } from './types';

type PointerEvent = React.PointerEvent<HTMLDivElement>;
type Sample = { position: number; time: number };

type DragState = {
  isDragging: boolean;
  /** Set once `shouldDrag` allowed this gesture; it stays allowed until release. */
  isAllowed: boolean;
  pointerStart: number;
  startTime: number;
  /** The drawer's translation at press. Nothing moves it before the drag is allowed, so it needs no re-reading. */
  swipeAmountAtStart: number;
  size: number;
  wrapper: HTMLElement | null;
  samples: Sample[];
  lastTimeDragPrevented: number | null;
};

type SnapPoints = ReturnType<typeof useSnapPoints>;

export type DragOptions = {
  drawerRef: React.RefObject<HTMLDivElement | null>;
  overlayRef: React.RefObject<HTMLDivElement | null>;
  direction: DrawerDirection;
  isOpen: boolean;
  isDialog: boolean;
  dismissible: boolean;
  closeThreshold: number;
  scrollLockTimeout: number;
  shouldScaleBackground: boolean;
  snapPoints?: (number | string)[];
  fadeFromIndex?: number;
  snap: SnapPoints;
  /** `performance.now()` of the last open or top-snap, to let content settle before a drag may start. */
  openTimeRef: React.RefObject<number | null>;
  closeDrawer: () => void;
  onDrag?: (event: PointerEvent, percentageDragged: number) => void;
  onRelease?: (event: PointerEvent, open: boolean) => void;
};

function pointerPosition(event: PointerEvent, direction: DrawerDirection) {
  return isVertical(direction) ? event.pageY : event.pageX;
}

/**
 * Velocity at release in px/ms, from the samples in the last `VELOCITY_WINDOW_MS`, not the average of the whole drag.
 * Signed like `pointerStart - position`, so it can be compared with the direction of the whole drag.
 */
function releaseVelocity(samples: Sample[], fallback: number) {
  const last = samples[samples.length - 1];
  let firstIndex = samples.findIndex((sample) => last.time - sample.time <= VELOCITY_WINDOW_MS);
  // Nothing else inside the window means the pointer rested before release: measure from the sample before it.
  if (firstIndex === samples.length - 1) firstIndex -= 1;
  const first = samples[firstIndex];
  if (!first) return fallback;
  const elapsed = last.time - first.time;
  return elapsed > 0 ? (first.position - last.position) / elapsed : fallback;
}

export function useDrag(options: DragOptions) {
  const optionsRef = useLatestRef(options);
  const state = React.useRef<DragState>({
    isDragging: false,
    isAllowed: false,
    pointerStart: 0,
    startTime: 0,
    swipeAmountAtStart: 0,
    size: 0,
    wrapper: null,
    samples: [],
    lastTimeDragPrevented: null,
  });
  const isDraggingRef = React.useRef(false);

  const shouldDrag = React.useCallback(
    (el: EventTarget, isDraggingInDirection: boolean, swipeAmount: number) => {
      const { direction, openTimeRef, scrollLockTimeout, drawerRef } = optionsRef.current;
      const drag = state.current;
      // `Element`, not `HTMLElement`: an SVG icon is a common drag target, and pointer capture keeps it the target.
      let element: Element | null = el instanceof Element ? el : null;
      const now = performance.now();

      // Fixes https://github.com/emilkowalski/vaul/issues/483
      if (!element || element.tagName === 'SELECT') return false;
      if (element.closest('[data-vaul-no-drag]')) return false;
      if (direction === 'right' || direction === 'left') return true;

      // Allow scrolling when animating
      if (openTimeRef.current !== null && now - openTimeRef.current < 500) return false;

      if (direction === 'bottom' ? swipeAmount > 0 : swipeAmount < 0) return true;

      // Don't drag if there's highlighted text
      if (window.getSelection()?.toString()) return false;

      // Disallow dragging if drawer was scrolled within `scrollLockTimeout`
      if (
        drag.lastTimeDragPrevented !== null &&
        now - drag.lastTimeDragPrevented < scrollLockTimeout &&
        swipeAmount === 0
      ) {
        drag.lastTimeDragPrevented = now;
        return false;
      }

      if (isDraggingInDirection) {
        drag.lastTimeDragPrevented = now;
        // We are dragging down so we should allow scrolling
        return false;
      }

      // Keep climbing up the DOM tree as long as there's a parent
      while (element) {
        if (element.scrollHeight > element.clientHeight) {
          if (element.scrollTop !== 0) {
            drag.lastTimeDragPrevented = now;
            // The element is scrollable and not scrolled to the top, so don't drag
            return false;
          }
          if (element.getAttribute('role') === 'dialog') return true;
        }
        // Ancestors above the drawer (e.g. a scrolled page when the drawer isn't `position: fixed`) must not block it.
        if (element === drawerRef.current) return true;
        element = element.parentElement;
      }

      // No scrollable parents not scrolled to the top found, so drag
      return true;
    },
    [optionsRef],
  );

  const endDrag = React.useCallback(() => {
    const drag = state.current;
    optionsRef.current.drawerRef.current?.classList.remove(DRAG_CLASS);
    drag.isAllowed = false;
    drag.isDragging = false;
    isDraggingRef.current = false;
  }, [optionsRef]);

  const cancelDrag = React.useCallback(() => {
    if (state.current.isDragging) endDrag();
  }, [endDrag]);

  const onPress = useStableCallback((event: PointerEvent) => {
    const { isDialog, dismissible, snapPoints, drawerRef, direction, shouldScaleBackground } = optionsRef.current;
    const drawer = drawerRef.current;
    if (isDialog || (!dismissible && !snapPoints)) return;
    if (!drawer || !(event.target instanceof Element) || !drawer.contains(event.target)) return;
    // No pointer capture on no-drag targets: it would swallow their own clicks (e.g. inputs inside shadow DOM).
    if (event.target.closest('[data-vaul-no-drag]')) return;

    const rect = drawer.getBoundingClientRect();
    const position = pointerPosition(event, direction);
    Object.assign(state.current, {
      isDragging: true,
      isAllowed: false,
      pointerStart: position,
      startTime: event.timeStamp,
      swipeAmountAtStart: getTranslate(drawer, direction),
      size: isVertical(direction) ? rect.height : rect.width,
      wrapper: shouldScaleBackground ? getWrapper() : null,
      samples: [{ position, time: event.timeStamp }],
    } satisfies Partial<DragState>);
    isDraggingRef.current = true;

    // iOS doesn't trigger mouseUp after scrolling so we need to listen to touched in order to disallow dragging
    if (isIOS()) {
      window.addEventListener('touchend', () => (state.current.isAllowed = false), { once: true });
    }
    // Ensure we maintain correct pointer capture even when going outside of the drawer
    if (event.target instanceof Element) event.target.setPointerCapture(event.pointerId);
  });

  const onDrag = useStableCallback((event: PointerEvent) => {
    const drag = state.current;
    const {
      drawerRef,
      overlayRef,
      direction,
      snapPoints,
      dismissible,
      snap,
      fadeFromIndex,
      shouldScaleBackground,
      onDrag: onDragProp,
    } = optionsRef.current;
    const drawer = drawerRef.current;
    if (!drawer || !drag.isDragging) return;

    const position = pointerPosition(event, direction);
    const multiplier = directionMultiplier(direction);
    const draggedDistance = (drag.pointerStart - position) * multiplier;
    const isDraggingInDirection = draggedDistance > 0;

    // Pre condition for disallowing dragging in the close direction.
    const noCloseSnapPointsPreCondition = snapPoints && !dismissible && !isDraggingInDirection;

    // Disallow dragging down to close when first snap point is the active one and dismissible prop is set to false.
    if (noCloseSnapPointsPreCondition && snap.activeSnapPointIndex === 0) return;

    const absDraggedDistance = Math.abs(draggedDistance);

    // Calculate the percentage dragged, where 1 is the closed position
    const percentageDragged =
      snap.getPercentageDragged(absDraggedDistance, isDraggingInDirection) ?? absDraggedDistance / drag.size;

    // Disallow close dragging beyond the smallest snap point.
    if (noCloseSnapPointsPreCondition && percentageDragged >= 1) return;

    if (!drag.isAllowed) {
      if (!shouldDrag(event.target, isDraggingInDirection, drag.swipeAmountAtStart)) return;
      // If shouldDrag gave true once after pressing down on the drawer, it stays allowed until we let go.
      drag.isAllowed = true;
      drawer.classList.add(DRAG_CLASS);
      setStyles(drawer, { transition: 'none' });
      setStyles(overlayRef.current, { transition: 'none' });
    }

    drag.samples.push({ position, time: event.timeStamp });
    // The velocity only looks at the last stretch, so older samples can go.
    while (drag.samples.length > 2 && event.timeStamp - drag.samples[1].time > VELOCITY_WINDOW_MS) drag.samples.shift();

    if (snapPoints) snap.onDrag({ draggedDistance });

    // Run this only if snapPoints are not defined or if we are at the last snap point (highest one)
    if (isDraggingInDirection && !snapPoints) {
      const translateValue = Math.min(dampenValue(draggedDistance) * -1, 0) * multiplier;
      setStyles(drawer, { transform: translate(direction, translateValue) });
      return;
    }

    if (snap.shouldFade || (fadeFromIndex && snap.activeSnapPointIndex === fadeFromIndex - 1)) {
      onDragProp?.(event, percentageDragged);
      setStyles(overlayRef.current, { opacity: `${1 - percentageDragged}` });
    }

    if (drag.wrapper && shouldScaleBackground) {
      const scale = getScale();
      const scaleValue = Math.min(scale + percentageDragged * (1 - scale), 1);
      // The same offset as the resting scale, including the safe area, so the background doesn't jump.
      const wrapperOffset = `calc(${WRAPPER_OFFSET} * ${1 - percentageDragged})`;
      setStyles(drag.wrapper, {
        'border-radius': `${BORDER_RADIUS * (1 - percentageDragged)}px`,
        transform: getWrapperTransform(direction, scaleValue, wrapperOffset),
        transition: 'none',
      });
    }

    if (!snapPoints) {
      setStyles(drawer, { transform: translate(direction, absDraggedDistance * multiplier) });
    }
  });

  const resetDrawer = useStableCallback(() => {
    const { drawerRef, overlayRef, direction, shouldScaleBackground, isOpen } = optionsRef.current;
    const drawer = drawerRef.current;
    if (!drawer) return;
    const currentSwipeAmount = getTranslate(drawer, direction);

    setStyles(drawer, { transform: 'translate3d(0, 0, 0)', transition: TRANSFORM_TRANSITION });
    setStyles(overlayRef.current, { transition: OPACITY_TRANSITION, opacity: '1' });

    // Don't reset background if swiped upwards
    const wrapper = getWrapper();
    if (wrapper && shouldScaleBackground && currentSwipeAmount > 0 && isOpen) {
      setStyles(wrapper, getWrapperScaleStyles(direction));
    }
  });

  const onRelease = useStableCallback((event: PointerEvent | null) => {
    const drag = state.current;
    const {
      drawerRef,
      direction,
      snapPoints,
      snap,
      closeDrawer,
      closeThreshold,
      dismissible,
      onRelease: onReleaseProp,
    } = optionsRef.current;
    const drawer = drawerRef.current;
    if (!drag.isDragging || !drawer) return;

    endDrag();
    const swipeAmount = getTranslate(drawer, direction);
    if (!event || !shouldDrag(event.target, false, swipeAmount) || !swipeAmount || Number.isNaN(swipeAmount)) return;

    const position = pointerPosition(event, direction);
    drag.samples.push({ position, time: event.timeStamp });
    const distMoved = drag.pointerStart - position;
    const averageVelocity = distMoved / Math.max(event.timeStamp - drag.startTime, 1);
    const flickVelocity = releaseVelocity(drag.samples, averageVelocity);
    // The release decisions take their direction from the whole drag. A flick back against it, e.g. throwing a
    // half-dragged drawer back open, is a change of mind, not a fast swipe in the drag's direction.
    const velocity = Math.sign(flickVelocity) === Math.sign(distMoved) ? Math.abs(flickVelocity) : 0;

    if (snapPoints) {
      snap.onRelease({
        draggedDistance: distMoved * directionMultiplier(direction),
        closeDrawer,
        velocity,
        dismissible,
      });
      onReleaseProp?.(event, true);
      return;
    }

    // Moved upwards, don't do anything
    if (directionMultiplier(direction) * distMoved > 0) {
      resetDrawer();
      onReleaseProp?.(event, true);
      return;
    }

    if (velocity > VELOCITY_THRESHOLD) {
      closeDrawer();
      onReleaseProp?.(event, false);
      return;
    }

    const rect = drawer.getBoundingClientRect();
    const visibleSize = isVertical(direction)
      ? Math.min(rect.height, window.innerHeight)
      : Math.min(rect.width, window.innerWidth);
    if (Math.abs(swipeAmount) >= visibleSize * closeThreshold) {
      closeDrawer();
      onReleaseProp?.(event, false);
      return;
    }

    onReleaseProp?.(event, true);
    resetDrawer();
  });

  return { onPress, onDrag, onRelease, cancelDrag, isDraggingRef };
}
