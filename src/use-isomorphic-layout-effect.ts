import React from 'react';

/** `useLayoutEffect` in the browser; `useEffect` on the server, where React warns about layout effects. */
export const useIsomorphicLayoutEffect = typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;
