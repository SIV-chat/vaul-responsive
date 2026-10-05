import * as DialogPrimitive from '@radix-ui/react-dialog';
import React from 'react';
import {
  CLOSE_THRESHOLD,
  DIALOG_BREAKPOINT,
  SCROLL_LOCK_TIMEOUT,
  TRANSFORM_TRANSITION,
  TRANSITION_MS,
  WINDOW_TOP_OFFSET,
} from './constants';
import { DrawerContext, type DrawerContextValue } from './context';
import { getTranslate, getWrapper, nestedParentTransform, translate } from './helpers';
import { restoreStyles, setStyles } from './styles';
import type { DrawerDirection, DrawerPresentation, DrawerPresentationMode } from './types';
import { useControllableState } from './use-controllable-state';
import { useDrag } from './use-drag';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';
import { useKeyboardAvoidance } from './use-keyboard-avoidance';
import { useLatestRef, useStableCallback } from './use-latest-ref';
import { useMediaQuery } from './use-media-query';
import { usePositionFixed } from './use-position-fixed';
import { useSnapPoints, useStableSnapPoints } from './use-snap-points';

export interface WithFadeFromProps {
  /**
   * Array of numbers from 0 to 100 that corresponds to % of the screen a given snap point should take up.
   * Should go from least visible. Example `[0.2, 0.5, 0.8]`.
   * You can also use px values, which doesn't take screen height into account.
   */
  snapPoints: (number | string)[];
  /**
   * Index of a `snapPoint` from which the overlay fade should be applied. Defaults to the last snap point.
   */
  fadeFromIndex: number;
}

export interface WithoutFadeFromProps {
  /**
   * Array of numbers from 0 to 100 that corresponds to % of the screen a given snap point should take up.
   * Should go from least visible. Example `[0.2, 0.5, 0.8]`.
   * You can also use px values, which doesn't take screen height into account.
   */
  snapPoints?: (number | string)[];
  fadeFromIndex?: never;
}

export type DialogProps = {
  activeSnapPoint?: number | string | null;
  setActiveSnapPoint?: (snapPoint: number | string | null) => void;
  children?: React.ReactNode;
  open?: boolean;
  /**
   * Number between 0 and 1 that determines when the drawer should be closed.
   * Example: threshold of 0.5 would close the drawer if the user swiped for 50% of the height of the drawer or more.
   * @default 0.25
   */
  closeThreshold?: number;
  /**
   * When `true` the `body` doesn't get any styles assigned from Vaul
   */
  noBodyStyles?: boolean;
  onOpenChange?: (open: boolean) => void;
  shouldScaleBackground?: boolean;
  /**
   * When `false` we don't change body's background color when the drawer is open.
   * @default true
   */
  setBackgroundColorOnScale?: boolean;
  /**
   * Duration for which the drawer is not draggable after scrolling content inside of the drawer.
   * @default 100ms
   */
  scrollLockTimeout?: number;
  /**
   * When `true` only allows the drawer to be dragged by the `<Drawer.Handle />` component.
   * @default false
   */
  handleOnly?: boolean;
  /**
   * When `false` dragging, clicking outside, pressing esc, etc. will not close the drawer.
   * Use this in comination with the `open` prop, otherwise you won't be able to open/close the drawer.
   * @default true
   */
  dismissible?: boolean;
  onDrag?: (event: React.PointerEvent<HTMLDivElement>, percentageDragged: number) => void;
  onRelease?: (event: React.PointerEvent<HTMLDivElement>, open: boolean) => void;
  /**
   * When `false` it allows to interact with elements outside of the drawer without closing it.
   * @default true
   */
  modal?: boolean;
  nested?: boolean;
  onClose?: () => void;
  /**
   * Direction of the drawer. Can be `top` or `bottom`, `left`, `right`.
   * @default 'bottom'
   */
  direction?: DrawerDirection;
  /**
   * Opened by default, skips initial enter animation. Still reacts to `open` state changes
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * While a field inside a bottom drawer has focus and the on-screen keyboard is up, rest the drawer on the
   * keyboard, fit it to the visible area, move to the last snap point and scroll the field into view.
   * Set to `false` to handle the keyboard yourself; `data-vaul-keyboard` and the CSS variables are then not set.
   * @default true
   */
  repositionInputs?: boolean;
  /**
   * Space in px kept free above a drawer resting on the keyboard, below the top safe area.
   * @default 26
   */
  keyboardTopOffset?: number;
  /**
   * Disabled velocity based swiping for snap points.
   * This means that a snap point won't be skipped even if the velocity is high enough.
   * Useful if each snap point in a drawer is equally important.
   * @default false
   */
  snapToSequentialPoint?: boolean;
  container?: HTMLElement | null;
  /**
   * Gets triggered after the open or close animation ends, it receives an `open` argument with the `open` state of the drawer by the time the function was triggered.
   * Useful to revert any state changes for example.
   */
  onAnimationEnd?: (open: boolean) => void;
  preventScrollRestoration?: boolean;
  autoFocus?: boolean;
  /**
   * `responsive` (default) is a drawer below `dialogBreakpoint` and a dialog from it up. `drawer` is plain Vaul,
   * which side drawers usually want. `dialog` presents the same Radix dialog without any drawer behavior.
   * Switching keeps the dialog mounted, so the content, its state, focus and scroll position survive the change.
   */
  presentation?: DrawerPresentationMode;
  /**
   * Viewport width in px from which `responsive` presents as a dialog.
   * @default 768
   */
  dialogBreakpoint?: number;
} & (WithFadeFromProps | WithoutFadeFromProps);

function resolvePresentation(mode: DrawerPresentationMode, isWideViewport: boolean): DrawerPresentation {
  if (mode !== 'responsive') return mode;
  return isWideViewport ? 'dialog' : 'drawer';
}

export function Root({
  open: openProp,
  onOpenChange,
  children,
  onDrag: onDragProp,
  onRelease: onReleaseProp,
  snapPoints: snapPointsProp,
  shouldScaleBackground = false,
  setBackgroundColorOnScale = true,
  closeThreshold = CLOSE_THRESHOLD,
  scrollLockTimeout = SCROLL_LOCK_TIMEOUT,
  dismissible = true,
  handleOnly = false,
  fadeFromIndex = snapPointsProp && snapPointsProp.length - 1,
  activeSnapPoint: activeSnapPointProp,
  setActiveSnapPoint: setActiveSnapPointProp,
  modal = true,
  onClose,
  nested,
  noBodyStyles = false,
  direction = 'bottom',
  defaultOpen = false,
  snapToSequentialPoint = false,
  preventScrollRestoration = false,
  repositionInputs = true,
  keyboardTopOffset = WINDOW_TOP_OFFSET,
  onAnimationEnd,
  container,
  autoFocus = false,
  presentation: presentationMode = 'responsive',
  dialogBreakpoint = DIALOG_BREAKPOINT,
}: DialogProps) {
  const snapPoints = useStableSnapPoints(snapPointsProp);
  const isWideViewport = useMediaQuery(
    presentationMode === 'responsive' ? `(min-width: ${dialogBreakpoint}px)` : undefined,
  );
  const presentation = resolvePresentation(presentationMode, isWideViewport);
  const isDialog = presentation === 'dialog';

  const [isOpen = false, setIsOpen] = useControllableState({
    defaultProp: defaultOpen,
    prop: openProp,
    onChange: (o: boolean) => {
      onOpenChange?.(o);

      if (!o && !nested) {
        restorePositionSetting();
      }

      window.setTimeout(() => {
        onAnimationEnd?.(o);
      }, TRANSITION_MS);

      if (!o) {
        // This will be removed when the exit animation ends (`500ms`)
        document.body.style.pointerEvents = 'auto';
      }
    },
  });
  const [hasBeenOpened, setHasBeenOpened] = React.useState(false);

  // Once the presentation switches while open, the new one skips its enter animation until the drawer closes;
  // switching back must not replay it either. Updated during render, so the first commit of a switch has it.
  const [presentedAs, setPresentedAs] = React.useState(presentation);
  const [skipEnterAnimation, setSkipEnterAnimation] = React.useState(false);
  if (presentation !== presentedAs) {
    setPresentedAs(presentation);
    if (isOpen) setSkipEnterAnimation(true);
  }
  if (!isOpen && skipEnterAnimation) setSkipEnterAnimation(false);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const openTimeRef = React.useRef<number | null>(null);
  const shouldAnimate = React.useRef(!defaultOpen);
  const nestedOpenChangeTimer = React.useRef<number | null>(null);
  // Whether a `NestedRoot` inside this drawer is open, also while presenting as a dialog, so switching back to a
  // drawer can push this one back again.
  const isNestedOpenRef = React.useRef(false);

  const onSnapPointChange = React.useCallback(
    (activeSnapPointIndex: number) => {
      // Prevent dragging for 500ms after reaching the last snap point, in case its content is scrollable.
      if (snapPoints && activeSnapPointIndex === snapPoints.length - 1) openTimeRef.current = performance.now();
    },
    [snapPoints],
  );

  const snap = useSnapPoints({
    snapPoints,
    activeSnapPointProp,
    setActiveSnapPointProp,
    drawerRef,
    fadeFromIndex,
    overlayRef,
    onSnapPointChange,
    direction,
    container,
    snapToSequentialPoint,
    isOpen,
    isDisabled: isDialog,
    isPushedBackRef: isNestedOpenRef,
  });
  const { activeSnapPoint, activeSnapPointIndex, setActiveSnapPoint, snapPointsOffset, shouldFade } = snap;
  // Where this drawer rests on its own: its active snap point, if any. A nested drawer pushes it back from there.
  const restingOffset =
    snapPoints && !isDialog && activeSnapPointIndex !== null ? (snapPointsOffset[activeSnapPointIndex] ?? 0) : 0;

  // A dialog relies on Radix's own scroll lock; switching to one restores the body.
  const { restorePositionSetting } = usePositionFixed({
    isOpen: isOpen && !isDialog,
    modal,
    nested: nested ?? false,
    hasBeenOpened,
    preventScrollRestoration,
    noBodyStyles,
  });

  const isKeyboardOpen = useKeyboardAvoidance({
    enabled: isOpen && !isDialog && repositionInputs && direction === 'bottom',
    drawerRef,
    topOffset: keyboardTopOffset,
  });

  const closeDrawer = useStableCallback((fromWithin?: boolean) => {
    cancelDrag();
    onClose?.();

    if (!fromWithin) {
      setIsOpen(false);
    }

    window.setTimeout(() => {
      if (snapPoints) {
        setActiveSnapPoint(snapPoints[0]);
      }
    }, TRANSITION_MS);
  });

  const { onPress, onDrag, onRelease, cancelDrag, isDraggingRef } = useDrag({
    drawerRef,
    overlayRef,
    direction,
    isOpen,
    isDialog,
    dismissible,
    closeThreshold,
    scrollLockTimeout,
    shouldScaleBackground,
    snapPoints,
    fadeFromIndex,
    snap,
    openTimeRef,
    closeDrawer,
    onDrag: onDragProp,
    onRelease: onReleaseProp,
  });

  // A compact snap point can leave less than the keyboard's height visible, so typing would happen behind
  // the keyboard. Expand while it's up and return to the chosen point once it closes, unless it was moved since.
  const activeSnapPointRef = useLatestRef(activeSnapPoint);
  const snapBeforeKeyboardRef = React.useRef<number | string | null | undefined>(undefined);
  React.useEffect(() => {
    if (!snapPoints || snapPoints.length === 0) return;
    const lastSnapPoint = snapPoints[snapPoints.length - 1];
    if (isKeyboardOpen) {
      if (activeSnapPointRef.current === lastSnapPoint) return;
      snapBeforeKeyboardRef.current = activeSnapPointRef.current;
      setActiveSnapPoint(lastSnapPoint);
      return;
    }
    const previous = snapBeforeKeyboardRef.current;
    snapBeforeKeyboardRef.current = undefined;
    if (previous !== undefined && activeSnapPointRef.current === lastSnapPoint) setActiveSnapPoint(previous);
  }, [isKeyboardOpen, snapPoints, setActiveSnapPoint, activeSnapPointRef]);

  React.useEffect(() => {
    window.requestAnimationFrame(() => {
      shouldAnimate.current = true;
    });
  }, []);

  React.useEffect(() => {
    if (!isOpen) return;
    setStyles(document.documentElement, { 'scroll-behavior': 'auto' });
    openTimeRef.current = performance.now();
    return () => restoreStyles(document.documentElement, ['scroll-behavior']);
  }, [isOpen]);

  React.useEffect(() => {
    // Radix locks pointer events on the body for modal dialogs; a non-modal drawer must leave the page usable.
    // Re-run on open too, so a drawer opened through a controlled `open` prop is covered.
    if (!modal && isOpen) {
      window.requestAnimationFrame(() => {
        document.body.style.pointerEvents = 'auto';
      });
    }
  }, [modal, isOpen]);

  // A switch lands in one frame. The new presentation's attributes are committed but not styled yet, so styles
  // are recalculated once here with transitions off: nothing animates from the old presentation's values, and no
  // frame is painted with the drawer's inline position still on a dialog.
  const previousPresentationRef = React.useRef(presentation);
  useIsomorphicLayoutEffect(() => {
    if (previousPresentationRef.current === presentation) return;
    previousPresentationRef.current = presentation;

    if (isDialog) {
      // Drags and snap points leave their position inline; a dialog is positioned by its own styles.
      cancelDrag();
      restoreStyles(drawerRef.current, ['transform', 'transition']);
      restoreStyles(overlayRef.current, ['opacity', 'transition']);
    } else if (isNestedOpenRef.current) {
      setStyles(drawerRef.current, {
        transition: TRANSFORM_TRANSITION,
        transform: nestedParentTransform(direction, 1, restingOffset),
      });
    }

    const elements = [drawerRef.current, overlayRef.current, shouldScaleBackground ? getWrapper() : null];
    for (const element of elements) element?.setAttribute('data-vaul-switching', '');
    // Reading layout applies the pending styles now, while transitions are off.
    document.body.getBoundingClientRect();
    for (const element of elements) element?.removeAttribute('data-vaul-switching');
  }, [presentation, isDialog, cancelDrag, shouldScaleBackground, direction, restingOffset]);

  React.useEffect(() => {
    // A nested drawer unmounts with this one's content without reporting that it closed.
    if (!isOpen) isNestedOpenRef.current = false;
  }, [isOpen]);

  // A nested drawer reports its open state to its parent whenever it changes, however it changed: its trigger, a
  // drag, dismissing, or a controlled `open`. Callbacks would miss a controlled change.
  const parentDrawer = React.useContext(DrawerContext);
  const onParentNestedOpenChange = nested ? parentDrawer?.onNestedOpenChange : undefined;
  const reportedOpenRef = React.useRef(false);
  useIsomorphicLayoutEffect(() => {
    if (!onParentNestedOpenChange || reportedOpenRef.current === isOpen) return;
    reportedOpenRef.current = isOpen;
    onParentNestedOpenChange(isOpen);
  }, [isOpen, onParentNestedOpenChange]);

  const onNestedOpenChange = useStableCallback((o: boolean) => {
    isNestedOpenRef.current = o;
    if (isDialog) return;

    if (nestedOpenChangeTimer.current) {
      window.clearTimeout(nestedOpenChangeTimer.current);
    }

    setStyles(drawerRef.current, {
      transition: TRANSFORM_TRANSITION,
      transform: nestedParentTransform(direction, o ? 1 : 0, restingOffset),
    });

    if (!o && drawerRef.current) {
      nestedOpenChangeTimer.current = window.setTimeout(() => {
        const drawer = drawerRef.current;
        if (!drawer) return;
        setStyles(drawer, { transition: 'none', transform: translate(direction, getTranslate(drawer, direction)) });
      }, TRANSITION_MS);
    }
  });

  const onNestedDrag = useStableCallback((_event: React.PointerEvent<HTMLDivElement>, percentageDragged: number) => {
    if (percentageDragged < 0 || isDialog) return;

    setStyles(drawerRef.current, {
      transform: nestedParentTransform(direction, 1 - percentageDragged, restingOffset),
      transition: 'none',
    });
  });

  const onNestedRelease = useStableCallback((_event: React.PointerEvent<HTMLDivElement>, o: boolean) => {
    if (isDialog || !o) return;
    // The same scale as opening, which Vaul took from the height here and made the parent jump on release.
    setStyles(drawerRef.current, {
      transition: TRANSFORM_TRANSITION,
      transform: nestedParentTransform(direction, 1, restingOffset),
    });
  });

  const contextValue = React.useMemo<DrawerContextValue>(
    () => ({
      activeSnapPoint,
      snapPoints,
      setActiveSnapPoint,
      drawerRef,
      overlayRef,
      onPress,
      onRelease,
      onDrag,
      dismissible,
      shouldAnimate,
      skipEnterAnimation,
      handleOnly,
      isOpen,
      isDraggingRef,
      shouldFade,
      closeDrawer,
      onNestedDrag,
      onNestedOpenChange,
      onNestedRelease,
      modal,
      snapPointsOffset,
      activeSnapPointIndex,
      direction,
      presentation,
      shouldScaleBackground,
      setBackgroundColorOnScale,
      noBodyStyles,
      container,
      autoFocus,
    }),
    [
      activeSnapPoint,
      snapPoints,
      setActiveSnapPoint,
      onPress,
      onRelease,
      onDrag,
      dismissible,
      skipEnterAnimation,
      handleOnly,
      isOpen,
      isDraggingRef,
      shouldFade,
      closeDrawer,
      onNestedDrag,
      onNestedOpenChange,
      onNestedRelease,
      modal,
      snapPointsOffset,
      activeSnapPointIndex,
      direction,
      presentation,
      shouldScaleBackground,
      setBackgroundColorOnScale,
      noBodyStyles,
      container,
      autoFocus,
    ],
  );

  return (
    <DialogPrimitive.Root
      defaultOpen={defaultOpen}
      onOpenChange={(open) => {
        if (!dismissible && !open) return;
        if (open) {
          setHasBeenOpened(true);
        } else {
          closeDrawer(true);
        }

        setIsOpen(open);
      }}
      open={isOpen}
      modal={modal}
    >
      <DrawerContext.Provider value={contextValue}>{children}</DrawerContext.Provider>
    </DialogPrimitive.Root>
  );
}

export function NestedRoot({ onDrag, onRelease, ...rest }: DialogProps) {
  const parent = React.useContext(DrawerContext);

  if (!parent) {
    throw new Error('Drawer.NestedRoot must be placed in another drawer');
  }
  const { onNestedDrag, onNestedRelease } = parent;

  // The consumer's props go first, so their `onDrag` / `onRelease` are chained instead of replacing the parent's.
  // Opening and closing reach the parent from `Root` itself (see `onParentNestedOpenChange`).
  return (
    <Root
      {...rest}
      nested
      onDrag={(e, p) => {
        onNestedDrag(e, p);
        onDrag?.(e, p);
      }}
      onRelease={(e, o) => {
        onNestedRelease(e, o);
        onRelease?.(e, o);
      }}
    />
  );
}
