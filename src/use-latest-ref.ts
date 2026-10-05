import React from 'react';

/**
 * A ref that always holds the latest `value`. Handlers that read from it can stay referentially stable
 * across renders, so consumers of the drawer context don't re-render because a handler was recreated.
 */
export function useLatestRef<T>(value: T) {
  const ref = React.useRef(value);
  ref.current = value;
  return ref;
}

/** A referentially stable function that always calls the latest `fn`. */
export function useStableCallback<Args extends unknown[], Result>(fn: (...args: Args) => Result) {
  const fnRef = useLatestRef(fn);
  return React.useCallback((...args: Args) => fnRef.current(...args), [fnRef]);
}
