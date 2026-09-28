export const TRANSITIONS = {
  DURATION: 0.5,
  EASE: [0.32, 0.72, 0, 1],
} as const;

export const TRANSITION_MS = TRANSITIONS.DURATION * 1000;
export const EASING = `cubic-bezier(${TRANSITIONS.EASE.join(',')})`;
export const TRANSFORM_TRANSITION = `transform ${TRANSITIONS.DURATION}s ${EASING}`;
export const OPACITY_TRANSITION = `opacity ${TRANSITIONS.DURATION}s ${EASING}`;

/** px/ms at release above which a drag counts as a flick. */
export const VELOCITY_THRESHOLD = 0.4;
/** Release velocity is measured over the pointer samples from this last stretch of the drag. */
export const VELOCITY_WINDOW_MS = 100;

export const CLOSE_THRESHOLD = 0.25;

export const SCROLL_LOCK_TIMEOUT = 100;

export const BORDER_RADIUS = 8;

export const NESTED_DISPLACEMENT = 16;

export const WINDOW_TOP_OFFSET = 26;

export const DRAG_CLASS = 'vaul-dragging';

/** Default `dialogBreakpoint` for the `responsive` presentation, in px. */
export const DIALOG_BREAKPOINT = 768;

/** How much the visual viewport must shrink below the layout viewport before it counts as a keyboard, in px. */
export const KEYBOARD_THRESHOLD = 60;
/** Space kept between a focused field and the keyboard or scroll edge, in px. */
export const KEYBOARD_FIELD_MARGIN = 16;
