import React from 'react';
import type { DrawerDirection, DrawerPresentation } from './types';

type PointerHandler = (event: React.PointerEvent<HTMLDivElement>) => void;

export interface DrawerContextValue {
  drawerRef: React.RefObject<HTMLDivElement | null>;
  overlayRef: React.RefObject<HTMLDivElement | null>;
  onPress: PointerHandler;
  onRelease: (event: React.PointerEvent<HTMLDivElement> | null) => void;
  onDrag: PointerHandler;
  onNestedDrag: (event: React.PointerEvent<HTMLDivElement>, percentageDragged: number) => void;
  onNestedOpenChange: (o: boolean) => void;
  onNestedRelease: (event: React.PointerEvent<HTMLDivElement>, open: boolean) => void;
  /** A ref rather than state: a drag must not re-render the drawer's children. */
  isDraggingRef: React.RefObject<boolean>;
  dismissible: boolean;
  isOpen: boolean;
  snapPointsOffset: number[] | null;
  snapPoints?: (number | string)[] | null;
  activeSnapPointIndex?: number | null;
  modal: boolean;
  shouldFade: boolean;
  activeSnapPoint?: number | string | null;
  setActiveSnapPoint: (o: number | string | null) => void;
  closeDrawer: () => void;
  direction: DrawerDirection;
  presentation: DrawerPresentation;
  shouldScaleBackground: boolean;
  setBackgroundColorOnScale: boolean;
  noBodyStyles: boolean;
  handleOnly?: boolean;
  container?: HTMLElement | null;
  autoFocus?: boolean;
  shouldAnimate: React.RefObject<boolean>;
  /** True after the presentation switched while open, until the drawer closes. */
  skipEnterAnimation: boolean;
}

export const DrawerContext = React.createContext<DrawerContextValue | null>(null);

export function useDrawerContext() {
  const context = React.useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawerContext must be used within a Drawer.Root');
  }
  return context;
}
