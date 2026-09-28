import * as DialogPrimitive from '@radix-ui/react-dialog';
import React from 'react';
import { useDrawerContext } from './context';
import { directionMultiplier } from './helpers';
import type { DrawerDirection } from './types';
import { useComposedRefs } from './use-composed-refs';
import { useScaleBackground } from './use-scale-background';

export const Overlay = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>>(
  function Overlay(props, ref) {
    const { overlayRef, snapPoints, onRelease, shouldFade, isOpen, modal, shouldAnimate, presentation } =
      useDrawerContext();
    const composedRef = useComposedRefs(ref, overlayRef);
    const isDialog = presentation === 'dialog';
    const hasSnapPoints = !!snapPoints && snapPoints.length > 0 && !isDialog;

    // Overlay is the component that is locking scroll, removing it will unlock the scroll without having to dig into Radix's Dialog library
    if (!modal) {
      return null;
    }

    return (
      <DialogPrimitive.Overlay
        onPointerUp={onRelease}
        ref={composedRef}
        // Like the content, a dialog overlay opts out of every drawer style.
        data-vaul-overlay={isDialog ? undefined : ''}
        data-vaul-dialog-overlay={isDialog ? '' : undefined}
        data-vaul-snap-points={isOpen && hasSnapPoints ? 'true' : 'false'}
        data-vaul-snap-points-overlay={isOpen && shouldFade ? 'true' : 'false'}
        data-vaul-animate={shouldAnimate.current ? 'true' : 'false'}
        data-vaul-presentation={presentation}
        {...props}
      />
    );
  },
);

Overlay.displayName = 'Drawer.Overlay';

export type ContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>;

export const Content = React.forwardRef<HTMLDivElement, ContentProps>(function Content(
  { onPointerDownOutside, style, onOpenAutoFocus, ...rest },
  ref,
) {
  const {
    drawerRef,
    onPress,
    onRelease,
    onDrag,
    snapPointsOffset,
    activeSnapPointIndex,
    modal,
    isOpen,
    direction,
    snapPoints,
    container,
    handleOnly,
    shouldAnimate,
    autoFocus,
    presentation,
  } = useDrawerContext();
  // Needed to use transition instead of animations
  const [delayedSnapPoints, setDelayedSnapPoints] = React.useState(false);
  const composedRef = useComposedRefs(ref, drawerRef);
  const pointerStartRef = React.useRef<{ x: number; y: number } | null>(null);
  const lastKnownPointerEventRef = React.useRef<React.PointerEvent<HTMLDivElement> | null>(null);
  const wasBeyondThePointRef = React.useRef(false);
  const hasSnapPoints = !!snapPoints && snapPoints.length > 0;
  const isDialog = presentation === 'dialog';
  // Drag gestures only start on the content when the whole drawer is draggable.
  const canDrag = !handleOnly && !isDialog;
  useScaleBackground();

  // Runs on every pointer move, so it takes plain numbers rather than allocating a delta object.
  const isDeltaInDirection = (x: number, y: number, dragDirection: DrawerDirection, threshold = 0) => {
    if (wasBeyondThePointRef.current) return true;

    const deltaY = Math.abs(y);
    const deltaX = Math.abs(x);
    const isDeltaX = deltaX > deltaY;
    const dFactor = directionMultiplier(dragDirection);

    if (dragDirection === 'left' || dragDirection === 'right') {
      const isReverseDirection = x * dFactor < 0;
      if (!isReverseDirection && deltaX >= 0 && deltaX <= threshold) {
        return isDeltaX;
      }
    } else {
      const isReverseDirection = y * dFactor < 0;
      if (!isReverseDirection && deltaY >= 0 && deltaY <= threshold) {
        return !isDeltaX;
      }
    }

    wasBeyondThePointRef.current = true;
    return true;
  };

  React.useEffect(() => {
    if (!hasSnapPoints) return;
    window.requestAnimationFrame(() => {
      setDelayedSnapPoints(true);
    });
  }, [hasSnapPoints]);

  function handleOnPointerUp(event: React.PointerEvent<HTMLDivElement> | null) {
    pointerStartRef.current = null;
    wasBeyondThePointRef.current = false;
    onRelease(event);
  }

  return (
    <DialogPrimitive.Content
      data-vaul-drawer-direction={direction}
      // Every drawer style keys off `data-vaul-drawer`; a dialog gets its own attribute instead.
      data-vaul-drawer={isDialog ? undefined : ''}
      data-vaul-dialog={isDialog ? '' : undefined}
      data-vaul-presentation={presentation}
      data-vaul-delayed-snap-points={delayedSnapPoints ? 'true' : 'false'}
      data-vaul-snap-points={isOpen && hasSnapPoints && !isDialog ? 'true' : 'false'}
      data-vaul-custom-container={container ? 'true' : 'false'}
      data-vaul-animate={shouldAnimate.current ? 'true' : 'false'}
      {...rest}
      ref={composedRef}
      style={
        snapPointsOffset && snapPointsOffset.length > 0 && !isDialog
          ? ({
              '--snap-point-height': `${snapPointsOffset[activeSnapPointIndex ?? 0]!}px`,
              ...style,
            } as React.CSSProperties)
          : style
      }
      onPointerDown={(event) => {
        rest.onPointerDown?.(event);
        if (!canDrag) return;
        pointerStartRef.current = { x: event.pageX, y: event.pageY };
        onPress(event);
      }}
      onOpenAutoFocus={(e) => {
        onOpenAutoFocus?.(e);

        if (!autoFocus) {
          e.preventDefault();
        }
      }}
      onPointerDownOutside={(e) => {
        onPointerDownOutside?.(e);

        if (!modal || e.defaultPrevented) {
          e.preventDefault();
        }
      }}
      onFocusOutside={(e) => {
        rest.onFocusOutside?.(e);
        if (!modal) {
          e.preventDefault();
        }
      }}
      onPointerMove={(event) => {
        lastKnownPointerEventRef.current = event;
        rest.onPointerMove?.(event);
        if (!canDrag || !pointerStartRef.current) return;
        const yPosition = event.pageY - pointerStartRef.current.y;
        const xPosition = event.pageX - pointerStartRef.current.x;

        const swipeStartThreshold = event.pointerType === 'touch' ? 10 : 2;

        const isAllowedToSwipe = isDeltaInDirection(xPosition, yPosition, direction, swipeStartThreshold);
        if (isAllowedToSwipe) onDrag(event);
        else if (Math.abs(xPosition) > swipeStartThreshold || Math.abs(yPosition) > swipeStartThreshold) {
          pointerStartRef.current = null;
        }
      }}
      onPointerUp={(event) => {
        rest.onPointerUp?.(event);
        pointerStartRef.current = null;
        wasBeyondThePointRef.current = false;
        onRelease(event);
      }}
      onPointerOut={(event) => {
        rest.onPointerOut?.(event);
        handleOnPointerUp(lastKnownPointerEventRef.current);
      }}
      onContextMenu={(event) => {
        rest.onContextMenu?.(event);
        if (lastKnownPointerEventRef.current) {
          handleOnPointerUp(lastKnownPointerEventRef.current);
        }
      }}
    />
  );
});

Content.displayName = 'Drawer.Content';

export type HandleProps = React.ComponentPropsWithoutRef<'div'> & {
  preventCycle?: boolean;
};

const LONG_HANDLE_PRESS_TIMEOUT = 250;
const DOUBLE_TAP_TIMEOUT = 120;

export const Handle = React.forwardRef<HTMLDivElement, HandleProps>(function Handle(
  { preventCycle = false, children, ...rest },
  ref,
) {
  const {
    closeDrawer,
    isDraggingRef,
    snapPoints,
    activeSnapPoint,
    setActiveSnapPoint,
    dismissible,
    handleOnly,
    isOpen,
    onPress,
    onDrag,
    presentation,
  } = useDrawerContext();

  const closeTimeoutIdRef = React.useRef<number | null>(null);
  const shouldCancelInteractionRef = React.useRef(false);

  function handleStartCycle() {
    // Stop if this is the second click of a double click
    if (shouldCancelInteractionRef.current) {
      handleCancelInteraction();
      return;
    }
    window.setTimeout(() => {
      handleCycleSnapPoints();
    }, DOUBLE_TAP_TIMEOUT);
  }

  function handleCycleSnapPoints() {
    // Prevent accidental taps while resizing drawer
    if (isDraggingRef.current || preventCycle || shouldCancelInteractionRef.current) {
      handleCancelInteraction();
      return;
    }
    // Make sure to clear the timeout id if the user releases the handle before the cancel timeout
    handleCancelInteraction();

    if (!snapPoints || snapPoints.length === 0) {
      if (!dismissible) {
        closeDrawer();
      }
      return;
    }

    const isLastSnapPoint = activeSnapPoint === snapPoints[snapPoints.length - 1];

    if (isLastSnapPoint && dismissible) {
      closeDrawer();
      return;
    }

    const currentSnapIndex = snapPoints.findIndex((point) => point === activeSnapPoint);
    if (currentSnapIndex === -1) return; // activeSnapPoint not found in snapPoints
    const nextSnapPoint = snapPoints[currentSnapIndex + 1];
    setActiveSnapPoint(nextSnapPoint);
  }

  function handleStartInteraction() {
    closeTimeoutIdRef.current = window.setTimeout(() => {
      // Cancel click interaction on a long press
      shouldCancelInteractionRef.current = true;
    }, LONG_HANDLE_PRESS_TIMEOUT);
  }

  function handleCancelInteraction() {
    if (closeTimeoutIdRef.current) {
      window.clearTimeout(closeTimeoutIdRef.current);
    }
    shouldCancelInteractionRef.current = false;
  }

  return (
    <div
      onClick={handleStartCycle}
      onPointerCancel={handleCancelInteraction}
      onPointerDown={(e) => {
        if (handleOnly) onPress(e);
        handleStartInteraction();
      }}
      onPointerMove={(e) => {
        if (handleOnly) onDrag(e);
      }}
      // onPointerUp is already handled by the content component
      ref={ref}
      data-vaul-drawer-visible={isOpen ? 'true' : 'false'}
      data-vaul-handle=""
      data-vaul-presentation={presentation}
      aria-hidden="true"
      {...rest}
    >
      {/* Expand handle's hit area beyond what's visible to ensure a 44x44 tap target for touch devices */}
      <span data-vaul-handle-hitarea="" aria-hidden="true">
        {children}
      </span>
    </div>
  );
});

Handle.displayName = 'Drawer.Handle';

type PortalProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Portal>;

export function Portal(props: PortalProps) {
  const context = useDrawerContext();
  const { container = context.container, ...portalProps } = props;

  return <DialogPrimitive.Portal container={container} {...portalProps} />;
}
