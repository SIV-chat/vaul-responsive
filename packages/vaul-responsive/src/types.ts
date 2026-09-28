export type DrawerDirection = 'top' | 'bottom' | 'left' | 'right';
/**
 * How the drawer presents itself. `dialog` keeps the same mounted Radix dialog
 * but drops everything drawer-specific: dragging, snap point transforms, body
 * locking, keyboard handling and the built-in drawer styles.
 */
export type DrawerPresentation = 'drawer' | 'dialog';
/** The `presentation` prop: a fixed presentation, or `responsive` to switch at `dialogBreakpoint`. */
export type DrawerPresentationMode = DrawerPresentation | 'responsive';
