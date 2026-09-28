import React from 'react';
import { directionMultiplier, isVertical, translate } from './helpers';
import { OPACITY_TRANSITION, TRANSFORM_TRANSITION, VELOCITY_THRESHOLD } from './constants';
import { setStyles } from './styles';
import { useControllableState } from './use-controllable-state';
import type { DrawerDirection } from './types';

type Size = { width: number; height: number };

function getWindowSize(): Size | undefined {
  return typeof window === 'undefined' ? undefined : { width: window.innerWidth, height: window.innerHeight };
}

/** The window size while `enabled`, updated at most once per frame. */
function useWindowSize(enabled: boolean) {
  const [size, setSize] = React.useState(getWindowSize);

  React.useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const onResize = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const next = getWindowSize();
        setSize((prev) => (prev && next && prev.width === next.width && prev.height === next.height ? prev : next));
      });
    };
    // The window may have changed size while this drawer was closed.
    onResize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [enabled]);

  return size;
}

export function useSnapPoints({
  activeSnapPointProp,
  setActiveSnapPointProp,
  snapPoints,
  drawerRef,
  overlayRef,
  fadeFromIndex,
  onSnapPointChange,
  direction = 'bottom',
  container,
  snapToSequentialPoint,
  isOpen,
  isDisabled = false,
}: {
  activeSnapPointProp?: number | string | null;
  setActiveSnapPointProp?(snapPoint: number | null | string): void;
  snapPoints?: (number | string)[];
  fadeFromIndex?: number;
  drawerRef: React.RefObject<HTMLDivElement | null>;
  overlayRef: React.RefObject<HTMLDivElement | null>;
  onSnapPointChange(activeSnapPointIndex: number): void;
  direction?: DrawerDirection;
  container?: HTMLElement | null | undefined;
  snapToSequentialPoint?: boolean;
  isOpen: boolean;
  /** While presenting as a dialog: keep the active snap point, but write no drawer styles. */
  isDisabled?: boolean;
}) {
  const [activeSnapPoint, setActiveSnapPoint] = useControllableState<string | number | null>({
    prop: activeSnapPointProp,
    defaultProp: snapPoints?.[0],
    onChange: setActiveSnapPointProp,
  });

  const hasSnapPoints = !!snapPoints && snapPoints.length > 0;
  const windowSize = useWindowSize(isOpen && hasSnapPoints);

  const isLastSnapPoint = React.useMemo(
    () => activeSnapPoint === snapPoints?.[snapPoints.length - 1] || null,
    [snapPoints, activeSnapPoint],
  );

  const activeSnapPointIndex = React.useMemo(
    () => snapPoints?.findIndex((snapPoint) => snapPoint === activeSnapPoint) ?? null,
    [snapPoints, activeSnapPoint],
  );

  const shouldFade =
    (snapPoints &&
      snapPoints.length > 0 &&
      (fadeFromIndex || fadeFromIndex === 0) &&
      !Number.isNaN(fadeFromIndex) &&
      snapPoints[fadeFromIndex] === activeSnapPoint) ||
    !snapPoints;

  const snapPointsOffset = React.useMemo(() => {
    const containerSize = container
      ? { width: container.getBoundingClientRect().width, height: container.getBoundingClientRect().height }
      : (windowSize ?? { width: 0, height: 0 });

    const containerLength = isVertical(direction) ? containerSize.height : containerSize.width;

    return (
      snapPoints?.map((snapPoint) => {
        const length = typeof snapPoint === 'string' ? parseInt(snapPoint, 10) : snapPoint * containerLength;
        if (!windowSize) return length;
        // Offset from the open position, towards the side the drawer comes from.
        return directionMultiplier(direction) * (containerLength - length);
      }) ?? []
    );
  }, [snapPoints, windowSize, container, direction]);

  const activeSnapPointOffset = React.useMemo(
    () => (activeSnapPointIndex !== null ? snapPointsOffset?.[activeSnapPointIndex] : null),
    [snapPointsOffset, activeSnapPointIndex],
  );

  const snapToPoint = React.useCallback(
    (dimension: number) => {
      const newSnapPointIndex = snapPointsOffset?.findIndex((snapPointDim) => snapPointDim === dimension) ?? null;
      onSnapPointChange(newSnapPointIndex);

      setStyles(drawerRef.current, {
        transition: TRANSFORM_TRANSITION,
        transform: translate(direction, dimension),
      });

      const hidesOverlay =
        snapPointsOffset &&
        newSnapPointIndex !== snapPointsOffset.length - 1 &&
        fadeFromIndex !== undefined &&
        newSnapPointIndex !== fadeFromIndex &&
        newSnapPointIndex < fadeFromIndex;
      setStyles(overlayRef.current, { transition: OPACITY_TRANSITION, opacity: hidesOverlay ? '0' : '1' });

      setActiveSnapPoint(snapPoints?.[Math.max(newSnapPointIndex, 0)]);
    },
    [
      drawerRef,
      snapPoints,
      snapPointsOffset,
      fadeFromIndex,
      overlayRef,
      setActiveSnapPoint,
      onSnapPointChange,
      direction,
    ],
  );

  React.useEffect(() => {
    if (isDisabled) return;
    if (activeSnapPoint || activeSnapPointProp) {
      const newIndex =
        snapPoints?.findIndex((snapPoint) => snapPoint === activeSnapPointProp || snapPoint === activeSnapPoint) ?? -1;
      if (snapPointsOffset && newIndex !== -1 && typeof snapPointsOffset[newIndex] === 'number') {
        snapToPoint(snapPointsOffset[newIndex] as number);
      }
    }
  }, [activeSnapPoint, activeSnapPointProp, snapPoints, snapPointsOffset, snapToPoint, isDisabled]);

  function onRelease({
    draggedDistance,
    closeDrawer,
    velocity,
    dismissible,
  }: {
    draggedDistance: number;
    closeDrawer: () => void;
    velocity: number;
    dismissible: boolean;
  }) {
    if (fadeFromIndex === undefined) return;

    const currentPosition =
      direction === 'bottom' || direction === 'right'
        ? (activeSnapPointOffset ?? 0) - draggedDistance
        : (activeSnapPointOffset ?? 0) + draggedDistance;
    const isOverlaySnapPoint = activeSnapPointIndex === fadeFromIndex - 1;
    const isFirst = activeSnapPointIndex === 0;
    const hasDraggedUp = draggedDistance > 0;

    if (isOverlaySnapPoint) {
      setStyles(overlayRef.current, { transition: OPACITY_TRANSITION });
    }

    if (!snapToSequentialPoint && velocity > 2 && !hasDraggedUp) {
      if (dismissible) closeDrawer();
      else snapToPoint(snapPointsOffset[0]); // snap to initial point
      return;
    }

    if (!snapToSequentialPoint && velocity > 2 && hasDraggedUp && snapPointsOffset && snapPoints) {
      snapToPoint(snapPointsOffset[snapPoints.length - 1] as number);
      return;
    }

    // Find the closest snap point to the current position
    const closestSnapPoint = snapPointsOffset?.reduce((prev, curr) => {
      if (typeof prev !== 'number' || typeof curr !== 'number') return prev;

      return Math.abs(curr - currentPosition) < Math.abs(prev - currentPosition) ? curr : prev;
    });

    const dim = isVertical(direction) ? window.innerHeight : window.innerWidth;
    if (velocity > VELOCITY_THRESHOLD && Math.abs(draggedDistance) < dim * 0.4) {
      const dragDirection = hasDraggedUp ? 1 : -1; // 1 = up, -1 = down

      // Don't do anything if we swipe upwards while being on the last snap point
      if (dragDirection > 0 && isLastSnapPoint && snapPoints) {
        snapToPoint(snapPointsOffset[snapPoints.length - 1]);
        return;
      }

      if (isFirst && dragDirection < 0 && dismissible) {
        closeDrawer();
      }

      if (activeSnapPointIndex === null) return;

      snapToPoint(snapPointsOffset[activeSnapPointIndex + dragDirection]);
      return;
    }

    snapToPoint(closestSnapPoint);
  }

  function onDrag({ draggedDistance }: { draggedDistance: number }) {
    if (activeSnapPointOffset === null) return;
    const newValue =
      direction === 'bottom' || direction === 'right'
        ? activeSnapPointOffset - draggedDistance
        : activeSnapPointOffset + draggedDistance;

    // Don't do anything if we exceed the last(biggest) snap point
    if ((direction === 'bottom' || direction === 'right') && newValue < snapPointsOffset[snapPointsOffset.length - 1]) {
      return;
    }
    if ((direction === 'top' || direction === 'left') && newValue > snapPointsOffset[snapPointsOffset.length - 1]) {
      return;
    }

    setStyles(drawerRef.current, { transform: translate(direction, newValue) });
  }

  function getPercentageDragged(absDraggedDistance: number, isDraggingDown: boolean) {
    if (!snapPoints || typeof activeSnapPointIndex !== 'number' || !snapPointsOffset || fadeFromIndex === undefined)
      return null;

    // If this is true we are dragging to a snap point that is supposed to have an overlay
    const isOverlaySnapPoint = activeSnapPointIndex === fadeFromIndex - 1;
    const isOverlaySnapPointOrHigher = activeSnapPointIndex >= fadeFromIndex;

    if (isOverlaySnapPointOrHigher && isDraggingDown) {
      return 0;
    }

    // Don't animate, but still use this one if we are dragging away from the overlaySnapPoint
    if (isOverlaySnapPoint && !isDraggingDown) return 1;
    if (!shouldFade && !isOverlaySnapPoint) return null;

    // Either fadeFrom index or the one before
    const targetSnapPointIndex = isOverlaySnapPoint ? activeSnapPointIndex + 1 : activeSnapPointIndex - 1;

    // Get the distance from overlaySnapPoint to the one before or vice-versa to calculate the opacity percentage accordingly
    const snapPointDistance = isOverlaySnapPoint
      ? snapPointsOffset[targetSnapPointIndex] - snapPointsOffset[targetSnapPointIndex - 1]
      : snapPointsOffset[targetSnapPointIndex + 1] - snapPointsOffset[targetSnapPointIndex];

    const percentageDragged = absDraggedDistance / Math.abs(snapPointDistance);

    return isOverlaySnapPoint ? 1 - percentageDragged : percentageDragged;
  }

  return {
    isLastSnapPoint,
    activeSnapPoint,
    shouldFade,
    getPercentageDragged,
    setActiveSnapPoint,
    activeSnapPointIndex,
    onRelease,
    onDrag,
    snapPointsOffset,
  };
}
