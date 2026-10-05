import React from 'react';
import { useDrawerContext } from './context';
import { TRANSITION_MS } from './constants';
import { getWrapper, getWrapperScaleStyles } from './helpers';
import { restoreStyles, setStyles } from './styles';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';
import { useLatestRef } from './use-latest-ref';

export function useScaleBackground() {
  const { direction, isOpen, shouldScaleBackground, setBackgroundColorOnScale, noBodyStyles, presentation } =
    useDrawerContext();
  const timeoutIdRef = React.useRef<number | null>(null);
  const isOpenRef = useLatestRef(isOpen);

  // A layout effect, so a presentation switch scales the background in the same style flush that turns its
  // transition off (see `root.tsx`).
  useIsomorphicLayoutEffect(() => {
    if (!isOpen || !shouldScaleBackground || presentation !== 'drawer') return;
    const wrapper = getWrapper();
    if (!wrapper) return;

    if (timeoutIdRef.current) window.clearTimeout(timeoutIdRef.current);
    const tintsBody = setBackgroundColorOnScale && !noBodyStyles;
    if (tintsBody) setStyles(document.body, { background: 'black' });
    setStyles(wrapper, getWrapperScaleStyles(direction));

    return () => {
      // The transition stays, so the wrapper animates back up.
      restoreStyles(wrapper, ['transform', 'border-radius', 'overflow']);
      if (!tintsBody) return;
      // Still open means the presentation switched: the wrapper is back up at once, so is the body.
      if (isOpenRef.current) {
        restoreStyles(document.body, ['background']);
        return;
      }
      // Keep the tint until the wrapper has scaled back up.
      timeoutIdRef.current = window.setTimeout(() => restoreStyles(document.body, ['background']), TRANSITION_MS);
    };
  }, [isOpen, shouldScaleBackground, setBackgroundColorOnScale, noBodyStyles, presentation, direction, isOpenRef]);
}
